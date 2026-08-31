"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import {
  BarChart3,
  BookOpen,
  Building2,
  LayoutGrid,
  LineChart,
  Mail,
  Package,
  Sparkles,
  Users,
} from "lucide-react";

const navItems = [
  { href: "/admin", label: "Overview", icon: LayoutGrid },
  { href: "/admin/programs", label: "Programs", icon: BookOpen },
  { href: "/admin/store", label: "Store", icon: Package },
  { href: "/admin/communications", label: "Comms", icon: Mail },
];

export const AdminSidebar = () => {
  const pathname = usePathname();

  return (
    <aside className="hidden w-64 flex-shrink-0 border-r border-black/15 dark:border-white/10 bg-white/80 dark:bg-black/80 p-6 md:block">
      <div className="mb-8 text-xs uppercase tracking-[0.3em] text-black/60 dark:text-white/40">OKHub Admin</div>
      <nav className="space-y-2">
        {navItems.map((item) => {
          const active = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 rounded-2xl border px-3 py-2 text-sm transition",
                active
                  ? "border-[var(--gold-primary)] text-black dark:text-white"
                  : "border-black/15 dark:border-white/5 text-black/60 dark:text-white/60 hover:border-black/20 dark:border-white/20 hover:text-black dark:text-white"
              )}
            >
              <item.icon className="h-4 w-4" />
              {item.label}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
};
