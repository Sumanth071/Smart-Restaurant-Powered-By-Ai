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

const escapeCsvValue = (value) => `"${String(value ?? "").replace(/"/g, '""')}"`;

export const downloadCsv = (filename, rows) => {
  const csv = rows.map((row) => row.map(escapeCsvValue).join(",")).join("\n");
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");

  link.href = url;
  link.download = filename;
  link.click();

  URL.revokeObjectURL(url);
};

export const openPrintWindow = ({ title, sections }) => {
  const printWindow = window.open("", "_blank", "noopener,noreferrer,width=1200,height=900");

  if (!printWindow) {
    return;
  }

  printWindow.document.write(`
    <html>
      <head>
        <title>${title}</title>
        <style>
          body { font-family: Arial, sans-serif; margin: 32px; color: #2c1608; }
          h1 { margin-bottom: 8px; }
          h2 { margin-top: 32px; margin-bottom: 12px; font-size: 20px; }
          table { width: 100%; border-collapse: collapse; margin-top: 12px; }
          th, td { border: 1px solid #e5d8cc; padding: 10px; text-align: left; }
          th { background: #fff2e5; }
          p, li { line-height: 1.6; }
        </style>
      </head>
      <body>
        <h1>${title}</h1>
        ${sections.join("")}
      </body>
    </html>
  `);
  printWindow.document.close();
  printWindow.focus();
  printWindow.print();
};

export const readFileAsDataUrl = (file) =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = () => resolve(String(reader.result || ""));
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
