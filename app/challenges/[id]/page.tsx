"use client";

import Link from "next/link";
import { notFound } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import { missions, loadProgress, saveProgress } from "@/lib/sim/missions";
import Terminal from "@/components/Terminal";

export default function ChallengePage({ params }: { params: Promise<{ id: string }> }) {
  const [id, setId] = useState<string | null>(null);
  useEffect(() => {
    params.then((p) => setId(p.id));
  }, [params]);

  const mission = missions.find((m) => m.id === id);
  const [completed, setCompleted] = useState(false);
  const [showHints, setShowHints] = useState(false);
  const [showSolution, setShowSolution] = useState(false);

  useEffect(() => {
    if (id) setCompleted(loadProgress().includes(id));
  }, [id]);

  const onFlags = useCallback(
    (flags: Set<string>) => {
      if (!mission || completed) return;
      if (flags.has(mission.flag)) {
        setCompleted(true);
        const done = [...new Set([...loadProgress(), mission.id])];
        saveProgress(done);
      }
    },
    [mission, completed]
  );

  if (id === null) return <div className="mx-auto max-w-5xl px-4 py-12 font-mono text-zinc-500">loading…</div>;
  if (!mission) notFound();

  return (
    <div className="mx-auto max-w-5xl px-4 py-12">
      <Link href="/challenges" className="font-mono text-sm text-zinc-500 hover:text-green-400">
        ← all missions
      </Link>
      <div className="mt-4 flex flex-wrap items-center gap-3">
        <h1 className="text-3xl font-extrabold tracking-tight text-zinc-50">{mission.title}</h1>
        <span className={`rounded-full px-2.5 py-0.5 font-mono text-xs ${mission.difficulty === "Easy" ? "bg-green-950 text-green-300" : "bg-yellow-950 text-yellow-300"}`}>
          {mission.difficulty}
        </span>
        {completed && (
          <span className="rounded-full bg-green-500 px-3 py-0.5 font-mono text-xs font-bold text-black">
            ✓ COMPLETED
          </span>
        )}
      </div>
      <p className="mt-3 font-mono text-sm text-green-300">Objective: {mission.objective}</p>
      <p className="mt-3 max-w-3xl leading-relaxed text-zinc-400">{mission.briefing}</p>

      <div className="mt-4 flex gap-3">
        <button
          onClick={() => setShowHints((v) => !v)}
          className="rounded-lg border border-zinc-700 px-4 py-2 font-mono text-sm text-zinc-300 hover:border-yellow-600 hover:text-yellow-300"
        >
          {showHints ? "Hide hints" : "💡 Show hints"}
        </button>
        <button
          onClick={() => setShowSolution((v) => !v)}
          className="rounded-lg border border-zinc-700 px-4 py-2 font-mono text-sm text-zinc-300 hover:border-red-600 hover:text-red-300"
        >
          {showSolution ? "Hide solution" : "🔓 Show solution"}
        </button>
      </div>

      {showHints && (
        <ul className="mt-4 list-disc space-y-1.5 rounded-lg border border-yellow-900/50 bg-yellow-950/20 p-5 pl-10 text-sm text-yellow-100/90">
          {mission.hints.map((h, i) => (
            <li key={i} className="font-mono">{h}</li>
          ))}
        </ul>
      )}
      {showSolution && (
        <pre className="mt-4 overflow-x-auto rounded-lg border border-red-900/50 bg-black p-4 font-mono text-[13px] leading-relaxed text-red-200">
          {mission.solution.join("\n")}
        </pre>
      )}

      <div className="mt-6">
        <Terminal
          onFlags={onFlags}
          welcome={[
            `Mission: ${mission.title}`,
            `Objective: ${mission.objective}`,
            "Type 'help' if you're stuck. Good luck.",
            "",
          ]}
        />
      </div>
    </div>
  );
}
