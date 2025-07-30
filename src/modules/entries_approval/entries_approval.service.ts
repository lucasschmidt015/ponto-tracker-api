import {
	forwardRef,
	Inject,
	Injectable,
	NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { v4 as uuidv4 } from 'uuid';

import { EntriesApproval } from './entries_approval.model';
import { EntriesService } from '../entries/entries.service';
import { UsersService } from '../users/users.service';

import { ApproveEntryApprovalDto } from './dtos/approve_entry_approval_dto';

@Injectable()
export class EntriesApprovalService {
	constructor(
		@InjectModel(EntriesApproval)
		private entriesApproval: typeof EntriesApproval,
		@Inject(forwardRef(() => EntriesService))
		private entriesService: EntriesService,
		private usersService: UsersService,
	) {}

	//We don't need to validade the entry_id here because the entry approval is created when the entry is created
	async createEntryApproval(entry_id: string): Promise<EntriesApproval> {
		const entryApproval = await this.entriesApproval.create({
			_id: uuidv4(),
			justificative: null,
			entry_id: entry_id,
			approval_user_id: null,
			approval_date: null,
		});
		return entryApproval;
	}

	async approveEntryApproval(
		approvalEntry: ApproveEntryApprovalDto,
	): Promise<EntriesApproval | null> {
		const { id, approval_user_id, justificative } = approvalEntry;

		const user = await this.usersService.findOne(approval_user_id);

		if (!user) {
			throw new NotFoundException(`User with ID ${approval_user_id} not found`);
		}

		const entryApproval = await this.entriesApproval.findByPk(id);
		if (!entryApproval) {
			throw new NotFoundException(`Entry approval with ID ${id} not found`);
		}
		entryApproval.approval_user_id = approval_user_id;
		entryApproval.approval_date = new Date();
		entryApproval.justificative = justificative;
		await entryApproval.save();

		const entry = await this.entriesService['entries'].findByPk(
			entryApproval.entry_id,
		);
		if (entry) {
			entry.is_approved = true;
			await entry.save();
		}

		return entryApproval;
	}
}
