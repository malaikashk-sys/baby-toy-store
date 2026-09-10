import { useEffect, useState } from "react";
import api from "../services/api";

function AdminAuditLogs() {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchLogs = async () => {
      try {
        const response = await api.get("/audit-logs");
        setLogs(response.data.data);
      } catch (err) {
        setError(err.response?.data?.message || "Failed to load audit logs");
      } finally {
        setLoading(false);
      }
    };
    fetchLogs();
  }, []);

  if (loading) return <p className="text-center mt-10 text-gray-500">Loading audit logs...</p>;
  if (error) return <p className="text-center mt-10 text-red-500">{error}</p>;

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h2 className="text-2xl font-bold text-orange-700 mb-4">Audit Logs</h2>

      {logs.length === 0 ? (
        <p className="text-gray-500">No actions logged yet.</p>
      ) : (
        <div className="space-y-2">
          {logs.map((log) => (
            <div key={log._id} className="bg-white border border-gray-200 rounded-xl p-3 text-sm">
              <div className="flex justify-between items-start">
                <span className="font-medium text-gray-800">{log.performedByName}</span>
                <span className="text-xs text-gray-400">
                  {new Date(log.createdAt).toLocaleString()}
                </span>
              </div>
              <p className="text-gray-600 mt-1">
                <span className="text-orange-600 font-medium">{log.action}</span> — {log.details}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default AdminAuditLogs;