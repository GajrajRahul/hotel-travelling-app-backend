import jwt from "jsonwebtoken";
import dotenv from "dotenv";

dotenv.config();

const adminAuth = () => {
  return async function (req, res, next) {
    const authHeader = req.headers["authorization"];
    const adminId = req.headers["adminid"];

    if (!authHeader || !adminId) {
      return res
        .status(401)
        .json({ status: false, data: null, error: "Invalid Auth Token" });
    }

    const token = authHeader.split(" ")[1];

    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      if (decoded.adminId !== adminId) {
        return res
          .status(401)
          .json({ status: false, data: null, error: "Invalid Auth Token" });
      }

      next();
    } catch (error) {
      return res
        .status(401)
        .json({ status: false, data: null, error: "Invalid Auth Token" });
    }
  };
};

export { adminAuth };