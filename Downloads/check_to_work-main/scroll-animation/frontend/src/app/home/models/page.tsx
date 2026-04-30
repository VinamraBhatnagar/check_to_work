"use client";

import { useEffect, useState } from "react";
import { fetchBackend } from "@/lib/backendApi";

interface ModelInfo {
  id: string;
  provider: string;
  role: string;
  status: string;
}

export default function ModelsPage() {
  const [models, setModels] = useState<ModelInfo[]>([]);
  const [activeModel, setActiveModel] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    fetchBackend<{ active_model: string; available_models: ModelInfo[] }>("/models")
      .then((data) => {
        setActiveModel(data.active_model);
        setModels(data.available_models);
      })
      .catch((err) => setError(err.message));
  }, []);

  return (
    <div className="h-full overflow-y-auto bg-[#060a14] px-6 py-8 text-white">
      <div className="mx-auto max-w-5xl">
        <p className="text-xs font-semibold uppercase tracking-widest text-sky-400">Configuration</p>
        <h1 className="mt-2 text-2xl font-semibold">Models</h1>
        <p className="mt-2 text-sm text-gray-400">Current reasoning and estimator models exposed by the backend.</p>

        {error && (
          <div className="mt-6 rounded-lg border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-200">
            {error}
          </div>
        )}

        <div className="mt-8 grid gap-4">
          {models.map((model) => (
            <div key={model.id} className="rounded-lg border border-white/[0.06] bg-white/[0.03] p-5">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <h2 className="font-medium">{model.id}</h2>
                  <p className="mt-1 text-sm text-gray-500">
                    {model.provider} <span aria-hidden="true">|</span> {model.role}
                  </p>
                </div>
                <span className="rounded-full border border-sky-400/20 bg-sky-400/10 px-3 py-1 text-xs text-sky-200">
                  {model.id === activeModel ? "Active" : model.status}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
