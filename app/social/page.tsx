'use client'
import React from "react";

// Arena — Social Holdings (MVP Prototype)
// Save as app/holdings/social/page.tsx (Next.js App Router)
// Tailwind required. Minimal info + strong social surface: left sidebar of followed accounts,
// holdings list with % allocation only, inline Comment / DM panels.

export default function SocialHoldingsPage() {
  const [selectedUserId, setSelectedUserId] = React.useState(FOLLOWING[0].id);
  const [peopleOpen, setPeopleOpen] = React.useState(false); // mobile drawer
  const [panel, setPanel] = React.useState<null | { type: "comment" | "dm"; symbol: string }>(null);
  const [query, setQuery] = React.useState("");

  const user = FOLLOWING.find(p => p.id === selectedUserId)!;
  const holdings = MOCK_HOLDINGS[user.id];
  const filtered = holdings.filter(h => [h.symbol, h.name].join(" ").toLowerCase().includes(query.toLowerCase()));
  const lastUpdatedMin = user.lastUpdatedMin ?? 9999;
  const updatedTone: "fresh" | "stale" | "old" = lastUpdatedMin < 60 ? "fresh" : lastUpdatedMin < 1440 ? "stale" : "old";

  return (
    <main className="min-h-dvh bg-[var(--bg,#0B0C0E)] text-[var(--text-inv,#E8EAED)]">
      <div className="mx-auto flex max-w-screen-2xl">
        {/* Left rail — people list */}
        <aside className="hidden h-dvh shrink-0 basis-72 border-r border-white/10 bg-white/[0.02] md:block">
          <PeopleRail selectedUserId={selectedUserId} onSelect={setSelectedUserId} />
        </aside>

        {/* Content */}
        <section className="min-h-dvh w-full">
          {/* Top bar (mobile) */}
          <div className="sticky top-0 z-10 flex items-center gap-2 border-b border-white/10 bg-[rgba(7,8,9,0.8)] px-3 py-3 backdrop-blur md:hidden">
            <button onClick={() => setPeopleOpen(true)} className="rounded-xl border border-white/15 px-3 py-2 text-sm">People</button>
            <div className="flex-1 truncate text-sm text-white/70">{user.displayName}</div>
            <button className="rounded-xl border border-white/15 px-3 py-2 text-sm">Follow</button>
          </div>

          {/* Header */}
          <div className="px-4 pb-4 pt-5 md:px-6">
            <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
              <div className="flex items-start gap-3">
                <Avatar name={user.displayName} />
                <div>
                  <h1 className="text-xl font-semibold tracking-tight">{user.displayName}</h1>
                  {user.bio && <p className="text-sm text-white/60">{user.bio}</p>}
                  <div className="mt-1 flex flex-wrap items-center gap-2 text-xs text-white/60">
                    {user.brokerages.map((b) => (
                      <span key={b} className="rounded-full border border-white/10 px-2 py-0.5">{b}</span>
                    ))}
                    <span className={`inline-flex items-center gap-1 rounded-full border px-2 py-0.5 ${updatedTone === 'fresh' ? 'border-emerald-400/30 text-emerald-300' : 'border-white/10 text-white/60'}`}>
                      <span className={`h-2 w-2 rounded-full ${updatedTone === 'fresh' ? 'bg-emerald-400' : 'bg-white/40'}`} />
                      Updated {formatUpdated(lastUpdatedMin)}
                    </span>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button className="rounded-2xl border border-white/15 px-3 py-2 text-sm hover:bg-white/5">Follow</button>
                <button onClick={() => setPanel({ type: "dm", symbol: "" })} className="rounded-2xl bg-[var(--accent,#00C67A)] px-3 py-2 text-sm font-medium text-black hover:opacity-90">Message</button>
              </div>
            </div>

            {/* Toolbar */}
            <div className="mt-4 flex items-center gap-3">
              <input
                aria-label="Search holdings"
                className="w-full max-w-sm rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm placeholder:text-white/40 focus:outline-none focus:ring-2 focus:ring-white/20"
                placeholder="Search this investor's holdings"
                value={query}
                onChange={e => setQuery(e.target.value)}
              />
              <span className="text-xs text-white/45">% allocation · P/L % · Day %</span>
            </div>
          </div>

          {/* Holdings list (minimal) */}
          <div className="px-3 pb-10 md:px-6">
            <div className="overflow-hidden rounded-2xl border border-white/10">
              <table className="w-full border-collapse text-sm">
                <thead className="bg-white/[0.03] text-white/70">
                  <tr>
                    <th className="px-3 py-2 text-left text-xs uppercase tracking-wide">Asset</th>
                    <th className="px-3 py-2 text-right text-xs uppercase tracking-wide">Allocation</th>
                    <th className="px-3 py-2 text-right text-xs uppercase tracking-wide">P/L</th>
                    <th className="px-3 py-2 text-right text-xs uppercase tracking-wide">Day</th>
                    <th className="w-40 px-3 py-2 text-right text-xs uppercase tracking-wide">Social</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((h, i) => (
                    <tr key={h.symbol} className={i % 2 ? "bg-white/[0.015]" : ""}>
                      <td className="p-3">
                        <div className="flex items-center gap-3">
                          <div className="grid h-9 w-9 place-items-center rounded-xl border border-white/10 bg-white/5 text-xs font-medium">
                            {h.symbol}
                          </div>
                          <div>
                            <div className="font-medium tracking-tight">{h.name}</div>
                            <div className="text-xs text-white/50">{h.tags.join(" · ")}</div>
                          </div>
                        </div>
                      </td>
                      <td className="p-3 text-right tabular-nums">{fmtPct(h.allocationPct)}</td>
                      <td className="p-3 text-right tabular-nums">
                        <span className={h.pnlPct >= 0 ? "text-emerald-400" : "text-rose-400"}>{fmtPct(h.pnlPct)}</span>
                      </td>
                      <td className="p-3 text-right tabular-nums">
                        <span className={h.dayPct >= 0 ? "text-emerald-400" : "text-rose-400"}>{fmtPct(h.dayPct)}</span>
                      </td>
                      <td className="p-3 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button onClick={() => setPanel({ type: "comment", symbol: h.symbol })} className="rounded-xl border border-white/15 px-3 py-1.5 text-xs hover:bg-white/5">Comment</button>
                          <button onClick={() => setPanel({ type: "dm", symbol: h.symbol })} className="rounded-xl bg-[var(--accent,#00C67A)] px-3 py-1.5 text-xs font-medium text-black hover:opacity-90">DM</button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Empty state example */}
            {filtered.length === 0 && (
              <div className="mt-8 grid place-items-center rounded-2xl border border-white/10 p-8 text-center text-white/60">
                No matching holdings. Try another ticker or account.
              </div>
            )}
          </div>
        </section>

        {/* Right panel — comments or DM */}
        {panel && (
          <RightPanel onClose={() => setPanel(null)} title={panel.type === "comment" ? `Comments on ${panel.symbol}` : panel.symbol ? `Message about ${panel.symbol}` : `New message to ${user.displayName}` }>
            {panel.type === "comment" ? (
              <CommentsThread symbol={panel.symbol} userId={user.id} />
            ) : (
              <DMThread symbol={panel.symbol} toUser={user} />
            )}
          </RightPanel>
        )}
      </div>

      {/* Mobile people drawer */}
      {peopleOpen && (
        <div className="fixed inset-0 z-20 md:hidden">
          <div className="absolute inset-0 bg-black/50" onClick={() => setPeopleOpen(false)} />
          <div className="absolute inset-x-0 bottom-0 max-h-[70vh] rounded-t-2xl border-t border-white/10 bg-[rgba(7,8,9,0.98)] p-3">
            <div className="mb-2 flex items-center justify-between">
              <div className="text-sm font-medium">People</div>
              <button onClick={() => setPeopleOpen(false)} className="rounded-xl border border-white/15 px-2 py-1 text-xs">Close</button>
            </div>
            <PeopleRail selectedUserId={selectedUserId} onSelect={(id) => { setSelectedUserId(id); setPeopleOpen(false); }} compact />
          </div>
        </div>
      )}
    </main>
  );
}

// ────────────────────────────────────────────────────────────
// Sidebar (PeopleRail)
// ────────────────────────────────────────────────────────────

function PeopleRail({ selectedUserId, onSelect, compact = false }: { selectedUserId: string; onSelect: (id: string) => void; compact?: boolean }) {
  const [q, setQ] = React.useState("");
  const items = FOLLOWING.filter(p => [p.displayName, p.handle].join(" ").toLowerCase().includes(q.toLowerCase()));
  return (
    <div className={!compact ? "flex h-full flex-col" : "flex max-h-[60vh] flex-col"}>
      {!compact && (
        <div className="p-3">
          <input
            className="w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm placeholder:text-white/40 focus:outline-none focus:ring-2 focus:ring-white/20"
            placeholder="Search people"
            value={q}
            onChange={e => setQ(e.target.value)}
          />
        </div>
      )}
      <div className="flex-1 overflow-y-auto">
        {items.map(p => (
          <button
            key={p.id}
            onClick={() => onSelect(p.id)}
            className={`flex w-full items-center gap-3 px-3 py-2 text-left hover:bg-white/5 ${p.id === selectedUserId ? "bg-white/[0.04]" : ""}`}
          >
            <Avatar name={p.displayName} size={32} />
            <div className="min-w-0">
              <div className="truncate text-sm font-medium tracking-tight">{p.displayName}</div>
              <div className="truncate text-xs text-white/45">{p.handle} · {p.brokerages.join(", ")}</div>
            </div>
            {(p.unread ?? 0) > 0 && (
              <span className="ml-auto rounded-full bg-[var(--accent,#00C67A)]/20 px-2 py-0.5 text-[10px] font-medium text-[var(--accent,#00C67A)]">{p.unread}</span>
            )}
          </button>
        ))}
      </div>
    </div>
  );
}

function Avatar({ name, size = 40 }: { name: string; size?: number }) {
  return (
    <div className="relative inline-grid place-items-center rounded-xl border border-white/10 bg-white/5 text-xs font-medium" style={{ width: size, height: size }}>
      {name[0]?.toUpperCase()}
    </div>
  );
}

// ────────────────────────────────────────────────────────────
// Right Panel (Comments / DM)
// ────────────────────────────────────────────────────────────

function RightPanel({ title, children, onClose }: React.PropsWithChildren<{ title: string; onClose: () => void }>) {
  return (
    <aside className="fixed right-0 top-0 z-20 h-dvh w-full max-w-md border-l border-white/10 bg-[rgba(7,8,9,0.98)] shadow-2xl md:relative md:w-96 md:bg-transparent">
      <div className="flex items-center justify-between border-b border-white/10 px-4 py-3">
        <div className="text-sm font-medium">{title}</div>
        <button onClick={onClose} className="rounded-xl border border-white/15 px-2 py-1 text-xs">Close</button>
      </div>
      <div className="flex h-[calc(100%-48px)] flex-col">
        {children}
      </div>
    </aside>
  );
}

function CommentsThread({ symbol, userId }: { symbol: string; userId: string }) {
  const [text, setText] = React.useState("");
  const comments = (MOCK_COMMENTS[symbol] ?? []).slice(-20);
  return (
    <div className="flex h+full flex-col">
      <div className="flex-1 space-y-3 overflow-y-auto p-3">
        {comments.map((c, i) => (
          <div key={i} className="rounded-xl border border-white/10 bg-white/[0.03] p-3">
            <div className="mb-1 text-xs text-white/50">{c.author} · {c.time}</div>
            <div className="text-sm">{c.text}</div>
          </div>
        ))}
        {comments.length === 0 && (
          <div className="grid place-items-center py-8 text-sm text-white/50">Be the first to comment on {symbol}.</div>
        )}
      </div>
      <div className="border-t border-white/10 p-3">
        <div className="flex items-end gap-2">
          <textarea
            rows={2}
            value={text}
            onChange={e => setText(e.target.value)}
            placeholder={`Write a comment about ${symbol}…`}
            className="min-h-[44px] flex-1 resize-none rounded-xl border border-white/10 bg-white/5 p-2 text-sm placeholder:text-white/40 focus:outline-none focus:ring-2 focus:ring-white/20"
          />
          <button disabled={!text.trim()} className="rounded-xl bg-[var(--accent,#00C67A)] px-3 py-2 text-sm font-medium text-black disabled:opacity-40">Post</button>
        </div>
      </div>
    </div>
  );
}

function DMThread({ symbol, toUser }: { symbol: string; toUser: Person }) {
  const [text, setText] = React.useState(symbol ? `Re: ${symbol} — ` : "");
  const msgs = (MOCK_DMS[toUser.id] ?? []).slice(-20);
  return (
    <div className="flex h-full flex-col">
      <div className="flex items-center gap-2 border-b border-white/10 p-3 text-sm text-white/70">
        <Avatar name={toUser.displayName} size={28} />
        <div className="truncate">New message {symbol && (<span className="text-white/50">about <strong>{symbol}</strong></span>)}</div>
      </div>
      <div className="flex-1 space-y-3 overflow-y-auto p-3">
        {msgs.map((m, i) => (
          <div key={i} className={`max-w-[85%] rounded-xl border px-3 py-2 text-sm ${m.fromMe ? "ml-auto border-white/10 bg-[var(--accent,#00C67A)]/15" : "border-white/10 bg-white/[0.03]"}`}>
            <div className="mb-0.5 text-[10px] text-white/50">{m.time}</div>
            <div>{m.text}</div>
          </div>
        ))}
        {msgs.length === 0 && (
          <div className="grid place-items-center py-8 text-sm text-white/50">Say hi to {toUser.displayName}.</div>
        )}
      </div>
      <div className="border-t border-white/10 p-3">
        <div className="flex items-end gap-2">
          <textarea
            rows={2}
            value={text}
            onChange={e => setText(e.target.value)}
            placeholder={`Message ${toUser.displayName}…`}
            className="min-h-[44px] flex-1 resize-none rounded-xl border border-white/10 bg-white/5 p-2 text-sm placeholder:text-white/40 focus:outline-none focus:ring-2 focus:ring-white/20"
          />
          <button disabled={!text.trim()} className="rounded-xl bg-[var(--accent,#00C67A)] px-3 py-2 text-sm font-medium text-black disabled:opacity-40">Send</button>
        </div>
      </div>
    </div>
  );
}

// ────────────────────────────────────────────────────────────
// Mock Data
// ────────────────────────────────────────────────────────────

type Holding = { symbol: string; name: string; allocationPct: number; pnlPct: number; dayPct: number; tags: string[] };

type Person = {
  id: string;
  displayName: string;
  handle: string;
  unread?: number;
  bio?: string;
  brokerages: string[]; // e.g., ["Robinhood", "Fidelity"]
  lastUpdatedMin?: number; // minutes ago
};

const FOLLOWING: Person[] = [
  { id: "u1", displayName: "Alice Nguyen", handle: "@alice", unread: 3, bio: "Growth + AI infra; concentrated.", brokerages: ["Robinhood"], lastUpdatedMin: 22 },
  { id: "u2", displayName: "Beta Capital", handle: "@betacap", unread: 0, bio: "Small-cap value; quarterly letters.", brokerages: ["Fidelity"], lastUpdatedMin: 310 },
  { id: "u3", displayName: "Chris Park", handle: "@cpark", unread: 1, bio: "Options overlays and risk mgmt.", brokerages: ["Schwab", "IBKR"], lastUpdatedMin: 75 },
  { id: "u4", displayName: "Daria", handle: "@daria", unread: 0, bio: "Semis, energy transition, FX hedges.", brokerages: ["Fidelity", "Robinhood"], lastUpdatedMin: 8 },
];

const MOCK_HOLDINGS: Record<string, Holding[]> = {
  u1: [
    { symbol: "NVDA", name: "NVIDIA", allocationPct: 0.28, pnlPct: 0.37, dayPct: 0.013, tags: ["AI", "Semis"] },
    { symbol: "MSFT", name: "Microsoft", allocationPct: 0.19, pnlPct: 0.22, dayPct: 0.006, tags: ["Software", "Cloud"] },
    { symbol: "TSLA", name: "Tesla", allocationPct: 0.12, pnlPct: -0.05, dayPct: -0.009, tags: ["Autos", "EV"] },
    { symbol: "AVGO", name: "Broadcom", allocationPct: 0.10, pnlPct: 0.14, dayPct: 0.010, tags: ["Semis"] },
    { symbol: "SMCI", name: "Supermicro", allocationPct: 0.08, pnlPct: 0.31, dayPct: 0.024, tags: ["Servers"] },
  ],
  u2: [
    { symbol: "CRSR", name: "Corsair", allocationPct: 0.16, pnlPct: 0.04, dayPct: 0.004, tags: ["Small-cap"] },
    { symbol: "UPST", name: "Upstart", allocationPct: 0.14, pnlPct: -0.12, dayPct: -0.012, tags: ["Fintech"] },
    { symbol: "INMD", name: "InMode", allocationPct: 0.11, pnlPct: -0.08, dayPct: -0.008, tags: ["Medtech"] },
  ],
  u3: [
    { symbol: "SPY", name: "S&P 500 ETF", allocationPct: 0.40, pnlPct: 0.09, dayPct: 0.003, tags: ["ETF"] },
    { symbol: "QQQ", name: "Nasdaq-100 ETF", allocationPct: 0.30, pnlPct: 0.12, dayPct: 0.005, tags: ["ETF"] },
    { symbol: "TLT", name: "20Y Treasury", allocationPct: 0.10, pnlPct: -0.02, dayPct: -0.002, tags: ["Rates"] },
  ],
  u4: [
    { symbol: "XOM", name: "ExxonMobil", allocationPct: 0.18, pnlPct: 0.06, dayPct: 0.006, tags: ["Energy"] },
    { symbol: "NVDA", name: "NVIDIA", allocationPct: 0.14, pnlPct: 0.33, dayPct: 0.018, tags: ["AI"] },
    { symbol: "COP", name: "ConocoPhillips", allocationPct: 0.12, pnlPct: 0.03, dayPct: 0.003, tags: ["Energy"] },
  ],
};

const MOCK_COMMENTS: Record<string, Array<{ author: string; time: string; text: string }>> = {
  NVDA: [
    { author: "Beta Capital", time: "2h", text: "Curious if you trimmed after last print?" },
    { author: "Daria", time: "1h", text: "AI tailwinds still early; watching supply chain tightness." },
  ],
  TSLA: [
    { author: "Chris Park", time: "5h", text: "Covered calls worked well last month. Rolling again?" },
  ],
};

const MOCK_DMS: Record<string, Array<{ fromMe: boolean; time: string; text: string }>> = {
  u1: [
    { fromMe: false, time: "Yesterday", text: "Thanks for the AMA!" },
    { fromMe: true, time: "Yesterday", text: "Appreciate it. What are you watching into earnings?" },
  ],
};

// ────────────────────────────────────────────────────────────
// Utils
// ────────────────────────────────────────────────────────────

const fmtPctIntl = new Intl.NumberFormat(undefined, { style: "percent", maximumFractionDigits: 2 });

function fmtPct(n: number) { return fmtPctIntl.format(n); }

function formatUpdated(min: number) {
  if (min < 1) return "just now";
  if (min < 60) return `${min}m ago`;
  const h = Math.floor(min / 60);
  if (h < 24) return `${h}h ago`;
  const d = Math.floor(h / 24);
  return `${d}d ago`;
}
