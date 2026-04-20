const PageHeader = ({ eyebrow, title, description, action }) => (
  <div className="mb-6 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
    <div>
      {eyebrow ? <p className="mb-2 text-sm font-semibold uppercase tracking-[0.3em] text-brand-600">{eyebrow}</p> : null}
      <h1 className="font-display text-4xl font-semibold leading-none text-stone-900 md:text-[3rem]">{title}</h1>
      {description ? <p className="mt-3 max-w-3xl text-sm leading-7 text-stone-500 md:text-base">{description}</p> : null}
    </div>
    {action}
  </div>
);

export default PageHeader;
