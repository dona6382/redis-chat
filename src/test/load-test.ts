import { check } from 'k6';
import ws from 'k6/ws';
import { sleep } from 'k6';
import { Counter } from 'k6/metrics';

const messagesSent = new Counter('messages_sent');

export const options = {
  vus: 10,
  duration: '10s',
  thresholds: {
    'messages_sent': ['count>100'],
  },
};

export default function () {
  const roomId = `room-${__VU}`;
  const userId = `loadtest-${__VU}`;
  const url = `ws://localhost:3000/socket.io/?EIO=4&transport=websocket`;

  const response = ws.connect(url, {}, function (socket) {
    socket.on('open', () => {
      console.log(`VU ${__VU}: Connected`);
        
      // Socket.IO v4 연결 시퀀스
      socket.send('40{\"auth\":{\"userId\":\"' + userId + '\",\"roomId\":\"' + roomId + '\"}}');
      
      sleep(0.1); // 연결 설정을 위한 짧은 대기

      for (let i = 0; i < 10; i++) {
        const messageData = {
          userId: userId,
          content: `Test message ${i}`,
          roomId: roomId,
          timestamp: new Date()
        };
        
        socket.send(`42["message",${JSON.stringify(messageData)}]`);
        messagesSent.add(1);
        sleep(0.1);
      }
    });

    socket.on('message', (data) => {
      // 서버 응답 처리
      if (data.toString().startsWith('40')) {
        console.log(`VU ${__VU}: Connection acknowledged`);
      }
    });

    socket.on('error', (e) => {
      console.error(`VU ${__VU}: Error:`, e);
    });

    sleep(3);
    socket.close();
  });

  check(response, { 'status is 101': (r) => r && r.status === 101 });
} 