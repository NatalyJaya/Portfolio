"use client";

import Accordion from "@/components/ui/accordion";
import { GraduationCap, Award, BookOpen } from "lucide-react";

export default function Education() {
  const educationItems = [
    {
      id: "uni",
      title: "Universidad de Lleida",
      defaultOpen: true,
      content: (
        <div className="space-y-4">
          <div className="flex items-start gap-3">
            <GraduationCap className="w-5 h-5 text-cyan-400 mt-0.5" />
            <div>
              <p className="text-white font-medium">Grado en Ingeniería Informática</p>
              <p className="text-sm text-white/50">2023 - Actualidad (3º Curso)</p>
            </div>
          </div>
          <div className="ml-8 space-y-2">
            <p className="text-sm text-white/60">
              <span className="text-cyan-400">Relevant coursework:</span> Estructura de Datos, Algoritmos, Redes, Sistemas Operativos, Programación Orientada a Objetos, Base de Datos
            </p>
            <p className="text-sm text-white/60">
              <span className="text-cyan-400">Focus:</span> Software Engineering & Bioinformatics
            </p>
          </div>
        </div>
      ),
    },
    {
      id: "courses",
      title: "Cursos en Progreso",
      defaultOpen: true,
      content: (
        <div className="space-y-4">
          <div className="flex items-start gap-3">
            <BookOpen className="w-5 h-5 text-amber-400 mt-0.5" />
            <div>
              <p className="text-white font-medium">AI in Healthcare Specialization</p>
              <p className="text-sm text-amber-400/80">Stanford University • En progreso (2/4 courses)</p>
            </div>
          </div>
          <div className="ml-8">
            <p className="text-sm text-white/50">
              Focusing on AI applications in medical research and healthcare systems.
            </p>
          </div>
          <div className="flex items-start gap-3">
            <BookOpen className="w-5 h-5 text-purple-400 mt-0.5" />
            <div>
              <p className="text-white font-medium">Fundamental Skills in Bioinformatics</p>
              <p className="text-sm text-purple-400/80">KAUST (King Abdullah University) • En progreso</p>
            </div>
          </div>
          <div className="ml-8">
            <p className="text-sm text-white/50">
              Introduction to computational biology and bioinformatics tools.
            </p>
          </div>
        </div>
      ),
    },
    {
      id: "bachibac",
      title: "Bachibac (2021-2023)",
      defaultOpen: false,
      content: (
        <div className="space-y-4">
          <div className="flex items-start gap-3">
            <Award className="w-5 h-5 text-emerald-400 mt-0.5" />
            <div>
              <p className="text-white font-medium">Bachillerato Français - Especialidad Tecnológica</p>
              <p className="text-sm text-white/50">Dual diploma: Francés + Español</p>
            </div>
          </div>
          <div className="ml-8">
            <ul className="text-sm text-white/60 space-y-1">
              <li>• Especialidad en Tecnología y Ciencias</li>
              <li>• Bilingüe Francés-Español</li>
              <li>• Preparación para estudios técnicos superiores</li>
            </ul>
          </div>
        </div>
      ),
    },
  ];

  return (
    <section className="mx-auto max-w-6xl px-4 py-16 sm:px-6 lg:px-8">
      <h2 className="text-4xl font-bold text-white mb-8 sm:text-5xl" style={{ fontFamily: "var(--font-syne)" }}>
        /education
      </h2>
      <Accordion items={educationItems} allowMultiple={true} />
    </section>
  );
}