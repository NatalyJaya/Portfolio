"use client";
import Image from "next/image";
import html from "../assets/img/html.png";
import java from "../assets/img/java.png";
import javascript from "../assets/img/javascript.png";
import python from "../assets/img/python.png";
import react from "../assets/img/react.png";
import tailwind_css from "../assets/img/tailwind_css.png";
import css from "../assets/img/css.png";
import nextjs from "../assets/img/nextjs.png"


export default function Languages() {
    function sliceArray(arr: any[], n: number): any[][] {
        const result: any[][] = [];
        for (let i = 0; i < arr.length; i += n) {
            result.push(arr.slice(i, i + n));
        }
        return result;
    }

    const all_images = sliceArray([
        { name: "Java", src: java },
        { name: "Python", src: python },
        { name: "JavaScript", src: javascript },
        { name: "HTML", src: html },
        { name: "CSS", src: css },
        { name: "Tailwind", src: tailwind_css },
        { name: "React", src: react },
        { name: "Next.js", src: nextjs },
    ],3);

    return (
        <div className="text-4xl font-bold text-center  sm:text-left text-white mb-8 mx-[10%]">
            <h2 className="text-4xl font-bold mb-6">Languages</h2>
            <section className="flex flex-col justify-center gap-4 py-4 items-center ">
                {all_images.map((image_line,index) => (
                    <div key={index} className="flex flex-row justify-center gap-16 p-4 items-center ">
                        {image_line.map((i, index) => (
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
                    </div>
                ))}
            </section>
        </div>
    );
}
