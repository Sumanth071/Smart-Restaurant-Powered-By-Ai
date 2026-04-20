import { PencilLine, Trash2 } from "lucide-react";

import EmptyState from "./EmptyState";

const DataTable = ({ columns, rows, onEdit, onDelete, emptyTitle, emptyDescription }) => {
  if (!rows.length) {
    return <EmptyState title={emptyTitle} description={emptyDescription} />;
  }

  return (
    <>
      <div className="hidden overflow-hidden rounded-3xl border border-slate-200 md:block">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-slate-200">
            <thead className="bg-slate-50">
              <tr>
                {columns.map((column) => (
                  <th key={column.key} className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                    {column.label}
                  </th>
                ))}
                <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wide text-slate-500">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 bg-white">
              {rows.map((row) => (
                <tr key={row._id} className="align-top">
                  {columns.map((column) => (
                    <td key={`${row._id}-${column.key}`} className="px-4 py-4 text-sm text-slate-600">
                      {column.render ? column.render(row) : row[column.key] || "-"}
                    </td>
                  ))}
                  <td className="px-4 py-4">
                    <div className="flex justify-end gap-2">
                      <button
                        type="button"
                        onClick={() => onEdit(row)}
                        className="rounded-2xl border border-slate-200 p-2 text-slate-500 transition hover:border-amber-300 hover:text-amber-600"
                      >
                        <PencilLine className="h-4 w-4" />
                      </button>
                      <button
                        type="button"
                        onClick={() => onDelete(row)}
                        className="rounded-2xl border border-slate-200 p-2 text-slate-500 transition hover:border-rose-300 hover:text-rose-600"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="grid gap-4 md:hidden">
        {rows.map((row) => (
          <div key={row._id} className="rounded-3xl border border-slate-200 bg-white p-4">
            <div className="space-y-3">
              {columns.slice(0, 4).map((column) => (
                <div key={`${row._id}-${column.key}`} className="flex items-start justify-between gap-3">
                  <span className="text-xs font-semibold uppercase tracking-wide text-slate-400">{column.label}</span>
                  <div className="text-right text-sm text-slate-700">{column.render ? column.render(row) : row[column.key] || "-"}</div>
                </div>
              ))}
            </div>
            <div className="mt-4 flex gap-2">
              <button type="button" onClick={() => onEdit(row)} className="btn-secondary flex-1 py-2 text-sm">
                Edit
              </button>
              <button
                type="button"
                onClick={() => onDelete(row)}
                className="flex-1 rounded-2xl border border-rose-200 bg-rose-50 px-4 py-2 text-sm font-semibold text-rose-600"
              >
                Delete
              </button>
            </div>
          </div>
        ))}
      </div>
    </>
  );
};

export default DataTable;
