import { prisma } from "../../../../lib/prisma";
import { normalize } from "path";
import { queryWDQS } from "../../../../lib/wdqs";
import { NextRequest, NextResponse } from "next/server";

// Endpoint to retrieve all the users (for the leaderboard)
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const slug = searchParams.get('slug');
  const difficultyId = searchParams.get('difficultyId');

  if (!slug || !difficultyId) {
    return NextResponse.json({ error: "Games not found for category or difficulty." }, { status: 404 });
  }
    
  const game = await prisma.game.findMany({
    where: { slug: slug,
        difficultyId: difficultyId }
  });

  if (!game) {
    return NextResponse.json({ error: "Games not found" }, { status: 404 });
  }

  return NextResponse.json(game);
}

// Endpoint to create a new user
export async function POST(req: NextRequest) {
  try {
    const { username } = await req.json();

    if (!username) {
      return NextResponse.json(
        { message: 'Username is required '},
        { status : 400 }
      );
    }

    const newUser = await prisma.user.create({
      data: {
        username: username,
        email: "test@email.com",
        password: "123456"
      }
    });

    return NextResponse.json({
      isAvailable: true,
      success: true,
      user: {
        id: newUser.id,
        username: newUser.username
      }
    });
  } catch (e: any) {
    return NextResponse.json({
      isAvailable: false,
      message: 'Could not post user.'
    }, { status: 409 })
  }
}