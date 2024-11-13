// footer.js
import Image from "next/image";
import instagram from './assets/img/instagram.png';
import linkedin from './assets/img/linkedin.png';
import github from './assets/img/github.png';
import gmail from './assets/img/gmail.png';

export default function Footer() {
  return (
    <footer className="row-start-3 flex gap-6 flex-wrap items-center justify-center ">         
      <a
        href="https://www.instagram.com/natvlyjs/"
        target="_blank"
        rel="noopener noreferrer"
        className="flex items-center gap-2 hover:underline hover:underline-offset-4"
      >
        <Image src={instagram} width={20} height={20} alt="Instagram icon" /> Instagram
      </a>
      <a
        href="https://www.linkedin.com/in/natvlyjs/"
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
