import { Test, TestingModule } from '@nestjs/testing';
import { NodeMonitorService } from './node-monitor.service';

describe('NodeMonitorService', () => {
  let service: NodeMonitorService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [NodeMonitorService],
    }).compile();

    service = module.get<NodeMonitorService>(NodeMonitorService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
