import User from "../models/user.model.js";
import { logAction } from "../utils/auditLog.js";

// ---- Address management (customer, apne addresses) ----

export const getMyAddresses = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select("addresses");
    if (!user) return res.status(404).json({ success: false, message: "User not found" });
    res.status(200).json({ success: true, data: user.addresses });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const addAddress = async (req, res) => {
  try {
    const { label, line1, line2, city, state, zip, phone, isDefault } = req.body;

    if (!line1 || !city) {
      return res.status(400).json({ success: false, message: "Address line1 and city are required" });
    }

    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ success: false, message: "User not found" });

    if (isDefault) {
      user.addresses.forEach((addr) => { addr.isDefault = false; });
    }

    user.addresses.push({ label, line1, line2, city, state, zip, phone, isDefault: !!isDefault });
    await user.save();

    res.status(201).json({ success: true, message: "Address added", data: user.addresses });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const deleteAddress = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ success: false, message: "User not found" });

    user.addresses = user.addresses.filter(
      (addr) => addr._id.toString() !== req.params.addressId
    );
    await user.save();

    res.status(200).json({ success: true, message: "Address removed", data: user.addresses });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ---- Customer management (admin/staff) ----

export const getAllCustomers = async (req, res) => {
  try {
    const customers = await User.find({ role: "customer" })
      .select("name email status createdAt")
      .sort({ createdAt: -1 });

    res.status(200).json({ success: true, count: customers.length, data: customers });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const updateCustomerStatus = async (req, res) => {
  try {
    const { status } = req.body;

    if (!["active", "blocked"].includes(status)) {
      return res.status(400).json({ success: false, message: "Status must be 'active' or 'blocked'" });
    }

    const customer = await User.findOneAndUpdate(
      { _id: req.params.id, role: "customer" },
      { status },
      { new: true }
    ).select("name email status");

    if (!customer) {
      return res.status(404).json({ success: false, message: "Customer not found" });
    }

    await logAction({
      user: req.user,
      action: `customer_${status}`,
      entityType: "User",
      entityId: customer._id,
      details: `Customer ${customer.email} marked as ${status}`,
    });

    res.status(200).json({ success: true, message: `Customer ${status}`, data: customer });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};