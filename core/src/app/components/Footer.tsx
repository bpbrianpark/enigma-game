'use client';

import "./footer.css";
import Link from "next/link";
import { useSession } from "next-auth/react";
import SignOutButton from "./SignOutButton";
import { Session } from "next-auth";
import SignInButton from "./SignInButton";


export default function Footer() {

  return (
    <div className="footer-container">
      <nav className="footer-bar">

        <div className="links-section">
            <div className="footer-header">Socials</div>
        <Link href="/" className="footer-text">Instagram</Link>
        <Link href="/" className="footer-text">X</Link>
        <Link href="/" className="footer-text">GitHub</Link>
        </div>

        <div className="links-section">
            <div className="footer-header">Contact</div>
            <Link href="/" className="footer-text">Contact Us</Link>
        </div>

        <div className="links-section">
            <div className="footer-header">Legal</div>
            <Link href="/" className="footer-text">Privacy Policy</Link>
            <Link href="/" className="footer-text">Terms of Use</Link>
        </div>
      </nav>

      <div className="copyright-disclaimer">
        <span className="disclaimer-text"> Copyright © 2025 Brian Park. All rights reserved. </span>
        <span className="disclaimer-text"> Data is from https://www.wikidata.org/wiki/.</span>
      </div>
    </div>
  );
}