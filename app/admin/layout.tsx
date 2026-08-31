import { ReactNode } from "react";
import { AdminSidebar } from "@/components/admin/AdminSidebar";

export default function AdminLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen bg-black text-white">
      <div className="mx-auto flex max-w-[1440px] gap-6 px-4 py-10 sm:px-6 lg:px-10">
        <AdminSidebar />
        <div className="flex-1 rounded-3xl border border-white/10 bg-black/70 p-6">
          {children}
        </div>
      </div>
    </div>
  );
}
