import { NextRequest, NextResponse } from 'next/server';

const GITHUB_USERNAME = process.env.GITHUB_USERNAME;
const GITHUB_TOKEN = process.env.GITHUB_TOKEN;

if (!GITHUB_USERNAME) {
  throw new Error('GITHUB_USERNAME environment variable is required');
}

interface GitHubCommit {
  sha: string;
  commit: {
    message: string;
    author: {
      name: string;
      date: string;
    };
  };
  html_url: string;
}

interface GitHubRepo {
  name: string;
  description: string | null;
  homepage: string | null;
  html_url: string;
  stargazers_count: number;
  forks_count: number;
  language: string | null;
  updated_at: string;
  created_at: string;
  topics: string[];
  license: {
    name: string;
    spdx_id: string;
  } | null;
  open_issues_count: number;
  watchers_count: number;
  size: number;
  default_branch: string;
  owner: {
    login: string;
  };
}

interface GitHubLanguages {
  [key: string]: number;
}

interface GitHubRelease {
  tag_name: string;
  name: string;
  published_at: string;
  html_url: string;
  body: string;
}

interface GitHubReadme {
  content: string;
  encoding: string;
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ name: string }> }
) {
  const startTime = Date.now();
  const { name } = await params;
  console.log(`[GitHub API] Fetching comprehensive repository data for: ${name}`);
  
  try {
    const headers: Record<string, string> = {
      'Accept': 'application/vnd.github.v3+json',
      'User-Agent': 'Portfolio-App'
    };
    
    if (GITHUB_TOKEN) {
      headers['Authorization'] = `token ${GITHUB_TOKEN}`;
    }

    // Fetch repository details
    const repoResponse = await fetch(
      `https://api.github.com/repos/${GITHUB_USERNAME}/${name}`,
      { headers }
    );

    if (!repoResponse.ok) {
      console.error(`[GitHub API] Repository fetch failed: ${repoResponse.status}`);
      return NextResponse.json(
        { error: 'Repository not found' },
        { status: repoResponse.status }
      );
    }

    const repo: GitHubRepo = await repoResponse.json();

    // Fetch multiple data sources in parallel
    const [commitsResponse, languagesResponse, releasesResponse, readmeResponse] = await Promise.allSettled([
      fetch(`https://api.github.com/repos/${GITHUB_USERNAME}/${name}/commits?per_page=10`, { headers }),
      fetch(`https://api.github.com/repos/${GITHUB_USERNAME}/${name}/languages`, { headers }),
      fetch(`https://api.github.com/repos/${GITHUB_USERNAME}/${name}/releases?per_page=5`, { headers }),
      fetch(`https://api.github.com/repos/${GITHUB_USERNAME}/${name}/readme`, { headers })
    ]);

    // Process commits
    let commits: GitHubCommit[] = [];
    if (commitsResponse.status === 'fulfilled' && commitsResponse.value.ok) {
      commits = await commitsResponse.value.json();
    } else {
      console.warn(`[GitHub API] Commits fetch failed`);
    }

    // Process languages
    let languages: GitHubLanguages = {};
    if (languagesResponse.status === 'fulfilled' && languagesResponse.value.ok) {
      languages = await languagesResponse.value.json();
    } else {
      console.warn(`[GitHub API] Languages fetch failed`);
    }

    // Process releases
    let releases: GitHubRelease[] = [];
    if (releasesResponse.status === 'fulfilled' && releasesResponse.value.ok) {
      releases = await releasesResponse.value.json();
    } else {
      console.warn(`[GitHub API] Releases fetch failed`);
    }

    // Process README
    let readmeContent = '';
    if (readmeResponse.status === 'fulfilled' && readmeResponse.value.ok) {
      const readme: GitHubReadme = await readmeResponse.value.json();
      if (readme.encoding === 'base64') {
        readmeContent = Buffer.from(readme.content, 'base64').toString('utf-8');
      }
    } else {
      console.warn(`[GitHub API] README fetch failed`);
    }

    // Calculate language percentages
    const totalBytes = Object.values(languages).reduce((sum, bytes) => sum + bytes, 0);
    const languagePercentages = Object.entries(languages).map(([language, bytes]) => ({
      name: language,
      percentage: totalBytes > 0 ? Math.round((bytes / totalBytes) * 100) : 0,
      bytes
    })).sort((a, b) => b.percentage - a.percentage);

    const endTime = Date.now();
    console.log(`[GitHub API] Comprehensive request completed in ${endTime - startTime}ms`);

    return NextResponse.json({
      repository: {
        name: repo.name,
        description: repo.description,
        homepage: repo.homepage,
        html_url: repo.html_url,
        stargazers_count: repo.stargazers_count,
        forks_count: repo.forks_count,
        language: repo.language,
        updated_at: repo.updated_at,
        created_at: repo.created_at,
        topics: repo.topics || [],
        license: repo.license,
        open_issues_count: repo.open_issues_count,
        watchers_count: repo.watchers_count,
        size: repo.size,
        default_branch: repo.default_branch,
        owner: repo.owner
      },
      commits: commits.map(commit => ({
        sha: commit.sha,
        message: commit.commit.message,
        author: commit.commit.author.name,
        date: commit.commit.author.date,
        url: commit.html_url
      })),
      languages: languagePercentages,
      releases: releases.map(release => ({
        tag_name: release.tag_name,
        name: release.name,
        published_at: release.published_at,
        url: release.html_url,
        body: release.body
      })),
      readme: readmeContent,
      stats: {
        totalLanguages: languagePercentages.length,
        totalReleases: releases.length,
        totalCommits: commits.length,
        repositorySize: repo.size
      }
    });
  } catch (error) {
    console.error('[GitHub API] Error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch repository data' },
      { status: 500 }
    );
  }
}