import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import api from "../services/api";

function Profile() {
  const [addresses, setAddresses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState({
    label: "Home",
    line1: "",
    line2: "",
    city: "",
    state: "",
    zip: "",
    phone: "",
    isDefault: false,
  });
  const [saving, setSaving] = useState(false);

  const fetchAddresses = async () => {
    setLoading(true);
    try {
      const response = await api.get("/users/addresses");
      setAddresses(response.data.data || []);
    } catch (err) {
      toast.error("Failed to load addresses");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAddresses();
  }, []);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm({ ...form, [name]: type === "checkbox" ? checked : value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await api.post("/users/addresses", form);
      toast.success("Address added!");
      setForm({ label: "Home", line1: "", line2: "", city: "", state: "", zip: "", phone: "", isDefault: false });
      fetchAddresses();
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to add address");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (addressId) => {
    if (!window.confirm("Remove this address?")) return;
    try {
      await api.delete(`/users/addresses/${addressId}`);
      toast.success("Address removed");
      fetchAddresses();
    } catch (err) {
      toast.error("Failed to remove address");
    }
  };

  return (
    <div className="max-w-3xl mx-auto p-6">
      <h2 className="text-2xl font-bold text-orange-700 mb-6">My Addresses</h2>

      {loading ? (
        <p className="text-gray-500">Loading addresses...</p>
      ) : addresses.length === 0 ? (
        <p className="text-gray-500 mb-6">You haven't added any addresses yet.</p>
      ) : (
        <div className="space-y-3 mb-8">
          {addresses.map((addr) => (
            <div key={addr._id} className="bg-white border border-gray-200 rounded-xl p-4 flex justify-between items-start">
              <div>
                <p className="font-semibold text-gray-800">
                  {addr.label} {addr.isDefault && <span className="text-xs text-orange-600 ml-1">(Default)</span>}
                </p>
                <p className="text-sm text-gray-600">{addr.line1}{addr.line2 ? `, ${addr.line2}` : ""}</p>
                <p className="text-sm text-gray-600">{addr.city}{addr.state ? `, ${addr.state}` : ""} {addr.zip}</p>
                {addr.phone && <p className="text-sm text-gray-500">{addr.phone}</p>}
              </div>
              <button
                onClick={() => handleDelete(addr._id)}
                className="text-red-500 text-sm hover:underline"
              >
                Remove
              </button>
            </div>
          ))}
        </div>
      )}

      <div className="bg-white border border-gray-200 rounded-xl p-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">Add New Address</h3>
        <form onSubmit={handleSubmit} className="space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <input
              type="text" name="label" placeholder="Label (Home, Work...)"
              value={form.label} onChange={handleChange}
              className="border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-orange-400"
            />
            <input
              type="text" name="phone" placeholder="Phone"
              value={form.phone} onChange={handleChange}
              className="border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-orange-400"
            />
          </div>
          <input
            type="text" name="line1" placeholder="Address Line 1" required
            value={form.line1} onChange={handleChange}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-orange-400"
          />
          <input
            type="text" name="line2" placeholder="Address Line 2 (optional)"
            value={form.line2} onChange={handleChange}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-orange-400"
          />
          <div className="grid grid-cols-3 gap-3">
            <input
              type="text" name="city" placeholder="City" required
              value={form.city} onChange={handleChange}
              className="border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-orange-400"
            />
            <input
              type="text" name="state" placeholder="State"
              value={form.state} onChange={handleChange}
              className="border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-orange-400"
            />
            <input
              type="text" name="zip" placeholder="ZIP"
              value={form.zip} onChange={handleChange}
              className="border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-orange-400"
            />
          </div>
          <label className="flex items-center gap-2 text-sm text-gray-600">
            <input type="checkbox" name="isDefault" checked={form.isDefault} onChange={handleChange} />
            Set as default address
          </label>
          <button
            type="submit"
            disabled={saving}
            className="bg-orange-500 text-white px-4 py-2 rounded-lg hover:bg-orange-600 transition disabled:opacity-50"
          >
            {saving ? "Saving..." : "Add Address"}
          </button>
        </form>
      </div>
    </div>
  );
}

export default Profile;