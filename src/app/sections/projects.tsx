"use client";
import { projects } from "NatalyJaya/app/data/githubData";
import { useState } from "react";
import Image from "next/image";

export default function Project() {
  const [currentIndex, setCurrentIndex] = useState(0);

  const nextProject = () => {
    setCurrentIndex((prev) => (prev + 1) % projects.length);
  };
  const prevProject = () => {
    setCurrentIndex((prev) => (prev - 1 + projects.length) % projects.length);
  };

  const project = projects[currentIndex];

  return (
    <div className="mx-[10%] mb-8">
      {/* Header */}
      <div className="flex items-center gap-4 mb-8">
        <h2
          className="text-4xl font-bold text-white tracking-tight"
          style={{ fontFamily: "'Syne', sans-serif" }}
        >
          Github Projects
        </h2>
        
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-5 items-stretch">
        {/* Imagen con flechas */}
        <div className="md:col-span-2 relative group aspect-video min-h-[300px] rounded-2xl overflow-hidden">
          {/* Glow de fondo */}
          <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-indigo-500/10 to-purple-600/10 blur-xl scale-105 -z-10" />

          <Image
            src={project.image}
            alt={project.title}
            width={800}
            height={500}
            className="rounded-2xl object-cover w-full h-full transition-all duration-700"
          />

          {/* Overlay hover */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-2xl" />

          {/* Borde sutil */}
          <div className="absolute inset-0 rounded-2xl ring-1 ring-white/10 pointer-events-none" />

          {/* Botones de navegación */}
          <button
            onClick={prevProject}
            className="absolute left-3 top-1/2 -translate-y-1/2 w-9 h-9 flex items-center justify-center rounded-full bg-black/40 backdrop-blur-md border border-white/10 text-white/70 hover:text-white hover:bg-black/70 hover:border-white/25 transition-all duration-200 text-sm"
          >
            ‹
          </button>
          <button
            onClick={nextProject}
            className="absolute right-3 top-1/2 -translate-y-1/2 w-9 h-9 flex items-center justify-center rounded-full bg-black/40 backdrop-blur-md border border-white/10 text-white/70 hover:text-white hover:bg-black/70 hover:border-white/25 transition-all duration-200 text-sm"
          >
            ›
          </button>
        </div>

        {/* Panel de información */}
        <div className="rounded-2xl bg-white/5 backdrop-blur-xl border border-white/10 h-full p-6 flex flex-col justify-between text-white">
          <div>
            {/* Número decorativo */}
            <span className="text-xs font-mono text-white/25 tracking-widest uppercase mb-3 block">
              Project
            </span>

            <h3
              className="font-bold text-2xl mb-3 text-white leading-tight"
              style={{ fontFamily: "'Syne', sans-serif" }}
            >
              {project.title}
            </h3>

            <p className="text-sm text-white/60 mb-5 leading-relaxed">
              {project.description}
            </p>

            {/* Tags */}
            <div className="flex flex-wrap gap-2 mb-5">
              {project.tags.map((tag, i) => (
                <span
                  key={i}
                  className="text-xs px-2.5 py-1 rounded-full bg-indigo-500/15 text-indigo-300 border border-indigo-400/20 font-medium tracking-wide"
                >
                  {tag}
                </span>
              ))}
            </div>
          </div>

          {/* Motivo */}
          <div className="border-t border-white/10 pt-4">
            <p className="text-xs text-white/35 uppercase tracking-widest mb-1 font-mono">
              Motive
            </p>
            <p className="text-sm text-white/60 leading-relaxed">
              {project.motive}
            </p>
          </div>
        </div>
      </div>

      {/* Indicadores */}
      <div className="flex justify-center gap-2 mt-6">
        {projects.map((_, i) => (
          <button
            key={i}
            onClick={() => setCurrentIndex(i)}
            className={`h-1.5 rounded-full transition-all duration-300 ${
              currentIndex === i
                ? "bg-indigo-400 w-7"
                : "bg-white/20 w-1.5 hover:bg-white/40"
            }`}
          />
        ))}
      </div>
    </div>
  );
}