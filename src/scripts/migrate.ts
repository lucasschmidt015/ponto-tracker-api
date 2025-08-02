#!/usr/bin/env node

import { NestFactory } from "@nestjs/core";
import { AppModule } from "../modules/app/app.module";
import { MigrationService } from "../modules/common/migration/migration.service";

async function runMigrations() {
  const app = await NestFactory.createApplicationContext(AppModule);
  const migrationService = app.get(MigrationService);

  try {
    console.log("🚀 Starting migrations...");
    await migrationService.runMigrations();
    console.log("✅ Migrations completed successfully!");
  } catch (error) {
    console.error("❌ Migration failed:", error);
    process.exit(1);
  } finally {
    await app.close();
  }
}

async function rollbackMigrations() {
  const app = await NestFactory.createApplicationContext(AppModule);
  const migrationService = app.get(MigrationService);

  try {
    console.log("🔄 Rolling back last migration...");
    await migrationService.rollbackLastMigration();
    console.log("✅ Rollback completed successfully!");
  } catch (error) {
    console.error("❌ Rollback failed:", error);
    process.exit(1);
  } finally {
    await app.close();
  }
}

async function getMigrationStatus() {
  const app = await NestFactory.createApplicationContext(AppModule);
  const migrationService = app.get(MigrationService);

  try {
    console.log("📊 Checking migration status...");
    const status = await migrationService.getMigrationStatus();
    const isUpToDate = await migrationService.isDatabaseUpToDate();

    console.log("\n=== Migration Status ===");
    console.log(`Database up to date: ${isUpToDate ? "✅" : "❌"}`);
    console.log(`\nExecuted migrations (${status.executed.length}):`);
    status.executed.forEach((name) => console.log(`  ✅ ${name}`));

    console.log(`\nPending migrations (${status.pending.length}):`);
    status.pending.forEach((name) => console.log(`  ⏳ ${name}`));
    console.log("");
  } catch (error) {
    console.error("❌ Failed to get migration status:", error);
    process.exit(1);
  } finally {
    await app.close();
  }
}

async function runSeeders() {
  const app = await NestFactory.createApplicationContext(AppModule);
  const migrationService = app.get(MigrationService);

  try {
    console.log("🌱 Starting seeders...");
    await migrationService.runSeeders();
    console.log("✅ Seeders completed successfully!");
  } catch (error) {
    console.error("❌ Seeder failed:", error);
    process.exit(1);
  } finally {
    await app.close();
  }
}

async function rollbackSeeders() {
  const app = await NestFactory.createApplicationContext(AppModule);
  const migrationService = app.get(MigrationService);

  try {
    console.log("🔄 Rolling back last seeder...");
    await migrationService.rollbackLastSeeder();
    console.log("✅ Seeder rollback completed successfully!");
  } catch (error) {
    console.error("❌ Seeder rollback failed:", error);
    process.exit(1);
  } finally {
    await app.close();
  }
}

async function rollbackAllSeeders() {
  const app = await NestFactory.createApplicationContext(AppModule);
  const migrationService = app.get(MigrationService);

  try {
    console.log("🔄 Rolling back all seeders...");
    await migrationService.rollbackAllSeeders();
    console.log("✅ All seeders rolled back successfully!");
  } catch (error) {
    console.error("❌ Seeder rollback failed:", error);
    process.exit(1);
  } finally {
    await app.close();
  }
}

async function getSeederStatus() {
  const app = await NestFactory.createApplicationContext(AppModule);
  const migrationService = app.get(MigrationService);

  try {
    console.log("🌱 Checking seeder status...");
    const status = await migrationService.getSeederStatus();
    const isUpToDate = await migrationService.areSeedersUpToDate();

    console.log("\n=== Seeder Status ===");
    console.log(`Seeders up to date: ${isUpToDate ? "✅" : "❌"}`);
    console.log(`\nExecuted seeders (${status.executed.length}):`);
    status.executed.forEach((name) => console.log(`  ✅ ${name}`));

    console.log(`\nPending seeders (${status.pending.length}):`);
    status.pending.forEach((name) => console.log(`  ⏳ ${name}`));
    console.log("");
  } catch (error) {
    console.error("❌ Failed to get seeder status:", error);
    process.exit(1);
  } finally {
    await app.close();
  }
}

// Parse command line arguments
const command = process.argv[2];

async function main() {
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
    case "seed":
      await runSeeders();
      break;
    case "seed:rollback":
      await rollbackSeeders();
      break;
    case "seed:rollback:all":
      await rollbackAllSeeders();
      break;
    case "seed:status":
      await getSeederStatus();
      break;
    default:
      console.log(`
Usage: npm run migrate <command>

Migration Commands:
  run      - Run all pending migrations
  rollback - Rollback the last migration
  status   - Show migration status

Seeder Commands:
  seed             - Run all pending seeders
  seed:rollback    - Rollback the last seeder
  seed:rollback:all - Rollback all seeders
  seed:status      - Show seeder status

Examples:
  npm run migrate run
  npm run migrate rollback
  npm run migrate status
  npm run migrate seed
  npm run migrate seed:rollback
  npm run migrate seed:status
      `);
      process.exit(1);
  }
}

main().catch((error) => {
  console.error("Script execution failed:", error);
  process.exit(1);
});
