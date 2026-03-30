"use client";

import { Typewriter } from "react-simple-typewriter";
import ProfilePic from "../assets/img/colores.png";
import Image from "next/image";

export default function HomeContent() {
  return (
    <div className="flex w-full max-w-6xl flex-col items-center justify-center gap-10 sm:flex-row sm:items-center sm:justify-between sm:gap-8 lg:gap-12">
      <div className="flex max-w-xl flex-col items-center text-center sm:items-start sm:text-left">
        <h1 className="mb-6 text-4xl font-bold text-white sm:text-5xl lg:text-6xl">
          <Typewriter
            words={["Hi there! I am Nat"]}
            loop={1}
            cursor
            cursorStyle="|"
            typeSpeed={70}
            deleteSpeed={50}
            delaySpeed={1000}
          />
        </h1>
        <p className="fade-in-up mb-6 text-2xl font-bold text-gray-300 sm:text-3xl lg:text-4xl">
          debugging in real life
        </p>
        <p className="fade-in-up text-lg text-gray-100 sm:text-xl lg:text-2xl">
          I&apos;m a computer science student with a passion for building innovative
          solutions.
        </p>
        <a
          href="/cv/Nataly_Jaya_CV_En.pdf"
          download="Nataly_Jaya_CV.pdf"
          className="fade-in-up mt-8 inline-flex rounded-md border-2 border-[rgba(255,255,255,0.8)] px-8 py-4 text-base font-semibold text-white transition duration-200 ease-in-out hover:bg-[rgba(255,255,255,0.1)] sm:px-12 sm:py-5 sm:text-lg"
        >
          Download CV
        </a>
      </div>

      <div className="fade-in-up flex shrink-0 justify-center sm:justify-end">
        <div className="relative h-[min(260px,70vw)] w-[min(260px,70vw)] sm:h-64 sm:w-64 md:h-[280px] md:w-[280px] lg:h-[300px] lg:w-[300px]">
          <Image
            src={ProfilePic}
            fill
            sizes="(max-width: 640px) 70vw, 300px"
            alt="Illustration next to the intro"
            className="object-cover"
            priority
          />
        </div>
      </div>
    </div>
  );
}
