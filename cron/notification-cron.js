import cron from "node-cron";

import {
  AdminNotificationSchema,
  EmployeeNotificationSchema,
  PartnerNotificationSchema,
} from "../models/schema/notificationSchema.modle.js";

const task = cron.schedule(
  "0 0 */3 * *",
  async () => {
    // const task = cron.schedule(
    //   "* * * * *",
    //   async () => {
    try {
      const employee = await EmployeeNotificationSchema.deleteMany({
        isRead: true,
      });
      const partner = await PartnerNotificationSchema.deleteMany({
        isRead: true,
      });
      const admin = await AdminNotificationSchema.deleteMany({ isRead: true });
    //   console.log(
    //     `Deleted ${employee.deletedCount} documents with isRead: true.`
    //   );
    //   console.log(
    //     `Deleted ${partner.deletedCount} documents with isRead: true.`
    //   );
    //   console.log(`Deleted ${admin.deletedCount} documents with isRead: true.`);
    } catch (error) {
      console.error("Error deleting documents:", error);
    }
  },
  {
    scheduled: false,
  }
);

export default task;
