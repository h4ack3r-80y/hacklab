import Link from "next/link";
import { lessons } from "@/lib/lessons";
import { missions } from "@/lib/sim/missions";

export default function Home() {
  return (
    <div>
      {/* HERO */}
      <section className="border-b border-zinc-800/60">
        <div className="mx-auto grid max-w-6xl gap-10 px-4 py-16 md:grid-cols-2 md:py-24">
          <div>
            <div className="mb-4 inline-block rounded-full border border-green-800 bg-green-950/40 px-3 py-1 font-mono text-xs text-green-300">
              100% in-browser · no Kali · no VMs
            </div>
            <h1 className="text-4xl font-extrabold tracking-tight text-zinc-50 md:text-5xl">
              Learn pentesting by{" "}
              <span className="text-green-400">actually hacking</span> — in your browser.
            </h1>
            <p className="mt-5 max-w-lg leading-relaxed text-zinc-400">
              HackLab is a hands-on penetration testing playground. You get a virtual Kali
              terminal and a vulnerable target — run real recon, exploit real
              vulnerabilities by hand, and build a portfolio report. No setup. Free forever.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link
                href="/terminal"
                className="rounded-lg bg-green-500 px-6 py-3 font-mono text-sm font-bold text-black transition hover:bg-green-400"
              >
                &gt;_ Open the terminal
              </Link>
              <Link
                href="/labs"
                className="rounded-lg border border-zinc-700 px-6 py-3 font-mono text-sm text-zinc-200 transition hover:border-green-600 hover:text-green-300"
              >
                Start learning
              </Link>
            </div>
            <p className="mt-6 font-mono text-xs text-zinc-600">
              kali@hacklab:~$ whoami <span className="text-green-500">→ future pentester</span>
            </p>
          </div>
          <div className="rounded-xl border border-zinc-800 bg-black/80 p-5 font-mono text-[13px] leading-relaxed shadow-2xl">
            <div className="mb-3 flex gap-2">
              <span className="h-3 w-3 rounded-full bg-red-500/80" />
              <span className="h-3 w-3 rounded-full bg-yellow-500/80" />
              <span className="h-3 w-3 rounded-full bg-green-500/80" />
            </div>
            <p className="text-zinc-500">┌──(kali㉿kali)-[~]</p>
            <p className="text-zinc-500">└─$ <span className="text-zinc-200">nmap -sV 192.168.56.20</span></p>
            <p className="text-zinc-600">PORT&nbsp;&nbsp;&nbsp;&nbsp;STATE SERVICE&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;VERSION</p>
            <p className="text-zinc-400">21/tcp&nbsp;&nbsp;&nbsp;open&nbsp;&nbsp;ftp&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;vsftpd 2.3.4</p>
            <p className="text-zinc-400">6667/tcp open&nbsp;&nbsp;irc&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;UnrealIRCd 3.2.8.1</p>
            <p className="text-zinc-500">└─$ <span className="text-zinc-200">telnet 192.168.56.20 21</span></p>
            <p className="text-zinc-400">220 (vsFTPd 2.3.4)</p>
            <p className="text-zinc-500">USER <span className="text-yellow-300">backdoor:)</span></p>
            <p className="text-green-400">[!] Backdoor triggered — shell on port 6200</p>
            <p className="text-zinc-500">└─$ <span className="animate-pulse text-green-400">▊</span></p>
          </div>
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section className="mx-auto max-w-6xl px-4 py-16">
        <h2 className="font-mono text-2xl font-bold text-zinc-100">How it works</h2>
        <div className="mt-8 grid gap-4 md:grid-cols-3">
          {[
            { n: "01", t: "Learn", d: "Six short modules: recon, backdoors, misconfigurations, methodology. Read a module in minutes." },
            { n: "02", t: "Hack", d: "Five guided missions in a simulated Kali terminal — nmap, netcat, FTP, SMB, Tomcat. All by hand." },
            { n: "03", t: "Prove it", d: "Generate a professional pentest report with CVSS scores from the missions you completed." },
          ].map((s) => (
            <div key={s.n} className="rounded-xl border border-zinc-800 bg-zinc-900/40 p-6">
              <div className="font-mono text-3xl font-bold text-green-500">{s.n}</div>
              <h3 className="mt-3 text-lg font-bold text-zinc-100">{s.t}</h3>
              <p className="mt-2 text-sm leading-relaxed text-zinc-400">{s.d}</p>
            </div>
          ))}
        </div>
      </section>

      {/* CURRICULUM */}
      <section className="border-y border-zinc-800/60 bg-zinc-950">
        <div className="mx-auto max-w-6xl px-4 py-16">
          <div className="flex items-end justify-between">
            <h2 className="font-mono text-2xl font-bold text-zinc-100">Curriculum</h2>
            <Link href="/labs" className="font-mono text-sm text-green-400 hover:underline">
              all modules →
            </Link>
          </div>
          <div className="mt-8 grid gap-4 md:grid-cols-3">
            {lessons.map((l, i) => (
              <Link
                key={l.slug}
                href={`/labs/${l.slug}`}
                className="group rounded-xl border border-zinc-800 bg-zinc-900/40 p-6 transition hover:border-green-700"
              >
                <div className="font-mono text-xs text-zinc-600">MODULE {String(i + 1).padStart(2, "0")} · {l.minutes} min</div>
                <h3 className="mt-2 font-bold text-zinc-100 group-hover:text-green-300">{l.title}</h3>
                <p className="mt-2 text-sm text-zinc-400">{l.desc}</p>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* MISSIONS */}
      <section className="mx-auto max-w-6xl px-4 py-16">
        <div className="flex items-end justify-between">
          <h2 className="font-mono text-2xl font-bold text-zinc-100">Missions</h2>
          <Link href="/challenges" className="font-mono text-sm text-green-400 hover:underline">
            start hacking →
          </Link>
        </div>
        <div className="mt-8 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {missions.map((m) => (
            <Link
              key={m.id}
              href={`/challenges/${m.id}`}
              className="group rounded-xl border border-zinc-800 bg-zinc-900/40 p-6 transition hover:border-green-700"
            >
              <span className={`rounded-full px-2.5 py-0.5 font-mono text-xs ${m.difficulty === "Easy" ? "bg-green-950 text-green-300" : "bg-yellow-950 text-yellow-300"}`}>
                {m.difficulty}
              </span>
              <h3 className="mt-3 font-bold text-zinc-100 group-hover:text-green-300">{m.title}</h3>
              <p className="mt-2 text-sm text-zinc-400">{m.objective}</p>
            </Link>
          ))}
        </div>
      </section>

      {/* ETHICS */}
      <section className="border-t border-zinc-800/60">
        <div className="mx-auto max-w-6xl px-4 py-12">
          <div className="rounded-xl border border-red-900/50 bg-red-950/20 p-6 text-sm leading-relaxed text-red-200/90">
            <span className="font-mono font-bold">⚖️ The rule — </span>
            only test systems you own or have written permission to test. HackLab&apos;s targets are
            simulated for learning. Real-world unauthorized hacking is a crime.
          </div>
          <p className="mt-8 text-center font-mono text-xs text-zinc-600">
            HackLab — built for learners. Practice legally, document everything.
          </p>
        </div>
      </section>
    </div>
  );
}
