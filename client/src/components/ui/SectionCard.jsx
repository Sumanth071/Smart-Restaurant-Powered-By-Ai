const SectionCard = ({ title, subtitle, action, children, className = "" }) => (
  <section className={`glass-panel p-6 ${className}`}>
    {(title || subtitle || action) && (
      <div className="mb-5 flex flex-col gap-3 border-b border-slate-200 pb-5 md:flex-row md:items-center md:justify-between">
        <div>
          {title ? <h2 className="text-xl font-bold text-slate-900">{title}</h2> : null}
          {subtitle ? <p className="mt-1 text-sm text-slate-500">{subtitle}</p> : null}
        </div>
        {action}
      </div>
    )}
    {children}
  </section>
);

export default SectionCard;
