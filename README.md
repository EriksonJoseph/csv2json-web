# CSV2JSON Web Application

A modern web application built with Next.js 14 for CSV to JSON conversion and advanced fuzzy matching capabilities.

## Features

### 🔐 Authentication
- JWT-based authentication with access & refresh tokens
- User registration and login
- Automatic token refresh
- Protected routes with middleware

### 📁 File Management
- Drag & drop file upload
- Support for CSV, Excel, TXT, and JSON files
- File status tracking (pending, processing, completed, failed)
- File download and management
- Progress tracking for uploads

### ⚙️ Task Management
- Create processing tasks for uploaded files
- Real-time task status updates
- Task progress monitoring
- Error handling and reporting

### 🔍 Fuzzy Matching System
- Single search with configurable similarity threshold
- Bulk search for multiple terms
- File upload support for bulk search terms
- Export search results to CSV
- Real-time search performance metrics

### 📊 Dashboard
- Overview of files, tasks, and searches
- Recent activity tracking
- System status indicators
- Quick actions and navigation

### 🎨 Modern UI/UX
- Dark/Light mode toggle
- Responsive design (mobile-first)
- Loading states and skeleton loaders
- Toast notifications
- Smooth animations and transitions

## Tech Stack

- **Framework**: Next.js 14 with App Router
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **UI Components**: Shadcn/ui + Radix UI
- **Forms**: React Hook Form + Zod validation
- **HTTP Client**: Axios with interceptors
- **State Management**: Zustand
- **Data Fetching**: TanStack Query (React Query)
- **File Upload**: React Dropzone
- **Icons**: Lucide React
- **Date Handling**: date-fns

## Project Structure

```
src/
├── app/                    # Next.js App Router pages
│   ├── dashboard/         # Dashboard page
│   ├── files/            # File management pages
│   ├── tasks/            # Task management pages
│   ├── matching/         # Fuzzy matching pages
│   ├── login/            # Authentication pages
│   └── register/
├── components/            # Reusable components
│   ├── ui/               # Base UI components (Shadcn)
│   ├── layout/           # Layout components (header, sidebar)
│   ├── auth/             # Authentication components
│   ├── dashboard/        # Dashboard-specific components
│   ├── files/            # File management components
│   ├── tasks/            # Task management components
│   └── matching/         # Fuzzy matching components
├── lib/                  # Utility libraries
│   ├── api.ts           # API client functions
│   ├── axios.ts         # Axios configuration
│   └── utils.ts         # Utility functions
├── store/               # Zustand stores
│   ├── auth.ts          # Authentication state
│   └── ui.ts            # UI state
├── types/               # TypeScript type definitions
│   ├── auth.ts
│   ├── files.ts
│   ├── tasks.ts
│   ├── matching.ts
│   └── common.ts
└── hooks/               # Custom React hooks
```

## API Integration

The application integrates with a backend API running on `http://localhost:8000/api` with the following endpoints:

### Authentication
- `POST /auth/login` - User login
- `POST /auth/register` - User registration
- `POST /auth/refresh` - Token refresh
- `POST /auth/logout` - User logout
- `GET /auth/me` - Get current user

### Files
- `POST /files/upload` - Upload file
- `GET /files` - List files with pagination
- `GET /files/{id}` - Get file details
- `GET /files/download/{id}` - Download file
- `DELETE /files/{id}` - Delete file

### Tasks
- `POST /task` - Create task
- `GET /task` - List tasks
- `GET /task/{id}` - Get task details
- `DELETE /task/{id}` - Delete task
- `GET /task/current-processing` - Get currently processing task

### Matching
- `GET /matching/columns/{task_id}` - Get task columns
- `POST /matching/search` - Single search
- `POST /matching/bulk-search` - Bulk search
- `GET /matching/history` - Search history

## Installation & Setup

1. **Install Dependencies**
   ```bash
   npm install
   ```

2. **Environment Configuration**
   Create a `.env.local` file with:
   ```
   NEXT_PUBLIC_API_BASE_URL=http://localhost:8000/api
   NEXT_PUBLIC_APP_NAME=CSV2JSON Web
   NEXT_PUBLIC_APP_VERSION=1.0.0
   ```

3. **Start Development Server**
   ```bash
   npm run dev
   ```

4. **Build for Production**
   ```bash
   npm run build
   npm start
   ```

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm start` - Start production server
- `npm run lint` - Run ESLint
- `npm run lint:fix` - Fix ESLint issues
- `npm run type-check` - Run TypeScript checks
- `npm run format` - Format code with Prettier
- `npm run format:check` - Check code formatting

## Development Guidelines

### Code Style
- Follow TypeScript best practices
- Use ESLint and Prettier for code formatting
- Implement proper error boundaries
- Write descriptive component and function names

### State Management
- Use Zustand for global state
- Use React Query for server state
- Keep component state local when possible

### API Integration
- All API calls should go through the centralized API client
- Implement proper error handling
- Use React Query for caching and synchronization

### UI/UX
- Follow the established design system
- Implement proper loading states
- Provide clear user feedback
- Ensure responsive design

## Security Features

- JWT token management with automatic refresh
- Request/response interceptors for authentication
- Protected routes with middleware
- Secure token storage
- Input validation and sanitization

## Performance Optimizations

- Code splitting per route
- Lazy loading for components
- Image optimization
- Virtualized lists for large datasets
- Efficient caching strategies
- Bundle size optimization

## Browser Support

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

This project is licensed under the MIT License.

## Support

For support and questions, please contact the development team or create an issue in the repository.