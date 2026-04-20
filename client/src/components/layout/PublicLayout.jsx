import { Menu, Sparkles, X } from "lucide-react";
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

  return (
    <div className="relative min-h-screen overflow-hidden">
      <div className="pointer-events-none absolute inset-0 grid-pattern opacity-30" />
      <header className="sticky top-0 z-40 border-b border-white/10 bg-slate-950/75 backdrop-blur-xl">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
          <Link to="/" className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-amber-400 via-orange-500 to-rose-500 text-white shadow-lg shadow-orange-500/25">
              <Sparkles className="h-5 w-5" />
            </div>
            <div>
              <p className="font-display text-lg font-bold text-white">Smart Dine AI</p>
              <p className="text-xs uppercase tracking-[0.25em] text-slate-400">Restaurant Suite</p>
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
                    isActive ? "text-white" : "text-slate-300 hover:text-white"
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
                <span className="rounded-full border border-white/10 bg-white/5 px-4 py-2 text-xs font-semibold uppercase tracking-[0.22em] text-slate-300">
                  {toSentenceCase(user.role)}
                </span>
                {user.role !== "guest" ? (
                  <Link to="/dashboard" className="btn-secondary bg-white/95">
                    Dashboard
                  </Link>
                ) : (
                  <Link to="/my-activity" className="btn-secondary bg-white/95">
                    My Activity
                  </Link>
                )}
                <button type="button" onClick={logout} className="btn-primary">
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
            className="rounded-2xl border border-white/10 bg-white/5 p-2 text-white md:hidden"
          >
            {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>

        {mobileOpen ? (
          <div className="border-t border-white/10 px-6 py-4 md:hidden">
            <div className="flex flex-col gap-3">
              {publicLinks.map((link) => (
                <NavLink key={link.to} to={link.to} onClick={() => setMobileOpen(false)} className="text-slate-200">
                  {link.label}
                </NavLink>
              ))}
              {user?.role !== "guest" && user ? (
                <Link to="/dashboard" onClick={() => setMobileOpen(false)} className="text-slate-200">
                  Dashboard
                </Link>
              ) : null}
              {user ? (
                <button type="button" onClick={logout} className="btn-primary mt-2">
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
