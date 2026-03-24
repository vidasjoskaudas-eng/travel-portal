import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";

// PATCH – atnaujinti kelionę (tik kūrėjas)
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "Neprisijungęs" }, { status: 401 });
    }

    const { id } = await params;
    const tripId = parseInt(id, 10);
    if (Number.isNaN(tripId)) {
      return NextResponse.json({ error: "Neteisingas kelionės ID" }, { status: 400 });
    }

    const trip = await db.trip.findUnique({
      where: { id: tripId },
    });

    if (!trip) {
      return NextResponse.json({ error: "Kelionė nerasta" }, { status: 404 });
    }

    if (trip.organizerId !== session.user.id) {
      return NextResponse.json(
        { error: "Tik kelionės organizatorius gali redaguoti" },
        { status: 403 }
      );
    }

    const body = await request.json();
    const { title, location, startDate, endDate, notes } = body;

    if (!title || !location || !startDate || !endDate) {
      return NextResponse.json(
        { error: "Prašome užpildyti pavadinimą, vietą ir datas" },
        { status: 400 }
      );
    }

    const start = new Date(startDate);
    const end = new Date(endDate);
    if (start > end) {
      return NextResponse.json(
        { error: "Pradžios data negali būti vėlesnė už pabaigos datą" },
        { status: 400 }
      );
    }

    const updated = await db.trip.update({
      where: { id: tripId },
      data: {
        title,
        location,
        startDate: start,
        endDate: end,
        notes: notes ?? null,
      },
    });

    return NextResponse.json({ trip: updated });
  } catch (error) {
    console.error("Error updating trip:", error);
    const message = error instanceof Error ? error.message : "Įvyko klaida atnaujinant kelionę";
    return NextResponse.json(
      { error: message },
      { status: 500 }
    );
  }
}

// DELETE – ištrinti kelionę (tik kūrėjas)
export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "Neprisijungęs" }, { status: 401 });
    }

    const { id } = await params;
    const tripId = parseInt(id, 10);
    if (Number.isNaN(tripId)) {
      return NextResponse.json({ error: "Neteisingas kelionės ID" }, { status: 400 });
    }

    const trip = await db.trip.findUnique({
      where: { id: tripId },
    });

    if (!trip) {
      return NextResponse.json({ error: "Kelionė nerasta" }, { status: 404 });
    }

    if (trip.organizerId !== session.user.id) {
      return NextResponse.json(
        { error: "Tik kelionės organizatorius gali ištrinti kelionę" },
        { status: 403 }
      );
    }

    await db.trip.delete({
      where: { id: tripId },
    });

    return NextResponse.json({ message: "Kelionė ištrinta" });
  } catch (error) {
    console.error("Error deleting trip:", error);
    const message = error instanceof Error ? error.message : "Įvyko klaida trinant kelionę";
    return NextResponse.json(
      { error: message },
      { status: 500 }
    );
  }
}
