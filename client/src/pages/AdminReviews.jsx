import { useEffect, useState } from "react";
import api from "../services/api";

function AdminReviews() {
  const [products, setProducts] = useState([]);
  const [selectedProduct, setSelectedProduct] = useState("");
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const response = await api.get("/products", { params: { limit: 100 } });
        setProducts(response.data.data);
      } catch (err) {
        setError("Failed to load products");
      }
    };
    fetchProducts();
  }, []);

  const fetchReviews = async (productId) => {
    if (!productId) {
      setReviews([]);
      return;
    }
    setLoading(true);
    setError("");
    try {
      const response = await api.get(`/reviews/admin/${productId}`);
      setReviews(response.data.data);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to load reviews");
    } finally {
      setLoading(false);
    }
  };

  const handleProductChange = (e) => {
    const productId = e.target.value;
    setSelectedProduct(productId);
    fetchReviews(productId);
  };

  const handleModerate = async (reviewId, status) => {
    setMessage("");
    try {
      await api.patch(`/reviews/moderate/${reviewId}`, { status });
      setMessage(`Review ${status}`);
      fetchReviews(selectedProduct);
    } catch (err) {
      setMessage(err.response?.data?.message || "Failed to update review");
    }
  };

  const handleDelete = async (reviewId) => {
    if (!window.confirm("Delete this review permanently?")) return;
    setMessage("");
    try {
      await api.delete(`/reviews/${reviewId}`);
      setMessage("Review deleted");
      fetchReviews(selectedProduct);
    } catch (err) {
      setMessage(err.response?.data?.message || "Failed to delete review");
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h2 className="text-2xl font-bold text-orange-700 mb-4">Review Moderation</h2>

      <select
        value={selectedProduct}
        onChange={handleProductChange}
        className="border border-gray-300 rounded-lg px-3 py-2 mb-6 w-full max-w-md focus:outline-none focus:ring-2 focus:ring-orange-400"
      >
        <option value="">Select a product to view reviews</option>
        {products.map((p) => (
          <option key={p._id} value={p._id}>{p.name}</option>
        ))}
      </select>

      {message && <p className="text-green-600 mb-4">{message}</p>}
      {error && <p className="text-red-500 mb-4">{error}</p>}

      {loading ? (
        <p className="text-gray-500">Loading reviews...</p>
      ) : !selectedProduct ? (
        <p className="text-gray-400">Select a product above to see its reviews.</p>
      ) : reviews.length === 0 ? (
        <p className="text-gray-500">No reviews for this product.</p>
      ) : (
        <div className="space-y-4">
          {reviews.map((review) => (
            <div
              key={review._id}
              className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm"
            >
              <div className="flex justify-between items-start">
                <div>
                  <p className="font-semibold text-gray-800">
                    {review.user?.name || "Unknown user"}{" "}
                    <span className="text-orange-600">{"★".repeat(review.rating)}</span>
                  </p>
                  <p className="text-gray-600 mt-1">{review.comment}</p>
                  {review.verifiedPurchase && (
                    <span className="text-xs text-green-600">Verified Purchase</span>
                  )}
                </div>
                <span
                  className={`text-xs px-2 py-1 rounded-full ${
                    review.status === "approved"
                      ? "bg-green-100 text-green-700"
                      : review.status === "rejected"
                      ? "bg-red-100 text-red-700"
                      : "bg-yellow-100 text-yellow-700"
                  }`}
                >
                  {review.status}
                </span>
              </div>

              <div className="flex gap-2 mt-3">
                {review.status !== "approved" && (
                  <button
                    onClick={() => handleModerate(review._id, "approved")}
                    className="border border-orange-500 text-orange-600 text-sm px-3 py-1.5 rounded-lg hover:bg-orange-50 transition"
                  >
                    Approve
                  </button>
                )}
                {review.status !== "rejected" && (
                  <button
                    onClick={() => handleModerate(review._id, "rejected")}
                    className="border border-gray-400 text-gray-700 text-sm px-3 py-1.5 rounded-lg hover:bg-gray-100 transition"
                  >
                    Reject
                  </button>
                )}
                <button
                  onClick={() => handleDelete(review._id)}
                  className="border border-red-400 text-red-600 text-sm px-3 py-1.5 rounded-lg hover:bg-red-50 transition"
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

export default AdminReviews;