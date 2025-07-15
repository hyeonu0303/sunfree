import { ObjectId } from 'mongodb';
import { getCollection } from './mongodb';
import { Coupon } from '@/types/coupon';

// MongoDB에 저장될 쿠폰 문서 타입
export interface CouponDocument extends Omit<Coupon, 'id'> {
  _id?: ObjectId;
  used?: boolean;
  usedAt?: Date;
  userInfo?: {
    ip?: string;
    userAgent?: string;
  };
}

/**
 * 쿠폰 서비스 클래스
 */
export class CouponService {
  private static readonly COLLECTION_NAME = 'coupons';

  /**
   * 새 쿠폰 생성
   * @param couponData 쿠폰 데이터
   * @param userInfo 사용자 정보 (선택)
   * @returns 생성된 쿠폰
   */
  static async createCoupon(
    couponData: Omit<Coupon, 'id'>,
    userInfo?: { ip?: string; userAgent?: string }
  ): Promise<Coupon> {
    try {
      const collection = await getCollection(this.COLLECTION_NAME);

      const document: CouponDocument = {
        ...couponData,
        used: false,
        userInfo,
      };

      const result = await collection.insertOne(document);

      return {
        id: result.insertedId.toString(),
        ...couponData,
      };
    } catch (error) {
      console.error('쿠폰 생성 실패:', error);
      throw new Error('쿠폰 생성에 실패했습니다.');
    }
  }

  /**
   * 쿠폰 조회 (ID로)
   * @param id 쿠폰 ID
   * @returns 쿠폰 또는 null
   */
  static async getCouponById(id: string): Promise<Coupon | null> {
    try {
      const collection = await getCollection(this.COLLECTION_NAME);
      const document = await collection.findOne({ _id: new ObjectId(id) });

      if (!document) return null;

      return {
        id: document._id.toString(),
        amount: document.amount,
        serialNumber: document.serialNumber,
        createdAt: document.createdAt,
      };
    } catch (error) {
      console.error('쿠폰 조회 실패:', error);
      return null;
    }
  }

  /**
   * 시리얼 번호로 쿠폰 조회
   * @param serialNumber 시리얼 번호
   * @returns 쿠폰 또는 null
   */
  static async getCouponBySerial(serialNumber: string): Promise<Coupon | null> {
    try {
      const collection = await getCollection(this.COLLECTION_NAME);
      const document = await collection.findOne({ serialNumber });

      if (!document) return null;

      return {
        id: document._id.toString(),
        amount: document.amount,
        serialNumber: document.serialNumber,
        createdAt: document.createdAt,
      };
    } catch (error) {
      console.error('쿠폰 조회 실패:', error);
      return null;
    }
  }

  /**
   * 모든 쿠폰 조회 (관리자용)
   * @param page 페이지 번호 (기본값: 1)
   * @param limit 페이지당 개수 (기본값: 20)
   * @returns 쿠폰 배열과 총 개수
   */
  static async getAllCoupons(
    page: number = 1,
    limit: number = 20
  ): Promise<{ coupons: Coupon[]; total: number }> {
    try {
      const collection = await getCollection(this.COLLECTION_NAME);
      const skip = (page - 1) * limit;

      const [documents, total] = await Promise.all([
        collection
          .find({})
          .sort({ createdAt: -1 })
          .skip(skip)
          .limit(limit)
          .toArray(),
        collection.countDocuments(),
      ]);

      const coupons = documents.map((doc) => ({
        id: doc._id.toString(),
        amount: doc.amount,
        serialNumber: doc.serialNumber,
        createdAt: doc.createdAt,
      }));

      return { coupons, total };
    } catch (error) {
      console.error('전체 쿠폰 조회 실패:', error);
      return { coupons: [], total: 0 };
    }
  }

  /**
   * 쿠폰 사용 처리
   * @param id 쿠폰 ID
   * @returns 성공 여부
   */
  static async useCoupon(id: string): Promise<boolean> {
    try {
      const collection = await getCollection(this.COLLECTION_NAME);
      const result = await collection.updateOne(
        { _id: new ObjectId(id), used: { $ne: true } },
        {
          $set: {
            used: true,
            usedAt: new Date(),
          },
        }
      );

      return result.modifiedCount > 0;
    } catch (error) {
      console.error('쿠폰 사용 처리 실패:', error);
      return false;
    }
  }

  /**
   * 쿠폰 삭제
   * @param id 쿠폰 ID
   * @returns 성공 여부
   */
  static async deleteCoupon(id: string): Promise<boolean> {
    try {
      const collection = await getCollection(this.COLLECTION_NAME);
      const result = await collection.deleteOne({ _id: new ObjectId(id) });

      return result.deletedCount > 0;
    } catch (error) {
      console.error('쿠폰 삭제 실패:', error);
      return false;
    }
  }

  /**
   * 쿠폰 통계 조회
   * @returns 쿠폰 통계
   */
  static async getCouponStats() {
    try {
      const collection = await getCollection(this.COLLECTION_NAME);

      const stats = await collection
        .aggregate([
          {
            $group: {
              _id: null,
              totalCoupons: { $sum: 1 },
              usedCoupons: {
                $sum: { $cond: [{ $eq: ['$used', true] }, 1, 0] },
              },
              unusedCoupons: {
                $sum: { $cond: [{ $ne: ['$used', true] }, 1, 0] },
              },
              totalAmount: { $sum: '$amount' },
              usedAmount: {
                $sum: {
                  $cond: [{ $eq: ['$used', true] }, '$amount', 0],
                },
              },
            },
          },
        ])
        .toArray();

      if (stats.length === 0) {
        return {
          totalCoupons: 0,
          usedCoupons: 0,
          unusedCoupons: 0,
          totalAmount: 0,
          usedAmount: 0,
        };
      }

      return stats[0];
    } catch (error) {
      console.error('쿠폰 통계 조회 실패:', error);
      return {
        totalCoupons: 0,
        usedCoupons: 0,
        unusedCoupons: 0,
        totalAmount: 0,
        usedAmount: 0,
      };
    }
  }
}
