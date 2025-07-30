import { Controller, Post, Body, UseGuards } from '@nestjs/common';
import { EntriesApprovalService } from './entries_approval.service';

import { ApproveEntryApprovalDto } from './dtos/approve_entry_approval_dto';

@Controller('entries-approval')
export class EntriesApprovalController {
	constructor(private entriesApprovalService: EntriesApprovalService) {}

	@Post()
	approvalEntryApproval(@Body() entryApproval: ApproveEntryApprovalDto) {
		return this.entriesApprovalService.approveEntryApproval(entryApproval);
	}
}
