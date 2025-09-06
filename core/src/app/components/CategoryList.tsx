import { useEffect, useState } from "react";
import { prisma } from "../../../lib/prisma";
import CategoryButton from "./CategoryButton";

const baseUrl = process.env.NEXT_PUBLIC_BASE_URL;
export const dynamic = "force-dynamic";

export default async function CategoryList() {
    const [categories, setCategories] = useState<any[]>([]);

    useEffect(() => {
        fetch(`${baseUrl}/api/categories`, { cache: "no-store" })
        
        .then((res) => res.json())
        .then((data) => setCategories(data))
        .catch(console.error);
    }, []);
  return (
    <div className="category-link-grid">
      {categories.map((category) => (
        <CategoryButton key={category.id} slug={category.slug} name={category.name} />
      ))}
    </div>
  );
}
