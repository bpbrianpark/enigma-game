import { NextResponse } from "next/server";
import { prisma } from "../../../../../../lib/prisma";

export async function POST(
  req: Request
) {
  try {
    const body = await req.json();
    const { categoryId, entryId, label, norm } = body;

    if (!categoryId || !entryId || !label || !norm) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const alias = await prisma.alias.create({
      data: {
        categoryId,
        entryId,
        label,
        norm,
      },
      include: {
        entry: true, 
      },
    });

    return NextResponse.json(alias, { status: 201 });
  } catch (err) {
    console.error("Error creating alias:", err);
    return NextResponse.json({ error: "Failed to create alias" }, { status: 500 });
  }
}
