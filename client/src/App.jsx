import { lazy, Suspense } from "react";
import { Navigate, Route, Routes } from "react-router-dom";

import ProtectedRoute from "./components/layout/ProtectedRoute";
import { getModuleRoles } from "./data/accessControl";

const DashboardLayout = lazy(() => import("./components/layout/DashboardLayout"));
const PublicLayout = lazy(() => import("./components/layout/PublicLayout"));
const LoginPage = lazy(() => import("./pages/auth/LoginPage"));
const AIInsightsPage = lazy(() => import("./pages/dashboard/AIInsightsPage"));
const BookingsPage = lazy(() => import("./pages/dashboard/BookingsPage"));
const DashboardPage = lazy(() => import("./pages/dashboard/DashboardPage"));
const MenuPage = lazy(() => import("./pages/dashboard/MenuPage"));
const OrdersPage = lazy(() => import("./pages/dashboard/OrdersPage"));
const ReportsPage = lazy(() => import("./pages/dashboard/ReportsPage"));
const ReservationsPage = lazy(() => import("./pages/dashboard/ReservationsPage"));
const RestaurantsPage = lazy(() => import("./pages/dashboard/RestaurantsPage"));
const TablesPage = lazy(() => import("./pages/dashboard/TablesPage"));
const UsersPage = lazy(() => import("./pages/dashboard/UsersPage"));
const GuestBookingPage = lazy(() => import("./pages/guest/GuestBookingPage"));
const GuestActivityPage = lazy(() => import("./pages/guest/GuestActivityPage"));
const GuestHomePage = lazy(() => import("./pages/guest/GuestHomePage"));
const GuestOrderPage = lazy(() => import("./pages/guest/GuestOrderPage"));
const SupportPage = lazy(() => import("./pages/guest/SupportPage"));

const App = () => (
  <Suspense
    fallback={
      <div className="flex min-h-screen items-center justify-center bg-[linear-gradient(180deg,#fff8ef_0%,#ffffff_100%)] px-6 text-center">
        <div>
          <div className="mx-auto h-12 w-12 animate-spin rounded-full border-4 border-brand-100 border-t-brand-500" />
          <p className="mt-4 text-sm font-medium uppercase tracking-[0.28em] text-brand-600">Loading workspace</p>
        </div>
      </div>
    }
  >
    <Routes>
      <Route element={<PublicLayout />}>
        <Route path="/" element={<GuestHomePage />} />
        <Route path="/book-table" element={<GuestBookingPage />} />
        <Route path="/my-activity" element={<GuestActivityPage />} />
        <Route path="/order-online" element={<GuestOrderPage />} />
        <Route path="/support" element={<SupportPage />} />
        <Route path="/login" element={<LoginPage />} />
      </Route>

      <Route element={<ProtectedRoute roles={["super-admin", "restaurant-admin", "staff"]} />}>
        <Route path="/dashboard" element={<DashboardLayout />}>
          <Route element={<ProtectedRoute roles={getModuleRoles("overview")} />}>
            <Route index element={<DashboardPage />} />
          </Route>
          <Route element={<ProtectedRoute roles={getModuleRoles("restaurants")} />}>
            <Route path="restaurants" element={<RestaurantsPage />} />
          </Route>
          <Route element={<ProtectedRoute roles={getModuleRoles("menu")} />}>
            <Route path="menu" element={<MenuPage />} />
          </Route>
          <Route element={<ProtectedRoute roles={getModuleRoles("tables")} />}>
            <Route path="tables" element={<TablesPage />} />
          </Route>
          <Route element={<ProtectedRoute roles={getModuleRoles("bookings")} />}>
            <Route path="bookings" element={<BookingsPage />} />
          </Route>
          <Route element={<ProtectedRoute roles={getModuleRoles("orders")} />}>
            <Route path="orders" element={<OrdersPage />} />
          </Route>
          <Route element={<ProtectedRoute roles={getModuleRoles("reservations")} />}>
            <Route path="reservations" element={<ReservationsPage />} />
          </Route>
          <Route element={<ProtectedRoute roles={getModuleRoles("users")} />}>
            <Route path="users" element={<UsersPage />} />
          </Route>
          <Route element={<ProtectedRoute roles={getModuleRoles("reports")} />}>
            <Route path="reports" element={<ReportsPage />} />
          </Route>
          <Route element={<ProtectedRoute roles={getModuleRoles("ai")} />}>
            <Route path="ai" element={<AIInsightsPage />} />
          </Route>
        </Route>
      </Route>

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  </Suspense>
);

export default App;
