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
        <Route path="/cart" element={<Cart />} />
        <Route path="/orders" element={<Orders />} />
        <Route path="/wishlist" element={<Wishlist />} />
        <Route path="/notifications" element={<Notifications />} />
        <Route path="/admin/orders" element={<AdminOrders />} />
        <Route path="/admin/dashboard" element={<AdminDashboard />} />
        <Route path="/admin/create-staff" element={<AdminCreateStaff />} />
        <Route path="/checkout" element={<Checkout />} />
        <Route path="/admin/products" element={<AdminProducts />} />
        <Route path="/admin/reviews" element={<AdminReviews />} />
        <Route path="/admin/audit-logs" element={<AdminAuditLogs />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;