'use client';

export interface TechnologyGroup {
  name: string;
  technologies: Array<{
    name: string;
    percentage: number;
    bytes: number;
  }>;
  totalPercentage: number;
  color: string;
  icon: string;
}

export interface TechnologyIcon {
  name: string;
  icon: string;
  color: string;
}

// Technology categorization mapping
const TECHNOLOGY_CATEGORIES = {
  frontend: {
    name: 'Frontend',
    color: 'bg-blue-500',
    icon: '🎨',
    technologies: [
      'JavaScript', 'TypeScript', 'React', 'Vue', 'Angular', 'Svelte',
      'HTML', 'CSS', 'SCSS', 'Sass', 'Less', 'Tailwind CSS', 'Bootstrap',
      'Next.js', 'Nuxt.js', 'Gatsby', 'Vite', 'Webpack', 'Parcel',
      'jQuery', 'Alpine.js', 'Stimulus', 'Lit', 'Stencil'
    ]
  },
  backend: {
    name: 'Backend',
    color: 'bg-green-500',
    icon: '⚙️',
    technologies: [
      'Node.js', 'Python', 'Java', 'Go', 'Rust', 'PHP', 'C#', 'Ruby',
      'C++', 'C', 'Kotlin', 'Scala', 'Elixir', 'Erlang', 'Haskell',
      'Express.js', 'FastAPI', 'Django', 'Flask', 'Spring', 'Laravel',
      'Rails', 'ASP.NET', 'Gin', 'Echo', 'Fiber'
    ]
  },
  database: {
    name: 'Database',
    color: 'bg-purple-500',
    icon: '🗄️',
    technologies: [
      'MongoDB', 'PostgreSQL', 'MySQL', 'Redis', 'SQLite', 'MariaDB',
      'CouchDB', 'Cassandra', 'DynamoDB', 'Firebase Firestore',
      'Supabase', 'PlanetScale', 'Prisma', 'TypeORM', 'Sequelize',
      'Mongoose', 'Drizzle', 'Knex.js'
    ]
  },
  mobile: {
    name: 'Mobile',
    color: 'bg-pink-500',
    icon: '📱',
    technologies: [
      'React Native', 'Flutter', 'Swift', 'Kotlin', 'Dart',
      'Xamarin', 'Ionic', 'Cordova', 'PhoneGap', 'NativeScript',
      'Expo', 'Capacitor'
    ]
  },
  devops: {
    name: 'DevOps & Cloud',
    color: 'bg-orange-500',
    icon: '☁️',
    technologies: [
      'Docker', 'Kubernetes', 'AWS', 'Azure', 'GCP', 'Firebase',
      'Vercel', 'Netlify', 'Heroku', 'DigitalOcean', 'Terraform',
      'Ansible', 'Jenkins', 'GitHub Actions', 'GitLab CI', 'CircleCI',
      'Travis CI', 'Nginx', 'Apache', 'Cloudflare'
    ]
  },
  tools: {
    name: 'Tools & Others',
    color: 'bg-gray-500',
    icon: '🔧',
    technologies: [
      'Git', 'GitHub', 'GitLab', 'Bitbucket', 'ESLint', 'Prettier',
      'Jest', 'Vitest', 'Cypress', 'Playwright', 'Storybook',
      'Figma', 'Adobe XD', 'Sketch', 'Postman', 'Insomnia',
      'VS Code', 'WebStorm', 'Vim', 'Emacs'
    ]
  }
};

// Technology icons mapping
const TECHNOLOGY_ICONS: Record<string, TechnologyIcon> = {
  // Frontend
  'JavaScript': { name: 'JavaScript', icon: '🟨', color: 'bg-yellow-500' },
  'TypeScript': { name: 'TypeScript', icon: '🔷', color: 'bg-blue-600' },
  'React': { name: 'React', icon: '⚛️', color: 'bg-cyan-500' },
  'Vue': { name: 'Vue', icon: '💚', color: 'bg-green-500' },
  'Angular': { name: 'Angular', icon: '🅰️', color: 'bg-red-600' },
  'HTML': { name: 'HTML', icon: '🌐', color: 'bg-orange-600' },
  'CSS': { name: 'CSS', icon: '🎨', color: 'bg-blue-500' },
  'SCSS': { name: 'SCSS', icon: '💅', color: 'bg-pink-500' },
  'Sass': { name: 'Sass', icon: '💅', color: 'bg-pink-500' },
  
  // Backend
  'Python': { name: 'Python', icon: '🐍', color: 'bg-blue-500' },
  'Java': { name: 'Java', icon: '☕', color: 'bg-red-500' },
  'Go': { name: 'Go', icon: '🐹', color: 'bg-cyan-600' },
  'Rust': { name: 'Rust', icon: '🦀', color: 'bg-orange-700' },
  'PHP': { name: 'PHP', icon: '🐘', color: 'bg-purple-600' },
  'C#': { name: 'C#', icon: '🔷', color: 'bg-purple-700' },
  'Ruby': { name: 'Ruby', icon: '💎', color: 'bg-red-700' },
  
  // Database
  'MongoDB': { name: 'MongoDB', icon: '🍃', color: 'bg-green-700' },
  'PostgreSQL': { name: 'PostgreSQL', icon: '🐘', color: 'bg-blue-700' },
  'MySQL': { name: 'MySQL', icon: '🐬', color: 'bg-orange-600' },
  'Redis': { name: 'Redis', icon: '🔴', color: 'bg-red-600' },
  'SQLite': { name: 'SQLite', icon: '💾', color: 'bg-gray-600' },
  
  // DevOps
  'Docker': { name: 'Docker', icon: '🐳', color: 'bg-blue-600' },
  'Kubernetes': { name: 'Kubernetes', icon: '☸️', color: 'bg-blue-700' },
  'AWS': { name: 'AWS', icon: '☁️', color: 'bg-orange-500' },
  'Firebase': { name: 'Firebase', icon: '🔥', color: 'bg-yellow-600' },
  'Vercel': { name: 'Vercel', icon: '▲', color: 'bg-black' },
  'Netlify': { name: 'Netlify', icon: '🌐', color: 'bg-teal-600' },
};

