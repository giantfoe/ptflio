interface ProjectData {
  repository: {
    name: string;
    description: string | null;
    topics: string[];
    language: string | null;
    stargazers_count: number;
    forks_count: number;
    open_issues_count: number;
    license: {
      name: string;
      spdx_id: string;
    } | null;
  };
  languages: Array<{
    name: string;
    percentage: number;
    bytes: number;
  }>;
  readme: string;
  releases: Array<{
    tag_name: string;
    name: string;
    published_at: string;
  }>;
}

export interface AIGeneratedDescription {
  summary: string;
  purpose: string;
  keyFeatures: string[];
  technologies: string[];
  useCases: string[];
  architecture: string;
  highlights: string[];
}

export class AIDescriptionGenerator {
  private static extractKeywords(text: string): string[] {
    const keywords = text
      .toLowerCase()
      .replace(/[^a-z0-9\s]/g, ' ')
      .split(/\s+/)
      .filter(word => word.length > 3)
      .filter(word => !['this', 'that', 'with', 'from', 'they', 'have', 'will', 'been', 'were', 'said', 'each', 'which', 'their', 'time', 'would', 'there', 'could', 'other'].includes(word));
    
    return [...new Set(keywords)].slice(0, 10);
  }

  private static analyzeTechnologies(data: ProjectData): string[] {
    const technologies = new Set<string>();
    
    // Add primary language
    if (data.repository.language) {
      technologies.add(data.repository.language);
    }
    
    // Add languages from language breakdown
    data.languages.forEach(lang => {
      if (lang.percentage > 5) { // Only include languages with >5% usage
        technologies.add(lang.name);
      }
    });
    
    // Add topics as technologies
    data.repository.topics.forEach(topic => {
      technologies.add(topic.charAt(0).toUpperCase() + topic.slice(1));
    });
    
    // Extract technologies from README
    const readmeText = data.readme.toLowerCase();
    const commonTechs = [
      'react', 'vue', 'angular', 'svelte', 'next.js', 'nuxt', 'gatsby',
      'node.js', 'express', 'fastify', 'koa', 'nestjs',
      'typescript', 'javascript', 'python', 'java', 'go', 'rust', 'php',
      'mongodb', 'postgresql', 'mysql', 'redis', 'sqlite',
      'docker', 'kubernetes', 'aws', 'azure', 'gcp',
      'tailwind', 'bootstrap', 'sass', 'css3', 'html5',
      'webpack', 'vite', 'rollup', 'parcel',
      'jest', 'cypress', 'playwright', 'testing-library',
      'graphql', 'rest', 'api', 'microservices',
      'firebase', 'supabase', 'prisma', 'sequelize'
    ];
    
    commonTechs.forEach(tech => {
      if (readmeText.includes(tech.toLowerCase())) {
        technologies.add(tech);
      }
    });
    
    return Array.from(technologies).slice(0, 8);
  }

  private static generatePurpose(data: ProjectData): string {
    const { repository, readme } = data;
    
    if (repository.description) {
      return repository.description;
    }
    
    // Extract purpose from README
    const readmeLines = readme.split('\n').filter(line => line.trim());
    const purposeIndicators = ['## purpose', '## about', '## description', '## overview', '## what is'];
    
    for (const line of readmeLines) {
      const lowerLine = line.toLowerCase();
      if (purposeIndicators.some(indicator => lowerLine.includes(indicator))) {
        const nextLineIndex = readmeLines.indexOf(line) + 1;
        if (nextLineIndex < readmeLines.length) {
          return readmeLines[nextLineIndex].replace(/^#+\s*/, '').trim();
        }
      }
    }
    
    // Fallback: use first meaningful paragraph
    const firstParagraph = readmeLines.find(line => 
      line.length > 50 && 
      !line.startsWith('#') && 
      !line.startsWith('```') &&
      !line.startsWith('![') &&
      !line.startsWith('[!')
    );
    
    return firstParagraph || `A ${repository.language || 'software'} project focused on innovative solutions.`;
  }

  private static extractFeatures(readme: string): string[] {
    const features: string[] = [];
    const lines = readme.split('\n');
    
    let inFeaturesSection = false;
    const featureIndicators = ['## features', '## functionality', '## capabilities', '## what it does'];
    
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].toLowerCase().trim();
      
      if (featureIndicators.some(indicator => line.includes(indicator))) {
        inFeaturesSection = true;
        continue;
      }
      
      if (inFeaturesSection) {
        if (line.startsWith('##') || line.startsWith('#')) {
          break; // End of features section
        }
        
        if (line.startsWith('- ') || line.startsWith('* ') || line.match(/^\d+\./)) {
          const feature = lines[i].replace(/^[-*]\s*|^\d+\.\s*/, '').trim();
          if (feature.length > 10) {
            features.push(feature);
          }
        }
      }
    }
    
