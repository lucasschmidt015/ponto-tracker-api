import { IsUUID, IsOptional, IsString } from 'class-validator';

export class RegisterNewEntryDto {
	//Yes, I know I could simply extract the user_id from the request, since we attach a user object during authentication. However, my goal was to practise using guards.
	@IsUUID()
	user_id: string;

	@IsUUID()
	company_id: string;

	@IsOptional()
	@IsString()
	latitude?: string;

	@IsOptional()
	@IsString()
	longitude?: string;
}
