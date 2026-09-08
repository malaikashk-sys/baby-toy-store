import { useEffect, useState } from "react";
import api from "../services/api";

function Notifications() {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchNotifications = async () => {
    try {
      const response = await api.get("/notifications");
      setNotifications(response.data.data);
    } catch (err) {
      setError("Failed to load notifications");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifications();
  }, []);

  const handleMarkAsRead = async (id) => {
    try {
      await api.put(`/notifications/${id}/read`);
      fetchNotifications();
    } catch (err) {
      // Silent fail — read status is not critical
    }
  };

  if (loading) return <p className="text-center mt-10 text-gray-500">Loading notifications...</p>;
  if (error) return <p className="text-center mt-10 text-red-500">{error}</p>;

  return (
    <div className="max-w-2xl mx-auto p-6">
      <h2 className="text-2xl font-bold text-orange-700 mb-4">Notifications</h2>

      {notifications.length === 0 ? (
        <p className="text-gray-500">No notifications yet.</p>
      ) : (
        <div className="space-y-3">
          {notifications.map((n) => (
            <div
              key={n._id}
              onClick={() => !n.readAt && handleMarkAsRead(n._id)}
              className={`border rounded-xl p-4 cursor-pointer transition ${
                n.readAt
                  ? "bg-white border-gray-200"
                  : "bg-orange-50 border-orange-200"
              }`}
            >
              <div className="flex justify-between items-start">
                <p className="font-semibold text-gray-800">{n.title}</p>
                {!n.readAt && (
                  <span className="text-xs bg-orange-500 text-white px-2 py-0.5 rounded-full">New</span>
                )}
              </div>
              <p className="text-sm text-gray-600 mt-1">{n.message}</p>
              <p className="text-xs text-gray-400 mt-2">{new Date(n.createdAt).toLocaleString()}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default Notifications;