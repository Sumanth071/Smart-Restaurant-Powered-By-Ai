import { Menu, UtensilsCrossed, X } from "lucide-react";
import { useState } from "react";
import { Link, NavLink, Outlet } from "react-router-dom";

import { useAuth } from "../../context/AuthContext";
import { joinClasses, toSentenceCase } from "../../utils/helpers";

const links = [
  { to: "/", label: "Home" },
  { to: "/book-table", label: "Book Table" },
  { to: "/order-online", label: "Order Online" },
  { to: "/support", label: "Support" },
];

const PublicLayout = () => {
  const [mobileOpen, setMobileOpen] = useState(false);
  const { user, logout } = useAuth();
  const publicLinks = user?.role === "guest" ? [...links, { to: "/my-activity", label: "My Activity" }] : links;
  const handleLogout = () => {
    setMobileOpen(false);
    logout();
  };

  return (
    <div className="relative min-h-screen overflow-hidden">
      <div className="pointer-events-none absolute inset-0 grid-pattern opacity-40" />
      <header className="sticky top-0 z-40 border-b border-brand-100/80 bg-white/88 backdrop-blur-xl">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
          <Link to="/" className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-brand-500 to-brand-700 text-white shadow-lg shadow-brand-700/20">
              <UtensilsCrossed className="h-5 w-5" />
            </div>
            <div>
              <p className="font-display text-3xl font-semibold leading-none text-stone-900">Smart Dine</p>
              <p className="text-xs uppercase tracking-[0.25em] text-brand-600">Guest and Service Platform</p>
            </div>
          </Link>

          <nav className="hidden items-center gap-8 md:flex">
            {publicLinks.map((link) => (
              <NavLink
                key={link.to}
                to={link.to}
                className={({ isActive }) =>
                  joinClasses(
                    "text-sm font-medium transition",
                    isActive ? "text-brand-700" : "text-stone-600 hover:text-brand-700"
                  )
                }
              >
                {link.label}
              </NavLink>
            ))}
          </nav>

          <div className="hidden items-center gap-3 md:flex">
            {user ? (
              <>
                <span className="rounded-full border border-brand-100 bg-brand-50 px-4 py-2 text-xs font-semibold uppercase tracking-[0.22em] text-brand-700">
                  {toSentenceCase(user.role)}
                </span>
                {user.role !== "guest" ? (
                  <Link to="/dashboard" className="btn-secondary">
                    Dashboard
                  </Link>
                ) : (
                  <Link to="/my-activity" className="btn-secondary">
                    My Activity
                  </Link>
                )}
                <button type="button" onClick={handleLogout} className="btn-primary">
                  Logout
                </button>
              </>
            ) : (
              <Link to="/login" className="btn-primary">
                Login
              </Link>
            )}
          </div>

          <button
            type="button"
            onClick={() => setMobileOpen((current) => !current)}
            className="rounded-2xl border border-brand-100 bg-white p-2 text-brand-700 md:hidden"
          >
            {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>

        {mobileOpen ? (
          <div className="border-t border-brand-100 px-6 py-4 md:hidden">
            <div className="flex flex-col gap-3">
              {publicLinks.map((link) => (
                <NavLink key={link.to} to={link.to} onClick={() => setMobileOpen(false)} className="text-stone-700">
                  {link.label}
                </NavLink>
              ))}
              {user?.role !== "guest" && user ? (
                <Link to="/dashboard" onClick={() => setMobileOpen(false)} className="text-stone-700">
                  Dashboard
                </Link>
              ) : null}
              {user ? (
                <button type="button" onClick={handleLogout} className="btn-primary mt-2">
                  Logout
                </button>
              ) : (
                <Link to="/login" onClick={() => setMobileOpen(false)} className="btn-primary mt-2">
                  Login
                </Link>
              )}
            </div>
          </div>
        ) : null}
      </header>

      <main className="relative z-10">
        <Outlet />
      </main>
    </div>
  );
};

export default PublicLayout;
