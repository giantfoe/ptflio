# Changelog

All notable changes to this project will be documented in this file.

## [0.2.26] - 2025-01-28

### Enhanced
- **Professional Icon System**: Replaced all emojis with lucide-react vector icons for consistent professional appearance
  - Technology categories: Code, Server, Database, Smartphone, Cloud, Settings icons
  - Individual technologies: FileCode, FileText, Atom, Triangle, Zap, Globe, Palette, Coffee, Shield, Gem, Leaf, Circle, HardDrive, Container, Flame icons
  - Consistent 16px sizing across all icons for proper visual hierarchy
- **Professional Color Scheme**: Updated technology badge colors to more sophisticated, muted palette
  - Frontend: `bg-slate-600` (professional gray)
  - Backend: `bg-emerald-700` (sophisticated green)
  - Database: `bg-indigo-700` (professional blue)
  - Mobile: `bg-violet-700` (refined purple)
  - DevOps: `bg-amber-700` (muted amber)
  - Tools: `bg-stone-600` (neutral stone)
- **Component Updates**: Enhanced TechnologyBadge, TechnologyStack components to render lucide-react icons directly
  - Improved type safety with LucideIcon interface
  - Consistent icon rendering across all technology displays
  - Better accessibility with proper icon titles

### Technical
- Updated `technologyGrouping.ts` with comprehensive lucide-react icon mappings
- Modified `TechnologyBadge.tsx` to render LucideIcon components with fixed 16px sizing
- Enhanced `TechnologyStack.tsx` for proper icon component rendering
- Maintained backward compatibility while improving visual consistency
- All changes verified with successful TypeScript compilation

## [0.2.25] - 2025-01-28

