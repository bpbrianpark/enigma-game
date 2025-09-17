"use client";

import './category-button.css'

import Link from "next/link";

interface CategoryButtonProps {
  slug: string;
  name: string;
}

const baseUrl = process.env.NEXT_PUBLIC_BASE_URL;

export default function CategoryButton({ slug, name }: CategoryButtonProps) {
  return (
    <div className="category-container">
    <div className="category-button">
        <div className="category-text-container">
          <h2 className="category-text">{name}</h2>
        </div>
    </div>

    <div className="category-mode-options">
      <Link href={`${baseUrl}/quiz/${slug}`}>
        <div className="mode-button">
          <h2 className="mode-text">Slow Burn</h2>
        </div>
      </Link>

      <Link href={`${baseUrl}/blitz/${slug}`}>
        <div className="mode-button">
          <h2 className="mode-text">Blitz</h2>
        </div>
      </Link>
    </div>
</div>
  );
}
