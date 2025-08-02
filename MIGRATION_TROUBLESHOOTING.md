# Migration Troubleshooting Guide

## Quick Fix for Production Issues

### Step 1: Test Database Connection First

Before trying to run migrations, test your database connection:

```bash
# Test database connection
npm run db:test
```

This will show you:

- What environment variables are available
- Which configuration is being used
- Whether the database is accessible
- If the migration table exists

### Step 2: Check Environment Variables

Your production should have **one** of these setups:

**Option A: Individual Variables** (preferred for your setup)

```bash
NODE_ENV=production
DATABASE_HOST=your-db-host.com
DATABASE_PORT=5432
DATABASE_NAME=your-db-name
DATABASE_USER=your-username
DATABASE_PASSWORD=your-password
```

**Option B: Database URL** (common with cloud providers)

```bash
NODE_ENV=production
DATABASE_URL=postgresql://username:password@host:port/database
```

### Step 3: Run Migrations

Only after the connection test passes:

```bash
npm run migrate:status  # Check what needs to be migrated
npm run migrate:run     # Run pending migrations
```

### 2. SSL/TLS Issues

**Error**: SSL connection errors

**Solution**: The updated CLI script automatically handles SSL for production environments. If you need to disable SSL:

```bash
# Add this environment variable
DATABASE_SSL=false
```

### 3. Network/Firewall Issues

**Symptoms**:

- Connection timeouts
- Connection refused from specific IPs

**Solutions**:

1. **Check firewall rules**: Ensure your application server can reach the database
2. **Verify security groups**: In AWS, check RDS security groups
3. **Database allow-list**: Ensure your server's IP is allowed to connect

### 4. Authentication Issues

**Error**: Authentication failed

**Solutions**:

1. **Verify credentials**: Double-check username/password
2. **Check user permissions**: Ensure user has migration permissions
3. **Database exists**: Verify the database exists

## Debugging Steps

### 1. Enable Verbose Logging

Add this to your migration script for more details:

```bash
DEBUG=sequelize:* npm run migrate:status
```

### 2. Test Connection Only

Create a simple connection test script:

```typescript
// test-connection.ts
import { Sequelize } from 'sequelize';

const sequelize = new Sequelize(
  process.env.DATABASE_URL || {
    database: process.env.DATABASE_NAME,
    username: process.env.DATABASE_USER,
    password: process.env.DATABASE_PASSWORD,
    host: process.env.DATABASE_HOST,
    port: parseInt(process.env.DATABASE_PORT),
    dialect: 'postgres',
    logging: console.log,
  }
);

async function testConnection() {
  try {
    await sequelize.authenticate();
    console.log('✅ Connection has been established successfully.');
  } catch (error) {
    console.error('❌ Unable to connect to the database:', error);
  } finally {
    await sequelize.close();
  }
}

testConnection();
```

### 3. Check Migration Table

Verify the migration tracking table exists:

```sql
SELECT * FROM sequelize_meta;
```

## Production Deployment Best Practices

### 1. Pre-deployment Checks

```bash
# 1. Test database connection
npm run migrate:status

# 2. Check for pending migrations
npm run migrate:status | grep "Pending migrations"

# 3. Backup database (if possible)
pg_dump $DATABASE_URL > backup-$(date +%Y%m%d).sql
```

### 2. Safe Migration Process

```bash
# 1. Run migrations
npm run migrate:run

# 2. Verify migration status
npm run migrate:status

# 3. Start application
npm start
```

### 3. Rollback Plan

```bash
# If something goes wrong, rollback last migration
npm run migrate:rollback

# Or restore from backup
psql $DATABASE_URL < backup-$(date +%Y%m%d).sql
```

## Common Cloud Provider Configurations

### Heroku

```bash
# Heroku automatically provides DATABASE_URL
# No additional configuration needed
```

### Railway

```bash
# Railway provides these variables
DATABASE_URL=postgresql://...
# Or individual variables
PGHOST=...
PGPORT=...
PGDATABASE=...
PGUSER=...
PGPASSWORD=...
```

### AWS RDS

```bash
DATABASE_HOST=your-rds-endpoint.region.rds.amazonaws.com
DATABASE_PORT=5432
DATABASE_NAME=your-db-name
DATABASE_USER=your-username
DATABASE_PASSWORD=your-password
```

### DigitalOcean

```bash
DATABASE_URL=postgresql://...
# Or use the connection details from the dashboard
```

## Emergency Contact

If migrations fail in production:

1. **Don't panic** - the application can usually still run with the current database state
2. **Check logs** - Look for specific error messages
3. **Verify database state** - Ensure the database is accessible
4. **Consider manual migration** - You can always run individual migration files manually
5. **Rollback if needed** - Use the rollback commands to revert changes

## Need Help?

Run the migration with full debugging:

```bash
NODE_ENV=production DEBUG=* npm run migrate:status
```

This will show you exactly what's happening during the connection attempt.
