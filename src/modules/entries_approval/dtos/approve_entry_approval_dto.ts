import { IsString, IsNotEmpty } from 'class-validator';

export class ApproveEntryApprovalDto {
	@IsString()
	@IsNotEmpty()
	id: string;

	@IsString()
	@IsNotEmpty()
	approval_user_id: string;

	@IsString()
	@IsNotEmpty()
	justificative: string;
}
