"use client";

import Navbar from "./navbar";
import Footer from "./footer"; // Importa el Footer
import HomeContent from "./homeContent"; // Importa el contenido principal



export default function Home() {
  return (
    <div className="grid grid-rows-[20px_1fr_20px] min-h-screen p-8 pb-20 gap-16 sm:p-20 font-[family-name:var(--font-geist-sans)]">
      <Navbar />
      
      <HomeContent />
      
      <Footer /> 
    </div>
  );
}



