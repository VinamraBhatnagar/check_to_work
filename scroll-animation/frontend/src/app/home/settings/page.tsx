"use client";

export default function SettingsPage() {
  const checks = [
    ["Authentication", "Firebase email, Google, and GitHub sign-in enabled"],
    ["Authorization", "Dashboard routes require a signed-in user"],
    ["Input validation", "Backend validates JSON shape and prompt length"],
    ["Rate limiting", "Solve and training endpoints limit repeated requests"],
    ["Security headers", "Backend returns browser hardening headers"],
  ];

  return (
    <div className="h-full overflow-y-auto bg-[#060a14] px-6 py-8 text-white">
      <div className="mx-auto max-w-5xl">
        <p className="text-xs font-semibold uppercase tracking-widest text-sky-400">Controls</p>
        <h1 className="mt-2 text-2xl font-semibold">Settings</h1>
        <p className="mt-2 text-sm text-gray-400">Project readiness checks added from the report feedback.</p>

        <div className="mt-8 grid gap-4">
          {checks.map(([title, description]) => (
            <div key={title} className="rounded-lg border border-white/[0.06] bg-white/[0.03] p-5">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <h2 className="font-medium">{title}</h2>
                  <p className="mt-1 text-sm text-gray-500">{description}</p>
                </div>
                <span className="rounded-full border border-emerald-400/20 bg-emerald-400/10 px-3 py-1 text-xs text-emerald-200">
                  Added
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
