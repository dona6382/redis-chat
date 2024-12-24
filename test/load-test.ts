import { io } from 'socket.io-client';
import { performance } from 'perf_hooks';

const NUM_CLIENTS = 10;
const TARGET_RPS = 1000;
const TEST_DURATION = 30;
const BATCH_SIZE = 100; // 한 번에 처리할 메시지 수

const clients: any[] = [];
let messageCount = 0;
let errorCount = 0;
let successCount = 0;
let startTime: number;

async function sleep(ms: number) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

async function sendMessage(client: any, index: number) {
    return new Promise((resolve, reject) => {
        const messageData = {
            userId: `loadTester${index % NUM_CLIENTS}`,
            content: `Test message ${index}`,
            roomId: 'testRoom',
            timestamp: new Date()
        };

        client.emit('message', messageData, (response: any) => {
            if (response?.error) {
                reject(response.error);
            } else {
                resolve(true);
            }
        });

        // 5초 후에도 응답이 없으면 타임아웃
        setTimeout(() => reject(new Error('Timeout')), 5000);
    });
}

async function runLoadTest() {
    console.log('Starting load test...');
    startTime = performance.now();

    // 클라이언트 생성 및 연결
    for (let i = 0; i < NUM_CLIENTS; i++) {
        const socket = io('http://localhost:3000', {
            query: {
                userId: `loadTester${i}`,
                roomId: 'testRoom'
            },
            reconnection: true,
            reconnectionAttempts: 5,
            reconnectionDelay: 1000,
        });

        socket.on('connect', () => {
            console.log(`Client ${i} connected`);
        });

        socket.on('error', (error) => {
            errorCount++;
            console.error(`Client ${i} error:`, error);
        });

        clients.push(socket);
    }

    // 모든 클라이언트가 연결될 때까지 대기
    await sleep(2000);

    const interval = 1000 / (TARGET_RPS / BATCH_SIZE);
    
    const sendInterval = setInterval(async () => {
        const currentTime = performance.now();
        const elapsedSeconds = (currentTime - startTime) / 1000;

        if (elapsedSeconds >= TEST_DURATION) {
            clearInterval(sendInterval);
            await endTest();
            return;
        }

        // BATCH_SIZE만큼 메시지 전송
        const promises = [];
        for (let i = 0; i < BATCH_SIZE; i++) {
            const clientIndex = messageCount % NUM_CLIENTS;
            promises.push(
                sendMessage(clients[clientIndex], messageCount)
                    .then(() => { successCount++; })
                    .catch((error) => {
                        errorCount++;
                        console.error('Send error:', error);
                    })
            );
            messageCount++;
        }

        // 현재 상태 출력
        if (messageCount % 1000 === 0) {
            const currentRPS = messageCount / elapsedSeconds;
            console.log(`Current RPS: ${currentRPS.toFixed(2)}`);
            console.log(`Success: ${successCount}, Errors: ${errorCount}`);
        }

        await Promise.all(promises);
    }, interval);
}

async function endTest() {
    const endTime = performance.now();
    const totalTime = (endTime - startTime) / 1000;
    
    console.log('\nTest completed!');
    console.log(`Total time: ${totalTime.toFixed(2)} seconds`);
    console.log(`Total messages attempted: ${messageCount}`);
    console.log(`Successful messages: ${successCount}`);
    console.log(`Failed messages: ${errorCount}`);
    console.log(`Average RPS: ${(successCount / totalTime).toFixed(2)}`);
    
    // 클라이언트 연결 종료
    clients.forEach(client => client.disconnect());
    
    // MongoDB에 저장된 메시지 수 확인을 위한 시간 대기
    await sleep(2000);
    process.exit(0);
}

runLoadTest().catch(console.error); 