import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import api from "../services/api";

function Orders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [couponCode, setCouponCode] = useState("");

  const fetchOrders = async () => {
    try {
      const response = await api.get("/orders");
      setOrders(response.data.data);
    } catch (err) {
      setError("Failed to load orders");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const handleCheckout = async () => {
    try {
      const response = await api.post("/orders", { couponCode });
      toast.success(`Order placed! Total: Rs. ${response.data.data.totalAmount}`);
      fetchOrders();
    } catch (err) {
      toast.error(err.response?.data?.message || "Checkout failed");
    }
  };

  if (loading) return <p className="text-center mt-10 text-gray-500">Loading orders...</p>;

  return (
    <div className="max-w-3xl mx-auto p-6">
      <h2 className="text-2xl font-bold text-orange-700 mb-4">My Orders</h2>

      <div className="flex gap-2 mb-4">
        <input
          type="text"
          placeholder="Coupon code (optional)"
          value={couponCode}
          onChange={(e) => setCouponCode(e.target.value)}
          className="flex-1 border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-orange-400"
        />
        <button onClick={handleCheckout} className="bg-orange-500 text-white px-4 rounded-lg hover:bg-orange-600 transition">
          Checkout Cart
        </button>
      </div>

      {error && <p className="text-red-500 mb-4">{error}</p>}

      {orders.length === 0 ? (
        <p className="text-gray-500">No orders yet.</p>
      ) : (
        <div className="space-y-4">
          {orders.map((order) => (
            <div key={order._id} className="bg-white border border-gray-200 rounded-xl p-4">
              <p className="text-xs text-gray-400">Order ID: {order._id}</p>
              <p className="text-sm font-medium text-orange-600">{order.status}</p>
              <p className="font-bold mt-1">Rs. {order.totalAmount}</p>
              <ul className="text-sm text-gray-600 mt-2 list-disc list-inside">
                {order.items.map((item) => (
                  <li key={item._id}>{item.name} — Qty: {item.quantity} × Rs. {item.price}</li>
                ))}
              </ul>

              {order.statusHistory && order.statusHistory.length > 0 && (
                <div className="mt-3 pt-3 border-t border-gray-100">
                  <p className="text-xs font-medium text-gray-500 mb-2">Order Timeline</p>
                  <div className="space-y-1">
                    {order.statusHistory.map((entry, idx) => (
                      <div key={idx} className="flex items-center gap-2 text-xs text-gray-500">
                        <span className="w-2 h-2 rounded-full bg-orange-400 flex-shrink-0"></span>
                        <span className="font-medium text-gray-700">{entry.status}</span>
                        <span>—</span>
                        <span>{new Date(entry.changedAt).toLocaleString()}</span>
                        {entry.note && <span className="italic">({entry.note})</span>}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default Orders;