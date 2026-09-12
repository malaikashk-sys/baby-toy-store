import { useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import api from "../services/api";
import { useDebounce } from '../hooks/useDebounce';

const AGE_RANGES = [
  "0-6 months", "6-12 months", "1-2 years", "3-5 years", "6-8 years", "9+ years",
];

const RATING_OPTIONS = [
  { label: "4★ & up", value: "4" },
  { label: "3★ & up", value: "3" },
  { label: "2★ & up", value: "2" },
  { label: "1★ & up", value: "1" },
];

const DEFAULT_IMAGE = "https://images.unsplash.com/photo-1596461404969-9ae70f2830c1?w=500&q=80";

function Products() {
  const [searchParams] = useSearchParams();

  // State Declarations (Sari Hooks Component Body ke andar hain)
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  const [search, setSearch] = useState("");
  const [brand, setBrand] = useState("");
  const [category, setCategory] = useState(searchParams.get("category") || "");
  const [ageRange, setAgeRange] = useState(searchParams.get("ageRange") || "");
  const [sort, setSort] = useState("");
  const [minPrice, setMinPrice] = useState("");
  const [maxPrice, setMaxPrice] = useState("");
  const [minRating, setMinRating] = useState("");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const storedUser = JSON.parse(localStorage.getItem("user") || "null");
  const isCustomer = storedUser?.role === "customer";

  const debouncedSearch = useDebounce(search, 300);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await api.get("/categories");
        setCategories(response.data.data || response.data || []);
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
      if (debouncedSearch) params.search = debouncedSearch;
      if (brand) params.brand = brand;
      if (category) params.category = category;
      if (ageRange) params.ageRange = ageRange;
      if (sort) params.sort = sort;
      if (minPrice) params.minPrice = minPrice;
      if (maxPrice) params.maxPrice = maxPrice;
      if (minRating) params.minRating = minRating;

      const response = await api.get("/products", { params });
      const productList = response.data.data || response.data.products || response.data || [];
      const total = response.data.totalPages || response.data.pages || 1;

      setProducts(productList);
      setTotalPages(total);
      setError("");
    } catch (err) {
      setError("Failed to load products");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, [debouncedSearch, brand, category, ageRange, sort, minPrice, maxPrice, minRating, page]);

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
            <option key={cat._id || cat.name} value={cat.name}>{cat.name}</option>
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

        <input
          type="number"
          min="0"
          placeholder="Min Price"
          value={minPrice}
          onChange={(e) => { setMinPrice(e.target.value); setPage(1); }}
          className="border border-gray-300 rounded-lg px-3 py-2 w-28 focus:outline-none focus:ring-2 focus:ring-orange-400"
        />
        <input
          type="number"
          min="0"
          placeholder="Max Price"
          value={maxPrice}
          onChange={(e) => { setMaxPrice(e.target.value); setPage(1); }}
          className="border border-gray-300 rounded-lg px-3 py-2 w-28 focus:outline-none focus:ring-2 focus:ring-orange-400"
        />
        <select
          value={minRating}
          onChange={(e) => { setMinRating(e.target.value); setPage(1); }}
          className="border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-orange-400"
        >
          <option value="">All Ratings</option>
          {RATING_OPTIONS.map((r) => (
            <option key={r.value} value={r.value}>{r.label}</option>
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
            {products.map((product) => {
              const hasVariants = product.variants && product.variants.length > 0;
              const imgUrl = product.images?.[0]?.url || (typeof product.images?.[0] === 'string' ? product.images[0] : null) || DEFAULT_IMAGE;
              
              return (
                <div key={product._id} className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm hover:shadow-md transition flex flex-col justify-between">
                  <div>
                    <Link to={`/products/${product._id}`}>
                      <img
                        src={imgUrl}
                        alt={product.name}
                        className="w-full h-36 object-cover rounded-lg mb-3"
                        onError={(e) => { e.target.src = DEFAULT_IMAGE; }}
                      />
                      <h3 className="font-semibold text-gray-800 hover:text-orange-600 line-clamp-1">{product.name}</h3>
                    </Link>
                    <p className="text-sm text-gray-500">{product.brand || 'Toy Brand'}</p>
                    <p className="text-orange-600 font-bold mt-1">Rs. {product.price}</p>
                    <p className="text-xs text-gray-400">
                      {hasVariants ? "Multiple options available" : `Stock: ${product.stock ?? 'Available'}`}
                    </p>
                  </div>
                                    {isCustomer && (
                    <div className="flex gap-2 mt-3">
                      {hasVariants ? (
                        <Link
                          to={`/products/${product._id}`}
                          className="flex-1 text-center bg-orange-500 text-white text-sm py-1.5 rounded-lg hover:bg-orange-600 transition"
                        >
                          View Options
                        </Link>
                      ) : (
                        <button
                          onClick={() => handleAddToCart(product._id)}
                          className="flex-1 bg-orange-500 text-white text-sm py-1.5 rounded-lg hover:bg-orange-600 transition"
                        >
                          Add to Cart
                        </button>
                      )}
                      <button
                        onClick={() => handleAddToWishlist(product._id)}
                        className="border border-orange-500 text-orange-600 text-sm px-2 py-1.5 rounded-lg hover:bg-orange-50 transition"
                      >
                        ♡
                      </button>
                    </div>
                  )}
                </div>
              );
            })}
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