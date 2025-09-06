import { prisma } from "../../../lib/prisma";
import CategoryButton from "./CategoryButton";

export const dynamic = "force-dynamic";

export default async function CategoryList() {
  const categories = await prisma.category.findMany();
  return (
    <div className="category-link-grid">
      {categories.map((category) => (
        <CategoryButton key={category.id} slug={category.slug} name={category.name} />
      ))}
    </div>
  );
}
