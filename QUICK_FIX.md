# Quick Fix: "Failed to fetch" Error

## The Problem
The frontend cannot connect to the backend server. This usually means:
1. Backend server is not running
2. Missing `.env` file in backend directory

## Solution (3 Steps)

### Step 1: Create Backend `.env` File

Create a file named `.env` in the `backend/` directory with this content:

```env
DATABASE_URL="postgresql://postgres:your_password@localhost:5432/orbit"
JWT_SECRET="your-super-secret-jwt-key-change-this-in-production-min-32-chars"
PORT=5000
NODE_ENV=development
CORS_ORIGIN=http://localhost:3000
```

**Important:** Replace `your_password` with your actual PostgreSQL password, or use your existing database connection string.

### Step 2: Start Backend Server

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
- "Missing required environment variables" → Check Step 1
- "Failed to connect to database" → Check your DATABASE_URL
- "Port already in use" → Change PORT in .env to 5001

### Step 3: Verify Frontend Can Connect

Make sure your frontend `.env.local` has:

```env
NEXT_PUBLIC_API_URL=http://localhost:5000
```

Then restart your frontend:
```bash
cd frontend
npm run dev
```

## Test It

1. Open browser to `http://localhost:3000/register`
2. Fill in the form
3. Select gender (required)
4. Click Register

If it still fails, check:
- Browser console (F12) for error details
- Backend terminal for server logs
- Both servers are running

## Still Not Working?

Run this to test backend directly:
```bash
curl http://localhost:5000/api/health
```

Should return JSON with `"status": "ok"`
