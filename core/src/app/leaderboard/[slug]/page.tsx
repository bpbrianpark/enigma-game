import Leaderboard from "@/app/components/Leaderboard";
import { Category, Difficulty, Game } from "@prisma/client";
import { notFound } from "next/navigation";

async function getCategory(slug: string): Promise<Category> {
  const res = await fetch(`/api/categories/${slug}`, {
    cache: "no-store",
  });

  if (!res.ok) {
    if (res.status === 404) notFound();
    throw new Error("Failed to fetch entries");
  }

  return res.json();
}

async function getGames(slug: string, difficultyId: string): Promise<Game[]> {
  const url = new URL(`/api/games`);
  url.searchParams.set("slug", slug);
  url.searchParams.set("difficultyId", difficultyId);

  const res = await fetch(url.toString(), {
    cache: "no-store",
  });

  if (!res.ok) {
    if (res.status === 404) notFound();
    throw new Error("Failed to fetch games.");
  }

  return res.json();
}

async function getDifficulties(slug: string): Promise<Difficulty[]> {
  const res = await fetch(`/api/categories/${slug}/`, {
    cache: "no-store",
  });

  if (!res.ok) {
    if (res.status === 404) notFound();
    throw new Error("Failed to fetch category.");
  }

  const data = await res.json();
  return data.difficulties;
}

export default async function LeaderboardPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const category = await getCategory(slug);
  const difficulties = await getDifficulties(slug);

  const games = await getGames(slug, difficulties[0].id);

  const topGames = games.slice(0, 25);

  return (
    <div className="p-6">
      <Leaderboard
      category={category}
      difficulties={difficulties}
      initialGames={topGames}
      slug={slug}
      ></Leaderboard>
    </div>
  );
}
