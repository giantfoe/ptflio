/**
 * Accessibility utilities for liquid glass components
 * Ensures WCAG 2.1 AA compliance for contrast ratios and readability
 */

// WCAG 2.1 AA contrast ratio requirements
const CONTRAST_RATIOS = {
  NORMAL_TEXT: 4.5,
  LARGE_TEXT: 3.0,
  UI_COMPONENTS: 3.0
} as const;

/**
 * Calculate relative luminance of a color
 * Based on WCAG 2.1 formula
 */
function getLuminance(r: number, g: number, b: number): number {
  const [rs, gs, bs] = [r, g, b].map(c => {
    c = c / 255;
    return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
  });
  return 0.2126 * rs + 0.7152 * gs + 0.0722 * bs;
}

/**
 * Calculate contrast ratio between two colors
 */
function getContrastRatio(color1: [number, number, number], color2: [number, number, number]): number {
  const lum1 = getLuminance(...color1);
  const lum2 = getLuminance(...color2);
  const brightest = Math.max(lum1, lum2);
  const darkest = Math.min(lum1, lum2);
  return (brightest + 0.05) / (darkest + 0.05);
}

/**
 * Convert hex color to RGB
 */
function hexToRgb(hex: string): [number, number, number] | null {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result ? [
    parseInt(result[1], 16),
    parseInt(result[2], 16),
    parseInt(result[3], 16)
  ] : null;
}

/**
 * Validate contrast ratio for text readability
 */
export function validateTextContrast(
  textColor: string,
  backgroundColor: string,
  isLargeText: boolean = false
): { isValid: boolean; ratio: number; required: number } {
  const textRgb = hexToRgb(textColor);
  const bgRgb = hexToRgb(backgroundColor);
  
  if (!textRgb || !bgRgb) {
    return { isValid: false, ratio: 0, required: 0 };
  }
  
  const ratio = getContrastRatio(textRgb, bgRgb);
  const required = isLargeText ? CONTRAST_RATIOS.LARGE_TEXT : CONTRAST_RATIOS.NORMAL_TEXT;
  
  return {
    isValid: ratio >= required,
    ratio: Math.round(ratio * 100) / 100,
    required
  };
}

/**
 * Get accessible text color for liquid glass backgrounds
 */
export function getAccessibleTextColor(backgroundColor: string): string {
  const bgRgb = hexToRgb(backgroundColor);
  if (!bgRgb) return '#ffffff';
  
  const luminance = getLuminance(...bgRgb);
  
  // For dark backgrounds (low luminance), use light text
  // For light backgrounds (high luminance), use dark text
  return luminance > 0.5 ? '#000000' : '#ffffff';
}

/**
 * Liquid glass color palette with accessibility considerations
 */
export const ACCESSIBLE_GLASS_COLORS = {
  // Background colors with sufficient opacity for readability
  backgrounds: {
    light: 'rgba(255, 255, 255, 0.15)', // Light glass with 15% opacity
    medium: 'rgba(255, 255, 255, 0.10)', // Medium glass with 10% opacity
    dark: 'rgba(0, 0, 0, 0.20)', // Dark glass with 20% opacity
    accent: 'rgba(59, 130, 246, 0.15)', // Blue accent with 15% opacity
  },
  
  // Text colors that work well with glass backgrounds
  text: {
    primary: '#ffffff', // White text for dark backgrounds
    secondary: 'rgba(255, 255, 255, 0.80)', // Semi-transparent white
    muted: 'rgba(255, 255, 255, 0.60)', // More transparent white
    accent: '#60a5fa', // Light blue for accents
  },
  
  // Border colors for glass elements
  borders: {
    subtle: 'rgba(255, 255, 255, 0.20)',
    medium: 'rgba(255, 255, 255, 0.30)',
    strong: 'rgba(255, 255, 255, 0.40)',
  }
} as const;

/**
 * Validate liquid glass component accessibility
 */
export function validateGlassAccessibility(component: {
  textColor: string;
  backgroundColor: string;
  borderColor?: string;
  isInteractive?: boolean;
}): {
  isAccessible: boolean;
  issues: string[];
  suggestions: string[];
} {
  const issues: string[] = [];
  const suggestions: string[] = [];
  
  // Check text contrast
  const textContrast = validateTextContrast(component.textColor, component.backgroundColor);
  if (!textContrast.isValid) {
    issues.push(`Text contrast ratio ${textContrast.ratio} is below required ${textContrast.required}`);
    suggestions.push('Increase text opacity or use a more contrasting color');
  }
  
  // Check interactive element contrast if applicable
  if (component.isInteractive && component.borderColor) {
    const borderContrast = validateTextContrast(component.borderColor, component.backgroundColor);
    if (!borderContrast.isValid) {
      issues.push('Interactive element border has insufficient contrast');
      suggestions.push('Increase border opacity or use a more contrasting border color');
    }
  }
  
  return {
    isAccessible: issues.length === 0,
    issues,
    suggestions
  };
}

/**
 * Generate focus styles for liquid glass components
 */
export function getFocusStyles(variant: 'subtle' | 'medium' | 'strong' = 'medium'): string {
  const focusRings = {
    subtle: 'focus:ring-2 focus:ring-white/30 focus:ring-offset-2 focus:ring-offset-transparent',
    medium: 'focus:ring-2 focus:ring-white/50 focus:ring-offset-2 focus:ring-offset-transparent',
    strong: 'focus:ring-3 focus:ring-white/70 focus:ring-offset-2 focus:ring-offset-transparent'
  };
  
  return `focus:outline-none ${focusRings[variant]} focus:border-white/60`;
}

/**
 * Check if reduced motion is preferred
 */
export function prefersReducedMotion(): boolean {
  if (typeof window === 'undefined') return false;
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

/**
 * Get animation classes based on user preferences
 */
export function getAccessibleAnimationClasses(defaultClasses: string, reducedClasses?: string): string {
  if (prefersReducedMotion()) {
    return reducedClasses || 'transition-none';
  }
  return defaultClasses;
}