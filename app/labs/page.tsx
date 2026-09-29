import Link from "next/link";
import { lessons } from "@/lib/lessons";

export default function Labs() {
  return (
    <div className="mx-auto max-w-6xl px-4 py-12">
      <h1 className="font-mono text-3xl font-bold text-zinc-100">Learn</h1>
      <p className="mt-2 max-w-2xl text-zinc-400">
        Six short modules. Read one, then go break something in the terminal.
      </p>
      <div className="mt-8 grid gap-4 md:grid-cols-2">
        {lessons.map((l, i) => (
          <Link
            key={l.slug}
            href={`/labs/${l.slug}`}
            className="group rounded-xl border border-zinc-800 bg-zinc-900/40 p-6 transition hover:border-green-700"
          >
            <div className="font-mono text-xs text-zinc-600">
              MODULE {String(i + 1).padStart(2, "0")} · {l.minutes} min
            </div>
            <h2 className="mt-2 text-xl font-bold text-zinc-100 group-hover:text-green-300">
              {l.title}
            </h2>
            <p className="mt-2 text-sm text-zinc-400">{l.desc}</p>
            <span className="mt-4 inline-block font-mono text-sm text-green-400 group-hover:underline">
              read →
            </span>
          </Link>
        ))}
      </div>
    </div>
  );
}
