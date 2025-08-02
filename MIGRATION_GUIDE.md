# Umzug Migration System

This project uses Umzug for running database migrations programmatically. Umzug provides a more flexible and programmatic approach to managing migrations compared to using only Sequelize CLI.

## Features

- ✅ Programmatic migration execution
- ✅ HTTP API endpoints for migration management
- ✅ CLI scripts for command-line usage
- ✅ Automatic migration on startup (development mode)
- ✅ TypeScript support
- ✅ Detailed logging and error handling
- ✅ Migration status tracking
- ✅ Standalone CLI (no NestJS dependencies)

## Quick Start

The easiest way to get started is with the CLI commands:

```bash
# Check migration status
npm run migrate:status

# Run all pending migrations
npm run migrate:run

# Rollback the last migration
npm run migrate:rollback
```

## Usage

### CLI Commands

The project provides several npm scripts for managing migrations:

```bash
# Migration commands (recommended)
npm run migrate:run      # Run all pending migrations
npm run migrate:rollback # Rollback the last migration
npm run migrate:status   # Check migration status

# Seeder commands (NEW!)
npm run seed:run         # Run all pending seeders
npm run seed:rollback    # Rollback the last seeder
npm run seed:rollback:all # Rollback all seeders
npm run seed:status      # Check seeder status
```

### Standalone CLI Script

The `migrate-cli.ts` script works independently of your NestJS application:

```bash
# Direct migration usage
npm run migrate:cli run
npm run migrate:cli rollback
npm run migrate:cli status

# Direct seeder usage
npm run migrate:cli seed
npm run migrate:cli seed:rollback
npm run migrate:cli seed:rollback:all
npm run migrate:cli seed:status
```

This is perfect for:

- CI/CD pipelines
- Docker containers
- Production deployments
- When your app is not running

### HTTP API Endpoints

All migration endpoints require admin authentication and are accessible at `/migrations`:

#### Run Migrations

```http
POST /migrations/run
Authorization: Bearer <admin-token>
```

#### Rollback Last Migration

```http
POST /migrations/rollback
Authorization: Bearer <admin-token>
```

#### Rollback All Migrations

```http
POST /migrations/rollback-all
Authorization: Bearer <admin-token>
```

#### Get Migration Status

```http
GET /migrations/status
Authorization: Bearer <admin-token>
```

Response:

```json
{
  "executed": ["20250729234020-create-companies-table.js"],
  "pending": ["20250729234021-create-roles-table.js"],
  "isUpToDate": false
}
```

#### Run Migrations to Specific Point

```http
POST /migrations/run-to
Authorization: Bearer <admin-token>
Content-Type: application/json

{
  "migrationName": "20250729234021-create-roles-table.js"
}
```

#### Rollback to Specific Point

```http
POST /migrations/rollback-to
Authorization: Bearer <admin-token>
Content-Type: application/json

{
  "migrationName": "20250729234020-create-companies-table.js"
}
```

### Programmatic Usage

You can inject the `MigrationService` into any NestJS service:

```typescript
import { Injectable } from '@nestjs/common';
import { MigrationService } from './modules/common/migration/migration.service';

@Injectable()
export class YourService {
  constructor(private readonly migrationService: MigrationService) {}

  async runMigrations() {
    await this.migrationService.runMigrations();
  }

  async checkStatus() {
    const status = await this.migrationService.getMigrationStatus();
    console.log('Pending:', status.pending);
    console.log('Executed:', status.executed);
  }
}
```

### Available Methods

The `MigrationService` provides the following methods:

- `runMigrations()` - Run all pending migrations
- `rollbackLastMigration()` - Rollback the last migration
- `rollbackAllMigrations()` - Rollback all migrations
- `getMigrationStatus()` - Get current migration status
- `runMigrationsTo(migrationName)` - Run migrations up to a specific point
- `rollbackMigrationsTo(migrationName)` - Rollback down to a specific point
- `isDatabaseUpToDate()` - Check if database is up to date

## Automatic Migration on Startup

The system includes an optional startup service that automatically runs pending migrations when the application starts in development mode. This can be disabled by removing `MigrationStartupService` from the `MigrationModule`.

## Migration Files

Migration files should be placed in the `migrations/` directory and follow the existing Sequelize CLI format:

```javascript
'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    // Migration logic here
  },

  async down(queryInterface, Sequelize) {
    // Rollback logic here
  },
};
```

## Configuration

The migration system uses the same database configuration as your main application and stores migration metadata in the `sequelize_meta` table.

## Security

- All HTTP endpoints require admin authentication
- Migration operations are logged for audit purposes
- Errors are properly handled and logged

## Comparison with Sequelize CLI

| Feature                 | Sequelize CLI | Umzug |
| ----------------------- | ------------- | ----- |
| Programmatic access     | ❌            | ✅    |
| HTTP API                | ❌            | ✅    |
| TypeScript integration  | ⚠️            | ✅    |
| Custom logging          | ❌            | ✅    |
| Application integration | ❌            | ✅    |
| CLI usage               | ✅            | ✅    |

You can still use the existing Sequelize CLI commands for creating migrations:

```bash
npm run migration:create -- --name your-migration-name
```

This setup gives you the best of both worlds - the familiar Sequelize CLI for creating migrations and the powerful Umzug system for running them programmatically.
