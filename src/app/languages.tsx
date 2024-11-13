"use client";
import Image from "next/image";
import github from "./assets/img/github.png";
import html from "./assets/img/html.png";
import java from "./assets/img/java.png";
import javascript from "./assets/img/javascript.png";
import python from "./assets/img/python.png";
import react from "./assets/img/react.png";
import tailwind_css from "./assets/img/tailwind_css.png";

export default function Languages() {
    const images = [
        { name: "GitHub", src: github },
        { name: "HTML", src: html },
        { name: "Java", src: java },
        { name: "JavaScript", src: javascript },
        { name: "Python", src: python },
        { name: "React", src: react },
        { name: "Tailwind", src: tailwind_css },
    ];

    return (
        <div className="ml-64 text-4xl font-bold text-center sm:text-left text-white mb-8">
            <h2 className="text-4xl font-bold mb-6">Languages</h2>
            <section className="flex flex-wrap justify-center gap-4 p-4">
                {images.map((i, index) => (
                    <div key={index} className="p-2 rounded-lg shadow-lg transition-transform duration-300 ease-in-out hover:scale-105">
                        <Image 
                            src={i.src} 
                            alt={i.name} 
                            width={100} 
                            height={100}
                            className="object-contain"
                        />
                        <p className="text-center mt-2 text-sm text-black font-medium">{i.name}</p>
                    </div>
                ))}
            </section>
        </div>
    );
}
