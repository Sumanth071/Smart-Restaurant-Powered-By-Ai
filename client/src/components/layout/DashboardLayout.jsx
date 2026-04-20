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
    <div className="min-h-screen bg-slate-100">
      <div className="flex min-h-screen">
        <Sidebar userRole={user?.role} open={sidebarOpen} onClose={() => setSidebarOpen(false)} />

        <div className="flex min-h-screen flex-1 flex-col">
          <header className="sticky top-0 z-30 border-b border-slate-200 bg-white/90 backdrop-blur-xl">
            <div className="flex items-center justify-between px-4 py-4 md:px-8">
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => setSidebarOpen(true)}
                  className="rounded-2xl border border-slate-200 p-2 text-slate-600 lg:hidden"
                >
                  <Menu className="h-5 w-5" />
                </button>
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.25em] text-slate-400">Operations</p>
                  <h2 className="font-display text-2xl font-bold text-slate-900">{currentLabel}</h2>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="hidden rounded-2xl border border-slate-200 bg-slate-50 px-4 py-2 md:block">
                  <p className="text-xs uppercase tracking-[0.25em] text-slate-400">{toSentenceCase(user?.role)}</p>
                  <p className="text-sm font-semibold text-slate-800">{user?.name}</p>
                </div>
                <button type="button" className="btn-secondary py-2" onClick={logout}>
                  <UserCircle2 className="mr-2 h-4 w-4" />
                  Logout
                </button>
              </div>
            </div>
          </header>

          <main className="flex-1 p-4 md:p-8">
            <div className="dashboard-surface rounded-[32px] p-4 shadow-soft md:p-8">
              <Outlet />
            </div>
          </main>
        </div>
      </div>
    </div>
  );
};

export default DashboardLayout;
