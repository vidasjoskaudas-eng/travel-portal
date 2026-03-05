import Link from "next/link";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
import { IdeaForm } from "./IdeaForm";
import { Button } from "@/components/ui/Button";

export const dynamic = "force-dynamic";

type IdeaRow = {
  id: string;
  content: string;
  createdAt: Date;
  author: { name: string | null; email: string } | null;
};

export default async function BendradarbiaukitePage() {
  const session = await getServerSession(authOptions);
  const isLoggedIn = !!session;

  let ideas: IdeaRow[] = [];
  try {
    if (typeof db.idea?.findMany === "function") {
      ideas = await db.idea.findMany({
        orderBy: { createdAt: "desc" },
        include: {
          author: {
            select: { name: true, email: true },
          },
        },
      });
    }
  } catch (err) {
    console.error("Bendradarbiaukite: klaida gaunant idėjas", err);
  }

  const bgImage = "https://images.unsplash.com/photo-1516026672322-bc52d61a55d5?auto=format&fit=crop&w=1920&q=80";

  return (
    <div
      className="min-h-[calc(100vh-4rem)] relative bg-cover bg-center bg-no-repeat"
      style={{ backgroundImage: `url(${bgImage})` }}
    >
      <div className="hero-overlay absolute inset-0" aria-hidden />
      <div className="relative z-10 max-w-2xl mx-auto px-4 py-8">
        <Link
          href="/"
          className="inline-flex items-center text-white/90 hover:text-white mb-6 text-sm drop-shadow"
        >
          ← Grįžti į pradžią
        </Link>
        <h1 className="text-2xl font-bold text-white mb-2 drop-shadow-md">
          Bendradarbiaukite
        </h1>
        <p className="text-gray-200 mb-8 drop-shadow">
          Užrašų lenta idėjoms ir diskusijoms – pridėkite idėją ir matykite kitų.
        </p>

        <div className="bg-black/30 backdrop-blur-md border border-white/20 rounded-lg p-6 mb-8">
          {isLoggedIn ? (
            <IdeaForm glass />
          ) : (
            <div className="text-center py-4">
              <p className="text-gray-200 mb-4">
                Norėdami pridėti idėją, turite būti prisijungę.
              </p>
              <div className="flex justify-center gap-3">
                <Link href="/login">
                  <Button variant="dark">Prisijungti</Button>
                </Link>
                <Link href="/register">
                  <Button variant="dark" className="!bg-gray-600">Registruotis</Button>
                </Link>
              </div>
            </div>
          )}
        </div>

        <h2 className="text-lg font-semibold text-white mb-4 drop-shadow">
          Idėjų sąrašas
        </h2>
        {ideas.length === 0 ? (
          <p className="text-gray-300 py-4">Dar nėra idėjų.</p>
        ) : (
          <ul className="space-y-3">
            {ideas.map((idea) => (
              <li
                key={idea.id}
                className="p-4 rounded-lg bg-black/30 backdrop-blur-sm border border-white/20 text-white"
              >
                <p>{idea.content}</p>
                <p className="text-xs text-gray-300 mt-2">
                  {idea.author
                    ? idea.author.name || idea.author.email
                    : "Anonimas"}
                  {" · "}
                  {new Date(idea.createdAt).toLocaleString("lt-LT")}
                </p>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
