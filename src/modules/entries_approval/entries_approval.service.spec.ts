import { Test, TestingModule } from '@nestjs/testing';
import { EntriesApprovalService } from './entries_approval.service';

describe('EntriesApprovalService', () => {
  let service: EntriesApprovalService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [EntriesApprovalService],
    }).compile();

    service = module.get<EntriesApprovalService>(EntriesApprovalService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
