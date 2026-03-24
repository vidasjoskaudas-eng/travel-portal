import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";

// POST - Invite a user to the trip.
// Visi užklausos atliekami per Prisma (DATABASE_URL). Nenaudojamas Supabase JS klientas – RLS „deny all“ taikomas tik DB rolės lygyje (jei connection eina su role, kuri bypass RLS, veikia).
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

    const body = await request.json();
    const rawEmail = typeof body?.email === "string" ? body.email.trim() : "";
    if (!rawEmail) {
      return NextResponse.json(
        { error: "El. pašto adresas privalomas" },
        { status: 400 }
      );
    }
    // Find user by email (case-insensitive: DB may have MixedCase from registration)
    const invitedUser = await db.user.findFirst({
      where: { email: { equals: rawEmail, mode: "insensitive" } },
    });

    if (!invitedUser) {
      return NextResponse.json(
        { error: "Vartotojas su šiuo el. paštu nerastas. Jis turi būti registruotas sistemoje." },
        { status: 400 }
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
        { error: "Šis vartotojas jau yra dalyvis." },
        { status: 409 }
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
      { message: "Kvietimas išsiųstas", email: invitedUser.email, member },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error inviting user:", error);
    const message =
      error && typeof error === "object" && "code" in error
        ? "Duomenų bazės klaida. Bandykite vėliau."
        : "Įvyko klaida siunčiant kvietimą";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
