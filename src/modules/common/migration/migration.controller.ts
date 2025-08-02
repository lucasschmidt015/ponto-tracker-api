import {
  Controller,
  Post,
  Get,
  HttpCode,
  HttpStatus,
  Body,
  UseGuards,
} from "@nestjs/common";
import { MigrationService } from "./migration.service";
import { AuthGuard } from "../../auth/auth.guard";
import { RolesGuard } from "../../roles/roles.guard";
import { Roles } from "../../../custom-decorators/roles";

@Controller("migrations")
@UseGuards(AuthGuard, RolesGuard)
export class MigrationController {
  constructor(private readonly migrationService: MigrationService) {}

  @Post("run")
  @HttpCode(HttpStatus.OK)
  @Roles("admin")
  async runMigrations(): Promise<{ message: string }> {
    await this.migrationService.runMigrations();
    return { message: "Migrations executed successfully" };
  }

  @Post("rollback")
  @HttpCode(HttpStatus.OK)
  @Roles("admin")
  async rollbackLastMigration(): Promise<{ message: string }> {
    await this.migrationService.rollbackLastMigration();
    return { message: "Last migration rolled back successfully" };
  }

  @Post("rollback-all")
  @HttpCode(HttpStatus.OK)
  @Roles("admin")
  async rollbackAllMigrations(): Promise<{ message: string }> {
    await this.migrationService.rollbackAllMigrations();
    return { message: "All migrations rolled back successfully" };
  }

  @Get("status")
  @Roles("admin")
  async getMigrationStatus(): Promise<{
    pending: string[];
    executed: string[];
    isUpToDate: boolean;
  }> {
    const status = await this.migrationService.getMigrationStatus();
    const isUpToDate = await this.migrationService.isDatabaseUpToDate();

    return {
      ...status,
      isUpToDate,
    };
  }

  @Post("run-to")
  @HttpCode(HttpStatus.OK)
  @Roles("admin")
  async runMigrationsTo(
    @Body() body: { migrationName: string },
  ): Promise<{ message: string }> {
    await this.migrationService.runMigrationsTo(body.migrationName);
    return { message: `Migrations executed up to ${body.migrationName}` };
  }

  @Post("rollback-to")
  @HttpCode(HttpStatus.OK)
  @Roles("admin")
  async rollbackMigrationsTo(
    @Body() body: { migrationName: string },
  ): Promise<{ message: string }> {
    await this.migrationService.rollbackMigrationsTo(body.migrationName);
    return { message: `Migrations rolled back down to ${body.migrationName}` };
  }
}
