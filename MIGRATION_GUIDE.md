# Migration Guide: Adding Gender-Based Access Control

## ⚠️ Critical Steps Required

### Step 1: Run Database Migration

The Prisma schema has been updated to include a `Gender` enum and `gender` field. You **must** run a migration:

```bash
cd backend
npm run prisma:migrate
```

**Migration Name Suggestion:** `add_gender_to_user`

**Important:** When prompted, you'll need to handle existing users:
- If you have existing users, you'll need to set a default gender or delete them
- The migration will fail if there are users without a gender value

**Option A - Set default for existing users:**
```sql
-- Run this BEFORE the migration if you have existing users
UPDATE users SET gender = 'MALE' WHERE gender IS NULL;
```

**Option B - Delete existing users:**
```bash
# In Prisma Studio or SQL
DELETE FROM users;
```

### Step 2: Install Frontend Dependencies

The frontend now requires `@radix-ui/react-select`:

```bash
cd frontend
npm install
```

### Step 3: Regenerate Prisma Client

After migration, regenerate the Prisma client:

```bash
cd backend
npm run prisma:generate
```

### Step 4: Restart Servers

Restart both backend and frontend servers:

```bash
# Backend
cd backend
npm run dev

# Frontend (in another terminal)
cd frontend
npm run dev
```

## Testing the Implementation

### Test Case 1: Registration with Gender
1. Go to `/register`
2. Fill in username, email, password
3. **Select gender** (MALE or FEMALE) - this is now required
4. Submit form
5. Verify user is created with gender

### Test Case 2: Gender Segregation
1. Register User A as MALE
2. Register User B as FEMALE
3. Login as User A
4. Try to access User B's profile - should get 403
5. Try to search for User B - should not appear
6. Try to follow User B - should get 403
7. Try to message User B - should get 403

### Test Case 3: Same Gender Access
1. Register User C as MALE
2. Login as User A (also MALE)
3. Access User C's profile - should work
4. Follow User C - should work
5. Message User C - should work

## What Changed

### Backend Changes
- ✅ Prisma schema: Added Gender enum and gender field
- ✅ All routes: Added gender validation
- ✅ Socket.io: Added gender checks
- ✅ Auth routes: Require gender on registration, prevent changes

### Frontend Changes
- ✅ Registration form: Added gender dropdown
- ✅ User interface: Added gender field
- ✅ Store: Updated User type

## Rollback Plan

If you need to rollback:

1. **Revert Prisma Schema:**
   ```bash
   cd backend
   # Delete the migration file in prisma/migrations/
   # Revert schema.prisma to remove Gender enum and gender field
   ```

2. **Revert Code Changes:**
   ```bash
   git checkout HEAD~1 -- backend/src/routes/
   git checkout HEAD~1 -- backend/src/lib/gender.ts
   git checkout HEAD~1 -- frontend/app/(auth)/register/
   ```

3. **Run Migration:**
   ```bash
   npm run prisma:migrate reset
   ```

## Support

If you encounter issues:

1. **Migration fails:** Check for existing users without gender
2. **403 errors everywhere:** Verify gender is being set correctly
3. **Frontend errors:** Ensure `@radix-ui/react-select` is installed
4. **Type errors:** Regenerate Prisma client

## Next Steps After Migration

1. Test all endpoints with both genders
2. Verify Socket.io messaging works correctly
3. Test edge cases (same user, etc.)
4. Monitor for any 403 errors in production logs
