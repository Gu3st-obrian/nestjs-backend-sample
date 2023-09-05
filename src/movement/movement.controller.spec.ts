import { Test, TestingModule } from '@nestjs/testing';
import { MovementController } from './movement.controller';

describe('MovementController', () => {
  let controller: MovementController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [MovementController],
    }).compile();

    controller = module.get<MovementController>(MovementController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
