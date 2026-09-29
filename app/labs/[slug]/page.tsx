import Link from "next/link";
import { notFound } from "next/navigation";
import { lessons } from "@/lib/lessons";
import Blocks from "@/components/Blocks";

export default async function LessonPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const idx = lessons.findIndex((l) => l.slug === slug);
  if (idx === -1) notFound();
  const lesson = lessons[idx];
  const prev = lessons[idx - 1];
  const next = lessons[idx + 1];

  return (
    <div className="mx-auto max-w-3xl px-4 py-12">
      <Link href="/labs" className="font-mono text-sm text-zinc-500 hover:text-green-400">
        ← all modules
      </Link>
      <div className="mt-4 font-mono text-xs text-zinc-600">
        MODULE {String(idx + 1).padStart(2, "0")} · {lesson.minutes} min
      </div>
      <h1 className="mt-2 text-3xl font-extrabold tracking-tight text-zinc-50">
        {lesson.title}
      </h1>
      <p className="mt-2 text-zinc-400">{lesson.desc}</p>
      <div className="mt-8">
        <Blocks blocks={lesson.blocks} />
      </div>
      <div className="mt-12 flex items-center justify-between border-t border-zinc-800 pt-6">
        {prev ? (
          <Link href={`/labs/${prev.slug}`} className="font-mono text-sm text-green-400 hover:underline">
            ← {prev.title}
          </Link>
        ) : <span />}
        {next ? (
          <Link href={`/labs/${next.slug}`} className="font-mono text-sm text-green-400 hover:underline">
            {next.title} →
          </Link>
        ) : (
          <Link href="/challenges" className="rounded-lg bg-green-500 px-5 py-2.5 font-mono text-sm font-bold text-black hover:bg-green-400">
            Start the missions →
          </Link>
        )}
      </div>
    </div>
  );
}
