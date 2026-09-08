import { useState, useEffect, useRef } from "react";
import { loadStripe } from "@stripe/stripe-js";
import { Elements, CardElement, useStripe, useElements } from "@stripe/react-stripe-js";
import toast from "react-hot-toast";
import api from "../services/api";

const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY);

function CheckoutForm({ order, clientSecret }) {
  const stripe = useStripe();
  const elements = useElements();
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
        // NOTE: order yahan khud "Paid" mark NAHI ho raha — Stripe ka webhook
        // server ko confirm karega aur wahi order status update karega.
        toast.success("Payment submitted! Your order will be confirmed shortly.");
      }
    } catch (err) {
      toast.error(err.response?.data?.message || "Payment failed");
    } finally {
      setProcessing(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="bg-white border border-gray-200 rounded-xl p-6 max-w-md mx-auto mt-10">
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
  // React StrictMode (development mein) is effect ko 2 baar chalata hai —
  // is guard ke bina order 2 dafa create ho jata, isliye ye flag lagaya hai.
  const hasSetup = useRef(false);

  useEffect(() => {
    if (hasSetup.current) return;
    hasSetup.current = true;

    const setupCheckout = async () => {
      try {
        // Pehle dekhein — kya humara koi purana order hai jo abhi tak
        // "Pending Payment" hai (matlab pichli baar payment complete nahi hui thi)?
        // Agar hai to usi ko reuse karte hain, taake har visit pe naya order
        // aur naya stock-deduction na ho.
        const myOrdersRes = await api.get("/orders");
        const existingPending = myOrdersRes.data.data.find(
          (o) => o.status === "Pending Payment"
        );

        let currentOrder = existingPending;

        if (!currentOrder) {
          // Koi pending order nahi mila — cart se naya banayein
          const orderRes = await api.post("/orders");
          currentOrder = orderRes.data.data;
        }

        setOrder(currentOrder);

        // Isi order ke liye (naya ho ya reused) ek fresh Payment Intent banayein
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
  if (error) return <p className="text-center mt-10 text-red-500">{error}</p>;
  if (!order || !clientSecret) return <p className="text-center mt-10 text-gray-500">Your cart is empty.</p>;

  return (
    <Elements stripe={stripePromise}>
      <CheckoutForm order={order} clientSecret={clientSecret} />
    </Elements>
  );
}

export default Checkout;