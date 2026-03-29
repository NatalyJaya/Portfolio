// footer.js
import Image from "next/image";
import devpost from '../assets/img/devpost.png';
import linkedin from '../assets/img/linkedin.png';
import github from '../assets/img/github.png';
import gmail from '../assets/img/gmail.png';

export default function Footer() {
  return (
    <footer className="mx-auto mt-8 flex max-w-6xl flex-wrap items-center justify-center gap-4 px-4 py-8 text-sm text-white/80 sm:gap-6 sm:px-6 lg:px-8">
      <a
        href="https://devpost.com/NatalyJaya"
        target="_blank"
        rel="noopener noreferrer"
        className="flex items-center gap-2 hover:underline hover:underline-offset-4"
      >
        <Image src={devpost} width={20} height={20} alt="devpost icon" /> Devpost
      </a>
      <a
        href="https://www.linkedin.com/in/nataly-jaya-salazar-8764252a0/"
        target="_blank"
        rel="noopener noreferrer"
        className="flex items-center gap-2 hover:underline hover:underline-offset-4"
      >
        <Image src={linkedin} width={20} height={20} alt="LinkedIn icon" /> LinkedIn
      </a>
      <a
        href="https://github.com/NatalyJaya"
        target="_blank"
        rel="noopener noreferrer"
        className="flex items-center gap-2 hover:underline hover:underline-offset-4"
      >
        <Image src={github} width={20} height={20} alt="Github icon" /> Github
      </a>         
      <a
        href="mailto:natvlyjs@gmail.com"
        target="_blank"
        rel="noopener noreferrer"
        className="flex items-center gap-2 hover:underline hover:underline-offset-4"
      >
        <Image src={gmail} width={20} height={20} alt="Mail icon" /> Gmail
      </a>      
    </footer>
  );
}
