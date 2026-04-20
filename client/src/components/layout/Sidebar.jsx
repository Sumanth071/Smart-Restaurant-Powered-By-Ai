import { PanelLeftClose, UtensilsCrossed } from "lucide-react";
import { NavLink } from "react-router-dom";

import { dashboardNavigation } from "../../data/navigation";
import { joinClasses } from "../../utils/helpers";

const Sidebar = ({ userRole, open, onClose }) => {
  const items = dashboardNavigation.filter((item) => item.roles.includes(userRole));

  return (
    <aside
      className={joinClasses(
        "fixed inset-y-0 left-0 z-40 w-72 transform border-r border-brand-100/80 bg-[linear-gradient(180deg,rgba(255,255,255,0.98),rgba(255,248,240,0.98))] transition duration-300 lg:static lg:translate-x-0",
        open ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
      )}
    >
      <div className="flex h-full flex-col p-5">
        <div className="relative mb-8 overflow-hidden rounded-[28px] border border-brand-100 bg-white/92 p-4 shadow-sm">
          <div className="pointer-events-none absolute right-[-1.5rem] top-[-1.5rem] h-24 w-24 rounded-full bg-brand-100/70 blur-2xl" />
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-brand-500 to-brand-700 text-white shadow-lg shadow-brand-700/20">
                <UtensilsCrossed className="h-5 w-5" />
              </div>
              <div>
                <p className="font-display text-3xl font-semibold leading-none text-stone-900">Smart Dine</p>
                <p className="text-[11px] uppercase tracking-[0.28em] text-brand-600">Restaurant Operations</p>
              </div>
            </div>
            <button type="button" className="rounded-2xl border border-brand-100 bg-white p-2 text-brand-600 lg:hidden" onClick={onClose}>
              <PanelLeftClose className="h-4 w-4" />
            </button>
          </div>
          <div className="mt-4 rounded-2xl border border-brand-100 bg-[#fff8f1] px-3 py-3">
            <p className="text-[11px] uppercase tracking-[0.28em] text-brand-600">Workspace Role</p>
            <p className="mt-1 text-sm font-semibold text-stone-800">{items.length} active modules for this team</p>
          </div>
        </div>

        <nav className="space-y-2 rounded-[28px] border border-brand-100/70 bg-white/80 p-3 shadow-sm">
          {items.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.to === "/dashboard"}
                className={({ isActive }) =>
                  joinClasses(
                    "flex items-center gap-3 rounded-2xl px-4 py-3 text-sm font-semibold transition",
                    isActive
                      ? "bg-gradient-to-r from-brand-50 to-[#fff1e4] text-brand-700 shadow-sm"
                      : "text-stone-600 hover:bg-[#fff4ea] hover:text-stone-900"
                  )
                }
                onClick={onClose}
              >
                <span className="flex h-10 w-10 items-center justify-center rounded-2xl border border-brand-100 bg-white text-brand-600">
                  <Icon className="h-5 w-5" />
                </span>
                {item.label}
              </NavLink>
            );
          })}
        </nav>

        <div className="mt-auto rounded-[30px] border border-brand-100 bg-gradient-to-br from-[#fff6ed] via-white to-[#fff1e3] p-5 shadow-[0_18px_40px_rgba(108,54,16,0.08)]">
          <p className="text-[11px] uppercase tracking-[0.28em] text-brand-600">Operations Platform</p>
          <h3 className="mt-3 font-display text-3xl font-semibold leading-none text-stone-900">Built for premium service flow</h3>
          <p className="mt-3 text-sm leading-6 text-stone-600">
            Reservations, ordering, guest assistance, and analytics stay structured in one clean workspace clients can review with confidence.
          </p>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
