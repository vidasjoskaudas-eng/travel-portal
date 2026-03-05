import Link from "next/link";
import { notFound } from "next/navigation";
import { infoPages } from "./data";

interface Props {
  params: Promise<{ slug: string }>;
}

export default async function InfoPage({ params }: Props) {
  const { slug } = await params;
  const page = infoPages[slug];

  if (!page) {
    notFound();
  }

  const bgImage =
    "https://images.unsplash.com/photo-1484318571209-661cf29a69c3?auto=format&fit=crop&w=1920&q=80";

  return (
    <div
      className="min-h-[calc(100vh-4rem)] relative bg-cover bg-center bg-no-repeat"
      style={{ backgroundImage: `url(${bgImage})` }}
    >
      <div className="hero-overlay absolute inset-0" aria-hidden />
      <div className="relative z-10 max-w-3xl mx-auto px-4 py-10">
        <Link
          href="/"
          className="inline-flex items-center text-gray-200 hover:text-white mb-8 text-sm"
        >
          ← Grįžti į pradžią
        </Link>

        <article className="rounded-lg bg-black/30 backdrop-blur-md border border-white/20 p-8">
          <div className="w-16 h-16 bg-white/10 flex items-center justify-center mb-6 rounded-lg">
            <span className="text-4xl">{page.icon}</span>
          </div>
          <h1 className="text-3xl font-bold text-white mb-4">
            {page.title}
          </h1>
          <p className="text-lg text-gray-200 mb-8">{page.description}</p>

          <section className="border-t border-white/20 pt-6">
            <h2 className="text-lg font-semibold text-white mb-3">
              Daugiau informacijos
            </h2>
            <div className="prose prose-invert max-w-none text-gray-200 [&_strong]:text-white">
              {page.extraContent}
            </div>
          </section>
        </article>
      </div>
    </div>
  );
}

// Generuoti statinius kelius
export async function generateStaticParams() {
  return Object.keys(infoPages).map((slug) => ({ slug }));
}
