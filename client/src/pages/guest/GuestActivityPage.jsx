import { PencilLine, Trash2 } from "lucide-react";
import { useCallback, useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";

import api from "../../api/client";
import FormField from "../../components/ui/FormField";
import LoadingScreen from "../../components/ui/LoadingScreen";
import Modal from "../../components/ui/Modal";
import SectionCard from "../../components/ui/SectionCard";
import StatCard from "../../components/ui/StatCard";
import StatusBadge from "../../components/ui/StatusBadge";
import { useAuth } from "../../context/AuthContext";
import { moduleConfigs } from "../../data/moduleConfigs";
import { formatCurrency, formatDate, formatTime } from "../../utils/helpers";

const guestConfigMap = {
  bookings: {
    ...moduleConfigs.bookings,
    fields: moduleConfigs.bookings.fields.filter((field) => field.name !== "status"),
  },
  reservations: {
    ...moduleConfigs.reservations,
    fields: moduleConfigs.reservations.fields.filter((field) => field.name !== "status"),
  },
  orders: {
    ...moduleConfigs.orders,
    fields: moduleConfigs.orders.fields.filter((field) => !["status", "paymentStatus", "discount"].includes(field.name)),
  },
};

const GuestActivityPage = () => {
  const { user, loading: authLoading } = useAuth();
  const [records, setRecords] = useState({ bookings: [], reservations: [], orders: [] });
  const [dependencies, setDependencies] = useState({ restaurants: [], tables: [], menuItems: [] });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [modalType, setModalType] = useState("");
  const [selectedItem, setSelectedItem] = useState(null);
  const [formValues, setFormValues] = useState({});

  const loadData = useCallback(async () => {
    if (!user || user.role !== "guest") {
      setLoading(false);
      return;
    }

    setLoading(true);
    setError("");

    try {
      const [bookingsResponse, reservationsResponse, ordersResponse, restaurantsResponse, tablesResponse, menuItemsResponse] =
        await Promise.all([
          api.get("/bookings"),
          api.get("/reservations"),
          api.get("/orders"),
          api.get("/restaurants"),
          api.get("/tables"),
          api.get("/menu-items"),
        ]);

      setRecords({
        bookings: bookingsResponse.data,
        reservations: reservationsResponse.data,
        orders: ordersResponse.data,
      });
      setDependencies({
        restaurants: restaurantsResponse.data,
        tables: tablesResponse.data,
        menuItems: menuItemsResponse.data,
      });
    } catch (requestError) {
      setError(requestError.response?.data?.message || "Unable to load your guest activity.");
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const stats = useMemo(
    () => [
      { title: "Bookings", value: records.bookings.length, subtitle: "Your active table bookings" },
      { title: "Reservations", value: records.reservations.length, subtitle: "Advance reservations you created" },
      { title: "Orders", value: records.orders.length, subtitle: "Your placed food orders" },
    ],
    [records]
  );

  const openEditModal = (type, item) => {
    setModalType(type);
    setSelectedItem(item);
    setFormValues(guestConfigMap[type].toFormValues(item, dependencies));
  };

  const closeModal = () => {
    setModalType("");
    setSelectedItem(null);
    setFormValues({});
  };

  const handleFieldChange = (name, value) => {
    setFormValues((current) => ({ ...current, [name]: value }));
  };

  const handleSave = async (event) => {
    event.preventDefault();
    setSaving(true);
    setError("");
    setMessage("");

    try {
      const config = guestConfigMap[modalType];
      const payload = config.fromFormValues(formValues, dependencies, selectedItem, user);
      await api.put(`${config.endpoint}/${selectedItem._id}`, payload);
      setMessage("Your record was updated successfully.");
      closeModal();
      await loadData();
    } catch (requestError) {
      setError(requestError.response?.data?.message || "Unable to update your record.");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (type, item) => {
    const config = guestConfigMap[type];
    const confirmed = window.confirm(`Delete this ${type.slice(0, -1)} from your activity?`);

    if (!confirmed) {
      return;
    }

    try {
      await api.delete(`${config.endpoint}/${item._id}`);
      setMessage("The record was deleted successfully.");
      await loadData();
    } catch (requestError) {
      setError(requestError.response?.data?.message || "Unable to delete this record.");
    }
  };

  if (authLoading || loading) {
    return <LoadingScreen label="Loading your guest activity..." />;
  }

  if (!user) {
    return (
      <section className="px-6 py-16 md:px-10">
        <div className="mx-auto max-w-3xl">
          <SectionCard title="Login Required" subtitle="Sign in as a guest user to manage your bookings, reservations, and orders.">
            <Link to="/login" className="btn-primary">
              Login as Guest
            </Link>
          </SectionCard>
        </div>
      </section>
    );
  }

  if (user.role !== "guest") {
    return (
      <section className="px-6 py-16 md:px-10">
        <div className="mx-auto max-w-3xl">
          <SectionCard title="Guest Activity" subtitle="This page is intended for guest accounts. Admin and staff accounts should use the dashboard.">
            <Link to="/dashboard" className="btn-primary">
              Open Dashboard
            </Link>
          </SectionCard>
        </div>
      </section>
    );
  }

  return (
    <section className="px-6 py-12 md:px-10 md:py-20">
      <div className="mx-auto max-w-7xl">
        <div className="mb-10 text-center">
          <div className="mb-4 inline-flex rounded-full border border-brand-100 bg-white px-4 py-2 text-xs font-semibold uppercase tracking-[0.3em] text-brand-600 shadow-sm">
            Guest Account
          </div>
          <h1 className="font-display text-4xl font-bold text-stone-900 md:text-5xl">Manage My Activity</h1>
          <p className="mx-auto mt-4 max-w-3xl text-stone-600">
            Review, update, and delete your own bookings, reservations, and food orders from one clean guest control page.
          </p>
        </div>

        {message ? <div className="mb-6 rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-600">{message}</div> : null}
        {error ? <div className="mb-6 rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-600">{error}</div> : null}

        <div className="mb-6 grid gap-4 md:grid-cols-3">
          {stats.map((item) => (
            <StatCard key={item.title} title={item.title} value={item.value} subtitle={item.subtitle} />
          ))}
        </div>

        <div className="grid gap-6">
          <SectionCard title="My Bookings" subtitle="Edit or delete your booked table slots.">
            <div className="grid gap-4 md:grid-cols-2">
              {records.bookings.length ? (
                records.bookings.map((item) => (
                  <div key={item._id} className="rounded-3xl border border-slate-200 bg-white p-5">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="font-semibold text-slate-900">{item.restaurant?.name}</p>
                        <p className="text-sm text-slate-500">
                          {formatDate(item.bookingDate)} at {formatTime(item.timeSlot)}
                        </p>
                      </div>
                      <StatusBadge value={item.status} />
                    </div>
                    <p className="mt-3 text-sm text-slate-600">{item.guestCount} guests - {item.occasion || "Regular dining"}</p>
                    <div className="mt-4 flex gap-2">
                      <button type="button" onClick={() => openEditModal("bookings", item)} className="btn-secondary flex-1 py-2 text-sm">
                        <PencilLine className="mr-2 h-4 w-4" />
                        Edit
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDelete("bookings", item)}
                        className="flex-1 rounded-2xl border border-rose-200 bg-rose-50 px-4 py-2 text-sm font-semibold text-rose-600"
                      >
                        <Trash2 className="mr-2 inline h-4 w-4" />
                        Delete
                      </button>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-sm text-slate-500">No bookings yet. Create one from the Book Table page.</p>
              )}
            </div>
          </SectionCard>

          <SectionCard title="My Reservations" subtitle="Update future reservation details or remove them.">
            <div className="grid gap-4 md:grid-cols-2">
              {records.reservations.length ? (
                records.reservations.map((item) => (
                  <div key={item._id} className="rounded-3xl border border-slate-200 bg-white p-5">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="font-semibold text-slate-900">{item.restaurant?.name}</p>
                        <p className="text-sm text-slate-500">
                          {formatDate(item.reservationDate)} at {formatTime(item.timeSlot)}
                        </p>
                      </div>
                      <StatusBadge value={item.status} />
                    </div>
                    <p className="mt-3 text-sm text-slate-600">{item.guestCount} guests - {item.areaPreference || "Indoor"}</p>
                    <div className="mt-4 flex gap-2">
                      <button type="button" onClick={() => openEditModal("reservations", item)} className="btn-secondary flex-1 py-2 text-sm">
                        <PencilLine className="mr-2 h-4 w-4" />
                        Edit
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDelete("reservations", item)}
                        className="flex-1 rounded-2xl border border-rose-200 bg-rose-50 px-4 py-2 text-sm font-semibold text-rose-600"
                      >
                        <Trash2 className="mr-2 inline h-4 w-4" />
                        Delete
                      </button>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-sm text-slate-500">No reservations yet. Create one from the Book Table page.</p>
              )}
            </div>
          </SectionCard>

          <SectionCard title="My Orders" subtitle="Review and edit your own orders before they are processed.">
            <div className="grid gap-4 md:grid-cols-2">
              {records.orders.length ? (
                records.orders.map((item) => (
                  <div key={item._id} className="rounded-3xl border border-slate-200 bg-white p-5">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="font-semibold text-slate-900">{item.orderNumber}</p>
                        <p className="text-sm text-slate-500">{item.restaurant?.name}</p>
                      </div>
                      <StatusBadge value={item.status} />
                    </div>
                    <p className="mt-3 text-sm text-slate-600">
                      {(item.items || []).map((orderItem) => `${orderItem.name} x${orderItem.quantity}`).join(", ")}
                    </p>
                    <p className="mt-3 font-semibold text-amber-600">{formatCurrency(item.totalAmount)}</p>
                    <div className="mt-4 flex gap-2">
                      <button type="button" onClick={() => openEditModal("orders", item)} className="btn-secondary flex-1 py-2 text-sm">
                        <PencilLine className="mr-2 h-4 w-4" />
                        Edit
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDelete("orders", item)}
                        className="flex-1 rounded-2xl border border-rose-200 bg-rose-50 px-4 py-2 text-sm font-semibold text-rose-600"
                      >
                        <Trash2 className="mr-2 inline h-4 w-4" />
                        Delete
                      </button>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-sm text-slate-500">No orders yet. Create one from the Order Online page.</p>
              )}
            </div>
          </SectionCard>
        </div>

        <Modal
          open={Boolean(modalType && selectedItem)}
          onClose={closeModal}
          title={modalType ? `Edit ${guestConfigMap[modalType].title}` : "Edit"}
          subtitle="Update your own record and save the changes."
        >
          {modalType ? (
            <form onSubmit={handleSave} className="space-y-5">
              <div className="grid gap-4 md:grid-cols-2">
                {guestConfigMap[modalType].fields.map((field) => (
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
                <button type="submit" disabled={saving} className="btn-primary">
                  {saving ? "Saving..." : "Save Changes"}
                </button>
              </div>
            </form>
          ) : null}
        </Modal>
      </div>
    </section>
  );
};

export default GuestActivityPage;
