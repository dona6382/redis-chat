import { Test, TestingModule } from '@nestjs/testing';
import { ChatService } from './chat.service';
import { MessageService } from '../messages/message.service';
import { ConfigService } from '@nestjs/config';
import { ChatMessageDto } from './dto/chat-message.dto';

describe('ChatService', () => {
  let service: ChatService;
  let messageService: MessageService;

  const mockMessageService = {
    saveMessage: jest.fn(),
    getRoomMessages: jest.fn()
  };

  const mockConfigService = {
    get: jest.fn().mockReturnValue('test-encryption-key')
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ChatService,
        {
          provide: MessageService,
          useValue: mockMessageService
        },
        {
          provide: ConfigService,
          useValue: mockConfigService
        }
      ],
    }).compile();

    service = module.get<ChatService>(ChatService);
    messageService = module.get<MessageService>(MessageService);
  });

  it('정의되어 있어야 함', () => {
    expect(service).toBeDefined();
  });

  describe('broadcastMessage', () => {
    it('메시지를 암호화하고 저장해야 함', async () => {
      const message: ChatMessageDto = {
        userId: 'testUser',
        content: 'Hello World',
        roomId: 'testRoom'
      };

      mockMessageService.saveMessage.mockResolvedValue({
        _id: 'testId',
        ...message
      });

      await service.broadcastMessage(message);

      expect(messageService.saveMessage).toHaveBeenCalled();
      const savedMessage = mockMessageService.saveMessage.mock.calls[0][0];
      expect(savedMessage.content).not.toBe(message.content);
    });

    it('암호화 키가 없을 때 에러를 발생시켜야 함', async () => {
      mockConfigService.get.mockReturnValue(null);

      await expect(async () => {
        const service = module.get<ChatService>(ChatService);
      }).rejects.toThrow('ENCRYPTION_KEY is not defined');
    });

    it('메시지 복호화 실패시 기본 메시지를 반환해야 함', async () => {
      const invalidEncryptedMessage = {
        userId: 'testUser',
        content: 'invalid-encrypted-content',
        roomId: 'testRoom'
      };

      mockMessageService.getRoomMessages.mockResolvedValue([invalidEncryptedMessage]);
      const decryptedMessages = await service.getDecryptedMessages('testRoom');
      
      expect(decryptedMessages[0].content).toBe('복호화 실패');
    });
  });

  describe('getDecryptedMessages', () => {
    it('메시지를 조회하고 복호화해야 함', async () => {
      const encryptedMessage = {
        userId: 'testUser',
        content: service['encrypt']('Hello World'),
        roomId: 'testRoom'
      };

      mockMessageService.getRoomMessages.mockResolvedValue([encryptedMessage]);

      const decryptedMessages = await service.getDecryptedMessages('testRoom');

      expect(decryptedMessages[0].content).toBe('Hello World');
      expect(messageService.getRoomMessages).toHaveBeenCalledWith('testRoom');
    });
  });
});
