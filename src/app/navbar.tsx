import React from "react";
import Link from "next/link";
import Image from "next/image"; // Import the Image component
import universo from "./assets/img/universo.png"; // Use the correct path

const Navbar = () => {
  return (
    <nav>
      <div className="flex items-start justify-between mx-auto max-w-7xl p-4">
        {/* Left section with the image */}
        <Link href="/" className="flex items-center">
          <Image src={universo} width={40} height={40} alt="Uni icon" />
        </Link>

        {/* Right section with navigation links */}
        <div className="flex space-x-6 items-center">
          <Link href={'/home'} className="text-white text-lg hover:text-gray-400">
            Home
          </Link>
          <Link href={'/about'} className="text-white text-lg hover:text-gray-400">
            About
          </Link>
          <Link href={'/services'} className="text-white text-lg hover:text-gray-400">
            Services
          </Link>
          <Link href={'/contact'} className="text-white text-lg hover:text-gray-400">
            Contact
          </Link>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
