import Link from 'next/link';
import { Button } from '@/components/ui/button';
import Container from '@/components/ui/container';

export default function NotFound() {
  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center">
      <Container>
        <div className="text-center">
          {/* 찡그린 표정 */}
          <div className="text-8xl mb-6">🤔</div>

          {/* 404 타이틀 */}
          <h1 className="text-4xl font-bold text-gray-800 font-gmarket mb-4">
            404
          </h1>

          {/* 메시지 */}
          <p className="text-xl text-gray-600 font-pretendard mb-2">
            페이지를 찾을 수 없습니다
          </p>

          <p className="text-sm text-gray-500 font-pretendard mb-8">
            요청하신 페이지가 존재하지 않거나 이동되었을 수 있습니다.
          </p>

          {/* 홈으로 돌아가기 버튼 */}
          <Link href="/">
            <Button variant="black">홈으로 돌아가기</Button>
          </Link>
        </div>
      </Container>
    </div>
  );
}
