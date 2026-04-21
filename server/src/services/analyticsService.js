import Booking from "../models/Booking.js";
import MenuItem from "../models/MenuItem.js";
import Order from "../models/Order.js";
import Reservation from "../models/Reservation.js";
import Restaurant from "../models/Restaurant.js";
import Table from "../models/Table.js";
import User from "../models/User.js";
import { busyHourRange } from "../config/constants.js";
import { buildScopeFilter, mergeFilters } from "./queryService.js";
import { listRecentAuditLogs } from "./auditService.js";

const formatCurrency = (value) => Number(value || 0).toFixed(2);

const getDateKey = (value) => new Date(value).toISOString().split("T")[0];

const formatLabel = (value, options = {}) =>
  new Intl.DateTimeFormat("en-IN", {
    month: "short",
    day: "numeric",
    ...options,
  }).format(new Date(value));

const parseHour = (value, fallbackDate) => {
  if (!value && fallbackDate) {
    return new Date(fallbackDate).getHours();
  }

  if (!value) {
    return 0;
  }

  const [hour = "0"] = String(value).split(":");
  return Number(hour);
};

export const fetchScopedCollections = async (req) => {
  const restaurantScope = buildScopeFilter(req, "Restaurant");
  const menuScope = buildScopeFilter(req, "MenuItem");
  const tableScope = buildScopeFilter(req, "Table");
  const bookingScope = buildScopeFilter(req, "Booking");
  const reservationScope = buildScopeFilter(req, "Reservation");
  const orderScope = buildScopeFilter(req, "Order");
  const userScope = buildScopeFilter(req, "User");

  const [restaurants, menuItems, tables, bookings, reservations, orders, users] = await Promise.all([
    Restaurant.find(restaurantScope).lean(),
    MenuItem.find(menuScope).populate("restaurant", "name").lean(),
    Table.find(tableScope).populate("restaurant", "name").lean(),
    Booking.find(bookingScope).populate("restaurant table", "name tableNumber").lean(),
    Reservation.find(reservationScope).populate("restaurant", "name").lean(),
    Order.find(orderScope).populate("restaurant table", "name tableNumber").lean(),
    User.find(userScope).populate("restaurant", "name").lean(),
  ]);

  return { restaurants, menuItems, tables, bookings, reservations, orders, users };
};

const buildSalesTrend = (orders) => {
  const today = new Date();
  const buckets = Array.from({ length: 7 }, (_, index) => {
    const date = new Date(today);
    date.setDate(today.getDate() - (6 - index));
    return {
      key: getDateKey(date),
      label: formatLabel(date),
      sales: 0,
      orders: 0,
    };
  });

  const bucketMap = Object.fromEntries(buckets.map((item) => [item.key, item]));

  orders.forEach((order) => {
    const key = getDateKey(order.placedAt || order.createdAt);

    if (bucketMap[key]) {
      bucketMap[key].sales += Number(order.totalAmount || 0);
      bucketMap[key].orders += 1;
    }
  });

  return buckets.map((item) => ({
    ...item,
    sales: Number(formatCurrency(item.sales)),
  }));
};

const buildBusyHours = ({ bookings, reservations, orders }) => {
  const base = busyHourRange.map((hour) => ({
    hour,
    label: `${String(hour).padStart(2, "0")}:00`,
    bookings: 0,
    reservations: 0,
    orders: 0,
  }));

  const map = Object.fromEntries(base.map((item) => [item.hour, item]));

  bookings.forEach((booking) => {
    const hour = parseHour(booking.timeSlot, booking.bookingDate);
    if (map[hour]) {
      map[hour].bookings += 1;
    }
  });

  reservations.forEach((reservation) => {
    const hour = parseHour(reservation.timeSlot, reservation.reservationDate);
    if (map[hour]) {
      map[hour].reservations += 1;
    }
  });

  orders.forEach((order) => {
    const hour = parseHour(null, order.placedAt);
    if (map[hour]) {
      map[hour].orders += 1;
    }
  });

  return base.map((item) => ({
    ...item,
    traffic: item.bookings + item.reservations + item.orders,
  }));
};

const buildBreakdown = (list, field) => {
  const bucket = list.reduce((accumulator, item) => {
    const key = item[field] || "unknown";
    accumulator[key] = (accumulator[key] || 0) + 1;
    return accumulator;
  }, {});

  return Object.entries(bucket).map(([name, value]) => ({ name, value }));
};

const buildPopularItems = (orders) => {
  const bucket = {};

  orders.forEach((order) => {
    order.items.forEach((item) => {
      if (!bucket[item.name]) {
        bucket[item.name] = {
          name: item.name,
          orders: 0,
          revenue: 0,
        };
      }

      bucket[item.name].orders += Number(item.quantity || 0);
      bucket[item.name].revenue += Number(item.price || 0) * Number(item.quantity || 0);
    });
  });

  return Object.values(bucket)
    .sort((left, right) => right.orders - left.orders)
    .slice(0, 6)
    .map((item) => ({
      ...item,
      revenue: Number(formatCurrency(item.revenue)),
    }));
};

const buildRestaurantPerformance = ({ restaurants, orders, bookings }) => {
  return restaurants.map((restaurant) => {
    const restaurantOrders = orders.filter((order) => String(order.restaurant?._id || order.restaurant) === String(restaurant._id));
    const restaurantBookings = bookings.filter(
      (booking) => String(booking.restaurant?._id || booking.restaurant) === String(restaurant._id)
    );

    return {
      name: restaurant.name,
      revenue: Number(formatCurrency(restaurantOrders.reduce((sum, order) => sum + Number(order.totalAmount || 0), 0))),
      bookings: restaurantBookings.length,
      rating: restaurant.rating,
    };
  });
};

