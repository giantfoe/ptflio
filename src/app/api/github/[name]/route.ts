import { NextRequest, NextResponse } from 'next/server';
import { createApiLogger, PerformanceTimer } from '@/utils/logger';

interface GitHubCommit {
  sha: string;
  commit: {
    message: string;
    committer: {
      date: string;
    };
  };
}

export async function GET(request: NextRequest, { params }: { params: Promise<{ name: string }> }) {
  const resolvedParams = await params;
  const logger = createApiLogger(`/api/github/${resolvedParams.name}`, request);
  const timer = new PerformanceTimer(`fetch-repo-${resolvedParams.name}`, logger);
  
  const username = process.env.GITHUB_USERNAME;
  const token = process.env.GITHUB_TOKEN;

  logger.info('Starting repository details fetch', { 
    repository: resolvedParams.name,
    username 
  });

  if (!username || !token) {
    logger.error('GitHub credentials not configured', { 
      hasUsername: !!username,
      hasToken: !!token 
    });
    return NextResponse.json({ error: 'GitHub credentials not configured' }, { status: 500 });
  }

  try {
    // Fetch repo details
    logger.debug('Fetching repository details', { 
      url: `https://api.github.com/repos/${username}/${resolvedParams.name}` 
    });
    
    const repoRes = await fetch(`https://api.github.com/repos/${username}/${resolvedParams.name}`, {
      headers: {
        'Accept': 'application/vnd.github+json',
        'Authorization': `Bearer ${token}`,
      },
    });

    if (!repoRes.ok) {
      logger.error('Failed to fetch repository details', {
        statusCode: repoRes.status,
        statusText: repoRes.statusText,
        repository: resolvedParams.name
      });
      throw new Error('Failed to fetch repo details');
    }

    const repoData = await repoRes.json();
    logger.debug('Repository details fetched successfully', {
      hasDescription: !!repoData.description,
      hasHomepage: !!repoData.homepage
    });

    // Fetch recent commits (last 10)
    logger.debug('Fetching repository commits', { 
      url: `https://api.github.com/repos/${username}/${resolvedParams.name}/commits?per_page=10` 
    });
    
    const commitsRes = await fetch(`https://api.github.com/repos/${username}/${resolvedParams.name}/commits?per_page=10`, {
      headers: {
        'Accept': 'application/vnd.github+json',
        'Authorization': `Bearer ${token}`,
      },
    });

    if (!commitsRes.ok) {
      logger.error('Failed to fetch repository commits', {
        statusCode: commitsRes.status,
        statusText: commitsRes.statusText,
        repository: resolvedParams.name
      });
      throw new Error('Failed to fetch commits');
    }

    const commitsData: GitHubCommit[] = await commitsRes.json();
    const commits = commitsData.map((commit: GitHubCommit) => ({
      sha: commit.sha,
      message: commit.commit.message,
      date: commit.commit.committer.date,
    }));
    
    logger.debug('Repository commits fetched successfully', {
      commitCount: commits.length
    });

    const response = {
      description: repoData.description,
      homepage: repoData.homepage,
      commits,
    };
    
    timer.end({ 
      repository: resolvedParams.name,
      commitCount: commits.length,
      hasDescription: !!repoData.description,
      hasHomepage: !!repoData.homepage
    });
    
    logger.info('Repository details fetch completed successfully', {
      repository: resolvedParams.name,
      commitCount: commits.length
    });
    
    return NextResponse.json(response);
  } catch (error) {
    const err = error as Error;
    timer.endWithError(err, { repository: resolvedParams.name });
    
    logger.error('Failed to fetch project details', {
      repository: resolvedParams.name,
      username
    }, err);
    
    return NextResponse.json({ error: 'Failed to fetch project details' }, { status: 500 });
  }
}