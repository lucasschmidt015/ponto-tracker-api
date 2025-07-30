import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from './auth.service';
import { UsersService } from '../users/users.service';
import { JwtService } from '@nestjs/jwt';
import { Users } from '../users/users.model';
import { AuthToken } from './auth-token.model';
import { getModelToken } from '@nestjs/sequelize';
import * as bcrypt from 'bcrypt';
import { NotFoundException, UnauthorizedException } from '@nestjs/common';

jest.mock('bcrypt', () => ({
	compare: jest.fn(),
}));

describe('AuthService', () => {
	let service: AuthService;

	const mocksUsersService = {
		findByEmail: jest.fn(),
	};

	const mocksJwtService = {
		signAsync: jest.fn(),
	};

	let mockAuthTokenModel: any;

	beforeEach(async () => {
		mockAuthTokenModel = {
			findOne: jest.fn(),
			update: jest.fn(),
			create: jest.fn(),
		};

		const module: TestingModule = await Test.createTestingModule({
			providers: [
				AuthService,
				{
					provide: UsersService,
					useValue: mocksUsersService,
				},
				{
					provide: JwtService,
					useValue: mocksJwtService,
				},
				{
					provide: getModelToken(AuthToken),
					useValue: mockAuthTokenModel,
				},
			],
		}).compile();

		service = module.get<AuthService>(AuthService);
	});

	it('should be defined', () => {
		expect(service).toBeDefined();
	});

	describe('signIn', () => {
		it('should signIn successfully and return a token ', async () => {
			const user = {
				_id: '123',
				name: 'Lucas',
				password: '123123',
				email: 'teste@teste.com',
				roles: [],
			};
			mocksUsersService.findByEmail.mockResolvedValue(user);
			(bcrypt.compare as jest.Mock).mockResolvedValue(true);
			mocksJwtService.signAsync.mockResolvedValue('this_is_a_very_real_token');

			const result = await service.signIn('teste@teste.com', '123123');
			expect(result).toMatchObject({
				access_token: 'this_is_a_very_real_token',
				user: {
					_id: '123',
					name: 'Lucas',
					email: 'teste@teste.com',
				},
			});
			expect(typeof result.refresh_token).toBe('string');

			expect(mocksUsersService.findByEmail).toHaveBeenCalledWith(
				'teste@teste.com',
			);
			expect(bcrypt.compare).toHaveBeenCalledWith('123123', user.password);
			expect(mocksJwtService.signAsync).toHaveBeenCalledWith({
				sub: user._id,
				email: user.email,
				roles: user.roles,
			});
		});

		it('should throw a NotFoundException if no account was found', async () => {
			mocksUsersService.findByEmail.mockResolvedValue(null);

			await expect(service.signIn('teste@teste.com', '123123')).rejects.toThrow(
				NotFoundException,
			);
			expect(mocksUsersService.findByEmail).toHaveBeenCalledWith(
				'teste@teste.com',
			);
		});

		it('should throw a UnauthorizedException if the password is invalid', async () => {
			const user = {
				email: 'teste@teste.com',
				password: '12123',
			};
			mocksUsersService.findByEmail.mockResolvedValue(user);
			(bcrypt.compare as jest.Mock).mockResolvedValue(false);

			await expect(service.signIn(user.email, user.password)).rejects.toThrow(
				UnauthorizedException,
			);
			expect(mocksUsersService.findByEmail).toHaveBeenCalledWith(user.email);
			expect(bcrypt.compare).toHaveBeenCalledWith(user.password, user.password);
		});
	});

	describe('logout', () => {
		it('should revoke the token if it exists and belongs to the user', async () => {
			(service as any).authTokenModel = {
				findOne: jest
					.fn()
					.mockResolvedValue({ revoked: false, save: jest.fn() }),
			};
			const token = { revoked: false, save: jest.fn() };
			(service as any).authTokenModel.findOne = jest
				.fn()
				.mockResolvedValue(token);
			await expect(service.logout('token', 'userId')).resolves.toBeUndefined();
			expect(token.revoked).toBe(true);
			expect(token.save).toHaveBeenCalled();
		});

		it('should throw NotFoundException if token does not exist', async () => {
			(service as any).authTokenModel = {
				findOne: jest.fn().mockResolvedValue(null),
			};
			await expect(service.logout('token', 'userId')).rejects.toThrow(
				NotFoundException,
			);
		});

		it('should do nothing if token is already revoked', async () => {
			(service as any).authTokenModel = {
				findOne: jest
					.fn()
					.mockResolvedValue({ revoked: true, save: jest.fn() }),
			};
			const token = { revoked: true, save: jest.fn() };
			(service as any).authTokenModel.findOne = jest
				.fn()
				.mockResolvedValue(token);
			await expect(service.logout('token', 'userId')).resolves.toBeUndefined();
			expect(token.save).not.toHaveBeenCalled();
		});
	});

	describe('isTokenValid', () => {
		it('should return true if token is valid', async () => {
			(service as any).authTokenModel = {
				findOne: jest.fn().mockResolvedValue({
					revoked: false,
					expires_at: new Date(Date.now() + 10000),
				}),
			};
			await expect(service.isTokenValid('token', 'userId')).resolves.toBe(true);
		});
		it('should return false if token does not exist', async () => {
			(service as any).authTokenModel = {
				findOne: jest.fn().mockResolvedValue(null),
			};
			await expect(service.isTokenValid('token', 'userId')).resolves.toBe(
				false,
			);
		});
		it('should return false if token is revoked', async () => {
			(service as any).authTokenModel = {
				findOne: jest.fn().mockResolvedValue({
					revoked: true,
					expires_at: new Date(Date.now() + 10000),
				}),
			};
			await expect(service.isTokenValid('token', 'userId')).resolves.toBe(
				false,
			);
		});
		it('should return false if token is expired', async () => {
			(service as any).authTokenModel = {
				findOne: jest.fn().mockResolvedValue({
					revoked: false,
					expires_at: new Date(Date.now() - 10000),
				}),
			};
			await expect(service.isTokenValid('token', 'userId')).resolves.toBe(
				false,
			);
		});
	});

	describe('refreshToken', () => {
		it('should refresh tokens and revoke old ones', async () => {
			const mockToken = {
				revoked: false,
				expires_at: new Date(Date.now() + 10000),
				save: jest.fn(),
			};
			const mockUser = {
				_id: '123',
				name: 'Lucas',
				email: 'teste@teste.com',
				userRoles: [],
			};
			(service as any).authTokenModel = {
				findOne: jest.fn().mockResolvedValue(mockToken),
				update: jest.fn().mockResolvedValue([1]),
				create: jest.fn().mockResolvedValue({}),
			};
			(service as any).usersService = {
				findOne: jest.fn().mockResolvedValue(mockUser),
			};
			(service as any).jwtService = {
				signAsync: jest.fn().mockResolvedValue('new_access_token'),
			};
			const result = await service.refreshToken('refreshToken', '123');
			expect(result).toMatchObject({
				access_token: 'new_access_token',
				refresh_token: expect.any(String),
				user: {
					_id: '123',
					name: 'Lucas',
					email: 'teste@teste.com',
				},
			});
			expect(mockToken.revoked).toBe(true);
			expect(mockToken.save).toHaveBeenCalled();
			expect((service as any).authTokenModel.update).toHaveBeenCalled();
			expect((service as any).authTokenModel.create).toHaveBeenCalledTimes(2);
		});
		it('should throw UnauthorizedException if refresh token is invalid', async () => {
			(service as any).authTokenModel = {
				findOne: jest.fn().mockResolvedValue(null),
			};
			await expect(
				service.refreshToken('refreshToken', 'userId'),
			).rejects.toThrow(UnauthorizedException);
		});
	});
});
