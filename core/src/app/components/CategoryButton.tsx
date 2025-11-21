"use client";

import './category-button.css'
import Link from "next/link";

interface CategoryButtonProps {
  slug: string;
  name: string;
  imageUrl?: string | null;
}

const baseUrl = process.env.NEXT_PUBLIC_BASE_URL;

export default function CategoryButton({ slug, name, imageUrl }: CategoryButtonProps) {
  return (
    <div className="category-card">
      <div className="category-image-wrapper">
        {imageUrl ? (
          <img
            src={imageUrl}
            alt={name}
            className="category-image"
          />
        ) : (
          <div className="category-image-placeholder">
            <span className="category-placeholder-icon">{name.charAt(0).toUpperCase()}</span>
          </div>
        )}
      </div>
      
      <div className="category-content">
        <h3 className="category-name">{name}</h3>
        
        <div className="category-mode-options">
          <Link href={`${baseUrl}/quiz/${slug}`} className="mode-button-link">
            <button className="mode-button normal">
              <span className="mode-text">Normal</span>
            </button>
          </Link>

          <Link href={`${baseUrl}/blitz/${slug}`} className="mode-button-link">
            <button className="mode-button blitz">
              <span className="mode-text">Blitz</span>
            </button>
          </Link>
        </div>
      </div>
    </div>
  );
}
