import { prisma } from "../../lib/prisma";
import CategoryList from "./components/CategoryList";

export const dynamic = "force-dynamic";

export default async function Home() {
  const categories = await prisma.category.findMany({
    select: {
      id: true,
      slug: true,
      name: true,
      imageUrl: true,
    },
  });

  return <CategoryList initialCategories={categories} />;
}