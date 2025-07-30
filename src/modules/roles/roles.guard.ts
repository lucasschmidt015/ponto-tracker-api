import {
	CanActivate,
	ExecutionContext,
	Injectable,
	ForbiddenException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { ROLES_KEY } from 'src/custom-decorators/roles';
import { Request } from 'express';

// Extend Express Request interface to include 'user'
declare module 'express-serve-static-core' {
	interface Request {
		user?: { roles?: string[] };
	}
}

@Injectable()
export class RolesGuard implements CanActivate {
	constructor(private reflector: Reflector) {}

	canActivate(context: ExecutionContext): boolean {
		const requiredRoles = this.reflector.getAllAndOverride<string[]>(
			ROLES_KEY,
			[context.getHandler(), context.getClass()],
		);

		if (!requiredRoles) return true;

		const request = context.switchToHttp().getRequest<Request>();
		const user = request.user as { roles?: string[] };
		const userRoles: string[] = user.roles ?? [];

		const hasRole = requiredRoles.some((role) => userRoles.includes(role));

		if (!hasRole) {
			throw new ForbiddenException(
				'You do not have the required permissions to access this feature',
			);
		}

		return true;
	}
}
