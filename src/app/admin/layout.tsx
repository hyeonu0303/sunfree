export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col gap-4 items-center justify-center bg-orange-50 min-h-screen">
      {children}
    </div>
  );
}
