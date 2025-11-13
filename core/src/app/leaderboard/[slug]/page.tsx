import Leaderboard from "@/app/components/Leaderboard";
import { prisma } from "../../../../lib/prisma";
import { notFound } from "next/navigation";

export const dynamic = "force-dynamic";

export default async function LeaderboardPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  
  const category = await prisma.category.findUnique({
    where: { slug },
    include: {
      difficulties: {
        orderBy: { level: 'asc' }
      }
    }
  });

  if (!category) {
    notFound();
  }

  const initialGames = await prisma.game.findMany({
    where: {
      slug: slug,
      difficultyId: category.difficulties[0]?.id,
    },
    orderBy: [
      { correct_count: 'desc' },
      { time: 'asc' }
    ],
    take: 25
  });

  return (
    <div className="p-6">
      <Leaderboard
        category={category}
        difficulties={category.difficulties}
        initialGames={initialGames}
        slug={slug}
      />
    </div>
  );
}