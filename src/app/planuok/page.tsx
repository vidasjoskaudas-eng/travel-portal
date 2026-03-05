import Link from "next/link";
import { db } from "@/lib/db";
import { CreateTripForm } from "@/components/CreateTripForm";

export const dynamic = "force-dynamic";

type TripRow = {
  id: number;
  title: string;
  location: string;
  startDate: Date;
  endDate: Date;
};

export default async function PlanuokPage() {
  let trips: TripRow[] = [];
  try {
    trips = await db.trip.findMany({
      orderBy: { startDate: "desc" },
      select: { id: true, title: true, location: true, startDate: true, endDate: true },
    });
  } catch (err) {
    console.error("Planuok: klaida gaunant keliones", err);
  }

  const bgImage = "https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?auto=format&fit=crop&w=1920&q=80";

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
          Planuok keliones
        </h1>
        <p className="text-gray-200 mb-8 drop-shadow">
          Sukurk kelionę, nustatyk datas ir pakviesk draugus prisijungti.
        </p>

        <div className="bg-black/30 backdrop-blur-md border border-white/20 rounded-lg p-6 mb-8">
          <CreateTripForm glass />
        </div>

        <h2 className="text-lg font-semibold text-white mb-4 drop-shadow">
          Kelionių sąrašas
        </h2>
        {trips.length === 0 ? (
          <p className="text-gray-300 py-4">Dar nėra kelionių.</p>
        ) : (
          <ul className="space-y-3">
            {trips.map((trip) => (
              <li key={trip.id}>
                <Link
                  href={`/trips/${trip.id}`}
                  className="block p-4 rounded-lg bg-black/30 backdrop-blur-sm border border-white/20 text-white hover:bg-black/40 transition-colors"
                >
                  <span className="font-semibold">{trip.title}</span>
                  <span className="block text-sm text-gray-200 mt-0.5">
                    {trip.location}
                  </span>
                  <span className="block text-xs text-gray-300 mt-1">
                    {new Date(trip.startDate).toLocaleDateString("lt-LT")} –{" "}
                    {new Date(trip.endDate).toLocaleDateString("lt-LT")}
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
