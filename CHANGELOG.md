# Changelog

All notable changes to this project will be documented in this file.

## [0.2.7] - 2025-01-27

### Fixed
- Instagram content display issue - posts now properly load from Juicer feed
- Corrected Juicer API endpoint parsing to handle `posts.items` structure
- Enhanced error logging for better debugging of API integration issues

### Technical
- Updated Instagram API route to correctly parse Juicer response structure
- Fixed data transformation logic to handle nested `posts.items` array
- Improved API error handling and response structure validation

## [0.2.6] - 2025-08-26

### Added
- Abstract image generation system for project display cards to eliminate visual monotony
- AbstractProjectImage component with loading states, error handling, and fallback gradients
- Dynamic abstract image configuration with multiple visual styles, color palettes, and elements
- Unique abstract backgrounds generated for each project based on project name
- Professional, colorful abstract images suitable for investor demonstrations
- Image generation utility with 12 distinct abstract styles and 8 color palette variations
- Fallback gradient system for enhanced reliability when images fail to load

### Enhanced
- Updated Projects component to use AbstractProjectImage instead of static gradients
- Improved visual diversity across project cards with unique abstract backgrounds
- Enhanced user experience with smooth loading transitions and error recovery
- Professional presentation quality suitable for portfolio demonstrations

### Fixed
- Resolved TypeScript error in Instagram API route logger.warn call with proper error typing

## [0.2.5] - 2025-01-27

### Added
- Enhanced Projects component with deployment preview functionality
- Added "Live" badge indicator for projects with deployed websites
- Implemented clickable deployment previews with hover overlay effects
- Added "Live Demo" button that opens deployed websites in new tabs
- Support for multiple deployment links with indicator showing additional deployments
- Visual distinction between project details navigation and live demo access
- Preview thumbnails with "Preview Available" overlay for deployed projects
- Seamless integration with existing summaries.json live_links data structure

### Enhanced
- Updated Project interface to support live_links array from summaries.json
- Improved project card layout with deployment status indicators
- Added proper TypeScript null checks for robust deployment data handling
- Enhanced user experience with clear visual cues for deployed vs non-deployed projects
- Maintained existing project navigation while adding new deployment preview features

## [0.2.4] - 2025-01-27

### Fixed
- Fixed NaN percentage display issue in TechnologyStack component when languages data is empty or calculations result in division by zero
- Added proper null checks and fallback values in TechnologyStack component to prevent NaN from appearing in "Lines of Code" and "Tech Categories" metrics
- Enhanced TechnologyBadge component to handle NaN percentage values gracefully with validPercentage checks
- Improved data validation in technology utility functions to ensure robust handling of empty language objects
- Replaced NaN displays with appropriate fallback values (0 or "No data") for better user experience

## [0.2.3] - 2025-01-27

### Fixed
- Fixed SWR JSON parsing error ("Unexpected token 'I', Internal S...") in project details page
- Replaced simple fetcher with proper error-handling fetcher utility from `/utils/fetcher.ts`
- Improved handling of non-JSON responses (HTML error pages) from API endpoints
- Enhanced error handling for API responses with proper status code checking and content-type validation

## [0.2.2] - 2025-08-26

### Enhanced
- Enhanced technology stack display on project details pages with comprehensive visual presentation
- Added TechnologyStack component with grouped technology categories (Frontend, Backend, Database, etc.)
- Technology progress bars showing language distribution percentages with primary language highlighting
- Enhanced TechnologyBadge component with progress bar variant and icon support for better visualization
- Enhanced Projects listing component to display technology stacks on project cards
- Added primary language display with TechnologyBadge component for visual consistency
- Updated Project interface to include language, stargazers_count, forks_count, created_at, and updated_at fields
- Improved project cards with technology information for better investor presentation
- Maintained responsive design and clean layout while adding technology stack visibility
- Professional presentation suitable for investor demonstrations with organized tech stack sections

## [0.2.1] - 2025-01-26

### Added
- Enhanced technology stack display with comprehensive visual presentation
- New `TechnologyStack` component with grouped technology categories (Frontend, Backend, Database, etc.)
- Technology progress bars showing language distribution percentages
- Primary language highlighting with prominent display
- Technology icons and improved color coding for different tech types
- Repository statistics including estimated lines of code and formatted size
- Responsive grid layout for better mobile experience
- Technology grouping utility with categorization and icon mapping

