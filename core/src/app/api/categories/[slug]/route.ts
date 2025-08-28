import { NextRequest, NextResponse } from "next/server";
import { prisma } from "../../../../../lib/prisma";
import { Category } from '@prisma/client'

// Endpoint to retrieve everything about a category
export async function GET(
  req: NextRequest,
  { params }: { params: { slug: string } }
) {
  const { slug } = params;
    
  const category = await prisma.category.findUnique({
    where: { slug },
    include: {
      difficulties: true,
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

  return NextResponse.json(category);
}
