"use client";

import Accordion from "@/components/ui/accordion";
import { Languages as LanguagesIcon, Code2, Wrench } from "lucide-react";
import Image, { StaticImageData } from "next/image";
import java from "../assets/img/java.png";
import python from "../assets/img/python.png";
import javascript from "../assets/img/javascript.png";
import html from "../assets/img/html.png";
import css from "../assets/img/css.png";
import tailwind_css from "../assets/img/tailwind_css.png";
import react from "../assets/img/react.png";
import nextjs from "../assets/img/nextjs.png";

interface LanguageItem {
  name: string;
  src: StaticImageData;
}

export default function Languages() {
  const languagesItems = [
    {
      id: "idiomas",
      title: "Idiomas",
      defaultOpen: true,
      content: (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="p-3 rounded-lg bg-white/5 border border-white/10 text-center">
            <p className="text-white font-medium">Español</p>
            <p className="text-sm text-cyan-400">Nativo</p>
          </div>
          <div className="p-3 rounded-lg bg-white/5 border border-white/10 text-center">
            <p className="text-white font-medium">Catalán</p>
            <p className="text-sm text-cyan-400">Nativo</p>
          </div>
          <div className="p-3 rounded-lg bg-white/5 border border-white/10 text-center">
            <p className="text-white font-medium">Inglés</p>
            <p className="text-sm text-amber-400">B2</p>
          </div>
          <div className="p-3 rounded-lg bg-white/5 border border-white/10 text-center">
            <p className="text-white font-medium">Francés</p>
            <p className="text-sm text-amber-400">B2</p>
          </div>
        </div>
      ),
    },
    {
      id: "programming",
      title: "Programming Languages",
      defaultOpen: true,
      content: (
        <div className="grid grid-cols-3 md:grid-cols-6 gap-4">
          {[
            { name: "Python", src: python },
            { name: "Java", src: java },
            { name: "JavaScript", src: javascript },
            { name: "HTML", src: html },
            { name: "CSS", src: css },
            { name: "React", src: react },
          ].map((lang) => (
            <div key={lang.name} className="flex flex-col items-center p-3 rounded-lg bg-white/5 border border-white/10 hover:border-cyan-500/30 hover:bg-white/10 transition-all duration-200">
              <Image src={lang.src} alt={lang.name} width={40} height={40} className="object-contain mb-2" />
              <p className="text-xs text-white/70">{lang.name}</p>
            </div>
          ))}
        </div>
      ),
    },
    {
      id: "frameworks",
      title: "Frameworks & Tools",
      defaultOpen: false,
      content: (
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {[
            { name: "React", category: "Frontend" },
            { name: "Next.js", category: "Framework" },
            { name: "Tailwind CSS", category: "Styling" },
            { name: "Git", category: "Version Control" },
            { name: "Docker", category: "DevOps" },
            { name: "Linux", category: "OS" },
            { name: "Jupyter", category: "Data Science" },
            { name: "TensorFlow", category: "ML" },
          ].map((tool) => (
            <div key={tool.name} className="flex items-center justify-between p-3 rounded-lg bg-white/5 border border-white/10 hover:border-cyan-500/30 hover:bg-white/10 transition-all duration-200">
              <span className="text-white text-sm">{tool.name}</span>
              <span className="text-xs text-white/40">{tool.category}</span>
            </div>
          ))}
        </div>
      ),
    },
  ];

  return (
    <section className="mx-auto max-w-6xl px-4 py-16 sm:px-6 lg:px-8">
      <h2 className="text-4xl font-bold text-white mb-8 sm:text-5xl" style={{ fontFamily: "var(--font-syne)" }}>
        /languages
      </h2>
      <Accordion items={languagesItems} allowMultiple={true} />
    </section>
  );
}