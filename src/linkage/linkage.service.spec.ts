import { Test, TestingModule } from '@nestjs/testing';
import { LinkageService } from './linkage.service';

describe('LinkageService', () => {
  let service: LinkageService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [LinkageService],
    }).compile();

    service = module.get<LinkageService>(LinkageService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
