"use client";

import Link from "next/link";

export default function NavBar() {
  return (
    <nav className="navbar">
      <div className="navbar-text-container">
        <Link
          href="/"
          className="navbar-text"
        >
          Home
        </Link>
      </div>
    </nav>
  );
}
