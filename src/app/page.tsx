"use client";


import Image from "next/image";
import instagram from './assets/img/instagram.png'
import linkedin from './assets/img/linkedin.png'
import github from './assets/img/github.png'
import gmail from './assets/img/gmail.png'
import { Typewriter } from 'react-simple-typewriter'; 

export default function Home() {
  return (
    <div className="grid grid-rows-[20px_1fr_20px] items-center justify-items-center min-h-screen p-8 pb-20 gap-16 sm:p-20 font-[family-name:var(--font-geist-sans)]">
      <main className="flex flex-col gap-8 row-start-2 items-center sm:items-start">
        <h1 className="text-6xl font-bold text-center sm:text-left text-[white]">
        <Typewriter
            words={['Hi there! I am Nat']}
            loop={1}                 // Para repetir el efecto en bucle
            cursor                      // Muestra el cursor de tipeo
            cursorStyle="|"             // Define el estilo del cursor (opcional)
            typeSpeed={70}              // Velocidad de tipeo
            deleteSpeed={50}            // Velocidad de borrado
            delaySpeed={1000}           // Retraso entre las palabras

          />
        </h1>
    

      </main>
      <footer className="row-start-3 flex gap-6 flex-wrap items-center justify-center">
        {/* <a
          className="flex items-center gap-2 hover:underline hover:underline-offset-4"
          href="https://nextjs.org/learn?utm_source=create-next-app&utm_medium=appdirs-template-tw&utm_campaign=create-next-app"
          target="_blank"
          rel="noopener noreferrer"
        > */}
         
         
         <a
          href="https://www.instagram.com/natvlyjs/"
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-2 hover:underline hover:underline-offset-4"
        >
          <Image src={instagram} width={20} height={20} alt="Instagram icon" /> Instagram
        </a>
         <a
          href="https://www.instagram.com/natvlyjs/"
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-2 hover:underline hover:underline-offset-4"
          >
         <Image src={linkedin} width={20}  height={20} alt="Linkedn icon"          /> Linkedin
         
         </a>
         
          <a
            href="https://github.com/NatalyJaya"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 hover:underline hover:underline-offset-4"
          >
            <Image src={github} width={20} height={20} alt="Github icon" /> Github
          </a>         

          <a
          href="https://github.com/NatalyJaya"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 hover:underline hover:underline-offset-4"
          >
            <Image src={gmail} width={20} height={20} alt="Mail icon" /> Gmail
          </a>      
          
         
        
        <a
          className="flex items-center gap-2 hover:underline hover:underline-offset-4"
          href="https://vercel.com/templates?framework=next.js&utm_source=create-next-app&utm_medium=appdir-template-tw&utm_campaign=create-next-app"
          target="_blank"
          rel="noopener noreferrer"
        >
         
        </a>
      </footer>
    </div>
  );
}

