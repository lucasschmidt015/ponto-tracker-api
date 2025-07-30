import {
	Injectable,
	NotFoundException,
	UnauthorizedException,
} from '@nestjs/common';
import { UsersService } from '../users/users.service';
import { InjectModel } from '@nestjs/sequelize';
import * as bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';
import { AuthToken } from './auth-token.model';
import { v4 as uuidv4 } from 'uuid';

const TOKEN_EXPIRES_IN = process.env.TOKEN_EXPIRES_IN || '1h';
const REFRESH_TOKEN_EXPIRES_IN = process.env.REFRESH_TOKEN_EXPIRES_IN || '10d';

function parseExpiresInToMs(expiresIn: string): number {
	const match = expiresIn.match(/(\d+)([smhd])/i);
	if (!match) return 3600000; // default 1h
	const value = parseInt(match[1], 10);
	switch (match[2].toLowerCase()) {
		case 's':
			return value * 1000;
		case 'm':
			return value * 60 * 1000;
		case 'h':
			return value * 60 * 60 * 1000;
		case 'd':
			return value * 24 * 60 * 60 * 1000;
		default:
			return 3600000;
	}
}

@Injectable()
export class AuthService {
	constructor(
		private usersService: UsersService,
		private jwtService: JwtService,
		@InjectModel(AuthToken) private authTokenModel: typeof AuthToken,
	) {}

	async signIn(email: string, password: string): Promise<any> {
		const user = await this.usersService.findByEmail(email);

		if (!user) {
			throw new NotFoundException(
				'No account was found with the provided email.',
			);
		}

		const isPasswordValid = await bcrypt.compare(password, user.password);

		if (!isPasswordValid) {
			throw new UnauthorizedException();
		}

		const roles = user.userRoles?.map((ur) => ur.role?.name) ?? [];

		const payload = {
			sub: user._id,
			email: user.email,
			roles,
		};

		const accessToken = await this.jwtService.signAsync(payload);

		const accessExpiresMs = parseExpiresInToMs(TOKEN_EXPIRES_IN);
		const accessExpiresAt = new Date(Date.now() + accessExpiresMs);

		const refreshToken = uuidv4(); // Use a random string for refresh token
		const refreshExpiresMs = parseExpiresInToMs(REFRESH_TOKEN_EXPIRES_IN);
		const refreshExpiresAt = new Date(Date.now() + refreshExpiresMs);

		await this.authTokenModel.create({
			_id: uuidv4(),
			token: accessToken,
			user_id: user._id,
			expires_at: accessExpiresAt,
			revoked: false,
			type: 'access',
		});
		await this.authTokenModel.create({
			_id: uuidv4(),
			token: refreshToken,
			user_id: user._id,
			expires_at: refreshExpiresAt,
			revoked: false,
			type: 'refresh',
		});

		return {
			access_token: accessToken,
			refresh_token: refreshToken,
			user: {
				_id: user._id,
				name: user.name,
				email: user.email,
			},
			company: {
				_id: user.company._id,
				name: user.company.name,
				email: user.company.email,
			},
		} as {
			access_token: string;
			refresh_token: string;
			user: {
				_id: string;
				name: string;
				email: string;
			};
			company: {
				_id: string;
				name: string;
				email: string;
			};
		};
	}

	async logout(userId: string): Promise<void> {
		try {
			await this.authTokenModel.update(
				{ revoked: true },
				{
					where: {
						user_id: userId,
						revoked: false,
					},
				},
			);
		} catch (error) {
			console.error(`Failed to logout user ${userId}:`, error);
			throw error;
		}
	}

	async isTokenValid(token: string, userId: string): Promise<boolean> {
		const tokenRecord = await this.authTokenModel.findOne({
			where: {
				token,
				user_id: userId,
			},
			raw: true,
		});

		if (!tokenRecord) return false;

		if (tokenRecord.revoked) return false;

		if (tokenRecord.expires_at <= new Date()) return false;

		return true;
	}

	async refreshToken(
		refreshToken: string,
		userId: string,
	): Promise<{ access_token: string; refresh_token: string }> {
		const tokenRecord = await this.authTokenModel.findOne({
			where: {
				token: refreshToken,
				user_id: userId,
				type: 'refresh',
			},
			raw: true,
		});

		if (
			!tokenRecord ||
			tokenRecord.revoked ||
			tokenRecord.expires_at <= new Date()
		) {
			throw new UnauthorizedException('Invalid or expired refresh token.');
		}

		await this.authTokenModel.update(
			{ revoked: true },
			{
				where: {
					_id: tokenRecord._id,
				},
			},
		);

		await this.authTokenModel.update(
			{ revoked: true },
			{
				where: {
					user_id: userId,
					type: 'access',
					revoked: false,
					createdAt: { $lt: new Date() },
				},
			},
		);

		// Issue new tokens
		const user = await this.usersService.findUserByIdWithRoles(userId);
		if (!user) {
			throw new NotFoundException('User not found.');
		}

		const roles = user.userRoles?.map((ur) => ur.role?.name) ?? [];
		const payload = {
			sub: user._id,
			email: user.email,
			roles,
		};

		const newAccessToken = await this.jwtService.signAsync(payload);
		const accessExpiresMs = parseExpiresInToMs(TOKEN_EXPIRES_IN);
		const accessExpiresAt = new Date(Date.now() + accessExpiresMs);
		const newRefreshToken = uuidv4();
		const refreshExpiresMs = parseExpiresInToMs(REFRESH_TOKEN_EXPIRES_IN);
		const refreshExpiresAt = new Date(Date.now() + refreshExpiresMs);
		await this.authTokenModel.create({
			_id: uuidv4(),
			token: newAccessToken,
			user_id: user._id,
			expires_at: accessExpiresAt,
			revoked: false,
			type: 'access',
		});
		await this.authTokenModel.create({
			_id: uuidv4(),
			token: newRefreshToken,
			user_id: user._id,
			expires_at: refreshExpiresAt,
			revoked: false,
			type: 'refresh',
		});

		return {
			access_token: newAccessToken,
			refresh_token: newRefreshToken,
			user: {
				_id: user._id,
				name: user.name,
				email: user.email,
			},
			company: {
				_id: user.company._id,
				name: user.company.name,
				email: user.company.email,
			},
		} as {
			access_token: string;
			refresh_token: string;
			user: {
				_id: string;
				name: string;
				email: string;
			};
			company: {
				_id: string;
				name: string;
				email: string;
			};
		};
	}
}
