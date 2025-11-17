"use client";

import CategoryButton from "./CategoryButton";
import HeroSection from "./HeroSection";
import { CategoryType } from "./types";
import Link from "next/link";

interface CategoryListProps {
  initialCategories: CategoryType[];
}

const baseUrl = process.env.NEXT_PUBLIC_BASE_URL;

export default function CategoryList({ initialCategories }: CategoryListProps) {
  return (
    <>
      <HeroSection />
      <div className="categories-container">
        <div className="categories-header">
          <h2 className="categories-title">Choose a Category</h2>
          <p className="categories-description">Select a category and game mode to start playing</p>
        </div>
        <div className="daily-challenge-section">
          <Link href={`${baseUrl}/daily`} className="daily-challenge-button">
            <div className="daily-challenge-content">
              <span className="daily-challenge-icon">📅</span>
              <div className="daily-challenge-text">
                <h3 className="daily-challenge-title">Daily Challenge</h3>
                <p className="daily-challenge-description">Play today's featured category</p>
              </div>
            </div>
          </Link>
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