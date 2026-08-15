# API Endpoints Documentation

Complete documentation of all API endpoints for the Orbit social media platform.

## Base URL

```
http://localhost:5000/api
```

## Authentication

Most endpoints require authentication via JWT token. Tokens can be sent via:
- **HttpOnly Cookie** (preferred): Automatically sent with requests
- **Authorization Header**: `Authorization: Bearer <token>`

---

## Authentication Endpoints

### Register

Create a new user account.

**Endpoint:** `POST /api/auth/register`

**Request Body:**
```json
{
  "username": "johndoe",
  "email": "john@example.com",
  "password": "password123"
}
```

**Response:** `201 Created`
```json
{
  "user": {
    "id": "uuid",
    "username": "johndoe",
    "email": "john@example.com",
    "avatarUrl": null,
    "bio": null,
    "createdAt": "2024-01-01T00:00:00.000Z"
  },
  "token": "jwt-token"
}
```

**Errors:**
- `400` - Validation error or username/email already exists
- `500` - Internal server error

---

### Login

Authenticate and receive JWT token.

**Endpoint:** `POST /api/auth/login`

**Request Body:**
```json
{
  "email": "john@example.com",
  "password": "password123"
}
```

**Response:** `200 OK`
```json
{
  "user": {
    "id": "uuid",
    "username": "johndoe",
    "email": "john@example.com",
    "avatarUrl": null,
    "bio": null,
    "createdAt": "2024-01-01T00:00:00.000Z"
  },
  "token": "jwt-token"
}
```

**Errors:**
- `401` - Invalid credentials
- `400` - Validation error
- `500` - Internal server error

---

### Get Current User

Get the authenticated user's profile.

**Endpoint:** `GET /api/auth/me`

**Authentication:** Required

**Response:** `200 OK`
```json
{
  "user": {
    "id": "uuid",
    "username": "johndoe",
    "email": "john@example.com",
    "avatarUrl": null,
    "bio": null,
    "createdAt": "2024-01-01T00:00:00.000Z"
  }
}
```

**Errors:**
- `401` - Not authenticated
- `404` - User not found
- `500` - Internal server error

---

### Logout

Clear authentication token.

**Endpoint:** `POST /api/auth/logout`

**Authentication:** Optional

**Response:** `200 OK`
```json
{
  "message": "Logged out successfully"
}
```

---

## Posts Endpoints

### Create Post

Create a new post.

**Endpoint:** `POST /api/posts`

**Authentication:** Required

**Request Body:**
```json
{
  "content": "This is my first post!",
  "mediaUrl": "https://example.com/image.jpg",
  "mediaType": "IMAGE"
}
```

**Media Types:** `IMAGE`, `VIDEO`, `NONE` (default)

**Response:** `201 Created`
```json
{
  "post": {
    "id": "uuid",
    "authorId": "uuid",
    "content": "This is my first post!",
    "mediaUrl": "https://example.com/image.jpg",
    "mediaType": "IMAGE",
    "createdAt": "2024-01-01T00:00:00.000Z",
    "author": {
      "id": "uuid",
      "username": "johndoe",
      "avatarUrl": null
    },
    "_count": {
      "likes": 0,
      "comments": 0
    }
  }
}
```

**Errors:**
- `401` - Not authenticated
- `400` - Validation error
- `500` - Internal server error

---

### Get Feed

Get paginated feed of all posts.

**Endpoint:** `GET /api/posts`

**Authentication:** Optional (shows like status if authenticated)

**Query Parameters:**
- `page` (optional): Page number (default: 1)
- `limit` (optional): Posts per page (default: 10, max: 50)

**Example:** `GET /api/posts?page=1&limit=20`

**Response:** `200 OK`
```json
{
  "posts": [
    {
      "id": "uuid",
      "authorId": "uuid",
      "content": "Post content",
      "mediaUrl": null,
      "mediaType": "NONE",
      "createdAt": "2024-01-01T00:00:00.000Z",
      "author": {
        "id": "uuid",
        "username": "johndoe",
        "avatarUrl": null
      },
      "_count": {
        "likes": 5,
        "comments": 2
      },
      "liked": false
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 100,
    "totalPages": 10,
    "hasMore": true
  }
}
```

**Note:** `liked` field is only included if authenticated.

---

### Get Post by ID

Get a single post by ID.

**Endpoint:** `GET /api/posts/:id`

**Authentication:** Optional

**Response:** `200 OK`
```json
{
  "post": {
    "id": "uuid",
    "authorId": "uuid",
    "content": "Post content",
    "mediaUrl": null,
    "mediaType": "NONE",
    "createdAt": "2024-01-01T00:00:00.000Z",
    "author": {
      "id": "uuid",
      "username": "johndoe",
      "avatarUrl": null
    },
    "_count": {
      "likes": 5,
      "comments": 2
    }
  }
}
```

**Errors:**
- `404` - Post not found
- `500` - Internal server error

---

### Delete Post

Delete a post (only by author).

**Endpoint:** `DELETE /api/posts/:id`

**Authentication:** Required

**Response:** `200 OK`
```json
{
  "message": "Post deleted successfully"
}
```

**Errors:**
- `401` - Not authenticated
- `403` - Not authorized (not the post author)
- `404` - Post not found
- `500` - Internal server error

---

### Get User's Posts

Get all posts by a specific user.

**Endpoint:** `GET /api/posts/user/:userId`

**Authentication:** Optional

