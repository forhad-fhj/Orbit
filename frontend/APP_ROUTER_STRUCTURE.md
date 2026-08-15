# Next.js App Router Structure

Complete guide to the App Router structure for the Orbit frontend.

## Directory Structure

```
app/
├── layout.tsx              # Root layout (wraps all pages)
├── page.tsx                # Home page (redirects)
├── loading.tsx             # Global loading UI
├── error.tsx              # Global error boundary
├── not-found.tsx           # 404 page
├── providers.tsx           # React Query provider
├── globals.css             # Global styles
│
├── (auth)/                 # Route group for auth pages
│   ├── layout.tsx          # Auth-specific layout
│   ├── login/
│   │   └── page.tsx        # /login
│   └── register/
│       └── page.tsx        # /register
│
└── (main)/                 # Route group for main app
    ├── layout.tsx          # Main layout with navigation
    ├── feed/
    │   └── page.tsx        # /feed
    └── profile/
        └── [id]/
            └── page.tsx    # /profile/[id]
```

## Route Groups

### `(auth)` - Authentication Routes
Route groups (folders in parentheses) don't affect the URL structure but allow shared layouts.

**Routes:**
- `/login` - Login page
- `/register` - Registration page

**Layout:** Centered card layout for auth forms

### `(main)` - Main Application Routes
**Routes:**
- `/feed` - Posts feed
- `/profile/[id]` - User profile pages

**Layout:** Full app layout with navigation bar

## Special Files

### `layout.tsx` (Root)
- Wraps all pages
- Includes font configuration
- Provides React Query provider
- Sets up global styles

### `page.tsx` (Home)
- Redirects to `/feed` if authenticated
- Redirects to `/login` if not authenticated

### `loading.tsx`
- Global loading UI
- Shown during route transitions
- Can be overridden per route

### `error.tsx`
- Global error boundary
- Catches unhandled errors
- Provides error UI and retry

### `not-found.tsx`
- 404 page
- Shown for unknown routes

### `providers.tsx`
- React Query provider setup
- Client-side only

## Route Organization

### File-Based Routing
- `page.tsx` = Route
- `layout.tsx` = Shared layout
- `loading.tsx` = Loading state
- `error.tsx` = Error boundary
- `not-found.tsx` = 404 page

### Dynamic Routes
- `[id]` = Dynamic segment
- Access via `useParams()` hook

### Route Groups
- `(groupName)` = Route group
- Doesn't affect URL
- Allows shared layouts

## Middleware

`middleware.ts` handles:
- Authentication checks
- Route protection
- Redirects

**Protected Routes:**
- All routes except `/login` and `/register`

**Public Routes:**
- `/login`
- `/register`
- `/` (redirects)

## Layout Hierarchy

```
Root Layout (app/layout.tsx)
  ├── Auth Layout (app/(auth)/layout.tsx)
  │   ├── Login Page
  │   └── Register Page
  │
  └── Main Layout (app/(main)/layout.tsx)
      ├── Feed Page
      └── Profile Page
```

## Navigation Flow

1. **Unauthenticated User:**
   - `/` → `/login`
   - Can access `/login` and `/register`
   - Redirected from protected routes

2. **Authenticated User:**
   - `/` → `/feed`
   - Can access all routes
   - Redirected from `/login` and `/register`

## Best Practices

1. **Route Groups:** Use for shared layouts without affecting URLs
2. **Loading States:** Add `loading.tsx` for better UX
3. **Error Handling:** Use `error.tsx` for error boundaries
4. **Client Components:** Mark with `'use client'` when needed
5. **Server Components:** Default (no directive needed)

## Adding New Routes

### Static Route
```
app/
└── about/
    └── page.tsx    # /about
```

### Dynamic Route
```
app/
└── posts/
    └── [id]/
        └── page.tsx    # /posts/[id]
```

### Nested Route
```
app/
└── dashboard/
    ├── page.tsx        # /dashboard
    └── settings/
        └── page.tsx   # /dashboard/settings
```

### Route Group
```
app/
└── (admin)/
    ├── layout.tsx     # Admin layout
    └── users/
        └── page.tsx   # /users (not /admin/users)
```

## TypeScript

All routes are fully typed:
- `useParams()` returns typed params
- `useRouter()` is typed
- `usePathname()` returns typed pathname

## Performance

- **Server Components:** Default (faster, smaller bundle)
- **Client Components:** Only when needed (`'use client'`)
- **Code Splitting:** Automatic per route
- **Loading States:** Built-in support

## Next Steps

- Add more routes as needed
- Implement route-specific loading states
- Add route transitions
- Implement route guards
- Add breadcrumbs
- Implement nested layouts

