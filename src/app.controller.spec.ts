import { Test, TestingModule } from '@nestjs/testing';
import { AppController } from './app.controller';
import { AppService } from './app.service';

describe('AppController', () => {
  let appController: AppController;
  let appService: AppService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AppController],
      providers: [AppService],
    }).compile();

    appController = module.get<AppController>(AppController);
    appService = module.get<AppService>(AppService);
  });

  describe('getHello', () => {
    it('Hello World!를 반환해야 함', () => {
      const result = 'Hello World!';
      jest.spyOn(appService, 'getHello').mockImplementation(() => result);
      
      expect(appController.getHello()).toBe(result);
      expect(appService.getHello).toHaveBeenCalled();
    });
  });
});

