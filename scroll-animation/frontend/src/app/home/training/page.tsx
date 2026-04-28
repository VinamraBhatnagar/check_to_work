"use client";

import { useEffect, useState } from "react";
import { fetchBackend } from "@/lib/backendApi";

interface TrainingJob {
  id: number;
  created_at: number;
  finished_at?: number | null;
  status: string;
  trigger: string;
  samples: number;
  accuracy_before: number;
  accuracy_after?: number | null;
  notes: string;
}

export default function TrainingPage() {
  const [jobs, setJobs] = useState<TrainingJob[]>([]);
  const [samples, setSamples] = useState(128);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const loadJobs = () => {
    fetchBackend<{ jobs: TrainingJob[] }>("/training/jobs")
      .then((data) => setJobs(data.jobs))
      .catch((err) => setError(err.message));
  };

  useEffect(loadJobs, []);

  const runTraining = async () => {
    setLoading(true);
    setError("");
    try {
      await fetchBackend("/training/run", {
        method: "POST",
        body: JSON.stringify({ trigger: "manual-dashboard", samples }),
      });
      loadJobs();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Training failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="h-full overflow-y-auto bg-[#060a14] px-6 py-8 text-white">
      <div className="mx-auto max-w-6xl">
        <div className="mb-8 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-widest text-amber-400">Self Improvement</p>
            <h1 className="mt-2 text-2xl font-semibold">Training Pipeline</h1>
            <p className="mt-2 max-w-2xl text-sm text-gray-400">
              Trigger self-generated preference construction and a lightweight DPO simulation.
            </p>
          </div>
          <div className="flex items-center gap-3">
            <input
              className="w-28 rounded-lg border border-white/[0.08] bg-white/[0.04] px-3 py-2 text-sm outline-none focus:border-sky-400"
              min={16}
              max={2048}
              type="number"
              value={samples}
              onChange={(e) => setSamples(Number(e.target.value))}
            />
            <button
              onClick={runTraining}
              disabled={loading}
              className="rounded-lg bg-sky-500 px-4 py-2 text-sm font-semibold text-white transition hover:bg-sky-400 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {loading ? "Running..." : "Run Training"}
            </button>
          </div>
        </div>

        {error && (
          <div className="mb-6 rounded-lg border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-200">
            {error}
          </div>
        )}

        <div className="rounded-lg border border-white/[0.06] bg-white/[0.03]">
          <div className="border-b border-white/[0.06] px-5 py-4">
            <h2 className="text-sm font-semibold">Training Jobs</h2>
          </div>
          <div className="divide-y divide-white/[0.06]">
            {jobs.length === 0 ? (
              <p className="px-5 py-8 text-sm text-gray-500">No training jobs yet.</p>
            ) : (
              jobs.map((job) => (
                <div key={job.id} className="px-5 py-4">
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div>
                      <p className="font-medium">Job #{job.id}</p>
                      <p className="mt-1 text-xs text-gray-500">{new Date(job.created_at * 1000).toLocaleString()}</p>
                    </div>
                    <span className="rounded-full border border-emerald-400/20 bg-emerald-400/10 px-3 py-1 text-xs text-emerald-200">
                      {job.status}
                    </span>
                  </div>
                  <div className="mt-4 grid gap-3 text-sm text-gray-300 md:grid-cols-4">
                    <span>Samples: {job.samples}</span>
                    <span>Before: {(job.accuracy_before * 100).toFixed(1)}%</span>
                    <span>After: {job.accuracy_after ? `${(job.accuracy_after * 100).toFixed(1)}%` : "Pending"}</span>
                    <span>Trigger: {job.trigger}</span>
                  </div>
                  <p className="mt-3 text-sm text-gray-400">{job.notes}</p>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
