"use client";

import "./navbar.css";
import Link from "next/link";

export default function NavBar() {
  return (
    <nav className="navbar">
      <Link href="/">
        <img src="/home.svg" alt="Home" className="home-icon" />
      </Link>
    </nav>
  );
}

