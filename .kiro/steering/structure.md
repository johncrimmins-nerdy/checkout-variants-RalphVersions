# Project Structure

## Root Directory Organization

```
├── src/                    # Main application source code
├── netlify/functions/      # Serverless API functions
├── data/                   # Static content and subject data
├── supabase/              # Database schema and migrations
├── scripts/               # Build and maintenance scripts
├── tests/                 # End-to-end test files
├── public/                # Static assets (images, icons, manifests)
├── docs/                  # Project documentation
└── .kiro/steering/        # AI assistant steering rules
```

## Source Code Structure (`src/`)

### App Router (`src/app/`)

- **layout.tsx** - Root layout with providers and metadata
- **page.tsx** - Home page component
- **globals.css** - Global styles and Tailwind imports
- **analytics.tsx** - Google Analytics integration
- **TelemetryProvider.tsx** - Blueshift telemetry wrapper

### Feature-Based Routes

```
src/app/
├── ai-tutor/              # AI tutoring interface
├── flashcards/            # Flashcard management and study
├── worksheets/            # Worksheet creation and viewing
├── solver/                # AI problem solver (text/image)
├── games/                 # Interactive learning games
│   ├── adventure/         # Text-based adventure game
│   ├── crossmath/         # Math crossword puzzle
│   ├── number-cards/      # Number manipulation game
│   └── speed-challenge/   # Timed quiz challenges
├── dashboard/             # User progress dashboard
├── profile/               # User profile management
├── auth/                  # Authentication pages
└── subjects/              # Subject listings and dynamic pages
    └── [slug]/            # Dynamic subject pages
        ├── content/       # Course content with ISR
        ├── practice/      # Practice tests
        ├── flashcards/    # Subject flashcards
        ├── examples/      # Help examples
        ├── quiz/          # Question of the day
        └── ai-tutor/      # Subject-specific tutoring
```

### Components (`src/components/`)

- **pages/** - Page-specific components
- **gamification/** - Badge and achievement components
- **ui/** - Reusable UI components
- **subject/** - Subject-specific components
- **navigation/** - Navigation and layout components

### Utilities & Libraries (`src/lib/`)

- **server/** - Server-side utilities and database helpers
- **subjects/** - Subject data management and validation
- **pdf/** - PDF generation utilities
- **auth/** - Authentication helpers

### Other Directories

- **hooks/** - Custom React hooks
- **store/** - Zustand state management stores
- **types/** - TypeScript type definitions
- **utils/** - General utility functions
- **constants/** - Application constants and configuration

## API Functions (`netlify/functions/`)

### Core AI Functions

- **ai-tutor.ts** - Streaming AI tutor with conversation history
- **solve-with-image.ts** - Image-based problem solving
- **solve-with-text.ts** - Text-based problem solving
- **generate-quiz.ts** - AI quiz generation
- **generate-flashcards.ts** - Flashcard creation

### Game Functions

- **adventure-generate-content.ts** - Adventure game content generation
- **adventure-regenerate-metadata.ts** - Adventure metadata updates
- **adventure-lib/** - Shared adventure game utilities
- **adventure-types/** - Adventure game type definitions

### Utility Functions

- **api.ts** - General API utilities and middleware
- **moderate-content.ts** - Content moderation
- **utils/** - Shared function utilities

## Data Organization (`data/`)

### Content Structure

```
data/
├── content-pages/         # Subject content and course materials
│   ├── [subject-slug]/    # Individual subject directories
│   └── index.json         # Content manifest
└── subjects/              # Subject definitions and metadata
```

### Subject Content Pattern

Each subject follows this structure:

- **Basic content** - Fundamental concepts and introductory material
- **Advanced content** - Complex topics and advanced applications
- **Practice materials** - Exercises and test questions
- **Help examples** - Step-by-step problem solutions

## Database (`supabase/`)

- **database.types.ts** - Generated TypeScript types from schema
- **migrations/** - Database migration files
- **schema-dump.sql** - Complete schema backup
- **seeds/** - Initial data for development

## Scripts (`scripts/`)

- **Content generation** - AI-powered content creation scripts
- **Data validation** - Subject and content validation utilities
- **Database sync** - Migration and synchronization tools
- **Build utilities** - Cache clearing and manifest generation

## Configuration Files

### Core Config

- **next.config.js** - Next.js configuration with PWA, redirects, and caching
- **tailwind.config.js** - Tailwind CSS configuration
- **tsconfig.json** - TypeScript configuration with strict settings
- **eslint.config.js** - ESLint with Perfectionist and React Hooks plugins

### Environment & Deployment

- **.env** - Environment variables (not committed)
- **netlify.toml** - Netlify deployment configuration
- **package.json** - Dependencies and npm scripts

## Naming Conventions

### Files & Directories

- **kebab-case** for directories and static files
- **PascalCase** for React components
- **camelCase** for utility functions and variables
- **UPPER_CASE** for constants and environment variables

### Routes & URLs

- **kebab-case** for all URL segments
- **Subject slugs** follow pattern: `subject-name` (e.g., `act-math`, `ap-biology`)
- **Content slugs** follow pattern: `topic-name` (e.g., `quadratic-equations`)

### API Endpoints

- **RESTful patterns** where applicable
- **Descriptive names** for function-specific endpoints
- **Consistent error handling** across all functions

## Import Patterns

### Path Aliases

- `@/` - Maps to `src/` directory
- Absolute imports preferred over relative imports
- Group imports: external packages, then internal modules

### Component Imports

- Named exports preferred over default exports for utilities
- Default exports for page components and major features
- Consistent import ordering enforced by ESLint Perfectionist
