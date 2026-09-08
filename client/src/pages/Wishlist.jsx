import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import api from "../services/api";

function Wishlist() {
  const [wishlist, setWishlist] = useState({ products: [] });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchWishlist = async () => {
    try {
      const response = await api.get("/wishlist");
      setWishlist(response.data.data);
    } catch (err) {
      setError("Failed to load wishlist");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWishlist();
  }, []);

  const handleRemove = async (productId) => {
    try {
      await api.delete(`/wishlist/${productId}`);
      toast.success("Removed from wishlist");
      fetchWishlist();
    } catch (err) {
      toast.error("Failed to remove item");
    }
  };

  if (loading) return <p className="text-center mt-10 text-gray-500">Loading wishlist...</p>;
  if (error) return <p className="text-center mt-10 text-red-500">{error}</p>;

  return (
    <div className="max-w-6xl mx-auto p-6">
      <h2 className="text-2xl font-bold text-orange-700 mb-4">My Wishlist</h2>
      {wishlist.products.length === 0 ? (
        <p className="text-gray-500">Your wishlist is empty.</p>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-6">
          {wishlist.products.map((product) => (
            <div key={product._id} className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm">
              <h3 className="font-semibold text-gray-800">{product.name}</h3>
              <p className="text-orange-600 font-bold mt-1">Rs. {product.price}</p>
              <button
                onClick={() => handleRemove(product._id)}
                className="mt-3 w-full text-red-500 text-sm border border-red-200 rounded-lg py-1.5 hover:bg-red-50 transition"
              >
                Remove
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default Wishlist;