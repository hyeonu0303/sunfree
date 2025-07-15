import { NextRequest, NextResponse } from 'next/server';

// 간단한 하드코딩된 관리자 계정 (실제 운영에서는 환경변수나 DB 사용 권장)
const ADMIN_CREDENTIALS = {
  username: process.env.NEXT_PUBLIC_ADMIN_ID,
  password: process.env.NEXT_PUBLIC_ADMIN_PASSWORD,
};

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { username, password } = body;

    // 입력값 검증
    if (!username || !password) {
      return NextResponse.json(
        {
          success: false,
          message: '아이디와 비밀번호를 입력해주세요.',
        },
        { status: 400 }
      );
    }

    // 관리자 계정 확인
    if (
      username === ADMIN_CREDENTIALS.username &&
      password === ADMIN_CREDENTIALS.password
    ) {
      return NextResponse.json({
        success: true,
        message: '로그인에 성공했습니다.',
      });
    } else {
      return NextResponse.json(
        {
          success: false,
          message: '아이디 또는 비밀번호가 올바르지 않습니다.',
        },
        { status: 401 }
      );
    }
  } catch (error) {
    console.error('로그인 처리 오류:', error);
    return NextResponse.json(
      {
        success: false,
        message: '서버 오류가 발생했습니다.',
      },
      { status: 500 }
    );
  }
}
