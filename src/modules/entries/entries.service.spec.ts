import { Test, TestingModule } from '@nestjs/testing';
import { EntriesService } from './entries.service';
import { getModelToken } from '@nestjs/sequelize';
import { Entries } from './entries.model';
import { WorkingDaysService } from '../working-days/working-days.service';
import { CompaniesService } from '../companies/companies.service';
import { RegisterNewEntryDto } from './dtos/register-new-entry.dto';
import { NotFoundException } from '@nestjs/common';

const mockEntriesModel = {
	create: jest.fn(),
};

const mockWorkingDaysService = {
	createWorkingDayToUser: jest.fn(),
};

const mockCompaniesService = {
	findOne: jest.fn(),
};

describe('EntriesService', () => {
	let service: EntriesService;

	beforeEach(async () => {
		const module: TestingModule = await Test.createTestingModule({
			providers: [
				EntriesService,
				{ provide: getModelToken(Entries), useValue: mockEntriesModel },
				{ provide: WorkingDaysService, useValue: mockWorkingDaysService },
				{ provide: CompaniesService, useValue: mockCompaniesService },
			],
		}).compile();

		service = module.get<EntriesService>(EntriesService);
		jest.clearAllMocks();
	});

	describe('calculateDistanceInMeters', () => {
		it('should calculate the correct distance between two points', () => {
			const lat1 = -23.55052;
			const lon1 = -46.633308;
			const lat2 = -22.906847;
			const lon2 = -43.172896;
			const distance = service['calculateDistanceInMeters'](
				lat1,
				lon1,
				lat2,
				lon2,
			);
			expect(distance).toBeGreaterThan(300000);
			expect(distance).toBeLessThan(400000);
		});
	});

	describe('validadeEntryLocation', () => {
		it('should throw NotFoundException if company does not exist', async () => {
			mockCompaniesService.findOne.mockResolvedValue(null);
			await expect(
				service.validadeEntryLocation('company_id', '1', '1'),
			).rejects.toThrow(NotFoundException);
		});

		it('should return true if allow_entry_out_range is true', async () => {
			mockCompaniesService.findOne.mockResolvedValue({
				allow_entry_out_range: true,
			});
			const result = await service.validadeEntryLocation(
				'company_id',
				'1',
				'1',
			);
			expect(result).toBe(true);
		});

		it('should return true if company latitude or longitude is missing', async () => {
			mockCompaniesService.findOne.mockResolvedValue({
				allow_entry_out_range: false,
				latitude: null,
				longitude: '1',
			});
			expect(await service.validadeEntryLocation('company_id', '1', '1')).toBe(
				true,
			);
			mockCompaniesService.findOne.mockResolvedValue({
				allow_entry_out_range: false,
				latitude: '1',
				longitude: null,
			});
			expect(await service.validadeEntryLocation('company_id', '1', '1')).toBe(
				true,
			);
		});

		it('should return false if user latitude or longitude is missing', async () => {
			mockCompaniesService.findOne.mockResolvedValue({
				allow_entry_out_range: false,
				latitude: '1',
				longitude: '1',
			});
			expect(
				await service.validadeEntryLocation('company_id', undefined, '1'),
			).toBe(false);
			expect(
				await service.validadeEntryLocation('company_id', '1', undefined),
			).toBe(false);
		});

		it('should return true if distance is within allowed range', async () => {
			mockCompaniesService.findOne.mockResolvedValue({
				allow_entry_out_range: false,
				latitude: '0',
				longitude: '0',
				register_range_meters: 1000,
			});
			expect(await service.validadeEntryLocation('company_id', '0', '0')).toBe(
				true,
			);
		});

		it('should return false if distance is outside allowed range', async () => {
			mockCompaniesService.findOne.mockResolvedValue({
				allow_entry_out_range: false,
				latitude: '0',
				longitude: '0',
				register_range_meters: 1,
			});
			expect(
				await service.validadeEntryLocation('company_id', '10', '10'),
			).toBe(false);
		});

		it('should use default range if register_range_meters is not set', async () => {
			mockCompaniesService.findOne.mockResolvedValue({
				allow_entry_out_range: false,
				latitude: '0',
				longitude: '0',
				register_range_meters: undefined,
			});
			expect(await service.validadeEntryLocation('company_id', '0', '0')).toBe(
				true,
			);
		});
	});

	describe('registerUserEntry', () => {
		it('should create a new entry with valid location', async () => {
			const entry: RegisterNewEntryDto = {
				user_id: 'user1',
				company_id: 'company1',
				latitude: '0',
				longitude: '0',
			};
			const workingDay = { dataValues: { _id: 'wd1' } };
			mockWorkingDaysService.createWorkingDayToUser.mockResolvedValue(
				workingDay,
			);
			jest.spyOn(service, 'validadeEntryLocation').mockResolvedValue(true);
			const createdEntry = { _id: 'entry1' };
			mockEntriesModel.create.mockResolvedValue(createdEntry);

			const result = await service.registerUserEntry(entry);
			expect(result).toBe(createdEntry);
			expect(mockWorkingDaysService.createWorkingDayToUser).toHaveBeenCalled();
			expect(service.validadeEntryLocation).toHaveBeenCalledWith(
				entry.company_id,
				entry.latitude,
				entry.longitude,
			);
			expect(mockEntriesModel.create).toHaveBeenCalledWith(
				expect.objectContaining({
					user_id: entry.user_id,
					working_day_id: 'wd1',
					latitude: entry.latitude,
					longitude: entry.longitude,
					is_approved: true,
				}),
			);
		});
	});
});
