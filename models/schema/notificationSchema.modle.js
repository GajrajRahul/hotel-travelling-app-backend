import mongoose from "mongoose";
import { adminDBConnection } from "../../db/db-connection";

const NotificationSchema = new mongoose.Schema({
  message: { type: String, required: true },
  email: { type: String, required: true },
  partnerId: { type: String, ref: "Partner", required: true },
  timestamp: { type: Date, default: Date.now },
  isRead: { type: Boolean, default: false }, // Default to unread
});

// const NotificationModel = mongoose.model('Notification', NotificationSchema);
// export default NotificationModel

const AdminNotificationSchema = adminDBConnection.model(
  "Notification",
  NotificationSchema
);
export { AdminNotificationSchema };
