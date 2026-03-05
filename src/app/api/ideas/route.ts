import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";

const PRISMA_HINT = "Sistema laikinai nepasiruošusi. Uždarykite Cursor, atidarykite PowerShell ir paleiskite: npx prisma generate";

// GET – visų idėjų sąrašas
export async function GET() {
  try {
    if (typeof db.idea?.findMany !== "function") {
      return NextResponse.json({ ideas: [] });
    }
    const ideas = await db.idea.findMany({
      orderBy: { createdAt: "desc" },
      include: {
        author: {
          select: { name: true, email: true },
        },
      },
    });
    return NextResponse.json({ ideas });
  } catch (error) {
    console.error("Error fetching ideas:", error);
    return NextResponse.json({ ideas: [] });
  }
}

// POST – nauja idėja (prisijungus pririšama prie vartotojo)
export async function POST(request: NextRequest) {
  try {
    if (typeof db.idea?.create !== "function") {
      return NextResponse.json(
        { error: PRISMA_HINT },
        { status: 503 }
      );
    }

    const session = await getServerSession(authOptions);
    const body = await request.json();
    const { content } = body;

    if (!content || typeof content !== "string" || !content.trim()) {
      return NextResponse.json(
        { error: "Idėjos turinys privalomas" },
        { status: 400 }
      );
    }

    const idea = await db.idea.create({
      data: {
        content: content.trim(),
        authorId: session?.user?.id ?? null,
      },
    });

    return NextResponse.json({ idea }, { status: 201 });
  } catch (error) {
    console.error("Error creating idea:", error);
    const message = error instanceof Error ? error.message : "Įvyko klaida pridedant idėją";
    return NextResponse.json(
      { error: message },
      { status: 500 }
    );
  }
}
