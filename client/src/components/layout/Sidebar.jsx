import { PanelLeftClose, UtensilsCrossed } from "lucide-react";
import { NavLink } from "react-router-dom";

import { dashboardNavigation } from "../../data/navigation";
import { joinClasses } from "../../utils/helpers";

const Sidebar = ({ userRole, open, onClose }) => {
  const items = dashboardNavigation.filter((item) => item.roles.includes(userRole));

  return (
    <aside
      className={joinClasses(
        "fixed inset-y-0 left-0 z-40 w-72 transform border-r border-stone-200/80 bg-[rgba(255,251,247,0.96)] transition duration-300 lg:static lg:translate-x-0",
        open ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
      )}
    >
      <div className="flex h-full flex-col p-5">
        <div className="mb-8 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-brand-500 to-brand-700 text-white">
              <UtensilsCrossed className="h-5 w-5" />
            </div>
            <div>
              <p className="font-display text-3xl font-semibold leading-none text-stone-900">Smart Dine</p>
              <p className="text-xs uppercase tracking-[0.25em] text-stone-400">Restaurant Operations</p>
            </div>
          </div>
          <button type="button" className="rounded-2xl border border-stone-200 p-2 text-stone-500 lg:hidden" onClick={onClose}>
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
                      ? "bg-brand-50 text-brand-700 shadow-sm"
                      : "text-stone-500 hover:bg-stone-100/70 hover:text-stone-900"
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

        <div className="mt-auto rounded-3xl bg-[#241914] p-5 text-white shadow-lg">
          <p className="text-xs uppercase tracking-[0.25em] text-stone-400">Service Intelligence</p>
          <h3 className="mt-3 font-display text-3xl font-semibold leading-none">Built for daily operations</h3>
          <p className="mt-3 text-sm leading-6 text-stone-300">
            Reservations, ordering, service flow, and guest insight all live in one grounded admin workspace.
          </p>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
