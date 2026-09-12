import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../services/api";

const AGE_RANGES = [
  { label: "0-6 months", short: "0-6m", color: "bg-orange-400" },
  { label: "6-12 months", short: "6-12m", color: "bg-amber-400" },
  { label: "1-2 years", short: "1-2y", color: "bg-rose-400" },
  { label: "3-5 years", short: "3-5y", color: "bg-orange-500" },
  { label: "6-8 years", short: "6-8y", color: "bg-amber-500" },
  { label: "9+ years", short: "9+y", color: "bg-rose-500" },
];

function Home() {
  const [categories, setCategories] = useState([]);
  const [featured, setFeatured] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const catRes = await api.get("/categories");
        setCategories(catRes.data.data);

        const prodRes = await api.get("/products", { params: { limit: 4 } });
        setFeatured(prodRes.data.data);
      } catch (err) {
        console.error(err);
      }
    };
    fetchData();
  }, []);

  return (
    <div>
      {/* Hero Section */}
      <div className="bg-gradient-to-br from-orange-400 to-amber-400 text-white">
        <div className="max-w-6xl mx-auto px-6 py-16 flex flex-col items-center text-center">
          <span className="text-5xl mb-3">🧸</span>
          <h1 className="text-4xl font-bold mb-3">Play. Learn. Grow.</h1>
          <p className="text-orange-50 mb-6 max-w-md">
            Safe, fun, and educational toys for your little one — handpicked for every age.
          </p>
          <Link
            to="/products"
            className="bg-white text-orange-600 font-semibold px-6 py-3 rounded-lg hover:bg-orange-50 transition"
          >
            Shop Now
          </Link>
        </div>
      </div>

      {/* Shop by Age Section */}
      <div className="max-w-6xl mx-auto px-6 py-12">
        <h2 className="text-2xl font-bold text-gray-800 mb-6">Shop by Age</h2>
        <div className="flex flex-wrap gap-6 justify-center sm:justify-start">
          {AGE_RANGES.map((age) => (
            <Link
              key={age.label}
              to={`/products?ageRange=${encodeURIComponent(age.label)}`}
              className="flex flex-col items-center gap-2 group"
            >
              <div
                className={`w-16 h-16 rounded-full ${age.color} text-white flex items-center justify-center font-bold text-sm shadow-sm group-hover:scale-105 transition`}
              >
                {age.short}
              </div>
              <span className="text-xs text-gray-600 group-hover:text-orange-600">{age.label}</span>
            </Link>
          ))}
        </div>
      </div>

      {/* Categories Section */}
      <div className="max-w-6xl mx-auto px-6 py-12">
        <h2 className="text-2xl font-bold text-gray-800 mb-6">Shop by Category</h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4">
          {categories.map((cat) => (
            <Link
              key={cat._id}
              to={`/products?category=${encodeURIComponent(cat.name)}`}
              className="bg-orange-50 hover:bg-orange-100 rounded-xl p-4 text-center transition"
            >
              <p className="font-medium text-orange-700 text-sm">{cat.name}</p>
            </Link>
          ))}
        </div>
      </div>

      {/* New Arrivals / Featured Products */}
      <div className="max-w-6xl mx-auto px-6 py-12">
        <h2 className="text-2xl font-bold text-gray-800 mb-6">New Arrivals</h2>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-6">
          {featured.map((product) => (
            <Link
              key={product._id}
              to={`/products/${product._id}`}
              className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm hover:shadow-md transition"
            >
                            {product.images && product.images.length > 0 ? (
                <img
                  src={product.images[0].url}
                  alt={product.images[0].altText || product.name}
                  className="w-full h-32 object-cover rounded-lg mb-3"
                  onError={(e) => {
                    e.target.onerror = null;
                    e.target.src = "https://images.unsplash.com/photo-1596461404969-9ae70f2830c1?w=500&q=80";
                  }}
                />
      
              ) : (
                <div className="w-full h-32 bg-orange-50 rounded-lg mb-3 flex items-center justify-center text-gray-400 text-sm">
                  No Image
                </div>
              )}
              <h3 className="font-semibold text-gray-800">{product.name}</h3>
              <p className="text-orange-600 font-bold mt-1">Rs. {product.price}</p>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}

export default Home;