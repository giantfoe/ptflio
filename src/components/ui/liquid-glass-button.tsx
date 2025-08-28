"use client"

import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"
import { getFocusStyles, getAccessibleAnimationClasses } from '@/utils/accessibility';

const liquidGlassButtonVariants = cva(
  "relative inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-lg text-sm font-medium disabled:pointer-events-none disabled:opacity-50 overflow-hidden group cursor-pointer",
  {
    variants: {
      variant: {
        default: "bg-white/[0.10] border border-white/[0.15] text-white hover:bg-white/[0.15] hover:border-white/[0.20] backdrop-blur-md",
        primary: "bg-gradient-to-r from-blue-500/[0.20] to-purple-500/[0.20] border border-white/[0.15] text-white hover:from-blue-500/[0.30] hover:to-purple-500/[0.30] backdrop-blur-md",
        secondary: "bg-white/[0.05] border border-white/[0.10] text-white/90 hover:bg-white/[0.10] hover:border-white/[0.15] backdrop-blur-sm",
        accent: "bg-gradient-to-br from-cyan-400/[0.20] to-blue-500/[0.20] border border-cyan-400/[0.20] text-white hover:from-cyan-400/[0.30] hover:to-blue-500/[0.30] backdrop-blur-md",
        ghost: "bg-transparent border border-white/[0.08] text-white/80 hover:bg-white/[0.08] hover:border-white/[0.12] hover:text-white backdrop-blur-sm",
        liquid: "bg-gradient-to-br from-white/[0.12] via-white/[0.08] to-white/[0.10] border border-white/[0.15] text-white hover:from-white/[0.18] hover:via-white/[0.12] hover:to-white/[0.15] backdrop-blur-md",
      },
      size: {
        sm: "h-8 px-3 text-xs rounded-md",
        default: "h-10 px-4 py-2",
        lg: "h-12 px-6 text-base",
        xl: "h-14 px-8 text-lg",
        icon: "h-10 w-10",
      },
      animation: {
        none: "",
        morph: "hover:scale-105 active:scale-95",
        float: "hover:scale-105 hover:-translate-y-1 active:scale-95 active:translate-y-0",
        liquid: "hover:scale-[1.02] hover:rotate-1 active:scale-95 active:rotate-0",
        ripple: "active:scale-95",
      },
      glow: {
        none: "",
        subtle: "shadow-lg shadow-blue-500/10 hover:shadow-blue-500/20",
        strong: "shadow-xl shadow-blue-500/20 hover:shadow-blue-500/30",
        liquid: "shadow-[0_4px_20px_rgba(0,0,0,0.3),inset_0_1px_0_rgba(255,255,255,0.1)] hover:shadow-[0_6px_25px_rgba(0,0,0,0.4),inset_0_1px_0_rgba(255,255,255,0.15)]",
      },
    },
    defaultVariants: {
      variant: "liquid",
      size: "default",
      animation: "liquid",
      glow: "liquid",
    },
  }
)

export interface LiquidGlassButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof liquidGlassButtonVariants> {
  asChild?: boolean
  ripple?: boolean
  shimmer?: boolean
}

