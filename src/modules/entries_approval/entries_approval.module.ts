import { Module, forwardRef } from '@nestjs/common';
import { EntriesApprovalController } from './entries_approval.controller';
import { EntriesApprovalService } from './entries_approval.service';
import { SequelizeModule } from '@nestjs/sequelize';
import { EntriesApproval } from './entries_approval.model';
import { EntriesModule } from '../entries/entries.module';
import { UsersModule } from '../users/users.module';

@Module({
	imports: [
		SequelizeModule.forFeature([EntriesApproval]),
		forwardRef(() => EntriesModule),
		UsersModule,
	],
	controllers: [EntriesApprovalController],
	providers: [EntriesApprovalService],
	exports: [EntriesApprovalService],
})
export class EntriesApprovalModule {}
