# Prisma Database Setup

This directory contains the Prisma schema and migration files for the Orbit database.

## Schema File

The `schema.prisma` file defines all database models and their relationships.

## Quick Start

### 1. Set up environment variables

Create a `.env` file in the `backend/` directory:

```env
DATABASE_URL="postgresql://username:password@localhost:5432/orbit"
```

### 2. Generate Prisma Client

```bash
npm run prisma:generate
```

This generates the Prisma Client based on your schema.

### 3. Create database and run migrations

```bash
# Create database first (if it doesn't exist)
# Then run migrations
npm run prisma:migrate
```

This will:
- Create the database if it doesn't exist
- Run all pending migrations
- Generate Prisma Client

### 4. Test database connection

```bash
npm run db:setup
```

### 5. (Optional) Seed the database

```bash
npm run db:seed
```

This populates the database with sample data for development.

## Available Commands

- `npm run prisma:generate` - Generate Prisma Client
- `npm run prisma:migrate` - Create and run migrations
- `npm run prisma:studio` - Open Prisma Studio (database GUI)
- `npm run prisma:format` - Format the schema file
- `npm run prisma:reset` - Reset database (⚠️ deletes all data)
- `npm run db:setup` - Test database connection
- `npm run db:seed` - Seed database with sample data

## Database Models

- **User** - User accounts with authentication
- **Post** - User posts (text, image, video)
- **Comment** - Comments on posts
- **Like** - Likes on posts
- **Follows** - User follow relationships
- **Message** - Direct messages between users

## Connection String Format

PostgreSQL connection string format:
```
postgresql://[user]:[password]@[host]:[port]/[database]
```

Examples:
- Local: `postgresql://postgres:password@localhost:5432/orbit`
- Cloud: `postgresql://user:pass@db.example.com:5432/orbit?sslmode=require`

## Troubleshooting

### Connection Issues

1. **Check PostgreSQL is running:**
   ```bash
   # On macOS/Linux
   brew services list
   # or
   sudo systemctl status postgresql
   
   # On Windows
   # Check Services app
   ```

2. **Verify DATABASE_URL:**
   - Check `.env` file exists
   - Verify connection string format
   - Test connection manually

3. **Check database exists:**
   ```sql
   -- Connect to PostgreSQL
   psql -U postgres
   
   -- List databases
   \l
   
   -- Create database if needed
   CREATE DATABASE orbit;
   ```

### Migration Issues

1. **Reset migrations:**
   ```bash
   npm run prisma:reset
   ```

2. **Check migration status:**
   ```bash
   npx prisma migrate status
   ```

3. **View migration history:**
   Check `prisma/migrations/` directory

## Production Considerations

1. **Use connection pooling:**
   Add connection pooler to DATABASE_URL:
   ```
   postgresql://user:pass@host:5432/db?connection_limit=10
   ```

2. **Enable SSL in production:**
   ```
   postgresql://user:pass@host:5432/db?sslmode=require
   ```

3. **Set up database backups**

4. **Monitor connection pool usage**

