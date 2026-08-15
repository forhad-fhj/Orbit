# Gender-Based Access Control Implementation

## Overview

The SocialPlatform now enforces strict gender-based segregation where users can only interact with users of their own gender.

## Implementation Summary

### ✅ Completed Features

1. **Database Schema**
   - Added `Gender` enum (MALE, FEMALE)
   - Added `gender` field to User model (required, immutable)

2. **Gender Validation Utility**
   - `verifyGenderAccess(requesterId, targetId)` - Core validation function
   - `getUserGender(userId)` - Helper to get user's gender
   - Returns 403 Forbidden if genders don't match

3. **Authentication**
   - Registration requires gender selection
   - Gender cannot be changed after registration
   - Gender included in user responses

4. **Posts API**
   - Feed automatically filters by user's gender
   - Post access validated before viewing
   - User posts filtered by gender

5. **Users API**
   - Profile access blocked for opposite gender
   - Search results filtered by gender
   - Gender field protected from updates

6. **Comments API**
   - Comment creation validates post author's gender
   - Comment viewing requires gender match

7. **Likes API**
   - Like creation validates post author's gender

8. **Follows API**
   - Follow/unfollow validates target user's gender
   - Followers/following lists filtered by gender

9. **Messages API**
   - Message sending blocked between different genders
   - Conversations filtered by gender
   - REST and Socket.io both enforce gender barrier

10. **Socket.io**
    - Real-time messaging validates gender before sending
    - Returns error if genders don't match

11. **Frontend**
    - Registration form includes gender dropdown
    - Gender selection required
    - Warning that gender cannot be changed

## Security Enforcement Points

### Backend Routes Protected

| Route | Protection |
|------|------------|
| `GET /api/posts` | Filters by user's gender |
| `GET /api/posts/:id` | Validates post author's gender |
| `GET /api/posts/user/:userId` | Validates target user's gender |
| `POST /api/comments` | Validates post author's gender |
| `GET /api/comments/post/:postId` | Validates post author's gender |
| `POST /api/likes/:postId` | Validates post author's gender |
| `GET /api/users/:id` | Validates target user's gender |
| `GET /api/users/search/:query` | Filters by user's gender |
| `POST /api/follows/:userId` | Validates target user's gender |
| `GET /api/follows/:userId/followers` | Validates target user's gender |
| `GET /api/follows/:userId/following` | Validates target user's gender |
| `POST /api/messages` | Validates receiver's gender |
| `GET /api/messages/:userId` | Validates target user's gender |
| `GET /api/messages/conversations` | Filters by gender |

### Socket.io Events Protected

| Event | Protection |
|------|------------|
| `send_message` | Validates receiver's gender |

## Database Migration Required

**⚠️ IMPORTANT:** You must run a database migration to add the gender field:

```bash
cd backend
npm run prisma:migrate
```

This will:
1. Add the `Gender` enum
2. Add the `gender` column to the `users` table
3. Require you to set a default value for existing users (if any)

**For existing users:** You'll need to manually set their gender or delete them.

## Testing Checklist

- [ ] Register new user with gender selection
- [ ] Verify gender cannot be changed in profile update
- [ ] Test feed shows only same-gender posts
- [ ] Test profile access blocked for opposite gender
- [ ] Test search returns only same-gender users
- [ ] Test follow/unfollow blocked for opposite gender
- [ ] Test messaging blocked for opposite gender
- [ ] Test comments blocked on opposite-gender posts
- [ ] Test likes blocked on opposite-gender posts

## Error Responses

All gender barrier violations return:
```json
{
  "error": "Access denied"
}
```
With HTTP status `403 Forbidden`

## Next Steps

1. **Run Migration:**
   ```bash
   cd backend
   npm run prisma:migrate
   ```

2. **Install Frontend Dependencies:**
   ```bash
   cd frontend
   npm install
   ```

3. **Test Registration:**
   - Register a MALE user
   - Register a FEMALE user
   - Verify they cannot see each other's content

4. **Verify All Endpoints:**
   - Test each protected endpoint
   - Ensure 403 errors for cross-gender access

## Notes

- Gender is set once during registration and cannot be changed
- All database queries filter by gender automatically
- Socket.io events also enforce gender checks
- Frontend registration form requires gender selection
