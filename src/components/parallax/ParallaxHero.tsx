'use client';

import { motion, Variants } from 'framer-motion';
import { useRef } from 'react';
import ParallaxBackground from './ParallaxBackground';
import {
  useParallaxScroll,
  useParallaxTransform,
  useParallaxSpring,
  useResponsiveParallax,
  useReducedMotion,
  useViewportVisibility
} from '@/hooks/useParallax';

export default function ParallaxHero() {
  const heroRef = useRef<HTMLElement>(null);
  const scrollProgress = useParallaxScroll(heroRef);
  const parallaxScale = useResponsiveParallax();
  const prefersReducedMotion = useReducedMotion();
  const isVisible = useViewportVisibility(heroRef);
  
  // Typography parallax transforms
  const titleY = useParallaxTransform(scrollProgress, -0.5 * parallaxScale, 80);
  const subtitleY = useParallaxTransform(scrollProgress, -0.3 * parallaxScale, 60);
  const ctaY = useParallaxTransform(scrollProgress, -0.2 * parallaxScale, 40);
  
  // Apply spring physics for smooth movement
  const smoothTitleY = useParallaxSpring(titleY, { stiffness: 400, damping: 40 });
  const smoothSubtitleY = useParallaxSpring(subtitleY, { stiffness: 350, damping: 35 });
  const smoothCtaY = useParallaxSpring(ctaY, { stiffness: 300, damping: 30 });
  
  // Scale transform for zoom effect
  const scale = useParallaxTransform(scrollProgress, 0.2 * parallaxScale, 1);
  const smoothScale = useParallaxSpring(scale, { stiffness: 200, damping: 25 });
  
  // Opacity fade effect
  const opacity = useParallaxTransform(scrollProgress, -1, 1);
  const smoothOpacity = useParallaxSpring(opacity, { stiffness: 300, damping: 30 });
  
  // Animation variants for staggered entrance
  const containerVariants: Variants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2,
        delayChildren: 0.3
      }
    }
  };

  const itemVariants: Variants = {
    hidden: { opacity: 0, y: 30, scale: 0.95 },
    visible: {
      opacity: 1,
      y: 0,
      scale: 1,
      transition: {
        duration: 0.8
      }
    }
  };
  
  const buttonVariants: Variants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.6
      }
    },
    hover: {
      scale: 1.05,
      y: -2,
      transition: {
        duration: 0.2
      }
    },
    tap: {
      scale: 0.98
    }
  };
  
  return (
    <section 
      ref={heroRef}
      id="home" 
      className="min-h-[100svh] flex flex-col items-center justify-center relative overflow-hidden"
    >
      {/* Parallax Background */}
      <ParallaxBackground />
      
      {/* Main Content */}
      <motion.div
        className="relative z-10 flex flex-col items-center justify-center text-center px-4 max-w-6xl mx-auto"
        variants={containerVariants}
        initial="hidden"
        animate={isVisible ? "visible" : "hidden"}
        {...(prefersReducedMotion ? {} : {
          style: {
            scale: smoothScale,
            opacity: smoothOpacity
          }
        })}
      >
        {/* Main Title */}
        <motion.div
          variants={itemVariants}
          {...(prefersReducedMotion ? {} : {
            style: { y: smoothTitleY }
          })}
        >
          <motion.h1 
            className="text-5xl sm:text-7xl lg:text-8xl font-bold tracking-tight text-white leading-none"
            initial={{ backgroundPosition: "0% 50%" }}
            animate={{ 
              backgroundPosition: ["0% 50%", "100% 50%", "0% 50%"]
            }}
            transition={{
              duration: 8,
              repeat: Infinity,
              ease: "linear"
            }}
            style={{
              background: "linear-gradient(45deg, #ffffff, #e2e8f0, #cbd5e1, #ffffff)",
              backgroundSize: "200% 200%",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              backgroundClip: "text"
            }}
          >
            Andy Hardy
          </motion.h1>
        </motion.div>
        
        {/* Subtitle */}
        <motion.div
          variants={itemVariants}
          {...(prefersReducedMotion ? {} : {
            style: { y: smoothSubtitleY }
          })}
          className="mt-6 max-w-2xl"
        >
          <motion.p 
            className="text-lg sm:text-xl lg:text-2xl text-neutral-300 font-light leading-relaxed"
            initial={{ opacity: 0.7 }}
            animate={{ opacity: [0.7, 1, 0.7] }}
            transition={{
              duration: 4,
              repeat: Infinity,
              ease: "easeInOut"
            }}
          >
            Creative Developer &amp; Digital Artist
            <br />
            <span className="text-neutral-400 text-base sm:text-lg">
              Crafting immersive digital experiences through code and design
            </span>
          </motion.p>
        </motion.div>
        
        {/* CTA Buttons */}
        <motion.div
          variants={itemVariants}
          {...(prefersReducedMotion ? {} : {
            style: { y: smoothCtaY }
          })}
          className="mt-12 flex flex-col sm:flex-row gap-4 sm:gap-6"
        >
          <motion.a
            href="#projects"
            variants={buttonVariants}
            whileHover="hover"
            whileTap="tap"
            className="group relative px-8 py-4 rounded-full bg-white text-black font-medium text-lg overflow-hidden transition-all duration-300"
          >
            <motion.div
              className="absolute inset-0 bg-gradient-to-r from-blue-500 to-purple-600 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
              initial={false}
            />
            <span className="relative z-10 group-hover:text-white transition-colors duration-300">
              View Projects
            </span>
            <motion.div
              className="absolute inset-0 bg-white/20 scale-0 group-hover:scale-100 rounded-full transition-transform duration-500 ease-out"
              initial={false}
            />
          </motion.a>
          
          <motion.a
            href="#contact"
            variants={buttonVariants}
            whileHover="hover"
            whileTap="tap"
            className="group relative px-8 py-4 rounded-full border-2 border-white/30 text-white font-medium text-lg backdrop-blur-sm hover:border-white/60 transition-all duration-300"
          >
            <motion.div
              className="absolute inset-0 bg-white/10 scale-0 group-hover:scale-100 rounded-full transition-transform duration-500 ease-out"
              initial={false}
            />
            <span className="relative z-10">
              Get In Touch
            </span>
          </motion.a>
        </motion.div>
      </motion.div>
      

    </section>
  );
}