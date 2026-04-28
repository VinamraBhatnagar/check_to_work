import { NextRequest } from "next/server";

export const dynamic = "force-dynamic";
export const runtime = "edge";

const DEFAULT_BACKEND_URL = "https://check-to-work-bbzs.onrender.com";

const PYTHON_BACKEND_URL =
  process.env.PYTHON_BACKEND_URL ||
  process.env.NEXT_PUBLIC_PYTHON_BACKEND_URL ||
  DEFAULT_BACKEND_URL;

export async function POST(request: NextRequest) {
  const body = await request.json();

  let response: Response;
  try {
    response = await fetch(`${PYTHON_BACKEND_URL.replace(/\/$/, "")}/solve`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
  } catch (error) {
    return new Response(
      JSON.stringify({
        error: `Unable to reach Python backend at ${PYTHON_BACKEND_URL}. ${error instanceof Error ? error.message : ""}`,
      }),
      { status: 502, headers: { "Content-Type": "application/json" } }
    );
  }

  if (!response.ok || !response.body) {
    const text = await response.text();
    return new Response(text || JSON.stringify({ error: "Backend unavailable" }), {
      status: response.status,
      headers: { "Content-Type": "application/json" },
    });
  }

  return new Response(response.body, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache",
    },
  });
}
