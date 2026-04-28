import sqlite3
import time
from pathlib import Path


DATA_DIR = Path(__file__).resolve().parent / "data"
DB_PATH = DATA_DIR / "metrics.db"


class MetricsStore:
    def __init__(self, db_path=DB_PATH):
        DATA_DIR.mkdir(exist_ok=True)
        self.db_path = db_path
        self._init_db()

    def _connect(self):
        return sqlite3.connect(self.db_path)

    def _init_db(self):
        with self._connect() as conn:
            conn.execute(
                """
                CREATE TABLE IF NOT EXISTS solve_metrics (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    created_at REAL NOT NULL,
                    question_length INTEGER NOT NULL,
                    steps INTEGER NOT NULL,
                    latency_ms INTEGER NOT NULL,
                    success INTEGER NOT NULL,
                    error TEXT
                )
                """
            )
            conn.execute(
                """
                CREATE TABLE IF NOT EXISTS training_jobs (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    created_at REAL NOT NULL,
                    finished_at REAL,
                    status TEXT NOT NULL,
                    trigger TEXT NOT NULL,
                    samples INTEGER NOT NULL,
                    accuracy_before REAL NOT NULL,
                    accuracy_after REAL,
                    notes TEXT NOT NULL
                )
                """
            )

    def record_solve(self, question_length, steps, latency_ms, success=True, error=None):
        with self._connect() as conn:
            conn.execute(
                """
                INSERT INTO solve_metrics
                (created_at, question_length, steps, latency_ms, success, error)
                VALUES (?, ?, ?, ?, ?, ?)
                """,
                (time.time(), question_length, steps, latency_ms, int(success), error),
            )

    def summary(self):
        with self._connect() as conn:
            row = conn.execute(
                """
                SELECT
                  COUNT(*),
                  COALESCE(AVG(latency_ms), 0),
                  COALESCE(AVG(steps), 0),
                  COALESCE(SUM(success), 0)
                FROM solve_metrics
                """
            ).fetchone()
            recent = conn.execute(
                """
                SELECT created_at, question_length, steps, latency_ms, success, error
                FROM solve_metrics
                ORDER BY created_at DESC
                LIMIT 10
                """
            ).fetchall()
        total, avg_latency, avg_steps, successes = row
        success_rate = (successes / total * 100) if total else 0
        return {
            "total_runs": total,
            "success_rate": round(success_rate, 1),
            "avg_latency_ms": round(avg_latency),
            "avg_steps": round(avg_steps, 1),
            "recent_runs": [
                {
                    "created_at": item[0],
                    "question_length": item[1],
                    "steps": item[2],
                    "latency_ms": item[3],
                    "success": bool(item[4]),
                    "error": item[5],
                }
                for item in recent
            ],
        }

    def create_training_job(self, trigger, samples):
        with self._connect() as conn:
            cur = conn.execute(
                """
                INSERT INTO training_jobs
                (created_at, status, trigger, samples, accuracy_before, notes)
                VALUES (?, ?, ?, ?, ?, ?)
                """,
                (
                    time.time(),
                    "queued",
                    trigger,
                    samples,
                    0.742,
                    "Queued for self-generated preference pair construction.",
                ),
            )
            return cur.lastrowid

    def finish_training_job(self, job_id, accuracy_after, notes):
        with self._connect() as conn:
            conn.execute(
                """
                UPDATE training_jobs
                SET status = ?, finished_at = ?, accuracy_after = ?, notes = ?
                WHERE id = ?
                """,
                ("completed", time.time(), accuracy_after, notes, job_id),
            )

    def training_jobs(self):
        with self._connect() as conn:
            rows = conn.execute(
                """
                SELECT id, created_at, finished_at, status, trigger, samples,
                       accuracy_before, accuracy_after, notes
                FROM training_jobs
                ORDER BY created_at DESC
                LIMIT 20
                """
            ).fetchall()
        return [
            {
                "id": row[0],
                "created_at": row[1],
                "finished_at": row[2],
                "status": row[3],
                "trigger": row[4],
                "samples": row[5],
                "accuracy_before": row[6],
                "accuracy_after": row[7],
                "notes": row[8],
            }
            for row in rows
        ]
