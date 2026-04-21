import { ChevronLeft, ChevronRight, Plus, RefreshCcw } from "lucide-react";
import { useCallback, useDeferredValue, useEffect, useMemo, useState } from "react";

import api from "../../api/client";
import PageHeader from "../../components/layout/PageHeader";
import DataTable from "../../components/ui/DataTable";
import FormField from "../../components/ui/FormField";
import LoadingScreen from "../../components/ui/LoadingScreen";
import Modal from "../../components/ui/Modal";
import SectionCard from "../../components/ui/SectionCard";
import StatCard from "../../components/ui/StatCard";
import { useAuth } from "../../context/AuthContext";
import { useConfirm } from "../../context/ConfirmDialogContext";
import { useQueryClient } from "../../context/QueryClientContext";
import { getAccessSummary, getModulePermissions } from "../../data/accessControl";
import { useToast } from "../../context/ToastContext";

const buildEmptyForm = (fields) =>
  fields.reduce((accumulator, field) => {
    accumulator[field.name] = field.type === "checkbox" ? false : field.defaultValue || "";
    return accumulator;
  }, {});

const buildFilterState = (filters = []) =>
  filters.reduce((accumulator, filter) => {
    accumulator[filter.name] = filter.defaultValue || "all";
    return accumulator;
  }, {});

const parseCollectionResponse = (payload) => {
  if (Array.isArray(payload)) {
    return {
      items: payload,
      pagination: null,
    };
  }

  return {
    items: payload?.items || [],
    pagination: payload?.pagination || null,
  };
};

