import Footer from '@/components/footer';
import Header from '@/components/header';
import SlotMachine from '@/components/slot-machine';

// 메인 슬롯머신 컴포넌트
export default function Home() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-cream">
      <Header />
      <SlotMachine />
      <Footer />
    </div>
  );
}
