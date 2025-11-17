import QuizGame from "@/app/components/QuizGame";
import { prisma } from "../../lib/prisma";
import { notFound } from "next/navigation";
import { authOptions } from "../../lib/auth";
import { getServerSession } from "next-auth";
import { getDailyCategory } from "../lib/daily-category";

export const dynamic = "force-dynamic";

export default async function Home() {
  const session = await getServerSession(authOptions);
  
  let slug: string;
  try {
    slug = await getDailyCategory();
  } catch (error) {
    console.error("Error getting daily category:", error);
    notFound();
  }

  const category = await prisma.category.findUnique({
    where: { slug },
    include: {
      difficulties: {
        orderBy: { level: "asc" },
      },
    },
  });

  const totalEntries = await prisma.entry.count({
    where: { categoryId: category?.id },
  });

  if (!category) {
    notFound();
  }

  return (
    <QuizGame
      aliases={[]}
      category={category}
      difficulties={category.difficulties || []}
      entries={[]}
      totalEntries={totalEntries}
      slug={slug}
      isDynamic={category.isDynamic}
      initialSession={session || undefined}
    />
  );
}