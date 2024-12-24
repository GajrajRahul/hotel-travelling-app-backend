import mongoose from "mongoose";
import { adminDBConnection, employeeDBConnection, partnerDBConnection } from "../../db/db-connection.js";

const AuthSchema = new mongoose.Schema({
  logo: { type: String },
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  address: { type: String },
  gender: { type: String },
  designation: { type: String },
  tagline: { type: String },
  title: { type: String },
  about: { type: String },
  companyName: { type: String },
  mobile: { type: String },
  adminId: { type: String },
  partnerId: { type: String },
  employeeId: { type: String },
  referringAgent: { type: String },
  isApproved: { type: Boolean },
  passwordResetToken: String,
  passwordResetExpires: Date,
});

// const AuthSchemaModel = partnerDBConnection.model("Auth", AuthSchema);
// export default AuthSchemaModel;

const AdminAuthSchemaModel = adminDBConnection.model("Auth", AuthSchema);
const PartnerAuthSchemaModel = partnerDBConnection.model("Auth", AuthSchema);
const EmployeeAuthSchemaModel = employeeDBConnection.model("Auth", AuthSchema);

export { AdminAuthSchemaModel, PartnerAuthSchemaModel, EmployeeAuthSchemaModel }
