#!/usr/bin/env node

import { Sequelize } from "sequelize";
import { Umzug, SequelizeStorage } from "umzug";
import * as path from "path";
import * as dotenv from "dotenv";

dotenv.config();

// Function to get database config using the same logic as your app
function getDatabaseConfig() {
  // Check for DATABASE_URL first (common in production like Heroku, Railway, etc.)
  if (process.env.DATABASE_URL) {
    console.log(`📎 Using DATABASE_URL for connection`);
    return {
      url: process.env.DATABASE_URL,
      dialect: "postgres" as const,
      logging: false,
      dialectOptions: {
        ssl:
          process.env.NODE_ENV === "production"
            ? {
                require: true,
                rejectUnauthorized: false,
              }
            : false,
      },
    };
  }

  const isProduction =
    process.env.NODE_ENV === "production" || process.env.NODE_ENV === "prod";

  if (isProduction) {
    // Production config (matches your prod.ts)
    return {
      database: process.env.DATABASE_NAME || "ponto-tracker",
      username: process.env.DATABASE_USER || "postgres",
      password: process.env.DATABASE_PASSWORD || "",
      host: process.env.DATABASE_HOST || "localhost",
      port: process.env.DATABASE_PORT
        ? parseInt(process.env.DATABASE_PORT, 10)
        : 5432,
      dialect: "postgres" as const,
      logging: false,
      dialectOptions: {
        ssl: {
          require: true,
          rejectUnauthorized: false,
        },
      },
    };
  } else {
    // Development config - try multiple naming conventions
    return {
      database:
        process.env.DB_DATABASE || process.env.DATABASE_NAME || "postgres",
      username:
        process.env.DB_USERNAME || process.env.DATABASE_USER || "postgres",
      password: process.env.DB_PASSWORD || process.env.DATABASE_PASSWORD || "",
      host: process.env.DB_HOST || process.env.DATABASE_HOST || "localhost",
      port: parseInt(
        process.env.DB_PORT || process.env.DATABASE_PORT || "5432",
      ),
      dialect: "postgres" as const,
      logging: false,
    };
  }
}

// Create Sequelize instance with the same config as your app
const config = getDatabaseConfig();
const sequelize = new Sequelize(config);

// Log the connection details for debugging (without password)
console.log(`🔗 Attempting to connect to database:`);
if (process.env.DATABASE_URL) {
  console.log(`   Using DATABASE_URL connection`);
} else {
  console.log(`   Host: ${config.host}:${config.port}`);
  console.log(`   Database: ${config.database}`);
  console.log(`   User: ${config.username}`);
}
console.log(`   Environment: ${process.env.NODE_ENV || "development"}`);
console.log(``);

interface MigrationModule {
  up: (queryInterface: any, Sequelize: any) => Promise<void>;
  down: (queryInterface: any, Sequelize: any) => Promise<void>;
}

// Create Umzug instance
const umzug = new Umzug({
  migrations: {
    glob: path.join(process.cwd(), "migrations", "*.js"),
    resolve: ({ name, path: migrationPath }) => {
      if (!migrationPath) {
        throw new Error(`Migration path is undefined for ${name}`);
      }

      // eslint-disable-next-line @typescript-eslint/no-require-imports
      const migration = require(migrationPath) as MigrationModule;

      return {
        name,
        up: async () => {
          return await migration.up(sequelize.getQueryInterface(), Sequelize);
        },
        down: async () => {
          return await migration.down(sequelize.getQueryInterface(), Sequelize);
        },
      };
    },
  },
  context: sequelize.getQueryInterface(),
  storage: new SequelizeStorage({
    sequelize: sequelize,
    tableName: "sequelize_meta",
  }),
  logger: {
    info: (message: Record<string, unknown>) =>
      console.log(`ℹ️  ${JSON.stringify(message)}`),
    warn: (message: Record<string, unknown>) =>
      console.warn(`⚠️  ${JSON.stringify(message)}`),
    error: (message: Record<string, unknown>) =>
      console.error(`❌ ${JSON.stringify(message)}`),
    debug: (message: Record<string, unknown>) =>
      console.debug(`🐛 ${JSON.stringify(message)}`),
  },
});

async function runMigrations() {
  try {
    console.log("🚀 Starting migrations...");
    const migrations = await umzug.up();

    if (migrations.length === 0) {
      console.log("✅ No pending migrations found");
    } else {
      console.log(
        `✅ Successfully executed ${migrations.length} migration(s):`,
      );
      migrations.forEach((migration) => {
        console.log(`   ✓ ${migration.name}`);
      });
    }
  } catch (error) {
    console.error("❌ Migration failed:", error);
    throw error;
  }
}

async function rollbackMigrations() {
  try {
    console.log("🔄 Rolling back last migration...");
    const migrations = await umzug.down();

    if (migrations.length === 0) {
      console.log("ℹ️  No migrations to rollback");
    } else {
      console.log(
        `✅ Successfully rolled back ${migrations.length} migration(s):`,
      );
      migrations.forEach((migration) => {
        console.log(`   ✓ ${migration.name}`);
      });
    }
  } catch (error) {
    console.error("❌ Rollback failed:", error);
    throw error;
  }
}

async function getMigrationStatus() {
  try {
    console.log("📊 Checking migration status...");
    const executed = await umzug.executed();
    const pending = await umzug.pending();

    console.log("\n=== Migration Status ===");
    console.log(`Database up to date: ${pending.length === 0 ? "✅" : "❌"}`);
    console.log(`\nExecuted migrations (${executed.length}):`);
    executed.forEach((migration) => console.log(`  ✅ ${migration.name}`));

    console.log(`\nPending migrations (${pending.length}):`);
    pending.forEach((migration) => console.log(`  ⏳ ${migration.name}`));
    console.log("");
  } catch (error) {
    console.error("❌ Failed to get migration status:", error);
    throw error;
  }
}

async function main() {
  const command = process.argv[2];

  try {
    // Test database connection
    await sequelize.authenticate();

    switch (command) {
      case "run":
        await runMigrations();
        break;
      case "rollback":
        await rollbackMigrations();
        break;
      case "status":
        await getMigrationStatus();
        break;
      default:
        console.log(`
Usage: npm run migrate:cli <command>

Commands:
  run      - Run all pending migrations
  rollback - Rollback the last migration
  status   - Show migration status

Examples:
  npm run migrate:cli run
  npm run migrate:cli rollback
  npm run migrate:cli status
        `);
        process.exit(1);
    }
  } catch (error) {
    console.error("Script execution failed:", error);
    process.exit(1);
  } finally {
    await sequelize.close();
  }
}

void main();
