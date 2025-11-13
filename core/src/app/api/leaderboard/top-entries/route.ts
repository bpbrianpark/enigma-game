import { NextRequest, NextResponse } from "next/server";
import { prisma } from "../../../../../lib/prisma";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const slug = searchParams.get("slug");

  if (!slug) {
    console.warn("[/api/leaderboard/top-entries] Missing slug");
    return NextResponse.json(
      { error: "Missing slug parameter" },
      { status: 400 }
    );
  }

  try {
    console.log("[/api/leaderboard/top-entries] Fetching entries", { slug });

    const entries = await prisma.entry.findMany({
      where: {
        category: { slug },
      },
      orderBy: {
        count: "desc",
      } as any,
      take: 25,
      select: {
        id: true,
        label: true,
        count: true,
      } as any,
    });

    console.log("[/api/leaderboard/top-entries] Retrieved entries", {
      slug,
      count: entries.length,
      topSample: entries.slice(0, 3),
    });

    return NextResponse.json({ entries });
  } catch (error) {
    console.error("Failed to fetch top entries", error);
    return NextResponse.json(
      {
        error: "Failed to fetch top entries",
        message: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    );
  }
}

