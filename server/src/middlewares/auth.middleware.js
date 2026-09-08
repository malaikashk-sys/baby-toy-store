import jwt from "jsonwebtoken";
import User from "../models/user.model.js";

export const protect = async (req, res, next) => {
  let token;

  // Check karein ke header mein Authorization aur Bearer token mojood hai ya nahi
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer")
  ) {
    try {
      // Token extract karein (Bearer ke baad wala hissa)
      token = req.headers.authorization.split(" ")[1];

      // Token verify karein
      const decoded = jwt.verify(token, process.env.JWT_ACCESS_SECRET);
      // User ko database se dhoond kar req.user mein lagayein (password chhor kar)
      req.user = await User.findById(decoded.id).select("-password");

      if (!req.user) {
        return res.status(401).json({ success: false, message: "User not found with this token" });
      }

      next(); // Aglay step (controller) par chale jayein
    } catch (error) {
      console.error(error);
      return res.status(401).json({ success: false, message: "Not authorized, token failed" });
    }
  }

  if (!token) {
    return res.status(401).json({ success: false, message: "Not authorized, no token" });
  }
};
// Sirf diye gaye roles ko allow karta hai (jaise admin, staff)
export const authorize = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: `Role '${req.user.role}' is not authorized to access this route`,
      });
    }
    next();
  };
};