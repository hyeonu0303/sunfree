import { NextRequest, NextResponse } from 'next/server';
import { headers } from 'next/headers';
import { CouponService } from '@/lib/coupon.service';

// POST 요청 - 새 쿠폰 생성
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { amount, serialNumber, createdAt, expiresAt } = body;

    // 필수 필드 검증
    if (!amount || !serialNumber || !createdAt || !expiresAt) {
      return NextResponse.json(
        {
          success: false,
          message: '필수 필드가 누락되었습니다.',
        },
        { status: 400 }
      );
    }

    // 쿠폰 생성
    const coupon = await CouponService.createCoupon({
      amount: Number(amount),
      serialNumber,
      createdAt: new Date(createdAt),
      expiresAt: new Date(expiresAt),
    });

    return NextResponse.json({
      success: true,
      data: coupon,
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

// DELETE 요청 - 쿠폰 삭제
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    const all = searchParams.get('all');

    // 전체 삭제 요청인 경우
    if (all === 'true') {
      const deletedCount = await CouponService.deleteAllCoupons();

      return NextResponse.json({
        success: true,
        message: `총 ${deletedCount}개의 쿠폰이 삭제되었습니다.`,
        deletedCount,
      });
    }

    // 개별 삭제 요청인 경우
    if (!id) {
      return NextResponse.json(
        {
          success: false,
          message: '쿠폰 ID가 필요합니다.',
        },
        { status: 400 }
      );
    }

    const success = await CouponService.deleteCoupon(id);

    if (success) {
      return NextResponse.json({
        success: true,
        message: '쿠폰이 성공적으로 삭제되었습니다.',
      });
    } else {
      return NextResponse.json(
        {
          success: false,
          message: '쿠폰을 찾을 수 없거나 삭제할 수 없습니다.',
        },
        { status: 404 }
      );
    }
  } catch (error) {
    console.error('쿠폰 삭제 오류:', error);
    return NextResponse.json(
      {
        success: false,
        message: '쿠폰 삭제 중 오류가 발생했습니다.',
        error: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

// PATCH 요청 - 쿠폰 사용 상태 업데이트
export async function PATCH(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    const body = await request.json();
    const { isUsed } = body;

    if (!id) {
      return NextResponse.json(
        {
          success: false,
          message: '쿠폰 ID가 필요합니다.',
        },
        { status: 400 }
      );
    }

    if (typeof isUsed !== 'boolean') {
      return NextResponse.json(
        {
          success: false,
          message: 'isUsed 값은 boolean이어야 합니다.',
        },
        { status: 400 }
      );
    }

    const success = await CouponService.updateCouponUsedStatus(id, isUsed);

    if (success) {
      return NextResponse.json({
        success: true,
        message: isUsed
          ? '쿠폰이 사용 완료로 표시되었습니다.'
          : '쿠폰이 미사용으로 표시되었습니다.',
      });
    } else {
      return NextResponse.json(
        {
          success: false,
          message: '쿠폰을 찾을 수 없거나 업데이트할 수 없습니다.',
        },
        { status: 404 }
      );
    }
  } catch (error) {
    console.error('쿠폰 상태 업데이트 오류:', error);
    return NextResponse.json(
      {
        success: false,
        message: '쿠폰 상태 업데이트 중 오류가 발생했습니다.',
        error: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
