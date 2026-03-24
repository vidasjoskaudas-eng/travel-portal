import { getServerSession } from "next-auth";
import { redirect, notFound } from "next/navigation";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
import { EditActivityForm } from "./EditActivityForm";

interface Props {
  params: Promise<{ id: string; activityId: string }>;
}

export default async function EditActivityPage({ params }: Props) {
  const session = await getServerSession(authOptions);
  const { id, activityId } = await params;
  const tripId = parseInt(id, 10);
  if (Number.isNaN(tripId)) {
    notFound();
  }

  if (!session?.user?.id) {
    redirect("/login");
  }

  const activity = await db.activity.findFirst({
    where: { id: activityId, tripId },
    include: { trip: true },
  });

  if (!activity) {
    notFound();
  }

  if (activity.trip.creatorId !== session.user.id) {
    redirect(`/trips/${tripId}`);
  }

  return (
    <EditActivityForm
      tripId={id}
      activity={{
        id: activity.id,
        title: activity.title,
        description: activity.description,
        location: activity.location,
        date: activity.date,
        time: activity.time,
        cost: activity.cost,
      }}
    />
  );
}
