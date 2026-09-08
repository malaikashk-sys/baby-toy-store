import { Link, useNavigate } from "react-router-dom";

function Navbar() {
  const navigate = useNavigate();
  const storedUser = localStorage.getItem("user");
  const user = storedUser ? JSON.parse(storedUser) : null;
  const isAdminOrStaff = user && (user.role === "admin" || user.role === "staff");
  const isAdmin = user && user.role === "admin";
  // Shopping features sirf customers (aur logged-out guests) ke liye — admin/staff ke kaam ki nahi
  const showShoppingLinks = !isAdminOrStaff;

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/login");
  };

  return (
    <nav className="bg-orange-500 text-white shadow-md">
      <div className="max-w-6xl mx-auto px-4 py-3 flex flex-wrap items-center justify-between">
        <div className="flex items-center gap-3">
          <Link to="/" className="text-xl font-bold">🧸 Baby Toys Store</Link>
          {user && (
            <span className="text-xs bg-white text-orange-600 font-semibold px-2 py-1 rounded-full uppercase">
              {user.role} — {user.name}
            </span>
          )}
        </div>
        <div className="flex gap-4 text-sm font-medium flex-wrap items-center">
          <Link to="/products" className="hover:text-orange-100">Products</Link>
          {showShoppingLinks && (
            <>
              <Link to="/cart" className="hover:text-orange-100">Cart</Link>
              <Link to="/wishlist" className="hover:text-orange-100">Wishlist</Link>
              <Link to="/orders" className="hover:text-orange-100">Orders</Link>
              <Link to="/checkout" className="hover:text-orange-100">Checkout</Link>
              {user && (
                <Link to="/notifications" className="hover:text-orange-100">Notifications</Link>
              )}
            </>
          )}
          {isAdminOrStaff && (
            <>
              <Link to="/admin/dashboard" className="hover:text-orange-100">Dashboard</Link>
              <Link to="/admin/orders" className="hover:text-orange-100">Admin</Link>
            </>
          )}
          {isAdmin && (
            <Link to="/admin/create-staff" className="hover:text-orange-100">Add Staff</Link>
          )}
          {user ? (
            <button onClick={handleLogout} className="hover:text-orange-100">Logout</button>
          ) : (
            <>
              <Link to="/login" className="hover:text-orange-100">Login</Link>
              <Link to="/register" className="hover:text-orange-100">Register</Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}

export default Navbar;