const LiquidGlassButton = React.forwardRef<HTMLButtonElement, LiquidGlassButtonProps>(
  ({ 
    className, 
    variant, 
    size, 
    animation, 
    glow, 
    asChild = false, 
    ripple = true, 
    shimmer = true, 
    children, 
    'aria-label': ariaLabel,
    ...props 
  }, ref) => {
    const [rippleEffect, setRippleEffect] = React.useState<{ x: number; y: number; id: number } | null>(null)
    const [isPressed, setIsPressed] = React.useState(false)
    const Comp = asChild ? Slot : "button"

    const handleMouseDown = (e: React.MouseEvent<HTMLButtonElement>) => {
      setIsPressed(true)
      
      if (ripple) {
        const rect = e.currentTarget.getBoundingClientRect()
        const x = e.clientX - rect.left
        const y = e.clientY - rect.top
        setRippleEffect({ x, y, id: Date.now() })
        
        setTimeout(() => setRippleEffect(null), 600)
      }
      
      if (props.onMouseDown) {
        props.onMouseDown(e)
      }
    }

    const handleMouseUp = () => {
      setIsPressed(false)
    }

    const handleMouseLeave = () => {
      setIsPressed(false)
    }

    const animationClasses = getAccessibleAnimationClasses(
      liquidGlassButtonVariants({ variant, size, animation, glow }),
      'transition-all duration-300 ease-out'
    );
    
    const focusClasses = getFocusStyles('medium');

    return (
      <Comp
        className={cn(
          animationClasses,
          focusClasses,
          className
        )}
        ref={ref}
        onMouseDown={handleMouseDown}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseLeave}
        aria-label={ariaLabel}
        {...props}
      >
        {/* Glass Reflection Layer */}
        <div className="absolute inset-0 rounded-lg overflow-hidden pointer-events-none">
          {/* Primary Reflection */}
          <div className="absolute top-0 left-0 w-full h-1/2 bg-gradient-to-b from-white/[0.20] via-white/[0.08] to-transparent opacity-70 group-hover:opacity-90 transition-opacity duration-300" />
          
          {/* Side Reflection */}
          <div className="absolute top-0 right-0 w-1/4 h-full bg-gradient-to-l from-white/[0.12] to-transparent opacity-50 group-hover:opacity-70 transition-opacity duration-300" />
          
          {/* Corner Highlight */}
          <div className="absolute top-0 left-0 w-8 h-8 bg-gradient-to-br from-white/[0.25] to-transparent rounded-full blur-sm" />
        </div>

        {/* Shimmer Effect */}
        {shimmer && (
          <div className="absolute inset-0 rounded-lg overflow-hidden pointer-events-none">
            <div className="absolute -top-full -left-full w-full h-full bg-gradient-to-r from-transparent via-white/[0.20] to-transparent transform rotate-45 translate-x-full translate-y-full group-hover:translate-x-0 group-hover:translate-y-0 transition-transform duration-700 ease-out" />
          </div>
        )}

        {/* Morphing Background */}
        <div className="absolute inset-0 rounded-lg bg-gradient-to-br from-white/[0.05] to-white/[0.02] opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />

        {/* Border Enhancement */}
        <div className="absolute inset-0 rounded-lg border border-white/[0.08] group-hover:border-white/[0.15] transition-colors duration-300 pointer-events-none" />

        {/* Ripple Effect */}
        {ripple && rippleEffect && (
          <div
            className="absolute pointer-events-none z-10"
            style={{
              left: rippleEffect.x - 30,
              top: rippleEffect.y - 30,
              width: 60,
              height: 60,
            }}
          >
            <div className="w-full h-full rounded-full bg-white/[0.25] animate-ping" />
          </div>
        )}

        {/* Press Effect */}
        {isPressed && (
          <div className="absolute inset-0 rounded-lg bg-black/[0.10] pointer-events-none" />
        )}

        {/* Content */}
        <span className="relative z-20 flex items-center gap-2">
          {children}
        </span>

        {/* Liquid Distortion Filter */}
        <svg className="absolute inset-0 w-full h-full pointer-events-none opacity-30">
          <defs>
            <filter id="liquid-distortion" x="0%" y="0%" width="100%" height="100%">
              <feTurbulence
                type="fractalNoise"
                baseFrequency="0.02 0.02"
                numOctaves="2"
                seed="1"
                result="turbulence"
              />
              <feDisplacementMap
                in="SourceGraphic"
                in2="turbulence"
                scale="1"
                result="displacement"
              />
              <feGaussianBlur
                in="displacement"
                stdDeviation="0.5"
                result="blur"
              />
            </filter>
          </defs>
          <rect
            width="100%"
            height="100%"
            fill="transparent"
            filter="url(#liquid-distortion)"
            className="group-hover:opacity-50 transition-opacity duration-500"
          />
        </svg>
      </Comp>
    )
  }
)

LiquidGlassButton.displayName = "LiquidGlassButton"

export { LiquidGlassButton, liquidGlassButtonVariants }