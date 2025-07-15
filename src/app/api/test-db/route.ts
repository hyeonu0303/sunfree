import { NextRequest, NextResponse } from 'next/server';
import { isConnected, getDatabase, getCollection } from '@/lib/mongodb';

// GET 요청 - 데이터베이스 연결 테스트
export async function GET() {
  try {
    // 연결 상태 확인
    const connected = await isConnected();

    if (!connected) {
      return NextResponse.json(
        {
          success: false,
          message: 'MongoDB 연결에 실패했습니다.',
        },
        { status: 500 }
      );
    }

    // 데이터베이스 정보 가져오기
    const db = await getDatabase();
    const collections = await db.listCollections().toArray();

    return NextResponse.json({
      success: true,
      message: 'MongoDB 연결이 성공했습니다.',
      database: db.databaseName,
      collections: collections.map((col) => col.name),
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Database test error:', error);
    return NextResponse.json(
      {
        success: false,
        message: '데이터베이스 테스트 중 오류가 발생했습니다.',
        error: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

// POST 요청 - 테스트 데이터 삽입
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // 테스트 컬렉션에 데이터 삽입
    const collection = await getCollection('test_collection');
    const result = await collection.insertOne({
      ...body,
      createdAt: new Date(),
      type: 'test_data',
    });

    return NextResponse.json({
      success: true,
      message: '테스트 데이터가 성공적으로 삽입되었습니다.',
      insertedId: result.insertedId,
      data: body,
    });
  } catch (error) {
    console.error('Insert test data error:', error);
    return NextResponse.json(
      {
        success: false,
        message: '테스트 데이터 삽입 중 오류가 발생했습니다.',
        error: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
