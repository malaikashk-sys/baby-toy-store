import { useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import api from "../services/api";

const AGE_RANGES = [
  "0-6 months", "6-12 months", "1-2 years", "3-5 years", "6-8 years", "9+ years",
];

function Products() {
  const [searchParams] = useSearchParams();

  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  const [search, setSearch] = useState("");
  // URL mein ?category=... ya ?ageRange=... aaya ho (jaise Homepage se link click karke)
  // to usse initial filter set kar rahe hain.
  const [category, setCategory] = useState(searchParams.get("category") || "");
  const [ageRange, setAgeRange] = useState(searchParams.get("ageRange") || "");
  const [sort, setSort] = useState("");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await api.get("/categories");
        setCategories(response.data.data);
      } catch (err) {
        console.error("Failed to load categories");
      }
    };
    fetchCategories();
  }, []);

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const params = { page };
      if (search) params.search = search;
      if (category) params.category = category;
      if (ageRange) params.ageRange = ageRange;
      if (sort) params.sort = sort;

      const response = await api.get("/products", { params });
      setProducts(response.data.data);
      setTotalPages(response.data.totalPages);
    } catch (err) {
      setError("Failed to load products");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, [category, ageRange, sort, page]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    setPage(1);
    fetchProducts();
  };

  const handleAddToCart = async (productId) => {
    setMessage("");
    try {
      await api.post("/cart", { productId, quantity: 1 });
      setMessage("Added to cart!");
    } catch (err) {
      setMessage(err.response?.data?.message || "Failed to add to cart");
    }
  };

  const handleAddToWishlist = async (productId) => {
    setMessage("");
    try {
      await api.post("/wishlist", { productId });
      setMessage("Added to wishlist!");
    } catch (err) {
      setMessage(err.response?.data?.message || "Failed to add to wishlist");
    }
  };

  return (
    <div className="max-w-6xl mx-auto p-6">
      <h2 className="text-2xl font-bold text-orange-700 mb-4">All Products</h2>

      <form onSubmit={handleSearchSubmit} className="flex flex-wrap gap-3 mb-6">
        <input
          type="text"
          placeholder="Search products..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="border border-gray-300 rounded-lg px-3 py-2 flex-1 min-w-[180px] focus:outline-none focus:ring-2 focus:ring-orange-400"
        />
        <select
          value={category}
          onChange={(e) => { setCategory(e.target.value); setPage(1); }}
          className="border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-orange-400"
        >
          <option value="">All Categories</option>
          {categories.map((cat) => (
            <option key={cat._id} value={cat.name}>{cat.name}</option>
          ))}
        </select>
        <select
          value={ageRange}
          onChange={(e) => { setAgeRange(e.target.value); setPage(1); }}
          className="border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-orange-400"
        >
          <option value="">All Ages</option>
          {AGE_RANGES.map((a) => (
            <option key={a} value={a}>{a}</option>
          ))}
        </select>
        <select
          value={sort}
          onChange={(e) => { setSort(e.target.value); setPage(1); }}
          className="border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-orange-400"
        >
          <option value="">Sort: Newest</option>
          <option value="price-low">Price: Low to High</option>
          <option value="price-high">Price: High to Low</option>
          <option value="rating">Rating</option>
        </select>
        <button type="submit" className="bg-orange-500 text-white px-4 rounded-lg hover:bg-orange-600 transition">
          Search
        </button>
      </form>

      {message && <p className="text-green-600 mb-4">{message}</p>}

      {loading ? (
        <p className="text-center mt-10 text-gray-500">Loading products...</p>
      ) : error ? (
        <p className="text-center mt-10 text-red-500">{error}</p>
      ) : products.length === 0 ? (
        <p className="text-gray-500">No products found.</p>
      ) : (
        <>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-6">
            {products.map((product) => (
              <div key={product._id} className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm hover:shadow-md transition">
                <Link to={`/products/${product._id}`}>
                  {product.images && product.images.length > 0 ? (
                    <img
                      src={product.images[0].url}
                      alt={product.images[0].altText || product.name}
                      className="w-full h-36 object-cover rounded-lg mb-3"
                    />
                  ) : (
                    <div className="w-full h-36 bg-orange-50 rounded-lg mb-3 flex items-center justify-center text-gray-400 text-sm">
                      No Image
                    </div>
                  )}
                  <h3 className="font-semibold text-gray-800 hover:text-orange-600">{product.name}</h3>
                </Link>
                <p className="text-sm text-gray-500">{product.brand}</p>
                <p className="text-orange-600 font-bold mt-1">Rs. {product.price}</p>
                <p className="text-xs text-gray-400">Stock: {product.stock}</p>
                <div className="flex gap-2 mt-3">
                  <button
                    onClick={() => handleAddToCart(product._id)}
                    className="flex-1 bg-orange-500 text-white text-sm py-1.5 rounded-lg hover:bg-orange-600 transition"
                  >
                    Add to Cart
                  </button>
                  <button
                    onClick={() => handleAddToWishlist(product._id)}
                    className="border border-orange-500 text-orange-600 text-sm px-2 py-1.5 rounded-lg hover:bg-orange-50 transition"
                  >
                    ♡
                  </button>
                </div>
              </div>
            ))}
          </div>

          {totalPages > 1 && (
            <div className="flex justify-center items-center gap-2 mt-6">
              <button
                disabled={page === 1}
                onClick={() => setPage(page - 1)}
                className="px-3 py-1 border border-gray-300 rounded-lg disabled:opacity-40"
              >
                Previous
              </button>
              <span className="px-3 py-1">Page {page} of {totalPages}</span>
              <button
                disabled={page === totalPages}
                onClick={() => setPage(page + 1)}
                className="px-3 py-1 border border-gray-300 rounded-lg disabled:opacity-40"
              >
                Next
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}

export default Products;