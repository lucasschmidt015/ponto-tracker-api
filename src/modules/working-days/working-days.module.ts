import { Module } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';

import { UsersModule } from '../users/users.module';
import { CompaniesModule } from '../companies/companies.module';
import { WorkingDaysController } from './working-days.controller';
import { WorkingDaysScheduler } from './working-days.scheduler';
import { WorkingDaysService } from './working-days.service';
import { WorkingDays } from './working-days.model';

@Module({
	imports: [
		SequelizeModule.forFeature([WorkingDays]),
		UsersModule,
		CompaniesModule,
	],
	controllers: [WorkingDaysController],
	providers: [WorkingDaysService, WorkingDaysScheduler],
	exports: [WorkingDaysService],
})
export class WorkingDaysModule {}
