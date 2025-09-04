import { prisma } from "../../lib/prisma";
import CategoryButton from "./components/CategoryButton";

export default async function Home() {
  const categories = await prisma.category.findMany();

  return (
    <main>
      <h2> Hey there. Welcome to the game. </h2>
      <div className="category-link-grid">
        {categories.map((category) => (
          <CategoryButton
            key={category.id}
            slug={category.slug}
            name={category.name}
            imageUrl={'public/globe.svg'} 
          />
        ))}
      </div>
    </main>
  );
}
