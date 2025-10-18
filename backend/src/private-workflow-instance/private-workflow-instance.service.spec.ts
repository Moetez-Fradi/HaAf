import { Test, TestingModule } from '@nestjs/testing';
import { PrivateWorkflowInstanceService } from './private-workflow-instance.service';

describe('PrivateWorkflowInstanceService', () => {
  let service: PrivateWorkflowInstanceService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [PrivateWorkflowInstanceService],
    }).compile();

    service = module.get<PrivateWorkflowInstanceService>(PrivateWorkflowInstanceService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
