import { IsOptional, IsUUID } from 'class-validator';

export class ListAllWorkingDaysDto {
	@IsOptional()
	@IsUUID()
	user_id: string;

	@IsOptional()
	startDate: string;

	@IsOptional()
	endDate: string;
}
