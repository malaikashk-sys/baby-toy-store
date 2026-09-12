import React, { useEffect, useState } from "react";
import api from "../services/api";

const STATUS_COLORS = {
  Pending: "bg-yellow-100 text-yellow-800 border-yellow-300",
  Processing: "bg-blue-100 text-blue-800 border-blue-300",
  Packed: "bg-purple-100 text-purple-800 border-purple-300",
  Shipped: "bg-indigo-100 text-indigo-800 border-indigo-300",
  Delivered: "bg-green-100 text-green-800 border-green-300",
  Cancelled: "bg-red-100 text-red-800 border-red-300",
};

export default function MyOrders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchMyOrders = async () => {
      try {
        const { data } = await api.get("/orders/my-orders");
        setOrders(data.data || data.orders || data || []);
      } catch (err) {
        setError("Failed to fetch order history.");
      } finally {
        setLoading(false);
      }
    };
    fetchMyOrders();
  }, []);

  if (loading) return <p className="text-center mt-10 text-gray-500">Loading order history...</p>;
  if (error) return <p className="text-center mt-10 text-red-500">{error}</p>;

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h2 className="text-2xl font-bold text-gray-800 mb-6">My Orders</h2>

      {orders.length === 0 ? (
        <p className="text-gray-500">You haven't placed any orders yet.</p>
      ) : (
        <div className="space-y-4">
          {orders.map((order) => (
            <div key={order._id} className="bg-white border rounded-xl p-5 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <p className="text-xs text-gray-400 font-mono">ORDER ID: {order._id}</p>
                <p className="text-sm text-gray-500 mt-1">
                  Placed on: {new Date(order.createdAt).toLocaleDateString()}
                </p>
                <div className="mt-2 flex flex-wrap gap-2">
                  {order.items?.map((item, idx) => (
                    <span key={idx} className="text-xs bg-gray-100 px-2 py-1 rounded text-gray-700">
                      {item.product?.name || "Item"} (x{item.quantity})
                    </span>
                  ))}
                </div>
              </div>

              <div className="flex md:flex-col items-end justify-between md:justify-center border-t md:border-t-0 pt-3 md:pt-0">
                <span className={`text-xs px-2.5 py-1 rounded-full border font-semibold ${STATUS_COLORS[order.orderStatus] || "bg-gray-100 text-gray-800"}`}>
                  {order.orderStatus || "Pending"}
                </span>
                <span className="text-lg font-bold text-orange-600 mt-1">
                  Rs. {order.totalAmount}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}