import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import api from "../services/api";

function AdminCustomers() {
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchCustomers = async () => {
    setLoading(true);
    try {
      const response = await api.get("/users/customers");
      setCustomers(response.data.data || []);
    } catch (err) {
      toast.error("Failed to load customers");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCustomers();
  }, []);

  const handleToggleStatus = async (customerId, currentStatus) => {
    const newStatus = currentStatus === "active" ? "blocked" : "active";
    try {
      await api.patch(`/users/customers/${customerId}/status`, { status: newStatus });
      toast.success(`Customer ${newStatus}`);
      fetchCustomers();
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to update status");
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h2 className="text-2xl font-bold text-orange-700 mb-6">Customer Management</h2>

      {loading ? (
        <p className="text-gray-500">Loading customers...</p>
      ) : customers.length === 0 ? (
        <p className="text-gray-500">No customers found.</p>
      ) : (
        <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-orange-50 text-left">
              <tr>
                <th className="p-3 text-gray-700">Name</th>
                <th className="p-3 text-gray-700">Email</th>
                <th className="p-3 text-gray-700">Status</th>
                <th className="p-3 text-gray-700">Joined</th>
                <th className="p-3 text-gray-700">Action</th>
              </tr>
            </thead>
            <tbody>
              {customers.map((customer) => (
                <tr key={customer._id} className="border-t border-gray-100">
                  <td className="p-3 text-gray-800">{customer.name}</td>
                  <td className="p-3 text-gray-600">{customer.email}</td>
                  <td className="p-3">
                    <span
                      className={`text-xs px-2 py-1 rounded-full ${
                        customer.status === "active"
                          ? "bg-green-100 text-green-700"
                          : "bg-red-100 text-red-700"
                      }`}
                    >
                      {customer.status}
                    </span>
                  </td>
                  <td className="p-3 text-gray-500">
                    {new Date(customer.createdAt).toLocaleDateString()}
                  </td>
                  <td className="p-3">
                    <button
                      onClick={() => handleToggleStatus(customer._id, customer.status)}
                      className={`text-xs px-3 py-1.5 rounded-lg border transition ${
                        customer.status === "active"
                          ? "border-red-400 text-red-600 hover:bg-red-50"
                          : "border-green-500 text-green-600 hover:bg-green-50"
                      }`}
                    >
                      {customer.status === "active" ? "Block" : "Unblock"}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

export default AdminCustomers;