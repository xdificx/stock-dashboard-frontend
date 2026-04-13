import { Outlet, NavLink } from "react-router-dom";
import { LayoutDashboard, Briefcase, BarChart2 } from "lucide-react";
import { cn } from "@/lib/utils";

const NAV_ITEMS = [
  { to: "/",          label: "대시보드",    icon: LayoutDashboard },
  { to: "/portfolio", label: "포트폴리오",  icon: Briefcase },
  { to: "/chart",     label: "차트",       icon: BarChart2 },
];

export default function Layout() {
  return (
    <div className="flex h-screen overflow-hidden">
      {/* 사이드 네비게이션 */}
      <aside className="w-56 shrink-0 flex flex-col bg-card border-r border-border">
        {/* 로고 */}
        <div className="h-14 flex items-center px-5 border-b border-border">
          <span className="text-primary font-bold text-lg tracking-tight">
            📈 StockBoard
          </span>
        </div>

        {/* 메뉴 */}
        <nav className="flex-1 py-4 px-3 space-y-1">
          {NAV_ITEMS.map(({ to, label, icon: Icon }) => (
            <NavLink
              key={to}
              to={to}
              end={to === "/"}
              className={({ isActive }) =>
                cn(
                  "flex items-center gap-3 px-3 py-2.5 rounded-md text-sm font-medium transition-colors",
                  isActive
                    ? "bg-primary/15 text-primary"
                    : "text-muted-foreground hover:bg-accent hover:text-foreground"
                )
              }
            >
              <Icon size={18} />
              {label}
            </NavLink>
          ))}
        </nav>

        {/* 하단 */}
        <div className="px-5 py-4 border-t border-border">
          <p className="text-xs text-muted-foreground">
            Data: yfinance · KRX
          </p>
        </div>
      </aside>

      {/* 메인 콘텐츠 */}
      <main className="flex-1 overflow-y-auto bg-background">
        <Outlet />
      </main>
    </div>
  );
}
