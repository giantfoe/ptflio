# Portfolio Design System

## Overview
This design system establishes consistent visual language and component patterns for the portfolio project, extracted from the hero section's dark glassmorphism aesthetic.

## Design Tokens

### Color Palette

#### Primary Colors
```css
:root {
  /* Background Colors */
  --bg-primary: #0a0a0a;
  --bg-secondary: #171717;
  --bg-surface: rgba(255, 255, 255, 0.05);
  --bg-surface-hover: rgba(255, 255, 255, 0.1);
  
  /* Text Colors */
  --text-primary: #ffffff;
  --text-secondary: #ededed;
  --text-muted: rgba(255, 255, 255, 0.6);
  --text-accent: rgba(255, 255, 255, 0.8);
  
  /* Accent Colors */
  --accent-blue: #3b82f6;
  --accent-blue-light: #60a5fa;
  --accent-purple: #8b5cf6;
  --accent-purple-light: #a78bfa;
  --accent-cyan: #06b6d4;
  --accent-cyan-light: #22d3ee;
  
  /* Glass Effect Colors */
  --glass-bg: rgba(255, 255, 255, 0.1);
  --glass-border: rgba(255, 255, 255, 0.2);
  --glass-shadow: rgba(0, 0, 0, 0.3);
}
```

#### Tailwind CSS Classes
- **Backgrounds**: `bg-black`, `bg-neutral-900`, `bg-white/5`, `bg-white/10`
- **Text**: `text-white`, `text-neutral-200`, `text-white/60`, `text-white/80`
- **Accents**: `text-blue-400`, `text-purple-400`, `text-cyan-400`
- **Borders**: `border-white/20`, `border-white/30`

### Typography

#### Font Families
```css
:root {
  --font-primary: var(--font-geist-sans);
  --font-mono: var(--font-geist-mono);
}
```

#### Typography Scale
- **Hero Title**: `text-5xl sm:text-7xl font-bold tracking-tight`
- **Section Title**: `text-3xl sm:text-4xl font-bold tracking-tight`
- **Subtitle**: `text-xl sm:text-2xl font-semibold`
- **Body Large**: `text-lg font-medium`
- **Body**: `text-base`
- **Body Small**: `text-sm`
- **Caption**: `text-xs`

### Spacing System

#### Layout Spacing
- **Section Padding**: `py-24` (96px vertical)
- **Container Max Width**: `max-w-6xl mx-auto px-6`
- **Component Spacing**: `space-y-8`, `space-y-6`, `space-y-4`
- **Element Gaps**: `gap-4`, `gap-6`, `gap-8`

#### Component Spacing
- **Button Padding**: `px-6 py-3`
- **Card Padding**: `p-6`, `p-8`
- **Input Padding**: `px-4 py-2`

### Visual Effects

#### Glassmorphism
```css
.glass-effect {
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.2);
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
}
```

#### Tailwind Classes
- **Glass Background**: `bg-white/10 backdrop-blur-sm border border-white/20`
- **Strong Glass**: `bg-white/20 backdrop-blur-md border border-white/30`
- **Subtle Glass**: `bg-white/5 backdrop-blur-sm border border-white/10`

#### Shadows
- **Soft Shadow**: `drop-shadow-lg`
- **Strong Shadow**: `drop-shadow-2xl`
- **Text Shadow**: `drop-shadow-lg` (for text over images)

#### Animations
- **Hover Scale**: `hover:scale-105 transition-all duration-300`
- **Pulse**: `animate-pulse`
- **Fade In**: `transition-opacity duration-300`

## Component Patterns

### Buttons

#### Primary Button
```tsx
className="px-6 py-3 rounded-full bg-white/10 text-white border border-white/20 hover:bg-white/20 backdrop-blur-sm transition-all duration-300 hover:scale-105"
```

#### Gradient Button
```tsx
className="px-6 py-3 rounded-full bg-gradient-to-r from-blue-500/20 to-purple-500/20 text-white border border-white/20 hover:from-blue-500/30 hover:to-purple-500/30 backdrop-blur-sm transition-all duration-300 hover:scale-105"
```

### Cards

#### Glass Card
```tsx
className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-lg p-6 hover:bg-white/15 transition-all duration-300"
```

#### Project Card
```tsx
className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-lg p-6 hover:bg-white/10 hover:border-white/20 transition-all duration-300 hover:scale-[1.02]"
```

