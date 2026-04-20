import { ArrowUpRight } from "lucide-react";

const StatCard = ({ title, value, subtitle, icon: Icon }) => (
  <div className="glass-panel relative overflow-hidden p-5">
    <div className="absolute inset-y-5 left-0 w-1 rounded-r-full bg-gradient-to-b from-brand-500 to-brand-700" />
    <div className="absolute right-[-2rem] top-[-2rem] h-28 w-28 rounded-full bg-brand-100/70 blur-3xl" />
    <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white to-transparent opacity-80" />
    <div className="mb-4 flex items-start justify-between">
      <div className="pl-3">
        <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-brand-600">{title}</p>
        <h3 className="mt-2 font-display text-[2.3rem] font-semibold leading-none text-stone-900">{value}</h3>
      </div>
      {Icon ? (
        <div className="rounded-2xl border border-brand-100 bg-white/90 p-3 text-brand-600 shadow-sm">
          <Icon className="h-5 w-5" />
        </div>
      ) : (
        <ArrowUpRight className="h-5 w-5 text-brand-400" />
      )}
    </div>
    {subtitle ? <p className="pl-3 text-sm leading-6 text-stone-600">{subtitle}</p> : null}
  </div>
);

export default StatCard;
