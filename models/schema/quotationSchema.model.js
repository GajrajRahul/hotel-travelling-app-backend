import mongoose from "mongoose";
import { adminDBConnection, employeeDBConnection, partnerDBConnection } from "../../db/db-connection.js";

const HotelInfoSchema = new mongoose.Schema({
  id: { type: Number, default: 0 },
  hotelName: { type: String, required: true },
  hotelType: { type: String, required: true },
  checkIn: { type: Date, required: true },
  checkOut: { type: Date, required: true },
  isBreakfast: { type: Boolean, default: false },
  isLunch: { type: Boolean, default: false },
  isDinner: { type: Boolean, default: false },
  rooms: { type: Number, required: true },
  roomType: { type: [String], required: true },
  adult: { type: Number, required: true },
  child: { type: Number, default: 0 },
  extraBed: { type: Number, default: 0 },
});

const CitySchema = new mongoose.Schema({
  id: { type: Number, default: 0 },
  cityName: { type: String, required: true },
  hotelInfo: { type: HotelInfoSchema, required: true },
});

const TransportInfoSchema = new mongoose.Schema({
  vehicleType: { type: String, required: true },
  from: { type: String, required: true },
  checkpoints: { type: [String], default: [] },
  to: { type: String, required: true },
});

const QuotationSchema = new mongoose.Schema(
  {
    travelInfo: {
      userName: { type: String, required: true },
      journeyStartDate: { type: Date, required: true },
      journeyEndDate: { type: Date, required: true },
    },
    citiesHotelsInfo: {
      cities: { type: [CitySchema], required: true },
    },
    transportInfo: {
      type: TransportInfoSchema,
      required: true,
    },
    partnerId: { type: String, required: true },
  },
  { timestamps: true }
);

const AdminQuotationSchemaModel = adminDBConnection.model(
  "Quotation",
  QuotationSchema
);
const PartnerQuotationSchemaModel = partnerDBConnection.model(
  "Quotation",
  QuotationSchema
);
const EmployeeQuotationSchemaModel = employeeDBConnection.model(
  "Quotation",
  QuotationSchema
);

export {
  AdminQuotationSchemaModel,
  PartnerQuotationSchemaModel,
  EmployeeQuotationSchemaModel,
};
// export default QuotationSchema;
