import { joinClasses, toSentenceCase } from "../../utils/helpers";

const statusColorMap = {
  active: "bg-emerald-100 text-emerald-700",
  inactive: "bg-slate-100 text-slate-700",
  maintenance: "bg-amber-100 text-amber-700",
  available: "bg-emerald-100 text-emerald-700",
  reserved: "bg-sky-100 text-sky-700",
  occupied: "bg-rose-100 text-rose-700",
  cleaning: "bg-orange-100 text-orange-700",
  pending: "bg-amber-100 text-amber-700",
  confirmed: "bg-emerald-100 text-emerald-700",
  completed: "bg-slate-900 text-white",
  cancelled: "bg-rose-100 text-rose-700",
  preparing: "bg-indigo-100 text-indigo-700",
  ready: "bg-sky-100 text-sky-700",
  served: "bg-emerald-100 text-emerald-700",
  paid: "bg-emerald-100 text-emerald-700",
  refunded: "bg-rose-100 text-rose-700",
  seated: "bg-teal-100 text-teal-700",
  "checked-in": "bg-teal-100 text-teal-700",
};

const StatusBadge = ({ value }) => (
  <span
    className={joinClasses(
      "inline-flex rounded-full px-3 py-1 text-xs font-semibold capitalize",
      statusColorMap[String(value).toLowerCase()] || "bg-slate-100 text-slate-700"
    )}
  >
    {toSentenceCase(value)}
  </span>
);

export default StatusBadge;
