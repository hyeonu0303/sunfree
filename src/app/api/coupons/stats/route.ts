import { NextRequest, NextResponse } from 'next/server';
import { CouponService } from '@/lib/coupon.service';

// GET 요청 - 쿠폰 전체 통계 조회
export async function GET(request: NextRequest) {
  try {
    // 전체 쿠폰 통계 조회
    const stats = await CouponService.getCouponStats();

    return NextResponse.json({
      success: true,
      data: stats,
      message: '쿠폰 통계를 조회했습니다.',
    });
  } catch (error) {
    console.error('쿠폰 통계 조회 오류:', error);
    return NextResponse.json(
      {
        success: false,
        message: '쿠폰 통계 조회 중 오류가 발생했습니다.',
        error: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
