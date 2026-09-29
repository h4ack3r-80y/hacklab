"use client";

import { useEffect, useMemo, useState } from "react";
import { missions, loadProgress } from "@/lib/sim/missions";

const FINDINGS: Record<string, { title: string; severity: string; cvss: string; fix: string }> = {
  recon: {
    title: "Network reconnaissance completed",
    severity: "Informational",
    cvss: "0.0",
    fix: "Reduce exposed services; firewall unnecessary ports.",
  },
  vsftpd: {
    title: "vsftpd 2.3.4 backdoor → unauthenticated remote root (CVE-2011-2523)",
    severity: "Critical",
    cvss: "9.8",
    fix: "Upgrade vsftpd to a maintained release; verify package signatures.",
  },
  unrealircd: {
    title: "UnrealIRCd 3.2.8.1 backdoor → remote code execution (CVE-2010-2075)",
    severity: "Critical",
    cvss: "9.8",
    fix: "Reinstall from a trusted source; verify checksums; update.",
  },
  samba: {
    title: "Samba username map script command injection → root (CVE-2007-2447)",
    severity: "Critical",
    cvss: "10.0",
    fix: "Upgrade Samba; never pass usernames through a shell.",
  },
  tomcat: {
    title: "Apache Tomcat manager default credentials → WAR deploy RCE",
    severity: "High",
    cvss: "8.8",
    fix: "Set strong unique passwords; restrict manager to localhost; remove defaults.",
  },
};

export default function ReportBuilder() {
  const [name, setName] = useState("");
  const [date, setDate] = useState(() => new Date().toISOString().slice(0, 10));
  const [done, setDone] = useState<string[]>([]);
  const [copied, setCopied] = useState(false);

  useEffect(() => setDone(loadProgress()), []);

  const selected = missions.filter((m) => done.includes(m.id));

  const markdown = useMemo(() => {
    const rows = selected
      .map((m, i) => {
        const f = FINDINGS[m.id];
        return [
          `### Finding ${i + 1} — ${f.title}`,
          ``,
          `- **Severity:** ${f.severity} (CVSS ${f.cvss})`,
          `- **Target:** 192.168.56.20 (HackLab simulated lab)`,
          `- **Remediation:** ${f.fix}`,
          ``,
        ].join("\n");
      })
      .join("\n");

    return [
      `# Penetration Test Report — HackLab`,
      ``,
      `| | |`,
      `|---|---|`,
      `| Tester | ${name || "[Your Name]"} |`,
      `| Date | ${date} |`,
      `| Target | 192.168.56.20 (simulated Metasploitable-style host) |`,
      `| Environment | HackLab browser lab — isolated simulation |`,
      ``,
      `## Executive Summary`,
      ``,
      `A penetration test was performed against the HackLab simulated target. ${selected.length} of 5 mission objectives were completed, demonstrating the full attack chain from reconnaissance to remote code execution. Findings below are ordered by severity.`,
      ``,
      `## Findings`,
      ``,
      rows || "_No missions completed yet — go hack something first._",
      ``,
      `## Methodology`,
      ``,
      `PTES-aligned: reconnaissance (Nmap), vulnerability analysis, manual exploitation, documentation. All testing performed against a simulated target in the browser.`,
      ``,
      `## Conclusion`,
      ``,
      `The assessment confirms that unpatched services and default credentials lead directly to full host compromise. Prioritize patching and credential hygiene.`,
      ``,
      `*Generated with HackLab Report Builder.*`,
      ``,
    ].join("\n");
  }, [name, date, selected]);

  const copy = async () => {
    await navigator.clipboard.writeText(markdown);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const download = () => {
    const blob = new Blob([markdown], { type: "text/markdown" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "hacklab-pentest-report.md";
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="mx-auto max-w-6xl px-4 py-12">
      <h1 className="font-mono text-3xl font-bold text-zinc-100">Report builder</h1>
      <p className="mt-2 max-w-2xl text-zinc-400">
        Turn your completed missions into a professional pentest report. Nobody pays for
        shells — they pay for the report.
      </p>

      <div className="mt-8 grid gap-8 lg:grid-cols-2">
        <div className="space-y-4">
          <div>
            <label className="font-mono text-xs text-zinc-500">TESTER NAME</label>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Your name"
              className="mt-1 w-full rounded-lg border border-zinc-800 bg-zinc-900 px-4 py-2.5 text-zinc-100 outline-none focus:border-green-600"
            />
          </div>
          <div>
            <label className="font-mono text-xs text-zinc-500">DATE</label>
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="mt-1 w-full rounded-lg border border-zinc-800 bg-zinc-900 px-4 py-2.5 text-zinc-100 outline-none focus:border-green-600"
            />
          </div>
          <div>
            <label className="font-mono text-xs text-zinc-500">COMPLETED MISSIONS ({selected.length})</label>
            <div className="mt-2 space-y-2">
              {missions.map((m) => {
                const isDone = done.includes(m.id);
                return (
                  <div
                    key={m.id}
                    className={`flex items-center gap-3 rounded-lg border px-4 py-2.5 text-sm ${isDone ? "border-green-900 bg-green-950/20 text-zinc-200" : "border-zinc-800 text-zinc-600"}`}
                  >
                    <span>{isDone ? "✓" : "○"}</span>
                    <span>{m.title}</span>
                    {!isDone && <span className="ml-auto font-mono text-xs">not completed</span>}
                  </div>
                );
              })}
            </div>
          </div>
          <div className="flex gap-3 pt-2">
            <button
              onClick={copy}
              className="rounded-lg bg-green-500 px-5 py-2.5 font-mono text-sm font-bold text-black hover:bg-green-400"
            >
              {copied ? "✓ Copied!" : "Copy markdown"}
            </button>
            <button
              onClick={download}
              className="rounded-lg border border-zinc-700 px-5 py-2.5 font-mono text-sm text-zinc-200 hover:border-green-600 hover:text-green-300"
            >
              Download .md
            </button>
          </div>
        </div>

        <div>
          <label className="font-mono text-xs text-zinc-500">PREVIEW</label>
          <pre className="mt-1 h-[560px] overflow-auto rounded-lg border border-zinc-800 bg-black p-4 font-mono text-xs leading-relaxed text-zinc-300">
            {markdown}
          </pre>
        </div>
      </div>
    </div>
  );
}
