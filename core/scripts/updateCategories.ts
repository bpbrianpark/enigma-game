
import { prisma } from "../lib/prisma";
import { queryWDQS } from "../lib/wdqs";
import { normalize } from "path";

async function updateCategory(category: { id: string; sparql: string; name: string }) {
  console.log(`Updating category: ${category.name}`);
  try {
    const data = await queryWDQS(category.sparql);

    await prisma.entry.deleteMany({ where: { categoryId: category.id } });

    for (const row of data.results.bindings) {
      const label = row.item_label.value;
      const aliases = row.alias ? [row.alias.value] : [];

      await prisma.entry.create({
        data: {
          categoryId: category.id,
          label,
          norm: normalize(label),
          url: row.item.value,
          aliases: {
            create: aliases.map((a) => ({ label: a, norm: normalize(a) })),
          },
        },
      });
    }
    console.log(`Finished category: ${category.name}`);
  } catch (err) {
    console.error(`Error updating category ${category.name}:`, err);
  }
}

async function main() {
  const categories = await prisma.category.findMany();
  for (const category of categories) {
    await updateCategory(category);
  }
  console.log("All categories updated.")
}

main()
  .then(() => prisma.$disconnect())
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
