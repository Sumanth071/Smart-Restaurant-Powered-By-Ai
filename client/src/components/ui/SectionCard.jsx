const SectionCard = ({ title, subtitle, action, children, className = "" }) => (
  <section className={`glass-panel p-6 ${className}`}>
    {(title || subtitle || action) && (
      <div className="mb-5 flex flex-col gap-3 border-b border-stone-200/80 pb-5 md:flex-row md:items-center md:justify-between">
        <div>
          {title ? <h2 className="font-display text-[1.9rem] font-semibold leading-none text-stone-900">{title}</h2> : null}
          {subtitle ? <p className="mt-2 text-sm leading-6 text-stone-500">{subtitle}</p> : null}
        </div>
        {action}
      </div>
    )}
    {children}
  </section>
);

export default SectionCard;
