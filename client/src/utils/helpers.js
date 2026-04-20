export const joinClasses = (...classes) => classes.filter(Boolean).join(" ");

export const formatCurrency = (value) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(Number(value || 0));

export const formatDate = (value) =>
  value
    ? new Intl.DateTimeFormat("en-IN", {
        day: "numeric",
        month: "short",
        year: "numeric",
      }).format(new Date(value))
    : "-";

export const formatDateTime = (value) =>
  value
    ? new Intl.DateTimeFormat("en-IN", {
        day: "numeric",
        month: "short",
        year: "numeric",
        hour: "numeric",
        minute: "2-digit",
      }).format(new Date(value))
    : "-";

export const formatTime = (value) => {
  if (!value) {
    return "-";
  }

  const [hour = "0", minute = "00"] = String(value).split(":");
  const date = new Date();
  date.setHours(Number(hour), Number(minute), 0, 0);

  return new Intl.DateTimeFormat("en-IN", {
    hour: "numeric",
    minute: "2-digit",
  }).format(date);
};

export const getNestedValue = (source, path) => {
  if (!path) {
    return undefined;
  }

  return path.split(".").reduce((accumulator, key) => accumulator?.[key], source);
};

export const setNestedValue = (source, path, value) => {
  const keys = path.split(".");
  const next = structuredClone(source);
  let current = next;

  keys.slice(0, -1).forEach((key) => {
    if (typeof current[key] !== "object" || current[key] === null) {
      current[key] = {};
    }
    current = current[key];
  });

  current[keys.at(-1)] = value;
  return next;
};

export const toDateInput = (value) => (value ? new Date(value).toISOString().split("T")[0] : "");
export const safeJoin = (value) => (Array.isArray(value) ? value.join(", ") : value || "");
export const splitList = (value) =>
  String(value || "")
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);

export const toSentenceCase = (value = "") =>
  String(value)
    .replace(/[-_]/g, " ")
    .replace(/\b\w/g, (character) => character.toUpperCase());
