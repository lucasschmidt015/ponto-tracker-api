import { Module } from "@nestjs/common";
import { SequelizeModule } from "@nestjs/sequelize";
import { JwtModule } from "@nestjs/jwt";
import { AuthToken } from "../../auth/auth-token.model";
import { MigrationService } from "./migration.service";
import { MigrationController } from "./migration.controller";
import { MigrationStartupService } from "./migration-startup.service";

@Module({
  imports: [
    SequelizeModule.forFeature([AuthToken]),
    JwtModule.register({
      secret: process.env.JWT_SECRET || "fallback-secret",
      signOptions: { expiresIn: "1h" },
    }),
  ],
  controllers: [MigrationController],
  providers: [MigrationService, MigrationStartupService],
  exports: [MigrationService],
})
export class MigrationModule {}
