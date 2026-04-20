import { ClipboardList } from "lucide-react";

const EmptyState = ({ title, description, action }) => (
  <div className="rounded-3xl border border-dashed border-stone-300 bg-stone-50/90 p-10 text-center">
    <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-brand-50 text-brand-600">
      <ClipboardList className="h-6 w-6" />
    </div>
    <h3 className="font-display text-3xl font-semibold leading-none text-stone-900">{title}</h3>
    <p className="mx-auto mt-3 max-w-md text-sm leading-6 text-stone-500">{description}</p>
    {action ? <div className="mt-6">{action}</div> : null}
  </div>
);

export default EmptyState;
