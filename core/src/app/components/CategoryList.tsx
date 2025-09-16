import useSWR from "swr"
import CategoryButton from "./CategoryButton";
import { CategoryType } from "./types";

const fetcher = (url: string) => fetch(url).then((res) => res.json());

export default function CategoryList() {
  const { data: categories, error, isLoading } = useSWR("/api/categories", fetcher);

  if (isLoading) return <div className="spinner-container">
      <div className="spinner"></div>
    </div>;
  if (error) {
    console.log("There was an error fetching categories: ", error)
  }

  return (
    <div className="category-link-grid">
      {categories.map((category: CategoryType) => (
        <CategoryButton key={category.id} slug={category.slug} name={category.name} />
      ))}
    </div>
  );
}
