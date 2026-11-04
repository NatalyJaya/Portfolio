import Navbar from "@/components/layout/Navbar";
import RevealObserver from "@/components/ui/RevealObserver";
import Hero from "@/components/sections/Hero";
import About from "@/components/sections/About";
import Projects from "@/components/sections/Projects";
import Notebooks from "@/components/sections/Notebooks";
import Skills from "@/components/sections/skills/Skills";
import Writing from "@/components/sections/Writing";
import Journey from "@/components/sections/Journey";
import Contact from "@/components/sections/Contact";

export default function Home() {
  return (
    <>
      <Navbar />
      <Hero />
      <main id="main">
        <About />
        <Projects />
        <Notebooks />
        <Skills />
        <Writing />
        <Journey />
      </main>
      <Contact />
      <RevealObserver />
    </>
  );
}
