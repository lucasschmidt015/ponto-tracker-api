import { Test, TestingModule } from '@nestjs/testing';
import { WorkingDaysService } from './working-days.service';
import { getModelToken } from '@nestjs/sequelize';
import { WorkingDays } from './working-days.model';
import { UsersService } from '../users/users.service';
import { CompaniesService } from '../companies/companies.service';
import { BadRequestException, NotFoundException } from '@nestjs/common';
import { ListAllWorkingDaysDto } from './dto/list-working-days.dto';

describe('WorkingDaysService', () => {
	let workingDaysService: WorkingDaysService;

	const mockSequelizeMethods = {
		findOne: jest.fn(),
		findAll: jest.fn(),
		create: jest.fn(),
	};

	const mockUsersService = {
		findOne: jest.fn(),
	};

	const mockCompaniesService = {
		findOne: jest.fn(),
	};

	beforeEach(async () => {
		const moduleRef: TestingModule = await Test.createTestingModule({
			providers: [
				WorkingDaysService,
				{
					provide: getModelToken(WorkingDays),
					useValue: mockSequelizeMethods,
				},
				{
					provide: UsersService,
					useValue: mockUsersService,
				},
				{
					provide: CompaniesService,
					useValue: mockCompaniesService,
				},
			],
		}).compile();

		workingDaysService = moduleRef.get<WorkingDaysService>(WorkingDaysService);
		jest.clearAllMocks();
	});

	describe('createWorkingDayToUser', () => {
		const user = { dataValues: { _id: 'user-1' } };
		const company = { dataValues: { _id: 'company-1' } };
		const dto = {
			user_id: 'user-1',
			company_id: 'company-1',
			worked_date: '2024-06-01',
		};

		it('should throw if user not found', async () => {
			mockUsersService.findOne.mockImplementation(() => {
				throw new NotFoundException();
			});

			await expect(
				workingDaysService.createWorkingDayToUser(dto),
			).rejects.toThrow(NotFoundException);
		});

		it('should throw if company not found', async () => {
			mockUsersService.findOne.mockResolvedValue(user);
			mockCompaniesService.findOne.mockImplementation(() => {
				throw new NotFoundException();
			});

			await expect(
				workingDaysService.createWorkingDayToUser(dto),
			).rejects.toThrow(NotFoundException);
		});

		it('should return existing working day if already exists', async () => {
			mockUsersService.findOne.mockResolvedValue(user);
			mockCompaniesService.findOne.mockResolvedValue(company);
			const existingDay = { _id: 'existing' };
			mockSequelizeMethods.findOne.mockResolvedValue(existingDay);

			const result = await workingDaysService.createWorkingDayToUser(dto);
			expect(result).toBe(existingDay);
			expect(mockSequelizeMethods.create).not.toHaveBeenCalled();
		});

		it('should create a new working day', async () => {
			mockUsersService.findOne.mockResolvedValue(user);
			mockCompaniesService.findOne.mockResolvedValue(company);
			mockSequelizeMethods.findOne.mockResolvedValue(null);

			const createdDay = { _id: 'created' };
			mockSequelizeMethods.create.mockResolvedValue(createdDay);

			const result = await workingDaysService.createWorkingDayToUser(dto);
			expect(result).toBe(createdDay);
			expect(mockSequelizeMethods.create).toHaveBeenCalled();
		});
	});

	describe('listWorkingDays', () => {
		it('should list working days with filter', async () => {
			const filter = {
				user_id: 'user-1',
				startDate: '2024-06-01',
				endDate: '2024-06-10',
			};

			const resultList = [{}, {}];
			mockSequelizeMethods.findAll.mockResolvedValue(resultList);

			const result = await workingDaysService.listWorkingDays(filter);
			expect(result).toBe(resultList);
			expect(mockSequelizeMethods.findAll).toHaveBeenCalled();
		});

		it('should return empty array if no data found', async () => {
			mockSequelizeMethods.findAll.mockResolvedValue(null);

			const result = await workingDaysService.listWorkingDays({
				user_id: 'user-1',
			} as ListAllWorkingDaysDto);
			expect(result).toEqual([]);
		});

		it('should throw an error if the user_id was not provided', async () => {
			await expect(
				workingDaysService.listWorkingDays({} as ListAllWorkingDaysDto),
			).rejects.toThrow(BadRequestException);
		});
	});
});
