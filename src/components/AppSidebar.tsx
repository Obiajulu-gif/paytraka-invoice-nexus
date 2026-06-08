import {
  BarChart3,
  Building2,
  FileEdit,
  FileText,
  LayoutDashboard,
  LogOut,
  Package,
  Receipt,
  Settings,
  ShieldCheck,
  Users,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { NavLink } from "@/components/NavLink";
import { cn } from "@/lib/utils";

const menuItems = [
  { title: "Dashboard", url: "/dashboard", icon: LayoutDashboard },
  { title: "Customers", url: "/customers", icon: Users },
  { title: "Products & Services", url: "/products", icon: Package },
  { title: "Invoices", url: "/invoices", icon: FileText },
  { title: "Receipts", url: "/receipts", icon: Receipt },
  { title: "Credit/Debit Notes", url: "/adjustments", icon: FileEdit },
  { title: "Reports", url: "/reports", icon: BarChart3 },
  { title: "Settings", url: "/settings", icon: Settings },
];

interface AppSidebarProps {
  className?: string;
  onNavigate?: () => void;
  onLogout: () => void;
}

export function AppSidebar({ className, onNavigate, onLogout }: AppSidebarProps) {
  return (
    <aside
      className={cn(
        "flex h-full min-h-screen w-72 flex-col bg-primary text-white",
        className,
      )}
    >
      <div className="border-b border-white/10 px-5 py-5">
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-white/15 text-white shadow-lg shadow-blue-950/30">
            <FileText className="h-5 w-5" />
          </div>
          <div>
            <p className="text-base font-semibold tracking-tight">
              Paytraka
            </p>
            <p className="text-xs text-white/70">Invoice Nexus</p>
          </div>
        </div>
      </div>
      <nav className="flex-1 space-y-1 px-3 py-5">
        {menuItems.map((item) => (
          <NavLink
            key={item.url}
            to={item.url}
            end={item.url === "/dashboard"}
            onClick={onNavigate}
            className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-white/75 transition hover:bg-white/10 hover:text-white"
            activeClassName="bg-white text-slate-950 shadow-sm hover:bg-white hover:text-slate-950"
          >
            <item.icon className="h-4 w-4" />
            <span>{item.title}</span>
          </NavLink>
        ))}
      </nav>

      <div className="border-t border-white/10 p-4">
        <div className="mb-4 flex items-center gap-3 rounded-xl bg-white/5 p-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-white text-slate-950">
            <Building2 className="h-4 w-4" />
          </div>
          <div className="min-w-0">
            <p className="truncate text-sm font-medium">Demo Business</p>
            <p className="truncate text-xs text-white/65">admin@paytraka.com</p>
          </div>
        </div>
        <Button
          variant="ghost"
          className="w-full justify-start text-white/75 hover:bg-white/10 hover:text-white"
          onClick={onLogout}
        >
          <LogOut className="mr-2 h-4 w-4" />
          Logout
        </Button>
      </div>
    </aside>
  );
}
