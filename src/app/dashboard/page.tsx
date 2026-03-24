import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
import { Button } from "@/components/ui/Button";
export default async function DashboardPage() {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    redirect("/login");
  }

  // Get user's trips (try roles schema, fallback to legacy schema)
  const trips = await (async () => {
    try {
      const rows = await db.trip.findMany({
        where: {
          OR: [
            { organizerId: session.user.id },
            {
              participants: {
                some: {
                  userId: session.user.id,
                },
              },
            },
          ],
        },
        include: {
          participants: {
            select: { id: true },
          },
        },
        orderBy: { startDate: "asc" },
        take: 5,
      });

      return rows.map((trip) => ({
        id: trip.id,
        title: trip.title,
        location: trip.location,
        startDate: trip.startDate,
        endDate: trip.endDate,
        participantCount: trip.participants.length,
      }));
    } catch (error) {
      console.error("Dashboard roles-query failed, using fallback:", error);
      const rows = await db.trip.findMany({
        where: {
          OR: [
            { creatorId: session.user.id },
            {
              members: {
                some: {
                  userId: session.user.id,
                  status: "accepted",
                },
              },
            },
          ],
        },
        include: {
          members: {
            where: { status: "accepted" },
            select: { id: true },
          },
        },
        orderBy: { startDate: "asc" },
        take: 5,
      });

      return rows.map((trip) => ({
        id: trip.id,
        title: trip.title,
        location: trip.location,
        startDate: trip.startDate,
        endDate: trip.endDate,
        participantCount: trip.members.length + 1,
      }));
    }
  })();

  const bgImage =
    "https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?auto=format&fit=crop&w=1920&q=80";

  return (
    <div
      className="min-h-[calc(100vh-4rem)] relative bg-cover bg-center bg-no-repeat bg-gray-800"
      style={{ backgroundImage: `url(${bgImage})` }}
    >
      <div className="hero-overlay absolute inset-0" aria-hidden />
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome header */}
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-white drop-shadow-md">
            Sveiki, {session.user.name || "Keliautojau"}! 👋
          </h1>
          <p className="text-gray-200 mt-1 drop-shadow">
            Čia rasite savo keliones ir kvietimus.
          </p>
        </div>

        {/* Quick actions */}
        <div className="mb-8">
          <Link href="/trips/new">
            <Button variant="dark">+ Nauja kelionė</Button>
          </Link>
        </div>

        {/* Upcoming trips */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-white drop-shadow">
              Artėjančios kelionės
            </h2>
            <Link
              href="/trips"
              className="text-sm text-blue-200 hover:text-white"
            >
              Visos kelionės →
            </Link>
          </div>

          {trips.length === 0 ? (
            <div className="rounded-lg bg-black/30 backdrop-blur-sm border border-white/20 text-center py-12 px-4">
              <div className="text-4xl mb-4">🌍</div>
              <p className="text-gray-200 mb-4">
                Dar neturite jokių kelionių. Sukurkite pirmąją!
              </p>
              <Link href="/trips/new">
                <Button variant="dark">Sukurti kelionę</Button>
              </Link>
            </div>
          ) : (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {trips.map((trip) => (
                <Link key={trip.id} href={`/trips/${trip.id}`}>
                  <div className="h-full p-5 rounded-lg bg-black/30 backdrop-blur-sm border border-white/20 hover:bg-black/40 transition-colors cursor-pointer">
                    <h3 className="font-semibold text-white mb-1">
                      {trip.title}
                    </h3>
                    <p className="text-sm text-gray-200 mb-3">
                      📍 {trip.location}
                    </p>
                    <div className="flex items-center justify-between text-sm text-gray-300">
                      <span>
                        {new Date(trip.startDate).toLocaleDateString("lt-LT")} -{" "}
                        {new Date(trip.endDate).toLocaleDateString("lt-LT")}
                      </span>
                      <span>👥 {trip.participantCount}</span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
