import { NextRequest, NextResponse } from 'next/server'
import { readFile } from 'fs/promises'
import path from 'path'
import { createApiLogger, PerformanceTimer } from '@/utils/logger'
import { validateMultipleEnvVars, createSimpleConfigurationError } from '@/utils/env-validation'

const REVALIDATE_SECONDS = 300 // 5 minutes
const TAG = 'github'

function envOrThrow(name: string): string {
  const v = process.env[name]
  if (!v) throw new Error(`Missing required env var: ${name}`)
  return v
}

export async function GET(request: NextRequest) {
  const logger = createApiLogger('/api/github', request)
  const timer = new PerformanceTimer('fetch-github-repos', logger)
  
  // Validate environment variables
  const envVars = {
    'GITHUB_USERNAME': process.env.GITHUB_USERNAME
  }
  
  const envValidation = validateMultipleEnvVars(envVars)
  
  if (!envValidation.isAllValid) {
    logger.error('GitHub API configuration invalid', {
      invalidVars: Object.keys(envVars).filter(key => !envValidation.results[key].isValid),
      suggestions: envValidation.suggestions
    })
    const errorResponse = createSimpleConfigurationError(
      'GitHub API is not properly configured',
      Object.keys(envVars).filter(key => !envValidation.results[key].isValid),
      envValidation.suggestions
    )
    return NextResponse.json(errorResponse, { status: 503 })
  }
  
  const USERNAME = envOrThrow('GITHUB_USERNAME')
  const TOKEN = process.env['GITHUB_TOKEN']
  
  try {
    
    logger.info('Starting GitHub repositories fetch', {
      username: USERNAME,
      hasToken: !!TOKEN
    })

    const url = `https://api.github.com/users/${encodeURIComponent(USERNAME)}/repos?per_page=100`

    const headers: Record<string, string> = {
      Accept: 'application/vnd.github+json',
      'User-Agent': 'ptflio-portfolio',
    }

    if (TOKEN) headers.Authorization = `Bearer ${TOKEN}`

    const res = await fetch(url, {
      method: 'GET',
      headers,
      next: { revalidate: REVALIDATE_SECONDS, tags: [TAG] },
    })

    if (!res.ok) {
      const text = await res.text()
      logger.error('GitHub API request failed', {
        statusCode: res.status,
        statusText: res.statusText,
        url: url.replace(TOKEN || '', '[REDACTED]'),
        responseBody: text.substring(0, 500) // Limit response body length
      })
      
      let errorMessage = 'GitHub API request failed'
      let suggestions: string[] = []
      
      if (res.status === 401) {
        errorMessage = 'GitHub API authentication failed'
        suggestions = [
          'Check if GITHUB_TOKEN is valid and not expired',
          'Ensure the token has the necessary permissions',
          'Verify the token format is correct'
        ]
      } else if (res.status === 403) {
        errorMessage = 'GitHub API rate limit exceeded or insufficient permissions'
        suggestions = [
          'Wait for rate limit to reset',
          'Use a GitHub token to increase rate limits',
          'Check token permissions'
        ]
      } else if (res.status === 404) {
        errorMessage = 'GitHub user not found'
        suggestions = [
          'Verify GITHUB_USERNAME is correct',
          'Check if the user profile is public'
        ]
      }
      
      return NextResponse.json(
        { 
          error: errorMessage, 
          status: res.status, 
          details: text,
          suggestions 
        },
        { status: 502 }
      )
    }

    interface GitHubRepo {
      name: string;
      full_name: string;
      html_url: string;
      description: string | null;
      language: string | null;
      stargazers_count: number;
      forks_count: number;
      created_at: string;
      updated_at: string;
    }

    const data: GitHubRepo[] = await res.json()
    
    logger.debug('GitHub API response received', {
      repositoryCount: data.length
    })

    // Load summaries
    const summariesPath = path.join(process.cwd(), 'summaries.json')
    const summariesData = await readFile(summariesPath, 'utf-8')
    const summaries = JSON.parse(summariesData)
    
    logger.debug('Repository summaries loaded', {
      summariesCount: Object.keys(summaries).length
    })

    const items = data.map(repo => ({
      name: repo.name,
      full_name: repo.full_name,
      html_url: repo.html_url,
      description: repo.description,
      language: repo.language,
      stargazers_count: repo.stargazers_count,
      forks_count: repo.forks_count,
      created_at: repo.created_at,
      updated_at: repo.updated_at,
      summary: summaries[repo.name] || null
    }))

    timer.end({ repositoryCount: items.length })
    
    logger.info('GitHub repositories fetch completed successfully', {
      repositoryCount: items.length,
      hasToken: !!TOKEN
    })
    
    return NextResponse.json(
      {
        source: 'github',
        count: items.length,
        items,
      },
      { headers: { 'Cache-Tag': TAG } }
    )
  } catch (err: unknown) {
    const error = err as Error
    timer.endWithError(error)
    
    logger.error('Failed to fetch GitHub repositories', {
      username: USERNAME,
      hasToken: !!TOKEN
    }, error)
    
    return NextResponse.json(
      { error: error?.message || 'Unexpected error' },
      { status: 500 }
    )
  }
}