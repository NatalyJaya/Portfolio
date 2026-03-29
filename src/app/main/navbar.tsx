"use client";

import React, { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import universo from "../assets/img/universo.png";

const links = [
  { href: "#home", label: "home" },
  { href: "#about", label: "about" },
  { href: "#languages", label: "languages" },
  { href: "#projects", label: "projects" },
  { href: "#contact", label: "contact" },
];

const Navbar = () => {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <header className="fixed top-0 left-0 right-0 z-50 border-b border-white/10 bg-black/70 backdrop-blur-md">
      <nav className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3 sm:px-6 lg:px-8">
        <Link
          href="#home"
          className="flex items-center gap-2"
          onClick={() => setMenuOpen(false)}
        >
          <Image src={universo} width={40} height={40} alt="Home" />
        </Link>

        <div className="hidden items-center gap-1 md:flex">
          {links.map(({ href, label }) => (
            <Link
              key={href}
              href={href}
              className="px-3 py-2 font-mono text-sm text-white/80 transition-colors hover:text-white"
            >
              <span className="text-indigo-400/80">/</span>
              {label}
            </Link>
          ))}
        </div>

        <button
          type="button"
          className="flex flex-col gap-1.5 p-2 md:hidden"
          aria-expanded={menuOpen}
          aria-label="Open menu"
          onClick={() => setMenuOpen((o) => !o)}
        >
          <span
            className={`block h-0.5 w-6 bg-white/90 transition-transform ${
              menuOpen ? "translate-y-2 rotate-45" : ""
            }`}
          />
          <span
            className={`block h-0.5 w-6 bg-white/90 transition-opacity ${
              menuOpen ? "opacity-0" : ""
            }`}
          />
          <span
            className={`block h-0.5 w-6 bg-white/90 transition-transform ${
              menuOpen ? "-translate-y-2 -rotate-45" : ""
            }`}
          />
        </button>
      </nav>

      <div
        className={`border-t border-white/10 bg-black/90 md:hidden ${
          menuOpen ? "max-h-[min(70vh,24rem)] opacity-100" : "max-h-0 opacity-0"
        } overflow-hidden transition-[max-height,opacity] duration-300 ease-out`}
      >
        <div className="flex flex-col px-4 py-3 sm:px-6">
          {links.map(({ href, label }) => (
            <Link
              key={href}
              href={href}
              className="py-3 font-mono text-sm text-white/90 border-b border-white/5 last:border-0"
              onClick={() => setMenuOpen(false)}
            >
              <span className="text-indigo-400/80">/</span>
              {label}
            </Link>
          ))}
        </div>
      </div>
    </header>
  );
};

export default Navbar;
