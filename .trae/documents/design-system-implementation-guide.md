# Design System Implementation Guide

## Overview
This guide provides step-by-step instructions for implementing the portfolio design system across all project components, ensuring consistent visual language and user experience.

## Implementation Strategy

### Phase 1: Foundation Setup

#### 1.1 Update Global Styles
Modify `src/app/globals.css`:

```css
@import "tailwindcss";

:root {
  /* Design System Colors */
  --bg-primary: #0a0a0a;
  --bg-secondary: #171717;
  --bg-surface: rgba(255, 255, 255, 0.05);
  --bg-surface-hover: rgba(255, 255, 255, 0.1);
  
  --text-primary: #ffffff;
  --text-secondary: #ededed;
  --text-muted: rgba(255, 255, 255, 0.6);
  --text-accent: rgba(255, 255, 255, 0.8);
  
  --accent-blue: #3b82f6;
  --accent-purple: #8b5cf6;
  --accent-cyan: #06b6d4;
  
  --glass-bg: rgba(255, 255, 255, 0.1);
  --glass-border: rgba(255, 255, 255, 0.2);
  --glass-shadow: rgba(0, 0, 0, 0.3);
  
  /* Legacy variables for compatibility */
  --background: var(--bg-primary);
  --foreground: var(--text-primary);
}

@theme inline {
  --color-background: var(--background);
  --color-foreground: var(--foreground);
  --font-sans: var(--font-geist-sans);
  --font-mono: var(--font-geist-mono);
}

@media (prefers-color-scheme: dark) {
  :root {
    --background: var(--bg-primary);
    --foreground: var(--text-primary);
  }
}

html, body { 
  height: 100%; 
  background: var(--bg-primary);
  color: var(--text-primary);
}

body {
  font-family: var(--font-geist-sans), Arial, Helvetica, sans-serif;
}

/* Design System Utility Classes */
@layer utilities {
  .glass-effect {
    @apply bg-white/10 backdrop-blur-sm border border-white/20;
  }
  
  .glass-strong {
    @apply bg-white/20 backdrop-blur-md border border-white/30;
  }
  
  .glass-subtle {
    @apply bg-white/5 backdrop-blur-sm border border-white/10;
  }
  
  .text-gradient-blue-purple {
    @apply bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent;
  }
  
  .text-gradient-cyan-blue {
    @apply bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text text-transparent;
  }
  
  .section-container {
    @apply max-w-6xl mx-auto px-6;
  }
  
  .section-spacing {
    @apply py-24;
  }
}

/* Animations */
@keyframes float {
  0%, 100% { transform: translateY(0px); }
  50% { transform: translateY(-10px); }
}

@keyframes glow {
  0% { box-shadow: 0 0 5px rgba(59, 130, 246, 0.5); }
  100% { box-shadow: 0 0 20px rgba(59, 130, 246, 0.8); }
}

.animate-float {
  animation: float 6s ease-in-out infinite;
}

.animate-glow {
  animation: glow 2s ease-in-out infinite alternate;
}

/* Line clamp utilities */
.line-clamp-1 {
  overflow: hidden;
  display: -webkit-box;
  -webkit-box-orient: vertical;
  -webkit-line-clamp: 1;
}

.line-clamp-2 {
  overflow: hidden;
  display: -webkit-box;
  -webkit-box-orient: vertical;
  -webkit-line-clamp: 2;
}

.line-clamp-3 {
  overflow: hidden;
  display: -webkit-box;
  -webkit-box-orient: vertical;
  -webkit-line-clamp: 3;
}

.line-clamp-4 {
  overflow: hidden;
  display: -webkit-box;
  -webkit-box-orient: vertical;
  -webkit-line-clamp: 4;
}
```

#### 1.2 Update Tailwind Configuration
Extend `tailwind.config.ts`:

```typescript
import type { Config } from "tailwindcss";
import typography from "@tailwindcss/typography";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ["var(--font-geist-sans)"],
        mono: ["var(--font-geist-mono)"],
      },
      colors: {
        'glass': {
          'bg': 'rgba(255, 255, 255, 0.1)',
          'border': 'rgba(255, 255, 255, 0.2)',
          'strong': 'rgba(255, 255, 255, 0.2)',
          'subtle': 'rgba(255, 255, 255, 0.05)'
        },
        'accent': {
          'blue': '#3b82f6',
          'purple': '#8b5cf6',
          'cyan': '#06b6d4'
        }
      },
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'gradient-conic': 'conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))',
      },
      backdropBlur: {
        'xs': '2px',
      },
      animation: {
        'float': 'float 6s ease-in-out infinite',
        'glow': 'glow 2s ease-in-out infinite alternate',
      },
      spacing: {
        '18': '4.5rem',
        '88': '22rem',
        '128': '32rem',
      }
    },
  },
  plugins: [
    typography,
  ],
};

export default config;
```