    return features.slice(0, 6);
  }

  private static generateUseCases(data: ProjectData): string[] {
    const { repository, languages } = data;
    const useCases: string[] = [];
    
    // Generate use cases based on primary language and topics
    const primaryLang = languages[0]?.name.toLowerCase();
    const topics = repository.topics.map(t => t.toLowerCase());
    
    if (primaryLang === 'javascript' || primaryLang === 'typescript') {
      if (topics.includes('react') || topics.includes('frontend')) {
        useCases.push('Building modern web applications with interactive user interfaces');
        useCases.push('Creating responsive single-page applications (SPAs)');
      }
      if (topics.includes('node') || topics.includes('backend')) {
        useCases.push('Developing scalable server-side applications and APIs');
        useCases.push('Building microservices and distributed systems');
      }
    }
    
    if (primaryLang === 'python') {
      useCases.push('Data analysis and machine learning applications');
      useCases.push('Automation and scripting solutions');
      if (topics.includes('web') || topics.includes('django') || topics.includes('flask')) {
        useCases.push('Web development and API creation');
      }
    }
    
    if (topics.includes('mobile') || topics.includes('ios') || topics.includes('android')) {
      useCases.push('Cross-platform mobile application development');
    }
    
    if (topics.includes('cli') || topics.includes('tool')) {
      useCases.push('Command-line tools and developer utilities');
    }
    
    // Generic use cases if none specific found
    if (useCases.length === 0) {
      useCases.push('Educational and learning purposes');
      useCases.push('Open-source contribution and collaboration');
      useCases.push('Portfolio and demonstration projects');
    }
    
    return useCases.slice(0, 4);
  }

  private static generateArchitecture(data: ProjectData): string {
    const { languages, repository } = data;
    const primaryLang = languages[0]?.name || 'Unknown';
    const topics = repository.topics;
    
    let architecture = `Built primarily with ${primaryLang}`;
    
    if (languages.length > 1) {
      const secondaryLangs = languages.slice(1, 3).map(l => l.name).join(' and ');
      architecture += `, incorporating ${secondaryLangs}`;
    }
    
    if (topics.includes('microservices')) {
      architecture += '. Follows microservices architecture pattern';
    } else if (topics.includes('monorepo')) {
      architecture += '. Organized as a monorepo structure';
    } else if (topics.includes('mvc')) {
      architecture += '. Implements Model-View-Controller (MVC) pattern';
    } else {
      architecture += '. Follows modern software development practices';
    }
    
    return architecture + '.';
  }

  private static generateHighlights(data: ProjectData): string[] {
    const highlights: string[] = [];
    const { repository, releases, languages } = data;
    
    if (repository.stargazers_count > 10) {
      highlights.push(`⭐ ${repository.stargazers_count} GitHub stars`);
    }
    
    if (repository.forks_count > 5) {
      highlights.push(`🍴 ${repository.forks_count} forks`);
    }
    
    if (releases.length > 0) {
      highlights.push(`🚀 ${releases.length} releases`);
    }
    
    if (languages.length > 3) {
      highlights.push(`🔧 Multi-language project (${languages.length} languages)`);
    }
    
    if (repository.license) {
      highlights.push(`📄 ${repository.license.name} license`);
    }
    
    if (repository.topics.length > 0) {
      highlights.push(`🏷️ ${repository.topics.length} topics`);
    }
    
    return highlights.slice(0, 4);
  }

  public static generateDescription(data: ProjectData): AIGeneratedDescription {
    const technologies = this.analyzeTechnologies(data);
    const purpose = this.generatePurpose(data);
    const features = this.extractFeatures(data.readme);
    const useCases = this.generateUseCases(data);
    const architecture = this.generateArchitecture(data);
    const highlights = this.generateHighlights(data);
    
    const summary = `${purpose} This ${data.repository.language || 'software'} project demonstrates modern development practices and showcases innovative solutions in the ${technologies.slice(0, 2).join(' and ')} ecosystem.`;
    
    return {
      summary,
      purpose,
      keyFeatures: features.length > 0 ? features : [
        'Clean and maintainable codebase',
        'Modern development practices',
        'Comprehensive documentation',
        'Active development and updates'
      ],
      technologies,
      useCases,
      architecture,
      highlights
    };
  }
}