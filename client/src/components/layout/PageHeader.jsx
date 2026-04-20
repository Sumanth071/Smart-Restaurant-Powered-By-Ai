const PageHeader = ({ eyebrow, title, description, action }) => (
  <div className="mb-6 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
    <div>
      {eyebrow ? <p className="mb-2 text-sm font-semibold uppercase tracking-[0.25em] text-amber-500">{eyebrow}</p> : null}
      <h1 className="font-display text-3xl font-bold text-slate-900 md:text-4xl">{title}</h1>
      {description ? <p className="mt-2 max-w-3xl text-sm text-slate-500 md:text-base">{description}</p> : null}
    </div>
    {action}
  </div>
);

export default PageHeader;
