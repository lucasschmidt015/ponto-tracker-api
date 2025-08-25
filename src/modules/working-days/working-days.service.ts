import { Injectable, BadRequestException, Inject, forwardRef } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { Op } from 'sequelize';
import { v4 as uuidv4 } from 'uuid';

import { WorkingDays } from './working-days.model';

import { UsersService } from '../users/users.service';
import { CompaniesService } from '../companies/companies.service';
import { EntriesService } from '../entries/entries.service';

import { CreateWorkingDayToUserDto } from './dto/create-working-day-user.dto';
import { ListAllWorkingDaysDto } from './dto/list-working-days.dto';
import { getCurrentDate, isBeforeToday, formatDateString } from '../../common/utils/timezone.util';

@Injectable()
export class WorkingDaysService {
	constructor(
		@InjectModel(WorkingDays) private workingDays: typeof WorkingDays,
		private usersService: UsersService,
		private companiesService: CompaniesService,
		@Inject(forwardRef(() => EntriesService))
		private entriesService: EntriesService,
	) {}

	async listWorkingDays(
		filter: ListAllWorkingDaysDto,
	): Promise<WorkingDays[] | []> {
		const { user_id, startDate, endDate } = filter;

		if (!user_id) {
			throw new BadRequestException('user_id is required');
		}

		const where: any = {};

		where.user_id = user_id;

		if (startDate && endDate) {
			where.worked_date = {
				[Op.between]: [startDate, endDate],
			};
		} else if (startDate) {
			where.worked_date = {
				[Op.gte]: startDate,
			};
		} else if (endDate) {
			where.worked_date = {
				[Op.lte]: endDate,
			};
		}

		const workingDaysData = await this.workingDays.findAll({
			where: where,
		});

		return workingDaysData || [];
	}

	async createWorkingDayToUser(
		workingDay: CreateWorkingDayToUserDto,
	): Promise<WorkingDays> {
		const { user_id, company_id, worked_date } = workingDay;

		await this.usersService.findOne(user_id);

		await this.companiesService.findOne(company_id);

		const _id = uuidv4();

		const workingDayAlreadyExists = await this.workingDays.findOne({
			where: {
				user_id,
				worked_date,
				finished: false,
			},
		});

		if (workingDayAlreadyExists) {
			return workingDayAlreadyExists;
		}

		const createdWorkingDay = await this.workingDays.create({
			_id,
			worked_time: 0,
			user_id,
			company_id,
			worked_date,
		});

		return createdWorkingDay;
	}

	private calculateWorkedTimeFromEntries(entries: any[]): number {
		if (!entries || entries.length < 2) {
			return 0;
		}

		const sortedEntries = [...entries].sort((a, b) => 
			new Date(a.entry_time).getTime() - new Date(b.entry_time).getTime()
		);

		let totalWorkedMinutes = 0;
		let clockInTime: Date | null = null;

		for (let i = 0; i < sortedEntries.length; i++) {
			const entryTime = new Date(sortedEntries[i].entry_time);

			if (clockInTime === null) {
				clockInTime = entryTime;
			} else {
				const diffMs = entryTime.getTime() - clockInTime.getTime();
				const diffMinutes = Math.floor(diffMs / (1000 * 60));

				if (diffMinutes > 0) {
					totalWorkedMinutes += diffMinutes;
				}

				clockInTime = null;
			}
		}

		return totalWorkedMinutes;
	}

	async finishOngoingWorkingDays() {
		const today = getCurrentDate();

		const ongoingWorkingDays = await this.workingDays.findAll({
			where: {
				finished: false,
				worked_date: {
					[Op.lt]: formatDateString(today),
				},
			},
			raw: true
		});

		for (const workingDay of ongoingWorkingDays) { 
			const entries = await this.entriesService.getEntriesByWorkingDayId(
				workingDay._id,
			);

			const approvedEntries = entries?.filter(entry => entry.is_approved) || [];

			const totalWorkedMinutes = this.calculateWorkedTimeFromEntries(approvedEntries);

			await this.workingDays.update(
				{
					worked_time: totalWorkedMinutes,
					finished: true,
				},
				{
					where: {
						_id: workingDay._id,
					},
				},
			);
		}
	}
}
