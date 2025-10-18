import { Test, TestingModule } from '@nestjs/testing';
import { PrivateWorkflowInstanceController } from './private-workflow-instance.controller';

describe('PrivateWorkflowInstanceController', () => {
  let controller: PrivateWorkflowInstanceController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [PrivateWorkflowInstanceController],
    }).compile();

    controller = module.get<PrivateWorkflowInstanceController>(PrivateWorkflowInstanceController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
