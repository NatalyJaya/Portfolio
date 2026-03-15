"use client";
import React, { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

const links = [
  { href: "#home", label: "home" },
  { href: "#about", label: "about" },
  { href: "#languages", label: "languages" },
  { href: "#projects", label: "projects" },
  { href: "#contact", label: "contact" },
];

const Navbar = () => {
  const pathname = usePathname();
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
const [activeSection, setActiveSection] = useState("home");

useEffect(() => {
  const handleScroll = () => {
    const sections = ["home", "about", "languages", "projects", "contact"];
    const reversed = [...sections].reverse();
    for (const id of reversed) {
      const el = document.getElementById(id);
      if (el && window.scrollY >= el.offsetTop - 100) {
        setActiveSection(id);
        break;
      }
    }
  };
  window.addEventListener("scroll", handleScroll);
  return () => window.removeEventListener("scroll", handleScroll);
}, []);

  return (
    <nav
      className={`fixed top-0 w-full z-50 transition-all duration-500 ${
        scrolled
          ? "py-3 bg-black/60 backdrop-blur-xl border-b border-white/10"
          : "py-5 bg-transparent"
      }`}
    >
      <div className="mx-[10%] flex items-center justify-between">
        {/* Logo / nombre */}
        <span
          className="text-white font-bold text-lg tracking-tight"
          style={{ fontFamily: "'Syne', sans-serif" }}
        >
          NJ<span className="text-indigo-400">.</span>
        </span>

        {/* Links desktop */}
        <div className="hidden md:flex items-center gap-1">
          {links.map(({ href, label }) => {
            const isActive = activeSection === label;
            return (
              <Link
                key={href}
                href={href}
                className={`relative px-4 py-2 text-sm font-mono tracking-wide transition-all duration-200 rounded-lg group ${
                  isActive
                    ? "text-white"
                    : "text-white/45 hover:text-white"
                }`}
              >
                <span className="text-indigo-400/70 group-hover:text-indigo-400 transition-colors duration-200">
                  /
                </span>
                {label}
                {/* Underline activo */}
                {isActive && (
                  <span className="absolute bottom-1 left-4 right-4 h-px bg-indigo-400/60 rounded-full" />
                )}
              </Link>
            );
          })}
        </div>

        {/* Burger mobile */}
        <button
          onClick={() => setMenuOpen(!menuOpen)}
          className="md:hidden flex flex-col gap-1.5 p-2 group"
          aria-label="Toggle menu"
        >
          <span
            className={`block h-px w-5 bg-white/70 transition-all duration-300 ${
              menuOpen ? "rotate-45 translate-y-2" : ""
            }`}
          />
          <span
            className={`block h-px w-5 bg-white/70 transition-all duration-300 ${
              menuOpen ? "opacity-0" : ""
            }`}
          />
          <span
            className={`block h-px w-5 bg-white/70 transition-all duration-300 ${
              menuOpen ? "-rotate-45 -translate-y-2" : ""
            }`}
          />
        </button>
      </div>

      {/* Menú mobile */}
      <div
        className={`md:hidden transition-all duration-300 overflow-hidden ${
          menuOpen ? "max-h-64 opacity-100" : "max-h-0 opacity-0"
        }`}
      >
        <div className="mx-[10%] py-4 flex flex-col gap-1 border-t border-white/10 mt-3">
          {links.map(({ href, label }) => {
            const isActive = activeSection === label;
            return (
              <Link
                key={href}
                href={href}
                onClick={() => setMenuOpen(false)}
                className={`px-3 py-2 text-sm font-mono rounded-lg transition-colors duration-200 ${
                  isActive
                    ? "text-white bg-white/5"
                    : "text-white/45 hover:text-white hover:bg-white/5"
                }`}
              >
                <span className="text-indigo-400/70">/</span>
                {label}
              </Link>
            );
          })}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;