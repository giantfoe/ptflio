"use client";
import { Parallax } from "react-scroll-parallax";

export default function Hero() {
  return (
    <section id="home" className="min-h-[100svh] flex flex-col items-center justify-center relative overflow-hidden">
      <div className="absolute inset-0 -z-10 bg-gradient-to-b from-black via-neutral-900 to-black opacity-90" />
      <Parallax speed={-20}>
        <h1 className="text-5xl sm:text-7xl font-bold tracking-tight text-white text-center">
          Your Name
        </h1>
      </Parallax>
      <Parallax speed={10}>
        <p className="mt-6 max-w-xl text-center text-neutral-300">
          Multidisciplinary developer • Designer • Creative Technologist
        </p>
      </Parallax>
      <div className="absolute bottom-6 flex gap-4">
        <a href="#projects" className="px-4 py-2 rounded-full bg-white/10 text-white border border-white/20 hover:bg-white/20">View Projects</a>
        <a href="#streams" className="px-4 py-2 rounded-full bg-white/10 text-white border border-white/20 hover:bg-white/20">Live Streams</a>
      </div>
    </section>
  );
}