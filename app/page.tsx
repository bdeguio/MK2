export default function Home() {
  return (
    <main className="min-h-dvh flex flex-col items-center justify-center gap-6 bg-[var(--bg,#0B0C0E)] text-[var(--text-inv,#E8EAED)]">
      <h1 className="text-2xl font-semibold tracking-tight">Arena MK2</h1>
      <p className="text-sm text-white/60">Prototype UI Environment</p>

      <div className="flex gap-3">
        <a
          href="/social"
          className="rounded-xl border border-white/15 px-4 py-2 text-sm hover:bg-white/5 transition"
        >
          Open Social Holdings
        </a>

        <a
          href="/settings"
          className="rounded-xl border border-white/15 px-4 py-2 text-sm hover:bg-white/5 transition"
        >
          Open Settings
        </a>
      </div>
    </main>
  );
}
