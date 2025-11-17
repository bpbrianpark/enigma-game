import { prisma } from "../../../lib/prisma";
import CategoryList from "../components/CategoryList";

export const dynamic = "force-dynamic";

export default async function CategoriesPage() {
  const categories = await prisma.category.findMany({
    where: {
      isDaily: null,
    },
    select: {
      id: true,
      slug: true,
      name: true,
      imageUrl: true
    },
  });

  return <CategoryList initialCategories={categories} />;
}

