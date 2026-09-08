import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import toast from "react-hot-toast";
import api from "../services/api";

function Cart() {
  const [cart, setCart] = useState({ items: [] });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [couponCode, setCouponCode] = useState("");
  const [couponResult, setCouponResult] = useState(null);

  const fetchCart = async () => {
    try {
      const response = await api.get("/cart");
      setCart(response.data.data);
    } catch (err) {
      setError("Failed to load cart");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCart();
  }, []);

  const handleRemove = async (productId) => {
    try {
      await api.delete(`/cart/${productId}`);
      toast.success("Item removed");
      fetchCart();
    } catch (err) {
      toast.error("Failed to remove item");
    }
  };

  const handleQuantityChange = async (productId, newQuantity) => {
    if (newQuantity < 1) return;
    try {
      await api.put(`/cart/${productId}`, { quantity: newQuantity });
      fetchCart();
    } catch (err) {
      toast.error("Failed to update quantity");
    }
  };

  const handleApplyCoupon = async () => {
    setCouponResult(null);
    try {
      const response = await api.post("/coupons/validate", { code: couponCode, orderAmount: total });
      setCouponResult(response.data.data);
      toast.success("Coupon applied!");
    } catch (err) {
      toast.error(err.response?.data?.message || "Invalid coupon");
    }
  };

  if (loading) return <p className="text-center mt-10 text-gray-500">Loading cart...</p>;
  if (error) return <p className="text-center mt-10 text-red-500">{error}</p>;

  // Kuch cart items ka product delete ho chuka ho sakta hai (product ab null hoga) —
  // aise items ko total aur render dono se exclude kar rahe hain taake crash na ho.
  const validItems = cart.items.filter((item) => item.product);

  const total = validItems.reduce((sum, item) => sum + item.product.price * item.quantity, 0);

  return (
    <div className="max-w-2xl mx-auto p-6">
      <h2 className="text-2xl font-bold text-orange-700 mb-4">My Cart</h2>

      {validItems.length === 0 ? (
        <p className="text-gray-500">Your cart is empty.</p>
      ) : (
        <>
          <div className="space-y-3">
            {validItems.map((item) => (
              <div key={item._id} className="bg-white border border-gray-200 rounded-xl p-4 flex justify-between items-center">
                <div>
                  <p className="font-medium text-gray-800">{item.product.name}</p>
                  <div className="flex items-center gap-2 mt-1">
                    <button onClick={() => handleQuantityChange(item.product._id, item.quantity - 1)} className="w-7 h-7 bg-gray-100 rounded hover:bg-gray-200">-</button>
                    <span className="w-6 text-center">{item.quantity}</span>
                    <button onClick={() => handleQuantityChange(item.product._id, item.quantity + 1)} className="w-7 h-7 bg-gray-100 rounded hover:bg-gray-200">+</button>
                    <span className="text-sm text-gray-500">× Rs. {item.product.price}</span>
                  </div>
                </div>
                <button onClick={() => handleRemove(item.product._id)} className="text-red-500 text-sm hover:underline">Remove</button>
              </div>
            ))}
          </div>

          <h3 className="text-lg font-semibold mt-6">Subtotal: Rs. {total.toFixed(2)}</h3>

          <div className="flex gap-2 mt-4">
            <input
              type="text"
              placeholder="Enter coupon code"
              value={couponCode}
              onChange={(e) => setCouponCode(e.target.value)}
              className="flex-1 border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-orange-400"
            />
            <button onClick={handleApplyCoupon} className="bg-orange-500 text-white px-4 rounded-lg hover:bg-orange-600 transition">
              Apply
            </button>
          </div>

          {couponResult && (
            <div className="mt-3 bg-orange-50 border border-orange-200 rounded-lg p-3">
              <p className="text-sm">Discount: Rs. {couponResult.discount.toFixed(2)}</p>
              <p className="font-bold text-orange-700">Final Total: Rs. {couponResult.finalAmount.toFixed(2)}</p>
            </div>
          )}

          <Link
            to="/checkout"
            className="block text-center mt-6 bg-orange-500 text-white py-3 rounded-lg font-semibold hover:bg-orange-600 transition"
          >
            Proceed to Checkout
          </Link>
        </>
      )}
    </div>
  );
}

export default Cart;