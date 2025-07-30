import { Body, Controller, HttpCode, HttpStatus, Post } from '@nestjs/common';
import { AuthService } from './auth.service';
import { SignInDto } from './dtos/sign_in.dto';
import { Public } from 'src/custom-decorators/public';

@Controller('auth')
export class AuthController {
	constructor(private authService: AuthService) {}

	@HttpCode(HttpStatus.OK)
	@Public()
	@Post('login')
	signIn(@Body() signInDto: SignInDto) {
		return this.authService.signIn(signInDto.email, signInDto.password);
	}

	@HttpCode(HttpStatus.OK)
	@Post('logout')
	async logout(@Body() body: { userId: string }) {
		await this.authService.logout(body.userId);
		return { message: 'Logged out successfully' };
	}

	@HttpCode(HttpStatus.OK)
	@Post('validate')
	async validate(@Body() body: { token: string; userId: string }) {
		const valid = await this.authService.isTokenValid(body.token, body.userId);
		return { valid };
	}

	@Public()
	@HttpCode(HttpStatus.OK)
	@Post('refresh')
	async refresh(@Body() body: { refreshToken: string; userId: string }) {
		return this.authService.refreshToken(body.refreshToken, body.userId);
	}
}
