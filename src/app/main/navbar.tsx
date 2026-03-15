import React from "react";
import Link from "next/link";
import Image from "next/image"; // Import the Image component
import universo from "../assets/img/universo.png"; // Use the correct path

const Navbar = () => {
  return (
    <nav>
      <div className="fixed top-0 w-full flex items-center justify-around py-5 px-24 ">
        <Link href="/" className="flex items-center">
          <Image src={universo} width={40} height={40} alt="Uni icon" />
        </Link>

        
        <div className="flex space-x-6 items-center">
          <Link href={'#homeContent'} className="text-white text-lg hover:text-gray-200">
            /home
          </Link>
          <Link href={'#about'} className="text-white text-lg hover:text-gray-400">
            /about
          </Link>
          <Link href={'/src/app/sections/languages.tsx'} className="text-white text-lg hover:text-gray-400">
            /languages
          </Link>
          <Link href={'/porjects'} className="text-white text-lg hover:text-gray-400">
            /projects
          </Link>
          <Link href={'/contact'} className="text-white text-lg hover:text-gray-400">
            /contact
          </Link>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
