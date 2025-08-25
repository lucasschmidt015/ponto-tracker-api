import {
	CanActivate,
	ExecutionContext,
	Injectable,
	UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Request } from 'express';
import configs from 'config';
import { Reflector } from '@nestjs/core';
import { IS_PUBLIC_KEY } from 'src/custom-decorators/public';
import { InjectModel } from '@nestjs/sequelize';
import { AuthToken } from 'src/modules/auth/auth-token.model';
import { getCurrentDateTime } from '../../common/utils/timezone.util';

interface JwtPayload {
	sub: string;
	email: string;
	roles: string[];
	iat?: number;
	exp?: number;
}

interface RequestWithUser extends Request {
	user?: JwtPayload;
}

@Injectable()
export class AuthGuard implements CanActivate {
	constructor(
		private jwtService: JwtService,
		private reflector: Reflector,
		@InjectModel(AuthToken) private authTokenModel: typeof AuthToken,
	) {}

	async canActivate(context: ExecutionContext): Promise<boolean> {
		const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
			context.getHandler(),
			context.getClass(),
		]);

		if (isPublic) {
			return true;
		}

		const request: RequestWithUser = context.switchToHttp().getRequest();
		const token = this.extractTokenFromHeader(request);

		if (!token) {
			throw new UnauthorizedException();
		}

		try {
			const payload = await this.jwtService.verifyAsync<JwtPayload>(token, {
				secret: configs.auth.jwt_secret,
			});

			const tokenRecord = await this.authTokenModel.findOne({
				where: {
					token,
					user_id: payload.sub,
					type: 'access',
				},
				raw: true,
			});

			if (
				!tokenRecord ||
				tokenRecord.revoked ||
				tokenRecord.expires_at <= getCurrentDateTime()
			) {
				throw new UnauthorizedException('Token is invalid or expired');
			}

			request.user = payload;
		} catch {
			throw new UnauthorizedException();
		}

		return true;
	}

	private extractTokenFromHeader(request: RequestWithUser): string | undefined {
		const [type, token] = request.headers.authorization?.split(' ') ?? [];
		return type === 'Bearer' ? token : undefined;
	}
}
