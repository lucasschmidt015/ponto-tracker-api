# 🛠️ Database Commands Reference

## 📋 Complete Command List

### **Database Management**

```bash
# Create database
npm run database:create

# Drop database
npm run database:drop

# Test database connection
npm run db:test
```

### **Migration Commands**

```bash
# Create new migration file
npm run migration:create -- your-migration-name
npm run migration:generate -- your-migration-name

# Run migrations
npm run migrate:run

# Rollback last migration
npm run migrate:rollback

# Check migration status
npm run migrate:status
```

### **Seeder Commands (Deployment-Safe)**

```bash
# Run seeders (idempotent - safe to run multiple times)
npm run seed:run

# Rollback last seeder
npm run seed:rollback

# Rollback all seeders
npm run seed:rollback:all

# Check seeder status
npm run seed:status
```

### **Combined Commands**

```bash
# Deploy command (migrations + seeders)
npm run deploy:db

# Complete database setup (create + migrate + seed)
npm run db:setup

# Reset database (drop + create)
npm run db:reset

# Full reset (drop + create + migrate + seed)
npm run db:reset:full
```

## 🚀 Common Workflows

### **First Time Setup**

```bash
# Option 1: Step by step
npm run database:create
npm run migrate:run
npm run seed:run

# Option 2: One command
npm run db:setup
```

### **Development Reset**

```bash
# Option 1: Reset and rebuild everything
npm run db:reset:full

# Option 2: Step by step
npm run db:reset
npm run migrate:run
npm run seed:run
```

### **Deployment Workflow**

```bash
# Production/staging deployment
npm run deploy:db

# Or step by step
npm run migrate:run
npm run seed:run
```

### **Adding New Data**

```bash
# Create new migration
npm run migration:create -- add-new-table

# Run new migrations
npm run migrate:run

# Update seeders if needed, then
npm run seed:run  # Safe to run - won't duplicate data
```

## 🔧 Advanced Usage

### **Rollback Scenarios**

```bash
# Rollback last migration
npm run migrate:rollback

# Rollback last seeder
npm run seed:rollback

# Rollback all seeders (keep migrations)
npm run seed:rollback:all
```

### **Status Checking**

```bash
# Check what migrations are pending/executed
npm run migrate:status

# Check what seeders are pending/executed
npm run seed:status

# Test database connection
npm run db:test
```

## ⚠️ Important Notes

### **Migration vs Seeder**

- **Migrations:** Schema changes (tables, columns, indexes)
- **Seeders:** Data insertion (default users, roles, configuration)

### **Order Matters**

1. **Create Database** → `database:create`
2. **Run Migrations** → `migrate:run`
3. **Run Seeders** → `seed:run`

### **Deployment Safety**

- ✅ **Migrations:** Tracked in `sequelize_meta` table
- ✅ **Seeders:** Tracked in `sequelize_data` table
- ✅ **Idempotent:** Seeders check for existing data
- ✅ **Safe to Re-run:** All commands can be run multiple times

### **Environment Variables**

Commands respect your `.env` configuration:

- `DATABASE_URL` (if available)
- `DATABASE_NAME`, `DATABASE_USER`, etc.
- `NODE_ENV` (development/production)

## 🎯 Quick Reference

| Command           | Purpose                 | Safe to Re-run          |
| ----------------- | ----------------------- | ----------------------- |
| `database:create` | Create database         | ❌ (fails if exists)    |
| `database:drop`   | Drop database           | ✅                      |
| `migrate:run`     | Run pending migrations  | ✅                      |
| `seed:run`        | Run pending seeders     | ✅ (idempotent)         |
| `deploy:db`       | Migrations + Seeders    | ✅                      |
| `db:setup`        | Create + Migrate + Seed | ❌ (fails if DB exists) |
| `db:reset:full`   | Complete reset + setup  | ✅                      |

Your database management system is now **production-ready** with comprehensive tooling! 🎉
