# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Development Commands

- `npm run dev` - Start development server
- `npm run build` - Build for production  
- `npm run lint` - Run ESLint checks
- `npm run lint:fix` - Fix ESLint issues automatically
- `npm run type-check` - Run TypeScript type checking
- `npm run format` - Format code with Prettier
- `npm run format:check` - Check code formatting without fixing

## Architecture Overview

### API Proxy Pattern
This application uses API Routes as Proxy (`/src/app/api/proxy/[...path]/route.ts`) to forward requests to a backend HTTP server. This solves mixed content issues when deploying HTTPS frontend with HTTP backend.

- Client calls `/api/proxy/*` instead of direct backend URLs
- Proxy forwards all HTTP methods (GET, POST, PUT, DELETE, PATCH) to backend
- Special handling for `multipart/form-data` file uploads to preserve boundaries
- Environment variable `API_BASE_URL` (server-side) specifies backend URL

### Authentication Flow
JWT-based authentication with automatic token refresh:

- Access tokens stored in localStorage and HTTP-only cookies
- Refresh tokens handle automatic token renewal via axios interceptors
- Auth state managed by Zustand store with persistence
- Middleware protects routes and redirects based on auth status
- Force logout on 403 errors via auth store `forceLogout()`

### State Management Pattern
- **Zustand**: Global state (auth, UI preferences)
- **TanStack Query**: Server state, caching, and synchronization
- **React Hook Form + Zod**: Form state and validation
- Local component state for UI-only concerns

### File Upload Architecture
File uploads use FormData with progress tracking:

- Client: Remove explicit `Content-Type` header, let browser set boundary
- Proxy: Use `arrayBuffer()` to preserve multipart boundaries
- Progress tracking via axios `onUploadProgress` callback
- File status tracking through task system

### Type System
Centralized TypeScript definitions in `/src/types/`:

- `auth.ts` - Authentication and user types
- `files.ts` - File management types  
- `tasks.ts` - Processing task types
- `matching.ts` - Fuzzy matching and search types
- `common.ts` - Shared utility types

### Component Organization
- `/src/components/ui/` - Base Shadcn/UI components
- `/src/components/layout/` - App layout and navigation
- Feature-specific components grouped by domain (auth, files, tasks, matching)
- Reusable business logic extracted to custom hooks in `/src/hooks/`

## Environment Variables

### Development (.env.local)
```
NEXT_PUBLIC_API_BASE_URL=http://localhost:8000/api  # Not used with proxy
API_BASE_URL=http://localhost:8000/api              # Backend URL for proxy
NEXT_PUBLIC_APP_NAME=CSV2JSON Web
NEXT_PUBLIC_APP_VERSION=1.0.0
```

### Production (Vercel)
- `API_BASE_URL` - Backend server URL (server-side only)
- Public variables same as development

## Key Patterns

### API Client Structure
- `/src/lib/axios.ts` - Configured axios instance with interceptors
- `/src/lib/api.ts` - Typed API client functions organized by domain
- All API calls go through centralized client for consistent error handling

### Error Handling
- Axios interceptors handle 401 (token refresh) and 403 (force logout)
- React Query handles loading states and error boundaries
- Toast notifications for user-facing errors
- Console logging for debugging

### Performance Optimizations
- Route-based code splitting via Next.js App Router
- Virtualized lists for large datasets (react-window)
- Image optimization through Next.js
- React Query caching strategies