**Response:** `200 OK`
```json
{
  "posts": [
    {
      "id": "uuid",
      "authorId": "uuid",
      "content": "Post content",
      "createdAt": "2024-01-01T00:00:00.000Z",
      "author": {
        "id": "uuid",
        "username": "johndoe",
        "avatarUrl": null
      },
      "_count": {
        "likes": 5,
        "comments": 2
      }
    }
  ]
}
```

---

## Users Endpoints

### Get User Profile

Get a user's profile information.

**Endpoint:** `GET /api/users/:id`

**Authentication:** Optional (shows follow status if authenticated)

**Response:** `200 OK`
```json
{
  "user": {
    "id": "uuid",
    "username": "johndoe",
    "email": "john@example.com",
    "avatarUrl": null,
    "bio": "My bio",
    "createdAt": "2024-01-01T00:00:00.000Z",
    "_count": {
      "followers": 10,
      "following": 5,
      "posts": 20
    },
    "isFollowing": false,
    "isOwnProfile": false
  }
}
```

**Note:** `isFollowing` and `isOwnProfile` are only included if authenticated.

**Errors:**
- `404` - User not found
- `500` - Internal server error

---

### Update Profile

Update the authenticated user's profile.

**Endpoint:** `PUT /api/users/profile`

**Authentication:** Required

**Request Body:**
```json
{
  "username": "newusername",
  "bio": "Updated bio",
  "avatarUrl": "https://example.com/avatar.jpg"
}
```

All fields are optional.

**Response:** `200 OK`
```json
{
  "user": {
    "id": "uuid",
    "username": "newusername",
    "email": "john@example.com",
    "avatarUrl": "https://example.com/avatar.jpg",
    "bio": "Updated bio",
    "createdAt": "2024-01-01T00:00:00.000Z"
  }
}
```

**Errors:**
- `401` - Not authenticated
- `400` - Validation error
- `500` - Internal server error

---

### Search Users

Search for users by username or email.

**Endpoint:** `GET /api/users/search/:query`

**Authentication:** Optional

**Response:** `200 OK`
```json
{
  "users": [
    {
      "id": "uuid",
      "username": "johndoe",
      "email": "john@example.com",
      "avatarUrl": null,
      "bio": "My bio"
    }
  ]
}
```

**Note:** Returns up to 20 results.

---

## Follows Endpoints

### Follow User

Follow another user.

**Endpoint:** `POST /api/follows/:userId`

**Authentication:** Required

**Response:** `201 Created`
```json
{
  "follow": {
    "followerId": "uuid",
    "followingId": "uuid"
  }
}
```

**Errors:**
- `401` - Not authenticated
- `400` - Cannot follow yourself or already following
- `500` - Internal server error

---

### Unfollow User

Unfollow a user.

**Endpoint:** `DELETE /api/follows/:userId`

**Authentication:** Required

**Response:** `200 OK`
```json
{
  "message": "Unfollowed successfully"
}
```

**Errors:**
- `401` - Not authenticated
- `500` - Internal server error

---

### Check Follow Status

Check if current user is following another user.

**Endpoint:** `GET /api/follows/:userId/check`

**Authentication:** Required

**Response:** `200 OK`
```json
{
  "following": true
}
```

---

### Get Followers

Get list of users following a specific user.

**Endpoint:** `GET /api/follows/:userId/followers`

**Authentication:** Optional

**Response:** `200 OK`
```json
{
  "followers": [
    {
      "id": "uuid",
      "username": "johndoe",
      "avatarUrl": null,
      "bio": "My bio"
    }
  ]
}
```

---

### Get Following

Get list of users a specific user is following.

**Endpoint:** `GET /api/follows/:userId/following`

**Authentication:** Optional

**Response:** `200 OK`
```json
{
  "following": [
    {
      "id": "uuid",
      "username": "johndoe",
      "avatarUrl": null,
      "bio": "My bio"
    }
  ]
}
```

---

## Error Responses

All endpoints may return these error responses:

### 400 Bad Request
```json
{
  "error": "Validation error",
  "message": "Invalid input data"
}
```

### 401 Unauthorized
```json
{
  "error": "Authentication required",
  "message": "No token provided. Please login to access this resource."
}
```

### 403 Forbidden
```json
{
  "error": "Not authorized",
  "message": "You don't have permission to perform this action."
}
```

### 404 Not Found
```json
{
  "error": "Resource not found",
  "message": "The requested resource does not exist."
}
```

### 500 Internal Server Error
```json
{
  "error": "Internal server error",
  "message": "An unexpected error occurred."
}
```

---

## Rate Limiting

Currently, there is no rate limiting implemented. Consider adding rate limiting for production.

## Pagination

Endpoints that support pagination:
- `GET /api/posts` - Feed pagination

Pagination response format:
```json
{
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 100,
    "totalPages": 10,
    "hasMore": true
  }
}
```

---

## Testing

### Using cURL

**Register:**
```bash
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"username":"test","email":"test@example.com","password":"password123"}'
```

**Login:**
```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"password123"}' \
  -c cookies.txt
```

**Get Feed (with cookie):**
```bash
curl http://localhost:5000/api/posts \
  -b cookies.txt
```

**Create Post:**
```bash
curl -X POST http://localhost:5000/api/posts \
  -H "Content-Type: application/json" \
  -b cookies.txt \
  -d '{"content":"Hello world!"}'
```

---

## Notes

- All timestamps are in ISO 8601 format (UTC)
- UUIDs are used for all IDs
- Passwords must be at least 6 characters
- Usernames must be 3-30 characters
- Post content is limited to 2000 characters
- Media URLs should be valid URLs
- Pagination limit is capped at 50 items per page

