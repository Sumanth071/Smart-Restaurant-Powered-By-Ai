const PageHeader = ({ eyebrow, title, description, action }) => (
  <div className="relative mb-6 overflow-hidden rounded-[32px] border border-brand-100/80 bg-gradient-to-r from-white via-[#fffaf6] to-[#fff1e5] px-6 py-6 shadow-[0_24px_70px_rgba(108,54,16,0.08)] md:px-8">
    <div className="pointer-events-none absolute -right-16 top-0 h-40 w-40 rounded-full bg-brand-100/70 blur-3xl" />
    <div className="pointer-events-none absolute bottom-0 left-[-4rem] h-24 w-24 rounded-full bg-[#ffd9b5]/70 blur-2xl" />
    <div className="relative flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
      <div>
        {eyebrow ? (
          <p className="mb-3 inline-flex rounded-full border border-brand-100 bg-white/90 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.32em] text-brand-600">
            {eyebrow}
          </p>
        ) : null}
        <h1 className="font-display text-4xl font-semibold leading-none text-stone-900 md:text-[3.1rem]">{title}</h1>
        {description ? <p className="mt-4 max-w-3xl text-sm leading-7 text-stone-600 md:text-base">{description}</p> : null}
      </div>
      {action}
    </div>
  </div>
);

export default PageHeader;
