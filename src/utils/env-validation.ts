/**
 * Environment variable validation utilities
 * Detects placeholder values and provides helpful error messages
 */

import { logger } from './logger';

/**
 * Common placeholder patterns that indicate unconfigured environment variables
 */
const PLACEHOLDER_PATTERNS = [
  /^your-/i,
  /^placeholder/i,
  /^example/i,
  /^test-/i,
  /^dummy/i,
  /^fake/i,
  /^sample/i,
  /^xxx+$/i,
  /^sk-xxx/i, // OpenAI placeholder
  /^[a-z]+-[a-z]+-[a-z]+$/i, // Generic placeholder format
];

/**
 * Validation result interface
 */
export interface ValidationResult {
  isValid: boolean;
  error?: string;
  suggestion?: string;
}

/**
 * Validates if an environment variable contains a placeholder value
 * @param value - The environment variable value to validate
 * @param varName - The name of the environment variable for error messages
 * @returns ValidationResult indicating if the value is valid
 */
export function validateEnvVar(value: string | undefined, varName: string): ValidationResult {
  if (!value) {
    return {
      isValid: false,
      error: `Environment variable ${varName} is not set`,
      suggestion: `Please set ${varName} in your .env file`
    };
  }

  // Check for placeholder patterns
  const isPlaceholder = PLACEHOLDER_PATTERNS.some(pattern => pattern.test(value));
  
  if (isPlaceholder) {
    return {
      isValid: false,
      error: `Environment variable ${varName} contains a placeholder value: "${value}"`,
      suggestion: getEnvVarSuggestion(varName)
    };
  }

  // Check for obviously invalid values
  if (value.length < 3) {
    return {
      isValid: false,
      error: `Environment variable ${varName} appears to be too short: "${value}"`,
      suggestion: getEnvVarSuggestion(varName)
    };
  }

  return { isValid: true };
}

/**
 * Provides specific suggestions for different environment variables
 * @param varName - The environment variable name
 * @returns A helpful suggestion for obtaining the correct value
 */
function getEnvVarSuggestion(varName: string): string {
  const suggestions: Record<string, string> = {
    'INSTAGRAM_LONG_LIVED_TOKEN': 'Generate a long-lived access token via Facebook Graph API Explorer (https://developers.facebook.com/tools/explorer/)',
    'INSTAGRAM_USER_ID': 'Find your Instagram User ID using the Graph API Explorer or Instagram Basic Display API',
    'INSTAGRAM_APP_SECRET': 'Get your App Secret from your Facebook App dashboard',
    'YOUTUBE_API_KEY': 'Create an API key in Google Cloud Console with YouTube Data API v3 enabled',
    'YOUTUBE_CHANNEL_ID': 'Find your channel ID in YouTube Studio under Settings > Channel > Advanced settings',
    'GITHUB_TOKEN': 'Generate a personal access token in GitHub Settings > Developer settings > Personal access tokens',
    'GITHUB_USERNAME': 'Use your GitHub username',
  };

  return suggestions[varName] || `Please configure ${varName} with a valid value in your .env file`;
}

/**
 * Validates multiple environment variables and returns a summary
 * @param envVars - Object with environment variable names and values
 * @returns Object with validation results and overall status
 */
export function validateMultipleEnvVars(envVars: Record<string, string | undefined>) {
  const results: Record<string, ValidationResult> = {};
  const errors: string[] = [];
  const suggestions: string[] = [];

  for (const [varName, value] of Object.entries(envVars)) {
    const result = validateEnvVar(value, varName);
    results[varName] = result;

    if (!result.isValid) {
      errors.push(result.error!);
      if (result.suggestion) {
        suggestions.push(result.suggestion);
      }
    }
  }

  const isAllValid = errors.length === 0;
  
  if (!isAllValid) {
    logger.warn('Environment variable validation failed', {
      errors,
      suggestions,
      invalidVars: Object.keys(results).filter(key => !results[key].isValid)
    });
  }

  return {
    isAllValid,
    results,
    errors,
    suggestions,
    invalidCount: errors.length,
    totalCount: Object.keys(envVars).length
  };
}

/**
 * Creates a standardized error response for API routes when environment variables are invalid
 * @param serviceName - Name of the service (e.g., 'Instagram', 'YouTube')
 * @param validationResult - Result from validateMultipleEnvVars
 * @returns Formatted error object for API responses
 */
export function createConfigurationErrorResponse(serviceName: string, validationResult: ReturnType<typeof validateMultipleEnvVars>) {
  return {
    error: 'Configuration Error',
    message: `${serviceName} API is not properly configured`,
    details: {
      service: serviceName,
      invalidVariables: validationResult.invalidCount,
      totalVariables: validationResult.totalCount,
      errors: validationResult.errors,
      suggestions: validationResult.suggestions
    },
    timestamp: new Date().toISOString()
  };
}

/**
 * Creates a standardized error response object for simple validation failures
 * @param message - Error message
 * @param invalidVars - Array of invalid variable names
 * @param suggestions - Array of suggestions
 * @returns Formatted error object
 */
export function createSimpleConfigurationError(message: string, invalidVars: string[], suggestions: string[]) {
  return {
    error: 'Configuration Error',
    message,
    details: {
      invalidVariables: invalidVars.length,
      totalVariables: invalidVars.length,
      errors: invalidVars.map(v => `${v} is not properly configured`),
      suggestions
    },
    timestamp: new Date().toISOString()
  };
}