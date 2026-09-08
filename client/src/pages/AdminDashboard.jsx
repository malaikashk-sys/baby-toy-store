import { useEffect, useState } from "react";
import api from "../services/api";

function AdminDashboard() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await api.get("/orders/stats/summary");
        setStats(response.data.data);
      } catch (err) {
        setError(err.response?.data?.message || "Failed to load dashboard");
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  if (loading) return <p className="text-center mt-10 text-gray-500">Loading dashboard...</p>;
  if (error) return <p className="text-center mt-10 text-red-500">{error}</p>;

  const cards = [
    { label: "Total Revenue", value: `Rs. ${stats.totalRevenue.toFixed(2)}` },
    { label: "Total Orders", value: stats.totalOrders },
    { label: "Pending Payment", value: stats.pendingOrders },
    { label: "Total Products", value: stats.totalProducts },
    { label: "Total Customers", value: stats.totalCustomers },
  ];

  return (
    <div className="max-w-5xl mx-auto p-6">
      <h2 className="text-2xl font-bold text-orange-700 mb-6">Admin Dashboard</h2>

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4 mb-8">
        {cards.map((card) => (
          <div key={card.label} className="bg-white border border-gray-200 rounded-xl p-4 text-center shadow-sm">
            <p className="text-2xl font-bold text-orange-600">{card.value}</p>
            <p className="text-xs text-gray-500 mt-1">{card.label}</p>
          </div>
        ))}
      </div>

      <div className="bg-white border border-gray-200 rounded-xl p-4">
        <h3 className="text-lg font-semibold text-gray-800 mb-3">Orders by Status</h3>
        <div className="space-y-2">
          {stats.ordersByStatus.map((entry) => (
            <div key={entry._id} className="flex justify-between text-sm border-b border-gray-100 pb-1">
              <span className="text-gray-600">{entry._id}</span>
              <span className="font-medium text-orange-600">{entry.count}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default AdminDashboard;