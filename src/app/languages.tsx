"use client";
import Image from "next/image";
import html from "./assets/img/html.png";
import java from "./assets/img/java.png";
import javascript from "./assets/img/javascript.png";
import python from "./assets/img/python.png";
import react from "./assets/img/react.png";
import tailwind_css from "./assets/img/tailwind_css.png";
import css from "./assets/img/css.png";
import nextjs from "./assets/img/nextjs.png"


export default function Languages() {
    const images = [
        { name: "HTML", src: html },
        { name: "Java", src: java },
        { name: "JavaScript", src: javascript },
        { name: "Python", src: python },
        { name: "React", src: react },
        { name: "Tailwind", src: tailwind_css },
        { name: "CSS", src: css },
        { name: "Next.js", src: nextjs },
    ];

    return (
        <div className="ml-64 text-4xl font-bold text-center  sm:text-left text-white mb-8 mr-64">
            <h2 className="text-4xl font-bold mb-6">Languages</h2>
            <section className="flex flex-wrap justify-center gap-4 p-4 items-center ">
                {images.map((i, index) => (
                    <div key={index} className=" p-2 rounded-lg shadow-lg transition-transform duration-300 ease-in-out hover:scale-105">
                        <Image 
                            src={i.src} 
                            alt={i.name} 
                            width={100} 
                            height={100}
                            className="object-contain"
                        />
                        <p className="text-center mt-2 text-sm text-white font-medium">{i.name}</p>
                    </div>
                ))}
            </section>
        </div>
    );
}
