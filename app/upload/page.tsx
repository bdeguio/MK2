'use client';
import React from "react";

export default function UploadPage() {
  const [csv, setCsv] = React.useState("");
  const [userId, setUserId] = React.useState(process.env.NEXT_PUBLIC_MVP_USER_ID || "");
  const [busy, setBusy] = React.useState(false);
  const [msg, setMsg] = React.useState<string | null>(null);

  async function onImport() {
    setBusy(true); setMsg(null);
    try {
      const res = await fetch("/api/holdings/import", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId, csv }),
      });
      const j = await res.json();
      if (!res.ok) throw new Error(j.error || "Import failed");
      setMsg(`Imported ${j.inserted} rows for user ${userId}`);
    } catch (e: any) {
      setMsg(`Error: ${e.message}`);
    } finally {
      setBusy(false);
    }
  }

  return (
    <main className="min-h-dvh bg-[var(--bg,#0B0C0E)] text-[var(--text-inv,#E8EAED)] p-6">
      <div className="mx-auto max-w-3xl space-y-4">
        <h1 className="text-xl font-semibold">Upload Holdings (CSV)</h1>
        <p className="text-sm text-white/60">Columns: <code>symbol,name,allocation_pct,pnl_pct,day_pct,tags</code></p>
        <input
          value={userId}
          onChange={(e) => setUserId(e.target.value)}
          className="w-full max-w-md rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm"
          placeholder="User ID (UUID)"
        />
        <textarea
          value={csv}
          onChange={(e) => setCsv(e.target.value)}
          className="min-h-[220px] w-full rounded-xl border border-white/10 bg-white/5 p-3 text-sm"
          placeholder={`symbol,name,allocation_pct,pnl_pct,day_pct,tags
NVDA,NVIDIA,0.28,0.37,0.013,"AI;Semis"
MSFT,Microsoft,0.19,0.22,0.006,"Software;Cloud"`}
        />
        <button
          disabled={busy || !csv.trim() || !userId}
          onClick={onImport}
          className="rounded-xl bg-[var(--accent,#00C67A)] px-4 py-2 text-sm font-medium text-black disabled:opacity-40"
        >
          {busy ? "Importing…" : "Import"}
        </button>
        {msg && <div className="text-sm text-white/70">{msg}</div>}
      </div>
    </main>
  );
}
