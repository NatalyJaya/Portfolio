"use client";

import Navbar from "./navbar";
import Footer from "./footer";
import HomeContent from "./homeContent";
import About from "./about";
import Languages from "./languages";

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col  p-8 pb-20 gap-16 sm:p-20 font-[family-name:var(--font-geist-sans)]">
      {/* Navbar en la parte superior */}
      <Navbar />
      
      {/* Sección principal con HomeContent */}
      <section className="flex-grow">
        <HomeContent />
      </section>

      {/* Sección About debajo de HomeContent */}
      <section className="flex-grow">
        <About />
      </section>

      {/* Sección About debajo de HomeContent */}
      <section className="flex-grow">
        <Languages />
      </section>

      {/* Footer en la parte inferior */}
      <Footer />
    </div>
  );
}




