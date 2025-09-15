import QuizGame from "@/app/components/QuizGame";
import { prisma } from "../../../../lib/prisma";
import { notFound } from "next/navigation";
import { authOptions } from "../../../../lib/auth";
import { getServerSession } from "next-auth";

export const dynamic = "force-dynamic";

export default async function QuizPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params; 
  const session = await getServerSession(authOptions)
  
  const category = await prisma.category.findUnique({
    where: { slug },
    include: {
      difficulties: {
        orderBy: { level: 'asc' }
      },
      entries: true
    }
  });

  if (!category) {
    notFound();
  }

  return (
    <QuizGame 
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