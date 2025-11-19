"use client";

import Navbar from "./navbar";
import Footer from "./footer";
import HomeContent from "./homeContent";
import About from "./about";
import Languages from "./languages";
import Mail from "NatalyJaya/app/mail";
import Trajectory from "./trajectory";
import Project from "NatalyJaya/app/projects";

export default function Home() {
  return (
      <div className="min-h-screen flex flex-col  p-8 pb-20 gap-16 sm:p-20 font-[family-name:var(--font-geist-sans)]">
          {/* Navbar en la parte superior */}
          <Navbar/>

          {/* Sección principal con HomeContent */}
          <section className="flex-grow">
              <HomeContent/>
          </section>

          {/* Sección About debajo de HomeContent */}
          <section className="flex-grow">
              <About/>
          </section>

          {/* Sección About debajo de HomeContent */}
          <section className="flex-grow">
              <Languages/>
          </section>

          {/* <section className="flex-grow">
              <Trajectory/>
          </section>
            */}

          <section className="flex-grow">
          <Project/>
          </section>

          <section className="flex-grow">
              <Mail/>
          </section>
          {/* Footer en la parte inferior */}
          <Footer/>
      </div>
  );
}




