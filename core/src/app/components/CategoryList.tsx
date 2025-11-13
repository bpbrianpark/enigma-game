"use client";

import CategoryButton from "./CategoryButton";
import HeroSection from "./HeroSection";
import { CategoryType } from "./types";

interface CategoryListProps {
  initialCategories: CategoryType[];
}

export default function CategoryList({ initialCategories }: CategoryListProps) {
  return (
    <>
      <HeroSection />
      <div className="categories-container">
        <div className="categories-header">
          <h2 className="categories-title">Choose a Category</h2>
          <p className="categories-description">Select a category and game mode to start playing</p>
        </div>
        <div className="category-link-grid" id="categories">
          {initialCategories.map((category: CategoryType) => (
            <CategoryButton 
              key={category.id} 
              slug={category.slug} 
              name={category.name}
              imageUrl={category.imageUrl}
            />
          ))}
        </div>
      </div>
    </>
  );
}