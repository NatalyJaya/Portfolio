"use client";
import Image from "next/image";
import imgAbout from "./assets/img/imgAbout.jpg";

export default function About() {
  return (
    <section className="flex flex-col items-center sm:flex-row sm:items-start p-6 ml-[10%] fade-in-up">
      <div className="sm:w-[50%] p-4">
        <h2 className="text-6xl font-bold text-center sm:text-left text-white mb-8">
          /about
        </h2>
        <hr className="border-t-2 border-[#f5f5dc] w-full" />
        <p className="text-xl mb-8">
          <br /> Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed pellentesque 
          sapien at ligula tristique faucibus. Quisque non metus eu nunc mollis sollicitudin 
          quis at neque. Pellentesque augue dolor, dictum a tortor at, ultricies tincidunt mauris.
           Quisque mattis egestas nisi, in iaculis tortor laoreet vitae. Aenean viverra auctor 
           luctus. Aenean fermentum eu sem et vestibulum. Etiam dui leo, rhoncus id magna at, 
           pharetra pharetra turpis. Nam pulvinar ligula at rutrum cursus. Suspendisse ac augue 
           tellus. Curabitur efficitur massa ipsum, quis lacinia quam elementum eu.
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




