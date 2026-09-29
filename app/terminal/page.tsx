"use client";

import Terminal from "@/components/Terminal";

export default function TerminalPage() {
  return (
    <div className="mx-auto max-w-5xl px-4 py-12">
      <h1 className="font-mono text-3xl font-bold text-zinc-100">Free-play terminal</h1>
      <p className="mt-2 max-w-2xl text-zinc-400">
        Your virtual Kali. Scan, poke, and practice — type{" "}
        <span className="font-mono text-green-300">help</span> to see your tools.
        Missions you complete here count toward your progress.
      </p>
      <div className="mt-6">
        <Terminal tall />
      </div>
      <p className="mt-4 font-mono text-xs text-zinc-600">
        Tip: ↑ / ↓ cycles command history. Missions live under Challenges.
      </p>
    </div>
  );
}
