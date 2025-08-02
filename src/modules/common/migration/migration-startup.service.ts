import { Injectable, Logger, OnApplicationBootstrap } from "@nestjs/common";
import { MigrationService } from "./migration.service";

@Injectable()
export class MigrationStartupService implements OnApplicationBootstrap {
  private readonly logger = new Logger(MigrationStartupService.name);

  constructor(private readonly migrationService: MigrationService) {}

  async onApplicationBootstrap(): Promise<void> {
    // Only run migrations automatically in development
    if (process.env.NODE_ENV === "development") {
      try {
        this.logger.log("Checking for pending migrations on startup...");
        const isUpToDate = await this.migrationService.isDatabaseUpToDate();

        if (!isUpToDate) {
          this.logger.log("Running pending migrations...");
          await this.migrationService.runMigrations();
        } else {
          this.logger.log("Database is up to date");
        }
      } catch (error) {
        this.logger.error("Failed to run startup migrations:", error);
        // Don't crash the application, just log the error
        // You can change this behavior based on your needs
      }
    }
  }
}
