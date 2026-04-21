import { Navigate, Route, Routes } from "react-router-dom";

import DashboardLayout from "./components/layout/DashboardLayout";
import ProtectedRoute from "./components/layout/ProtectedRoute";
import PublicLayout from "./components/layout/PublicLayout";
import LoginPage from "./pages/auth/LoginPage";
import AIInsightsPage from "./pages/dashboard/AIInsightsPage";
import BookingsPage from "./pages/dashboard/BookingsPage";
import DashboardPage from "./pages/dashboard/DashboardPage";
import MenuPage from "./pages/dashboard/MenuPage";
import OrdersPage from "./pages/dashboard/OrdersPage";
import ReportsPage from "./pages/dashboard/ReportsPage";
import ReservationsPage from "./pages/dashboard/ReservationsPage";
import RestaurantsPage from "./pages/dashboard/RestaurantsPage";
import TablesPage from "./pages/dashboard/TablesPage";
import UsersPage from "./pages/dashboard/UsersPage";
import GuestBookingPage from "./pages/guest/GuestBookingPage";
import GuestActivityPage from "./pages/guest/GuestActivityPage";
import GuestHomePage from "./pages/guest/GuestHomePage";
import GuestOrderPage from "./pages/guest/GuestOrderPage";
import SupportPage from "./pages/guest/SupportPage";
import { getModuleRoles } from "./data/accessControl";

const App = () => (
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
);

export default App;
