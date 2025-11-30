import { prisma } from "../../../../lib/prisma";
import { notFound } from "next/navigation";
import ProfileClient from "@/app/components/ProfileClient";

export const dynamic = "force-dynamic";

export default async function ProfilePage({
  params,
}: {
  params: Promise<{ username: string }>;
}) {
  const { username } = await params;

  const user = await prisma.user.findUnique({
    where: { username },
  });

  if (!user) {
    notFound();
  }

  // Use userId instead of username for game queries
  const dailyGames = await prisma.game.findMany({
    where: {
      userId: user.id,
      isDailyGame: true,
    },
    orderBy: { id: "desc" },
    take: 1,
  });

  const normalGames = await prisma.game.findMany({
    where: {
      userId: user.id,
      OR: [{ isBlitzGame: null }, { isBlitzGame: false }],
      isDailyGame: false,
    },
    orderBy: { id: "desc" },
    take: 3,
  });

  const blitzGames = await prisma.game.findMany({
    where: {
      userId: user.id,
      isBlitzGame: true,
    },
    orderBy: { id: "desc" },
    take: 3,
  });

  const games = [...dailyGames, ...normalGames, ...blitzGames];

  const categories = await prisma.category.findMany();

  const difficulties = await prisma.difficulty.findMany({});

  if (!games || !user) {
    notFound();
  }

  return (
    <ProfileClient
      categories={categories}
      difficulties={difficulties}
      user={user}
      games={games}
    />
  );
}