### Navigation

#### Header
```tsx
className="fixed top-0 w-full bg-black/80 backdrop-blur-md border-b border-white/10 z-50"
```

#### Nav Links
```tsx
className="text-white/80 hover:text-white transition-colors duration-200"
```

### Form Elements

#### Input
```tsx
className="bg-white/10 border border-white/20 rounded-lg px-4 py-2 text-white placeholder-white/60 focus:border-white/40 focus:bg-white/15 transition-all duration-200"
```

#### Textarea
```tsx
className="bg-white/10 border border-white/20 rounded-lg px-4 py-3 text-white placeholder-white/60 focus:border-white/40 focus:bg-white/15 transition-all duration-200 resize-none"
```

## Layout Patterns

### Section Structure
```tsx
<section className="min-h-[100svh] py-24 bg-black relative overflow-hidden">
  <div className="max-w-6xl mx-auto px-6">
    {/* Content */}
  </div>
</section>
```

### Grid Layouts
- **Project Grid**: `grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6`
- **Feature Grid**: `grid grid-cols-1 md:grid-cols-2 gap-8`
- **Stats Grid**: `grid grid-cols-2 md:grid-cols-4 gap-4`

## Accessibility Guidelines

### Color Contrast
- Ensure minimum 4.5:1 contrast ratio for normal text
- Use `text-white` on dark backgrounds for optimal readability
- Provide focus indicators with `focus:ring-2 focus:ring-white/50`

### Interactive Elements
- All buttons include hover and focus states
- Use semantic HTML elements
- Provide proper ARIA labels where needed

## Implementation Guidelines

### CSS Custom Properties
Add to `globals.css`:
```css
@layer base {
  :root {
    --bg-primary: #0a0a0a;
    --bg-surface: rgba(255, 255, 255, 0.05);
    --text-primary: #ffffff;
    --text-muted: rgba(255, 255, 255, 0.6);
    --glass-bg: rgba(255, 255, 255, 0.1);
    --glass-border: rgba(255, 255, 255, 0.2);
  }
}

.glass-effect {
  @apply bg-white/10 backdrop-blur-sm border border-white/20;
}

.glass-strong {
  @apply bg-white/20 backdrop-blur-md border border-white/30;
}

.glass-subtle {
  @apply bg-white/5 backdrop-blur-sm border border-white/10;
}
```

### Tailwind Configuration
Extend `tailwind.config.ts`:
```typescript
theme: {
  extend: {
    colors: {
      'glass': {
        'bg': 'rgba(255, 255, 255, 0.1)',
        'border': 'rgba(255, 255, 255, 0.2)',
        'strong': 'rgba(255, 255, 255, 0.2)',
        'subtle': 'rgba(255, 255, 255, 0.05)'
      }
    },
    backdropBlur: {
      'xs': '2px',
    },
    animation: {
      'float': 'float 6s ease-in-out infinite',
      'glow': 'glow 2s ease-in-out infinite alternate',
    }
  }
}
```

## Component Library

### Reusable Components
1. **GlassCard** - Base card with glassmorphism effect
2. **GradientButton** - Button with gradient background
3. **FloatingElement** - Animated floating decorative elements
4. **SectionHeader** - Consistent section title styling
5. **ProjectCard** - Standardized project display card

### Usage Examples
```tsx
// Glass Card
<div className="glass-effect rounded-lg p-6">
  <h3 className="text-xl font-semibold text-white mb-4">Card Title</h3>
  <p className="text-white/80">Card content</p>
</div>

// Gradient Button
<button className="px-6 py-3 rounded-full bg-gradient-to-r from-blue-500/20 to-purple-500/20 text-white border border-white/20 hover:from-blue-500/30 hover:to-purple-500/30 backdrop-blur-sm transition-all duration-300 hover:scale-105">
  Click Me
</button>
```

## Brand Identity

### Visual Characteristics
- **Dark, sophisticated aesthetic** with high contrast
- **Glassmorphism effects** for modern, premium feel
- **Subtle animations** that enhance without distracting
- **Blue/purple/cyan accent palette** for technology focus
- **Clean typography** with generous spacing
- **Parallax effects** for depth and engagement

### Tone & Voice
- Professional yet approachable
- Innovation-focused
- Clean and minimal
- Technology-forward

This design system ensures consistent visual language across all components while maintaining the sophisticated dark glassmorphism aesthetic established in the hero section.