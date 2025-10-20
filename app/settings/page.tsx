'use client';
import React from "react";

// Arena — Settings Page (MVP)
// Save as app/settings/page.tsx (Next.js App Router)
// Tailwind required. Minimal, quiet UI. Left nav + sectioned content.
// Includes: Account/Profile (username, avatar, privacy), Connected Brokerages (Plaid mock),
// Privacy & Followers (public/private, manage followers), Following (unfollow),
// Subscription/Billing (plan, payment, cancel, feature gates for Commentary access).

export default function SettingsPage() {
  const [tab, setTab] = React.useState<SectionKey>("account");

  return (
    <main className="min-h-dvh bg-[var(--bg,#0B0C0E)] text-[var(--text-inv,#E8EAED)]">
      <div className="mx-auto grid max-w-screen-xl grid-cols-1 md:grid-cols-[260px_1fr]">
        {/* Left nav */}
        <aside className="border-b border-white/10 md:h-dvh md:border-b-0 md:border-r">
          <div className="sticky top-0 p-3 md:p-4">
            <h1 className="mb-2 text-lg font-semibold tracking-tight">Settings</h1>
            <nav className="flex flex-wrap gap-2 md:block md:space-y-1">
              {SECTIONS.map(s => (
                <button
                  key={s.key}
                  onClick={() => setTab(s.key)}
                  className={`w-full rounded-xl border px-3 py-2 text-left text-sm hover:bg-white/5 ${tab === s.key ? "border-white/20 bg-white/[0.04]" : "border-white/10"}`}
                >
                  <div className="flex items-center gap-2">
                    <span>{s.emoji}</span>
                    <div>
                      <div className="font-medium">{s.title}</div>
                      <div className="text-xs text-white/50">{s.subtitle}</div>
                    </div>
                  </div>
                </button>
              ))}
            </nav>
          </div>
        </aside>

        {/* Content */}
        <section className="p-3 md:p-6">
          {tab === "account" && <AccountSection />}
          {tab === "brokerages" && <BrokeragesSection />}
          {tab === "privacy" && <PrivacyFollowersSection />}
          {tab === "following" && <FollowingSection />}
          {tab === "billing" && <BillingSection />}
        </section>
      </div>
    </main>
  );
}

// ────────────────────────────────────────────────────────────
// Account / Profile
// ────────────────────────────────────────────────────────────

function AccountSection() {
  const [username, setUsername] = React.useState("bdeguio");
  const [avatar, setAvatar] = React.useState<string | null>(null);
  const [isPrivate, setIsPrivate] = React.useState(false);
  const [hasPro, setHasPro] = React.useState(false); // mock subscription flag

  return (
    <div className="space-y-4">
      <Header title="Account & Profile" subtitle="Edit your identity and profile privacy." />

      <Card>
        <div className="grid gap-4 md:grid-cols-[160px_1fr]">
          <div>
            <div className="text-sm text-white/70">Avatar</div>
            <div className="mt-2 flex items-center gap-3">
              <AvatarUpload value={avatar} onChange={setAvatar} />
              <button className="rounded-xl border border-white/15 px-3 py-2 text-sm hover:bg-white/5">Remove</button>
            </div>
          </div>
          <div>
            <label className="text-sm text-white/70">Username</label>
            <div className="mt-2 flex max-w-md items-center gap-2">
              <input
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm placeholder:text-white/40 focus:outline-none focus:ring-2 focus:ring-white/20"
                placeholder="@username"
              />
              <button className="rounded-xl bg-[var(--accent,#00C67A)] px-3 py-2 text-sm font-medium text-black hover:opacity-90">Save</button>
            </div>
          </div>
        </div>
      </Card>

      <Card>
        <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
          <div>
            <div className="text-sm font-medium">Privacy</div>
            <div className="text-sm text-white/60">Switch your profile between public and private. Advanced privacy customization is a Pro feature.</div>
          </div>
          <div className="flex items-center gap-3">
            <Toggle label={isPrivate ? "Private" : "Public"} checked={isPrivate} onChange={setIsPrivate} />
            <Gate hasPro={hasPro} label="Customize privacy (Pro)" />
          </div>
        </div>
      </Card>

      <Card>
        <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
          <div>
            <div className="text-sm font-medium">Commentary Access</div>
            <div className="text-sm text-white/60">Posting long-form commentary is a subscription feature.</div>
          </div>
          <div>
            <Gate hasPro={hasPro} label="Unlock Commentary (Pro)" cta />
          </div>
        </div>
      </Card>
    </div>
  );
}

