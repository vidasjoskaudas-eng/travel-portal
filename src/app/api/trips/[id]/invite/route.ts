import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";

// POST - Invite a user to the trip
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

    // Check if trip exists and user is the creator
    const trip = await db.trip.findUnique({
      where: { id: tripId },
    });

    if (!trip) {
      return NextResponse.json({ error: "Kelionė nerasta" }, { status: 404 });
    }

    if (trip.creatorId !== session.user.id) {
      return NextResponse.json(
        { error: "Tik kelionės organizatorius gali kviesti dalyvius" },
        { status: 403 }
      );
    }

    const { email } = await request.json();

    if (!email) {
      return NextResponse.json(
        { error: "El. pašto adresas privalomas" },
        { status: 400 }
      );
    }

    // Find user by email
    const invitedUser = await db.user.findUnique({
      where: { email },
    });

    if (!invitedUser) {
      return NextResponse.json(
        { error: "Vartotojas su šiuo el. paštu nerastas. Jis turi būti registruotas sistemoje." },
        { status: 404 }
      );
    }

    // Can't invite yourself
    if (invitedUser.id === session.user.id) {
      return NextResponse.json(
        { error: "Negalite pakviesti savęs" },
        { status: 400 }
      );
    }

    // Check if already invited
    const existingMember = await db.tripMember.findUnique({
      where: {
        tripId_userId: {
          tripId,
          userId: invitedUser.id,
        },
      },
    });

    if (existingMember) {
      return NextResponse.json(
        { error: "Šis vartotojas jau pakviestas į kelionę" },
        { status: 400 }
      );
    }

    // Create invitation
    const member = await db.tripMember.create({
      data: {
        tripId,
        userId: invitedUser.id,
        status: "pending",
        role: "member",
      },
    });

    return NextResponse.json(
      { message: "Kvietimas išsiųstas sėkmingai", member },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error inviting user:", error);
    return NextResponse.json(
      { error: "Įvyko klaida siunčiant kvietimą" },
      { status: 500 }
    );
  }
}
