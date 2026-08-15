# Authentication System Documentation

## Overview

The Orbit backend uses JWT (JSON Web Tokens) for authentication with HttpOnly cookies for enhanced security.

## Authentication Flow

### 1. Registration
```
POST /api/auth/register
Body: { username, email, password }
Response: { user, token }
Cookie: token (HttpOnly)
```

### 2. Login
```
POST /api/auth/login
Body: { email, password }
Response: { user, token }
Cookie: token (HttpOnly)
```

### 3. Authenticated Requests
The JWT token is automatically sent via HttpOnly cookie or Authorization header.

## Token Format

JWT tokens contain:
```json
{
  "userId": "uuid-string",
  "iat": 1234567890,  // Issued at
  "exp": 1234567890   // Expires at (7 days)
}
```

## Middleware Options

### 1. `authenticateToken` (Standard)
Use for most protected routes.

```typescript
router.post('/posts', authenticateToken, async (req: AuthRequest, res) => {
  // req.userId is available
});
```

**Features:**
- Verifies JWT token
- Extracts from cookie or Authorization header
- Returns 401 if no token
- Returns 403 if invalid/expired
- Attaches `userId` to request

### 2. `optionalAuthenticateToken` (Optional)
Use for routes that work for both authenticated and anonymous users.

```typescript
router.get('/posts', optionalAuthenticateToken, async (req: AuthRequest, res) => {
  if (req.userId) {
    // Show personalized content
  } else {
    // Show public content
  }
});
```

**Features:**
- Doesn't require token
- Attaches `userId` if token is valid
- Allows request to continue without token

### 3. `authenticateTokenWithUser` (Enhanced)
Use for critical operations that need user validation.

```typescript
router.put('/profile', authenticateTokenWithUser, async (req: AuthRequest, res) => {
  // req.userId and req.user are available
  const user = req.user; // { id, username, email }
});
```

**Features:**
- All features of `authenticateToken`
- Validates user exists in database
- Attaches full user object
- Returns 403 if user doesn't exist

## Token Sources

The middleware checks for tokens in this order:

1. **HttpOnly Cookie** (Preferred)
   ```
   Cookie: token=<jwt-token>
   ```

2. **Authorization Header** (Fallback)
   ```
   Authorization: Bearer <jwt-token>
   ```

## Security Features

### HttpOnly Cookies
- Prevents XSS attacks (JavaScript can't access)
- Automatically sent with requests
- Secure flag in production (HTTPS only)

### Token Expiration
- Tokens expire after 7 days
- Client must re-authenticate after expiration

### SameSite Protection
- `sameSite: 'strict'` prevents CSRF attacks
- Cookies only sent on same-site requests

## Error Responses

### 401 Unauthorized
```json
{
  "error": "Authentication required",
  "message": "No token provided. Please login to access this resource."
}
```

### 401 Token Expired
```json
{
  "error": "Token expired",
  "message": "Your session has expired. Please login again."
}
```

### 403 Invalid Token
```json
{
  "error": "Invalid token",
  "message": "The provided token is invalid."
}
```

### 403 User Not Found
```json
{
  "error": "User not found",
  "message": "The user associated with this token no longer exists."
}
```

## Usage Examples

### Protected Route
```typescript
import { authenticateToken, AuthRequest } from '../middleware/auth';

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
import { optionalAuthenticateToken, AuthRequest } from '../middleware/auth';

router.get('/posts', optionalAuthenticateToken, async (req: AuthRequest, res) => {
  const where = req.userId 
    ? {} // All posts for authenticated users
    : { published: true }; // Only published for anonymous
  
  const posts = await prisma.post.findMany({ where });
  res.json({ posts });
});
```

### User Validation Route
```typescript
import { authenticateTokenWithUser, AuthRequest } from '../middleware/auth';

router.put('/users/profile', authenticateTokenWithUser, async (req: AuthRequest, res) => {
  const updated = await prisma.user.update({
    where: { id: req.user!.id },
    data: req.body,
  });
  res.json({ user: updated });
});
```

## Frontend Integration

### Login/Register
After successful login/register, the token is automatically set as an HttpOnly cookie.

```typescript
// Frontend doesn't need to handle token storage
// Cookie is automatically sent with requests
const response = await fetch('/api/auth/login', {
  method: 'POST',
  credentials: 'include', // Important for cookies
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ email, password }),
});
```

### Authenticated Requests
```typescript
// Token is automatically sent via cookie
const response = await fetch('/api/posts', {
  method: 'POST',
  credentials: 'include', // Important for cookies
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ content: 'Hello' }),
});
```

### Alternative: Bearer Token
If using Authorization header instead of cookies:

```typescript
const token = localStorage.getItem('token');
const response = await fetch('/api/posts', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`,
  },
  body: JSON.stringify({ content: 'Hello' }),
});
```

## Testing

### Generate Test Token
```typescript
import { generateTestToken } from '../middleware/auth.test';

const token = generateTestToken('user-id-123');
```

### Test Protected Route
```typescript
// Using cookie
const response = await fetch('/api/posts', {
  method: 'POST',
  credentials: 'include',
  headers: {
    'Content-Type': 'application/json',
    'Cookie': `token=${token}`,
  },
  body: JSON.stringify({ content: 'Test' }),
});

// Using Authorization header
const response = await fetch('/api/posts', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`,
  },
  body: JSON.stringify({ content: 'Test' }),
});
```

## Environment Variables

Required in `.env`:
```env
JWT_SECRET="your-super-secret-jwt-key"
```

**Security Note:** Use a strong, random secret in production. Generate with:
```bash
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
```

## Logout

```typescript
POST /api/auth/logout
Response: { message: "Logged out successfully" }
Cookie: token (cleared)
```

The logout endpoint clears the HttpOnly cookie.

## Best Practices

1. **Use HttpOnly Cookies**: Prevents XSS attacks
2. **HTTPS in Production**: Secure flag requires HTTPS
3. **Token Expiration**: 7 days is reasonable for most apps
4. **User Validation**: Use `authenticateTokenWithUser` for critical operations
5. **Error Handling**: Always handle 401/403 errors in frontend
6. **Refresh Tokens**: Consider implementing refresh tokens for better UX

## Troubleshooting

### Token Not Being Sent
- Ensure `credentials: 'include'` in fetch requests
- Check cookie domain/path settings
- Verify CORS allows credentials

### Token Expired
- Implement automatic re-login on 401
- Consider refresh token pattern
- Check token expiration time

### Invalid Token
- Verify JWT_SECRET matches
- Check token format
- Ensure token wasn't tampered with

