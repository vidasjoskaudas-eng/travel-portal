import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";

// POST - Respond to trip invitation
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

    const formData = await request.formData();
    const response = formData.get("response") as string;

    if (!response || !["accepted", "declined"].includes(response)) {
      return NextResponse.json(
        { error: "Neteisingas atsakymas" },
        { status: 400 }
      );
    }

    // Find the membership
    const member = await db.tripMember.findUnique({
      where: {
        tripId_userId: {
          tripId,
          userId: session.user.id,
        },
      },
    });

    if (!member) {
      return NextResponse.json(
        { error: "Kvietimas nerastas" },
        { status: 404 }
      );
    }

    if (member.status !== "pending") {
      return NextResponse.json(
        { error: "Į šį kvietimą jau atsakyta" },
        { status: 400 }
      );
    }

    // Update the status
    await db.tripMember.update({
      where: { id: member.id },
      data: { status: response },
    });

    // Redirect back to trip page
    return NextResponse.redirect(
      new URL(`/trips/${tripId}`, request.url)
    );
  } catch (error) {
    console.error("Error responding to invitation:", error);
    return NextResponse.json(
      { error: "Įvyko klaida atsakant į kvietimą" },
      { status: 500 }
    );
  }
}
