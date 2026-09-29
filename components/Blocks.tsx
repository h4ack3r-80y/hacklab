import { Block } from "@/lib/lessons";

export default function Blocks({ blocks }: { blocks: Block[] }) {
  return (
    <div className="space-y-5">
      {blocks.map((b, i) => {
        switch (b.t) {
          case "h":
            return (
              <h2 key={i} className="pt-2 font-mono text-lg font-bold text-green-300">
                {b.x}
              </h2>
            );
          case "p":
            return (
              <p key={i} className="leading-relaxed text-zinc-300">
                {b.x}
              </p>
            );
          case "code":
            return (
              <pre
                key={i}
                className="overflow-x-auto rounded-lg border border-zinc-800 bg-black p-4 font-mono text-[13px] leading-relaxed text-green-300"
              >
                {b.x}
              </pre>
            );
          case "list":
            return (
              <ul key={i} className="list-disc space-y-1.5 pl-5 text-zinc-300">
                {b.items.map((it, j) => (
                  <li key={j} className="leading-relaxed">
                    {it}
                  </li>
                ))}
              </ul>
            );
          case "warn":
            return (
              <div key={i} className="rounded-lg border border-red-900/60 bg-red-950/30 p-4 text-sm leading-relaxed text-red-200">
                <span className="font-bold">⚖️ Rule — </span>
                {b.x}
              </div>
            );
          case "tip":
            return (
              <div key={i} className="rounded-lg border border-green-900/60 bg-green-950/30 p-4 text-sm leading-relaxed text-green-200">
                <span className="font-bold">💡 Tip — </span>
                {b.x}
              </div>
            );
        }
      })}
    </div>
  );
}
