import {
	Inject,
	Injectable,
	NotFoundException,
	BadRequestException,
	forwardRef,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { Op } from 'sequelize';
import { v4 as uuidv4 } from 'uuid';

import { Entries } from './entries.model';
import { WorkingDays } from '../working-days/working-days.model';

import { WorkingDaysService } from '../working-days/working-days.service';
import { CompaniesService } from '../companies/companies.service';
import { EntriesApprovalService } from '../entries_approval/entries_approval.service';

import { RegisterNewEntryDto } from './dtos/register-new-entry.dto';
import { 
	getCurrentDateTime, 
	getCurrentDate, 
	formatDateString, 
	getMinuteBounds,
	getStartOfDay,
	getEndOfDay
} from '../../common/utils/timezone.util';

@Injectable()
export class EntriesService {
	constructor(
		@InjectModel(Entries) private entries: typeof Entries,
		private workingDay: WorkingDaysService,
		private companies: CompaniesService,
		@Inject(forwardRef(() => EntriesApprovalService))
		private entriesApprovalService: EntriesApprovalService,
	) {}

	private calculateDistanceInMeters(
		lat1: number,
		lon1: number,
		lat2: number,
		lon2: number,
	): number {
		const toRadians = (degree: number) => (degree * Math.PI) / 180;

		const R = 6371e3; // Radius of the Earth in metres
		const φ1 = toRadians(lat1);
		const φ2 = toRadians(lat2);
		const Δφ = toRadians(lat2 - lat1);
		const Δλ = toRadians(lon2 - lon1);

		const a =
			Math.sin(Δφ / 2) ** 2 +
			Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) ** 2;
		const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

		return R * c;
	}

	async validadeEntryLocation(
		company_id: string,
		latitude: string | undefined,
		longitude: string | undefined,
	): Promise<boolean> {
		const company = await this.companies.findOne(company_id);

		if (!company) {
			throw new NotFoundException(`Company with ID ${company_id} not found`);
		}

		if (
			company.allow_entry_out_range ||
			!company.latitude ||
			!company.longitude
		) {
			return true;
		}

		if (!latitude || !longitude) {
			return false;
		}

		const distance = this.calculateDistanceInMeters(
			parseFloat(latitude),
			parseFloat(longitude),
			parseFloat(company.latitude),
			parseFloat(company.longitude),
		);

		const defaultRegisterRangeMeters = 300;
		const MAX_ALLOWED_DISTANCE = company.register_range_meters
			? company.register_range_meters
			: defaultRegisterRangeMeters;

		return distance <= MAX_ALLOWED_DISTANCE;
	}

	private async validateEntryTimeConstraint(
		user_id: string,
		entryTime: Date,
	): Promise<boolean> {
		// Get start and end of the same minute in São Paulo timezone
		const { start: startOfMinute, end: endOfMinute } = getMinuteBounds(entryTime);

		const existingEntry = await this.entries.findOne({
			where: {
				user_id,
				entry_time: {
					[Op.gte]: startOfMinute,
					[Op.lte]: endOfMinute,
				},
			},
		});

		return !existingEntry;
	}

	async registerUserEntry(entry: RegisterNewEntryDto): Promise<Entries | null> {
		const today = getCurrentDate();
		const entryTime = getCurrentDateTime();

		const isValidTimeConstraint = await this.validateEntryTimeConstraint(
			entry.user_id,
			entryTime,
		);

		if (!isValidTimeConstraint) {
			throw new BadRequestException(
				'Cannot create multiple entries within the same minute.',
			);
		}

		const currentWorkingDay: WorkingDays =
			await this.workingDay.createWorkingDayToUser({
				...entry,
				worked_date: formatDateString(today),
			});

		const validLocation: boolean = await this.validadeEntryLocation(
			entry.company_id,
			entry.latitude,
			entry.longitude,
		);

		const _id = uuidv4();

		const newEntry = await this.entries.create({
			_id,
			user_id: entry.user_id,
			working_day_id: currentWorkingDay.dataValues._id,
			entry_time: entryTime,
			latitude: entry.latitude || null,
			longitude: entry.longitude || null,
			is_approved: validLocation,
		});

		if (!validLocation) {
			await this.entriesApprovalService.createEntryApproval(
				newEntry.dataValues._id,
			);
		}

		return newEntry;
	}

	async getUserEntriesByDay(user_id: string, date: Date): Promise<Entries[]> {
		const startOfDay = getStartOfDay(date);
		const endOfDay = getEndOfDay(date);

		return await this.entries.findAll({
			where: {
				user_id,
				entry_time: {
					[Op.gte]: startOfDay,
					[Op.lte]: endOfDay,
				},
			},
			order: [['entry_time', 'ASC']],
			raw: true,
		});
	}
}
