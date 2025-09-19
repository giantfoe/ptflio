import Hero from "@/components/sections/Hero";
import Projects from "@/components/sections/Projects";
import Streams from "@/components/sections/Streams";
import SectionTransition from "@/components/ui/SectionTransition";
import Image from "next/image";

export default function Home() {
  return (
    <>
      <header className="fixed top-0 inset-x-0 z-50 backdrop-blur border-b border-white/10">
        <nav className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <a href="#home" className="flex items-center">
            <Image 
              src="/signature (3).png" 
              alt="Portfolio Logo" 
              width={300} 
              height={100} 
              className="h-12 w-auto object-contain"
              priority
            />
          </a>
          <div className="flex items-center gap-4">
            <a href="#projects" className="hover:underline">Projects</a>
            <a href="#streams" className="hover:underline">Content</a>
          </div>
        </nav>
      </header>
      <main>
        <Hero />
        <SectionTransition fromSection="hero" toSection="projects" />
        <Projects />
        <SectionTransition fromSection="projects" toSection="streams" />
        <Streams />
      </main>
      <footer className="py-12 text-center text-sm text-neutral-400">
        © {new Date().getFullYear()} Ayorinde John
      </footer>
    </>
  );
}
