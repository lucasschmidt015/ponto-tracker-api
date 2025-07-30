// @ts-nocheck
import {
	CanActivate,
	ExecutionContext,
	Injectable,
	UnauthorizedException,
	Type,
	mixin,
} from '@nestjs/common';
import { Request } from 'express';

export function UserOwnsResourceGuard(
	property: string,
	attributeType: string = 'body',
): Type<CanActivate> {
	@Injectable()
	class DynamicUserOwnsResourceGuard implements CanActivate {
		canActivate(context: ExecutionContext): boolean {
			const request = context.switchToHttp().getRequest<Request>();
			let bodyValue = null;

			if (!['body', 'params', 'query'].includes(attributeType)) {
				throw new Error(`Invalid attributeType: ${attributeType}`);
			}

			if (attributeType === 'body') {
				bodyValue = request.body?.[property];
			} else if (attributeType === 'params') {
				bodyValue = request.params?.[property];
			} else if (attributeType === 'query') {
				bodyValue = request.query?.[property];
			}

			const userId = request.user?.sub;

			if (!bodyValue || bodyValue !== userId) {
				throw new UnauthorizedException(
					'You are not authorised to access this resource.',
				);
			}

			return true;
		}
	}

	return mixin(DynamicUserOwnsResourceGuard);
}
