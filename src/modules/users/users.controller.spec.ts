import { Test } from '@nestjs/testing';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';
import { Users } from './users.model';
import { getModelToken } from '@nestjs/sequelize';
import { CreateUserDto } from './dtos/create-user.dto';
import { UpdateUserDto } from './dtos/update-user.dto';

describe('UsersController', () => {
	let usersController: UsersController;
	let usersService: UsersService;

	const mockUsersService = {
		findAll: jest.fn(),
		findOne: jest.fn(),
		create: jest.fn(),
		update: jest.fn(),
		delete: jest.fn(),
	};

	beforeEach(async () => {
		const moduleRef = await Test.createTestingModule({
			controllers: [UsersController],
			providers: [
				{
					provide: UsersService,
					useValue: mockUsersService,
				},
				{
					provide: getModelToken(Users),
					useValue: {},
				},
			],
		}).compile();

		usersService = moduleRef.get(UsersService);
		usersController = moduleRef.get(UsersController);

		jest.clearAllMocks();
	});

	describe('findAll', () => {
		it('should return an array of users', async () => {
			const result = [{ name: 'John' }];
			mockUsersService.findAll.mockResolvedValue(result);

			expect(await usersController.findAll()).toBe(result);
			expect(mockUsersService.findAll).toHaveBeenCalled();
		});
	});

	describe('findOne', () => {
		it('should return a single user', async () => {
			const result = { name: 'John' };
			mockUsersService.findOne.mockResolvedValue(result);

			expect(await usersController.findOne('1')).toBe(result);
			expect(mockUsersService.findOne).toHaveBeenCalledWith('1');
		});
	});

	describe('create', () => {
		it('should create and return a user', async () => {
			const dto: CreateUserDto = {
				name: 'John',
				email: 'john@example.com',
				birthday_date: new Date().toString(),
				password: '123456',
				password_confirmation: '123456',
				company_id: '123123',
			};
			const result = { ...dto, _id: 'abc123' };

			mockUsersService.create.mockResolvedValue(result);

			expect(await usersController.create(dto)).toBe(result);
			expect(mockUsersService.create).toHaveBeenCalledWith(dto);
		});
	});

	describe('update', () => {
		it('should update and return the updated user', async () => {
			const dto: UpdateUserDto = {
				name: 'Updated Name',
				birthday_date: new Date().toString(),
				company_id: '123123',
			};
			const result = { _id: '1', name: 'Updated Name' };

			mockUsersService.update.mockResolvedValue(result);

			expect(await usersController.update('1', dto)).toBe(result);
			expect(mockUsersService.update).toHaveBeenCalledWith('1', dto);
		});
	});

	describe('delete', () => {
		it('should delete and return the deleted user', async () => {
			const result = { success: true };

			mockUsersService.delete.mockResolvedValue(result);

			expect(await usersController.delete('1')).toBe(result);
			expect(mockUsersService.delete).toHaveBeenCalledWith('1');
		});
	});
});
