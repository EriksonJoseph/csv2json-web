# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Development Commands

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint checks
- `npm run lint:fix` - Fix ESLint issues automatically
- `npm run type-check` - Run TypeScript type checking
- `npm run format` - Format code with Prettier
- `npm run format:check` - Check code formatting without fixing

## Architecture Overview

### Framework & Tooling

- **Next.js 14.2.5** with App Router architecture
- **TypeScript** with strict mode enabled
- **Tailwind CSS** for styling with custom design system
- **Shadcn/UI** components built on Radix UI primitives
- **ESLint + Prettier** for code quality and formatting

### API Proxy Pattern

This application uses API Routes as Proxy (`/src/app/api/proxy/[...path]/route.ts`) to forward requests to a backend HTTP server. This pattern solves mixed content issues when deploying HTTPS frontend with HTTP backend.

**Key Features:**

- Client calls `/api/proxy/*` instead of direct backend URLs
- Forwards all HTTP methods (GET, POST, PUT, DELETE, PATCH) to backend
- Special handling for `multipart/form-data` file uploads with streaming support
- Large file support (>4MB) with streaming to prevent memory issues
- Configurable timeouts: 60s for uploads, 30s for regular requests
- Environment variable `API_BASE_URL` (server-side) specifies backend URL
- Request/response header forwarding with security considerations

### Authentication Flow

JWT-based authentication with automatic token refresh and dual storage:

- **Token Storage**: localStorage (client-side) + HTTP-only cookies (server-side)
- **Automatic Refresh**: Axios interceptors handle 401 errors and token renewal
- **State Management**: Zustand store with persistence and hydration
- **Route Protection**: Next.js middleware protects routes based on auth status
- **Error Handling**: 403 errors trigger force logout via `forceLogout()`
- **Session Management**: Automatic redirect to login on auth failures

### State Management Architecture

- **Zustand**: Global state (auth, UI preferences) with persistence
- **TanStack Query v5**: Server state, caching, background updates, and optimistic updates
- **React Hook Form + Zod**: Form state management and validation
- **Local State**: Component-specific UI state (modals, toggles, etc.)

### File Upload Architecture

Advanced file upload system with progress tracking and error handling:

- **FormData Processing**: Browser sets multipart boundaries automatically
- **Progress Tracking**: Real-time upload progress via axios `onUploadProgress`
- **Large File Support**: Streaming for files >4MB to prevent memory issues
- **Timeout Handling**: Extended timeouts for file operations (60s)
- **Error Recovery**: Graceful fallback for upload failures
- **Task Integration**: File status tracking through task system

### Type System

Comprehensive TypeScript definitions organized by domain in `/src/types/`:

- `auth.ts` - Authentication, user types, and auth responses
- `files.ts` - File management, upload, and download types
- `tasks.ts` - Processing tasks, creation, and status types
- `matching.ts` - Fuzzy matching, search, and result types
- `watchlists.ts` - Watchlist management and matching types
- `users.ts` - User profiles, activity, and statistics types
- `common.ts` - Shared utility types and pagination

### Component Organization

- `/src/components/ui/` - Base Shadcn/UI components (buttons, inputs, etc.)
- `/src/components/layout/` - App layout, navigation, and shell components
- `/src/components/theme-provider.tsx` - Dark/light theme management
- `/src/components/query-provider.tsx` - TanStack Query configuration
- Feature-specific components grouped by domain:
  - `auth/` - Login, register, and authentication forms
  - `files/` - File upload, listing, and management
  - `tasks/` - Task creation, listing, and management
  - `matching/` - Search functionality and result display
  - `watchlists/` - Watchlist management and matching
  - `profile/` - User profile and settings
  - `dashboard/` - Dashboard and analytics components

## Environment Variables

### Development (.env.local)

