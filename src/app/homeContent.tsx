"use client";

import { Typewriter } from 'react-simple-typewriter';
import oshawott from './assets/img/oshawott.jpg';
import Image from "next/image";

// const nameFunc = () => {}

export default function HomeContent() {
  return (
    <main className="flex flex-col gap-8 row-start-2 sm:flex-row sm:items-center justify-between w-full px-6">
      
      <div className="flex flex-col items-center sm:items-start">
        <h1 className="text-6xl font-bold text-center sm:text-left text-white">
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
        <p className="text-4xl font-bold text-center sm:text-left text-gray-300 fade-in-up">
          debugging in real life
        </p>
        <p className="text-2xl text-center sm:text-left text-gray-100 fade-in-up">
          I'm a computer science student with a passion for building innovative solutions.
        </p>
      </div>
      
      {/* Imagen Oshawott alineada a la derecha */}
      <div className=" flex-col-reverse self-center sm:self-middle ml-auto sm:ml-0 overflow-hidden rounded-md w-[300px] h-[300px] mr-64 ">
        <Image src={oshawott} width={300} height={300} alt="Oshawott" className="object-cover" />
      </div>
    </main>
  );
}
