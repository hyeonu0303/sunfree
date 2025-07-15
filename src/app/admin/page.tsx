'use client';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
// Container 제거 - admin layout에서 전체 화면 사용
import { useRouter } from 'next/navigation';

export default function AdminPage() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [error, setError] = useState('');
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      const response = await fetch('/api/admin/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username, password }),
      });

      const data = await response.json();

      if (data.success) {
        setIsLoggedIn(true);
        router.push('/admin/coupon-table');
      } else {
        setError(data.message);
      }
    } catch (error) {
      setError('로그인 중 오류가 발생했습니다.');
      console.error('로그인 오류:', error);
    } finally {
      setIsLoading(false);
    }
  };
  return (
    <div className="min-h-screen flex flex-col">
      <div className="w-full">
        <div className="max-w-md mx-auto py-16">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-black font-gmarket mb-2">
              관리자 로그인
            </h1>
            <p className="text-gray-600 font-pretendard">
              관리자 계정으로 로그인해주세요.
            </p>
          </div>

          <form
            onSubmit={handleLogin}
            className="space-y-6"
          >
            <div>
              <label
                htmlFor="username"
                className="block text-sm font-medium text-gray-700 mb-2 font-pretendard"
              >
                아이디
              </label>
              <Input
                id="username"
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="아이디를 입력하세요"
                required
                disabled={isLoading}
              />
            </div>

            <div>
              <label
                htmlFor="password"
                className="block text-sm font-medium text-gray-700 mb-2 font-pretendard"
              >
                비밀번호
              </label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="비밀번호를 입력하세요"
                required
                disabled={isLoading}
              />
            </div>

            {error && (
              <div className="text-red-600 text-sm font-pretendard">
                {error}
              </div>
            )}

            <Button
              type="submit"
              variant="yellow"
              className="w-full"
              disabled={isLoading}
            >
              {isLoading ? '로그인 중...' : '로그인'}
            </Button>
          </form>
          <div className="w-full mt-4">
            <Button
              variant="black"
              onClick={() => router.push('/')}
            >
              메인 페이지로 이동하기
            </Button>
          </div>

          <div className="mt-6 text-center">
            <p className="text-xs text-gray-500 font-pretendard">
              관리자 계정 정보가 필요하시면 개발자에게 문의하세요.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
