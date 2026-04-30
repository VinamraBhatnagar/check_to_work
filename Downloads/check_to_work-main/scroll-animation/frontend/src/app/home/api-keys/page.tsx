"use client";

export default function ApiKeysPage() {
  const envKeys = [
    "NEXT_PUBLIC_FIREBASE_API_KEY",
    "NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN",
    "NEXT_PUBLIC_FIREBASE_PROJECT_ID",
    "PYTHON_BACKEND_URL",
  ];

  return (
    <div className="h-full overflow-y-auto bg-[#060a14] px-6 py-8 text-white">
      <div className="mx-auto max-w-5xl">
        <p className="text-xs font-semibold uppercase tracking-widest text-amber-400">Security</p>
        <h1 className="mt-2 text-2xl font-semibold">API Keys</h1>
        <p className="mt-2 text-sm text-gray-400">
          Secrets are expected from deployment environment variables, not hard-coded config files.
        </p>

        <div className="mt-8 rounded-lg border border-white/[0.06] bg-white/[0.03]">
          <div className="border-b border-white/[0.06] px-5 py-4">
            <h2 className="text-sm font-semibold">Required Environment Variables</h2>
          </div>
          <div className="divide-y divide-white/[0.06]">
            {envKeys.map((key) => (
              <div key={key} className="flex flex-wrap items-center justify-between gap-3 px-5 py-4">
                <code className="text-sm text-gray-300">{key}</code>
                <span className="rounded-full border border-sky-400/20 bg-sky-400/10 px-3 py-1 text-xs text-sky-200">
                  Configure in host
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
