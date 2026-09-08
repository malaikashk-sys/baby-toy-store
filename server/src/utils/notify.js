import Notification from "../models/notification.model.js";

// Reusable helper — order/payment controllers call this to create a notification
export const createNotification = async (userId, type, title, message, metadata = {}) => {
  try {
    await Notification.create({ user: userId, type, title, message, metadata });
  } catch (error) {
    // Notification failure should never break the main flow (order/payment) —
    // isliye sirf log karte hain, error throw nahi karte.
    console.error("Failed to create notification:", error.message);
  }
};