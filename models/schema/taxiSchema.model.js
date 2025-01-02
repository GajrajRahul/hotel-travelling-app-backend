import mongoose from "mongoose";

import { adminDBConnection } from "../../db/db-connection.js";

const LocationSchema = new mongoose.Schema({
  place: { type: String, required: true },
  city: { type: String, required: true },
  state: { type: String, required: true },
});

const TaxiSchema = new mongoose.Schema({
  pickup: { type: LocationSchema, required: true },
  drop: { type: LocationSchema, required: true },
  tripDays: { type: String, required: true },
  route: { type: [String], required: true },
  vehicleType: { type: String, required: true },
  amount: { type: String, required: true },
  distance: { type: String, required: true },
  killoFare: { type: String, required: true },
});

const AdminTaxiSchemaModel = adminDBConnection.model("Taxi", TaxiSchema);

const EmployeeTaxiSchemaModel = adminDBConnection.model("Taxi", TaxiSchema);

const PartnerTaxiSchemaModel = adminDBConnection.model("Taxi", TaxiSchema);

export { AdminTaxiSchemaModel, EmployeeTaxiSchemaModel, PartnerTaxiSchemaModel };
