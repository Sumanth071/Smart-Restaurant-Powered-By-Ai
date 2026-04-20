import { PanelLeftClose, Sparkles } from "lucide-react";
import { NavLink } from "react-router-dom";

import { dashboardNavigation } from "../../data/navigation";
import { joinClasses } from "../../utils/helpers";

const Sidebar = ({ userRole, open, onClose }) => {
  const items = dashboardNavigation.filter((item) => item.roles.includes(userRole));

  return (
    <aside
      className={joinClasses(
        "fixed inset-y-0 left-0 z-40 w-72 transform border-r border-slate-200 bg-white transition duration-300 lg:static lg:translate-x-0",
        open ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
      )}
    >
      <div className="flex h-full flex-col p-5">
        <div className="mb-8 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-amber-400 via-orange-500 to-rose-500 text-white">
              <Sparkles className="h-5 w-5" />
            </div>
            <div>
              <p className="font-display text-lg font-bold text-slate-900">Smart Dine AI</p>
              <p className="text-xs uppercase tracking-[0.25em] text-slate-400">Control Center</p>
            </div>
          </div>
          <button type="button" className="rounded-2xl border border-slate-200 p-2 text-slate-500 lg:hidden" onClick={onClose}>
            <PanelLeftClose className="h-4 w-4" />
          </button>
        </div>

        <nav className="space-y-2">
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
                      ? "bg-gradient-to-r from-amber-50 to-orange-50 text-amber-700 shadow-sm"
                      : "text-slate-500 hover:bg-slate-50 hover:text-slate-900"
                  )
                }
                onClick={onClose}
              >
                <Icon className="h-5 w-5" />
                {item.label}
              </NavLink>
            );
          })}
        </nav>

        <div className="mt-auto rounded-3xl bg-slate-950 p-5 text-white">
          <p className="text-xs uppercase tracking-[0.25em] text-slate-400">AI Layer</p>
          <h3 className="mt-3 text-lg font-bold">Presentation-Ready Demo</h3>
          <p className="mt-2 text-sm text-slate-300">
            Showcase menu intelligence, chatbot support, and peak-hour analytics from one modern dashboard.
          </p>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
