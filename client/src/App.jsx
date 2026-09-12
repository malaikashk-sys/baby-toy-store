import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Toaster } from "react-hot-toast";
import Navbar from "./components/Navbar";
import Home from "./pages/Home";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Products from "./pages/Products";
import ProductDetail from "./pages/ProductDetail";
import Cart from "./pages/Cart";
import Orders from "./pages/Orders";
import Wishlist from "./pages/Wishlist";
import AdminOrders from "./pages/AdminOrders";
import Checkout from "./pages/Checkout";
import AdminProducts from "./pages/AdminProducts";
import AdminDashboard from "./pages/AdminDashboard";
import AdminCreateStaff from "./pages/AdminCreateStaff";
import Notifications from "./pages/Notifications";
import AdminReviews from "./pages/AdminReviews";
import AdminAuditLogs from "./pages/AdminAuditLogs";
import Profile from "./pages/Profile";
import AdminCustomers from "./pages/AdminCustomers";
import AdminCoupons from "./pages/AdminCoupons";
import ProtectedRoute from "./components/ProtectedRoute";

function App() {
  return (
    <BrowserRouter>
      <Toaster
        position="top-right"
        toastOptions={{
          duration: 3000,
          style: {
            background: "#fff7ed",
            color: "#c2410c",
            border: "1px solid #fed7aa",
          },
          success: {
            iconTheme: { primary: "#f97316", secondary: "#fff7ed" },
          },
        }}
      />
      <Navbar />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/products" element={<Products />} />
        <Route path="/products/:id" element={<ProductDetail />} />

        <Route path="/cart" element={<ProtectedRoute><Cart /></ProtectedRoute>} />
        <Route path="/orders" element={<ProtectedRoute><Orders /></ProtectedRoute>} />
        <Route path="/wishlist" element={<ProtectedRoute><Wishlist /></ProtectedRoute>} />
        <Route path="/notifications" element={<ProtectedRoute><Notifications /></ProtectedRoute>} />
        <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
        <Route path="/checkout" element={<ProtectedRoute><Checkout /></ProtectedRoute>} />

        <Route path="/admin/orders" element={<ProtectedRoute><AdminOrders /></ProtectedRoute>} />
        <Route path="/admin/dashboard" element={<ProtectedRoute><AdminDashboard /></ProtectedRoute>} />
        <Route path="/admin/create-staff" element={<ProtectedRoute><AdminCreateStaff /></ProtectedRoute>} />
        <Route path="/admin/products" element={<ProtectedRoute><AdminProducts /></ProtectedRoute>} />
        <Route path="/admin/reviews" element={<ProtectedRoute><AdminReviews /></ProtectedRoute>} />
        <Route path="/admin/audit-logs" element={<ProtectedRoute><AdminAuditLogs /></ProtectedRoute>} />
        <Route path="/admin/customers" element={<ProtectedRoute><AdminCustomers /></ProtectedRoute>} />
        <Route path="/admin/coupons" element={<ProtectedRoute><AdminCoupons /></ProtectedRoute>} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;