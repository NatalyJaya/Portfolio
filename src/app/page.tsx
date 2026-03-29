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
      <div className="min-h-screen flex flex-col pb-20 gap-16 font-[family-name:var(--font-geist-sans)]">
          {/* Navbar en la parte superior */}
          <Navbar/>

          <div className="h-16" />

          {/* Sección principal con HomeContent */}
          <section id="home" className="flex-grow">
              <HomeContent />
          </section>

          {/* Sección About debajo de HomeContent */}
          <section id="about" className="flex-grow">
              <About />
          </section>

          {/* Sección Lenguajes debajo de HomeContent */}
          <section id="languages" className="flex-grow">
              <Languages />
          </section>

          {/* <section className="flex-grow">
              <Trajectory/>
          </section>
            */}

          <section id="projects" className="flex-grow">
          <Project />
          </section>

          <section id="contact" className="flex-grow">
              <Mail/>
          </section>
          {/* Footer en la parte inferior */}
          <Footer/>
      </div>
  );
}