### Phase 2: Component System Implementation

#### 2.1 Create Base Components

##### Glass Card Component
Create `src/components/ui/glass-card.tsx`:

```tsx
import React from 'react';
import { cn } from '@/lib/utils';

interface GlassCardProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'strong' | 'subtle';
  hover?: boolean;
}

export const GlassCard = React.forwardRef<HTMLDivElement, GlassCardProps>(
  ({ className, variant = 'default', hover = true, children, ...props }, ref) => {
    const variants = {
      default: 'glass-effect',
      strong: 'glass-strong',
      subtle: 'glass-subtle'
    };

    return (
      <div
        ref={ref}
        className={cn(
          'rounded-lg transition-all duration-300',
          variants[variant],
          hover && 'hover:bg-white/15 hover:border-white/30 hover:scale-[1.02]',
          className
        )}
        {...props}
      >
        {children}
      </div>
    );
  }
);

GlassCard.displayName = 'GlassCard';
```

##### Design System Button
Update `src/components/ui/button.tsx`:

```tsx
import React from 'react';
import { cn } from '@/lib/utils';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'default' | 'gradient' | 'outline' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'default', size = 'md', children, ...props }, ref) => {
    const variants = {
      default: 'glass-effect text-white hover:bg-white/20',
      gradient: 'bg-gradient-to-r from-blue-500/20 to-purple-500/20 text-white border border-white/20 hover:from-blue-500/30 hover:to-purple-500/30 backdrop-blur-sm',
      outline: 'border-2 border-white/30 text-white hover:bg-white/10 backdrop-blur-sm',
      ghost: 'text-white hover:bg-white/10'
    };

    const sizes = {
      sm: 'px-4 py-2 text-sm',
      md: 'px-6 py-3 text-base',
      lg: 'px-8 py-4 text-lg'
    };

    return (
      <button
        ref={ref}
        className={cn(
          'rounded-full font-medium transition-all duration-300 hover:scale-105 focus:outline-none focus:ring-2 focus:ring-white/50',
          variants[variant],
          sizes[size],
          className
        )}
        {...props}
      >
        {children}
      </button>
    );
  }
);

Button.displayName = 'Button';
```

##### Section Header Component
Create `src/components/ui/section-header.tsx`:

```tsx
import React from 'react';
import { cn } from '@/lib/utils';

interface SectionHeaderProps {
  title: string;
  subtitle?: string;
  className?: string;
  centered?: boolean;
}

export const SectionHeader: React.FC<SectionHeaderProps> = ({
  title,
  subtitle,
  className,
  centered = true
}) => {
  return (
    <div className={cn(
      'mb-12',
      centered && 'text-center',
      className
    )}>
      <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-white mb-4">
        {title}
      </h2>
      {subtitle && (
        <p className="text-lg text-white/80 max-w-2xl mx-auto">
          {subtitle}
        </p>
      )}
    </div>
  );
};
```

#### 2.2 Update Existing Components

##### Projects Section
Update `src/components/sections/Projects.tsx`:

```tsx
'use client';

import React from 'react';
import useSWR from 'swr';
import { useRSCNavigation } from '@/hooks/useRSCNavigation';
import { TechnologyBadge } from '@/components/ui/TechnologyBadge';
import { AbstractProjectImage } from '@/components/ui/AbstractProjectImage';
import { GlassCard } from '@/components/ui/glass-card';
import { SectionHeader } from '@/components/ui/section-header';
import { Button } from '@/components/ui/button';
import { ExternalLink, Globe } from 'lucide-react';

// ... existing imports and interfaces

export default function Projects() {
  // ... existing logic

  return (
    <section className="min-h-[100svh] section-spacing bg-black relative overflow-hidden">
      {/* Background gradient */}
      <div className="absolute inset-0 bg-gradient-to-b from-black via-neutral-900/50 to-black" />
      
      <div className="section-container relative z-10">
        <SectionHeader 
          title="Featured Projects"
          subtitle="A showcase of innovative solutions and creative implementations"
        />
        
        {/* Projects Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {projects.map((project) => (
            <GlassCard key={project.id} className="p-6 group">
              {/* Project Image */}
              <div className="relative mb-4 overflow-hidden rounded-lg">
                <AbstractProjectImage 
                  projectName={project.name}
                  className="w-full h-48 object-cover transition-transform duration-300 group-hover:scale-105"
                />
              </div>
              
              {/* Project Content */}
              <div className="space-y-4">
                <h3 className="text-xl font-semibold text-white group-hover:text-gradient-blue-purple transition-all duration-300">
                  {project.name}
                </h3>
                
                <p className="text-white/80 text-sm line-clamp-3">
                  {project.description}
                </p>
                
                {/* Technology Stack */}
                <div className="flex flex-wrap gap-2">
                  {project.technologies?.slice(0, 3).map((tech) => (
                    <TechnologyBadge key={tech} technology={tech} size="sm" />
                  ))}
                  {project.technologies?.length > 3 && (
                    <span className="text-xs text-white/60 px-2 py-1 glass-subtle rounded-full">
                      +{project.technologies.length - 3} more
                    </span>
                  )}
                </div>
                
                {/* Project Links */}
                <div className="flex gap-3 pt-2">
                  {project.html_url && (
                    <Button variant="outline" size="sm" asChild>
                      <a href={project.html_url} target="_blank" rel="noopener noreferrer">
                        <ExternalLink className="w-4 h-4 mr-2" />
                        Code
                      </a>
                    </Button>
                  )}
                  {project.homepage && (
                    <Button variant="gradient" size="sm" asChild>
                      <a href={project.homepage} target="_blank" rel="noopener noreferrer">
                        <Globe className="w-4 h-4 mr-2" />
                        Live Demo
                      </a>
                    </Button>
                  )}
                </div>
              </div>
            </GlassCard>
          ))}
        </div>
      </div>
    </section>
  );
}
```

