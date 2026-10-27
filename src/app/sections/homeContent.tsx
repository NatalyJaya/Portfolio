"use client";

import { Typewriter } from "react-simple-typewriter";
import ProfilePic from "../assets/img/colores.png";
import Image from "next/image";

export default function HomeContent() {
  return (
    <div className="flex w-full max-w-6xl flex-col items-center justify-center gap-10 sm:flex-row sm:items-center sm:justify-between sm:gap-8 lg:gap-12">
      <div className="flex max-w-xl flex-col items-center text-center sm:items-start sm:text-left">
        <h1 className="fade-in-up mb-6 text-4xl font-bold text-white sm:text-5xl lg:text-6xl" style={{ fontFamily: "var(--font-syne)" }}>
          <Typewriter
            words={["Hi there! I'm Nat"]}
            loop={1}
            cursor
            cursorStyle="|"
            typeSpeed={70}
            deleteSpeed={50}
            delaySpeed={1000}
          />
        </h1>
        <p className="fade-in-up delay-100 mb-4 text-2xl font-bold text-cyan-400/90 sm:text-3xl lg:text-4xl" style={{ fontFamily: "var(--font-syne)" }}>
          Decoding biological puzzles with code
        </p>
        <p className="fade-in-up delay-200 text-base text-white/70 sm:text-lg max-w-md">
          3rd year Computer Engineering student at University of Lleida, specializing in bioinformatics & computational biology.
        </p>
      </div>

      <div className="fade-in-up delay-300 flex shrink-0 justify-center sm:justify-end">
        <div className="relative h-[min(260px,70vw)] w-[min(260px,70vw)] sm:h-64 sm:w-64 md:h-[280px] md:w-[280px] lg:h-[300px] lg:w-[300px]">
          <Image
            src={ProfilePic}
            fill
            sizes="(max-width: 640px) 70vw, 300px"
            alt="Nataly Jaya - Computer Science Student"
            className="object-cover rounded-2xl"
            priority
          />
        </div>
      </div>
    </div>
  );
}