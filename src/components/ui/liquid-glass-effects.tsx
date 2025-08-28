"use client"

import * as React from "react"
import { cn } from "@/lib/utils"

// Glass Reflection Component
export interface GlassReflectionProps {
  className?: string
  intensity?: "subtle" | "medium" | "strong"
  animated?: boolean
}

export const GlassReflection: React.FC<GlassReflectionProps> = ({
  className,
  intensity = "medium",
  animated = true
}) => {
  const intensityClasses = {
    subtle: "from-white/[0.08] via-white/[0.04] to-transparent",
    medium: "from-white/[0.15] via-white/[0.08] to-transparent",
    strong: "from-white/[0.25] via-white/[0.12] to-transparent"
  }

  return (
    <div className={cn("absolute inset-0 rounded-lg overflow-hidden pointer-events-none", className)}>
      {/* Primary Top Reflection */}
      <div className={cn(
        "absolute top-0 left-0 w-full h-1/2 bg-gradient-to-b opacity-70",
        intensityClasses[intensity],
        animated && "group-hover:opacity-90 transition-opacity duration-300"
      )} />
      
      {/* Side Reflection */}
      <div className={cn(
        "absolute top-0 right-0 w-1/4 h-full bg-gradient-to-l from-white/[0.08] to-transparent opacity-50",
        animated && "group-hover:opacity-70 transition-opacity duration-300"
      )} />
      
      {/* Corner Highlight */}
      <div className="absolute top-0 left-0 w-6 h-6 bg-gradient-to-br from-white/[0.20] to-transparent rounded-full blur-sm" />
      
      {/* Bottom Edge Reflection */}
      <div className={cn(
        "absolute bottom-0 left-0 w-full h-1/6 bg-gradient-to-t from-white/[0.05] to-transparent opacity-40",
        animated && "group-hover:opacity-60 transition-opacity duration-300"
      )} />
    </div>
  )
}

// Shimmer Effect Component
export interface ShimmerEffectProps {
  className?: string
  direction?: "horizontal" | "diagonal" | "vertical"
  speed?: "slow" | "medium" | "fast"
  trigger?: "hover" | "always" | "focus"
}

export const ShimmerEffect: React.FC<ShimmerEffectProps> = ({
  className,
  direction = "diagonal",
  speed = "medium",
  trigger = "hover"
}) => {
  const directionClasses = {
    horizontal: "rotate-0 translate-x-full group-hover:translate-x-0",
    diagonal: "rotate-45 translate-x-full translate-y-full group-hover:translate-x-0 group-hover:translate-y-0",
    vertical: "rotate-90 translate-y-full group-hover:translate-y-0"
  }

  const speedClasses = {
    slow: "duration-1000",
    medium: "duration-700",
    fast: "duration-500"
  }

  const triggerClasses = {
    hover: "opacity-0 group-hover:opacity-100",
    always: "opacity-100 animate-pulse",
    focus: "opacity-0 group-focus:opacity-100"
  }

  return (
    <div className={cn("absolute inset-0 rounded-lg overflow-hidden pointer-events-none", className)}>
      <div className={cn(
        "absolute -top-full -left-full w-full h-full bg-gradient-to-r from-transparent via-white/[0.15] to-transparent transform transition-transform ease-out",
        directionClasses[direction],
        speedClasses[speed],
        triggerClasses[trigger]
      )} />
    </div>
  )
}

// Liquid Ripple Effect
export interface LiquidRippleProps {
  x: number
  y: number
  size?: number
  color?: string
  duration?: number
}

export const LiquidRipple: React.FC<LiquidRippleProps> = ({
  x,
  y,
  size = 60,
  color = "white/[0.25]",
  duration = 600
}) => {
  return (
    <div
      className="absolute pointer-events-none z-10"
      style={{
        left: x - size / 2,
        top: y - size / 2,
        width: size,
        height: size,
      }}
    >
      <div 
        className={cn(`w-full h-full rounded-full bg-${color} animate-ping`)}
        style={{
          animationDuration: `${duration}ms`
        }}
      />
    </div>
  )
}

// Morphing Background Effect
export interface MorphingBackgroundProps {
  className?: string
  variant?: "subtle" | "medium" | "strong" | "liquid"
  animated?: boolean
}

export const MorphingBackground: React.FC<MorphingBackgroundProps> = ({
  className,
  variant = "medium",
  animated = true
}) => {
  const variantClasses = {
    subtle: "from-white/[0.02] to-white/[0.01]",
    medium: "from-white/[0.05] to-white/[0.02]",
    strong: "from-white/[0.08] to-white/[0.04]",
    liquid: "from-white/[0.06] via-white/[0.03] to-white/[0.05]"
  }

  return (
    <div className={cn(
      "absolute inset-0 rounded-lg bg-gradient-to-br pointer-events-none",
      variantClasses[variant],
      animated ? "opacity-0 group-hover:opacity-100 transition-opacity duration-300" : "opacity-100",
      className
    )} />
  )
}

