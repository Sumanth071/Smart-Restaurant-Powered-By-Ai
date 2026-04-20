import { ArrowUpRight } from "lucide-react";

const StatCard = ({ title, value, subtitle, icon: Icon }) => (
  <div className="glass-panel relative overflow-hidden p-5">
    <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-amber-400 via-orange-500 to-rose-500" />
    <div className="mb-4 flex items-start justify-between">
      <div>
        <p className="text-sm font-medium text-slate-500">{title}</p>
        <h3 className="mt-2 text-3xl font-bold text-slate-900">{value}</h3>
      </div>
      {Icon ? (
        <div className="rounded-2xl bg-amber-50 p-3 text-amber-600">
          <Icon className="h-5 w-5" />
        </div>
      ) : (
        <ArrowUpRight className="h-5 w-5 text-slate-400" />
      )}
    </div>
    {subtitle ? <p className="text-sm text-slate-500">{subtitle}</p> : null}
  </div>
);

export default StatCard;
