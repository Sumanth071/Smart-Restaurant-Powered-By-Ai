import { joinClasses, readFileAsDataUrl } from "../../utils/helpers";

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
        <span className="mb-2 block text-sm font-medium text-stone-700">{field.label}</span>
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
        <span className="mb-2 block text-sm font-medium text-stone-700">{field.label}</span>
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
      <label className="flex items-center justify-between rounded-2xl border border-stone-200 bg-stone-50/90 px-4 py-3">
        <div>
          <span className="block text-sm font-medium text-stone-800">{field.label}</span>
          {field.helperText ? <span className="mt-1 block text-xs text-stone-500">{field.helperText}</span> : null}
        </div>
        <input
          type="checkbox"
          checked={Boolean(value)}
          onChange={(event) => onChange(field.name, event.target.checked)}
          className="h-5 w-5 rounded border-stone-300 text-brand-500 focus:ring-brand-200"
        />
      </label>
    );
  }

  if (field.type === "file") {
    const previewValue = formValues[field.targetField || field.name];

    return (
      <label className="block">
        <span className="mb-2 block text-sm font-medium text-stone-700">{field.label}</span>
        <div className="rounded-[26px] border border-dashed border-brand-200 bg-[#fff8f2] p-4">
          <input
            type="file"
            accept={field.accept}
            className="block w-full cursor-pointer text-sm text-stone-600 file:mr-4 file:rounded-full file:border-0 file:bg-brand-500 file:px-4 file:py-2 file:font-semibold file:text-white"
            onChange={async (event) => {
              const file = event.target.files?.[0];

              if (!file) {
                return;
              }

              const dataUrl = await readFileAsDataUrl(file);
              onChange(field.targetField || field.name, dataUrl);
            }}
          />
          {field.helperText ? <span className="mt-3 block text-xs text-stone-500">{field.helperText}</span> : null}
          {previewValue ? (
            <div className="mt-4 overflow-hidden rounded-[22px] border border-stone-200 bg-white">
              <img src={previewValue} alt={`${field.label} preview`} className="h-44 w-full object-cover" />
            </div>
          ) : null}
        </div>
      </label>
    );
  }

  return (
    <label className="block">
      <span className="mb-2 block text-sm font-medium text-stone-700">{field.label}</span>
      <input
        type={field.type || "text"}
        className={joinClasses("input-shell", field.className)}
        placeholder={field.placeholder}
        value={value ?? ""}
        onChange={(event) => onChange(field.name, event.target.value)}
      />
      {field.helperText ? <span className="mt-1 block text-xs text-stone-500">{field.helperText}</span> : null}
    </label>
  );
};

export default FormField;