### Enhanced
- `TechnologyBadge` component with progress bar variant and icon support
- `ProjectHeader` component now uses the new enhanced technology stack display
- Better visual organization of project technical information
- Professional presentation suitable for investor demonstrations

### Fixed
- Fixed TypeError in project details page where commits mapping was trying to access nested `commit.commit.message` structure instead of the flattened API response structure (`commit.message`, `commit.author`, `commit.date`)
- Updated TypeScript interfaces for commit data to match the actual API response format
- Fixed project description display issue where data.description was incorrectly accessed instead of data.repository.description in project details page

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
- RSCNavigationWrapper component for handling React Server Component navigation errors
- useRSCNavigation hook for RSC-safe client-side navigation with fallback mechanisms
- ErrorBoundary component for catching and handling React errors, including RSC-specific errors
- Enhanced ErrorDisplay component with comprehensive error parsing and user-friendly presentation
- Comprehensive error parser utility (error-parser.ts) supporting multiple error types:
  - ERR_ABORTED errors with detailed URL and timestamp parsing
  - RSC navigation errors with _rsc parameter handling
  - API errors with status code detection
  - Network failures with recovery suggestions
  - Validation errors with user guidance
- Enhanced error handling for ERR_ABORTED errors with _rsc parameter
- Improved client-side navigation reliability with automatic retry mechanisms
- Structured error reporting with severity levels and recovery suggestions
- User-friendly error messages with actionable suggestions

### Fixed
- TypeError in ProjectPage component when accessing undefined project data
- ERR_ABORTED errors related to RSC navigation and hydration mismatches
- Navigation reliability issues with React Server Components
- Enhanced parsing and display of net::ERR_ABORTED errors with complete URL and parameter extraction
- Fixed TypeError in ProjectPage component when accessing commit.commit.message
- Updated commit data access to use flattened structure (commit.message, commit.author, commit.date)
- Aligned frontend commit data handling with API response structure
- Resolved Next.js ERR_ABORTED errors with _rsc parameter causing navigation failures
- Fixed React Server Components hydration mismatches
- Improved client-side navigation reliability with proper error boundaries

### Changed
- Updated root layout to include RSC navigation wrapper
- Enhanced project page error handling with detailed RSC error information
- Replaced standard Link components with RSC-safe navigation in Projects component
- Added loading states and navigation feedback for better UX

## [0.2.0] - 2025-01-16

### Added
- Comprehensive project details page with professional showcase design
- Enhanced GitHub API route (/api/github/[name]) with extended project data:
  - Repository statistics (stars, forks, watchers, issues, size)
  - Technology stack analysis with language percentages
  - README content fetching for AI description generation
  - Repository topics/tags and license information
  - Latest releases and detailed commit history
- AI-powered description generation service (aiDescriptionGenerator.ts) that creates:
  - Professional project summaries based on README content
  - Key technology highlights and architecture insights
  - Notable features extraction and use case identification
  - Intelligent content analysis and categorization
- New UI components for enhanced project presentation:
  - ProjectHeader: Hero section with project metrics, AI descriptions, and call-to-action buttons
  - LivePreview: Embedded iframe component for live website previews with responsive design
  - StatCard: Repository metrics display with icons and formatted values
  - TechnologyBadge: Visual representation of programming languages and tech stack
- Mobile-responsive design with professional typography and spacing
- Accessibility compliance with proper ARIA attributes and keyboard navigation
- Fast loading times with optimized data fetching and caching

### Enhanced
- Project details page (/projects/[name]) completely redesigned with:
  - Hero section showcasing project title, description, and key metrics
  - AI-generated comprehensive project analysis and insights
  - Technology stack visualization with language percentages
  - Live preview iframe for deployed projects with full-screen capability
  - Repository statistics dashboard with visual indicators
  - Recent commits timeline with author information and timestamps
  - Latest releases section with version history and release notes
  - Professional layout maintaining portfolio theme consistency

### Improved
- Enhanced error handling with user-friendly error states and loading indicators
- Consistent color scheme and design language across all new components
- Optimized performance with efficient data fetching and component rendering
- Better TypeScript integration with comprehensive type definitions

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
- Project uses modern React patterns with hooks and functional components
- Tailwind CSS for utility-first styling approach
- SWR for efficient data fetching and caching
- Environment variables for secure API key management
- Modular component structure for maintainability