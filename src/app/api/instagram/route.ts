import { NextResponse } from 'next/server'
import { mapInstagramResponse, type InstagramResponse } from '../../../utils/mapInstagram'
import { logger } from '../../../utils/logger'
import { validateMultipleEnvVars, createConfigurationErrorResponse } from '../../../utils/env-validation'

const REVALIDATE_SECONDS = 900 // 15 minutes
const TAG = 'instagram'

function envOrThrow(name: string): string {
  const v = process.env[name]
  if (!v) throw new Error(`Missing required env var: ${name}`)
  return v
}

export async function GET() {
  try {
    // Validate environment variables first
    const envVars = {
      'INSTAGRAM_LONG_LIVED_TOKEN': process.env.INSTAGRAM_LONG_LIVED_TOKEN,
      'INSTAGRAM_USER_ID': process.env.INSTAGRAM_USER_ID,
    }

    const validation = validateMultipleEnvVars(envVars)
    
    if (!validation.isAllValid) {
      logger.error('Instagram API configuration invalid', {
        service: 'instagram',
        errors: validation.errors,
        suggestions: validation.suggestions
      })
      
      const errorResponse = createConfigurationErrorResponse('Instagram', validation)
      return NextResponse.json(errorResponse, { status: 503 })
    }

    const ACCESS_TOKEN = envOrThrow('INSTAGRAM_LONG_LIVED_TOKEN')
    const USER_ID = envOrThrow('INSTAGRAM_USER_ID')

    logger.info('Fetching Instagram media', {
      service: 'instagram',
      userId: USER_ID.substring(0, 8) + '...', // Log partial ID for privacy
      endpoint: 'media'
    })

    const params = new URLSearchParams({
      fields:
        'id,caption,media_type,media_url,permalink,thumbnail_url,timestamp',
      access_token: ACCESS_TOKEN,
      limit: '10',
    })

    const url = `https://graph.instagram.com/${USER_ID}/media?${params.toString()}`

    const res = await fetch(url, {
      method: 'GET',
      next: { revalidate: REVALIDATE_SECONDS, tags: [TAG] },
    })

    if (!res.ok) {
      const text = await res.text()
      logger.error('Instagram API request failed', {
        service: 'instagram',
        status: res.status,
        statusText: res.statusText,
        url: url.replace(ACCESS_TOKEN, '[REDACTED]'), // Remove token from logs
        response: text
      })
      
      return NextResponse.json(
        { 
          error: 'Instagram API error', 
          message: 'Failed to fetch Instagram media',
          status: res.status, 
          details: res.status === 400 ? 'Invalid access token or user ID' : text,
          suggestions: res.status === 400 ? [
            'Check if your Instagram access token is valid and not expired',
            'Verify your Instagram User ID is correct',
            'Ensure your access token has the required permissions'
          ] : []
        },
        { status: 502 }
      )
    }

    const data: InstagramResponse = await res.json()
    const items = mapInstagramResponse(data)

    logger.info('Instagram media fetched successfully', {
      service: 'instagram',
      count: items.length,
      cacheTag: TAG
    })

    return NextResponse.json(
      {
        source: 'instagram',
        count: items.length,
        items,
      },
      { headers: { 'Cache-Tag': TAG } }
    )
  } catch (err: unknown) {
    const error = err as Error;
    
    logger.error('Instagram API unexpected error', {
      service: 'instagram',
      error: error.message,
      stack: error.stack
    })
    
    return NextResponse.json(
      { 
        error: 'Instagram API Error',
        message: error?.message || 'Unexpected error occurred while fetching Instagram data',
        service: 'instagram',
        timestamp: new Date().toISOString()
      },
      { status: 500 }
    )
  }
}