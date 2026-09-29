import Link from "next/link";

const links = [
  { href: "/labs", label: "Learn" },
  { href: "/terminal", label: "Terminal" },
  { href: "/challenges", label: "Challenges" },
  { href: "/report", label: "Report" },
];

export default function Navbar() {
  return (
    <header className="sticky top-0 z-50 border-b border-zinc-800/80 bg-zinc-950/90 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
        <Link href="/" className="flex items-center gap-2">
          <span className="grid h-8 w-8 place-items-center rounded-lg bg-green-500 font-mono text-lg font-bold text-black">
            &gt;_
          </span>
          <span className="font-mono text-lg font-bold tracking-tight text-zinc-100">
            Hack<span className="text-green-400">Lab</span>
          </span>
        </Link>
        <nav className="flex items-center gap-1 sm:gap-2">
          {links.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              className="rounded-lg px-3 py-1.5 text-sm text-zinc-400 transition hover:bg-zinc-800 hover:text-green-300"
            >
              {l.label}
            </Link>
          ))}
        </nav>
      </div>
    </header>
  );
}