const EntityManagerPage = ({ config, moduleKey }) => {
  const { user } = useAuth();
  const { confirm } = useConfirm();
  const { pushToast } = useToast();
  const queryClient = useQueryClient();
  const [items, setItems] = useState([]);
  const [dependencies, setDependencies] = useState({});
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [filters, setFilters] = useState(buildFilterState(config.filters));
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);
  const [formValues, setFormValues] = useState(buildEmptyForm(config.fields));
  const deferredSearch = useDeferredValue(search);
  const permissions = useMemo(() => getModulePermissions(moduleKey, user?.role), [moduleKey, user?.role]);
  const accessSummary = useMemo(() => getAccessSummary(permissions), [permissions]);

  useEffect(() => {
    setFilters(buildFilterState(config.filters));
    setPage(1);
  }, [config.filters]);

  useEffect(() => {
    setPage(1);
  }, [deferredSearch, filters]);

  const loadData = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      const params = {
        ...(deferredSearch ? { q: deferredSearch } : {}),
        ...(config.enablePagination ? { paged: true, page, limit: config.pageSize || 8 } : {}),
        ...(config.defaultSort ? { sort: config.defaultSort } : {}),
        ...Object.fromEntries(Object.entries(filters).filter(([, value]) => value !== "all" && value !== "")),
      };

      const requests = [api.get(config.endpoint, { params }), ...(config.dependencies || []).map((dependency) => api.get(dependency.endpoint))];
      const responses = await Promise.all(requests);
      const [primaryResponse, ...dependencyResponses] = responses;
      const parsedCollection = parseCollectionResponse(primaryResponse.data);

      setItems(parsedCollection.items);
      setPagination(parsedCollection.pagination);
      setDependencies(
        (config.dependencies || []).reduce((accumulator, dependency, index) => {
          accumulator[dependency.key] = dependencyResponses[index].data;
          return accumulator;
        }, {})
      );
    } catch (requestError) {
      const message = requestError.response?.data?.message || "Unable to load data for this module.";
      setError(message);
    } finally {
      setLoading(false);
    }
  }, [config, deferredSearch, filters, page]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const highlights = useMemo(() => config.getHighlights?.(items, dependencies) || [], [config, dependencies, items]);

  const openCreateModal = () => {
    if (!permissions.create) {
      return;
    }

    setSelectedItem(null);
    setFormValues(buildEmptyForm(config.fields));
    setModalOpen(true);
  };

  const openEditModal = (item) => {
    if (!permissions.edit) {
      return;
    }

    setSelectedItem(item);
    setFormValues(config.toFormValues ? config.toFormValues(item, dependencies) : item);
    setModalOpen(true);
  };

  const closeModal = () => {
    setModalOpen(false);
    setSelectedItem(null);
    setFormValues(buildEmptyForm(config.fields));
  };

  const handleFieldChange = (name, value) => {
    setFormValues((current) => ({ ...current, [name]: value }));
  };

  const invalidateRelatedData = () => {
    queryClient.invalidateQueries((key) => key.includes(config.endpoint) || key.includes("dashboard-summary") || key.includes("reports-overview"));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setSubmitting(true);
    setError("");

    try {
      const payload = config.fromFormValues ? config.fromFormValues(formValues, dependencies, selectedItem, user) : formValues;

      if (selectedItem) {
        await api.put(`${config.endpoint}/${selectedItem._id}`, payload);
      } else {
        await api.post(config.endpoint, payload);
      }

      invalidateRelatedData();
      closeModal();
      await loadData();
      pushToast({
        tone: "success",
        title: selectedItem ? "Record updated" : "Record created",
        message: `${config.title} has been saved successfully.`,
      });
    } catch (requestError) {
      const message = requestError.response?.data?.message || "Unable to save the record.";
      setError(message);
      pushToast({
        tone: "error",
        title: "Save failed",
        message,
      });
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (item) => {
    if (!permissions.delete) {
      return;
    }

    const confirmed = await confirm({
      title: `Delete ${config.buttonLabel.replace("Add ", "")}?`,
      description: `This will permanently remove "${item.name || item.guestName || item.orderNumber}" from ${config.title.toLowerCase()}.`,
      confirmLabel: "Delete",
      tone: "danger",
    });

    if (!confirmed) {
      return;
    }

    try {
      await api.delete(`${config.endpoint}/${item._id}`);
      invalidateRelatedData();
      await loadData();
      pushToast({
        tone: "success",
        title: "Record deleted",
        message: `${config.title} was updated after removing the selected record.`,
      });
    } catch (requestError) {
      const message = requestError.response?.data?.message || "Unable to delete the record.";
      setError(message);
      pushToast({
        tone: "error",
        title: "Delete failed",
        message,
      });
    }
  };

  if (loading) {
    return <LoadingScreen label={`Loading ${config.title.toLowerCase()}...`} />;
  }

  return (
    <div>
      <PageHeader
        eyebrow="Management Module"
        title={config.title}
        description={config.subtitle}
        action={
          <div className="flex flex-wrap gap-3">
            <button type="button" onClick={loadData} className="btn-secondary">
              <RefreshCcw className="mr-2 h-4 w-4" />
              Refresh
            </button>
            {permissions.create ? (
              <button type="button" onClick={openCreateModal} className="btn-primary">
                <Plus className="mr-2 h-4 w-4" />
                {config.buttonLabel}
              </button>
            ) : null}
          </div>
        }
      />

      {error ? (
        <div className="mb-6 rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm font-medium text-rose-600">{error}</div>
      ) : null}

      {highlights.length ? (
        <div className="mb-6 grid gap-4 md:grid-cols-3">
          {highlights.map((item) => (
            <StatCard key={item.title} title={item.title} value={item.value} subtitle={item.subtitle} />
          ))}
        </div>
      ) : null}

      <div className="mb-6 rounded-[26px] border border-brand-100 bg-[#fff8f1] px-5 py-4 text-sm text-stone-600">{accessSummary}</div>

      <SectionCard
        title="Current Records"
        subtitle="Search, filter, review, update, and remove records from one workspace."
        action={
          <div className="flex flex-col gap-3 md:items-end">
            <input
              type="search"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder={config.searchPlaceholder}
              className="input-shell md:w-80"
            />
            {config.filters?.length ? (
              <div className="flex flex-wrap gap-3 md:justify-end">
                {config.filters.map((filter) => (
                  <select
                    key={filter.name}
                    value={filters[filter.name] ?? "all"}
                    onChange={(event) => setFilters((current) => ({ ...current, [filter.name]: event.target.value }))}
                    className="input-shell min-w-[148px]"
                  >
                    {filter.options.map((option) => (
                      <option key={option.value} value={option.value}>
                        {filter.label}: {option.label}
                      </option>
                    ))}
                  </select>
                ))}
              </div>
            ) : null}
          </div>
        }
      >
        <DataTable
          columns={config.columns}
          rows={items}
          onEdit={permissions.edit ? openEditModal : undefined}
          onDelete={permissions.delete ? handleDelete : undefined}
          emptyTitle={config.emptyTitle}
          emptyDescription={config.emptyDescription}
        />

        {pagination ? (
          <div className="mt-5 flex flex-col gap-3 border-t border-stone-200 pt-5 md:flex-row md:items-center md:justify-between">
            <p className="text-sm text-stone-500">
              Page {pagination.page} of {pagination.totalPages} - {pagination.total} records
            </p>
            <div className="flex gap-3">
              <button type="button" onClick={() => setPage((current) => Math.max(1, current - 1))} disabled={pagination.page <= 1} className="btn-secondary px-4 py-2 disabled:cursor-not-allowed disabled:opacity-50">
                <ChevronLeft className="mr-1 h-4 w-4" />
                Previous
              </button>
              <button
                type="button"
                onClick={() => setPage((current) => Math.min(pagination.totalPages, current + 1))}
                disabled={pagination.page >= pagination.totalPages}
                className="btn-secondary px-4 py-2 disabled:cursor-not-allowed disabled:opacity-50"
              >
                Next
                <ChevronRight className="ml-1 h-4 w-4" />
              </button>
            </div>
          </div>
        ) : null}
      </SectionCard>

      {permissions.create || permissions.edit ? (
        <Modal
          open={modalOpen}
          onClose={closeModal}
          title={selectedItem ? `Edit ${config.buttonLabel.replace("Add ", "")}` : config.buttonLabel}
          subtitle="Update the form and save to apply changes to the workspace."
        >
          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="grid gap-4 md:grid-cols-2">
              {config.fields.map((field) => (
                <div key={field.name} className={field.type === "textarea" || field.type === "file" ? "md:col-span-2" : ""}>
                  <FormField field={field} value={formValues[field.name]} onChange={handleFieldChange} dependencies={dependencies} formValues={formValues} />
                </div>
              ))}
            </div>

            <div className="flex flex-wrap justify-end gap-3 border-t border-slate-200 pt-5">
              <button type="button" onClick={closeModal} className="btn-secondary">
                Cancel
              </button>
              <button type="submit" disabled={submitting} className="btn-primary">
                {submitting ? "Saving..." : selectedItem ? "Update Record" : "Create Record"}
              </button>
            </div>
          </form>
        </Modal>
      ) : null}
    </div>
  );
};

export default EntityManagerPage;
