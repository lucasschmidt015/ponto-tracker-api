import { Injectable, Logger } from "@nestjs/common";
import { Sequelize } from "sequelize-typescript";
import { Umzug, SequelizeStorage } from "umzug";
import * as path from "path";

interface MigrationModule {
  up: (queryInterface: any, Sequelize: any) => Promise<void>;
  down: (queryInterface: any, Sequelize: any) => Promise<void>;
}

@Injectable()
export class MigrationService {
  private readonly logger = new Logger(MigrationService.name);
  private umzug: Umzug;

  constructor(private sequelize: Sequelize) {
    this.umzug = new Umzug({
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
              return await migration.up(
                this.sequelize.getQueryInterface(),
                this.sequelize.constructor,
              );
            },
            down: async () => {
              return await migration.down(
                this.sequelize.getQueryInterface(),
                this.sequelize.constructor,
              );
            },
          };
        },
      },
      context: this.sequelize.getQueryInterface(),
      storage: new SequelizeStorage({
        sequelize: this.sequelize,
        tableName: "sequelize_meta",
      }),
      logger: {
        info: (message) => this.logger.log(message),
        warn: (message) => this.logger.warn(message),
        error: (message) => this.logger.error(message),
        debug: (message) => this.logger.debug(message),
      },
    });
  }

  /**
   * Run all pending migrations
   */
  async runMigrations(): Promise<void> {
    try {
      this.logger.log("Starting database migrations...");
      const migrations = await this.umzug.up();

      if (migrations.length === 0) {
        this.logger.log("No pending migrations found");
      } else {
        this.logger.log(
          `Successfully executed ${migrations.length} migration(s):`,
        );
        migrations.forEach((migration) => {
          this.logger.log(`  ✓ ${migration.name}`);
        });
      }
    } catch (error) {
      this.logger.error("Migration failed:", error);
      throw error;
    }
  }

  /**
   * Rollback the last migration
   */
  async rollbackLastMigration(): Promise<void> {
    try {
      this.logger.log("Rolling back last migration...");
      const migrations = await this.umzug.down();

      if (migrations.length === 0) {
        this.logger.log("No migrations to rollback");
      } else {
        this.logger.log(
          `Successfully rolled back ${migrations.length} migration(s):`,
        );
        migrations.forEach((migration) => {
          this.logger.log(`  ✓ ${migration.name}`);
        });
      }
    } catch (error) {
      this.logger.error("Migration rollback failed:", error);
      throw error;
    }
  }

  /**
   * Rollback all migrations
   */
  async rollbackAllMigrations(): Promise<void> {
    try {
      this.logger.log("Rolling back all migrations...");
      const migrations = await this.umzug.down({ to: 0 });

      if (migrations.length === 0) {
        this.logger.log("No migrations to rollback");
      } else {
        this.logger.log(
          `Successfully rolled back ${migrations.length} migration(s):`,
        );
        migrations.forEach((migration) => {
          this.logger.log(`  ✓ ${migration.name}`);
        });
      }
    } catch (error) {
      this.logger.error("Migration rollback failed:", error);
      throw error;
    }
  }

  /**
   * Get migration status
   */
  async getMigrationStatus(): Promise<{
    pending: string[];
    executed: string[];
  }> {
    try {
      const executed = await this.umzug.executed();
      const pending = await this.umzug.pending();

      return {
        executed: executed.map((m) => m.name),
        pending: pending.map((m) => m.name),
      };
    } catch (error) {
      this.logger.error("Failed to get migration status:", error);
      throw error;
    }
  }

  /**
   * Run migrations up to a specific migration
   */
  async runMigrationsTo(migrationName: string): Promise<void> {
    try {
      this.logger.log(`Running migrations up to: ${migrationName}`);
      const migrations = await this.umzug.up({ to: migrationName });

      if (migrations.length === 0) {
        this.logger.log("No migrations to run");
      } else {
        this.logger.log(
          `Successfully executed ${migrations.length} migration(s):`,
        );
        migrations.forEach((migration) => {
          this.logger.log(`  ✓ ${migration.name}`);
        });
      }
    } catch (error) {
      this.logger.error("Migration failed:", error);
      throw error;
    }
  }

  /**
   * Rollback migrations down to a specific migration
   */
  async rollbackMigrationsTo(migrationName: string): Promise<void> {
    try {
      this.logger.log(`Rolling back migrations down to: ${migrationName}`);
      const migrations = await this.umzug.down({ to: migrationName });

      if (migrations.length === 0) {
        this.logger.log("No migrations to rollback");
      } else {
        this.logger.log(
          `Successfully rolled back ${migrations.length} migration(s):`,
        );
        migrations.forEach((migration) => {
          this.logger.log(`  ✓ ${migration.name}`);
        });
      }
    } catch (error) {
      this.logger.error("Migration rollback failed:", error);
      throw error;
    }
  }

  /**
   * Check if database is up to date
   */
  async isDatabaseUpToDate(): Promise<boolean> {
    try {
      const pending = await this.umzug.pending();
      return pending.length === 0;
    } catch (error) {
      this.logger.error("Failed to check database status:", error);
      throw error;
    }
  }
}
