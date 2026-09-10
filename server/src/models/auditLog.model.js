import mongoose from "mongoose";

const auditLogSchema = new mongoose.Schema(
  {
    performedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    performedByName: { type: String, required: true },
    action: { type: String, required: true }, // e.g. "product_created", "review_hidden", "order_status_updated"
    entityType: { type: String, required: true }, // e.g. "Product", "Review", "Order"
    entityId: { type: mongoose.Schema.Types.ObjectId, required: true },
    details: { type: String }, // human-readable summary, e.g. "Status changed to Shipped"
  },
  { timestamps: true }
);

const AuditLog = mongoose.model("AuditLog", auditLogSchema);
export default AuditLog;