### Phase 3: Systematic Component Updates

#### 3.1 Navigation Components
Update header/navigation to use design system:

```tsx
// Header component example
<header className="fixed top-0 w-full bg-black/80 backdrop-blur-md border-b border-white/10 z-50">
  <nav className="section-container py-4">
    <div className="flex items-center justify-between">
      <div className="text-xl font-bold text-white">
        Portfolio
      </div>
      <div className="flex items-center space-x-6">
        {navItems.map((item) => (
          <a 
            key={item.href}
            href={item.href}
            className="text-white/80 hover:text-white transition-colors duration-200"
          >
            {item.label}
          </a>
        ))}
      </div>
    </div>
  </nav>
</header>
```

#### 3.2 Form Components
Update form elements:

```tsx
// Input component
<input 
  className="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-3 text-white placeholder-white/60 focus:border-white/40 focus:bg-white/15 focus:outline-none focus:ring-2 focus:ring-white/20 transition-all duration-200"
  placeholder="Enter your message..."
/>

// Textarea component
<textarea 
  className="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-3 text-white placeholder-white/60 focus:border-white/40 focus:bg-white/15 focus:outline-none focus:ring-2 focus:ring-white/20 transition-all duration-200 resize-none"
  rows={4}
  placeholder="Your message here..."
/>
```

### Phase 4: Advanced Components

#### 4.1 Technology Badge Updates
Update `src/components/ui/TechnologyBadge.tsx`:

```tsx
// Add design system styling
const badgeVariants = {
  default: 'glass-effect text-white',
  accent: 'bg-gradient-to-r from-blue-500/20 to-purple-500/20 text-white border border-white/20',
  subtle: 'glass-subtle text-white/80'
};
```

#### 4.2 Loading States
Create consistent loading components:

```tsx
// Loading skeleton
<div className="glass-subtle rounded-lg p-6 animate-pulse">
  <div className="h-4 bg-white/20 rounded mb-4"></div>
  <div className="h-3 bg-white/10 rounded mb-2"></div>
  <div className="h-3 bg-white/10 rounded w-3/4"></div>
</div>
```

### Phase 5: Testing & Validation

#### 5.1 Visual Consistency Checklist
- [ ] All sections use consistent background colors
- [ ] Typography follows the established scale
- [ ] Glass effects are applied consistently
- [ ] Hover states work across all interactive elements
- [ ] Color palette is used consistently
- [ ] Spacing follows the design system

#### 5.2 Accessibility Validation
- [ ] Color contrast meets WCAG guidelines
- [ ] Focus indicators are visible
- [ ] Interactive elements have proper ARIA labels
- [ ] Keyboard navigation works properly

#### 5.3 Performance Considerations
- [ ] CSS is optimized and not duplicated
- [ ] Animations don't cause layout shifts
- [ ] Glass effects don't impact performance
- [ ] Images are optimized

## Maintenance Guidelines

### Adding New Components
1. Follow the established naming conventions
2. Use design system tokens and utility classes
3. Include hover and focus states
4. Test across different screen sizes
5. Document component usage

### Updating Existing Components
1. Gradually migrate to design system patterns
2. Maintain backward compatibility where possible
3. Update documentation
4. Test thoroughly before deployment

### Design System Evolution
1. Document all changes in this guide
2. Update component library
3. Communicate changes to team
4. Version control design tokens

This implementation guide ensures systematic adoption of the design system while maintaining code quality and user experience consistency.