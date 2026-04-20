import { ArrowRight, Sparkles } from "lucide-react";
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
    <section className="px-6 py-12 md:px-10 md:py-20">
      <div className="mx-auto grid max-w-7xl gap-10 xl:grid-cols-[1.1fr_0.9fr]">
        <div className="glass-card overflow-hidden p-8 md:p-10">
          <div className="mb-10">
            <div className="mb-4 inline-flex rounded-full border border-white/10 bg-white/5 px-4 py-2 text-xs font-semibold uppercase tracking-[0.3em] text-amber-300">
              Authentication Module
            </div>
            <h1 className="font-display text-4xl font-bold text-white md:text-5xl">
              Multi-role access for the <span className="text-gradient">AI restaurant suite</span>
            </h1>
            <p className="mt-4 max-w-2xl text-slate-300">
              Sign in as super admin, restaurant admin, staff, or guest. This demo-ready authentication flow supports JWT login and new guest registration.
            </p>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            {demoAccounts.map((account) => (
              <button
                key={account.role}
                type="button"
                onClick={() => applyDemoAccount(account)}
                className="rounded-3xl border border-white/10 bg-white/5 p-5 text-left transition hover:border-amber-400/40 hover:bg-white/10"
              >
                <p className="text-sm font-semibold uppercase tracking-[0.22em] text-amber-300">{account.role}</p>
                <p className="mt-3 text-lg font-semibold text-white">{account.email}</p>
                <p className="mt-2 text-sm text-slate-300">{account.note}</p>
              </button>
            ))}
          </div>
        </div>

        <div className="glass-panel p-8 md:p-10">
          <div className="mb-8 flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.25em] text-amber-500">Access Panel</p>
              <h2 className="mt-2 font-display text-3xl font-bold text-slate-900">{mode === "login" ? "Login" : "Register as Guest"}</h2>
            </div>
            <div className="rounded-2xl bg-amber-50 p-3 text-amber-600">
              <Sparkles className="h-5 w-5" />
            </div>
          </div>

          <div className="mb-6 flex rounded-2xl border border-slate-200 bg-slate-50 p-1">
            <button
              type="button"
              onClick={() => setMode("login")}
              className={`flex-1 rounded-2xl px-4 py-3 text-sm font-semibold ${mode === "login" ? "bg-white text-slate-900 shadow-sm" : "text-slate-500"}`}
            >
              Login
            </button>
            <button
              type="button"
              onClick={() => setMode("register")}
              className={`flex-1 rounded-2xl px-4 py-3 text-sm font-semibold ${mode === "register" ? "bg-white text-slate-900 shadow-sm" : "text-slate-500"}`}
            >
              Register
            </button>
          </div>

          {error ? <div className="mb-6 rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-600">{error}</div> : null}

          <form onSubmit={handleSubmit} className="space-y-4">
            {mode === "register" ? (
              <>
                <input name="name" value={formValues.name} onChange={handleChange} className="input-shell" placeholder="Full name" />
                <input name="phone" value={formValues.phone} onChange={handleChange} className="input-shell" placeholder="+91 99999 12345" />
              </>
            ) : null}
            <input name="email" type="email" value={formValues.email} onChange={handleChange} className="input-shell" placeholder="Email address" />
            <input
              name="password"
              type="password"
              value={formValues.password}
              onChange={handleChange}
              className="input-shell"
              placeholder="Password"
            />

            <button type="submit" disabled={submitting} className="btn-primary w-full">
              {submitting ? "Please wait..." : mode === "login" ? "Login to Dashboard" : "Create Guest Account"}
              <ArrowRight className="ml-2 h-4 w-4" />
            </button>
          </form>

          <p className="mt-6 text-sm text-slate-500">
            Guests can also continue directly through the public portal for table booking and food ordering without logging in.
          </p>

          <Link to="/" className="mt-6 inline-flex text-sm font-semibold text-amber-600">
            Back to guest portal
          </Link>
        </div>
      </div>
    </section>
  );
};

export default LoginPage;
