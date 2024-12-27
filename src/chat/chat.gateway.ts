import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  OnGatewayConnection,
  OnGatewayDisconnect,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { ChatService } from './chat.service';

@WebSocketGateway({
  cors: {
    origin: '*',
    methods: ['GET', 'POST'],
    credentials: true,
  },
  transports: ['websocket'],
  path: '/socket.io/',
})
export class ChatGateway implements OnGatewayConnection, OnGatewayDisconnect {
  constructor(private readonly chatService: ChatService) {}

  @WebSocketServer()
  server: Server;

  async handleConnection(client: Socket) {
    console.log('Client attempting to connect');
    const { userId, roomId } = client.handshake.auth || {};
    if (userId && roomId) {
      console.log(`Client connected: ${userId} in room ${roomId}`);
      client.join(roomId);
    }
  }

  async handleDisconnect(client: Socket) {
    const { userId, roomId } = client.handshake.query;
    console.log(`Client disconnected: ${userId} from room ${roomId}`);
    client.leave(roomId as string);
  }

  @SubscribeMessage('message')
  async handleMessage(client: Socket, payload: any) {
    try {
      const { roomId } = client.handshake.query;
      
      // ChatService를 통해 메시지 저장 및 브로드캐스트
      await this.chatService.broadcastMessage({
        ...payload,
        roomId: roomId as string,
      });
      
      // 같은 방에 있는 모든 클라이언트에게 메시지 전송
      this.server.to(roomId as string).emit('message', payload);
      
      console.log('Message handled successfully:', payload);
    } catch (error) {
      console.error('Error handling message:', error);
      client.emit('error', { message: 'Failed to process message' });
    }
  }
}