const buildCategoryMix = (menuItems) => buildBreakdown(menuItems, "category");

const buildInsightsNarrative = ({ revenue, occupancyRate, busyHours, topItem }) => {
  const peakHour = [...busyHours].sort((left, right) => right.traffic - left.traffic)[0];

  return [
    `Total tracked revenue is INR ${revenue.toLocaleString("en-IN")} with an average occupancy of ${occupancyRate}%.`,
    peakHour
      ? `Peak operational pressure appears around ${peakHour.label}, which is the ideal window to keep extra staff on the floor.`
      : "Guest flow is distributed evenly through the day in the current operating dataset.",
    topItem
      ? `${topItem.name} is the strongest seller right now, making it a good candidate for combo offers and hero placement.`
      : "No dominant best-seller is visible yet, so cross-selling experiments are still open.",
  ];
};

export const buildDashboardSummary = async (req) => {
  const { restaurants, menuItems, tables, bookings, reservations, orders, users } = await fetchScopedCollections(req);

  const totalRevenue = orders.reduce((sum, order) => sum + Number(order.totalAmount || 0), 0);
  const occupancyRate = tables.length ? Math.min(100, Math.round(((bookings.length + reservations.length) / tables.length) * 40)) : 0;
  const salesTrend = buildSalesTrend(orders);
  const busyHours = buildBusyHours({ bookings, reservations, orders });
  const popularItems = buildPopularItems(orders);

  return {
    stats: {
      totalRestaurants: restaurants.length,
      totalMenuItems: menuItems.length,
      totalTables: tables.length,
      totalBookings: bookings.length,
      totalOrders: orders.length,
      totalUsers: users.length,
      revenue: Number(formatCurrency(totalRevenue)),
      occupancyRate,
    },
    salesTrend,
    busyHours,
    orderStatusBreakdown: buildBreakdown(orders, "status"),
    bookingStatusBreakdown: buildBreakdown(bookings, "status"),
    popularItems,
    topRestaurants: buildRestaurantPerformance({ restaurants, orders, bookings }),
    recentOrders: orders
      .sort((left, right) => new Date(right.placedAt) - new Date(left.placedAt))
      .slice(0, 5),
    recentBookings: bookings
      .sort((left, right) => new Date(right.bookingDate) - new Date(left.bookingDate))
      .slice(0, 5),
    recentActivity: await listRecentAuditLogs(req, { limit: 6 }),
  };
};

export const buildReportsOverview = async (req) => {
  const { restaurants, menuItems, tables, bookings, reservations, orders } = await fetchScopedCollections(req);
  const revenue = orders.reduce((sum, order) => sum + Number(order.totalAmount || 0), 0);
  const busyHours = buildBusyHours({ bookings, reservations, orders });
  const categoryMix = buildCategoryMix(menuItems);
  const occupancyRate = tables.length ? Math.min(100, Math.round(((bookings.length + reservations.length) / tables.length) * 40)) : 0;
  const topItem = buildPopularItems(orders)[0];

  return {
    cards: [
      { title: "Revenue", value: `INR ${revenue.toLocaleString("en-IN")}`, subtitle: "Across all recorded orders" },
      { title: "Occupancy", value: `${occupancyRate}%`, subtitle: "Based on bookings and reservations" },
      { title: "Restaurants", value: restaurants.length, subtitle: "Active branches in the system" },
      { title: "Menu Coverage", value: menuItems.length, subtitle: "Total menu items tracked" },
    ],
    salesTrend: buildSalesTrend(orders),
    busyHours,
    categoryMix,
    topRestaurants: buildRestaurantPerformance({ restaurants, orders, bookings }),
    topItems: buildPopularItems(orders),
    narrative: buildInsightsNarrative({
      revenue,
      occupancyRate,
      busyHours,
      topItem,
    }),
  };
};

export const buildAIInsights = async (req) => {
  const { bookings, reservations, orders } = await fetchScopedCollections(req);
  const busyHours = buildBusyHours({ bookings, reservations, orders });
  const peakHour = [...busyHours].sort((left, right) => right.traffic - left.traffic)[0];
  const lowHour = [...busyHours].sort((left, right) => left.traffic - right.traffic)[0];
  const topItems = buildPopularItems(orders).slice(0, 3);

  return {
    busyHours,
    insights: [
      {
        title: "Peak Service Window",
        detail: peakHour
          ? `${peakHour.label} drives the highest mix of orders, bookings, and reservations in the current operating dataset.`
          : "Traffic is spread evenly with no strong peak hour detected.",
      },
      {
        title: "Opportunity Slot",
        detail: lowHour
          ? `${lowHour.label} shows softer demand, so that slot is suitable for happy-hour campaigns or combo offers.`
          : "Every operating hour already shows healthy traction.",
      },
      {
        title: "Best-Selling Dishes",
        detail: topItems.length
          ? `${topItems.map((item) => item.name).join(", ")} are currently leading order volume.`
          : "Menu demand is still too balanced to single out hero dishes.",
      },
    ],
    suggestions: [
      "Assign one additional staff member during the peak hour window to reduce table turnover delays.",
      "Push promotional banners or combo pricing during low-traffic windows to improve average order value.",
      "Highlight top-selling dishes in the guest ordering page to lift conversions during active service periods.",
    ],
  };
};
