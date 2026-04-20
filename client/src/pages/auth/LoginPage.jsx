import { ArrowRight, Clock3, ShieldCheck, UtensilsCrossed } from "lucide-react";
import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";

import { useAuth } from "../../context/AuthContext";
import { demoAccounts } from "../../data/demoAccounts";

const LoginPage = () => {
  const navigate = useNavigate();
  const { user, login, register } = useAuth();
  const [mode, setMode] = useState("login");
  const [formValues, setFormValues] = useState({
    name: "",
    email: "",
    phone: "",
    password: "",
  });
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!user) {
      return;
    }

    if (user.role === "guest") {
      navigate("/book-table", { replace: true });
      return;
    }

    navigate("/dashboard", { replace: true });
  }, [navigate, user]);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setFormValues((current) => ({ ...current, [name]: value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setSubmitting(true);
    setError("");

    try {
      const currentUser =
        mode === "login"
          ? await login({ email: formValues.email, password: formValues.password })
          : await register(formValues);

      navigate(currentUser.role === "guest" ? "/book-table" : "/dashboard");
    } catch (requestError) {
      setError(requestError.response?.data?.message || "Unable to complete authentication.");
    } finally {
      setSubmitting(false);
    }
  };

  const applyDemoAccount = (account) => {
    setMode("login");
    setFormValues((current) => ({
      ...current,
      email: account.email,
      password: account.password,
    }));
  };

  return (
    <section className="relative overflow-hidden px-6 py-10 md:px-10 md:py-16">
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute left-[-8rem] top-12 h-56 w-56 rounded-full bg-brand-200/30 blur-3xl" />
        <div className="absolute bottom-0 right-[-6rem] h-72 w-72 rounded-full bg-brand-100/50 blur-3xl" />
        <div className="absolute left-1/2 top-10 h-32 w-32 -translate-x-1/2 rounded-full bg-white/50 blur-3xl" />
      </div>

      <div className="relative mx-auto grid min-h-[78vh] max-w-6xl items-center gap-8 xl:grid-cols-[0.98fr_0.82fr]">
        <div className="relative hidden overflow-hidden rounded-[40px] border border-brand-100 bg-gradient-to-br from-white via-[#fff8f2] to-[#ffe5ce] p-8 text-stone-900 shadow-[0_30px_90px_rgba(244,123,32,0.16)] xl:block">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(244,123,32,0.18),transparent_34%),radial-gradient(circle_at_bottom_right,rgba(255,199,155,0.35),transparent_28%)]" />
          <div className="absolute inset-0 bg-[linear-gradient(120deg,rgba(255,255,255,0.2),transparent_36%,rgba(255,255,255,0.16)_58%,transparent_76%)]" />
          <div className="relative flex h-full min-h-[620px] flex-col justify-between">
            <div>
              <div className="inline-flex items-center gap-3 rounded-full border border-brand-100 bg-white/90 px-4 py-2 shadow-sm">
                <div className="flex h-9 w-9 items-center justify-center rounded-full bg-brand-50 shadow-sm">
                  <UtensilsCrossed className="h-4 w-4 text-brand-700" />
                </div>
                <div>
                  <p className="font-display text-2xl leading-none text-stone-900">Smart Dine</p>
                  <p className="mt-1 text-[11px] uppercase tracking-[0.28em] text-brand-600">Restaurant Operations</p>
                </div>
              </div>

              <div className="mt-12 max-w-md">
                <p className="inline-flex rounded-full border border-brand-100 bg-white/80 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.34em] text-brand-600">
                  Sign In
                </p>
                <h1 className="mt-5 font-display text-6xl leading-[0.95] text-stone-900">
                  A premium front desk for restaurant teams and guests.
                </h1>
                <p className="mt-5 max-w-sm text-base leading-7 text-stone-600">
                  Purpose-built access for admins, branch teams, and guests with cleaner workflows and a more polished first impression.
                </p>
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-3">
              {[
                { value: "4", label: "Roles" },
                { value: "30D", label: "JWT Session" },
                { value: "24/7", label: "Guest Access" },
              ].map((item) => (
                <div key={item.label} className="rounded-[28px] border border-brand-100 bg-white/88 px-5 py-5 backdrop-blur-sm shadow-sm">
                  <p className="font-display text-4xl leading-none text-brand-700">{item.value}</p>
                  <p className="mt-2 text-xs uppercase tracking-[0.24em] text-stone-500">{item.label}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="glass-panel mx-auto w-full max-w-xl p-6 shadow-[0_32px_90px_rgba(108,54,16,0.1)] md:p-8">
          <div className="mb-7 flex items-start justify-between gap-4">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.3em] text-brand-600">Access Panel</p>
              <h2 className="mt-3 font-display text-4xl leading-none text-stone-900">
                {mode === "login" ? "Welcome back" : "Create account"}
              </h2>
              <p className="mt-3 text-sm text-stone-500">
                {mode === "login" ? "Sign in and continue." : "Create a guest profile for bookings and orders."}
              </p>
            </div>
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-brand-100 bg-white text-brand-700 shadow-sm">
              {mode === "login" ? <ShieldCheck className="h-5 w-5" /> : <Clock3 className="h-5 w-5" />}
            </div>
          </div>

          <div className="mb-6 flex rounded-2xl border border-brand-100 bg-[#fff7ef] p-1">
            <button
              type="button"
              onClick={() => setMode("login")}
              className={`flex-1 rounded-2xl px-4 py-3 text-sm font-semibold ${mode === "login" ? "bg-white text-stone-900 shadow-sm" : "text-stone-500"}`}
            >
              Sign In
            </button>
            <button
              type="button"
              onClick={() => setMode("register")}
              className={`flex-1 rounded-2xl px-4 py-3 text-sm font-semibold ${mode === "register" ? "bg-white text-stone-900 shadow-sm" : "text-stone-500"}`}
            >
              Register
            </button>
          </div>

          {error ? <div className="mb-5 rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-600">{error}</div> : null}

          <form onSubmit={handleSubmit} className="space-y-4">
            {mode === "register" ? (
              <>
                <label className="block">
                  <span className="mb-2 block text-sm font-medium text-stone-700">Guest name</span>
                  <input name="name" value={formValues.name} onChange={handleChange} className="input-shell" placeholder="Full name" />
                </label>
                <label className="block">
                  <span className="mb-2 block text-sm font-medium text-stone-700">Phone number</span>
                  <input name="phone" value={formValues.phone} onChange={handleChange} className="input-shell" placeholder="+91 99999 12345" />
                </label>
              </>
            ) : null}

            <label className="block">
              <span className="mb-2 block text-sm font-medium text-stone-700">Email</span>
              <input name="email" type="email" value={formValues.email} onChange={handleChange} className="input-shell" placeholder="Email address" />
            </label>

            <label className="block">
              <span className="mb-2 block text-sm font-medium text-stone-700">Password</span>
              <input
                name="password"
                type="password"
                value={formValues.password}
                onChange={handleChange}
                className="input-shell"
                placeholder="Password"
              />
            </label>

            <button type="submit" disabled={submitting} className="btn-primary w-full justify-center">
              {submitting ? "Please wait..." : mode === "login" ? "Enter Workspace" : "Create Guest Account"}
              <ArrowRight className="ml-2 h-4 w-4" />
            </button>
          </form>

          <div className="mt-6 border-t border-stone-200 pt-5">
            <div className="mb-3 flex items-center justify-between gap-3">
              <p className="text-xs font-semibold uppercase tracking-[0.28em] text-stone-400">Quick Access</p>
              <span className="text-xs text-stone-400">Tap to autofill</span>
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              {demoAccounts.map((account) => (
                <button
                  key={account.role}
                  type="button"
                  onClick={() => applyDemoAccount(account)}
                  className="rounded-[24px] border border-brand-100 bg-gradient-to-br from-white to-[#fff7ef] px-4 py-4 text-left shadow-sm transition hover:-translate-y-0.5 hover:border-brand-300 hover:bg-white"
                >
                  <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-brand-700">{account.role}</p>
                  <p className="mt-2 text-sm font-medium text-stone-700">{account.email}</p>
                </button>
              ))}
            </div>
          </div>

          <div className="mt-6 flex items-center justify-between gap-4 text-sm">
            <Link to="/" className="font-semibold text-brand-700">
              Back to guest portal
            </Link>
            <p className="text-stone-400">Guest browsing works without sign-in.</p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default LoginPage;
