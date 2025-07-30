import {
	IsString,
	MinLength,
	IsEmail,
	IsDateString,
	IsUUID,
} from 'class-validator';
import { Match } from 'src/custom-validators/match.validator';

export class CreateUserDto {
	@IsString()
	@MinLength(2)
	name: string;

	@IsEmail()
	email: string;

	@IsDateString()
	birthday_date: string;

	@IsString()
	@MinLength(5)
	password: string;

	@IsString()
	@MinLength(5)
	@Match('password', { message: 'Passwords do not match' })
	password_confirmation: string;

	@IsUUID()
	company_id: string;
}