// ────────────────────────────────────────────────────────────
// Connected Brokerages (Plaid mock)
// ────────────────────────────────────────────────────────────

function BrokeragesSection() {
  const [accounts, setAccounts] = React.useState<BAccount[]>([
    { id: "a1", name: "Robinhood", mask: "••42", status: "healthy" },
    { id: "a2", name: "Fidelity", mask: "••98", status: "healthy" },
  ]);

  function remove(id: string) {
    setAccounts((a) => a.filter((x) => x.id !== id));
  }

  function addMock() {
    const next = { id: `a${accounts.length + 1}`, name: "Schwab", mask: "••10", status: "healthy" as const };
    setAccounts((a) => [...a, next]);
  }

  return (
    <div className="space-y-4">
      <Header title="Connected Brokerages" subtitle="Add or remove brokerage connections. (Plaid mock)" />

      <Card>
        <div className="mb-3 flex items-center justify-between">
          <div className="text-sm text-white/70">Your connected accounts</div>
          <div className="flex items-center gap-2">
            <button onClick={addMock} className="rounded-xl bg-[var(--accent,#00C67A)] px-3 py-2 text-sm font-medium text-black hover:opacity-90">+ Connect</button>
          </div>
        </div>
        <div className="divide-y divide-white/10">
          {accounts.map((a) => (
            <div key={a.id} className="flex items-center justify-between py-3">
              <div className="flex items-center gap-3">
                <BadgeSoft>{a.name}</BadgeSoft>
                <div className="text-sm text-white/60">Account {a.mask}</div>
              </div>
              <div className="flex items-center gap-2">
                <StatusPill status={a.status} />
                <button onClick={() => remove(a.id)} className="rounded-xl border border-white/15 px-3 py-1.5 text-xs hover:bg-white/5">Remove</button>
              </div>
            </div>
          ))}
          {accounts.length === 0 && (
            <div className="grid place-items-center py-8 text-sm text-white/60">No connected brokerages.</div>
          )}
        </div>
      </Card>

      <Card>
        <div className="space-y-2 text-sm text-white/60">
          <div className="font-medium text-white/80">Tips</div>
          <ul className="list-disc space-y-1 pl-5">
            <li>You can hide dollar amounts across Arena and show only percentages.</li>
            <li>We never post trades without your action. You control visibility per post.</li>
          </ul>
        </div>
      </Card>
    </div>
  );
}

// ────────────────────────────────────────────────────────────
// Privacy & Followers
// ────────────────────────────────────────────────────────────

function PrivacyFollowersSection() {
  const [isPrivate, setIsPrivate] = React.useState(false);
  const [followers, setFollowers] = React.useState<Person[]>(MOCK_FOLLOWERS);

  function removeFollower(id: string) {
    setFollowers((f) => f.filter((p) => p.id !== id));
  }

  return (
    <div className="space-y-4">
      <Header title="Privacy & Followers" subtitle="Switch public/private and manage followers. (Also accessible from your profile)" />

      <Card>
        <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
          <div>
            <div className="text-sm font-medium">Profile visibility</div>
            <div className="text-sm text-white/60">Public profiles are visible to everyone. Private profiles require approval.</div>
          </div>
          <Toggle label={isPrivate ? "Private" : "Public"} checked={isPrivate} onChange={setIsPrivate} />
        </div>
      </Card>

      <Card>
        <div className="mb-3 text-sm text-white/70">Followers</div>
        <div className="divide-y divide-white/10">
          {followers.map((p) => (
            <div key={p.id} className="flex items-center justify-between py-2">
              <div className="flex items-center gap-3">
                <AvatarMono name={p.displayName} />
                <div className="min-w-0">
                  <div className="truncate text-sm font-medium tracking-tight">{p.displayName}</div>
                  <div className="truncate text-xs text-white/45">{p.handle}</div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button className="rounded-xl border border-white/15 px-3 py-1.5 text-xs hover:bg-white/5">Allow</button>
                <button onClick={() => removeFollower(p.id)} className="rounded-xl border border-white/15 px-3 py-1.5 text-xs text-rose-300 hover:bg-white/5">Remove</button>
              </div>
            </div>
          ))}
          {followers.length === 0 && (
            <div className="grid place-items-center py-8 text-sm text-white/60">No followers yet.</div>
          )}
        </div>
      </Card>
    </div>
  );
}

