import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import api from "../services/api";

function AdminCoupons() {
  const [coupons, setCoupons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState({
    code: "",
    type: "percentage",
    value: "",
    minimumOrder: "",
    maxDiscount: "",
    expiresAt: "",
  });
  const [saving, setSaving] = useState(false);

  const fetchCoupons = async () => {
    setLoading(true);
    try {
      const response = await api.get("/coupons");
      setCoupons(response.data.data || []);
    } catch (err) {
      toast.error("Failed to load coupons");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCoupons();
  }, []);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await api.post("/coupons", {
        ...form,
        value: Number(form.value),
        minimumOrder: form.minimumOrder ? Number(form.minimumOrder) : 0,
        maxDiscount: form.maxDiscount ? Number(form.maxDiscount) : undefined,
      });
      toast.success("Coupon created!");
      setForm({ code: "", type: "percentage", value: "", minimumOrder: "", maxDiscount: "", expiresAt: "" });
      fetchCoupons();
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to create coupon");
    } finally {
      setSaving(false);
    }
  };

  const handleToggle = async (couponId) => {
    try {
      await api.patch(`/coupons/${couponId}/toggle`);
      toast.success("Coupon updated");
      fetchCoupons();
    } catch (err) {
      toast.error("Failed to update coupon");
    }
  };

    const handleDelete = async (couponId) => {
    if (!window.confirm("Delete this coupon permanently?")) return;
    try {
      await api.delete(`/coupons/${couponId}`);
      toast.success("Coupon deleted");
      fetchCoupons();
    } catch (err) {
      toast.error("Failed to delete coupon");
    }
  };

  return (
    <div className="max-w-3xl mx-auto p-6">
      <h2 className="text-2xl font-bold text-orange-700 mb-6">Coupon Management</h2>

      <div className="bg-white border border-gray-200 rounded-xl p-6 mb-8">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">Create Coupon</h3>
        <form onSubmit={handleSubmit} className="space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <input
              type="text" name="code" placeholder="Coupon Code (e.g. SAVE10)" required
              value={form.code} onChange={handleChange}
              className="border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-orange-400"
            />
            <select
              name="type" value={form.type} onChange={handleChange}
              className="border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-orange-400"
            >
              <option value="percentage">Percentage (%)</option>
              <option value="fixed">Fixed Amount (Rs.)</option>
            </select>
          </div>
          <div className="grid grid-cols-3 gap-3">
            <input
              type="number" name="value" placeholder="Value" required min="0"
              value={form.value} onChange={handleChange}
              className="border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-orange-400"
            />
            <input
              type="number" name="minimumOrder" placeholder="Min Order (optional)" min="0"
              value={form.minimumOrder} onChange={handleChange}
              className="border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-orange-400"
            />
            <input
              type="number" name="maxDiscount" placeholder="Max Discount (optional)" min="0"
              value={form.maxDiscount} onChange={handleChange}
              className="border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-orange-400"
            />
          </div>
          <div>
            <label className="block text-sm text-gray-600 mb-1">Expiry Date</label>
            <input
              type="date" name="expiresAt" required
              value={form.expiresAt} onChange={handleChange}
              className="border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-orange-400"
            />
          </div>
          <button
            type="submit"
            disabled={saving}
            className="bg-orange-500 text-white px-4 py-2 rounded-lg hover:bg-orange-600 transition disabled:opacity-50"
          >
            {saving ? "Creating..." : "Create Coupon"}
          </button>
        </form>
      </div>

      <h3 className="text-lg font-semibold text-gray-800 mb-3">Existing Coupons</h3>
      {loading ? (
        <p className="text-gray-500">Loading coupons...</p>
      ) : coupons.length === 0 ? (
        <p className="text-gray-500">No coupons yet.</p>
      ) : (
        <div className="space-y-2">
          {coupons.map((coupon) => (
            <div key={coupon._id} className="bg-white border border-gray-200 rounded-xl p-4 flex justify-between items-center">
              <div>
                <p className="font-semibold text-gray-800">
                  {coupon.code}{" "}
                  <span className="text-xs text-gray-500">
                    ({coupon.type === "percentage" ? `${coupon.value}%` : `Rs. ${coupon.value}`})
                  </span>
                </p>
                <p className="text-xs text-gray-500">
                  Expires: {new Date(coupon.expiresAt).toLocaleDateString()}
                  {coupon.minimumOrder ? ` • Min order: Rs. ${coupon.minimumOrder}` : ""}
                </p>
              </div>
              <div className="flex items-center gap-3">
                <span className={`text-xs px-2 py-1 rounded-full ${coupon.active ? "bg-green-100 text-green-700" : "bg-gray-200 text-gray-600"}`}>
                  {coupon.active ? "Active" : "Inactive"}
                </span>
                               <button
                  onClick={() => handleToggle(coupon._id)}
                  className="text-xs border border-orange-500 text-orange-600 px-3 py-1.5 rounded-lg hover:bg-orange-50 transition"
                >
                  {coupon.active ? "Deactivate" : "Activate"}
                </button>
                <button
                  onClick={() => handleDelete(coupon._id)}
                  className="text-xs border border-red-400 text-red-600 px-3 py-1.5 rounded-lg hover:bg-red-50 transition"
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default AdminCoupons;