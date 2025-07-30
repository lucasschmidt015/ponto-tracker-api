import { forwardRef, Module } from '@nestjs/common';
import { EntriesService } from './entries.service';
import { SequelizeModule } from '@nestjs/sequelize';
import { Entries } from './entries.model';
import { WorkingDaysModule } from '../working-days/working-days.module';
import { EntriesController } from './entries.controller';
import { CompaniesModule } from '../companies/companies.module';
import { EntriesApprovalModule } from '../entries_approval/entries_approval.module';

@Module({
	imports: [
		SequelizeModule.forFeature([Entries]),
		WorkingDaysModule,
		CompaniesModule,
		forwardRef(() => EntriesApprovalModule),
	],
	controllers: [EntriesController],
	providers: [EntriesService],
	exports: [EntriesService],
})
export class EntriesModule {}
