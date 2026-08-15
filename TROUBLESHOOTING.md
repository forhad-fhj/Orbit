# Troubleshooting: "Failed to fetch" Error

## Quick Fix Checklist

### ✅ Step 1: Check Backend Server is Running

Open a terminal and run:
```bash
cd backend
npm run dev
```

You should see:
```
✅ Database connected successfully.
🚀 Server running on http://localhost:5000
```

**If you see errors:**
- Check if port 5000 is already in use
- Verify `.env` file exists in `backend/` directory
- Check database connection

### ✅ Step 2: Verify Environment Variables

Create `backend/.env` file with:
```env
DATABASE_URL="postgresql://user:password@localhost:5432/orbit"
JWT_SECRET="your-secret-key-here-min-32-chars"
PORT=5000
CORS_ORIGIN="http://localhost:3000"
```

### ✅ Step 3: Run Database Migration

**CRITICAL:** You must run the migration to add the `gender` field:

```bash
cd backend
npm run prisma:migrate
```

**Migration name:** `add_gender_to_user`

**If you have existing users:**
```sql
-- Run this SQL first to set default gender
UPDATE users SET gender = 'MALE' WHERE gender IS NULL;
```

Then run the migration.

### ✅ Step 4: Regenerate Prisma Client

After migration:
```bash
cd backend
npm run prisma:generate
```

### ✅ Step 5: Check Frontend Environment

Create `frontend/.env.local` file:
```env
NEXT_PUBLIC_API_URL=http://localhost:5000
```

### ✅ Step 6: Restart Both Servers

**Terminal 1 - Backend:**
```bash
cd backend
npm run dev
```

**Terminal 2 - Frontend:**
```bash
cd frontend
npm run dev
```

## Common Issues

### Issue 1: "Cannot connect to server"
**Solution:** Backend server is not running. Start it with `npm run dev` in the backend directory.

### Issue 2: "Column 'gender' does not exist"
**Solution:** Database migration not run. Run `npm run prisma:migrate` in backend directory.

### Issue 3: "Missing required environment variables"
**Solution:** Create `backend/.env` file with required variables (see Step 2).

### Issue 4: CORS Error
**Solution:** Check `CORS_ORIGIN` in `backend/.env` matches your frontend URL (usually `http://localhost:3000`).

### Issue 5: Port Already in Use
**Solution:** Change `PORT=5000` to another port (e.g., `PORT=5001`) in `backend/.env` and update `NEXT_PUBLIC_API_URL` in frontend.

## Testing the Connection

### Test Backend Health:
```bash
curl http://localhost:5000/api/health
```

Should return:
```json
{
  "status": "ok",
  "message": "Orbit API is running",
  "database": "connected"
}
```

### Test Registration Endpoint:
```bash
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"username":"test","email":"test@test.com","password":"test123","gender":"MALE"}'
```

## Still Having Issues?

1. **Check browser console** for detailed error messages
2. **Check backend terminal** for server logs
3. **Verify database is running** (PostgreSQL)
4. **Check firewall/antivirus** isn't blocking localhost connections

## Quick Debug Commands

```bash
# Check if backend is running
curl http://localhost:5000/api/health

# Check if frontend can reach backend
curl http://localhost:5000/api/auth/register

# Check Prisma connection
cd backend
npx prisma db pull
```
