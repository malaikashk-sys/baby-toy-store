import AuditLog from "../models/auditLog.model.js";

// Ye function har jagah call hoga jahan bhi koi trackable admin/staff action ho.
// Agar log save karte waqt koi error aaye, to poori request fail nahi honi chahiye —
// isliye yahan try/catch se sirf console.error kiya hai, error throw nahi.
export const logAction = async ({ user, action, entityType, entityId, details }) => {
  try {
    await AuditLog.create({
      performedBy: user.id,
      performedByName: user.name,
      action,
      entityType,
      entityId,
      details,
    });
  } catch (error) {
    console.error("Audit log failed:", error.message);
  }
};