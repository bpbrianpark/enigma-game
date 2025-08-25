import { prisma } from "../../../../../lib/prisma";
import { normalize } from "path";
import { queryWDQS } from "../../../../../lib/wdqs";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  const { slug, name, sparql } = await req.json();

  const category = await prisma.category.upsert({
    where: { slug },
    update: { name, sparql },
    create: { slug, name, sparql },
  });

  const data = await queryWDQS(sparql);

  const rows = data.results.bindings;
  const entriesByItem: Record<string, { label: string; url: string; aliases: string[] }> = {};

  for (const r of rows) {
    const item = r.item.value; 
    if (!entriesByItem[item]) {
      entriesByItem[item] = {
        label: r.item_label.value,
        url: r.item.value,
        aliases: []
      };
    }
    if (r.alias) {
      entriesByItem[item].aliases.push(r.alias.value);
    }
  }

  const entries = Object.values(entriesByItem);

  await prisma.entry.deleteMany({ where: { categoryId: category.id } });

  for (const e of entries) {
    const entry = await prisma.entry.create({
      data: {
        categoryId: category.id,
        label: e.label,
        norm: normalize(e.label),
        url: e.url,
      }
    });

    if (e.aliases.length) {
      await prisma.alias.createMany({
        data: e.aliases.map(a => ({
          entryId: entry.id,
          label: a,
          norm: normalize(a),
        }))
      });
    }
  }

  return NextResponse.json({ ok: true, inserted: entries.length });
}
