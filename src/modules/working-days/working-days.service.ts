import { Injectable, BadRequestException } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { Op } from 'sequelize';
import { v4 as uuidv4 } from 'uuid';

import { WorkingDays } from './working-days.model';

import { UsersService } from '../users/users.service';
import { CompaniesService } from '../companies/companies.service';

import { CreateWorkingDayToUserDto } from './dto/create-working-day-user.dto';
import { ListAllWorkingDaysDto } from './dto/list-working-days.dto';
import { getCurrentDate, isBeforeToday } from '../../common/utils/timezone.util';

@Injectable()
export class WorkingDaysService {
	constructor(
		@InjectModel(WorkingDays) private workingDays: typeof WorkingDays,
		private usersService: UsersService,
		private companiesService: CompaniesService,
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

		console.log('worked_date <---- ', worked_date);

		const workingDayAlreadyExists = await this.workingDays.findOne({
			where: {
				user_id,
				worked_date,
				finished: false,
			},
		});

		if (workingDayAlreadyExists) {
			console.log('will return an existing working day <-----');
			return workingDayAlreadyExists;
		}

		console.log('will create a new working day <-------');

		const createdWorkingDay = await this.workingDays.create({
			_id,
			worked_time: 0,
			user_id,
			company_id,
			worked_date,
		});

		return createdWorkingDay;
	}

	// To finish this method implementation, we first need to implement the entries logic
	// After that we can Calculate the worked time and update at the field
	async finishOngoingWorkingDays() {
		const today = getCurrentDate();

		await this.workingDays.update(
			{ finished: true },
			{
				where: {
					finished: false,
					worked_date: {
						[Op.lt]: today,
					},
				},
			},
		);
	}
}
