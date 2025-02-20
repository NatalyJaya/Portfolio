"use client"

import { FaCircle } from "react-icons/fa";

export default function Trajectory() {
    const timeline = [
        { year: "2021", description: "French and Spanish baccalaureate" },
        { year: "2023", description: "Computer Science Career" },
        { year: "2022", description: "lorem Ipsum" },
    ];

    return (
        <div className="text-4xl font-bold text-center sm:text-left text-white mb-8 mx-[10%]">
            <h2 className="text-4xl font-bold mb-6">Trajectory</h2>
            <section className="flex flex-col items-center relative">
                <div className="w-1 bg-gray-300 absolute h-full left-1/2 transform -translate-x-1/2"></div>
                {timeline.map((event, index) => (
                    <div key={index} className="flex flex-col items-center mb-8 relative">
                        <div className="flex items-center gap-4">
                            <FaCircle className="text-gray-900 text-lg" />
                            <div className="bg-gray-800 text-white p-4 rounded-lg shadow-lg">
                                <h3 className="text-xl font-semibold">{event.year}</h3>
                                <p className="text-sm">{event.description}</p>
                            </div>
                        </div>
                    </div>
                ))}
            </section>
        </div>
    );
}