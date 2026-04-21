import { PencilLine, Trash2 } from "lucide-react";

import EmptyState from "./EmptyState";

const DataTable = ({ columns, rows, onEdit, onDelete, emptyTitle, emptyDescription }) => {
  const showActions = Boolean(onEdit || onDelete);

  if (!rows.length) {
    return <EmptyState title={emptyTitle} description={emptyDescription} />;
  }

  return (
    <>
      <div className="hidden overflow-hidden rounded-3xl border border-stone-200/80 bg-white/90 md:block">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-stone-200/80">
            <thead className="bg-stone-100/80">
              <tr>
                {columns.map((column) => (
                  <th key={column.key} className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-[0.18em] text-stone-500">
                    {column.label}
                  </th>
                ))}
                {showActions ? (
                  <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-[0.18em] text-stone-500">Actions</th>
                ) : null}
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100 bg-white/90">
              {rows.map((row) => (
                <tr key={row._id} className="align-top transition hover:bg-stone-50/70">
                  {columns.map((column) => (
                    <td key={`${row._id}-${column.key}`} className="px-4 py-4 text-sm text-stone-600">
                      {column.render ? column.render(row) : row[column.key] || "-"}
                    </td>
                  ))}
                  {showActions ? (
                    <td className="px-4 py-4">
                      <div className="flex justify-end gap-2">
                        {onEdit ? (
                          <button
                            type="button"
                            onClick={() => onEdit(row)}
                            className="rounded-2xl border border-stone-200 p-2 text-stone-500 transition hover:border-brand-100 hover:bg-brand-50 hover:text-brand-600"
                          >
                            <PencilLine className="h-4 w-4" />
                          </button>
                        ) : null}
                        {onDelete ? (
                          <button
                            type="button"
                            onClick={() => onDelete(row)}
                            className="rounded-2xl border border-stone-200 p-2 text-stone-500 transition hover:border-rose-200 hover:bg-rose-50 hover:text-rose-600"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        ) : null}
                      </div>
                    </td>
                  ) : null}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="grid gap-4 md:hidden">
        {rows.map((row) => (
          <div key={row._id} className="rounded-3xl border border-stone-200/80 bg-white/90 p-4 shadow-sm">
            <div className="space-y-3">
              {columns.slice(0, 4).map((column) => (
                <div key={`${row._id}-${column.key}`} className="flex items-start justify-between gap-3">
                  <span className="text-xs font-semibold uppercase tracking-[0.18em] text-stone-400">{column.label}</span>
                  <div className="text-right text-sm text-stone-700">{column.render ? column.render(row) : row[column.key] || "-"}</div>
                </div>
              ))}
            </div>
            {showActions ? (
              <div className="mt-4 flex gap-2">
                {onEdit ? (
                  <button type="button" onClick={() => onEdit(row)} className="btn-secondary flex-1 py-2 text-sm">
                    Edit
                  </button>
                ) : null}
                {onDelete ? (
                  <button
                    type="button"
                    onClick={() => onDelete(row)}
                    className="flex-1 rounded-2xl border border-rose-200 bg-rose-50 px-4 py-2 text-sm font-semibold text-rose-600"
                  >
                    Delete
                  </button>
                ) : null}
              </div>
            ) : null}
          </div>
        ))}
      </div>
    </>
  );
};

export default DataTable;
