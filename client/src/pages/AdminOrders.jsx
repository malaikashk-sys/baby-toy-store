import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import api from "../services/api";

const STATUS_OPTIONS = [
  "Pending Payment", "Paid", "Processing", "Packed", "Shipped", "Delivered", "Cancelled", "Returned",
];

function AdminOrders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [notes, setNotes] = useState({});
  const [exporting, setExporting] = useState(false);

  const fetchAllOrders = async () => {
    try {
      const response = await api.get("/orders/all");
      setOrders(response.data.data);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to load orders");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAllOrders();
  }, []);

  const handleStatusChange = async (orderId, newStatus) => {
    try {
      await api.put(`/orders/${orderId}/status`, { status: newStatus, note: notes[orderId] || "" });
      toast.success("Status updated!");
      setNotes({ ...notes, [orderId]: "" });
      fetchAllOrders();
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to update status");
    }
  };

  // CSV download — axios se blob fetch karke manually save karna hai
  // (taake Authorization header wali request bhi kaam kare, seedha <a href> se token nahi ja sakta)
  const handleExportCSV = async () => {
    setExporting(true);
    try {
      const response = await api.get("/orders/export/csv", { responseType: "blob" });
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", "orders_export.csv");
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
      toast.success("Orders CSV downloaded!");
    } catch (err) {
      toast.error("Failed to export orders");
    } finally {
      setExporting(false);
    }
  };

  if (loading) return <p className="text-center mt-10 text-gray-500">Loading orders...</p>;
  if (error) return <p className="text-center mt-10 text-red-500">{error}</p>;

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-bold text-orange-700">Admin — All Orders</h2>
        <button
          onClick={handleExportCSV}
          disabled={exporting}
          className="bg-orange-500 text-white text-sm px-4 py-2 rounded-lg hover:bg-orange-600 transition disabled:opacity-50"
        >
          {exporting ? "Exporting..." : "Export CSV"}
        </button>
      </div>

      <div className="space-y-4">
        {orders.map((order) => (
          <div key={order._id} className="bg-white border border-gray-200 rounded-xl p-4">
            <p className="text-xs text-gray-400">Order ID: {order._id}</p>
            <p className="text-sm text-gray-600">{order.user?.name} ({order.user?.email})</p>
            <p className="font-bold mt-1">Rs. {order.totalAmount}</p>

            <div className="flex flex-wrap gap-2 mt-2 items-center">
              <select
                value={order.status}
                onChange={(e) => handleStatusChange(order._id, e.target.value)}
                className="border border-gray-300 rounded-lg px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400"
              >
                {STATUS_OPTIONS.map((status) => (
                  <option key={status} value={status}>{status}</option>
                ))}
              </select>
              <input
                type="text"
                placeholder="Optional note for this status change"
                value={notes[order._id] || ""}
                onChange={(e) => setNotes({ ...notes, [order._id]: e.target.value })}
                className="border border-gray-300 rounded-lg px-2 py-1 text-sm flex-1 min-w-[160px] focus:outline-none focus:ring-2 focus:ring-orange-400"
              />
            </div>

            <ul className="text-sm text-gray-600 mt-2 list-disc list-inside">
              {order.items.map((item) => (
                <li key={item._id}>{item.name} — Qty: {item.quantity}</li>
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
    </div>
  );
}

export default AdminOrders;