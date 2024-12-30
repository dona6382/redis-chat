# Real-time Chat System with NestJS and Redis

고성능 실시간 채팅 시스템으로, 초당 1000건 이상의 메시지 처리가 가능한 확장 가능한 아키텍처를 제공합니다.

## 기술 스택
- **Backend Framework**: NestJS
- **실시간 통신**: Socket.IO
- **메시지 브로커**: Redis
- **데이터베이스**: MongoDB
- **언어**: TypeScript

## 시스템 요구사항
- **Node.js**: 18.x 이상
- **MongoDB**: 8.x 이상
- **Redis**: 6.x 이상

## 설치 및 실행

### 1. 프로젝트 생성
#### NestJS CLI 설치
```bash
npm i -g @nestjs/cli
```
#### 프로젝트 생성
```bash
nest new redis-chat
cd redis-chat
```
#### 필요한 의존성 설치
```bash
npm install @nestjs/websockets @nestjs/platform-socket.io
npm install @nestjs/mongoose mongoose
npm install redis
npm install @types/socket.io --save-dev
```

### 2. MongoDB 설정
#### MongoDB 연결 확인
```bash
mongosh --port 27017
```
#### 데이터베이스 및 컬렉션 생성
```bash
use redis-chat
db.createCollection('users')
db.createCollection('messages')
```
#### 인덱스 생성
```bash
db.messages.createIndex({ roomId: 1, createdAt: -1 })
db.messages.createIndex({ userId: 1 })
db.users.createIndex({ username: 1 }, { unique: true })
db.users.createIndex({ isOnline: 1 })
```

### 3. 애플리케이션 실행
#### 개발 모드
```bash
npm run start:dev
```
#### 프로덕션 모드
```bash
npm run build
npm run start:prod
```

## 프로젝트 구조
```
src/
├── chat/
│   ├── chat.gateway.ts # WebSocket 처리
│   ├── chat.module.ts # 채팅 모듈
│   ├── chat.service.ts # 채팅 비즈니스 로직
│   └── dto/
│       └── chat-message.dto.ts
├── users/
│   ├── user.module.ts
│   ├── user.service.ts
│   └── schemas/
│       └── user.schema.ts
├── messages/
│   ├── message.module.ts
│   ├── message.service.ts
│   └── schemas/
│       └── message.schema.ts
└── app.module.ts
```

## 주요 기능
- 실시간 1:N 채팅
- 초당 1000건 이상의 메시지 처리
- 채팅방 기반 메시지 브로드캐스팅
- 메시지 영구 저장
- 실시간 사용자 상태 관리
- 메시지 암호화

## 성능 테스트

### 부하 테스트 실행
```bash
ts-node test/load-test.ts
```

### 테스트 결과 확인
#### MongoDB에서 저장된 메시지 수 확인
```bash
mongosh
use redis-chat
db.messages.countDocuments()
```

#### K6 부하 테스트 결과 확인
mac: brew install k6
windows: winget install k6

```bash
k6 run src/test/load-test.ts
```

## 성능 최적화
- **Redis Pub/Sub**을 통한 메시지 브로드캐스팅
- **MongoDB 인덱싱**
- **클러스터 모드 지원**
- **메시지 배치 처리**
- **비동기 메시지 저장**

## 트러블슈팅

### 성능 문제 해결
- **클러스터 모드 활성화**
- **배치 사이즈 조정**
- **인덱스 최적화**

## 확장 가능성

### 처리속도 향상을 위한 확장
- Redis Cluster 구성
- MongoDB Sharding
- Load Balancer 설정

### 기능 확장 사항
- 사용자 인증
- 채팅방 관리
- 사용자 접속 로그
- k6 부하 테스트