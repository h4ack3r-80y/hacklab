"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { missions, loadProgress } from "@/lib/sim/missions";

export default function Challenges() {
  const [done, setDone] = useState<string[]>([]);
  useEffect(() => setDone(loadProgress()), []);
  const pct = Math.round((done.length / missions.length) * 100);

  return (
    <div className="mx-auto max-w-6xl px-4 py-12">
      <h1 className="font-mono text-3xl font-bold text-zinc-100">Challenges</h1>
      <p className="mt-2 max-w-2xl text-zinc-400">
        Five hands-on missions against the simulated target. Complete them in order —
        each one teaches a real technique.
      </p>
      <div className="mt-6 max-w-md">
        <div className="flex justify-between font-mono text-xs text-zinc-500">
          <span>PROGRESS</span>
          <span>{done.length}/{missions.length} · {pct}%</span>
        </div>
        <div className="mt-1 h-2 overflow-hidden rounded-full bg-zinc-800">
          <div className="h-full rounded-full bg-green-500 transition-all" style={{ width: `${pct}%` }} />
        </div>
      </div>
      <div className="mt-8 grid gap-4 md:grid-cols-2">
        {missions.map((m, i) => {
          const isDone = done.includes(m.id);
          return (
            <Link
              key={m.id}
              href={`/challenges/${m.id}`}
              className="group rounded-xl border border-zinc-800 bg-zinc-900/40 p-6 transition hover:border-green-700"
            >
              <div className="flex items-center justify-between">
                <span className="font-mono text-xs text-zinc-600">MISSION {String(i + 1).padStart(2, "0")}</span>
                <div className="flex gap-2">
                  <span className={`rounded-full px-2.5 py-0.5 font-mono text-xs ${m.difficulty === "Easy" ? "bg-green-950 text-green-300" : "bg-yellow-950 text-yellow-300"}`}>
                    {m.difficulty}
                  </span>
                  {isDone && (
                    <span className="rounded-full bg-green-500 px-2.5 py-0.5 font-mono text-xs font-bold text-black">
                      ✓ DONE
                    </span>
                  )}
                </div>
              </div>
              <h2 className="mt-3 text-xl font-bold text-zinc-100 group-hover:text-green-300">{m.title}</h2>
              <p className="mt-2 text-sm text-zinc-400">{m.objective}</p>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
