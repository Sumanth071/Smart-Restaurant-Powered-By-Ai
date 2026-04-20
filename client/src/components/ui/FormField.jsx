import { joinClasses } from "../../utils/helpers";

const FormField = ({ field, value, onChange, dependencies = {}, formValues = {} }) => {
  const sourceItems = field.optionsSource ? dependencies[field.optionsSource] || [] : [];
  const filteredItems = field.filterOptions ? sourceItems.filter((item) => field.filterOptions(item, formValues)) : sourceItems;
  const options =
    field.options ||
    (field.optionsSource
      ? filteredItems.map((item) => ({
          label: item[field.optionLabel || "name"] || item.name || item.label,
          value: item[field.optionValue || "_id"] || item.value,
        }))
      : []);

  if (field.type === "textarea") {
    return (
      <label className="block">
        <span className="mb-2 block text-sm font-medium text-slate-700">{field.label}</span>
        <textarea
          rows={field.rows || 4}
          className="input-shell min-h-[120px]"
          placeholder={field.placeholder}
          value={value || ""}
          onChange={(event) => onChange(field.name, event.target.value)}
        />
      </label>
    );
  }

  if (field.type === "select") {
    return (
      <label className="block">
        <span className="mb-2 block text-sm font-medium text-slate-700">{field.label}</span>
        <select
          className="input-shell"
          value={value ?? ""}
          onChange={(event) => onChange(field.name, event.target.value)}
        >
          <option value="">{field.placeholder || `Select ${field.label}`}</option>
          {options.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </label>
    );
  }

  if (field.type === "checkbox") {
    return (
      <label className="flex items-center justify-between rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3">
        <div>
          <span className="block text-sm font-medium text-slate-800">{field.label}</span>
          {field.helperText ? <span className="mt-1 block text-xs text-slate-500">{field.helperText}</span> : null}
        </div>
        <input
          type="checkbox"
          checked={Boolean(value)}
          onChange={(event) => onChange(field.name, event.target.checked)}
          className="h-5 w-5 rounded border-slate-300 text-amber-500 focus:ring-amber-300"
        />
      </label>
    );
  }

  return (
    <label className="block">
      <span className="mb-2 block text-sm font-medium text-slate-700">{field.label}</span>
      <input
        type={field.type || "text"}
        className={joinClasses("input-shell", field.className)}
        placeholder={field.placeholder}
        value={value ?? ""}
        onChange={(event) => onChange(field.name, event.target.value)}
      />
      {field.helperText ? <span className="mt-1 block text-xs text-slate-500">{field.helperText}</span> : null}
    </label>
  );
};

export default FormField;
