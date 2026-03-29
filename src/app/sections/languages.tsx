"use client";
import Image, {StaticImageData} from "next/image";
import html from "../assets/img/html.png";
import java from "../assets/img/java.png";
import javascript from "../assets/img/javascript.png";
import python from "../assets/img/python.png";
import react from "../assets/img/react.png";
import tailwind_css from "../assets/img/tailwind_css.png";
import css from "../assets/img/css.png";
import nextjs from "../assets/img/nextjs.png"


// Crear una estructura de objeto x lenguaje
interface LanguageItem {
    name: string;
    src: StaticImageData;
}


export default function Languages() {

    //
    function sliceArray<T>(arr: T[], n: number): T[][] {
        const result: T[][] = [];
        for (let i = 0; i < arr.length; i += n) {
            result.push(arr.slice(i, i + n));
        }
        return result;
    }

    const all_images = sliceArray<LanguageItem>([
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
        <div className="mx-auto mb-8 max-w-6xl px-4 text-center text-4xl font-bold text-white sm:text-left sm:px-6 lg:px-8">
            <h2 className="mb-6 text-4xl font-bold">Languages</h2>
            <section className="flex flex-col items-center justify-center gap-4 py-4">
                {all_images.map((image_line,index) => (
                    <div key={index} className="flex flex-row flex-wrap justify-center gap-6 p-2 sm:gap-10 sm:p-4 md:gap-16">
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
