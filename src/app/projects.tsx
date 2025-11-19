"use Client";


export default function Project(){



    return (
        <div className="mx-[10%]">
            <div className="text-4xl font-bold text-center sm:text-left text-white "> Github Projects</div>
            <div className="grid grid-cols-3 gap-2 my-[5%]">
                <div className="col-span-2 border-l-blue-50 h-[550px] rounded-2xl shadow-white bg-white text-emerald-700">
                    porject image
                </div>
                <div className=" place-content-center ">
                    <div className="rounded-2xl bg-blue-300 h-[50%]">
                        porject info
                    </div>

                </div>

            </div>

        </div>

    );
}