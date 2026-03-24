import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";

async function loadActivityForTrip(tripId: number, activityId: string) {
  return db.activity.findFirst({
    where: { id: activityId, tripId },
    include: { trip: true },
  });
}

// PATCH - Update activity (only trip organizer)
export async function PATCH(
  request: NextRequest,
  {
    params,
  }: { params: Promise<{ id: string; activityId: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    const { id, activityId } = await params;
    const tripId = parseInt(id, 10);
    if (Number.isNaN(tripId)) {
      return NextResponse.json({ error: "Neteisingas kelionės ID" }, { status: 400 });
    }

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Neprisijungęs" }, { status: 401 });
    }

    const activity = await loadActivityForTrip(tripId, activityId);
    if (!activity) {
      return NextResponse.json({ error: "Veikla nerasta" }, { status: 404 });
    }

    if (activity.trip.creatorId !== session.user.id) {
      return NextResponse.json(
        { error: "Neturite teisės redaguoti šios veiklos" },
        { status: 403 }
      );
    }

    const { title, description, location, date, time, cost } =
      await request.json();

    if (!title || !date) {
      return NextResponse.json(
        { error: "Pavadinimas ir data yra privalomi" },
        { status: 400 }
      );
    }

    const updated = await db.activity.update({
      where: { id: activity.id },
      data: {
        title,
        description: description ?? null,
        location: location ?? null,
        date: new Date(date),
        time: time ?? null,
        cost: cost === null || cost === undefined || cost === "" ? null : Number(cost),
      },
    });

    return NextResponse.json({
      message: "Veikla atnaujinta",
      activity: updated,
    });
  } catch (error) {
    console.error("Error updating activity:", error);
    return NextResponse.json(
      { error: "Įvyko klaida atnaujinant veiklą" },
      { status: 500 }
    );
  }
}

// DELETE - Remove activity (only trip organizer)
export async function DELETE(
  _request: NextRequest,
  {
    params,
  }: { params: Promise<{ id: string; activityId: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    const { id, activityId } = await params;
    const tripId = parseInt(id, 10);
    if (Number.isNaN(tripId)) {
      return NextResponse.json({ error: "Neteisingas kelionės ID" }, { status: 400 });
    }

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Neprisijungęs" }, { status: 401 });
    }

    const activity = await loadActivityForTrip(tripId, activityId);
    if (!activity) {
      return NextResponse.json({ error: "Veikla nerasta" }, { status: 404 });
    }

    if (activity.trip.creatorId !== session.user.id) {
      return NextResponse.json(
        { error: "Neturite teisės ištrinti šios veiklos" },
        { status: 403 }
      );
    }

    await db.activity.delete({ where: { id: activity.id } });

    return NextResponse.json({ message: "Veikla ištrinta" });
  } catch (error) {
    console.error("Error deleting activity:", error);
    return NextResponse.json(
      { error: "Įvyko klaida trinant veiklą" },
      { status: 500 }
    );
  }
}
