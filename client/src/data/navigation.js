import {
  Bot,
  CalendarCheck2,
  ChartColumnBig,
  LayoutDashboard,
  ReceiptText,
  Store,
  TableProperties,
  UserCog,
  UtensilsCrossed,
} from "lucide-react";

export const dashboardNavigation = [
  {
    label: "Overview",
    to: "/dashboard",
    icon: LayoutDashboard,
    roles: ["super-admin", "restaurant-admin", "staff"],
  },
  {
    label: "Restaurants",
    to: "/dashboard/restaurants",
    icon: Store,
    roles: ["super-admin", "restaurant-admin"],
  },
  {
    label: "Menu",
    to: "/dashboard/menu",
    icon: UtensilsCrossed,
    roles: ["super-admin", "restaurant-admin", "staff"],
  },
  {
    label: "Tables",
    to: "/dashboard/tables",
    icon: TableProperties,
    roles: ["super-admin", "restaurant-admin", "staff"],
  },
  {
    label: "Bookings",
    to: "/dashboard/bookings",
    icon: CalendarCheck2,
    roles: ["super-admin", "restaurant-admin", "staff"],
  },
  {
    label: "Orders",
    to: "/dashboard/orders",
    icon: ReceiptText,
    roles: ["super-admin", "restaurant-admin", "staff"],
  },
  {
    label: "Reservations",
    to: "/dashboard/reservations",
    icon: CalendarCheck2,
    roles: ["super-admin", "restaurant-admin", "staff"],
  },
  {
    label: "Users",
    to: "/dashboard/users",
    icon: UserCog,
    roles: ["super-admin", "restaurant-admin"],
  },
  {
    label: "Reports",
    to: "/dashboard/reports",
    icon: ChartColumnBig,
    roles: ["super-admin", "restaurant-admin", "staff"],
  },
  {
    label: "AI Hub",
    to: "/dashboard/ai",
    icon: Bot,
    roles: ["super-admin", "restaurant-admin", "staff"],
  },
];
