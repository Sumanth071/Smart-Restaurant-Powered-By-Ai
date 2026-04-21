import { Building2, CalendarClock, ClipboardList, IndianRupee, ShoppingBag, UsersRound } from "lucide-react";

import BusyHourChart from "../../components/charts/BusyHourChart";
import DonutStatusChart from "../../components/charts/DonutStatusChart";
import LineSalesChart from "../../components/charts/LineSalesChart";
import PageHeader from "../../components/layout/PageHeader";
import SectionCard from "../../components/ui/SectionCard";
import StatCard from "../../components/ui/StatCard";
import LoadingScreen from "../../components/ui/LoadingScreen";
import StatusBadge from "../../components/ui/StatusBadge";
import { useAuth } from "../../context/AuthContext";
import { useApiQuery } from "../../context/QueryClientContext";
import { formatCurrency, formatDate, formatDateTime, formatTime } from "../../utils/helpers";

const getRoleHighlights = (data, role) => {
  const liveOrders = data.recentOrders.filter((order) => ["pending", "preparing", "ready"].includes(order.status)).length;
  const peakHour = [...data.busyHours].sort((left, right) => right.traffic - left.traffic)[0];

  if (role === "staff") {
    return [
      { title: "Live Orders", value: liveOrders, subtitle: "Orders needing floor attention", icon: ShoppingBag },
      { title: "Upcoming Bookings", value: data.stats.totalBookings, subtitle: "Guest arrivals in the pipeline", icon: ClipboardList },
      { title: "Service Peak", value: peakHour?.label || "-", subtitle: "Highest pressure window", icon: CalendarClock },
      { title: "Mapped Tables", value: data.stats.totalTables, subtitle: "Tables available in scope", icon: Building2 },
    ];
  }

  if (role === "restaurant-admin") {
    return [
      { title: "Revenue", value: formatCurrency(data.stats.revenue), subtitle: "Current recorded revenue", icon: IndianRupee },
      { title: "Orders", value: data.stats.totalOrders, subtitle: "Across dine-in and takeaway", icon: ShoppingBag },
      { title: "Bookings", value: data.stats.totalBookings, subtitle: "Guest arrivals to manage", icon: ClipboardList },
      { title: "Occupancy", value: `${data.stats.occupancyRate}%`, subtitle: "Predicted table load", icon: CalendarClock },
    ];
  }

  return [
    { title: "Revenue", value: formatCurrency(data.stats.revenue), subtitle: "Current recorded revenue", icon: IndianRupee },
    { title: "Restaurants", value: data.stats.totalRestaurants, subtitle: "Branches in this workspace", icon: Building2 },
    { title: "Orders", value: data.stats.totalOrders, subtitle: "Across dine-in and takeaway", icon: ShoppingBag },
    { title: "Occupancy", value: `${data.stats.occupancyRate}%`, subtitle: "Predicted table load", icon: CalendarClock },
  ];
};

