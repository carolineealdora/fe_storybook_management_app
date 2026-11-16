import { Sidebar } from "@/features/shell/Sidebar";

export default function AdminLayout({ children }: LayoutProps<"/">) {
  return (
    <div className="flex min-h-screen flex-1 flex-col md:flex-row">
      <Sidebar />
      <main className="flex min-w-0 flex-1 flex-col gap-5 px-4 py-6 md:px-8 md:py-7">
        {children}
      </main>
    </div>
  );
}
