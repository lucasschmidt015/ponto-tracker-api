# Database Migrations

This directory contains Sequelize migrations for the ponto-tracker-api project.

## Available Commands

### Running Migrations

```bash
npm run migration:run          # Run all pending migrations
npm run migration:undo         # Undo the last migration
npm run migration:undo:all     # Undo all migrations
npm run migration:status       # Check migration status
```

### Creating Migrations

```bash
npm run migration:create -- --name migration-name    # Create a new migration file
npm run migration:generate -- --name migration-name  # Generate migration from model differences
```

### Other Database Commands

```bash
npm run database:create        # Create the database
npm run seed                   # Run all seeders
npm run seed:undo             # Undo all seeders
npm run db:reset              # Drop and recreate database
```

## Migration Files

The migrations are created in chronological order and should be run in sequence:

1. `create-companies-table.js` - Creates the Companies table
2. `create-roles-table.js` - Creates the Roles table
3. `create-users-table.js` - Creates the Users table (depends on Companies)
4. `create-user-roles-table.js` - Creates the UserRoles junction table (depends on Users and Roles)
5. `create-working-days-table.js` - Creates the WorkingDays table (depends on Users and Companies)
6. `create-entries-table.js` - Creates the Entries table (depends on WorkingDays and Users)
7. `create-entries-approval-table.js` - Creates the EntriesApprovals table (depends on Entries and Users)
8. `create-auth-tokens-table.js` - Creates the AuthTokens table (depends on Users)

## Important Notes

- Always create a backup before running migrations in production
- Test migrations in development environment first
- The table names in migrations use PascalCase to match Sequelize conventions
- Foreign key constraints are properly set up with CASCADE options
- All tables include `createdAt` and `updatedAt` timestamps

## Getting Started

1. Make sure your database configuration is set up in `config/sequelize.ts`
2. Create your database: `npm run database:create`
3. Run all migrations: `npm run migration:run`
4. Optionally run seeders: `npm run seed`
