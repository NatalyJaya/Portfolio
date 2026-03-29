"use client";

import Navbar from "./main/navbar";
import Footer from "./main/footer";
import HomeContent from "./sections/homeContent";
import About from "./about/about";
import Languages from "./sections/languages";
import Mail from "NatalyJaya/app/sections/mail";
import Project from "NatalyJaya/app/sections/projects";

export default function Home() {
  return (
    <div
      className="min-h-dvh flex flex-col bg-neutral-950 pb-20 font-[family-name:var(--font-geist-sans)] text-white"
    >
      <Navbar />

      <div className="flex flex-1 flex-col pt-[var(--nav-scroll-offset)]">
        <section
          id="home"
          className="flex min-h-[calc(100dvh-var(--nav-scroll-offset))] flex-col justify-center px-4 py-12 sm:px-6 lg:mx-auto lg:w-full lg:max-w-6xl lg:px-8"
        >
          <HomeContent />
        </section>

        <main className="flex flex-col gap-16 sm:gap-20 lg:gap-24">
          <section id="about">
            <About />
          </section>

          <section id="languages">
            <Languages />
          </section>

          <section id="projects">
            <Project />
          </section>

        </main>

        <Footer />
      </div>
    </div>
  );
}
