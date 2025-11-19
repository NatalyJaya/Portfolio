"use client";

import Navbar from "./main/navbar";
import Footer from "./main/footer";
import HomeContent from "./sections/homeContent";
import About from "./sections/about";
import Languages from "./sections/languages";
import Mail from "NatalyJaya/app/sections/mail";
import Project from "NatalyJaya/app/sections/projects";

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




