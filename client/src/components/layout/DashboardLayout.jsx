import { Menu, UserCircle2 } from "lucide-react";
import { useMemo, useState } from "react";
import { Outlet, useLocation } from "react-router-dom";

import { useAuth } from "../../context/AuthContext";
import { dashboardNavigation } from "../../data/navigation";
import { toSentenceCase } from "../../utils/helpers";
import Sidebar from "./Sidebar";

const DashboardLayout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { user, logout } = useAuth();
  const location = useLocation();

  const currentLabel = useMemo(() => {
    const item = dashboardNavigation.find((entry) => location.pathname === entry.to);
    return item?.label || "Dashboard";
  }, [location.pathname]);

  return (
    <div className="relative min-h-screen overflow-hidden bg-[#fff8f3]">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute left-[-8rem] top-[-4rem] h-72 w-72 rounded-full bg-brand-100/70 blur-3xl" />
        <div className="absolute bottom-[-8rem] right-[-6rem] h-80 w-80 rounded-full bg-[#ffd7af]/70 blur-3xl" />
      </div>
      <div className="relative flex min-h-screen">
        <Sidebar userRole={user?.role} open={sidebarOpen} onClose={() => setSidebarOpen(false)} />

        <div className="flex min-h-screen flex-1 flex-col">
          <header className="sticky top-0 z-30 border-b border-brand-100/70 bg-[rgba(255,252,248,0.88)] backdrop-blur-xl">
            <div className="flex items-center justify-between px-4 py-4 md:px-8">
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => setSidebarOpen(true)}
                  className="rounded-2xl border border-brand-100 bg-white/95 p-2 text-brand-700 shadow-sm lg:hidden"
                >
                  <Menu className="h-5 w-5" />
                </button>
                <div>
                  <p className="text-[11px] font-semibold uppercase tracking-[0.32em] text-brand-600">Executive Workspace</p>
                  <h2 className="font-display text-[2.2rem] font-semibold leading-none text-stone-900">{currentLabel}</h2>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="hidden rounded-[24px] border border-brand-100 bg-white/92 px-4 py-2 shadow-sm md:block">
                  <p className="text-[11px] uppercase tracking-[0.28em] text-brand-600">{toSentenceCase(user?.role)}</p>
                  <p className="text-sm font-semibold text-stone-800">{user?.name}</p>
                </div>
                <button type="button" className="btn-secondary py-2" onClick={logout}>
                  <UserCircle2 className="mr-2 h-4 w-4" />
                  Logout
                </button>
              </div>
            </div>
          </header>

          <main className="flex-1 p-4 md:p-8">
            <div className="dashboard-surface rounded-[36px] p-4 shadow-soft md:p-8">
              <Outlet />
            </div>
          </main>
        </div>
      </div>
    </div>
  );
};

export default DashboardLayout;
