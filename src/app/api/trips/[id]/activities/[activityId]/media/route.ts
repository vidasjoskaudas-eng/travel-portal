import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { Prisma } from "@prisma/client";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
import { supabaseServer } from "@/lib/supabase/server";

function logActivityMediaError(context: string, error: unknown) {
  if (error instanceof Prisma.PrismaClientKnownRequestError) {
    console.error(`[${context}] PrismaClientKnownRequestError`, {
      code: error.code,
      message: error.message,
      meta: error.meta,
      clientVersion: error.clientVersion,
    });
    return;
  }
  if (error instanceof Prisma.PrismaClientValidationError) {
    console.error(`[${context}] PrismaClientValidationError`, {
      message: error.message,
    });
    return;
  }
  console.error(`[${context}]`, error);
}

/** FormData + Buffer upload needs Node; Vercel can extend timeout for large files */
export const runtime = "nodejs";
export const maxDuration = 60;

function getSafeExt(fileName: string) {
  const raw = fileName.split(".").pop()?.toLowerCase() || "jpg";
  const ext = raw.replace(/[^a-z0-9]+/g, "");
  return ext || "jpg";
}

function buildStoragePath(tripId: number, activityId: string, fileName?: string) {
  const ext = getSafeExt(fileName || "upload.jpg");
  const generatedName = `${crypto.randomUUID()}.${ext}`;
  return `${tripId}/${activityId}/${generatedName}`;
}

function missingServiceRoleResponse() {
  return NextResponse.json(
    {
      error:
        "Trūksta SUPABASE_SERVICE_ROLE_KEY. Lokaliai: .env.local. Production (Vercel): Project → Settings → Environment Variables. Raktas: Supabase → Project Settings → API → Secret (sb_secret_...) arba legacy service_role.",
    },
    { status: 503 }
  );
}

