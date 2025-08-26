/**
 * Abstract Image Generator for Project Cards
 * Generates unique, professional abstract images for project display cards
 */

export interface AbstractImageConfig {
  prompt: string;
  imageSize: 'square_hd' | 'square' | 'portrait_4_3' | 'portrait_16_9' | 'landscape_4_3' | 'landscape_16_9';
  style: string;
}

// Abstract art styles for professional, investor-ready presentations
const ABSTRACT_STYLES = [
  'geometric minimalist abstract art with clean lines and modern color palette',
  'fluid organic shapes with gradient transitions in professional colors',
  'crystalline structures with prismatic light effects and contemporary design',
  'flowing wave patterns with depth and sophisticated color harmony',
  'architectural abstract forms with clean geometry and premium aesthetics',
  'digital mesh networks with nodes and connections in modern tech colors',
  'layered translucent shapes with depth and professional gradient overlays',
  'dynamic angular compositions with balanced negative space',
  'circular mandala patterns with modern interpretation and clean design',
  'intersecting planes with shadow play and contemporary color schemes'
];

// Professional color palettes suitable for investor presentations
const COLOR_PALETTES = [
  'deep blues and silver accents with white highlights',
  'emerald green and gold with cream undertones',
  'rich purple and platinum with soft gray gradients',
  'navy blue and copper with pearl white details',
  'charcoal and electric blue with metallic silver',
  'forest green and bronze with ivory highlights',
  'midnight blue and rose gold with pristine white',
  'slate gray and teal with champagne accents',
  'burgundy and silver with soft cream transitions',
  'indigo and amber with pearl gray undertones'
];

// Additional descriptive elements for variety
const VISUAL_ELEMENTS = [
  'with subtle texture and depth',
  'featuring smooth gradients and clean edges',
  'with layered transparency effects',
  'incorporating light and shadow interplay',
  'with balanced composition and negative space',
  'featuring dynamic movement and flow',
  'with crystalline clarity and precision',
  'incorporating organic curves and structure',
  'with sophisticated lighting effects',
  'featuring harmonious proportions and balance'
];

/**
 * Generates a unique abstract image configuration for a project
 * Uses project name as seed to ensure consistency while providing variety
 */
export function generateAbstractImageConfig(projectName: string): AbstractImageConfig {
  // Create a simple hash from project name for consistent selection
  const hash = projectName.split('').reduce((acc, char) => {
    return ((acc << 5) - acc + char.charCodeAt(0)) & 0xffffffff;
  }, 0);
  
  // Use hash to select consistent but varied elements
  const styleIndex = Math.abs(hash) % ABSTRACT_STYLES.length;
  const colorIndex = Math.abs(hash >> 8) % COLOR_PALETTES.length;
  const elementIndex = Math.abs(hash >> 16) % VISUAL_ELEMENTS.length;
  
  const style = ABSTRACT_STYLES[styleIndex];
  const colorPalette = COLOR_PALETTES[colorIndex];
  const visualElement = VISUAL_ELEMENTS[elementIndex];
  
  // Construct professional abstract art prompt
  const prompt = `Professional abstract art, ${style}, ${colorPalette}, ${visualElement}, high quality, modern design, suitable for business presentation, clean and sophisticated, 4K resolution, professional lighting`;
  
  return {
    prompt: encodeURIComponent(prompt),
    imageSize: 'landscape_4_3', // Good aspect ratio for project cards
    style: `${style} with ${colorPalette}`
  };
}

/**
 * Generates the complete image URL for a project
 */
export function getAbstractImageUrl(projectName: string): string {
  const config = generateAbstractImageConfig(projectName);
  return `https://trae-api-sg.mchost.guru/api/ide/v1/text_to_image?prompt=${config.prompt}&image_size=${config.imageSize}`;
}

/**
 * Generates multiple image variations for a project (for potential future use)
 */
export function getAbstractImageVariations(projectName: string, count: number = 3): string[] {
  const variations: string[] = [];
  
  for (let i = 0; i < count; i++) {
    // Add variation by modifying the hash slightly
    const variantName = `${projectName}_variant_${i}`;
    variations.push(getAbstractImageUrl(variantName));
  }
  
  return variations;
}

/**
 * Preview function to see what style will be generated for a project
 */
export function previewAbstractStyle(projectName: string): string {
  const config = generateAbstractImageConfig(projectName);
  return config.style;
}

/**
 * Fallback gradient generator for when images fail to load
 */
export function getFallbackGradient(projectName: string): string {
  const hash = projectName.split('').reduce((acc, char) => {
    return ((acc << 5) - acc + char.charCodeAt(0)) & 0xffffffff;
  }, 0);
  
  // Generate consistent but varied gradient colors
  const hue1 = Math.abs(hash) % 360;
  const hue2 = (hue1 + 60 + (Math.abs(hash >> 8) % 120)) % 360;
  const hue3 = (hue2 + 60 + (Math.abs(hash >> 16) % 120)) % 360;
  
  return `linear-gradient(135deg, hsl(${hue1}, 70%, 50%) 0%, hsl(${hue2}, 60%, 45%) 50%, hsl(${hue3}, 65%, 40%) 100%)`;
}