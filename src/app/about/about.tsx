"use client";
import Image from "next/image";
import imgAbout from "../assets/img/ImgAbout.jpg";

export default function About() {
  return (
    <section className="fade-in-up mx-auto flex max-w-6xl flex-col items-center px-4 sm:flex-row sm:items-start sm:px-6 lg:px-8">
      <div className="sm:w-[50%] p-4">
        <h2 className="text-6xl font-bold text-center sm:text-left text-white mb-8">
          /about
        </h2>
        <hr className="border-t-2 border-[#f5f5dc] w-full" />
        <p className="text-xl mb-8">

          <br /> I am a third-year Computer Engineering student at the University of Lleida, passionate about software development and cybersecurity. I enjoy diving deep into how things truly work, pushing myself to understand complex systems and turning that curiosity into practical, meaningful solutions.

A tech enthusiast committed to continuous learning, I like taking on challenges that push me beyond my comfort zone. My goal is to help build a digital world that is more efficient, innovative, and secure.
        </p>
      </div>
      <div className="flex justify-center sm:w-[50%] p-4">
        <div className="w-[300px] h-[300px] overflow-hidden rounded-md fade-in-up mt-20">
          <Image src={imgAbout} alt="About" className="w-full h-full object-cover" />
        </div>
      </div>
    </section>
  );
}