async function withDbRetry<T>(fn: () => Promise<T>): Promise<T> {
  try {
    await db.$connect();
    return await fn();
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "";
    const code =
      typeof err === "object" &&
      err !== null &&
      "code" in err &&
      typeof (err as { code: unknown }).code === "string"
        ? (err as { code: string }).code
        : undefined;
    // Prisma can throw P1017 when connection is dropped/reset.
    if (code === "P1017" || message.includes("Server has closed the connection")) {
      await new Promise((r) => setTimeout(r, 150));
      await db.$connect();
      return await fn();
    }
    throw err;
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; activityId: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Neprisijungęs" }, { status: 401 });
    }

    const { id, activityId } = await params;
    const tripId = parseInt(id, 10);
    if (Number.isNaN(tripId)) {
      return NextResponse.json({ error: "Neteisingas kelionės ID" }, { status: 400 });
    }

    const activity = await withDbRetry(() =>
      db.activity.findUnique({
      where: { id: activityId },
      select: { id: true, tripId: true },
    })
    );

    if (!activity || activity.tripId !== tripId) {
      return NextResponse.json({ error: "Veikla nerasta" }, { status: 404 });
    }

    const trip = await withDbRetry(() =>
      db.trip.findUnique({
      where: { id: tripId },
      include: {
        participants: {
          where: { userId: session.user.id },
          select: { id: true, userId: true },
        },
      },
    })
    );

    if (!trip) {
      return NextResponse.json({ error: "Kelionė nerasta" }, { status: 404 });
    }

    const isOrganizer = trip.organizerId === session.user.id;
    const isParticipant = trip.participants.length > 0;

    if (!isOrganizer && !isParticipant) {
      return NextResponse.json(
        { error: "Neturite teisės pridėti veiklos nuotraukų" },
        { status: 403 }
      );
    }

    if (!process.env.SUPABASE_SERVICE_ROLE_KEY?.trim()) {
      return missingServiceRoleResponse();
    }

    const formData = await request.formData();
    const file = formData.get("file");
    const commentRaw = formData.get("comment");
    const comment = typeof commentRaw === "string" ? commentRaw.trim() : "";

    if (!file || !(file instanceof File)) {
      return NextResponse.json({ error: "Trūksta failo" }, { status: 400 });
    }
    if (!comment) {
      return NextResponse.json({ error: "Trūksta komentaro" }, { status: 400 });
    }

    const requestedPath = buildStoragePath(tripId, activityId, file.name);

    const bytes = Buffer.from(await file.arrayBuffer());
    const contentType =
      file.type && file.type.length > 0 ? file.type : "application/octet-stream";

    const supabase = supabaseServer();
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from("activity-media")
      .upload(requestedPath, bytes, {
        upsert: false,
        cacheControl: "3600",
        contentType,
      });

    if (uploadError) {
      console.error("Supabase upload:", uploadError);
      const detail = uploadError.message || "unknown";
      const hint =
        detail.includes("JWS") || detail.includes("JWT")
          ? " Patikrinkite SUPABASE_SERVICE_ROLE_KEY: turi būti service_role (secret) iš Supabase API, viena eilutė, be kabučių pertekliaus."
          : "";
      return NextResponse.json(
        { error: `Nepavyko įkelti failo: ${detail}.${hint}` },
        { status: 500 }
      );
    }

    // Prefer real path returned by Storage; fallback to requested path.
    const pathFromUpload = uploadData?.path;
    const path =
      typeof pathFromUpload === "string" && pathFromUpload.trim().length > 0
        ? pathFromUpload.trim()
        : requestedPath;
    if (!path || path.trim().length === 0) {
      console.error("Supabase upload returned empty path", {
        requestedPath,
        uploadData,
      });
      return NextResponse.json(
        { error: "Nepavyko nustatyti failo kelio po įkėlimo." },
        { status: 500 }
      );
    }

    const publicResult = supabase.storage
      .from("activity-media")
      .getPublicUrl(path);
    const imageUrl = publicResult.data.publicUrl;
    if (!imageUrl) {
      return NextResponse.json({ error: "Nepavyko gauti nuotraukos URL" }, { status: 500 });
    }

    const media = await withDbRetry(() =>
      db.activityMedia.create({
      data: {
        activityId: activity.id,
        userId: session.user.id,
        path,
        imageUrl,
        comment,
      },
      include: {
        user: {
          select: { id: true, name: true, email: true, image: true },
        },
      },
    })
    );

    return NextResponse.json({ media }, { status: 201 });
  } catch (error) {
    logActivityMediaError("POST /api/trips/.../media", error);
    const msg = error instanceof Error ? error.message : "";
    if (msg.includes("SUPABASE_SERVICE_ROLE_KEY")) {
      return missingServiceRoleResponse();
    }
    return NextResponse.json(
      { error: "Įvyko klaida įkeliant veiklos nuotrauką" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; activityId: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Neprisijungęs" }, { status: 401 });
    }

    const { id, activityId } = await params;
    const tripId = parseInt(id, 10);
    if (Number.isNaN(tripId)) {
      return NextResponse.json({ error: "Neteisingas kelionės ID" }, { status: 400 });
    }

    const { searchParams } = new URL(request.url);
    const mediaId = parseInt(searchParams.get("mediaId") ?? "", 10);
    if (Number.isNaN(mediaId)) {
      return NextResponse.json({ error: "Trūksta mediaId" }, { status: 400 });
    }

    const media = await withDbRetry(() =>
      db.activityMedia.findUnique({
      where: { id: mediaId },
      select: {
        id: true,
        activityId: true,
        userId: true,
        path: true,
        imageUrl: true,
        activity: { select: { tripId: true } },
      },
    })
    );

    if (
      !media ||
      media.activityId !== activityId ||
      media.activity.tripId !== tripId
    ) {
      return NextResponse.json({ error: "Įrašas nerastas" }, { status: 404 });
    }

    const trip = await withDbRetry(() =>
      db.trip.findUnique({
      where: { id: tripId },
      include: {
        participants: {
          where: { userId: session.user.id },
          select: { id: true },
        },
      },
    })
    );

    if (!trip) {
      return NextResponse.json({ error: "Kelionė nerasta" }, { status: 404 });
    }

    const isOrganizer = trip.organizerId === session.user.id;
    const isParticipant = trip.participants.length > 0;
    const isOwner = media.userId === session.user.id;

    if (!isOrganizer && !isParticipant) {
      return NextResponse.json({ error: "Neturite teisės" }, { status: 403 });
    }

    if (!isOwner && !isOrganizer) {
      return NextResponse.json(
        { error: "Galite trinti tik savo nuotraukas" },
        { status: 403 }
      );
    }

    if (!process.env.SUPABASE_SERVICE_ROLE_KEY?.trim()) {
      return missingServiceRoleResponse();
    }

    const supabase = supabaseServer();
    if (media.path) {
      const { error: removeError } = await supabase.storage
        .from("activity-media")
        .remove([media.path]);
      if (removeError) {
        console.error("Supabase remove:", removeError);
        // Continue: DB row can still be deleted even if object already missing
      }
    }

    await withDbRetry(() => db.activityMedia.delete({ where: { id: mediaId } }));

    return NextResponse.json({ ok: true, imageUrl: media.imageUrl });
  } catch (error) {
    logActivityMediaError("DELETE /api/trips/.../media", error);
    const msg = error instanceof Error ? error.message : "";
    if (msg.includes("SUPABASE_SERVICE_ROLE_KEY")) {
      return missingServiceRoleResponse();
    }
    return NextResponse.json(
      { error: "Įvyko klaida trinant nuotrauką" },
      { status: 500 }
    );
  }
}
