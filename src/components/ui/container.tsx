export default function Container({ children }: { children: React.ReactNode }) {
  return (
    <div className="w-full min-h-[100dvh] bg-[#fbf0dd]">
      <div className="w-full max-w-md mx-auto min-h-[100dvh] relative bg-[#FBF3E5] overflow-x-hidden flex justify-center py-6">
        <div className="flex flex-col items-center justify-center px-6 sm:px-6 md:px-8 w-full">
          {children}
        </div>
      </div>
    </div>
  );
}
