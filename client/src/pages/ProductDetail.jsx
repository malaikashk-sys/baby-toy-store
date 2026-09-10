import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import toast from "react-hot-toast";
import api from "../services/api";

function ProductDetail() {
  const { id } = useParams();
  const [product, setProduct] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");
  const [message, setMessage] = useState("");
  const [selectedVariantIndex, setSelectedVariantIndex] = useState("");

  const storedUser = JSON.parse(localStorage.getItem("user") || "null");
  const isCustomer = storedUser?.role === "customer";

  const fetchReviews = async () => {
    try {
      const response = await api.get(`/reviews/${id}`);
      setReviews(response.data.data);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const response = await api.get("/products");
        const found = response.data.data.find((p) => p._id === id);
        setProduct(found);
      } catch (err) {
        console.error(err);
      }
    };
    fetchProduct();
    // Reviews sirf customer-facing hain, admin/staff ke liye Review Moderation page hai
    if (isCustomer) {
      fetchReviews();
    }
  }, [id]);

  const handleSubmitReview = async (e) => {
    e.preventDefault();
    setMessage("");
    try {
      await api.post(`/reviews/${id}`, { rating: Number(rating), comment });
      setMessage("Review submitted!");
      setComment("");
      fetchReviews();
    } catch (err) {
      setMessage(err.response?.data?.message || "Failed to submit review");
    }
  };

  const hasVariants = product?.variants && product.variants.length > 0;
  const selectedVariant =
    hasVariants && selectedVariantIndex !== ""
      ? product.variants[selectedVariantIndex]
      : null;

  const displayPrice = selectedVariant?.price || product?.price;

  const handleAddToCart = async () => {
    if (hasVariants && !selectedVariant) {
      toast.error("Please select a variant first");
      return;
    }

    try {
      const payload = { productId: id, quantity: 1 };
      if (selectedVariant) {
        payload.size = selectedVariant.size;
        payload.color = selectedVariant.color;
      }
      await api.post("/cart", payload);
      toast.success("Added to cart!");
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to add to cart");
    }
  };

  if (!product) return <p className="text-center mt-10 text-gray-500">Loading...</p>;

  return (
    <div className="max-w-3xl mx-auto p-6">
      <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
        <h2 className="text-2xl font-bold text-gray-800">{product.name}</h2>
        <p className="text-gray-500">{product.brand}</p>
        <p className="text-orange-600 font-bold text-xl mt-2">Rs. {displayPrice}</p>
        <p className="text-sm text-gray-500 mt-2">{product.description}</p>

        {/* Variant selector aur Add to Cart sirf customers ke liye — admin/staff shopping nahi karte */}
        {isCustomer && (
          <>
            {hasVariants && (
              <div className="mt-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Select Variant
                </label>
                <select
                  value={selectedVariantIndex}
                  onChange={(e) => setSelectedVariantIndex(e.target.value)}
                  className="border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-orange-400"
                >
                  <option value="">-- Choose size/color --</option>
                  {product.variants.map((v, idx) => (
                    <option key={idx} value={idx} disabled={v.stock === 0}>
                      {v.size}{v.size && v.color ? " - " : ""}{v.color}
                      {v.stock === 0 ? " (Out of stock)" : ` (Stock: ${v.stock})`}
                    </option>
                  ))}
                </select>
              </div>
            )}

            <button
              onClick={handleAddToCart}
              className="mt-4 bg-orange-500 text-white px-4 py-2 rounded-lg hover:bg-orange-600 transition"
            >
              Add to Cart
            </button>
          </>
        )}
      </div>

      {/* Reviews section — sirf customers ke liye. Admin/staff Review Moderation page use karte hain. */}
      {isCustomer && (
        <div className="mt-8">
          <h3 className="text-lg font-bold text-orange-700 mb-3">Reviews</h3>

          <form onSubmit={handleSubmitReview} className="bg-white border border-gray-200 rounded-xl p-4 mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">Rating</label>
            <select
              value={rating}
              onChange={(e) => setRating(e.target.value)}
              className="border border-gray-300 rounded-lg px-2 py-1 mb-3"
            >
              {[5, 4, 3, 2, 1].map((r) => (
                <option key={r} value={r}>{r} ★</option>
              ))}
            </select>
            <textarea
              placeholder="Write your review..."
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              required
              className="w-full border border-gray-300 rounded-lg px-3 py-2 mb-3 focus:outline-none focus:ring-2 focus:ring-orange-400"
            />
            <button type="submit" className="bg-orange-500 text-white px-4 py-2 rounded-lg hover:bg-orange-600 transition">
              Submit Review
            </button>
            {message && <p className="text-sm mt-2 text-green-600">{message}</p>}
          </form>

          <div className="space-y-3">
            {reviews.map((review) => (
              <div key={review._id} className="bg-white border border-gray-200 rounded-xl p-4">
                <p className="font-medium text-gray-800">
                  {review.user?.name} {review.verifiedPurchase && <span className="text-xs text-orange-600">(Verified Purchase)</span>}
                </p>
                <p className="text-sm text-yellow-500">{"★".repeat(review.rating)}</p>
                <p className="text-sm text-gray-600 mt-1">{review.comment}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export default ProductDetail;