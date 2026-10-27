"use client";

import { useState } from "react";

interface TimelineEvent {
  year: string;
  title: string;
  description: string;
  tags: string[];
}

const timelineEvents: TimelineEvent[] = [
  {
    year: "2021",
    title: "Bachibac - Start",
    description: "Comienzo del Bachillerato Francés-Español con especialización tecnológica.",
    tags: ["Bachillerato", "Francés"],
  },
  {
    year: "2022",
    title: "Bachibac - Year 2",
    description: "Continuación del programa dual. Preparación para selectividad y acceso a universidad.",
    tags: ["Bachillerato", "Tecnología"],
  },
  {
    year: "2023",
    title: "Universidad - 1º Curso",
    description: "Inicio del Grado en Ingeniería Informática en la Universidad de Lleida. Primeros proyectos en hackathons.",
    tags: ["Universidad", "Hackathons"],
  },
  {
    year: "2024",
    title: "Universidad - 2º Curso",
    description: "Profundización en programación y estructuras de datos. Participación en LAN Party Lleida. Primeros intereses en bioinformática.",
    tags: ["Universidad", "Proyectos"],
  },
  {
    year: "2025",
    title: "Universidad - 3º Curso (Actual)",
    description: "Especialización en bioinformatics. Preparando TFG en computational biology. Cursos de Stanford y KAUST.",
    tags: ["Universidad", "Bioinformatics", "TFG"],
  },
];

export default function Timeline() {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  return (
    <section className="mx-auto max-w-6xl px-4 py-16 sm:px-6 lg:px-8">
      <h2 className="text-4xl font-bold text-white mb-12 sm:text-5xl" style={{ fontFamily: "var(--font-syne)" }}>
        /timeline
      </h2>
      
      <div className="relative">
        <div className="absolute left-4 md:left-1/2 top-0 bottom-0 w-px bg-gradient-to-b from-cyan-500/0 via-cyan-500/50 to-cyan-500/0" />
        
        <div className="space-y-12">
          {timelineEvents.map((event, index) => {
            const isLeft = index % 2 === 0;
            const isHovered = hoveredIndex === index;
            
            return (
              <div
                key={event.year}
                className="relative flex items-center md:justify-center"
                onMouseEnter={() => setHoveredIndex(index)}
                onMouseLeave={() => setHoveredIndex(null)}
              >
                <div className="absolute left-4 md:left-1/2 w-4 h-4 rounded-full bg-neutral-900 border-2 border-cyan-500/50 transform -translate-x-1/2 z-10" 
                  style={{
                    boxShadow: isHovered ? "0 0 20px rgba(6, 182, 212, 0.6)" : "none",
                    transition: "all 0.3s ease"
                  }}
                />
                
                <div className={`ml-12 md:ml-0 md:w-5/12 ${isLeft ? "md:pr-8 md:text-right" : "md:pl-8"}`}>
                  <div 
                    className={`p-4 rounded-lg bg-white/5 border border-white/10 transition-all duration-300 cursor-default
                      ${isHovered ? "bg-white/10 border-cyan-500/30 -translate-y-1" : ""}`}
                  >
                    <span className="text-xs font-mono text-cyan-400 mb-2 block">{event.year}</span>
                    <h3 className="text-white font-semibold mb-2">{event.title}</h3>
                    <p className="text-sm text-white/60 mb-3">{event.description}</p>
                    <div className={`flex flex-wrap gap-2 ${isLeft ? "md:justify-end" : ""}`}>
                      {event.tags.map((tag) => (
                        <span key={tag} className="text-xs px-2 py-0.5 rounded-full bg-cyan-500/10 text-cyan-300/80 border border-cyan-500/20">
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
        
        <div className="absolute left-4 md:left-1/2 bottom-0 w-4 h-4 rounded-full bg-cyan-500/20 border-2 border-cyan-500 transform -translate-x-1/2 translate-y-1/2" />
      </div>
    </section>
  );
}