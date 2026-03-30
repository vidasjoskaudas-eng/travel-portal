import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";

const PRISMA_HINT = "Sistema laikinai nepasiruošusi. Uždarykite Cursor, atidarykite PowerShell ir paleiskite: npx prisma generate";

// GET - List user's trips
export async function GET() {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return NextResponse.json({ error: "Neprisijungęs" }, { status: 401 });
    }

    if (typeof db.trip?.findMany !== "function") {
      return NextResponse.json({ trips: [] });
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
              select: { name: true, email: true, image: true },
            },
          },
        },
      },
      orderBy: { startDate: "asc" },
    });

    return NextResponse.json({ trips });
  } catch (error) {
    console.error("Error fetching trips:", error);
    return NextResponse.json({ trips: [] });
  }
}

// POST - Create new trip
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return NextResponse.json({ error: "Neprisijungęs" }, { status: 401 });
    }

    if (typeof db.trip?.create !== "function") {
      return NextResponse.json(
        { error: PRISMA_HINT },
        { status: 503 }
      );
    }

    const { title, location, startDate, endDate, notes } = await request.json();

    // Validate required fields
    if (!title || !location || !startDate || !endDate) {
      return NextResponse.json(
        { error: "Prašome užpildyti pavadinimą, vietą ir datas" },
        { status: 400 }
      );
    }

    // Validate dates
    const start = new Date(startDate);
    const end = new Date(endDate);

    if (start > end) {
      return NextResponse.json(
        { error: "Pradžios data negali būti vėlesnė už pabaigos datą" },
        { status: 400 }
      );
    }

    const trip = await db.trip.create({
      data: {
        title,
        location,
        startDate: start,
        endDate: end,
        notes: notes || null,
        creatorId: session.user.id,
        organizerId: session.user.id,
        participants: {
          create: {
            userId: session.user.id,
            role: "ORGANIZER",
          },
        },
      },
    });

    return NextResponse.json(
      { message: "Kelionė sukurta sėkmingai", trip },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error creating trip:", error);
    const message = error instanceof Error ? error.message : "Įvyko klaida kuriant kelionę";
    return NextResponse.json(
      { error: message },
      { status: 500 }
    );
  }
}
