import { Injectable, Logger } from "@nestjs/common";
import { MigrationService } from "../migration.service";

/**
 * Example service showing how to use MigrationService programmatically
 * This service could be used in admin controllers, startup hooks, or maintenance scripts
 */
@Injectable()
export class DatabaseMaintenanceService {
  private readonly logger = new Logger(DatabaseMaintenanceService.name);

  constructor(private readonly migrationService: MigrationService) {}

  /**
   * Perform a full database health check and migration
   */
  async performDatabaseMaintenance(): Promise<{
    success: boolean;
    status: any;
    migrationsRun: boolean;
  }> {
    try {
      this.logger.log("Starting database maintenance...");

      // Check current migration status
      const status = await this.migrationService.getMigrationStatus();
      this.logger.log(
        `Current status - Executed: ${status.executed.length}, Pending: ${status.pending.length}`,
      );

      let migrationsRun = false;

      // Run pending migrations if any
      if (status.pending.length > 0) {
        this.logger.log("Running pending migrations...");
        await this.migrationService.runMigrations();
        migrationsRun = true;
        this.logger.log("Migrations completed successfully");
      } else {
        this.logger.log("No pending migrations found");
      }

      // Get updated status
      const updatedStatus = await this.migrationService.getMigrationStatus();

      return {
        success: true,
        status: updatedStatus,
        migrationsRun,
      };
    } catch (error) {
      this.logger.error("Database maintenance failed:", error);
      return {
        success: false,
        status: null,
        migrationsRun: false,
      };
    }
  }

  /**
   * Check if database is ready for operation
   */
  async isDatabaseReady(): Promise<boolean> {
    try {
      return await this.migrationService.isDatabaseUpToDate();
    } catch (error) {
      this.logger.error("Failed to check database readiness:", error);
      return false;
    }
  }

  /**
   * Get detailed migration report
   */
  async getMigrationReport(): Promise<{
    isUpToDate: boolean;
    executedCount: number;
    pendingCount: number;
    executedMigrations: string[];
    pendingMigrations: string[];
  }> {
    const status = await this.migrationService.getMigrationStatus();
    const isUpToDate = await this.migrationService.isDatabaseUpToDate();

    return {
      isUpToDate,
      executedCount: status.executed.length,
      pendingCount: status.pending.length,
      executedMigrations: status.executed,
      pendingMigrations: status.pending,
    };
  }

  /**
   * Emergency rollback - use with caution!
   */
  async emergencyRollback(): Promise<void> {
    this.logger.warn("EMERGENCY ROLLBACK INITIATED - USE WITH CAUTION!");
    await this.migrationService.rollbackLastMigration();
    this.logger.warn("Emergency rollback completed");
  }
}
