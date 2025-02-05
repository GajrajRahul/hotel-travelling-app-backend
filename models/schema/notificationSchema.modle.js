import mongoose from "mongoose";
import {
  adminDBConnection,
  employeeDBConnection,
  partnerDBConnection,
} from "../../db/db-connection.js";

const NotificationSchema = new mongoose.Schema(
  {
    userId: { type: String, ref: "User", required: true },
    type: { type: String, enum: ["signup", "quotation"], required: true },
    title: { type: String, required: true },
    description: { type: String },
    logo: { type: String },
    name: { type: String },
    quotationName: { type: String },
    quotationId: { type: String },
    email: { type: String },
    isRead: { type: Boolean, default: false },
    createdAt: { type: Date, default: Date.now }, // Default to unread
  },
  { timestamps: true }
);

// const NotificationModel = mongoose.model('Notification', NotificationSchema);
// export default NotificationModel

const AdminNotificationSchema = adminDBConnection.model(
  "Notification",
  NotificationSchema
);
const PartnerNotificationSchema = partnerDBConnection.model(
  "Notification",
  NotificationSchema
);
const EmployeeNotificationSchema = employeeDBConnection.model(
  "Notification",
  NotificationSchema
);
export {
  AdminNotificationSchema,
  PartnerNotificationSchema,
  EmployeeNotificationSchema,
};
