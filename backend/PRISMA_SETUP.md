# Prisma Client & PostgreSQL Setup Guide

## Step 1: Install PostgreSQL

### macOS
```bash
brew install postgresql@14
brew services start postgresql@14
```

### Windows
Download and install from: https://www.postgresql.org/download/windows/

### Linux (Ubuntu/Debian)
```bash
sudo apt update
sudo apt install postgresql postgresql-contrib
sudo systemctl start postgresql
```

## Step 2: Create Database

Connect to PostgreSQL and create the database:

```bash
# Connect to PostgreSQL
psql -U postgres

# Create database
CREATE DATABASE orbit;

# (Optional) Create a dedicated user
CREATE USER orbit_user WITH PASSWORD 'your_password';
GRANT ALL PRIVILEGES ON DATABASE orbit TO orbit_user;

# Exit
\q
```

## Step 3: Configure Environment Variables

Create a `.env` file in the `backend/` directory:

```env
DATABASE_URL="postgresql://postgres:password@localhost:5432/orbit"
JWT_SECRET="your-super-secret-jwt-key"
PORT=5000
NODE_ENV=development
CORS_ORIGIN=http://localhost:3000
```

**Connection String Format:**
```
postgresql://[username]:[password]@[host]:[port]/[database]
```

## Step 4: Generate Prisma Client

```bash
cd backend
npm run prisma:generate
```

This creates the Prisma Client based on your schema.

## Step 5: Run Database Migrations

```bash
npm run prisma:migrate
```

This will:
- Create all tables in the database
- Set up relationships and indexes
- Create migration files in `prisma/migrations/`

## Step 6: Verify Connection

Test the database connection:

```bash
npm run db:setup
```

## Step 7: (Optional) Seed Database

Populate with sample data:

```bash
npm run db:seed
```

This creates:
- 3 test users (alice, bob, charlie)
- Sample posts, comments, likes, follows, and messages
- All passwords are: `password123`

## Troubleshooting

### Connection Refused
- Ensure PostgreSQL is running
- Check if port 5432 is correct
- Verify username/password in DATABASE_URL

### Database Does Not Exist
- Create database manually: `CREATE DATABASE orbit;`
- Or let Prisma create it (if user has permissions)

### Permission Denied
- Grant proper permissions to database user
- Or use postgres superuser for development

### Migration Issues
```bash
# Reset database (⚠️ deletes all data)
npm run prisma:reset

# Check migration status
npx prisma migrate status
```

## Production Considerations

1. **Use Connection Pooling:**
   ```
   DATABASE_URL="postgresql://user:pass@host:5432/db?connection_limit=10&pool_timeout=20"
   ```

2. **Enable SSL:**
   ```
   DATABASE_URL="postgresql://user:pass@host:5432/db?sslmode=require"
   ```

3. **Use Environment-Specific URLs:**
   - Development: Local PostgreSQL
   - Production: Managed database (AWS RDS, Heroku Postgres, etc.)

## Useful Commands

- `npm run prisma:generate` - Generate Prisma Client
- `npm run prisma:migrate` - Create and run migrations
- `npm run prisma:studio` - Open Prisma Studio (database GUI)
- `npm run prisma:format` - Format schema file
- `npm run prisma:reset` - Reset database
- `npm run db:setup` - Test connection
- `npm run db:seed` - Seed with sample data

