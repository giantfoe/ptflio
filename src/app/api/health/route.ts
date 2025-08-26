import { NextRequest, NextResponse } from 'next/server';
import { createYouTubeService } from '@/utils/youtube-service';
import { cacheManager } from '@/utils/cache-manager';
import { createApiLogger } from '@/utils/logger';

interface HealthCheckResult {
  service: string;
  status: 'healthy' | 'degraded' | 'unhealthy';
  responseTime?: number;
  error?: string;
  details?: Record<string, unknown>;
}

interface SystemHealthResponse {
  status: 'healthy' | 'degraded' | 'unhealthy';
  timestamp: string;
  uptime: number;
  services: HealthCheckResult[];
  summary: {
    total: number;
    healthy: number;
    degraded: number;
    unhealthy: number;
  };
}

export async function GET(request: NextRequest) {
  const apiLogger = createApiLogger('/api/health', request);
  const startTime = Date.now();
  
  try {
    apiLogger.info('Health check request started');
    
    const services: HealthCheckResult[] = [];
    
    // Check YouTube service health
    const youtubeStartTime = Date.now();
    try {
      const youtubeService = createYouTubeService();
      const youtubeHealth = await youtubeService.getHealthStatus();
      
      services.push({
        service: 'youtube',
        status: youtubeHealth.status,
        responseTime: Date.now() - youtubeStartTime,
        details: youtubeHealth.details,
        error: youtubeHealth.status === 'healthy' ? undefined : 'Service configuration or connectivity issues'
      });
    } catch (error) {
      services.push({
        service: 'youtube',
        status: 'unhealthy',
        responseTime: Date.now() - youtubeStartTime,
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
    
    // Check cache manager health
    const cacheStartTime = Date.now();
    try {
      const cacheHealth = await cacheManager.getHealthStatus();
      
      services.push({
        service: 'cache',
        status: cacheHealth.status,
        responseTime: Date.now() - cacheStartTime,
        details: cacheHealth.details,
        error: cacheHealth.status === 'healthy' ? undefined : 'Cache service issues detected'
      });
    } catch (error) {
      services.push({
        service: 'cache',
        status: 'unhealthy',
        responseTime: Date.now() - cacheStartTime,
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
    
    // Calculate summary
    const summary = {
      total: services.length,
      healthy: services.filter(s => s.status === 'healthy').length,
      degraded: services.filter(s => s.status === 'degraded').length,
      unhealthy: services.filter(s => s.status === 'unhealthy').length
    };
    
    // Determine overall system status
    let overallStatus: 'healthy' | 'degraded' | 'unhealthy';
    if (summary.unhealthy > 0) {
      overallStatus = 'unhealthy';
    } else if (summary.degraded > 0) {
      overallStatus = 'degraded';
    } else {
      overallStatus = 'healthy';
    }
    
    const requestDuration = Date.now() - startTime;
    
    const healthResponse: SystemHealthResponse = {
      status: overallStatus,
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      services,
      summary
    };
    
    apiLogger.info('Health check completed', {
      overallStatus,
      requestDuration,
      summary
    });
    
    // Return appropriate HTTP status based on health
    const httpStatus = overallStatus === 'healthy' ? 200 : 
                      overallStatus === 'degraded' ? 200 : 503;
    
    return NextResponse.json(healthResponse, { status: httpStatus });
    
  } catch (error: unknown) {
    const requestDuration = Date.now() - startTime;
    
    apiLogger.error('Health check failed with exception', {
      error: error instanceof Error ? error.message : 'Unknown error',
      requestDuration
    });
    
    return NextResponse.json(
      {
        status: 'unhealthy',
        timestamp: new Date().toISOString(),
        uptime: process.uptime(),
        services: [],
        summary: { total: 0, healthy: 0, degraded: 0, unhealthy: 0 },
        error: 'Health check system failure',
        details: {
          errorMessage: error instanceof Error ? error.message : 'Unknown error',
          requestDuration
        }
      },
      { status: 500 }
    );
  }
}