```bash
# Client-side API base URL (not used with proxy)
NEXT_PUBLIC_API_BASE_URL=http://localhost:8000/api

# Server-side backend URL for proxy forwarding
API_BASE_URL=http://localhost:8000/api

# Application metadata
NEXT_PUBLIC_APP_NAME=CSV2JSON Web
NEXT_PUBLIC_APP_VERSION=1.0.0
```

### Production (Vercel)

- `API_BASE_URL` - Backend server URL (server-side only, required)
- `NEXT_PUBLIC_APP_NAME` - Application name for branding
- `NEXT_PUBLIC_APP_VERSION` - Version displayed in UI

## Key Patterns & Best Practices

### API Client Architecture

- **Centralized Client**: `/src/lib/axios.ts` - Configured axios instance with interceptors
- **Domain Organization**: `/src/lib/api.ts` - API functions grouped by feature domain
- **Consistent Error Handling**: All API calls use centralized error handling
- **Request Interceptors**: Automatic authorization header injection
- **Response Interceptors**: Token refresh and error handling

### Error Handling Strategy

- **Axios Interceptors**: Handle 401 (refresh) and 403 (logout) automatically
- **React Query**: Built-in loading states, error boundaries, and retry logic
- **Toast Notifications**: User-friendly error messages via react-hot-toast
- **Console Logging**: Detailed debugging information for development
- **Graceful Degradation**: Fallback states for network failures

### Performance Optimizations

- **Code Splitting**: Route-based splitting via Next.js App Router
- **Virtualization**: react-window for large datasets and file lists
- **Image Optimization**: Next.js built-in image optimization
- **Query Caching**: TanStack Query caching with 60s stale time
- **Background Updates**: Automatic data synchronization
- **Lazy Loading**: Dynamic imports for heavy components

### UI/UX Patterns

- **Design System**: Consistent theming with CSS custom properties
- **Dark Mode**: System preference detection with manual toggle
- **Responsive Design**: Mobile-first approach with Tailwind breakpoints
- **Loading States**: Skeleton screens and progress indicators
- **Infinite Scrolling**: Pagination with react-intersection-observer
- **Accessibility**: ARIA labels and keyboard navigation support

### Security Considerations

- **Route Protection**: Middleware-based authentication checks
- **Token Management**: Secure storage and automatic refresh
- **Input Validation**: Zod schemas for form validation
- **CSRF Protection**: Implicit via SameSite cookie settings
- **Content Security**: Proxy pattern prevents direct backend exposure

### Development Workflow

- **Type Safety**: Strict TypeScript configuration
- **Code Quality**: ESLint with TypeScript and Prettier integration
- **Import Organization**: Absolute imports with path mapping
- **Component Testing**: Structured for easy testing setup
- **Hot Reloading**: Fast development with Next.js dev server

### CRITICAL: Build Verification Workflow

**ALWAYS verify build after any code changes. Build failures must be fixed before proceeding.**

#### Required Build Check Steps:

1. **Run build check**: `npm run build` after every code modification
2. **Fix formatting errors**: Run `npm run format` if Prettier errors are found
3. **Resolve type errors**: Ensure TypeScript compilation passes without errors
4. **Never ignore build failures**: All errors must be resolved before continuing

#### Build Command Sequence:

```bash
# After making code changes
npm run format    # Fix formatting issues
npm run build     # Verify build passes
```

#### Why This Matters:

- Prevents deployment failures
- Catches type errors early
- Ensures code quality standards
- Maintains consistent formatting across the codebase

## Important Development Notes

### Public Pages Configuration

When creating new pages outside the `/auth` directory, **ALWAYS** remember to add them to the `publicPages` array in `/src/app/layout-wrapper.tsx`. This prevents the app layout from being applied to authentication-related pages.

Example:

```typescript
const publicPages = [
  '/login',
  '/register',
  '/verify-email',
  '/reset-password',
  '/forgot-password', // Always add new public pages here
]
```

### Pagination Implementation Pattern

