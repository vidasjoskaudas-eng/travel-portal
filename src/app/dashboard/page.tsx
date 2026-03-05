import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
import { Button } from "@/components/ui/Button";
export default async function DashboardPage() {
  const session = await getServerSession(authOptions);

  if (!session?.user) {
    redirect("/login");
  }

  // Get user's trips (created or member of)
  const trips = await db.trip.findMany({
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
      creator: {
        select: { name: true, email: true },
      },
      members: {
        where: { status: "accepted" },
        select: { id: true },
      },
    },
    orderBy: { startDate: "asc" },
    take: 5,
  });

  // Get pending invitations
  const pendingInvites = await db.tripMember.findMany({
    where: {
      userId: session.user.id,
      status: "pending",
    },
    include: {
      trip: {
        select: { title: true, location: true, startDate: true },
      },
    },
  });

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

        {/* Pending invitations */}
        {pendingInvites.length > 0 && (
          <div className="mb-8">
            <h2 className="text-lg font-semibold text-white mb-4 drop-shadow">
              Laukiantys kvietimai
            </h2>
            <div className="space-y-3">
              {pendingInvites.map((invite) => (
                <div
                  key={invite.id}
                  className="flex items-center justify-between py-3 px-4 rounded-lg bg-black/30 backdrop-blur-sm border border-white/20"
                >
                  <div>
                    <p className="font-medium text-white">
                      {invite.trip.title}
                    </p>
                    <p className="text-sm text-gray-200">
                      {invite.trip.location} •{" "}
                      {new Date(invite.trip.startDate).toLocaleDateString("lt-LT")}
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <Link href={`/trips/${invite.tripId}`}>
                      <Button variant="dark" size="sm">Peržiūrėti</Button>
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

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
                      <span>👥 {trip.members.length + 1}</span>
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
