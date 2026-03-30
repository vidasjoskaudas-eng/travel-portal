import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
import { Button } from "@/components/ui/Button";
import { CreateTripForm } from "@/components/CreateTripForm";

export default async function TripsPage() {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    redirect("/login");
  }

  const trips = await db.trip.findMany({
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
      creator: {
        select: { name: true, email: true },
      },
      participants: {
        include: {
          user: {
            select: { id: true, name: true, image: true },
          },
        },
      },
    },
    orderBy: { startDate: "desc" },
  });

  // Separate upcoming and past trips
  const now = new Date();
  const upcomingTrips = trips.filter((trip) => new Date(trip.endDate) >= now);
  const pastTrips = trips.filter((trip) => new Date(trip.endDate) < now);

  const bgImage =
    "https://images.unsplash.com/photo-1474044159687-1ee9f3a51722?auto=format&fit=crop&w=1920&q=80";

  return (
    <div
      className="min-h-[calc(100vh-4rem)] relative bg-cover bg-center bg-no-repeat"
      style={{ backgroundImage: `url(${bgImage})` }}
    >
      <div className="hero-overlay absolute inset-0" aria-hidden />
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-white drop-shadow-md">
              Kelionės
            </h1>
            <p className="text-gray-200 mt-1 drop-shadow">
              Visos jūsų kelionės vienoje vietoje
            </p>
          </div>
          <Link href="/trips/new">
            <Button variant="dark">+ Nauja kelionė</Button>
          </Link>
        </div>

        {/* Basic form to create a new trip (inline) - glass style */}
        <div className="mb-8 rounded-lg bg-black/30 backdrop-blur-md border border-white/20 p-6">
          <CreateTripForm glass />
        </div>

        {/* Upcoming trips */}
        <div className="mb-10">
          <h2 className="text-lg font-semibold text-white mb-4 drop-shadow">
            Artėjančios kelionės ({upcomingTrips.length})
          </h2>

          {upcomingTrips.length === 0 ? (
            <div className="rounded-lg bg-black/30 backdrop-blur-sm border border-white/20 text-center py-8 px-4">
              <p className="text-gray-200">Nėra artėjančių kelionių</p>
            </div>
          ) : (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {upcomingTrips.map((trip) => (
                <TripCard
                  key={trip.id}
                  trip={trip}
                  isOrganizer={trip.organizerId === session.user.id}
                  isPast={false}
                />
              ))}
            </div>
          )}
        </div>

        {/* Past trips */}
        {pastTrips.length > 0 && (
          <div>
            <h2 className="text-lg font-semibold text-white mb-4 drop-shadow">
              Praėjusios kelionės ({pastTrips.length})
            </h2>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {pastTrips.map((trip) => (
                <TripCard
                  key={trip.id}
                  trip={trip}
                  isOrganizer={trip.organizerId === session.user.id}
                  isPast
                />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

interface TripCardProps {
  trip: {
    id: number;
    title: string;
    location: string;
    notes: string | null;
    startDate: Date;
    endDate: Date;
    organizerId: string;
    participants: { user: { id: string; name: string | null; image: string | null } }[];
  };
  isOrganizer: boolean;
  isPast?: boolean;
}

function TripCard({ trip, isOrganizer, isPast }: TripCardProps) {
  return (
    <Link href={`/trips/${trip.id}`}>
      <div
        className={`h-full py-5 px-4 rounded-lg bg-black/30 backdrop-blur-sm border border-white/20 hover:bg-black/40 transition-colors cursor-pointer ${
          isPast ? "opacity-75" : ""
        }`}
      >
        <div className="flex items-start justify-between mb-2">
          <h3 className="font-semibold text-white">{trip.title}</h3>
          {isOrganizer && (
            <span className="text-xs bg-blue-500/80 text-white px-2 py-0.5 rounded">
              Organizatorius
            </span>
          )}
        </div>
        <p className="text-sm text-gray-200 mb-1">📍 {trip.location}</p>
        {trip.notes && (
          <p className="text-sm text-gray-300 mb-3 line-clamp-2">
            {trip.notes}
          </p>
        )}
        <div className="flex items-center justify-between text-sm pt-2 border-t border-white/10 text-gray-300">
          <span>
            {new Date(trip.startDate).toLocaleDateString("lt-LT")} -{" "}
            {new Date(trip.endDate).toLocaleDateString("lt-LT")}
          </span>
          <span>👥 {trip.participants.length}</span>
        </div>
      </div>
    </Link>
  );
}
