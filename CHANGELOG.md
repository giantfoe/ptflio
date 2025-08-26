# Changelog

All notable changes to this project will be documented in this file.

## [0.1.1] - 2025-08-25
### Fixed
- Resolved TypeScript/Next Font class usage error in `src/app/layout.tsx` by using `.className` for both Geist fonts.
- Removed invalid `smoothTouch` property from Lenis initialization to satisfy types.
- Cleaned `src/app/page.tsx` by removing leftover Next.js boilerplate JSX after the main export.

### Added
- Implemented `UXProviders` to wrap app with `ParallaxProvider` and Lenis smooth scrolling.

## [0.1.0] - 2025-08-25
### Added
- Scaffolded Next.js (App Router) project with TypeScript and Tailwind CSS.
- Installed core dependencies: lenis, react-scroll-parallax, swr, zod.
- Implemented client-side UXProviders with Lenis smooth scrolling and ParallaxProvider.
- Replaced boilerplate with initial SPA sections: Hero (parallax), Projects grid, Streams tabs.
- Sticky header navigation with anchor links and Lenis-powered smooth scrolling.

### Notes
- API integrations for YouTube, Instagram, and GitHub are planned as route handlers with caching in upcoming versions.

## [Unreleased]

### Added
- Initial project setup with Next.js 15
- Basic portfolio structure with Hero, Projects, and Streams components
- API routes for YouTube, Instagram, and GitHub data fetching
- Tailwind CSS configuration
- TypeScript support
- SWR integration for data fetching with loading and error states
- MediaCard component for optimized media display
- LazyMediaGrid component for performance optimization
- Image optimization with Next.js remotePatterns for YouTube, Instagram, and GitHub
- Line-clamp CSS utilities for text truncation
- Comprehensive .env.example with secure placeholder values
- API Route Handlers with caching and normalized responses:
  - GET /api/youtube: Latest channel videos via YouTube Data API, 10-minute revalidation, cache tag "youtube".
  - GET /api/instagram: Latest media via Instagram Graph API, 15-minute revalidation, cache tag "instagram".
  - GET /api/github: Latest public events for configured user, 5-minute revalidation, cache tag "github".
- Added dynamic project detail pages at /projects/[name] with description, recent commits, and homepage link.
- Added API route /api/github/[name] for fetching individual repo details.

### Changed
- Updated Streams component to exclusively handle YouTube and Instagram, relabeling the section as 'Streams'.
- Modified Projects component to dynamically fetch GitHub repositories from /api/github and display them with AI-generated summaries as 'Projects'.
- Updated next.config.ts with remotePatterns for external image domains
- Enhanced .env.example with proper documentation and secure placeholders
- Added Tailwind CSS typography plugin for better text handling

### Improved
- Implemented industry-standard logging utility at src/utils/logger.ts with proper log levels (error, warn, info, debug)
- Replaced all console.log statements with structured logging that includes contextual metadata and timestamps
- Added automatic sanitization of sensitive information in logs
- Established consistent logging format across both client and server environments
- Enhanced debugging capabilities with request IDs and component context tracking

### Fixed
- Removed actual API keys and usernames from .env.example file
- Added proper TypeScript interfaces for API responses
- Implemented proper error handling and loading states in UI components
- Fixed net::ERR_ABORTED errors for external image URLs by adding unoptimized={true} to Image components in MediaCard.tsx
- Fixed 'No projects available' display by correcting data key from 'repositories' to 'items' in Projects.tsx
- Enhanced API error handling with placeholder value detection for Instagram and YouTube APIs
- Improved environment variable validation to catch configuration issues early
- Added graceful degradation when APIs are not properly configured with real credentials
- Better error messages for debugging API configuration problems
- Fixed net::ERR_ABORTED errors caused by invalid API credentials and placeholder values
- Resolved infinite loading issue in Streams component caused by dependency loop in fetchData useCallback
- Fixed flickering card shadows by eliminating circular dependencies between fetchData and availableServices state

### Verified
- YouTube API environment variables (YOUTUBE_API_KEY and YOUTUBE_CHANNEL_ID) are properly formatted and accessible within the application
- Environment variable validation logic correctly detects placeholder values and provides helpful error messages
- API route can successfully construct YouTube Data API v3 requests with configured credentials
- envOrThrow function properly reads environment variables from .env file in Next.js context

### Notes
- All handlers validate required environment variables and return structured JSON: `{ source, count, items[] }`.
- Each item includes cross-platform fields like `id`, `source`, `title`, `url`, `thumbnailUrl`/`imageUrl` (if available), and `timestamp`.
- Errors from upstream APIs are surfaced with 502 status; internal validation issues return 500.