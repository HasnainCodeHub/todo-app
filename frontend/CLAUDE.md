# Frontend CLAUDE.md - Phase II Todo App

## Overview

Next.js 15 frontend for the Phase II Todo application with JWT authentication.

## Architecture

- **Framework:** Next.js 15 with App Router
- **Styling:** Tailwind CSS
- **API Client:** Custom fetch wrapper with auth headers
- **Authentication:** Better Auth (production) / localStorage (development)

## Key Files

```
frontend/
├── app/
│   ├── layout.tsx          # Root layout
│   ├── page.tsx             # Task list view
│   └── tasks/
│       ├── new/page.tsx     # Create task form
│       └── [id]/edit/page.tsx  # Edit task form
├── components/
│   ├── TaskList.tsx         # Task list container
│   ├── TaskItem.tsx         # Individual task card
│   ├── TaskForm.tsx         # Create/edit form
│   ├── FilterControls.tsx   # Status/priority filters
│   ├── SortControls.tsx     # Sort options
│   └── SearchBar.tsx        # Search input
├── lib/
│   ├── api.ts               # API client with auth
│   ├── auth.ts              # Token management
│   └── types.ts             # TypeScript types
└── hooks/
    ├── useTasks.ts          # Task fetching hook
    └── useTaskMutations.ts  # Task mutation hook
```

## Authentication Setup

### Development (localStorage)

For local development without Better Auth:

```javascript
// In browser console:
localStorage.setItem('auth_token', '<your-jwt-token>');
localStorage.setItem('user_id', 'your_user_id');

// Or use the helper:
import { setupDemoAuth } from '@/lib/auth';
setupDemoAuth('demo_user');
```

To generate a test token, run in backend directory:

```bash
python -c "from app.auth import create_test_token; print(create_test_token('demo_user'))"
```

### Production (Better Auth)

1. **Install Better Auth:**
   ```bash
   npm install better-auth
   ```

2. **Configure auth client:**
   ```typescript
   // lib/auth-client.ts
   import { createAuthClient } from 'better-auth/react';

   export const authClient = createAuthClient({
     baseURL: process.env.NEXT_PUBLIC_API_BASE_URL,
   });
   ```

3. **Set up auth provider in layout:**
   ```tsx
   // app/layout.tsx
   import { AuthProvider } from 'better-auth/react';
   import { authClient } from '@/lib/auth-client';

   export default function RootLayout({ children }) {
     return (
       <html>
         <body>
           <AuthProvider client={authClient}>
             {children}
           </AuthProvider>
         </body>
       </html>
     );
   }
   ```

4. **Use auth in components:**
   ```tsx
   import { useSession, useSignIn, useSignOut } from 'better-auth/react';

   function Profile() {
     const { data: session } = useSession();
     const signOut = useSignOut();

     if (!session) return <LoginButton />;
     return <button onClick={() => signOut()}>Logout</button>;
   }
   ```

5. **Update API client to use Better Auth token:**
   ```typescript
   // lib/api.ts
   import { authClient } from './auth-client';

   export function getAuthToken(): string | null {
     const session = authClient.getSession();
     return session?.accessToken ?? null;
   }
   ```

## API Endpoints

All task endpoints require authentication and use the pattern:
`/api/{user_id}/tasks`

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/{user_id}/tasks` | List tasks with filters |
| POST | `/api/{user_id}/tasks` | Create task |
| GET | `/api/{user_id}/tasks/{id}` | Get task |
| PUT | `/api/{user_id}/tasks/{id}` | Update task |
| DELETE | `/api/{user_id}/tasks/{id}` | Delete task |
| PATCH | `/api/{user_id}/tasks/{id}/complete` | Mark complete |
| PATCH | `/api/{user_id}/tasks/{id}/incomplete` | Mark incomplete |

Public endpoint (no auth):
| GET | `/api/system/db-health` | Database health check |

## Environment Variables

```bash
# .env.local
NEXT_PUBLIC_API_BASE_URL=http://127.0.0.1:8001/api
BETTER_AUTH_SECRET=your-secret-key  # Must match backend
```

## Running the Frontend

```bash
# Install dependencies
npm install

# Development
npm run dev

# Production build
npm run build
npm start
```

## Commands Reference

```bash
# Spec-Kit Plus workflow
/sp.specify    # Create/update specification
/sp.plan       # Generate technical plan
/sp.tasks      # Generate task breakdown
/sp.implement  # Execute implementation
/sp.clarify    # Clarify requirements
```
