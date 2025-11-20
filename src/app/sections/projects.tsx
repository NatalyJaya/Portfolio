"use Client";
import {projects} from "NatalyJaya/app/data/githubData";

import Image from "next/image";

export default function Project(){

    const project = projects[0];

    return (
        <div className="mx-[10%]">
            <div className="text-4xl font-bold text-center sm:text-left text-white "> Github Projects</div>
            <div className="grid grid-cols-3 gap-2 my-[5%]">

                <div className=" col-span-2 border-l-blue-50 h-[550px] w-full rounded-2xl shadow-white place-content-center">
                        <Image
                            src={project.image}
                            alt={project.title}
                            className="rounded-2xl shadow-background object-cover col-end-3"
                        />
                </div>
                <div className=" place-content-center ">
                    <div className="rounded-2xl bg-blue-300 h-[50%]">
                        {project.description}
                    </div>

                </div>

            </div>

        </div>

    );
}