/**
 * Categorizes technologies into groups based on their type
 */
export function groupTechnologies(languages: Record<string, number>): TechnologyGroup[] {
  const totalBytes = Object.values(languages).reduce((sum, bytes) => sum + bytes, 0);
  const groups: Record<string, TechnologyGroup> = {};
  
  // Initialize groups
  Object.entries(TECHNOLOGY_CATEGORIES).forEach(([key, category]) => {
    groups[key] = {
      name: category.name,
      technologies: [],
      totalPercentage: 0,
      color: category.color,
      icon: category.icon
    };
  });
  
  // Categorize each technology
  Object.entries(languages).forEach(([techName, bytes]) => {
    const percentage = totalBytes > 0 ? Math.round((bytes / totalBytes) * 100) : 0;
    const technology = {
      name: techName,
      percentage,
      bytes
    };
    
    let categorized = false;
    
    // Find the appropriate category
    Object.entries(TECHNOLOGY_CATEGORIES).forEach(([key, category]) => {
      if (category.technologies.some(tech => 
        tech.toLowerCase() === techName.toLowerCase() ||
        techName.toLowerCase().includes(tech.toLowerCase()) ||
        tech.toLowerCase().includes(techName.toLowerCase())
      )) {
        groups[key].technologies.push(technology);
        groups[key].totalPercentage += percentage;
        categorized = true;
      }
    });
    
    // If not categorized, add to tools/others
    if (!categorized) {
      groups.tools.technologies.push(technology);
      groups.tools.totalPercentage += percentage;
    }
  });
  
  // Sort technologies within each group by percentage
  Object.values(groups).forEach(group => {
    group.technologies.sort((a, b) => b.percentage - a.percentage);
  });
  
  // Return only groups that have technologies, sorted by total percentage
  return Object.values(groups)
    .filter(group => group.technologies.length > 0)
    .sort((a, b) => b.totalPercentage - a.totalPercentage);
}

/**
 * Gets the icon for a specific technology
 */
export function getTechnologyIcon(techName: string): TechnologyIcon | null {
  return TECHNOLOGY_ICONS[techName] || null;
}

/**
 * Gets the primary (most used) technology from languages
 */
export function getPrimaryTechnology(languages: Record<string, number>): {
  name: string;
  percentage: number;
  icon: TechnologyIcon | null;
} | null {
  const totalBytes = Object.values(languages).reduce((sum, bytes) => sum + bytes, 0);
  
  if (totalBytes === 0) return null;
  
  const [primaryTech, bytes] = Object.entries(languages)
    .sort(([, a], [, b]) => b - a)[0];
  
  const percentage = Math.round((bytes / totalBytes) * 100);
  const icon = getTechnologyIcon(primaryTech);
  
  return {
    name: primaryTech,
    percentage,
    icon
  };
}

/**
 * Formats repository size in human readable format
 */
export function formatRepositorySize(sizeInKB: number): string {
  const sizes = ['KB', 'MB', 'GB'];
  let size = sizeInKB;
  let unitIndex = 0;
  
  while (size >= 1024 && unitIndex < sizes.length - 1) {
    size /= 1024;
    unitIndex++;
  }
  
  return `${Math.round(size * 100) / 100} ${sizes[unitIndex]}`;
}

/**
 * Gets total lines of code estimate based on repository size and languages
 */
export function estimateLinesOfCode(languages: Record<string, number>): number {
  // Rough estimation: average of 50 characters per line
  const totalBytes = Object.values(languages).reduce((sum, bytes) => sum + bytes, 0);
  return Math.round(totalBytes / 50);
}