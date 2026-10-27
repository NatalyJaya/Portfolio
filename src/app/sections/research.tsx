"use client";

import Accordion from "@/components/ui/accordion";
import { Microscope, Dna, HeartPulse, BookOpen } from "lucide-react";

export default function Research() {
  const researchItems = [
    {
      id: "comp-bio",
      title: "Computational Biology",
      defaultOpen: true,
      content: (
        <div className="space-y-3">
          <div className="flex items-start gap-3">
            <Dna className="w-5 h-5 text-cyan-400 mt-0.5" />
            <p className="text-white/60">
              Applying algorithms and data structures to analyze biological systems, protein structures, and genetic sequences.
            </p>
          </div>
          <p className="text-sm text-white/40 ml-8">
            Interested in: Sequence alignment, phylogenetic analysis, molecular dynamics simulation
          </p>
        </div>
      ),
    },
    {
      id: "genomics",
      title: "Genomics & Data Analysis",
      defaultOpen: true,
      content: (
        <div className="space-y-3">
          <div className="flex items-start gap-3">
            <Microscope className="w-5 h-5 text-purple-400 mt-0.5" />
            <p className="text-white/60">
              Processing large-scale genetic datasets using machine learning and statistical methods to extract meaningful biological insights.
            </p>
          </div>
          <p className="text-sm text-white/40 ml-8">
            Focus: RNA-seq analysis, variant calling, GWAS studies
          </p>
        </div>
      ),
    },
    {
      id: "ml-health",
      title: "ML for Healthcare",
      defaultOpen: false,
      content: (
        <div className="space-y-3">
          <div className="flex items-start gap-3">
            <HeartPulse className="w-5 h-5 text-emerald-400 mt-0.5" />
            <p className="text-white/60">
              Developing AI models for disease prediction, drug discovery, and medical imaging analysis.
            </p>
          </div>
          <p className="text-sm text-white/40 ml-8">
            Currently learning: Stanford AI in Healthcare Specialization
          </p>
        </div>
      ),
    },
  ];

  return (
    <section className="mx-auto max-w-6xl px-4 py-16 sm:px-6 lg:px-8">
      <h2 className="text-4xl font-bold text-white mb-8 sm:text-5xl" style={{ fontFamily: "var(--font-syne)" }}>
        /research-interests
      </h2>
      
      <Accordion items={researchItems} allowMultiple={true} />
      
      <div className="mt-6 p-4 rounded-lg bg-cyan-500/5 border border-cyan-500/20">
        <div className="flex items-start gap-3">
          <BookOpen className="w-5 h-5 text-cyan-400 mt-0.5" />
          <div>
            <p className="text-sm text-cyan-300">
              <span className="font-medium">Currently reading:</span> Papers on single-cell RNA analysis & protein structure prediction (AlphaFold)
            </p>
            <p className="text-xs text-white/40 mt-1">
              Planning bioinformatics TFG for 2025-2026
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}