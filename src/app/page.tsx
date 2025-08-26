import Hero from "@/components/sections/Hero";
import Projects from "@/components/sections/Projects";
import Streams from "@/components/sections/Streams";

export default function Home() {
  return (
    <>
      <header className="fixed top-0 inset-x-0 z-50 backdrop-blur border-b border-white/10">
        <nav className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <a href="#home" className="font-semibold">Portfolio</a>
          <div className="flex gap-4">
            <a href="#projects" className="hover:underline">Projects</a>
            <a href="#streams" className="hover:underline">Streams</a>
          </div>
        </nav>
      </header>
      <main>
        <Hero />
        <Projects />
        <Streams />
      </main>
      <footer className="py-12 text-center text-sm text-neutral-400">
        © {new Date().getFullYear()} Your Name
      </footer>
    </>
  );
}
