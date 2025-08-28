"use client";
import { Parallax } from "react-scroll-parallax";
import { LiquidGlassButton } from "@/components/ui/liquid-glass-button";

export default function Hero() {
  return (
    <section id="home" className="min-h-[100svh] flex flex-col items-center justify-center relative overflow-hidden pb-8" style={{ backgroundImage: 'url(/2.jpg)', backgroundSize: 'cover', backgroundPosition: 'center', backgroundAttachment: 'fixed' }}>
      {/* Floating Elements with Parallax */}
      <Parallax speed={-10} className="absolute top-20 left-10 opacity-30">
        <div className="w-32 h-32 rounded-full bg-gradient-to-br from-blue-500/20 to-purple-500/20 blur-xl" />
      </Parallax>
      <Parallax speed={-15} className="absolute top-40 right-20 opacity-20">
        <div className="w-48 h-48 rounded-full bg-gradient-to-br from-green-500/20 to-blue-500/20 blur-2xl" />
      </Parallax>
      <Parallax speed={-5} className="absolute bottom-20 left-1/4 opacity-25">
        <div className="w-24 h-24 rounded-full bg-gradient-to-br from-purple-500/20 to-pink-500/20 blur-lg" />
      </Parallax>

      {/* Gradient Overlay for text readability */}
      <div className="absolute inset-0 -z-10 bg-gradient-to-b from-black/20 via-black/10 to-black/30" />

      {/* Main Content */}
      <Parallax speed={-20}>
        <h1 className="text-7xl sm:text-8xl lg:text-9xl font-bold tracking-tight text-white text-center drop-shadow-2xl">
          Ayorinde John
        </h1>
      </Parallax>
      <Parallax speed={10}>
        <p className="mt-12 max-w-2xl text-xl sm:text-2xl lg:text-3xl text-center text-neutral-200 drop-shadow-lg leading-relaxed">
          Multimedia Producer • Software Engineer • Musician
        </p>
      </Parallax>
      
      {/* Call to Action Buttons */}
      <Parallax speed={5}>
        <div className="mt-8 flex gap-4">
          <LiquidGlassButton
            variant="default"
            size="lg"
            animation="float"
            glow="subtle"
            ripple={true}
            shimmer={true}
            className="px-6 py-3 rounded-full"
            onClick={() => document.querySelector('#projects')?.scrollIntoView({ behavior: 'smooth' })}
          >View Projects</LiquidGlassButton>
          <LiquidGlassButton
            variant="primary"
            size="lg"
            animation="liquid"
            glow="liquid"
            ripple={true}
            shimmer={true}
            className="px-6 py-3 rounded-full"
            onClick={() => document.querySelector('#streams')?.scrollIntoView({ behavior: 'smooth' })}
          >Content</LiquidGlassButton>
        </div>
      </Parallax>


    </section>
  );
}