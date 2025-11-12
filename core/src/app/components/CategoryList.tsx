"use client";

import useSWR from "swr"
import CategoryButton from "./CategoryButton";
import HeroSection from "./HeroSection";
import { CategoryType } from "./types";

const fetcher = (url: string) => fetch(url).then((res) => res.json());

export default function CategoryList() {
  const { data: categories, error, isLoading } = useSWR("/api/categories", fetcher);

  if (isLoading) return (
    <>
      <HeroSection />
      <div className="spinner-container">
        <div className="spinner"></div>
      </div>
    </>
  );
  
  if (error) {
    console.log("There was an error fetching categories: ", error)
  }

  return (
    <>
      <HeroSection />
      <div className="categories-container">
        <div className="categories-header">
          <h2 className="categories-title">Choose a Category</h2>
          <p className="categories-description">Select a category and game mode to start playing</p>
        </div>
        <div className="category-link-grid" id="categories">
          {categories?.map((category: CategoryType) => (
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
