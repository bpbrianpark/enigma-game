"use client";

import { useMemo, useState } from "react";
import { CategoryType } from "./types";
import AdSlot from "./AdSlot";
import { useRouter } from "next/navigation";
import Image from "next/image";
import TagCard from "./TagCard";
import InfoDialog from "./InfoDialog";
import { CircleQuestionMark } from "lucide-react";
import "./button.css";

interface CategoryListProps {
  initialCategories: CategoryType[];
}

export default function CategoryList({ initialCategories }: CategoryListProps) {
  const router = useRouter();
  const sideAdSlotId = process.env.NEXT_PUBLIC_ADSENSE_SLOT_SIDEBAR;
  const bottomAdSlotId = process.env.NEXT_PUBLIC_ADSENSE_SLOT_CATEGORIES_BOTTOM;
  const [showInfoDialog, setShowInfoDialog] = useState(false);

  const categoriesByTag = useMemo(() => {
    const tagMap = new Map<string, CategoryType[]>();
    const uncategorized: CategoryType[] = [];

    initialCategories.forEach((category) => {
      const tags = category.tags || [];
      if (tags.length === 0) {
        uncategorized.push(category);
      } else {
        tags.forEach((tag) => {
          if (!tagMap.has(tag)) {
            tagMap.set(tag, []);
          }
          tagMap.get(tag)!.push(category);
        });
      }
    });

    return { tagMap, uncategorized };
  }, [initialCategories]);

  const sortedTags = useMemo(() => {
    const allTags = Array.from(categoriesByTag.tagMap.keys());
    const peopleTag = allTags.find((tag) => tag.toLowerCase() === "people");
    const otherTags = allTags.filter((tag) => tag.toLowerCase() !== "people");
    return peopleTag ? [peopleTag, ...otherTags] : otherTags;
  }, [categoriesByTag.tagMap]);

  return (
    <div className="category-page-shell">
      <aside className="category-side-rail">
        <AdSlot slot={sideAdSlotId} className="side-rail-ad" />
      </aside>
      <div className="category-center-column">
        <div className="categories-page-container">
          <div className="categories-header-section">
            <Image
              src="/logo.svg"
              alt="100 Man Roster logo"
              width={72}
              height={72}
              className="categories-logo"
              priority
            />
            <h1 className="categories-main-title">100 Man Roster</h1>
            <p className="categories-main-description">
              Challenge yourself with quizzes across different categories
            </p>
            <div className="categories-header-buttons">
              <button
                className="daily-challenge-header-button"
                onClick={() => router.push("/")}
              >
                Daily Challenge
              </button>
              <button
                className="header-button"
                onClick={() => setShowInfoDialog(true)}
              >
                <CircleQuestionMark className="header-button-icon" />
                How to Play
              </button>
            </div>
          </div>

        <AdSlot slot={bottomAdSlotId} className="bottom-banner-ad categories-top-ad" />

          <div className="categories-content">
            <div className="tag-cards-container">
              {sortedTags.map((tag) => {
                const categories = categoriesByTag.tagMap.get(tag) || [];
                const imageUrl = categories[0]?.imageUrl || null;
                return (
                  <TagCard
                    key={tag}
                    tagName={tag}
                    categories={categories}
                    imageUrl={imageUrl}
                  />
                );
              })}
            </div>
          </div>
        </div>
      </div>
      <aside className="category-side-rail">
        <AdSlot slot={sideAdSlotId} className="side-rail-ad" />
      </aside>
      <InfoDialog
        isOpen={showInfoDialog}
        onClose={() => setShowInfoDialog(false)}
        gameType="Normal"
      />
    </div>
  );
}
