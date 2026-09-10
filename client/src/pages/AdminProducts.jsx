import { useState } from "react";
import toast from "react-hot-toast";
import api from "../services/api";

const CATEGORIES = [
  "Rattles", "Learning Toys", "Pretend Play", "Building Blocks", "Dolls",
  "Remote Control", "Outdoor", "STEM", "Montessori", "Newborn Essentials",
];

const AGE_RANGES = [
  "0-6 months", "6-12 months", "1-2 years", "3-5 years", "6-8 years", "9+ years",
];

function AdminProducts() {
  const [form, setForm] = useState({
    name: "",
    slug: "",
    sku: "",
    description: "",
    brand: "",
    category: CATEGORIES[0],
    ageRange: AGE_RANGES[0],
    price: "",
    stock: "",
  });
  const [images, setImages] = useState([]);
  const [variants, setVariants] = useState([]);
  const [loading, setLoading] = useState(false);
  const [exporting, setExporting] = useState(false);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleImageChange = (e) => {
    setImages([...e.target.files]);
  };

  const addVariantRow = () => {
    setVariants([...variants, { size: "", color: "", stock: "", price: "" }]);
  };

  const removeVariantRow = (index) => {
    setVariants(variants.filter((_, i) => i !== index));
  };

  const handleVariantChange = (index, field, value) => {
    const updated = [...variants];
    updated[index][field] = value;
    setVariants(updated);
  };

  const handleExportCSV = async () => {
    setExporting(true);
    try {
      const response = await api.get("/products/export/csv", { responseType: "blob" });
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", "products_export.csv");
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
      toast.success("Products CSV downloaded!");
    } catch (err) {
      toast.error("Failed to export products");
    } finally {
      setExporting(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const formData = new FormData();
      Object.entries(form).forEach(([key, value]) => {
        formData.append(key, value);
      });
      images.forEach((file) => {
        formData.append("images", file);
      });

      if (variants.length > 0) {
        const cleanedVariants = variants.map((v) => ({
          size: v.size,
          color: v.color,
          stock: Number(v.stock) || 0,
          ...(v.price ? { price: Number(v.price) } : {}),
        }));
        formData.append("variants", JSON.stringify(cleanedVariants));
      }

      await api.post("/products", formData);

      toast.success("Product created successfully!");
      setForm({
        name: "",
        slug: "",
        sku: "",
        description: "",
        brand: "",
        category: CATEGORIES[0],
        ageRange: AGE_RANGES[0],
        price: "",
        stock: "",
      });
      setImages([]);
      setVariants([]);
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to create product");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-6">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-bold text-orange-700">Admin — Add Product</h2>
        <button
          onClick={handleExportCSV}
          disabled={exporting}
          className="bg-orange-500 text-white text-sm px-4 py-2 rounded-lg hover:bg-orange-600 transition disabled:opacity-50"
        >
          {exporting ? "Exporting..." : "Export CSV"}
        </button>
      </div>

      <form
        onSubmit={handleSubmit}
        className="bg-white border border-gray-200 rounded-xl p-6 space-y-4"
      >
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
          <input
            type="text"
            name="name"
            value={form.name}
            onChange={handleChange}
            required
            className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-orange-400"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Slug</label>
          <input
            type="text"
            name="slug"
            value={form.slug}
            onChange={handleChange}
            required
            className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-orange-400"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">SKU</label>
          <input
            type="text"
            name="sku"
            value={form.sku}
            onChange={handleChange}
            required
            className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-orange-400"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
          <textarea
            name="description"
            value={form.description}
            onChange={handleChange}
            required
            className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-orange-400"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Brand</label>
          <input
            type="text"
            name="brand"
            value={form.brand}
            onChange={handleChange}
            required
            className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-orange-400"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
            <select
              name="category"
              value={form.category}
              onChange={handleChange}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-orange-400"
            >
              {CATEGORIES.map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Age Range</label>
            <select
              name="ageRange"
              value={form.ageRange}
              onChange={handleChange}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-orange-400"
            >
              {AGE_RANGES.map((a) => (
                <option key={a} value={a}>{a}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Base Price {variants.length > 0 && <span className="text-xs text-gray-400">(fallback if variant has no price)</span>}
            </label>
            <input
              type="number"
              name="price"
              value={form.price}
              onChange={handleChange}
              required
              min="0"
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-orange-400"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Base Stock {variants.length > 0 && <span className="text-xs text-gray-400">(ignored if variants exist)</span>}
            </label>
            <input
              type="number"
              name="stock"
              value={form.stock}
              onChange={handleChange}
              required
              min="0"
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-orange-400"
            />
          </div>
        </div>

        <div className="border-t border-gray-200 pt-4">
          <div className="flex justify-between items-center mb-2">
            <label className="block text-sm font-medium text-gray-700">
              Variants (optional — size/color)
            </label>
            <button
              type="button"
              onClick={addVariantRow}
              className="text-sm text-orange-600 border border-orange-500 px-2 py-1 rounded-lg hover:bg-orange-50"
            >
              + Add Variant
            </button>
          </div>

          {variants.map((variant, index) => (
            <div key={index} className="flex flex-wrap gap-2 mb-2 items-center bg-orange-50 p-2 rounded-lg">
              <input
                type="text"
                placeholder="Size (e.g. Large)"
                value={variant.size}
                onChange={(e) => handleVariantChange(index, "size", e.target.value)}
                className="border border-gray-300 rounded-lg px-2 py-1 flex-1 min-w-[100px]"
              />
              <input
                type="text"
                placeholder="Color (e.g. Red)"
                value={variant.color}
                onChange={(e) => handleVariantChange(index, "color", e.target.value)}
                className="border border-gray-300 rounded-lg px-2 py-1 flex-1 min-w-[100px]"
              />
              <input
                type="number"
                placeholder="Stock"
                min="0"
                value={variant.stock}
                onChange={(e) => handleVariantChange(index, "stock", e.target.value)}
                className="border border-gray-300 rounded-lg px-2 py-1 w-24"
              />
              <input
                type="number"
                placeholder="Price (optional)"
                min="0"
                value={variant.price}
                onChange={(e) => handleVariantChange(index, "price", e.target.value)}
                className="border border-gray-300 rounded-lg px-2 py-1 w-32"
              />
              <button
                type="button"
                onClick={() => removeVariantRow(index)}
                className="text-red-500 text-sm px-2"
              >
                ✕
              </button>
            </div>
          ))}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Images</label>
          <input
            type="file"
            accept="image/*"
            multiple
            onChange={handleImageChange}
            className="w-full text-sm text-gray-600"
          />
          {images.length > 0 && (
            <p className="text-xs text-gray-500 mt-1">{images.length} file(s) selected</p>
          )}
        </div>

        <button
          type="submit"
          disabled={loading}
          className="bg-orange-500 text-white px-4 py-2 rounded-lg hover:bg-orange-600 transition disabled:opacity-50"
        >
          {loading ? "Creating..." : "Create Product"}
        </button>
      </form>
    </div>
  );
}

export default AdminProducts;