// app/page.tsx
import Link from "next/link";

export default function LandingPage() {
  return (
    <main className="min-h-screen flex flex-col items-center justify-center bg-neutral-950 text-white px-6 text-center">
      <div className="max-w-xl">
        <h1 className="text-5xl font-semibold mb-4 tracking-tight">Arena</h1>
        <p className="text-neutral-400 mb-10 text-lg">
          A private network for investors. <br />
          Share insights. Follow moves. Build your edge.
        </p>

        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link
            href="/conceptsocial"
            className="rounded-2xl bg-white text-black px-6 py-3 font-medium hover:bg-neutral-200 transition"
          >
            View Social
          </Link>
          <Link
            href="/conceptsettings"
            className="rounded-2xl border border-white/40 px-6 py-3 font-medium hover:bg-white/10 transition"
          >
            Settings
          </Link>
        </div>
      </div>

      <footer className="absolute bottom-6 text-sm text-neutral-600">
        © {new Date().getFullYear()} Arenastreet.com LLC All rights reserved.
      </footer>
    </main>
  );
}
