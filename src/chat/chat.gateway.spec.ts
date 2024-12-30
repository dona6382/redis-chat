import { Test, TestingModule } from '@nestjs/testing';
import { ChatGateway } from './chat.gateway';
import { ChatService } from './chat.service';
import { Socket, Server } from 'socket.io';

describe('ChatGateway', () => {
  let gateway: ChatGateway;
  let chatService: ChatService;

  // Mock Socket 객체 생성
  const mockSocket = {
    handshake: {
      auth: {
        userId: 'testUser',
        roomId: 'testRoom'
      },
      query: {
        userId: 'testUser',
        roomId: 'testRoom'
      }
    },
    join: jest.fn(),
    leave: jest.fn(),
    emit: jest.fn()
  } as unknown as Socket;

  // Mock Server 객체 생성
  const mockServer = {
    to: jest.fn().mockReturnThis(),
    emit: jest.fn()
  } as unknown as Server;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ChatGateway,
        {
          provide: ChatService,
          useValue: {
            broadcastMessage: jest.fn().mockResolvedValue(undefined)
          }
        }
      ],
    }).compile();

    gateway = module.get<ChatGateway>(ChatGateway);
    chatService = module.get<ChatService>(ChatService);
    gateway.server = mockServer;
  });

  it('정의되어 있어야 함', () => {
    expect(gateway).toBeDefined();
  });

  describe('handleConnection', () => {
    it('새로운 연결을 처리하고 방에 참가해야 함', async () => {
      await gateway.handleConnection(mockSocket);
      expect(mockSocket.join).toHaveBeenCalledWith('testRoom');
    });

    it('인증 데이터가 없으면 방에 참가하지 않아야 함', async () => {
      const socketWithoutAuth = {
        handshake: { auth: {} }
      } as unknown as Socket;
      
      await gateway.handleConnection(socketWithoutAuth);
      expect(mockSocket.join).not.toHaveBeenCalled();
    });
  });

  describe('handleDisconnect', () => {
    it('연결 해제를 처리하고 방에서 나가야 함', async () => {
      await gateway.handleDisconnect(mockSocket);
      expect(mockSocket.leave).toHaveBeenCalledWith('testRoom');
    });
  });

  describe('handleMessage', () => {
    it('방에 메시지를 브로드캐스트해야 함', async () => {
      const messagePayload = {
        content: 'test message',
        userId: 'testUser'
      };

      await gateway.handleMessage(mockSocket, messagePayload);

      expect(chatService.broadcastMessage).toHaveBeenCalledWith({
        ...messagePayload,
        roomId: 'testRoom'
      });
      expect(mockServer.to).toHaveBeenCalledWith('testRoom');
      expect(mockServer.emit).toHaveBeenCalledWith('message', messagePayload);
    });

    it('메시지 처리 중 에러 발생 시 처리해야 함', async () => {
      jest.spyOn(chatService, 'broadcastMessage').mockRejectedValue(new Error('Test error'));
      
      const messagePayload = {
        content: 'test message',
        userId: 'testUser'
      };

      await gateway.handleMessage(mockSocket, messagePayload);
      expect(mockSocket.emit).toHaveBeenCalledWith('error', { message: 'Failed to process message' });
    });

    it('메시지가 비어있을 때 에러를 반환해야 함', async () => {
      const emptyMessage = {
        content: '',
        userId: 'testUser'
      };

      await gateway.handleMessage(mockSocket, emptyMessage);
      expect(mockSocket.emit).toHaveBeenCalledWith('error', { 
        message: 'Message content cannot be empty' 
      });
    });

    it('유효하지 않은 roomId로 메시지를 보낼 때 에러', async () => {
      const messagePayload = {
        content: 'test message',
        userId: 'testUser'
      };
      
      const invalidSocket = {
        ...mockSocket,
        handshake: {
          query: {}
        }
      } as unknown as Socket;

      await gateway.handleMessage(invalidSocket, messagePayload);
      expect(mockSocket.emit).toHaveBeenCalledWith('error', { 
        message: 'Invalid room ID' 
      });
    });
  });
});
