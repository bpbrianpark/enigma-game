import { prisma } from "../../../../lib/prisma";
import { NextRequest, NextResponse } from "next/server";

// Endpoint to retrieve all the games (for the leaderboard)
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const slug = searchParams.get("slug");
  const difficultyId = searchParams.get("difficultyId");

  if (!slug || !difficultyId) {
    return NextResponse.json(
      { error: "Games not found for category or difficulty." },
      { status: 404 }
    );
  }

  const games = await prisma.game.findMany({
    where: {
      slug,
      difficultyId,
      username: { not: "GUEST" },
    },
    orderBy: [
      { correct_count: 'desc' },
      { time: 'asc' }
    ],
    take: 25, 
  });

  if (!games || games.length === 0) {
    return NextResponse.json({ error: "Games not found" }, { status: 404 });
  }

  return NextResponse.json(games);
}

// Endpoint to put the game inside the database after completion
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      slug,
      difficultyId,
      time,
      targetCount,
      username,
      correct_count,
    }: {
      slug?: string;
      difficultyId?: string;
      time?: number;
      targetCount?: number | null;
      username?: string;
      correct_count?: number;
    } = body;

    console.log("[/api/games] Received submission", {
      slug,
      difficultyId,
      username,
      correct_count,
      time,
      targetCount,
    });

    if (
      !slug ||
      !difficultyId ||
      correct_count === undefined ||
      time === undefined ||
      targetCount === undefined
    ) {
      return NextResponse.json(
        { error: "Missing required field." },
        { status: 400 }
      );
    }

    if (!username) {
      console.warn("[/api/games] Guest submission ignored for game persistence", {
        slug,
        difficultyId,
      });
      return NextResponse.json(
        { ok: true, guest: true },
        { status: 200 }
      );
    }

    const game = await prisma.game.create({
      data: {
        slug,
        difficultyId,
        time,
        targetCount,
        username,
        correct_count,
      },
    });

    console.log("[/api/games] Game persisted", { gameId: game.id });

    return NextResponse.json(game, { status: 201 });
  } catch (e) {
    console.error("[/api/games] Failed to persist game", e);
    return NextResponse.json({
      message: "Could not post game.",
      error: e instanceof Error ? e.message : String(e),
    });
  }
}
