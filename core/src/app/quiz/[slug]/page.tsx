import QuizGame from "@/app/components/QuizGame";
import { Category, Difficulty, Entry } from "@prisma/client";
import { notFound } from "next/navigation";

async function getCategory(slug: string): Promise<Category> {
  const res = await fetch(`/api/categories/${slug}`, {
    cache: "no-store",
  });

  if (!res.ok) {
    if (res.status === 404) notFound();
    throw new Error("Failed to fetch entries");
  }

  const data = await res.json();
  return data
}

// Cache is set to no-store because it will be a dynamic DB
async function getEntries(slug: string): Promise<Entry[]> {
  const res = await fetch(`/api/categories/${slug}/entries`, {
    cache: "no-store",
  });

  if (!res.ok) {
    if (res.status === 404) notFound();
    throw new Error("Failed to fetch entries");
  }

  const data = await res.json();
  return data.entries;
}

async function getDifficulties(slug: string): Promise<Difficulty[]> {
    const res = await fetch(`/api/categories/${slug}/`, { 
        cache: "no-store"
    });

    if (!res.ok) {
        if (res.status === 404) notFound();
        throw new Error("Failed to fetch category.");
    }

    const data = await res.json();
    return data.difficulties
}

export default async function QuizPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params; 
  const category = await getCategory(slug);
  const entries = await getEntries(slug);
  const difficulties = await getDifficulties(slug);
  const isDynamic = category.isDynamic

  return (
    <QuizGame 
      category={category}
      difficulties={difficulties}
      entries={entries}
      totalEntries={entries.length}
      slug={slug}
      isDynamic={isDynamic}
    />
  );
}