// Liquid Glass Border
export interface LiquidGlassBorderProps {
  className?: string
  intensity?: "subtle" | "medium" | "strong"
  animated?: boolean
  glow?: boolean
}

export const LiquidGlassBorder: React.FC<LiquidGlassBorderProps> = ({
  className,
  intensity = "medium",
  animated = true,
  glow = false
}) => {
  const intensityClasses = {
    subtle: "border-white/[0.08] group-hover:border-white/[0.12]",
    medium: "border-white/[0.12] group-hover:border-white/[0.18]",
    strong: "border-white/[0.18] group-hover:border-white/[0.25]"
  }

  return (
    <>
      <div className={cn(
        "absolute inset-0 rounded-lg border pointer-events-none",
        intensityClasses[intensity],
        animated && "transition-colors duration-300",
        glow && "shadow-lg shadow-white/[0.05] group-hover:shadow-white/[0.10]",
        className
      )} />
      
      {/* Inner Border Highlight */}
      <div className={cn(
        "absolute inset-[1px] rounded-lg border border-white/[0.05] pointer-events-none",
        animated && "group-hover:border-white/[0.08] transition-colors duration-300"
      )} />
    </>
  )
}

// Floating Particles Effect
export interface FloatingParticlesProps {
  className?: string
  count?: number
  size?: "sm" | "md" | "lg"
  speed?: "slow" | "medium" | "fast"
}

export const FloatingParticles: React.FC<FloatingParticlesProps> = ({
  className,
  count = 3,
  size = "sm",
  speed = "medium"
}) => {
  const sizeClasses = {
    sm: "w-1 h-1",
    md: "w-1.5 h-1.5",
    lg: "w-2 h-2"
  }

  const speedClasses = {
    slow: "duration-[8s]",
    medium: "duration-[6s]",
    fast: "duration-[4s]"
  }

  return (
    <div className={cn("absolute inset-0 rounded-lg overflow-hidden pointer-events-none", className)}>
      {Array.from({ length: count }).map((_, i) => (
        <div
          key={i}
          className={cn(
            "absolute bg-white/[0.15] rounded-full blur-[0.5px] animate-bounce",
            sizeClasses[size],
            speedClasses[speed]
          )}
          style={{
            left: `${20 + (i * 25)}%`,
            top: `${30 + (i * 15)}%`,
            animationDelay: `${i * 0.5}s`,
            animationDirection: i % 2 === 0 ? 'normal' : 'reverse'
          }}
        />
      ))}
    </div>
  )
}

// Liquid Distortion Filter
export const LiquidDistortionFilter: React.FC<{ id?: string; intensity?: number }> = ({ 
  id = "liquid-distortion", 
  intensity = 1 
}) => {
  return (
    <svg className="absolute inset-0 w-full h-full pointer-events-none opacity-20">
      <defs>
        <filter id={id} x="0%" y="0%" width="100%" height="100%">
          <feTurbulence
            type="fractalNoise"
            baseFrequency="0.015 0.015"
            numOctaves="3"
            seed="2"
            result="turbulence"
          />
          <feDisplacementMap
            in="SourceGraphic"
            in2="turbulence"
            scale={intensity}
            result="displacement"
          />
          <feGaussianBlur
            in="displacement"
            stdDeviation="0.3"
            result="blur"
          />
        </filter>
      </defs>
      <rect
        width="100%"
        height="100%"
        fill="transparent"
        filter={`url(#${id})`}
        className="group-hover:opacity-40 transition-opacity duration-500"
      />
    </svg>
  )
}

// Combined Liquid Glass Effect Wrapper
export interface LiquidGlassEffectsProps {
  children: React.ReactNode
  className?: string
  reflection?: boolean
  shimmer?: boolean
  morphing?: boolean
  border?: boolean
  particles?: boolean
  distortion?: boolean
  intensity?: "subtle" | "medium" | "strong"
}

export const LiquidGlassEffects: React.FC<LiquidGlassEffectsProps> = ({
  children,
  className,
  reflection = true,
  shimmer = true,
  morphing = true,
  border = true,
  particles = false,
  distortion = false,
  intensity = "medium"
}) => {
  return (
    <div className={cn("relative group", className)}>
      {reflection && <GlassReflection intensity={intensity} />}
      {shimmer && <ShimmerEffect />}
      {morphing && <MorphingBackground variant={intensity} />}
      {border && <LiquidGlassBorder intensity={intensity} />}
      {particles && <FloatingParticles />}
      {distortion && <LiquidDistortionFilter />}
      
      <div className="relative z-10">
        {children}
      </div>
    </div>
  )
}