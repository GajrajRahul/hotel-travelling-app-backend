import mongoose from "mongoose";

import {
  adminDBConnection,
  partnerDBConnection,
  employeeDBConnection,
} from "../../db/db-connection.js";

const LocationSchema = new mongoose.Schema({
  place: { type: String, required: true },
  city: { type: String },
  state: { type: String, required: true },
});

const TaxiSchema = new mongoose.Schema({
  tripDate: { type: Date, required: true },
  pickup: { type: LocationSchema, required: true },
  drop: { type: LocationSchema, required: true },
  tripDays: { type: String, required: true },
  route: { type: [LocationSchema], required: true },
  vehicleType: { type: String, required: true },
  amount: { type: String, required: true },
  distance: { type: String, required: true },
  killoFare: { type: String, required: true },
  userName: { type: String },
  isLocal: { type: Boolean },
  companyName: { type: String },
  adminId: { type: String },
  partnerId: { type: String },
});

const AdminTaxiSchemaModel = adminDBConnection.model("Taxi", TaxiSchema);

const EmployeeTaxiSchemaModel = employeeDBConnection.model("Taxi", TaxiSchema);

const PartnerTaxiSchemaModel = partnerDBConnection.model("Taxi", TaxiSchema);

export {
  AdminTaxiSchemaModel,
  EmployeeTaxiSchemaModel,
  PartnerTaxiSchemaModel,
};
