import {
  BrowserRouter,
  Routes,
  Route
} from "react-router-dom";

import Login from "../pages/Login";
import Register from "../pages/Register";
import Products from "../pages/Products";
import Cart from "../pages/Cart";
import Orders from "../pages/Orders";
import Rewards from "../pages/Rewards";
import Profile from "../pages/Profile";
import PaymentSuccess
from "../pages/PaymentSuccess";
import PaymentCancel
from "../pages/PaymentCancel";
import OrderDetails
from "../pages/OrderDetails";
import PaymentHistory
from "../pages/PaymentHistory";
import Logout
from "../pages/Logout";
import AdminDashboard
from "../pages/AdminDashboard";
import AdminProducts
from "../pages/AdminProducts";
import AdminOrders
from "../pages/AdminOrders";
import AdminUsers
from "../pages/AdminUsers";

import ProtectedRoute
  from "./ProtectedRoute";
import AppLayout
  from "../layouts/AppLayout";
import AdminLayout
  from "../layouts/AdminLayout";

import { ToastProvider }
  from "../components/Toast";
import ScrollToTop
  from "../components/ScrollToTop";

function AppRoutes() {
  return (
    <BrowserRouter>
      <ToastProvider>
        <ScrollToTop />
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/register" element={<Register />} />

        <Route
          path="/products"
          element={
            <ProtectedRoute>
              <AppLayout><Products /></AppLayout>
            </ProtectedRoute>
          }
        />

        <Route
          path="/cart"
          element={
            <ProtectedRoute>
              <AppLayout><Cart /></AppLayout>
            </ProtectedRoute>
          }
        />

        <Route
          path="/orders"
          element={
            <ProtectedRoute>
              <AppLayout><Orders /></AppLayout>
            </ProtectedRoute>
          }
        />

        <Route
          path="/orders/:id"
          element={
            <ProtectedRoute>
              <AppLayout><OrderDetails /></AppLayout>
            </ProtectedRoute>
          }
        />

        <Route
          path="/rewards"
          element={
            <ProtectedRoute>
              <AppLayout><Rewards /></AppLayout>
            </ProtectedRoute>
          }
        />

        <Route
          path="/payment-history"
          element={
            <ProtectedRoute>
              <AppLayout><PaymentHistory /></AppLayout>
            </ProtectedRoute>
          }
        />

        <Route
          path="/profile"
          element={
            <ProtectedRoute>
              <AppLayout><Profile /></AppLayout>
            </ProtectedRoute>
          }
        />

        <Route
          path="/admin"
          element={<AdminLayout />}
        >
          <Route
            index
            element={<AdminDashboard />}
          />
          <Route
            path="products"
            element={<AdminProducts />}
          />
          <Route
            path="orders"
            element={<AdminOrders />}
          />
          <Route
            path="users"
            element={<AdminUsers />}
          />
        </Route>

        <Route
          path="/logout"
          element={<Logout />}
        />

        <Route
          path="/payment-success"
          element={<PaymentSuccess />}
        />

        <Route
          path="/payment-cancel"
          element={<PaymentCancel />}
        />
      </Routes>
      </ToastProvider>
    </BrowserRouter>
  );
}

export default AppRoutes;
