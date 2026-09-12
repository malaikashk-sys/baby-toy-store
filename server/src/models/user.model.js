import mongoose from "mongoose";

const addressSchema = new mongoose.Schema({
  label: { type: String, default: "Home" },
  line1: { type: String, required: true },
  line2: { type: String },
  city: { type: String, required: true },
  state: { type: String },
  zip: { type: String },
  phone: { type: String },
  isDefault: { type: Boolean, default: false },
});

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    role: { type: String, enum: ["customer", "staff", "admin"], default: "customer" },
    status: { type: String, enum: ["active", "blocked"], default: "active" },
    addresses: [addressSchema],
  },
  { timestamps: true }
);

const User = mongoose.model("User", userSchema);
export default User;