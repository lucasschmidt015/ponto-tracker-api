import { Test } from '@nestjs/testing';
import { CompaniesController } from './companies.controller';
import { CompaniesService } from './companies.service';
import { Companies } from './companies.model';
import { getModelToken } from '@nestjs/sequelize';
import { CreateCompanyDto } from './dtos/create-company.dto';
import { UpdateCompanyDto } from './dtos/update-company.dto';

describe('CompaniesController', () => {
	let companiesController: CompaniesController;
	let companiesService: CompaniesService;

	const mockedCompaniesService = {
		findOne: jest.fn(),
		findAll: jest.fn(),
		create: jest.fn(),
		update: jest.fn(),
		delete: jest.fn(),
	};

	beforeEach(async () => {
		const moduleRef = await Test.createTestingModule({
			controllers: [CompaniesController],
			providers: [
				{
					provide: CompaniesService,
					useValue: mockedCompaniesService,
				},
				{
					provide: getModelToken(Companies),
					useValue: {},
				},
			],
		}).compile();

		companiesController = moduleRef.get(CompaniesController);
		companiesService = moduleRef.get(CompaniesService);

		jest.clearAllMocks();
	});

	describe('findOne', () => {
		it('Should return a single company', async () => {
			const result = { _id: '1', name: 'SchmidtTech' };

			mockedCompaniesService.findOne.mockResolvedValue(result);

			expect(await companiesController.findOne('1')).toBe(result);
			expect(mockedCompaniesService.findOne).toHaveBeenCalled();
		});
	});

	describe('findAll', () => {
		it('should return an array of companies', async () => {
			const result = [{ _id: '1', name: 'SchmidtTech' }];
			mockedCompaniesService.findAll.mockResolvedValue(result);

			expect(await companiesController.findAll()).toBe(result);
			expect(mockedCompaniesService.findAll).toHaveBeenCalled();
		});
	});
	describe('create', () => {
		it('should create and return a company', async () => {
			const dto: CreateCompanyDto = {
				name: 'NewCompany',
				allow_entry_out_range: false,
				email: 'aaa',
				end_time_afternoon: '',
				end_time_morning: '',
				start_time_afternoon: '',
				start_time_morning: '',
				latitude: '1',
				longitude: '1',
			};
			const result = { _id: '2', name: 'NewCompany' };

			mockedCompaniesService.create.mockResolvedValue(result);

			expect(await companiesController.create(dto)).toBe(result);
			expect(mockedCompaniesService.create).toHaveBeenCalledWith(dto);
		});
	});
	describe('update', () => {
		it('should update and return the updated company', async () => {
			const dto: UpdateCompanyDto = {
				name: 'UpdatedCompany',
				allow_entry_out_range: false,
				end_time_afternoon: '',
				end_time_morning: '',
				start_time_afternoon: '',
				start_time_morning: '',
				latitude: '1',
				longitude: '1',
			};
			const result = { _id: '1', name: 'UpdatedCompany' };

			mockedCompaniesService.update.mockResolvedValue(result);

			expect(await companiesController.update('1', dto)).toBe(result);
			expect(mockedCompaniesService.update).toHaveBeenCalledWith('1', dto);
		});
	});
	describe('delete', () => {
		it('should delete and return the result', async () => {
			const result = { success: true };

			mockedCompaniesService.delete.mockResolvedValue(result);

			expect(await companiesController.delete('1')).toBe(result);
			expect(mockedCompaniesService.delete).toHaveBeenCalledWith('1');
		});
	});
});
