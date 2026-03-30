import { NextRequest, NextResponse } from "next/server";

// POST - Respond to trip invitation
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const tripId = parseInt(id, 10);
    if (Number.isNaN(tripId)) {
      return NextResponse.json({ error: "Neteisingas kelionės ID" }, { status: 400 });
    }

    // Legacy endpoint: with TripParticipant model there is no pending state.
    // Keep endpoint alive and safely redirect back to trip page.
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
