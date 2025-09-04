import { prisma } from "../../../../lib/prisma";
import { normalize } from "path";
import { queryWDQS } from "../../../../lib/wdqs";
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
    },
    orderBy: {
      time: "asc", 
    },
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
    const { slug, difficultyId, time, targetCount, username } = body

    if (!slug || !difficultyId || !time || !targetCount || !username) {
      return NextResponse.json(
        { error: "Missing required field."},
        { status: 400 }
      )
    }

    const game = await prisma.game.create({
      data: {
        slug,
        difficultyId,
        time,
        targetCount,
        username
      }
    });

    return NextResponse.json(game, { status: 201 });
  } catch (e) {
    return NextResponse.json({
      message: 'Could not post game.'
    }, { status: 409 })
  }
}
