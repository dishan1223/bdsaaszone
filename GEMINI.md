# BDSaaSZone 🇧🇩

The definitive directory for Made-in-Bangladesh software. A Next.js-based platform for founders to showcase startups, buyers to acquire products, and developers to find inspiration.

## Project Overview

- **Framework:** Next.js 16 (App Router)
- **Language:** JavaScript (ES6+)
- **Database:** MongoDB
- **Caching:** Redis
- **Authentication:** Better Auth (with Google Social Provider)
- **Styling:** Tailwind CSS 4 & DaisyUI 5
- **Media Management:** Cloudinary
- **Notifications:** Web-push (Push API)

## Architecture

The project follows a standard Next.js App Router structure:

- `src/app/`: Contains all routes and pages.
  - `api/`: Backend API endpoints.
  - `dashboard/`, `login/`, `new/`, `startups/`, etc.: Frontend pages.
- `src/components/`: Reusable React components.
  - `ui/`: Core UI primitives (Buttons, Modals, Cards).
- `src/lib/`: Core utility libraries and service initializations.
  - `auth.js`: Better Auth configuration.
  - `mongodb.js`: MongoDB client connection (singleton pattern).
  - `redis.js`: Redis client and cache invalidation logic.
- `src/hooks/`: Custom React hooks (e.g., `usePushNotifications`).
- `src/constants/`: App-wide constants (e.g., categories).
- `public/`: Static assets (logos, icons, service workers).

## Getting Started

### Prerequisites

- Node.js (LTS recommended, use `nvm use --lts`)
- MongoDB (Running instance or Atlas)
- Redis (Optional but recommended for caching)

### Key Commands

- **Development:** `npm run dev` - Starts the development server at `http://localhost:3000`.
- **Production Build:** `npm run build` - Compiles the application for production.
- **Production Start:** `npm run start` - Runs the compiled production build.
- **Linting:** `npm run lint` - Runs ESLint to check for code quality issues.

### Environment Variables

A `.env.local` file is required with the following keys:

```bash
NEXT_PUBLIC_APP_URL=http://localhost:3000
MONGODB_URI=your_mongodb_uri
DB=development
BETTER_AUTH_BASE_URL=http://localhost:3000
BETTER_AUTH_SECRET=your_better_auth_secret
GOOGLE_CLIENT_ID=your_google_id
GOOGLE_CLIENT_SECRET=your_google_secret
REDIS_URL=your_redis_url
CLOUDINARY_CLOUD_NAME=...
CLOUDINARY_API_KEY=...
CLOUDINARY_API_SECRET=...
```

## Development Conventions

- **State Management:** Uses React's built-in hooks (`useState`, `useEffect`) and `authClient` for authentication state.
- **Styling:** Adheres to Tailwind CSS 4 utility classes and DaisyUI components.
- **API Communication:** Uses `axios` for client-side API requests.
- **Route Protection:** Handled via `src/middleware.js` checking for Better Auth session tokens.
- **Data Fetching:** Mixed client-side (`useEffect` + `axios`) and server-side fetching patterns.
- **Icons:** Uses `lucide-react` for a consistent icon set.

## Key Features to Note

- **Startup Listing:** Users can add, edit, and delete their startups.
- **Marketplace:** Startups can be marked "For Sale".
- **Social:** Likes and comments (with replies) on startup profiles.
- **Caching:** Redis is used to cache startup listings, invalidated on new submissions.
- **Real-time:** Push notifications for user engagement.
