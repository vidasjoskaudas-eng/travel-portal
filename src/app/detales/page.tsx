import Link from "next/link";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
import { TripDetailForm } from "./TripDetailForm";
import { Button } from "@/components/ui/Button";

export const dynamic = "force-dynamic";

type DetailRow = {
  id: string;
  budget: number | null;
  currency: string | null;
  participantCount: number | null;
  notes: string | null;
  createdAt: Date;
};

export default async function DetalesPage() {
  const session = await getServerSession(authOptions);
  const isLoggedIn = !!session;

  let details: DetailRow[] = [];
  try {
    if (typeof db.tripDetail?.findMany === "function") {
      details = await db.tripDetail.findMany({
        orderBy: { createdAt: "desc" },
      });
    }
  } catch (err) {
    console.error("Detales: klaida gaunant detales", err);
  }

  const bgImage = "https://images.unsplash.com/photo-1502602898657-3e91760cbb34?auto=format&fit=crop&w=1920&q=80";

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
          Tvarkykite detales
        </h1>
        <p className="text-gray-200 mb-8 drop-shadow">
          Įrašykite kelionės detales: biudžetą, valiutą, dalyvių skaičių ir užrašus.
        </p>

        <div className="bg-black/30 backdrop-blur-md border border-white/20 rounded-lg p-6 mb-8">
          {isLoggedIn ? (
            <TripDetailForm glass />
          ) : (
            <div className="text-center py-4">
              <p className="text-gray-200 mb-4">
                Norėdami įrašyti detales, turite būti prisijungę.
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
          Išsaugotos detalės
        </h2>
        {details.length === 0 ? (
          <p className="text-gray-300 py-4">Dar nėra išsaugotų detalių.</p>
        ) : (
          <ul className="space-y-3">
            {details.map((d) => (
              <li
                key={d.id}
                className="p-4 rounded-lg bg-black/30 backdrop-blur-sm border border-white/20 text-white"
              >
                <div className="flex flex-wrap gap-x-4 gap-y-1 text-sm">
                  {d.budget != null && (
                    <span>
                      <strong>Biudžetas:</strong> {d.budget} {d.currency || ""}
                    </span>
                  )}
                  {d.participantCount != null && (
                    <span>
                      <strong>Dalyvių:</strong> {d.participantCount}
                    </span>
                  )}
                  {d.currency != null && d.budget == null && (
                    <span>
                      <strong>Valiuta:</strong> {d.currency}
                    </span>
                  )}
                </div>
                {d.notes && (
                  <p className="text-gray-200 mt-2">{d.notes}</p>
                )}
                <p className="text-xs text-gray-300 mt-2">
                  {new Date(d.createdAt).toLocaleString("lt-LT")}
                </p>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
