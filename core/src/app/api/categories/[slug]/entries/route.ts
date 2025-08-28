import { prisma } from "../../../../../../lib/prisma";
import { NextRequest, NextResponse } from "next/server";

// Endpoint to retrieve only entries
export async function GET(req: NextRequest, { params }: { params: { slug: string } }) {
  const { slug } = params;

  try {
    const category = await prisma.category.findUnique({
      where: { slug },
      include: {
        entries: {
          include: {
            aliases: true
          }
        }
      }
    });

    if (!category) {
      return NextResponse.json({ error: "Category not found" }, { status: 404 });
    }

    const entries = category.entries.map(entry => ({
      label: entry.label,
      norm: entry.norm,
      url: entry.url,
      aliases: entry.aliases.map(a => ({ label: a.label, norm: a.norm }))
    }));

    return NextResponse.json({ ok: true, entries });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ ok: false, error: "Server error" }, { status: 500 });
  }
}
