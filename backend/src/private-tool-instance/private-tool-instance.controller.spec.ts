import { Test, TestingModule } from '@nestjs/testing';
import { PrivateToolInstanceController } from './private-tool-instance.controller';

describe('PrivateToolInstanceController', () => {
  let controller: PrivateToolInstanceController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [PrivateToolInstanceController],
    }).compile();

    controller = module.get<PrivateToolInstanceController>(PrivateToolInstanceController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
