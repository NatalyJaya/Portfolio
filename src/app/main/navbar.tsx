"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import universo from "../assets/img/universo.png";

const links = [
  { href: "#home", label: "home" },
  { href: "#about", label: "about" },
  { href: "#languages", label: "languages" },
  { href: "#projects", label: "projects" },
];

const Navbar = () => {
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
      if (window.scrollY > 50 && menuOpen) {
        setMenuOpen(false);
      }
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, [menuOpen]);

  return (
    <>
      <header
        className={`fixed top-0 left-0 right-0 z-50 border-b transition-all duration-300 ${
          scrolled
            ? "bg-black/90 backdrop-blur-md border-white/10"
            : "bg-transparent border-transparent"
        }`}
      >
        <nav className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3 sm:px-6 lg:px-8">
          <Link
            href="#home"
            className="flex items-center gap-2 transition-transform hover:scale-105"
            onClick={() => setMenuOpen(false)}
          >
            <Image src={universo} width={40} height={40} alt="Home" priority />
          </Link>

          <div className="hidden items-center gap-1 md:flex">
            {links.map(({ href, label }) => (
              <Link
                key={href}
                href={href}
                className="group relative px-3 py-2 font-mono text-sm text-white/80 transition-colors hover:text-white"
              >
                <span className="text-indigo-400/80 group-hover:text-indigo-400 transition-colors">/</span>
                {label}
                <span className="absolute bottom-1 left-3 h-0.5 w-0 bg-indigo-400/50 transition-all duration-300 group-hover:w-4" />
              </Link>
            ))}
          </div>

          <button
            type="button"
            className="flex flex-col gap-1.5 p-2 md:hidden"
            aria-expanded={menuOpen}
            aria-label={menuOpen ? "Close menu" : "Open menu"}
            onClick={() => setMenuOpen((o) => !o)}
          >
            <span
              className={`block h-0.5 w-6 bg-white/90 transition-transform duration-300 ${
                menuOpen ? "translate-y-2 rotate-45" : ""
              }`}
            />
            <span
              className={`block h-0.5 w-6 bg-white/90 transition-opacity duration-300 ${
                menuOpen ? "opacity-0" : ""
              }`}
            />
            <span
              className={`block h-0.5 w-6 bg-white/90 transition-transform duration-300 ${
                menuOpen ? "-translate-y-2 -rotate-45" : ""
              }`}
            />
          </button>
        </nav>

        <div
          className={`border-t border-white/10 bg-black/95 md:hidden overflow-hidden transition-all duration-300 ease-out ${
            menuOpen ? "max-h-[min(70vh,24rem)] opacity-100" : "max-h-0 opacity-0"
          }`}
        >
          <div className="flex flex-col px-4 py-3 sm:px-6">
            {links.map(({ href, label }) => (
              <Link
                key={href}
                href={href}
                className="py-3 font-mono text-sm text-white/90 border-b border-white/5 last:border-0 hover:text-indigo-400 transition-colors"
                onClick={() => setMenuOpen(false)}
              >
                <span className="text-indigo-400/80">/</span>
                {label}
              </Link>
            ))}
          </div>
        </div>
      </header>

      {menuOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm md:hidden"
          onClick={() => setMenuOpen(false)}
        />
      )}
    </>
  );
};

export default Navbar;