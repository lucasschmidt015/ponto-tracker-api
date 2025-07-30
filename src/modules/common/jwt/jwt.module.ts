import { Global, Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import configs from 'config';

const TOKEN_EXPIRES_IN = process.env.TOKEN_EXPIRES_IN || '1h';

@Global()
@Module({
	imports: [
		JwtModule.register({
			secret: configs.auth.jwt_secret,
			signOptions: { expiresIn: TOKEN_EXPIRES_IN },
		}),
	],
	exports: [JwtModule],
})
export class JwtConfigModule {}
