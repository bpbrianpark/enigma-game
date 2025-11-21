"use client";

import "./button.css";
import { useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";

export default function BackToCategoriesButton() {
  const router = useRouter();

  const handleClick = () => {
    router.push("/categories");
  };

  return (
    <button onClick={handleClick} className="header-button">
      <ArrowLeft className="header-button-icon" />
      Back to Categories
    </button>
  );
}

