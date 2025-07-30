import { Test } from '@nestjs/testing';
import { UsersService } from './users.service';
import { Users } from './users.model';
import { getModelToken } from '@nestjs/sequelize';
import { CreateUserDto } from './dtos/create-user.dto';
import { UpdateUserDto } from './dtos/update-user.dto';
import { ConflictException, NotFoundException } from '@nestjs/common';
import { CompaniesService } from '../companies/companies.service';
import DestroyedResponse from 'src/types/delete.response';

describe('UsersService', () => {
	let usersService: UsersService;

	const mockSequelizeMethods = {
		findOne: jest.fn(),
		findAll: jest.fn(),
		create: jest.fn(),
		update: jest.fn(),
		destroy: jest.fn(),
		findByPk: jest.fn(),
	};

	const mockCompaniesService = {
		findOne: jest.fn(),
	};

	beforeEach(async () => {
		const moduleRef = await Test.createTestingModule({
			controllers: [],
			providers: [
				UsersService,
				{
					provide: getModelToken(Users),
					useValue: mockSequelizeMethods,
				},
				{
					provide: CompaniesService,
					useValue: mockCompaniesService,
				},
			],
		}).compile();

		usersService = moduleRef.get(UsersService);
		jest.clearAllMocks();
	});

	describe('findAll', () => {
		it('should return an array of users', async () => {
			const result = [{ name: 'John' }];
			mockSequelizeMethods.findAll.mockResolvedValue(result);

			expect(await usersService.findAll()).toBe(result);
			expect(mockSequelizeMethods.findAll).toHaveBeenCalled();
		});
	});

	describe('findOne', () => {
		it('should Return an specific user', async () => {
			const result = { name: 'carlinhos' };
			mockSequelizeMethods.findOne.mockResolvedValue(result);

			expect(await usersService.findOne('1')).toBe(result);
			expect(mockSequelizeMethods.findOne).toHaveBeenCalled();
		});
	});

	describe('create', () => {
		it('should create a user successfully', async () => {
			const newUserInput: CreateUserDto = {
				name: 'Carlinhos',
				birthday_date: new Date().toString(),
				email: 'teste',
				password: '11111',
				password_confirmation: '11111',
				company_id: '123123',
			};

			const createdUser = {
				get: () => {
					const { password, ...userWithoutPassword } = {
						_id: '123',
						...newUserInput,
					};
					return userWithoutPassword;
				},
			};

			mockSequelizeMethods.create.mockResolvedValue(createdUser);
			mockSequelizeMethods.findOne.mockResolvedValue(undefined);
			mockCompaniesService.findOne.mockResolvedValue({
				_id: 123,
				name: 'teste',
			});

			expect(await usersService.create(newUserInput)).toEqual(
				createdUser.get(),
			);
			expect(mockSequelizeMethods.findOne).toHaveBeenCalled();
			expect(mockSequelizeMethods.create).toHaveBeenCalled();
			expect(mockCompaniesService.findOne).toHaveBeenCalled();
		});

		it('should fail to create the user since the email already exists', async () => {
			const newUserInput: CreateUserDto = {
				name: 'Carlinhos',
				birthday_date: new Date().toString(),
				email: 'teste',
				password: '11111',
				password_confirmation: '11111',
				company_id: '123123',
			};

			mockSequelizeMethods.findOne.mockResolvedValue(true);

			await expect(usersService.create(newUserInput)).rejects.toThrow(
				ConflictException,
			);
		});

		it('should fail to create the user since the company was not found', async () => {
			const newUserInput: CreateUserDto = {
				name: 'Carlinhos',
				birthday_date: new Date().toString(),
				email: 'teste',
				password: '11111',
				password_confirmation: '11111',
				company_id: '123123',
			};
			mockSequelizeMethods.create.mockResolvedValue(newUserInput);
			mockSequelizeMethods.findOne.mockResolvedValue(undefined);
			mockCompaniesService.findOne.mockResolvedValue(undefined);

			await expect(usersService.create(newUserInput)).rejects.toThrow(
				NotFoundException,
			);
		});
	});

	describe('update', () => {
		it('should update an user successfully', async () => {
			const updateData = {
				name: 'jão',
				birthday_date: new Date().toString(),
			} as UpdateUserDto;

			mockSequelizeMethods.update.mockResolvedValue(updateData);
			mockSequelizeMethods.findOne.mockResolvedValue(true);

			expect(await usersService.update('1', updateData)).toBe(updateData);
			expect(mockSequelizeMethods.update).toHaveBeenCalled();
			expect(mockSequelizeMethods.findOne).toHaveBeenCalled();
		});

		it('updates the user when the associated company exists', async () => {
			const updateData: UpdateUserDto = {
				name: 'jão',
				birthday_date: new Date().toString(),
				company_id: '123',
			};

			mockCompaniesService.findOne.mockResolvedValue({
				_id: '123',
			});
			mockSequelizeMethods.update.mockResolvedValue(updateData);
			expect(await usersService.update('1', updateData)).toBe(updateData);
			expect(mockSequelizeMethods.update).toHaveBeenCalled();
			expect(mockCompaniesService.findOne).toHaveBeenCalled();
		});

		it('throws NotFoundException when trying to update a user with a non-existent company', async () => {
			const updateData: UpdateUserDto = {
				name: 'jão',
				birthday_date: new Date().toString(),
				company_id: '123',
			};

			mockCompaniesService.findOne.mockResolvedValue(undefined);
			await expect(usersService.update('1', updateData)).rejects.toThrow(
				NotFoundException,
			);
			expect(mockCompaniesService.findOne).toHaveBeenCalled();
		});

		it('throws NotFoundException when trying to update a user with a invalid id', async () => {
			const updateData: UpdateUserDto = {
				name: 'jão',
				birthday_date: new Date().toString(),
				company_id: '123',
			};

			mockCompaniesService.findOne.mockResolvedValue(true);
			mockSequelizeMethods.findOne.mockResolvedValue(false);

			await expect(usersService.update('1', updateData)).rejects.toThrow(
				NotFoundException,
			);
			expect(mockSequelizeMethods.findOne).toHaveBeenCalled();
		});
	});

	describe('delete', () => {
		it('should delete an user successfully', async () => {
			const _id = '1';
			const result: DestroyedResponse = {
				_id,
				message: `User with id ${_id} successfully deleted`,
				success: 1,
			};

			mockSequelizeMethods.destroy.mockReturnValue(1);
			mockSequelizeMethods.findByPk.mockResolvedValue(true);

			expect(await usersService.delete(_id)).toEqual(result);
			expect(mockSequelizeMethods.destroy).toHaveBeenCalled();
			expect(mockSequelizeMethods.findByPk).toHaveBeenCalled();
		});

		it('should throw NotFoundException when the user does not exist', async () => {
			const _id = 'nonexistent-id';

			mockSequelizeMethods.findByPk.mockResolvedValue(null);

			await expect(usersService.delete(_id)).rejects.toThrow(NotFoundException);
			expect(mockSequelizeMethods.findByPk).toHaveBeenCalledWith(_id);
			expect(mockSequelizeMethods.destroy).not.toHaveBeenCalled();
		});
	});
});
