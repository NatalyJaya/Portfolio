import Image from "next/image";
import { Download, Github, Linkedin, Mail, FileText } from "lucide-react";
import devpost from '../assets/img/devpost.png';
import linkedin from '../assets/img/linkedin.png';
import github from '../assets/img/github.png';
import gmail from '../assets/img/gmail.png';

const socialLinks = [
  { href: "https://github.com/NatalyJaya", icon: Github, label: "GitHub", external: true },
  { href: "https://www.linkedin.com/in/nataly-jaya-salazar-8764252a0/", icon: Linkedin, label: "LinkedIn", external: true },
  { href: "https://devpost.com/NatalyJaya", icon: Image, label: "Devpost", external: true, img: devpost },
  { href: "mailto:natvlyjs@gmail.com", icon: Mail, label: "Email", external: false },
];

export default function Footer() {
  return (
    <footer className="mx-auto mt-8 border-t border-white/10 max-w-6xl">
      <div className="flex flex-col items-center gap-6 px-4 py-10 sm:px-6 lg:px-8">
        <a
          href="/Nataly_Jaya_CV_En.pdf"
          download="Nataly_Jaya_CV.pdf"
          className="inline-flex items-center gap-2 px-6 py-3 rounded-lg bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 text-sm font-medium hover:bg-cyan-500/20 hover:border-cyan-400 transition-all duration-200"
        >
          <Download className="w-4 h-4" />
          Download CV
        </a>

        <div className="flex flex-wrap items-center justify-center gap-6">
          {socialLinks.map((link, index) => (
            <a
              key={index}
              href={link.href}
              target={link.external ? "_blank" : undefined}
              rel={link.external ? "noopener noreferrer" : undefined}
              className="flex items-center gap-2 text-sm text-white/50 hover:text-cyan-400 transition-colors duration-200"
            >
              {link.img ? (
                <Image src={link.img} width={18} height={18} alt={`${link.label} icon`} className="opacity-70" />
              ) : (
                <link.icon className="w-4 h-4" />
              )}
              <span>{link.label}</span>
            </a>
          ))}
        </div>
      </div>
      
      <div className="border-t border-white/5">
        <div className="text-center py-4">
          <p className="text-xs text-white/30 font-light">
            © {new Date().getFullYear()} Nataly Jaya. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}