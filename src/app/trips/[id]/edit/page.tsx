import { getServerSession } from "next-auth";
import { redirect, notFound } from "next/navigation";
import Link from "next/link";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
import { EditTripForm } from "./EditTripForm";

interface Props {
  params: Promise<{ id: string }>;
}

export default async function EditTripPage({ params }: Props) {
  const session = await getServerSession(authOptions);
  const { id } = await params;
  const tripId = parseInt(id, 10);

  if (Number.isNaN(tripId)) {
    notFound();
  }

  if (!session?.user) {
    redirect("/login");
  }

  const trip = await db.trip.findUnique({
    where: { id: tripId },
  });

  if (!trip) {
    notFound();
  }

  if (trip.creatorId !== session.user.id) {
    redirect(`/trips/${trip.id}`);
  }

  const initialData = {
    title: trip.title,
    location: trip.location,
    notes: trip.notes ?? "",
    startDate: trip.startDate.toISOString().slice(0, 10),
    endDate: trip.endDate.toISOString().slice(0, 10),
  };

  const bgImage =
    "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?auto=format&fit=crop&w=1920&q=80";

  return (
    <div
      className="min-h-[calc(100vh-4rem)] relative bg-cover bg-center bg-no-repeat"
      style={{ backgroundImage: `url(${bgImage})` }}
    >
      <div className="hero-overlay absolute inset-0" aria-hidden />
      <div className="relative z-10 max-w-2xl mx-auto px-4 py-8">
        <Link
          href={`/trips/${trip.id}`}
          className="text-sm text-gray-200 hover:text-white mb-6 inline-block"
        >
          ← Atgal į kelionę
        </Link>
        <EditTripForm tripId={trip.id} initialData={initialData} glass />
      </div>
    </div>
  );
}
