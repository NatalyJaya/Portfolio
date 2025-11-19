"use client";
//import "react-vertical-timeline-component/style.min.css";


export default function Trajectory() {
    const timeline = [
        { year: "2021", description: "French and Spanish Baccalaureat" },
        { year: "2023", description: "Computer Science Degree" },
        { year: "202X", description: "Lorem Ipsum." }
    ];

    return (
        <div className="text-4xl font-bold text-center sm:text-left text-white mb-8 mx-[10%]">
            <h2 className="text-4xl font-bold mb-6">Trajectory</h2>
            <section className="flex flex-col items-center relative">
                <div className="w-1 bg-gray-300 absolute h-full left-1/2 transform -translate-x-1/2"></div>
                {timeline.map((event, index) => (
                    <div key={index} className="flex flex-col items-center mb-8 relative">
                        <div className="flex items-center gap-4">
                            <div className="bg-gray-800 text-white p-4 rounded-lg shadow-lg" style={{ width: "210px", height: "100px" }}>
                                <h3 className="text-xl font-semibold">{event.year}</h3>
                                <p className="text-sm">{event.description}</p>
                            </div>
                        </div>
                        {index === timeline.length - 2 && (
                            <div className="flex justify-center w-full mt-4">
                                <div className="bg-gray-600 text-white p-4 rounded-lg shadow-lg border-dashed border-2 border-gray-400 space-between" style={{ width: "210px", height: "80px" }}>
                                    <h3 className="text-xl font-semibold">
                                        <p className="italic">WINNER</p> HackUAB 2024
                                    </h3>
                                </div>
                                <div className="bg-gray-600 text-white p-4 rounded-lg shadow-lg border-dashed border-2 border-gray-400 " style={{ width: "210px", height: "80px" }}>
                                    <h3 className="text-xl font-semibold">LauzHack 2024</h3>
                                </div>
                            </div>
                        )}
                    </div>
                ))}
            </section>
        </div>
    );
}