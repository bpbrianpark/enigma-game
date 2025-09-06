import { prisma } from "../../../../lib/prisma";
import { NextRequest, NextResponse } from "next/server";

// Endpoint to retrieve only categories
export async function GET(req: NextRequest) {

  try {
    const category = await prisma.category.findMany();

    if (!category) {
      return NextResponse.json({ error: "Categories not found" }, { status: 404 });
    }

    return NextResponse.json(category);
  } catch (err) {
    console.error(err);
    return NextResponse.json({ ok: false, error: "Server error" }, { status: 500 });
  }
}