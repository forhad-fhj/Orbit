# Authentication Middleware

This directory contains authentication middleware for protecting API routes.

## Middleware Functions

### `authenticateToken`

Main authentication middleware that verifies JWT tokens.

**Usage:**
```typescript
import { authenticateToken, AuthRequest } from '../middleware/auth';

router.post('/protected', authenticateToken, async (req: AuthRequest, res) => {
  // req.userId is available here
  const userId = req.userId;
  // ... your route logic
});
```

**Features:**
- Extracts token from HttpOnly cookies (preferred)
- Falls back to Authorization header (Bearer token)
- Verifies JWT signature and expiration
- Returns 401 if no token provided
- Returns 403 if token is invalid or expired
- Attaches `userId` to request object

**Token Sources:**
1. HttpOnly cookie: `req.cookies.token`
2. Authorization header: `Authorization: Bearer <token>`

### `optionalAuthenticateToken`

Optional authentication that doesn't require a token but attaches userId if present.

**Usage:**
```typescript
import { optionalAuthenticateToken, AuthRequest } from '../middleware/auth';

router.get('/public', optionalAuthenticateToken, async (req: AuthRequest, res) => {
  if (req.userId) {
    // User is authenticated - show personalized content
  } else {
    // User is anonymous - show public content
  }
});
```

### `authenticateTokenWithUser`

Enhanced authentication that also validates user exists in database.

**Usage:**
```typescript
import { authenticateTokenWithUser, AuthRequest } from '../middleware/auth';

router.put('/profile', authenticateTokenWithUser, async (req: AuthRequest, res) => {
  // req.userId and req.user are available
  const user = req.user; // { id, username, email }
  // ... your route logic
});
```

**Features:**
- All features of `authenticateToken`
- Validates user exists in database
- Attaches full user object to request
- Returns 403 if user doesn't exist

### Helper Functions

#### `isAuthenticated(req: AuthRequest): boolean`
Check if request is authenticated.

#### `requireAuth(req: AuthRequest): void`
Throw error if not authenticated (for use in route handlers).

## Request Interface

The `AuthRequest` interface extends Express `Request`:

```typescript
interface AuthRequest extends Request {
  userId?: string;           // User ID from JWT token
  user?: {                   // Full user object (if using authenticateTokenWithUser)
    id: string;
    username: string;
    email: string;
  };
  cookies: {
    token?: string;          // JWT token from HttpOnly cookie
  };
}
```

## Error Responses

### 401 Unauthorized
- No token provided
- Token expired

```json
{
  "error": "Authentication required",
  "message": "No token provided. Please login to access this resource."
}
```

### 403 Forbidden
- Invalid token
- User not found (for `authenticateTokenWithUser`)

```json
{
  "error": "Invalid token",
  "message": "The provided token is invalid."
}
```

## Token Format

JWT tokens are signed with `JWT_SECRET` and contain:

```json
{
  "userId": "uuid-string",
  "iat": 1234567890,
  "exp": 1234567890
}
```

## Usage Examples

### Protected Route
```typescript
router.post('/posts', authenticateToken, async (req: AuthRequest, res) => {
  const post = await prisma.post.create({
    data: {
      authorId: req.userId!,
      content: req.body.content,
    },
  });
  res.json({ post });
});
```

### Optional Auth Route
```typescript
router.get('/posts', optionalAuthenticateToken, async (req: AuthRequest, res) => {
  const posts = await prisma.post.findMany({
    where: req.userId 
      ? {} // Show all posts if authenticated
      : { published: true }, // Only published if anonymous
  });
  res.json({ posts });
});
```

### User Validation Route
```typescript
router.put('/users/profile', authenticateTokenWithUser, async (req: AuthRequest, res) => {
  const updated = await prisma.user.update({
    where: { id: req.user!.id },
    data: req.body,
  });
  res.json({ user: updated });
});
```

## Security Considerations

1. **HttpOnly Cookies**: Preferred method - prevents XSS attacks
2. **Bearer Tokens**: Alternative for API clients
3. **Token Expiration**: Tokens expire after 7 days
4. **User Validation**: Use `authenticateTokenWithUser` for critical operations
5. **HTTPS**: Always use HTTPS in production (secure flag on cookies)

## Testing

Use the test utilities to generate tokens for testing:

```typescript
import { generateTestToken } from '../middleware/auth.test';

const token = generateTestToken('user-id-123');
// Use token in test requests
```

