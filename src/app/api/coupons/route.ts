import { NextRequest, NextResponse } from 'next/server';
import { headers } from 'next/headers';
import { CouponService } from '@/lib/coupon.service';

// GET 요청 - 쿠폰 목록 조회
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');

    // 전체 쿠폰 조회 (관리자용)
    const result = await CouponService.getAllCoupons(page, limit);

    return NextResponse.json({
      success: true,
      data: result.coupons,
      pagination: {
        page,
        limit,
        total: result.total,
        totalPages: Math.ceil(result.total / limit),
      },
      message: '쿠폰 목록을 조회했습니다.',
    });
  } catch (error) {
    console.error('쿠폰 조회 오류:', error);
    return NextResponse.json(
      {
        success: false,
        message: '쿠폰 조회 중 오류가 발생했습니다.',
        error: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

// POST 요청 - 새 쿠폰 생성
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { amount, serialNumber } = body;

    // 입력 검증
    if (!amount || !serialNumber) {
      return NextResponse.json(
        {
          success: false,
          message: '금액과 시리얼 번호는 필수입니다.',
        },
        { status: 400 }
      );
    }

    // 사용자 정보 추출

    // 중복 시리얼 번호 확인
    const existingCoupon = await CouponService.getCouponBySerial(serialNumber);
    if (existingCoupon) {
      return NextResponse.json(
        {
          success: false,
          message: '이미 존재하는 시리얼 번호입니다.',
        },
        { status: 409 }
      );
    }

    // 새 쿠폰 생성
    const newCoupon = await CouponService.createCoupon({
      amount: parseInt(amount),
      serialNumber,
      createdAt: new Date(),
    });

    return NextResponse.json({
      success: true,
      data: newCoupon,
      message: '쿠폰이 성공적으로 생성되었습니다.',
    });
  } catch (error) {
    console.error('쿠폰 생성 오류:', error);
    return NextResponse.json(
      {
        success: false,
        message: '쿠폰 생성 중 오류가 발생했습니다.',
        error: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
