import express from "express";
import dotenv from "dotenv";
import cors from "cors";

import partnerRouter from "./routes/partner.route.js";
import adminRouter from "./routes/admin.route.js";
import employeeRouter from "./routes/employee.route.js";
import HttpException from "./utils/HttpException.utils.js";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 4000;
// connectDB();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// app.use(
//   cors({
//     origin: ["https://crm.adventurerichaholidays.com"], // Add your frontend domain
//     methods: ["GET", "POST", "PUT", "DELETE"],
//     credentials: true,
//   })
// );

// enabling cors for all requests by using cors middleware
app.use(cors());
// Enable pre-flight
app.options("*", cors());

app.use("/api/admin", adminRouter);
app.use("/api/partner", partnerRouter);
app.use("/api/employee", employeeRouter);

app.get("/api/test", (rreq, res) => {
  res.send("Hello welcome to Richa Adventure Holidays");
});

app.all("*", (req, res, next) => {
  const err = new HttpException(404, "Endpoint Not Found");
  next(err);
});

app.listen(PORT, () => {
  console.log(`App listining at port: ${PORT}`);
});
