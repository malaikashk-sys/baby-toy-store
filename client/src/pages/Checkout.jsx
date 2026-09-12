import { useState, useEffect, useRef } from "react";
import { loadStripe } from "@stripe/stripe-js";
import { Elements, CardElement, useStripe, useElements } from "@stripe/react-stripe-js";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import api from "../services/api";

const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY);

function CheckoutForm({ order, clientSecret }) {
  const stripe = useStripe();
  const elements = useElements();
  const navigate = useNavigate();
  const [processing, setProcessing] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!stripe || !elements) return;
    setProcessing(true);

    try {
      const result = await stripe.confirmCardPayment(clientSecret, {
        payment_method: { card: elements.getElement(CardElement) },
      });

      if (result.error) {
        toast.error(result.error.message);
      } else if (result.paymentIntent.status === "succeeded") {
        toast.success("Payment submitted! Your order will be confirmed shortly.");
        navigate(`/order-success/${order._id}`);
      }
    } catch (err) {
      toast.error(err.response?.data?.message || "Payment failed");
    } finally {
      setProcessing(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="bg-white border border-gray-200 rounded-xl p-6 max-w-md mx-auto mt-10 shadow-sm">
      <h2 className="text-xl font-bold text-orange-700 mb-4">Pay Rs. {order.totalAmount}</h2>
      <div className="border border-gray-300 rounded-lg p-3 mb-4">
        <CardElement options={{ style: { base: { fontSize: "16px" } } }} />
      </div>
      <button
        type="submit"
        disabled={!stripe || processing}
        className="w-full bg-orange-500 text-white py-2 rounded-lg font-semibold hover:bg-orange-600 transition disabled:opacity-50"
      >
        {processing ? "Processing..." : "Pay Now"}
      </button>
    </form>
  );
}

function Checkout() {
  const [order, setOrder] = useState(null);
  const [clientSecret, setClientSecret] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const hasSetup = useRef(false);

  useEffect(() => {
    if (hasSetup.current) return;
    hasSetup.current = true;

    const setupCheckout = async () => {
      try {
        const myOrdersRes = await api.get("/orders");
        const ordersList = myOrdersRes.data.data || myOrdersRes.data.orders || myOrdersRes.data || [];
        const existingPending = ordersList.find(
          (o) => o.status === "Pending Payment" || o.orderStatus === "Pending"
        );

       // Agar purane pending order mein missing product ka error aaye, 
        // toh hum usay ignore karke seedha cart se naya order bana lenge:
        let currentOrder = null;
        try {
          const myOrdersRes = await api.get("/orders");
          const ordersList = myOrdersRes.data.data || myOrdersRes.data.orders || myOrdersRes.data || [];
          const existingPending = ordersList.find(
            (o) => o.status === "Pending Payment" || o.orderStatus === "Pending"
          );
          
          if (existingPending) {
            // Test karne ke liye ke kya isme koi deleted product toh nahi
            await api.post("/payments/create-payment-intent", { orderId: existingPending._id });
            currentOrder = existingPending;
          }
        } catch (err) {
          // Agar purane order ki wajah se error aaya, toh usay ignore karo aur naya banao
          currentOrder = null;
        }

        if (!currentOrder) {
          const orderRes = await api.post("/orders");
          currentOrder = orderRes.data.data || orderRes.data.order || orderRes.data;
        }

        setOrder(currentOrder);

        const intentRes = await api.post("/payments/create-payment-intent", {
          orderId: currentOrder._id,
        });
        setClientSecret(intentRes.data.clientSecret);
      } catch (err) {
        setError(err.response?.data?.message || "Failed to start checkout");
      } finally {
        setLoading(false);
      }
    };
    setupCheckout();
  }, []);

  if (loading) return <p className="text-center mt-10 text-gray-500">Preparing checkout...</p>;

  if (error) {
    const isProductMissing = error.toLowerCase().includes("no longer exists");
    return (
      <div className="text-center mt-10 p-6 max-w-md mx-auto bg-white border border-gray-200 rounded-xl shadow-sm">
        <p className="text-red-500 font-semibold mb-4">{error}</p>
        {isProductMissing ? (
          <a
            href="/cart"
            className="inline-block bg-orange-500 text-white px-5 py-2 rounded-lg hover:bg-orange-600 transition font-medium"
          >
            Return to Cart
          </a>
        ) : (
          <button
            onClick={() => window.location.reload()}
            className="bg-gray-800 text-white px-5 py-2 rounded-lg hover:bg-gray-900 transition font-medium"
          >
            Try Again
          </button>
        )}
      </div>
    );
  }

  if (!order || !clientSecret) return <p className="text-center mt-10 text-gray-500">Your cart is empty or order could not be created.</p>;

  return (
    <Elements stripe={stripePromise}>
      <CheckoutForm order={order} clientSecret={clientSecret} />
    </Elements>
  );
}

export default Checkout;