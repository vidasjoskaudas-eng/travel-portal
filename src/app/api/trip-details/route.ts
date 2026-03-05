import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

const PRISMA_HINT = "Sistema laikinai nepasiruošusi. Uždarykite Cursor, atidarykite PowerShell ir paleiskite: npx prisma generate";

// GET – visų kelionės detalių sąrašas
export async function GET() {
  try {
    if (typeof db.tripDetail?.findMany !== "function") {
      return NextResponse.json({ details: [] });
    }
    const details = await db.tripDetail.findMany({
      orderBy: { createdAt: "desc" },
    });
    return NextResponse.json({ details });
  } catch (error) {
    console.error("Error fetching trip details:", error);
    return NextResponse.json({ details: [] });
  }
}

// POST – nauja detalė (biudžetas, valiuta, dalyvių sk., užrašai)
export async function POST(request: NextRequest) {
  try {
    if (typeof db.tripDetail?.create !== "function") {
      return NextResponse.json(
        { error: PRISMA_HINT },
        { status: 503 }
      );
    }

    const body = await request.json();
    const {
      budget,
      currency,
      participantCount,
      notes,
    } = body;

    const detail = await db.tripDetail.create({
      data: {
        budget:
          budget != null && budget !== ""
            ? Number(budget)
            : undefined,
        currency: currency && String(currency).trim() ? String(currency).trim() : null,
        participantCount:
          participantCount != null && participantCount !== ""
            ? Number(participantCount)
            : null,
        notes: notes && String(notes).trim() ? String(notes).trim() : null,
      },
    });

    return NextResponse.json({ detail }, { status: 201 });
  } catch (error) {
    console.error("Error creating trip detail:", error);
    const message = error instanceof Error ? error.message : "Įvyko klaida išsaugant detales";
    return NextResponse.json(
      { error: message },
      { status: 500 }
    );
  }
}
