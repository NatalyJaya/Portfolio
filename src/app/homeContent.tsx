"use client";

import { Typewriter } from 'react-simple-typewriter';

export default function HomeContent() {
  return (
    <main className="flex flex-col gap-8 row-start-2 items-center sm:items-start justify-center">
      <h1 className="text-6xl font-bold text-center sm:text-left text-[white]">
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
    </main>
  );
}
