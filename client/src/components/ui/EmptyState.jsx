import { Sparkles } from "lucide-react";

const EmptyState = ({ title, description, action }) => (
  <div className="rounded-3xl border border-dashed border-slate-300 bg-slate-50 p-10 text-center">
    <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-amber-100 text-amber-600">
      <Sparkles className="h-6 w-6" />
    </div>
    <h3 className="text-lg font-semibold text-slate-900">{title}</h3>
    <p className="mx-auto mt-2 max-w-md text-sm text-slate-500">{description}</p>
    {action ? <div className="mt-6">{action}</div> : null}
  </div>
);

export default EmptyState;
