import React, { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import api from "../services/api";

export default function OrderSuccess() {
  const { orderId } = useParams();
  const [order, setOrder] = useState(null);

  useEffect(() => {
    const fetchOrder = async () => {
      try {
        const { data } = await api.get(`/orders/${orderId}`);
        setOrder(data.data || data);
      } catch (err) {
        console.error("Failed to load order details");
      }
    };
    if (orderId) fetchOrder();
  }, [orderId]);

  return (
    <div className="max-w-2xl mx-auto p-6 text-center mt-10">
      <div className="bg-green-100 text-green-700 p-4 rounded-full w-16 h-16 mx-auto flex items-center justify-center text-2xl font-bold mb-4">
        ✓
      </div>
      <h2 className="text-2xl font-bold text-gray-800">Order Placed Successfully!</h2>
      <p className="text-gray-600 mt-2">Thank you for your purchase. Your order ID is <span className="font-mono font-bold">{orderId}</span>.</p>

      {order && (
        <div className="bg-white border rounded-xl p-4 mt-6 text-left shadow-sm">
          <p className="font-semibold text-gray-700">Total Paid: Rs. {order.totalAmount}</p>
          <p className="text-sm text-gray-500 mt-1">Status: <span className="capitalize text-green-600 font-medium">{order.orderStatus || "Paid"}</span></p>
        </div>
      )}

      <div className="mt-8 flex justify-center gap-4">
        <Link to="/my-orders" className="bg-orange-500 text-white px-5 py-2.5 rounded-lg hover:bg-orange-600 transition">
          View My Orders
        </Link>
        <Link to="/products" className="border border-gray-300 px-5 py-2.5 rounded-lg hover:bg-gray-50 transition">
          Continue Shopping
        </Link>
      </div>
    </div>
  );
}