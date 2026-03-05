import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";

// POST - Create new activity for a trip
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    const { id } = await params;
    const tripId = parseInt(id, 10);
    if (Number.isNaN(tripId)) {
      return NextResponse.json({ error: "Neteisingas kelionės ID" }, { status: 400 });
    }

    if (!session?.user) {
      return NextResponse.json({ error: "Neprisijungęs" }, { status: 401 });
    }

    // Check if trip exists and user has access
    const trip = await db.trip.findUnique({
      where: { id: tripId },
      include: {
        members: {
          where: { userId: session.user.id, status: "accepted" },
        },
      },
    });

    if (!trip) {
      return NextResponse.json({ error: "Kelionė nerasta" }, { status: 404 });
    }

    const isCreator = trip.creatorId === session.user.id;
    const isMember = trip.members.length > 0;

    if (!isCreator && !isMember) {
      return NextResponse.json(
        { error: "Neturite teisės pridėti veiklų" },
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

    const activity = await db.activity.create({
      data: {
        tripId,
        title,
        description: description || null,
        location: location || null,
        date: new Date(date),
        time: time || null,
        cost: cost || null,
      },
    });

    return NextResponse.json(
      { message: "Veikla pridėta sėkmingai", activity },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error creating activity:", error);
    return NextResponse.json(
      { error: "Įvyko klaida pridedant veiklą" },
      { status: 500 }
    );
  }
}

// GET - List activities for a trip
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    const { id } = await params;
    const tripId = parseInt(id, 10);
    if (Number.isNaN(tripId)) {
      return NextResponse.json({ error: "Neteisingas kelionės ID" }, { status: 400 });
    }

    if (!session?.user) {
      return NextResponse.json({ error: "Neprisijungęs" }, { status: 401 });
    }

    // Check if user has access to trip
    const trip = await db.trip.findUnique({
      where: { id: tripId },
      include: {
        members: {
          where: { userId: session.user.id },
        },
      },
    });

    if (!trip) {
      return NextResponse.json({ error: "Kelionė nerasta" }, { status: 404 });
    }

    const isCreator = trip.creatorId === session.user.id;
    const isMember = trip.members.some((m) => m.status === "accepted");
    const isPending = trip.members.some((m) => m.status === "pending");

    if (!isCreator && !isMember && !isPending) {
      return NextResponse.json(
        { error: "Neturite prieigos prie šios kelionės" },
        { status: 403 }
      );
    }

    const activities = await db.activity.findMany({
      where: { tripId },
      orderBy: { date: "asc" },
    });

    return NextResponse.json({ activities });
  } catch (error) {
    console.error("Error fetching activities:", error);
    return NextResponse.json(
      { error: "Įvyko klaida gaunant veiklas" },
      { status: 500 }
    );
  }
}
