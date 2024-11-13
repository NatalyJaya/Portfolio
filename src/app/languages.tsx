"use client";
import Image  from 'next/image';
import github from './assets/img/github.png'
import html from './assets/img/html.png'
import java from './assets/img/java.png'
import javascript from './assets/img/javascript.png'
import python from './assets/img/python.png'
import react from './assets/img/react.png'
import tailwind_css from './assets/img/tailwind_css.png'




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
        languages
        {images.map((i, index) => (
            <Image 
                key={index} 
                src={i.src} 
                alt="Descripción de la imagen" // Reemplaza con una descripción adecuada
                width={100} // Ajusta el tamaño según lo necesites
                height={100}
            />
        ))}
    </div>
);

        
    

}