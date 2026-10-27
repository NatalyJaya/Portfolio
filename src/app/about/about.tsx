"use client";

import Image from "next/image";
import imgAbout from "../assets/img/ImgAbout.png";
import { ArrowRight, Github, Mail } from "lucide-react";

export default function About() {
  return (
    <section className="mx-auto max-w-6xl px-4 py-16 sm:px-6 lg:px-8">
      <h2 className="text-4xl font-bold text-white mb-8 sm:text-5xl" style={{ fontFamily: "var(--font-syne)" }}>
        /about
      </h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-start">
        <div className="space-y-6">
          <p className="text-lg text-white/80 leading-relaxed">
            I'm a <span className="text-cyan-400">3rd year Computer Engineering student</span> at the University of Lleida, passionate about bridging computer science with biological research.
          </p>
          
          <p className="text-white/60">
            My background includes the <span className="text-white">Bachibac program</span> (French-Spanish bilingual high school diploma with technology specialization), which gave me a solid foundation in both languages and technical skills.
          </p>
          
          <p className="text-white/60">
            Currently, I'm exploring the intersection where <span className="text-cyan-400">code meets DNA</span>. I'm preparing my TFG in bioinformatics, focusing on computational biology and machine learning applications in genomics.
          </p>
          
          <div className="pt-4">
            <h3 className="text-white font-medium mb-4">Current Focus</h3>
            <ul className="space-y-3">
              <li className="flex items-center gap-3 text-white/60">
                <ArrowRight className="w-4 h-4 text-cyan-400" />
                <span>TFG in Computational Biology (2025-2026)</span>
              </li>
              <li className="flex items-center gap-3 text-white/60">
                <ArrowRight className="w-4 h-4 text-cyan-400" />
                <span>AI in Healthcare & Bioinformatics courses</span>
              </li>
              <li className="flex items-center gap-3 text-white/60">
                <ArrowRight className="w-4 h-4 text-cyan-400" />
                <span>Building multi-agent systems (personal project)</span>
              </li>
              <li className="flex items-center gap-3 text-white/60">
                <ArrowRight className="w-4 h-4 text-cyan-400" />
                <span>Reading papers on single-cell RNA analysis</span>
              </li>
            </ul>
          </div>
          
          <div className="flex gap-4 pt-4">
            <a
              href="https://github.com/NatalyJaya"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 text-sm text-white/60 hover:text-cyan-400 transition-colors"
            >
              <Github className="w-4 h-4" />
              <span>github.com/NatalyJaya</span>
            </a>
            <a
              href="mailto:natvlyjs@gmail.com"
              className="flex items-center gap-2 text-sm text-white/60 hover:text-cyan-400 transition-colors"
            >
              <Mail className="w-4 h-4" />
              <span>natvlyjs@gmail.com</span>
            </a>
          </div>
        </div>
        
        <div className="flex justify-center md:justify-end">
          <div className="relative w-[280px] h-[280px] md:w-[320px] md:h-[320px] group">
            <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-cyan-500/20 via-transparent to-purple-500/20 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            <div className="absolute inset-0 rounded-2xl ring-1 ring-white/10 group-hover:ring-cyan-500/30 transition-all duration-500" />
            <Image 
              src={imgAbout} 
              alt="About Nataly Jaya" 
              className="w-full h-full object-cover rounded-2xl grayscale group-hover:grayscale-0 transition-all duration-700"
              priority
            />
          </div>
        </div>
      </div>
    </section>
  );
}