// ────────────────────────────────────────────────────────────
// Following (unfollow / remove followers shortcut)
// ────────────────────────────────────────────────────────────

function FollowingSection() {
  const [following, setFollowing] = React.useState<Person[]>(MOCK_FOLLOWING);

  function unfollow(id: string) {
    setFollowing((f) => f.filter((p) => p.id !== id));
  }

  return (
    <div className="space-y-4">
      <Header title="Following" subtitle="Manage who you follow. You can also remove followers from the Privacy tab." />

      <Card>
        <div className="divide-y divide-white/10">
          {following.map((p) => (
            <div key={p.id} className="flex items-center justify-between py-2">
              <div className="flex items-center gap-3">
                <AvatarMono name={p.displayName} />
                <div className="min-w-0">
                  <div className="truncate text-sm font-medium tracking-tight">{p.displayName}</div>
                  <div className="truncate text-xs text-white/45">{p.handle}</div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button onClick={() => unfollow(p.id)} className="rounded-xl border border-white/15 px-3 py-1.5 text-xs hover:bg-white/5">Unfollow</button>
              </div>
            </div>
          ))}
          {following.length === 0 && (
            <div className="grid place-items-center py-8 text-sm text-white/60">You're not following anyone.</div>
          )}
        </div>
      </Card>
    </div>
  );
}

// ────────────────────────────────────────────────────────────
// Subscription / Billing
// ────────────────────────────────────────────────────────────

function BillingSection() {
  const [plan, setPlan] = React.useState<Plan>({ tier: "Free", renews: "—" });

  return (
    <div className="space-y-4">
      <Header title="Subscription & Billing" subtitle="Manage your plan, payment method, and cancellations." />

      <Card>
        <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
          <div>
            <div className="text-sm">Current plan</div>
            <div className="text-lg font-semibold">{plan.tier}</div>
            <div className="text-xs text-white/50">Renews: {plan.renews}</div>
          </div>
          <div className="flex items-center gap-2">
            <button className="rounded-xl border border-white/15 px-3 py-2 text-sm hover:bg-white/5">Manage payment</button>
            <button className="rounded-xl border border-white/15 px-3 py-2 text-sm hover:bg-white/5">Cancel</button>
            <button onClick={() => setPlan({ tier: "Pro", renews: "Nov 19, 2025" })} className="rounded-xl bg-[var(--accent,#00C67A)] px-3 py-2 text-sm font-medium text-black hover:opacity-90">Upgrade to Pro</button>
          </div>
        </div>
      </Card>

      <Card>
        <div className="space-y-2 text-sm text-white/60">
          <div className="font-medium text-white/80">Pro includes</div>
          <ul className="list-disc space-y-1 pl-5">
            <li>Commentary posting & richer notes</li>
            <li>Advanced privacy customization</li>
            <li>CSV export and alert rules</li>
          </ul>
        </div>
      </Card>
    </div>
  );
}

// ────────────────────────────────────────────────────────────
// UI primitives
// ────────────────────────────────────────────────────────────

type SectionKey = "account" | "brokerages" | "privacy" | "following" | "billing";

const SECTIONS: Array<{ key: SectionKey; title: string; subtitle: string; emoji: string }> = [
  { key: "account", title: "Account / Profile", subtitle: "Username, avatar, privacy", emoji: "👤" },
  { key: "brokerages", title: "Connected Brokerages", subtitle: "Plaid connections", emoji: "🏦" },
  { key: "privacy", title: "Privacy & Followers", subtitle: "Visibility, manage followers", emoji: "🔒" },
  { key: "following", title: "Following", subtitle: "Manage who you follow", emoji: "👥" },
  { key: "billing", title: "Subscription & Billing", subtitle: "Plan, payment, cancel", emoji: "⚙️" },
];

