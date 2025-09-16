import { prisma } from "../../../../lib/prisma";
import { notFound } from "next/navigation";
import { authOptions } from "../../../../lib/auth";
import { getServerSession } from "next-auth";
import ProfileClient from "@/app/components/ProfileClient";

export const dynamic = "force-dynamic";

export default async function ProfilePage({
  params,
}: {
  params: Promise<{ username: string }>;
}) {
  const { username } = await params;
  const session = await getServerSession(authOptions);

  const user = await prisma.user.findUnique({
    where: { username },
  });

  const games = await prisma.game.findMany({
    where: { username },
  });

  const categories = await prisma.category.findMany();

  const difficulties = await prisma.difficulty.findMany({
  });

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