### Enhanced
- **TechnologyBadge Progress Bar**: Updated progress bar to premium Deep Emerald Green (`bg-emerald-700`) based on luxury brand research
  - Technical: Replaced gradient with sophisticated solid color (#00674F equivalent)
  - Rationale: Deep emerald represents prosperity, exclusivity, and premium sophistication
  - Location: `src/components/ui/TechnologyBadge.tsx`

## [0.2.24] - 2025-01-27

### Enhanced
- Updated TechnologyBadge progress bar color from solid blue (bg-blue-600) to premium gradient (from-purple-500 via-pink-500 to-orange-400)
- Enhanced visual appeal of loading bars with sophisticated gradient styling for more premium appearance
- Maintained all existing functionality while improving the aesthetic quality of progress indicators

### Technical
- Replaced colorClass variable usage with bg-gradient-to-r gradient classes in progress bar styling
- Applied premium gradient color scheme across all technology progress indicators
- Preserved transition animations and responsive behavior

## [0.2.23] - 2025-01-27

### Added
- Created comprehensive liquid glass components library with 8 distinct div variations
- Implemented advanced CSS techniques including backdrop-filter, rgba backgrounds, and gradient overlays
- Added liquid glass card component with subtle reflections and transparency effects
- Created liquid glass button with ripple animation and hover effects
- Developed liquid glass navigation bar with glassmorphism styling
- Built liquid glass modal overlay with backdrop blur and smooth transitions
- Designed liquid glass dashboard widget with data visualization styling
- Implemented liquid glass input field with focus states and validation styling
- Created liquid glass sidebar panel with navigation elements
- Added liquid glass floating action button with elevation effects
- Integrated cross-browser compatibility fallbacks using @supports rules
- Applied modern glassmorphism design principles with smooth gradients and subtle reflections

### Technical
- Utilized backdrop-filter: blur() for modern glass effects with fallbacks for older browsers
- Implemented rgba() backgrounds for semi-transparent glass appearance
- Added inset box-shadows for depth and inner glow effects
- Created pseudo-elements (::before, ::after) for highlight and reflection effects
- Applied CSS transforms and transitions for smooth interactive animations
- Ensured cross-browser compatibility with @supports feature detection
- Optimized performance with hardware-accelerated CSS properties

## [0.2.22] - 2025-01-27

### Fixed
- Resolved React error "Objects are not valid as a React child" caused by rendering GitHub user object directly
- Fixed ProjectHeader component to properly access `owner.login` property instead of rendering the entire user object
- Eliminated console errors related to invalid React children in project details page
- Improved error handling and object property access for GitHub API data rendering

### Technical
- Updated page.tsx to pass `data.repository?.owner?.login` instead of `data.repository?.owner` to ProjectHeader component
- Enhanced type safety by properly accessing nested object properties before rendering
- Maintained all existing functionality while fixing React rendering compliance

## [0.2.21] - 2025-01-27

### Enhanced
- Removed glass effect wrapper div from project details page to improve background image visibility
- Enhanced background image prominence by eliminating backdrop blur and glass styling from ProjectHeader container
- Maintained all existing functionality and layout integrity while improving visual clarity
- Optimized visual hierarchy to better showcase the background image (/19.jpg) without obstruction

### Technical
- Removed backdrop-blur-md, bg-white/10, border, and shadow styling from ProjectHeader wrapper div
- Preserved ProjectHeader component functionality and styling while removing glass effect container
- Maintained responsive design and animation effects without the glass overlay

## [0.2.20] - 2025-01-27

### Enhanced
- Updated project details page background image from /18.jpg to /19.jpg for improved visual appeal
- Enhanced dark overlay opacity from black/30-40 to black/60-80 for significantly better text and statistical data legibility
- Replaced emoji arrows (↗ and ↘) with professional Lucide React icons (TrendingUp and TrendingDown) in StatCard component
- Improved visual consistency and professional appearance across project detail pages
- Enhanced readability of statistical data and content overlays with darker gradient backgrounds

### Technical
- Updated StatCard component to import and use TrendingUp and TrendingDown icons from lucide-react
- Modified project details page gradient overlay classes for improved contrast ratios
- Maintained existing functionality while enhancing visual presentation for professional demonstrations

## [0.2.19] - 2025-01-27

### Enhanced
- Redesigned Featured Projects section to visually match Hero section with prominent background image
- Implemented full-height background image (/2.jpg) with fixed attachment and cover positioning
- Added sophisticated gradient overlays for optimal text readability over background image
- Enhanced project cards to appear floating above the background with improved visual hierarchy
- Integrated Parallax components for floating elements and main content with dynamic scroll effects
- Applied consistent styling approach matching Hero section's visual impact and professional presentation
- Maintained all existing functionality while significantly improving visual consistency across sections
- Created cohesive design language between Hero and Featured Projects sections for seamless user experience

### Technical
- Updated Projects.tsx with CSS background-image implementation using backgroundAttachment: 'fixed'
- Added multi-layer gradient system for proper content visibility over background image
- Wrapped project grid and floating elements in Parallax components for enhanced depth perception
- Preserved liquid glass aesthetic for project cards while adapting to new background context
- Optimized visual hierarchy with improved spacing and positioning for floating card effect

## [0.2.18] - 2025-01-27

### Enhanced
- Applied consistent liquid glass aesthetic design treatment to all project detail page components
- Updated StatCard component with backdrop-blur-md, bg-white/10, border border-white/20, and shadow-xl styling
- Enhanced TechnologyBadge component with liquid glass styling for progress bars and badge variants
- Verified visual consistency across ProjectHeader, LivePreview, TechnologyStack, and all detail page sections
- Maintained translucent, glossy appearance while preserving functionality and readability of all content elements
- Achieved cohesive glassmorphic design system across the entire project details interface

### Technical
- Standardized liquid glass styling classes: backdrop-blur-md, bg-white/10, border border-white/20, shadow-xl
- Applied hover effects with bg-white/15 and transition-all duration-300 for enhanced interactivity
- Ensured consistent rounded corners (rounded-xl, rounded-2xl) and padding across all components
- Preserved existing functionality while enhancing visual presentation for professional demonstrations

## [0.2.17] - 2025-01-27

### Added
- Advanced glassmorphism Button and LiquidButton components with SVG filter effects
- GlassFilter SVG component for sophisticated backdrop filtering
- Enhanced button variants with glassmorphic styling and hover animations
- @radix-ui/react-slot integration for flexible component composition
- Liquid button with complex shadow effects and backdrop blur
- Professional button components suitable for glassmorphic design system

### Changed
- Replaced existing button component with advanced glassmorphism variants
- Updated button API with new variant system (default, destructive, outline, secondary, ghost, link)
- Enhanced button sizing options with new xl and xxl sizes for LiquidButton
- Improved button styling with cva (class-variance-authority) for better maintainability

### Fixed
- Button component compatibility issues in Projects.tsx by updating variant from "primary" to "default"
- TypeScript build errors related to deprecated button props
- Component integration with new glassmorphic design system

## [0.2.16] - 2025-01-27

### Added
- Project Details Page Redesign with glassmorphism design
- Background image integration (/18.jpg) with fixed attachment
- Gradient overlays for enhanced readability
- Parallax floating elements for visual depth
- Glassmorphic cards with backdrop-blur effects
- Enhanced interactive elements with hover animations
- Fade-in-up animations with staggered delays
- Responsive design optimizations
- Updated UI components (LivePreview, Modal, StatCard, TechnologyStack, TechnologyBadge)
- Custom CSS animations and keyframes

### Changed
- Project Details Page transformed from basic layout to stunning glassmorphic design
- Component styling updated to support transparent glassmorphic backgrounds
- Animation system with comprehensive fade-in-up animations
- Responsive design improved for mobile and tablet layouts

### Fixed
- Component compatibility with new glassmorphic design
- Mobile responsiveness with improved spacing and layout

## [0.2.15] - 2025-01-27

### Enhanced
- Implemented sophisticated abstract background for Featured Projects section using `/public/18.jpg` and `/public/19.jpg`
- Added layered background composition with CSS blend modes (overlay) and multiple opacity levels for depth
- Enhanced glassmorphism effects with backdrop blur, gradient overlays, and subtle pattern textures
- Integrated floating animated glassmorphic elements with staggered pulse animations for visual interest
- Improved project cards with enhanced backdrop blur, refined border opacity, and sophisticated box shadows
- Applied brightness, contrast, and saturation filters to background images for optimal contrast
- Created multi-layer gradient system (primary-bg, black gradients) for proper content visibility
- Added subtle radial dot pattern overlay for texture enhancement
- Maintained visual hierarchy while significantly enhancing the glassmorphic aesthetic
- Professional presentation quality suitable for investor demonstrations with cohesive dark theme

### Technical
- Implemented CSS `mixBlendMode: 'overlay'` for sophisticated image blending
- Used multiple absolute positioned divs with varying z-index for proper layering
- Applied CSS filters (blur, brightness, contrast, saturate) for optimal background image treatment
- Enhanced project cards with `backdrop-blur-md` and refined opacity values for glassmorphism
- Added floating elements with custom animation durations and delays for dynamic visual appeal

## [0.2.14] - 2025-01-27

### Fixed
- Fixed Hero section background image visibility issue where `/2.jpg` was not displaying
- Replaced Parallax component background approach with CSS background-image for reliable image display
- Optimized gradient overlays to maintain text readability while ensuring background image visibility
- Enhanced floating parallax elements with improved visual effects and proper opacity settings
- Resolved z-index conflicts that were preventing background image from showing

### Technical
- Switched from `<Parallax><img>` approach to CSS `backgroundImage` property for main hero background
- Simplified overlay structure while maintaining visual hierarchy and text contrast
- Preserved parallax effects for floating decorative elements
- Improved performance by removing redundant background image loading

## [0.2.13] - 2025-01-27

### Changed
- Updated Hero section background to use local image `/public/2.jpg` instead of Unsplash images
- Replaced dual Unsplash background layers with single local background image while maintaining parallax effects
- Preserved all existing parallax animations and visual effects with new background image

## [0.2.12] - 2025-01-27

### Enhanced
- Enhanced Hero section with eye-catching layered background images and advanced parallax effects
- Added multiple parallax layers with different scroll speeds for depth and visual interest
- Integrated Next.js Image component for optimized performance with mountain landscape and starry sky backgrounds
- Implemented floating visual elements with subtle parallax movement and pulsing animations
- Enhanced call-to-action buttons with improved styling, backdrop blur, and hover effects
- Added animated scroll indicator with smooth bounce animation
- Improved text readability with drop shadows and enhanced contrast
- Added custom radial gradient utilities to Tailwind configuration for advanced visual effects
- Professional visual presentation suitable for investor demonstrations

### Technical
- Added bg-gradient-radial and bg-gradient-conic utilities to Tailwind configuration
- Optimized image loading with Next.js Image component using priority loading and proper sizing
- Implemented layered z-index system for proper visual stacking of parallax elements
- Enhanced responsive design with improved mobile and tablet experience
- Added backdrop blur effects and smooth transitions for modern UI aesthetics

## [0.2.11] - 2025-01-27

### Added
- HorizonHeroSection component with advanced Three.js 3D graphics and GSAP animations
- Installed Three.js, GSAP, and @types/three dependencies for 3D rendering capabilities
- Interactive 3D star field with multiple layers and depth-based rotation effects
- Dynamic nebula effects with custom shader materials and noise-based animations
- Procedural mountain silhouettes with layered depth and atmospheric perspective
- Real-time atmosphere rendering with custom vertex and fragment shaders
- Smooth camera movement system with mouse tracking and scroll-based positioning
- User geolocation integration for personalized viewing experience
- Post-processing effects including Unreal Bloom Pass for enhanced visual quality
- Responsive design with proper cleanup and performance optimizations
- Professional 3D hero section suitable for portfolio demonstrations

### Technical
- Implemented custom shader materials for stars, nebula, and atmospheric effects
- Added proper TypeScript interfaces for Three.js scene management
- Integrated EffectComposer for advanced post-processing pipeline
- Optimized rendering performance with requestAnimationFrame and proper cleanup
- Added window resize handling and responsive camera adjustments

## [0.2.10] - 2025-01-27

### Changed
- Reset git repository to last commit (33e914a) to restore clean codebase state
- Discarded all uncommitted changes and restored project to previous stable version

## [0.2.9] - 2025-01-27

### Fixed
- Fixed TypeScript error in project details page where displayError.message was accessed on a string | Error type
- Enhanced error message handling to properly check if displayError is an Error instance before accessing .message property
- Improved type safety in error display logic for better build reliability

## [0.2.8] - 2025-01-27

### Added
- ErrorBoundary component to prevent page termination from unhandled React errors
- Enhanced error handling in project details page to catch and gracefully handle component errors
- Comprehensive error logging with component stack traces and error context
- Fallback UI for error states with retry functionality and navigation options
- Development mode error details display for debugging purposes

### Fixed
- Project details page unexpected closing/termination issues
- Unhandled React errors that could cause page crashes
- TypeScript compilation errors in ErrorBoundary imports across components
- Enhanced stability of project page rendering with proper error boundaries

### Technical
- Wrapped ProjectPage component with ErrorBoundary for error isolation
- Added useErrorHandler hook for functional component error handling
- Implemented error recovery mechanisms with retry and navigation fallbacks
- Enhanced error boundary with custom error handlers and logging

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

### Removed
- Removed scroll indicator div elements from Hero.tsx and ParallaxHero.tsx components
- Cleaned up bouncing white dot scroll indicators from hero sections

### Fixed
- Fixed Next.js Image configuration error by adding 'images.unsplash.com' to allowed domains in next.config.ts
- Resolved ErrorBoundary issue with Unsplash images in hero section
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