function Header({ title, subtitle }: { title: string; subtitle?: string }) {
  return (
    <header>
      <h2 className="text-xl font-semibold tracking-tight">{title}</h2>
      {subtitle && <p className="mt-1 text-sm text-white/60">{subtitle}</p>}
    </header>
  );
}

function Card({ children }: React.PropsWithChildren) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4 md:p-5">{children}</div>
  );
}

function BadgeSoft({ children }: React.PropsWithChildren) {
  return (
    <span className="inline-flex items-center rounded-full border border-white/10 bg-white/5 px-2 py-0.5 text-xs">{children}</span>
  );
}

function StatusPill({ status }: { status: "healthy" | "syncing" | "error" }) {
  const tone = status === "healthy" ? "bg-emerald-400" : status === "syncing" ? "bg-amber-300" : "bg-rose-400";
  return (
    <span className={`inline-flex items-center gap-1 rounded-full border border-white/15 px-2 py-0.5 text-[11px]`}>
      <span className={`h-2 w-2 rounded-full ${tone}`} />
      {status}
    </span>
  );
}

function Toggle({ label, checked, onChange }: { label: string; checked: boolean; onChange: (c: boolean) => void }) {
  return (
    <label className="inline-flex cursor-pointer items-center gap-2 text-sm text-white/80">
      <span>{label}</span>
      <span
        role="switch"
        aria-checked={checked}
        tabIndex={0}
        onClick={() => onChange(!checked)}
        onKeyDown={(e) => (e.key === "Enter" || e.key === " ") && onChange(!checked)}
        className={`relative h-6 w-10 rounded-full border border-white/15 transition-all ${checked ? "bg-[var(--accent,#00C67A)]" : "bg-white/10"}`}
      >
        <span className={`absolute top-1/2 -translate-y-1/2 h-4 w-4 rounded-full bg-black transition-all ${checked ? "right-1" : "left-1"}`} />
      </span>
    </label>
  );
}

function Gate({ hasPro, label, cta = false }: { hasPro: boolean; label: string; cta?: boolean }) {
  return hasPro ? (
    <span className="text-sm text-emerald-300">Enabled</span>
  ) : (
    <button className={`rounded-xl ${cta ? "bg-[var(--accent,#00C67A)] text-black" : "border border-white/15 text-white"} px-3 py-2 text-sm hover:opacity-90`}>
      {label}
    </button>
  );
}

function AvatarUpload({ value, onChange }: { value: string | null; onChange: (v: string | null) => void }) {
  return (
    <div className="flex items-center gap-3">
      <div className="grid h-16 w-16 place-items-center rounded-xl border border-white/10 bg-white/5 text-lg font-medium">
        {value ? "IMG" : ""}
      </div>
      <div className="flex items-center gap-2">
        <button className="rounded-xl border border-white/15 px-3 py-2 text-sm hover:bg-white/5">Upload</button>
        <button className="rounded-xl border border-white/15 px-3 py-2 text-sm hover:bg-white/5">Use initials</button>
      </div>
    </div>
  );
}

function AvatarMono({ name }: { name: string }) {
  return (
    <div className="grid h-8 w-8 place-items-center rounded-md border border-white/10 bg-white/5 text-xs font-medium">
      {name[0]?.toUpperCase()}
    </div>
  );
}

// ────────────────────────────────────────────────────────────
// Mock types/data
// ────────────────────────────────────────────────────────────

type Person = { id: string; displayName: string; handle: string };

type BAccount = { id: string; name: string; mask: string; status: "healthy" | "syncing" | "error" };

type Plan = { tier: "Free" | "Pro"; renews: string };

const MOCK_FOLLOWERS: Person[] = [
  { id: "p1", displayName: "Alice Nguyen", handle: "@alice" },
  { id: "p2", displayName: "Beta Capital", handle: "@betacap" },
  { id: "p3", displayName: "Chris Park", handle: "@cpark" },
];

const MOCK_FOLLOWING: Person[] = [
  { id: "p4", displayName: "Daria", handle: "@daria" },
  { id: "p5", displayName: "Evan Li", handle: "@evan" },
];

