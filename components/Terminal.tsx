"use client";

import { useEffect, useRef, useState } from "react";
import { SimEngine, OutLine } from "@/lib/sim/engine";

const COLORS: Record<string, string> = {
  white: "text-zinc-200",
  green: "text-green-400",
  red: "text-red-400",
  yellow: "text-yellow-300",
  cyan: "text-cyan-300",
  dim: "text-zinc-500",
};

interface Props {
  onFlags?: (flags: Set<string>) => void;
  welcome?: string[];
  className?: string;
  tall?: boolean;
}

export default function Terminal({ onFlags, welcome, className, tall }: Props) {
  const engine = useRef<SimEngine | null>(null);
  if (!engine.current) engine.current = new SimEngine();
  const [lines, setLines] = useState<OutLine[]>(() =>
    (welcome ?? [
      "HackLab virtual Kali — type 'help' to see your tools.",
      "Target: 192.168.56.20   (everything runs in your browser)",
      "",
    ]).map((text) => ({ text, color: "dim" as const }))
  );
  const [input, setInput] = useState("");
  const [history, setHistory] = useState<string[]>([]);
  const [hIdx, setHIdx] = useState(-1);
  const boxRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    boxRef.current?.scrollTo({ top: boxRef.current.scrollHeight });
  }, [lines]);

  const promptText = () => {
    const p = engine.current!.prompt();
    return p;
  };

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    const eng = engine.current!;
    const cmdLine = input;
    setInput("");
    setHistory((h) => [cmdLine, ...h].slice(0, 100));
    setHIdx(-1);

    const echo: OutLine[] = [{ text: eng.prompt() + cmdLine, color: "white" }];
    let out = eng.exec(cmdLine);
    if (out.some((l) => l.clear)) {
      setLines([]);
    } else {
      setLines((prev) => [...prev, ...echo, ...out]);
    }
    onFlags?.(new Set(eng.flags));
  };

  const onKey = (e: React.KeyboardEvent) => {
    if (e.key === "ArrowUp") {
      e.preventDefault();
      const n = Math.min(hIdx + 1, history.length - 1);
      if (history[n] !== undefined) {
        setHIdx(n);
        setInput(history[n]);
      }
    } else if (e.key === "ArrowDown") {
      e.preventDefault();
      const n = hIdx - 1;
      setHIdx(Math.max(n, -1));
      setInput(n >= 0 ? history[n] : "");
    }
  };

  return (
    <div
      className={`rounded-xl border border-zinc-800 bg-black/90 shadow-2xl ${className ?? ""}`}
      onClick={() => inputRef.current?.focus()}
    >
      <div className="flex items-center gap-2 border-b border-zinc-800 px-4 py-2.5">
        <span className="h-3 w-3 rounded-full bg-red-500/80" />
        <span className="h-3 w-3 rounded-full bg-yellow-500/80" />
        <span className="h-3 w-3 rounded-full bg-green-500/80" />
        <span className="ml-2 font-mono text-xs text-zinc-500">kali@hacklab: virtual lab</span>
      </div>
      <div ref={boxRef} className={`${tall ? "h-[520px]" : "h-[420px]"} overflow-y-auto p-4 font-mono text-[13px] leading-relaxed`}>
        {lines.map((l, i) => (
          <div key={i} className={`whitespace-pre-wrap break-all ${COLORS[l.color ?? "white"]}`}>
            {l.text || "\u00A0"}
          </div>
        ))}
        <form onSubmit={submit} className="flex">
          <span className="whitespace-pre text-green-400">{promptText()}</span>
          <input
            ref={inputRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={onKey}
            className="w-full bg-transparent font-mono text-[13px] text-zinc-100 outline-none"
            autoComplete="off"
            spellCheck={false}
            aria-label="terminal input"
          />
        </form>
      </div>
    </div>
  );
}
