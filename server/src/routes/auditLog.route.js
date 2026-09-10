import express from "express";
import { getAuditLogs } from "../controllers/auditLog.controller.js";
import { protect, authorize } from "../middlewares/auth.middleware.js";

const router = express.Router();

router.get("/", protect, authorize("admin", "staff"), getAuditLogs);

export default router;