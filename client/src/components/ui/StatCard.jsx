import { ArrowUpRight } from "lucide-react";

const StatCard = ({ title, value, subtitle, icon: Icon }) => (
  <div className="glass-panel relative overflow-hidden p-5">
    <div className="absolute inset-y-5 left-0 w-1 rounded-r-full bg-gradient-to-b from-brand-500 to-moss-500" />
    <div className="mb-4 flex items-start justify-between">
      <div className="pl-3">
        <p className="text-sm font-medium uppercase tracking-[0.18em] text-stone-500">{title}</p>
        <h3 className="mt-2 font-display text-[2.3rem] font-semibold leading-none text-stone-900">{value}</h3>
      </div>
      {Icon ? (
        <div className="rounded-2xl bg-brand-50 p-3 text-brand-600">
          <Icon className="h-5 w-5" />
        </div>
      ) : (
        <ArrowUpRight className="h-5 w-5 text-stone-400" />
      )}
    </div>
    {subtitle ? <p className="pl-3 text-sm leading-6 text-stone-500">{subtitle}</p> : null}
  </div>
);

export default StatCard;
