import { getServerSession } from "next-auth";
import { redirect, notFound } from "next/navigation";
import Link from "next/link";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
import { Button } from "@/components/ui/Button";
import { DeleteTripButton } from "./DeleteTripButton";
import { DeleteActivityButton } from "./DeleteActivityButton";

interface Props {
  params: Promise<{ id: string }>;
}

export default async function TripDetailPage({ params }: Props) {
  const session = await getServerSession(authOptions);
  const { id } = await params;
  const tripId = parseInt(id, 10);
  if (Number.isNaN(tripId)) {
    notFound();
  }

  if (!session?.user?.id) {
    redirect("/login");
  }

  // Get trip data (roles schema first, fallback to legacy schema)
  let trip:
    | {
        id: number;
        title: string;
        location: string;
        notes: string | null;
        startDate: Date;
        endDate: Date;
        creatorId: string;
        organizerId: string;
        creator: { id: string; name: string | null; email: string; image: string | null };
        activities: Array<{
          id: string;
          title: string;
          description: string | null;
          location: string | null;
          date: Date;
          time: string | null;
          cost: number | null;
        }>;
        participants: Array<{
          id: string;
          userId: string;
          role: "ORGANIZER" | "PARTICIPANT";
          user: { id: string; name: string | null; email: string; image: string | null };
        }>;
      }
    | null = null;

  try {
    const row = await db.trip.findUnique({
      where: { id: tripId },
      include: {
        creator: {
          select: { id: true, name: true, email: true, image: true },
        },
        participants: {
          include: {
            user: {
              select: { id: true, name: true, email: true, image: true },
            },
          },
        },
        activities: {
          orderBy: { date: "asc" },
        },
      },
    });

    if (row) {
      trip = {
        ...row,
        participants: row.participants.map((p) => ({
          ...p,
          role: p.role === "ORGANIZER" ? "ORGANIZER" : "PARTICIPANT",
        })),
      };
    }
  } catch (error) {
    console.error("Trip detail roles-query failed, using fallback:", error);
    const row = await db.trip.findUnique({
      where: { id: tripId },
      include: {
        creator: {
          select: { id: true, name: true, email: true, image: true },
        },
        members: {
          where: { status: "accepted" },
          include: {
            user: {
              select: { id: true, name: true, email: true, image: true },
            },
          },
        },
        activities: {
          orderBy: { date: "asc" },
        },
      },
    });

    if (row) {
      trip = {
        id: row.id,
        title: row.title,
        location: row.location,
        notes: row.notes,
        startDate: row.startDate,
        endDate: row.endDate,
        creatorId: row.creatorId,
        organizerId: row.creatorId,
        creator: row.creator,
        activities: row.activities,
        participants: [
          {
            id: `creator-${row.creator.id}`,
            userId: row.creator.id,
            role: "ORGANIZER" as const,
            user: row.creator,
          },
          ...row.members.map((m) => ({
            id: m.id,
            userId: m.userId,
            role: "PARTICIPANT" as const,
            user: m.user,
          })),
        ],
      };
    }
  }

  if (!trip) {
    notFound();
  }

  // Check if user has access to this trip
  const isOrganizer =
    trip.organizerId === session.user.id ||
    trip.participants.some(
      (p) => p.userId === session.user.id && p.role === "ORGANIZER"
    );
  const isParticipant = trip.participants.some(
    (p) => p.userId === session.user.id
  );

  if (!isOrganizer && !isParticipant) {
    redirect("/trips");
  }

  // Calculate trip duration
  const startDate = new Date(trip.startDate);
  const endDate = new Date(trip.endDate);
  const duration = Math.ceil(
    (endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)
  );

  const bgImage =
    "https://images.unsplash.com/photo-1504829857797-ddff29c27927?auto=format&fit=crop&w=1920&q=80";

  return (
    <div
      className="min-h-[calc(100vh-4rem)] relative bg-cover bg-center bg-no-repeat"
      style={{ backgroundImage: `url(${bgImage})` }}
    >
      <div className="hero-overlay absolute inset-0" aria-hidden />
      <div className="relative z-10 max-w-5xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <Link
            href="/trips"
            className="text-sm text-gray-200 hover:text-white mb-2 inline-block"
          >
            ← Grįžti į keliones
          </Link>
          <div className="flex items-start justify-between">
            <div>
              <h1 className="text-3xl font-bold text-white drop-shadow-md">{trip.title}</h1>
              <p className="text-lg text-gray-200 mt-1">📍 {trip.location}</p>
            </div>
            {isOrganizer && (
              <div className="flex items-center gap-3">
                <Link href={`/trips/${trip.id}/edit`}>
                  <Button variant="dark">Redaguoti</Button>
                </Link>
                <DeleteTripButton tripId={trip.id} tripTitle={trip.title} />
              </div>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Trip info */}
            <div className="rounded-lg bg-black/30 backdrop-blur-md border border-white/20 p-6">
              <h2 className="text-lg font-semibold text-white mb-4">
                Apie kelionę
              </h2>
              <div className="grid grid-cols-2 gap-4 mb-4">
                <div>
                  <p className="text-sm text-gray-400">Pradžia</p>
                  <p className="font-medium text-white">
                    {startDate.toLocaleDateString("lt-LT", {
                      weekday: "long",
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                    })}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-400">Pabaiga</p>
                  <p className="font-medium text-white">
                    {endDate.toLocaleDateString("lt-LT", {
                      weekday: "long",
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                    })}
                  </p>
                </div>
              </div>
              <div className="mb-4">
                <p className="text-sm text-gray-400">Trukmė</p>
                <p className="font-medium text-white">
                  {duration} {duration === 1 ? "diena" : duration < 10 ? "dienos" : "dienų"}
                </p>
              </div>
              {trip.notes && (
                <div>
                  <p className="text-sm text-gray-400 mb-1">Pastabos</p>
                  <p className="text-gray-200">{trip.notes}</p>
                </div>
              )}
            </div>

            {/* Activities */}
            <div className="rounded-lg bg-black/30 backdrop-blur-md border border-white/20 p-6">
              <div className="flex flex-row items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-white">
                  Veiklos ({trip.activities.length})
                </h2>
                {isOrganizer && (
                  <Link href={`/trips/${trip.id}/activities/new`}>
                    <Button variant="dark" size="sm">+ Pridėti</Button>
                  </Link>
                )}
              </div>
              {trip.activities.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-gray-300">Dar nėra pridėtų veiklų</p>
                  {isOrganizer && (
                    <Link href={`/trips/${trip.id}/activities/new`}>
                      <Button variant="dark" size="sm" className="mt-3">
                        Pridėti pirmą veiklą
                      </Button>
                    </Link>
                  )}
                </div>
              ) : (
                <div className="space-y-3">
                  {trip.activities.map((activity) => (
                    <div
                      key={activity.id}
                      className="p-4 bg-white/10 rounded-lg border border-white/10"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0 flex-1">
                          <h3 className="font-medium text-white">
                            {activity.title}
                          </h3>
                          {activity.location && (
                            <p className="text-sm text-gray-300">
                              📍 {activity.location}
                            </p>
                          )}
                          <p className="text-sm text-gray-400 mt-1">
                            {new Date(activity.date).toLocaleDateString("lt-LT")}
                            {activity.time && ` • ${activity.time}`}
                          </p>
                        </div>
                        <div className="flex flex-col items-end gap-2 shrink-0">
                          {activity.cost != null && (
                            <span className="text-sm font-medium text-green-300">
                              €{activity.cost.toFixed(2)}
                            </span>
                          )}
                          {isOrganizer && (
                            <div className="flex flex-wrap gap-2 justify-end">
                              <Link
                                href={`/trips/${trip.id}/activities/${activity.id}/edit`}
                              >
                                <Button variant="dark" size="sm">
                                  Redaguoti
                                </Button>
                              </Link>
                              <DeleteActivityButton
                                tripId={trip.id}
                                activityId={activity.id}
                                activityTitle={activity.title}
                              />
                            </div>
                          )}
                        </div>
                      </div>
                      {activity.description && (
                        <p className="text-sm text-gray-300 mt-2">
                          {activity.description}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Participants */}
            <div className="rounded-lg bg-black/30 backdrop-blur-md border border-white/20 p-6">
              <div className="flex flex-row items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-white">Dalyviai</h2>
                {isOrganizer && (
                  <Link href={`/trips/${trip.id}/invite`}>
                    <Button size="sm" variant="dark">
                      Pakviesti
                    </Button>
                  </Link>
                )}
              </div>
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-blue-500/50 rounded-full flex items-center justify-center">
                    <span className="text-white font-medium">
                      {trip.creator.name?.[0]?.toUpperCase() || "?"}
                    </span>
                  </div>
                  <div>
                    <p className="font-medium text-white">
                      {trip.creator.name || trip.creator.email}
                    </p>
                    <p className="text-xs text-blue-200">Organizatorius</p>
                  </div>
                </div>
                {trip.participants
                  .filter((participant) => participant.userId !== trip.creatorId)
                  .map((participant) => (
                  <div key={participant.id} className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
                      <span className="text-white font-medium">
                        {participant.user.name?.[0]?.toUpperCase() || "?"}
                      </span>
                    </div>
                    <div>
                      <p className="font-medium text-white">
                        {participant.user.name || participant.user.email}
                      </p>
                      <p className="text-xs text-green-300">
                        {participant.role === "ORGANIZER" ? "Organizatorius" : "Dalyvis"}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Quick stats */}
            <div className="rounded-lg bg-black/30 backdrop-blur-md border border-white/20 p-6">
              <h2 className="text-lg font-semibold text-white mb-4">
                Statistika
              </h2>
              <div className="space-y-3 text-gray-200">
                <div className="flex justify-between">
                  <span>Dalyvių</span>
                  <span className="font-medium text-white">
                    {trip.participants.length}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Veiklų</span>
                  <span className="font-medium text-white">{trip.activities.length}</span>
                </div>
                <div className="flex justify-between">
                  <span>Bendra kaina</span>
                  <span className="font-medium text-green-300">
                    €
                    {trip.activities
                      .reduce((sum, a) => sum + (a.cost || 0), 0)
                      .toFixed(2)}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
