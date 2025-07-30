import { Injectable } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { WorkingDaysService } from './working-days.service';

@Injectable()
export class WorkingDaysScheduler {
	constructor(private workingDaysService: WorkingDaysService) {}

	//'14 21 * * *'
	@Cron('0 0 * * *', {
		timeZone: 'America/Sao_Paulo',
	})
	async handleMidnightJob() {
		await this.workingDaysService.finishOngoingWorkingDays();
	}
}
