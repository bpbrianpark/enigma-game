"use client";

import Link from "next/link";
import Image from "next/image";

interface CategoryButtonProps {
  slug: string;
  name: string;
  imageUrl: string;
}

export default function CategoryButton({ slug, name, imageUrl }: CategoryButtonProps) {
  return (
    <Link href={`/quiz/${slug}`}>
      <div className="category-button">
        <Image
          src={imageUrl}
          alt={name}
          width={300}
          height={200}
          className="category-image"
        />
        <div className="category-text-container">
          <h2 className="category-text">{name}</h2>
        </div>
      </div>
    </Link>
  );
}
