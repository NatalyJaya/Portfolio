"use client";

import Navbar from "./navbar"
import Image from "next/image";
import instagram from './assets/img/instagram.png'
import linkedin from './assets/img/linkedin.png'
import github from './assets/img/github.png'
import gmail from './assets/img/gmail.png'
import { Typewriter } from 'react-simple-typewriter'; 
import {Roboto} from 'next/font/google'

const roboto = Roboto({
  subsets: ['latin'],
  weight: '400',
});

export default function Home() {
  return (
    <div className="grid grid-rows-[20px_1fr_20px]  min-h-screen p-8 pb-20 gap-16 sm:p-20 font-[family-name:var(--font-geist-sans)]">
    <Navbar />
      
        <main className="flex flex-col gap-8 row-start-2 items-center sm:items-start  justify-center">
          
        <h1 className="text-6xl font-bold text-center sm:text-left text-[white] ">
            <Typewriter
              words={['Hi there! I am Nat']}
              loop={1}                 
              cursor
              cursorStyle="|"             
              typeSpeed={70}              
              deleteSpeed={50}            
              delaySpeed={1000}
                        
            />
          </h1>
          <p className={`text-4xl font-bold text-center sm:text-left text-gray-300 fade-in-up `}>
            debugging in real life
          </p>
          <p className="text-2xl text-center sm:text-left text-gray-100 fade-in-up">
            I'm a computer science student with a passion for building innovative solutions.
          </p>
        
       
        
    

      </main>
      
      <footer className="row-start-3 flex gap-6 flex-wrap items-center justify-center">         
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

