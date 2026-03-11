"use Client";
import {projects} from "NatalyJaya/app/data/githubData";
import { useState } from "react";
import Image from "next/image";

export default function Project(){

    const [currentIndex, setCurrentIndex] = useState(0);

    const nextProject = () => {
        setCurrentIndex((prev) => (prev + 1) % projects.length);
    };

    const prevProject = () => {
        setCurrentIndex((prev) => (prev - 1 + projects.length) % projects.length);
    };

    const project = projects[currentIndex];

    return (
        
        <div className="text-4xl font-bold text-center  sm:text-left text-white mb-8 mx-[10%]">
            <h2 className="text-4xl font-bold mb-6">Github Projects</h2>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-stretch">

                {/* 2. Contenedor de Imagen con Flechas de Navegación */}
                <div className="md:col-span-2 relative group aspect-video min-h-[300px] rounded-2xl mask-y-to-90% overflow-hidden shadow-[0_20px_50px_rgba(0,0,0,0.5)] bg-gray-900">
                    <Image
                        src={project.image}
                        alt={project.title}
                        width={800} // Ajusta según necesites
                        height={500}
                        className="rounded-2xl shadow-lg object-cover w-full h-full transition-all duration-500"
                    />

                    <div
                        className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"/>
                    {/* Botones de navegación (Estilo carrusel) */}
                    <button
                        onClick={prevProject}
                        className="absolute left-4 top-1/2 -translate-y-1/2 bg-black/50 p-2 rounded-full hover:bg-black/80 transition"
                    >
                        ◀
                    </button>
                    <button
                        onClick={nextProject}
                        className="absolute right-4 top-1/2 -translate-y-1/2 bg-black/50 p-2 rounded-full hover:bg-black/80 transition"
                    >
                        ▶
                    </button>
                </div>

                {/* 3. Panel de Información */}
                <div className="text-black">
                    <div className="rounded-2xl bg-gray-200 h-full p-6 flex flex-col justify-between">
                        <div>
                            <div className="italic font-bold text-2xl mb-2">{project.title}</div>
                            <p className="text-sm mb-4">{project.description}</p>
                            <div className="flex flex-wrap gap-2 mb-4">
                                {project.tags.map((tag, i) => (
                                    <span key={i} className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded">
                                        {tag}
                                    </span>
                                ))}
                            </div>
                        </div>
                        <div className="text-xs text-gray-600 border-t border-gray-300 pt-2">
                            <strong>Motivo:</strong> {project.motive}
                        </div>
                    </div>
                </div>
            </div>

            {/* Indicadores (Los puntitos de abajo) */}
            <div className="flex justify-center gap-2 mt-4">
                {projects.map((_, i) => (
                    <button
                        key={i}
                        onClick={() => setCurrentIndex(i)}
                        className={`h-2 w-2 rounded-full transition-all ${currentIndex === i ? "bg-white w-6" : "bg-gray-500"}`}
                    />
                ))}
            </div>
        </div>
    );
}