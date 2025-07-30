import {
	IsString,
	MinLength,
	IsDateString,
	IsOptional,
	IsUUID,
} from 'class-validator';

export class UpdateUserDto {
	@IsOptional()
	@IsString()
	@MinLength(2)
	name: string;

	@IsOptional()
	@IsDateString()
	birthday_date: string;

	@IsOptional()
	@IsUUID()
	company_id: string;
}
