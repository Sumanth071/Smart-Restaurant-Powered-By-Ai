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
import { getModuleRoles } from "./accessControl";

export const dashboardNavigation = [
  {
    label: "Overview",
    to: "/dashboard",
    icon: LayoutDashboard,
    roles: getModuleRoles("overview"),
  },
  {
    label: "Restaurants",
    to: "/dashboard/restaurants",
    icon: Store,
    roles: getModuleRoles("restaurants"),
  },
  {
    label: "Menu",
    to: "/dashboard/menu",
    icon: UtensilsCrossed,
    roles: getModuleRoles("menu"),
  },
  {
    label: "Tables",
    to: "/dashboard/tables",
    icon: TableProperties,
    roles: getModuleRoles("tables"),
  },
  {
    label: "Bookings",
    to: "/dashboard/bookings",
    icon: CalendarCheck2,
    roles: getModuleRoles("bookings"),
  },
  {
    label: "Orders",
    to: "/dashboard/orders",
    icon: ReceiptText,
    roles: getModuleRoles("orders"),
  },
  {
    label: "Reservations",
    to: "/dashboard/reservations",
    icon: CalendarCheck2,
    roles: getModuleRoles("reservations"),
  },
  {
    label: "Users",
    to: "/dashboard/users",
    icon: UserCog,
    roles: getModuleRoles("users"),
  },
  {
    label: "Reports",
    to: "/dashboard/reports",
    icon: ChartColumnBig,
    roles: getModuleRoles("reports"),
  },
  {
    label: "AI Hub",
    to: "/dashboard/ai",
    icon: Bot,
    roles: getModuleRoles("ai"),
  },
];
