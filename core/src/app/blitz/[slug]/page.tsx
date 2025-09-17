import { prisma } from "../../../../lib/prisma";
import { notFound } from "next/navigation";
import { authOptions } from "../../../../lib/auth";
import { getServerSession } from "next-auth";
import BlitzGame from "@/app/components/BlitzGame";

export const dynamic = "force-dynamic";

export default async function BlitzPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const session = await getServerSession(authOptions);

  const category = await prisma.category.findUnique({
    where: { slug },
    include: {
      difficulties: {
        orderBy: { level: "asc" },
      },
      entries: true,
    },
  });

  const aliases = await prisma.alias.findMany({
    where: { categoryId: category?.id },
  });

  if (!category) {
    notFound();
  }

  return (
    <BlitzGame
      aliases={aliases}
      category={category}
      difficulties={category.difficulties || []}
      entries={category.entries || []}
      totalEntries={category.entries?.length || 0}
      slug={slug}
      isDynamic={category.isDynamic}
      initialSession={session}
    />
  );
}
