import User from "../models/user.model.js";
import bcrypt from "bcryptjs"; // <-- Yeh import karein
import jwt from "jsonwebtoken"; // <-- Yeh line zaroor add karein

export const registerUser = async (req, res) => {
  try {
    const { name, email, password } = req.body;
    // SECURITY: role hamesha "customer" force kiya jata hai — public register
    // se koi bhi khud ko admin/staff nahi bana sakta, chahe request mein
    // role: "admin" bhej kar try kare. Staff/Admin accounts sirf createStaffUser
    // (neeche) se, ek existing admin ke through hi ban sakte hain.

    // 1. Check karein ke user pehle se mojood hai ya nahi
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: "Email already exists" });
    }

    // 2. Password ko hash (secure) karein
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // 3. Naya user banayein (hashed password ke sath) — role hamesha "customer"
    const newUser = new User({
      name,
      email,
      password: hashedPassword,
      role: "customer",
    });

    await newUser.save();

    res.status(201).json({
      success: true,
      message: "User registered successfully",
      data: {
        id: newUser._id,
        name: newUser.name,
        email: newUser.email,
        role: newUser.role,
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Admin-only: Staff (ya doosra Admin) account banane ke liye.
// Ye route sirf existing admin hi call kar sakta hai (route mein protect + authorize("admin")).
export const createStaffUser = async (req, res) => {
  try {
    const { name, email, password, role } = req.body;

    if (!["staff", "admin"].includes(role)) {
      return res.status(400).json({ success: false, message: "Role must be 'staff' or 'admin'" });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ success: false, message: "Email already exists" });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const newUser = new User({
      name,
      email,
      password: hashedPassword,
      role,
    });

    await newUser.save();

    res.status(201).json({
      success: true,
      message: `${role} account created successfully`,
      data: {
        id: newUser._id,
        name: newUser.name,
        email: newUser.email,
        role: newUser.role,
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Login Controller
export const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    // 1. Check karein user exist karta hai ya nahi
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: "Invalid email or password" });
    }

    // 2. Password match karein
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: "Invalid email or password" });
    }

    // 3. JWT Token generate karein
    const token = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_ACCESS_SECRET,
      { expiresIn: "1d" }
    );

    res.status(200).json({
      success: true,
      message: "Logged in successfully",
      token,
      data: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};