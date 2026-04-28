import asyncio
import json
import os
import time
from contextlib import asynccontextmanager

from fastapi import Depends, FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import StreamingResponse

from engine import SelfCorrectingEngine
from metrics_store import MetricsStore
from security import InMemoryRateLimiter, SecurityHeadersMiddleware, client_key, validated_question
from training import TrainingPipeline

engine = None
store = MetricsStore()
training_pipeline = TrainingPipeline(store)
solve_limiter = InMemoryRateLimiter(limit=20, window_seconds=60)
training_limiter = InMemoryRateLimiter(limit=5, window_seconds=300)


@asynccontextmanager
async def lifespan(app: FastAPI):
    global engine
    engine = SelfCorrectingEngine()
    yield


app = FastAPI(lifespan=lifespan)

allowed_origins = [
    origin.strip()
    for origin in os.environ.get("ALLOWED_ORIGINS", "http://localhost:3000,http://127.0.0.1:3000").split(",")
    if origin.strip()
]

app.add_middleware(SecurityHeadersMiddleware)
app.add_middleware(
    CORSMiddleware,
    allow_origins=allowed_origins,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/health")
async def health():
    return {"status": "ok", "engine_ready": engine is not None}


@app.post("/solve")
async def solve(request: Request, question: str = Depends(validated_question)):
    solve_limiter.check(client_key(request))
    started_at = time.perf_counter()

    async def event_stream():
        loop = asyncio.get_running_loop()
        queue: asyncio.Queue = asyncio.Queue()
        emitted_steps = 0
        run_error = None

        def step_callback(event):
            nonlocal emitted_steps
            if event.get("type") == "step":
                emitted_steps += 1
            loop.call_soon_threadsafe(queue.put_nowait, event)

        async def run_engine():
            nonlocal run_error
            try:
                await asyncio.to_thread(engine.solve, question, step_callback)
            except Exception as e:
                import traceback
                traceback.print_exc()
                run_error = str(e)
                loop.call_soon_threadsafe(
                    queue.put_nowait, 
                    {"type": "answer", "data": {"content": f"**Backend Crash:** {str(e)}"}}
                )
            finally:
                loop.call_soon_threadsafe(queue.put_nowait, None)

        task = asyncio.create_task(run_engine())

        # Send total steps first so frontend knows the expected count
        yield f"data: {json.dumps({'type': 'total_steps', 'data': engine.total_steps})}\n\n"

        while True:
            event = await queue.get()
            if event is None:
                break
            yield f"data: {json.dumps(event)}\n\n"

        await task
        store.record_solve(
            question_length=len(question),
            steps=emitted_steps,
            latency_ms=round((time.perf_counter() - started_at) * 1000),
            success=run_error is None,
            error=run_error,
        )

    return StreamingResponse(event_stream(), media_type="text/event-stream")


@app.get("/metrics")
async def metrics():
    return store.summary()


@app.get("/models")
async def models():
    return {
        "active_model": "meta-llama/llama-3.3-70b-instruct",
        "available_models": [
            {
                "id": "meta-llama/llama-3.3-70b-instruct",
                "provider": "OpenRouter",
                "role": "reasoning",
                "status": "active",
            },
            {
                "id": "local-neural-estimator",
                "provider": "Built-in",
                "role": "numeric estimate",
                "status": "active",
            },
        ],
    }


@app.get("/training/jobs")
async def training_jobs():
    return {"jobs": store.training_jobs()}


@app.post("/training/run")
async def run_training(request: Request):
    training_limiter.check(client_key(request))
    try:
        body = await request.json() if request.headers.get("content-type", "").startswith("application/json") else {}
    except Exception:
        body = {}
    return training_pipeline.run(
        trigger=str(body.get("trigger", "manual")),
        samples=int(body.get("samples", 128)),
    )