const DashboardPage = () => {
  const { user } = useAuth();
  const { data, error, isLoading } = useApiQuery({
    queryKey: ["dashboard-summary", user?.role || "unknown"],
    url: "/dashboard/summary",
    staleTime: 45000,
  });

  if (isLoading && !data) {
    return <LoadingScreen label="Loading dashboard insights..." />;
  }

  const statCards = data ? getRoleHighlights(data, user?.role) : [];
  const showChainView = user?.role === "super-admin";

  return (
    <div>
      <PageHeader
        eyebrow="Operations"
        title="Operations Overview"
        description="A clearer operational cockpit with role-aware highlights, service pressure analytics, and recent platform activity."
      />

      {error ? (
        <div className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-600">{error}</div>
      ) : null}

      {data ? (
        <>
          <div className="mb-6 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            {statCards.map((card) => (
              <StatCard key={card.title} title={card.title} value={card.value} subtitle={card.subtitle} icon={card.icon} />
            ))}
          </div>

          <div className="mb-6 grid gap-6 xl:grid-cols-[1.6fr_1fr]">
            <SectionCard title="Sales Trend" subtitle="Daily revenue trend over the last seven days.">
              <LineSalesChart data={data.salesTrend} />
            </SectionCard>
            <SectionCard title="Order Status Mix" subtitle="Live operational distribution of order states.">
              <DonutStatusChart data={data.orderStatusBreakdown} />
            </SectionCard>
          </div>

          <div className="mb-6 grid gap-6 xl:grid-cols-[1.4fr_1fr]">
            <SectionCard title="Busy Hour Analytics" subtitle="Traffic concentration built from orders, bookings, and reservations.">
              <BusyHourChart data={data.busyHours} />
            </SectionCard>
            <SectionCard title="Popular Menu Items" subtitle="Top-selling dishes by order volume.">
              <div className="space-y-4">
                {data.popularItems.map((item, index) => (
                  <div key={item.name} className="flex items-center justify-between rounded-2xl border border-slate-200 p-4">
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-[0.25em] text-slate-400">#{index + 1}</p>
                      <p className="mt-1 font-semibold text-slate-900">{item.name}</p>
                      <p className="text-sm text-slate-500">{item.orders} portions ordered</p>
                    </div>
                    <p className="text-sm font-semibold text-amber-600">{formatCurrency(item.revenue)}</p>
                  </div>
                ))}
              </div>
            </SectionCard>
          </div>

          <div className="grid gap-6 xl:grid-cols-[1.3fr_1fr]">
            <SectionCard title="Recent Orders" subtitle="Fresh operational activity from the service floor.">
              <div className="space-y-4">
                {data.recentOrders.map((order) => (
                  <div key={order._id} className="flex flex-col gap-3 rounded-3xl border border-slate-200 p-4 md:flex-row md:items-center md:justify-between">
                    <div>
                      <p className="font-semibold text-slate-900">{order.orderNumber}</p>
                      <p className="text-sm text-slate-500">
                        {order.customerName} at {order.restaurant?.name || "Restaurant"}
                      </p>
                      <p className="text-xs text-slate-400">{formatDate(order.placedAt)}</p>
                    </div>
                    <div className="flex items-center gap-3">
                      <StatusBadge value={order.status} />
                      <span className="font-semibold text-slate-900">{formatCurrency(order.totalAmount)}</span>
                    </div>
                  </div>
                ))}
              </div>
            </SectionCard>

            <SectionCard title="Recent Bookings" subtitle="Upcoming guest arrivals and booking pipeline.">
              <div className="space-y-4">
                {data.recentBookings.map((booking) => (
                  <div key={booking._id} className="rounded-3xl border border-slate-200 p-4">
                    <div className="flex items-center justify-between gap-3">
                      <div>
                        <p className="font-semibold text-slate-900">{booking.guestName}</p>
                        <p className="text-sm text-slate-500">{booking.restaurant?.name || "Restaurant"}</p>
                      </div>
                      <StatusBadge value={booking.status} />
                    </div>
                    <p className="mt-3 text-sm text-slate-500">
                      {formatDate(booking.bookingDate)} at {formatTime(booking.timeSlot)} for {booking.guestCount} guests
                    </p>
                  </div>
                ))}
              </div>
            </SectionCard>
          </div>

          <div className="mt-6 grid gap-6 xl:grid-cols-[1.25fr_0.75fr]">
            <SectionCard title="Recent Admin Activity" subtitle="A compact audit trail of create, update, delete, and status-change actions.">
              <div className="space-y-4">
                {(data.recentActivity || []).map((entry) => (
                  <div key={entry._id} className="rounded-[26px] border border-stone-200 bg-white/90 p-4">
                    <div className="flex items-center justify-between gap-3">
                      <div>
                        <p className="font-semibold text-stone-900">{entry.message}</p>
                        <p className="mt-1 text-sm text-stone-500">
                          {entry.actorName || entry.actor?.name || "Team member"} - {entry.actorRole || entry.actor?.role || "user"}
                        </p>
                      </div>
                      <StatusBadge value={entry.action} />
                    </div>
                    <p className="mt-3 text-xs uppercase tracking-[0.18em] text-stone-400">{formatDateTime(entry.createdAt)}</p>
                  </div>
                ))}
              </div>
            </SectionCard>

            <SectionCard title="Team Snapshot" subtitle="Quick overview of user, table, and branch scale.">
              <div className="grid gap-4">
                <StatCard title="Total Users" value={data.stats.totalUsers} subtitle="Across all roles" icon={UsersRound} />
                <StatCard title="Total Tables" value={data.stats.totalTables} subtitle="Mapped into service zones" icon={CalendarClock} />
                <StatCard title="Menu Items" value={data.stats.totalMenuItems} subtitle="Active dishes managed" icon={ShoppingBag} />
              </div>
            </SectionCard>
          </div>

          {showChainView ? (
            <SectionCard title="Chain Performance" subtitle="Cross-branch revenue and booking performance snapshot." className="mt-6">
              <div className="grid gap-4 md:grid-cols-2">
                {data.topRestaurants.map((restaurant, index) => (
                  <div key={restaurant.name} className="rounded-[28px] border border-slate-200 bg-white/90 p-5">
                    <p className="text-xs font-semibold uppercase tracking-[0.25em] text-stone-400">Branch #{index + 1}</p>
                    <p className="mt-2 text-lg font-semibold text-stone-900">{restaurant.name}</p>
                    <p className="mt-2 text-sm text-stone-500">
                      Revenue {formatCurrency(restaurant.revenue)} - {restaurant.bookings} bookings - Rating {restaurant.rating}
                    </p>
                  </div>
                ))}
              </div>
            </SectionCard>
          ) : null}
        </>
      ) : null}
    </div>
  );
};

export default DashboardPage;
