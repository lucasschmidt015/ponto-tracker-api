import { Test, TestingModule } from '@nestjs/testing';
import { EntriesApprovalController } from './entries_approval.controller';

describe('EntriesApprovalController', () => {
	let controller: EntriesApprovalController;

	beforeEach(async () => {
		const module: TestingModule = await Test.createTestingModule({
			controllers: [EntriesApprovalController],
		}).compile();

		controller = module.get<EntriesApprovalController>(
			EntriesApprovalController,
		);
	});

	it('should be defined', () => {
		expect(controller).toBeDefined();
	});
});
