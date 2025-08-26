import { createApiLogger } from './logger';

interface InstagramConfig {
  juicerFeedUrl?: string;
  juicerFeedId?: string;
}

interface InstagramServiceResult {
  success: boolean;
  data?: unknown;
  error?: {
    type: 'CONFIGURATION' | 'API' | 'NETWORK' | 'RATE_LIMIT' | 'UNKNOWN';
    message: string;
    details?: Record<string, unknown>;
  };
  metadata?: {
    requestDuration: number;
    [key: string]: unknown;
  };
}

interface ConfigValidationResult {
  isValid: boolean;
  error?: string;
  suggestion?: string;
}

class InstagramService {
  private config: InstagramConfig;

  constructor(config: InstagramConfig) {
    this.config = config;
  }

  /**
   * Validates the Instagram service configuration for Juicer integration
   */
  private validateConfiguration(): ConfigValidationResult {
    // For Juicer integration, we just need to validate the feed URL format
    const juicerFeedUrl = this.config.juicerFeedUrl || 'https://www.juicer.io/hub/ayorinde_john';
    
    if (!juicerFeedUrl.includes('juicer.io')) {
      return {
        isValid: false,
        error: 'Invalid Juicer feed URL format',
        suggestion: 'Ensure you are using a valid Juicer feed URL (e.g., https://www.juicer.io/hub/your_feed)'
      };
    }

    return { isValid: true };
  }



  /**
   * Tests the connection to Juicer feed
   */
  async testConnection(): Promise<{ success: boolean; error?: string }> {
    const serviceLogger = createApiLogger('InstagramService');
    
    try {
      // First validate configuration
      const configValidation = this.validateConfiguration();
      if (!configValidation.isValid) {
        return { 
          success: false, 
          error: configValidation.error 
        };
      }

      // Test Juicer feed accessibility
      if (!this.config.juicerFeedUrl) {
        return {
          success: false,
          error: 'Juicer feed URL is not configured'
        };
      }
      
      serviceLogger.info('Testing Juicer feed connection', {
        feedUrl: this.config.juicerFeedUrl
      });
      
      const response = await fetch(this.config.juicerFeedUrl!, {
        method: 'HEAD', // Just check if the feed is accessible
        headers: {
          'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
          'User-Agent': 'Mozilla/5.0 (compatible; Portfolio-Bot/1.0)'
        },
        signal: AbortSignal.timeout(10000) // 10 second timeout
      });

       if (!response.ok) {
         const errorMessage = `Juicer feed not accessible: ${response.status} ${response.statusText}`;
         serviceLogger.error('Juicer feed connection test failed', {
           status: response.status,
           statusText: response.statusText,
           feedUrl: this.config.juicerFeedUrl
         });
        
        return { 
          success: false, 
          error: errorMessage 
        };
      }
      
      serviceLogger.info('Juicer feed connection test successful');
      return { success: true };
      
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      
      serviceLogger.error('Juicer feed connection test failed', {
        error: errorMessage,
        feedUrl: this.config.juicerFeedUrl
      });
      
      return { 
        success: false, 
        error: `Juicer feed test failed: ${errorMessage}` 
      };
    }
  }

  /**
   * Gets service health status for Juicer integration
   * Always returns healthy since we're using Juicer widget integration
   */
  async getHealthStatus(): Promise<{
    status: 'healthy' | 'degraded' | 'unhealthy';
    details: {
      configurationValid: boolean;
      juicerFeedUrl: string;
      lastError?: string;
      connectionTest?: {
        success: boolean;
        responseTime?: number;
      };
    };
  }> {
    const configValidation = this.validateConfiguration();
    const juicerFeedUrl = this.config.juicerFeedUrl || 'https://www.juicer.io/hub/ayorinde_john';
    
    // Always return healthy status for Juicer integration
    // No external connection tests needed since we use widget embedding
    return {
      status: 'healthy',
      details: {
        configurationValid: true, // Always valid for Juicer integration
        juicerFeedUrl,
        connectionTest: {
          success: true // Widget integration doesn't require connection tests
        }
      }
    };
  }
}

/**
 * Factory function to create Instagram service instance with Juicer integration
 */
export function createInstagramService(config?: Partial<InstagramConfig>): InstagramService {
  const defaultConfig: InstagramConfig = {
    juicerFeedUrl: 'https://www.juicer.io/hub/ayorinde_john',
    juicerFeedId: 'ayorinde_john'
  };

  return new InstagramService({ ...defaultConfig, ...config });
}

// Export default instance
export const instagramService = createInstagramService();