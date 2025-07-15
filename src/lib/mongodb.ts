import { MongoClient, Db } from 'mongodb';

// 전역에서 MongoDB 클라이언트를 관리하기 위한 인터페이스
interface GlobalMongo {
  client?: MongoClient;
  promise?: Promise<MongoClient>;
}

// 전역 객체에 MongoDB 클라이언트 저장
declare global {
  var _mongoClient: GlobalMongo | undefined;
}

// MongoDB 연결 URI와 데이터베이스 이름
const MONGODB_URI = process.env.NEXT_PUBLIC_MONGODB_URI;
const MONGODB_DB = process.env.NEXT_PUBLIC_MONGODB_DB;

if (!MONGODB_URI) {
  throw new Error('MONGODB_URI 환경변수를 설정해주세요.');
}

if (!MONGODB_DB) {
  throw new Error('MONGODB_DB 환경변수를 설정해주세요.');
}

// 개발 환경에서 hot reload 시 연결이 계속 증가하는 것을 방지
let cached = global._mongoClient || { client: undefined, promise: undefined };

if (!global._mongoClient) {
  global._mongoClient = cached;
}

/**
 * MongoDB 클라이언트 연결
 * @returns Promise<MongoClient>
 */
export async function connectToDatabase(): Promise<MongoClient> {
  if (cached.client) {
    return cached.client;
  }

  if (!cached.promise) {
    const options = {
      maxPoolSize: 10, // 최대 연결 수
      serverSelectionTimeoutMS: 5000, // 서버 선택 타임아웃
      socketTimeoutMS: 45000, // 소켓 타임아웃
      connectTimeoutMS: 10000, // 연결 타임아웃
      tls: true, // TLS 사용
      tlsAllowInvalidCertificates: true, // 개발환경에서만 사용
      tlsAllowInvalidHostnames: true, // 개발환경에서만 사용
    };

    cached.promise = MongoClient.connect(MONGODB_URI!, options)
      .then((client) => {
        console.log('MongoDB에 성공적으로 연결되었습니다.');
        return client;
      })
      .catch((error) => {
        console.error('MongoDB 연결 실패:', error);
        throw error;
      });
  }

  try {
    cached.client = await cached.promise;
  } catch (error) {
    cached.promise = undefined;
    throw error;
  }

  return cached.client;
}

/**
 * 특정 데이터베이스 반환
 * @returns Promise<Db>
 */
export async function getDatabase(): Promise<Db> {
  const client = await connectToDatabase();
  return client.db(MONGODB_DB);
}

/**
 * 특정 컬렉션 반환
 * @param collectionName 컬렉션 이름
 * @returns Promise<Collection>
 */
export async function getCollection(collectionName: string) {
  const db = await getDatabase();
  return db.collection(collectionName);
}

/**
 * 연결 상태 확인
 * @returns Promise<boolean>
 */
export async function isConnected(): Promise<boolean> {
  try {
    const client = await connectToDatabase();
    await client.db().admin().ping();
    return true;
  } catch (error) {
    console.error('MongoDB 연결 상태 확인 실패:', error);
    return false;
  }
}

/**
 * 연결 종료
 */
export async function closeConnection(): Promise<void> {
  if (cached.client) {
    await cached.client.close();
    cached.client = undefined;
    cached.promise = undefined;
    console.log('MongoDB 연결이 종료되었습니다.');
  }
}

// 애플리케이션 종료 시 연결 정리
process.on('SIGINT', async () => {
  await closeConnection();
  process.exit(0);
});

process.on('SIGTERM', async () => {
  await closeConnection();
  process.exit(0);
});
