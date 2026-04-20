import { Plus, RefreshCcw } from "lucide-react";
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

const buildEmptyForm = (fields) =>
  fields.reduce((accumulator, field) => {
    accumulator[field.name] = field.type === "checkbox" ? false : field.defaultValue || "";
    return accumulator;
  }, {});

const EntityManagerPage = ({ config }) => {
  const { user } = useAuth();
  const [items, setItems] = useState([]);
  const [dependencies, setDependencies] = useState({});
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);
  const [formValues, setFormValues] = useState(buildEmptyForm(config.fields));
  const deferredSearch = useDeferredValue(search);

  const loadData = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      const requests = [api.get(config.endpoint), ...(config.dependencies || []).map((dependency) => api.get(dependency.endpoint))];
      const responses = await Promise.all(requests);
      const [primaryResponse, ...dependencyResponses] = responses;

      setItems(primaryResponse.data);
      setDependencies(
        (config.dependencies || []).reduce((accumulator, dependency, index) => {
          accumulator[dependency.key] = dependencyResponses[index].data;
          return accumulator;
        }, {})
      );
    } catch (requestError) {
      setError(requestError.response?.data?.message || "Unable to load data for this module.");
    } finally {
      setLoading(false);
    }
  }, [config]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const visibleItems = useMemo(() => {
    const term = deferredSearch.toLowerCase().trim();

    if (!term) {
      return items;
    }

    return items.filter((item) => JSON.stringify(item).toLowerCase().includes(term));
  }, [deferredSearch, items]);

  const highlights = useMemo(() => config.getHighlights?.(items, dependencies) || [], [config, dependencies, items]);

  const openCreateModal = () => {
    setSelectedItem(null);
    setFormValues(buildEmptyForm(config.fields));
    setModalOpen(true);
  };

  const openEditModal = (item) => {
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

      closeModal();
      await loadData();
    } catch (requestError) {
      setError(requestError.response?.data?.message || "Unable to save the record.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (item) => {
    const confirmed = window.confirm(`Delete ${config.title.toLowerCase()} record for "${item.name || item.guestName || item.orderNumber}"?`);

    if (!confirmed) {
      return;
    }

    try {
      await api.delete(`${config.endpoint}/${item._id}`);
      await loadData();
    } catch (requestError) {
      setError(requestError.response?.data?.message || "Unable to delete the record.");
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
            <button type="button" onClick={openCreateModal} className="btn-primary">
              <Plus className="mr-2 h-4 w-4" />
              {config.buttonLabel}
            </button>
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

      <SectionCard
        title="Live Data Table"
        subtitle="Use search, edit, and delete actions to demonstrate full CRUD operations."
        action={
          <input
            type="search"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder={config.searchPlaceholder}
            className="input-shell md:w-80"
          />
        }
      >
        <DataTable
          columns={config.columns}
          rows={visibleItems}
          onEdit={openEditModal}
          onDelete={handleDelete}
          emptyTitle={config.emptyTitle}
          emptyDescription={config.emptyDescription}
        />
      </SectionCard>

      <Modal
        open={modalOpen}
        onClose={closeModal}
        title={selectedItem ? `Edit ${config.buttonLabel.replace("Add ", "")}` : config.buttonLabel}
        subtitle="Update the form and save to apply changes to the database."
      >
        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="grid gap-4 md:grid-cols-2">
            {config.fields.map((field) => (
              <div key={field.name} className={field.type === "textarea" ? "md:col-span-2" : ""}>
                <FormField
                  field={field}
                  value={formValues[field.name]}
                  onChange={handleFieldChange}
                  dependencies={dependencies}
                  formValues={formValues}
                />
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
    </div>
  );
};

export default EntityManagerPage;