When creating pages with pagination, follow this consistent pattern:

#### Required Imports

```typescript
import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { Pagination } from '@/components/ui/pagination'
import { PaginationParams } from '@/types'
```

#### State Management

```typescript
const [page, setPage] = useState(1)
const [limit, setLimit] = useState(9) // Default 9 items per page
const [searchTerm, setSearchTerm] = useState('') // If search functionality needed
```

#### Query Parameters Setup

```typescript
const queryParams: PaginationParams = {
  page: page,
  limit: limit,
}
```

#### API Query with React Query

```typescript
const { data: itemsData, isLoading } = useQuery({
  queryKey: ['items-key', page, limit, searchTerm], // Include all dependencies
  queryFn: () => apiFunction.list(queryParams).then((res) => res.data),
  enabled: !!conditionalCheck, // Add conditions if needed
})
```

#### Data Display Pattern

```typescript
// For API response structure like: { data: [], total: number, total_pages: number }
{itemsData?.data?.map((item) => (
  <TableRow key={item._id}>
    {/* Table content */}
  </TableRow>
))}
```

#### Pagination Component Usage

```typescript
<Pagination
  currentPage={page}
  totalItems={itemsData?.total || 0}
  itemsPerPage={limit}
  onPageChange={setPage}
  onItemsPerPageChange={(newPerPage) => {
    setLimit(newPerPage)
    setPage(1)  // Reset to first page when changing limit
  }}
  itemsPerPageOptions={[1, 6, 9, 12, 15, 24]}
  className="pt-4"
/>
```

#### API Response Structure

```typescript
interface ApiResponse {
  data: ItemType[] // Array of items (not "items" or "list")
  total: number // Total count
  total_pages: number // Total pages
  page: number // Current page
  per_page: number // Items per page
}
```

#### Key Points

- Always use `page`/`setPage` and `limit`/`setLimit` as state variable names
- Default limit is `9`
- Include all dependencies in React Query's `queryKey`
- Reset page to 1 when changing items per page
- Use `itemsData?.data` for the items array (not `.items` or `.list`)
- Use `itemsData?.total` for total count
- Use `itemsData?.total_pages` for pagination checks

#### Reference Files

- `/src/app/auth/tasks/page.tsx` - Complete working example
- `/src/app/auth/user-management/page.tsx` - Recent implementation
- `/src/components/ui/pagination.tsx` - Pagination component

## Authentication Best Practices

### Login Redirect Issue Fix

- **Problem**: Auth state not synced before redirect causing "Authenticating..." loop
- **Root Cause**: Zustand persist state + localStorage + component state sync timing issues
- **Solution**: Force localStorage sync + state-aware redirect pattern
- **Key Pattern**: Always wait for auth state ready before navigation

#### Implementation Details:

1. **Force Immediate Persistence** in `login()` function:

   ```typescript
   // Force localStorage update immediately after login
   localStorage.setItem(
     'auth-storage',
     JSON.stringify({
       state: { user, isAuthenticated: true },
       version: 0,
     })
   )
   ```

2. **State-Aware Redirect** in login component:

   ```typescript
   // Wait for auth state to be ready before redirect
   while (attempts < maxAttempts) {
     const authState = useAuthStore.getState()
     if (authState.isAuthenticated && authState.user && authState.isHydrated) {
       break
     }
     await new Promise((resolve) => setTimeout(resolve, 50))
   }
   window.location.href = '/auth/dashboard' // Force navigation
   ```

3. **Immediate Auth State Setting** in `hydrate()`:
   ```typescript
   if (!currentState.user && token) {
     set({ isAuthenticated: true }) // Set immediately if token exists
   }
   ```

#### Files Modified:

- `/src/store/auth.ts` - Force persistence + immediate auth state
- `/src/app/login/page.tsx` - State-aware redirect pattern
- `/src/components/layout/app-layout.tsx` - Improved loading conditions

- `to memorize`
