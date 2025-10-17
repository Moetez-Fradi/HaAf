import { Test, TestingModule } from '@nestjs/testing';
import { PrivateToolInstanceService } from './private-tool-instance.service';

describe('PrivateToolInstanceService', () => {
  let service: PrivateToolInstanceService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [PrivateToolInstanceService],
    }).compile();

    service = module.get<PrivateToolInstanceService>(PrivateToolInstanceService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
