"use client";

import { useEffect, useState } from "react";
import { fetchBackend } from "@/lib/backendApi";

interface MetricsSummary {
  total_runs: number;
  success_rate: number;
  avg_latency_ms: number;
  avg_steps: number;
  recent_runs: {
    created_at: number;
    question_length: number;
    steps: number;
    latency_ms: number;
    success: boolean;
    error?: string | null;
  }[];
}

const emptyMetrics: MetricsSummary = {
  total_runs: 0,
  success_rate: 0,
  avg_latency_ms: 0,
  avg_steps: 0,
  recent_runs: [],
};

export default function MetricsPage() {
  const [metrics, setMetrics] = useState<MetricsSummary>(emptyMetrics);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchBackend<MetricsSummary>("/metrics")
      .then(setMetrics)
      .catch((err) => setError(err.message));
  }, []);

  const cards = [
    { label: "Total Runs", value: metrics.total_runs },
    { label: "Success Rate", value: `${metrics.success_rate}%` },
    { label: "Avg Latency", value: `${metrics.avg_latency_ms} ms` },
    { label: "Avg Steps", value: metrics.avg_steps },
  ];

  return (
    <div className="h-full overflow-y-auto bg-[#060a14] px-6 py-8 text-white">
      <div className="mx-auto max-w-6xl">
        <div className="mb-8">
          <p className="text-xs font-semibold uppercase tracking-widest text-sky-400">Evaluation</p>
          <h1 className="mt-2 text-2xl font-semibold">Reasoning Metrics</h1>
          <p className="mt-2 max-w-2xl text-sm text-gray-400">
            Live operational metrics from the self-correction backend.
          </p>
        </div>

        {error && (
          <div className="mb-6 rounded-lg border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-200">
            {error}
          </div>
        )}

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {cards.map((card) => (
            <div key={card.label} className="rounded-lg border border-white/[0.06] bg-white/[0.035] p-5">
              <p className="text-xs uppercase tracking-widest text-gray-500">{card.label}</p>
              <p className="mt-3 text-2xl font-semibold text-white">{card.value}</p>
            </div>
          ))}
        </div>

        <div className="mt-8 rounded-lg border border-white/[0.06] bg-white/[0.03]">
          <div className="border-b border-white/[0.06] px-5 py-4">
            <h2 className="text-sm font-semibold">Recent Runs</h2>
          </div>
          <div className="divide-y divide-white/[0.06]">
            {metrics.recent_runs.length === 0 ? (
              <p className="px-5 py-8 text-sm text-gray-500">Run a prompt from New Chat to populate metrics.</p>
            ) : (
              metrics.recent_runs.map((run) => (
                <div key={`${run.created_at}-${run.latency_ms}`} className="grid gap-3 px-5 py-4 text-sm md:grid-cols-5">
                  <span className="text-gray-400">{new Date(run.created_at * 1000).toLocaleString()}</span>
                  <span>Length: {run.question_length}</span>
                  <span>Steps: {run.steps}</span>
                  <span>{run.latency_ms} ms</span>
                  <span className={run.success ? "text-emerald-300" : "text-red-300"}>
                    {run.success ? "Success" : run.error || "Failed"}
                  </span>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
