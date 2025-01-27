import mongoose from "mongoose";
import {
  adminDBConnection,
  employeeDBConnection,
  partnerDBConnection,
} from "../../db/db-connection.js";

const RoomsInfo = new mongoose.Schema({
  name: { type: String, required: true },
  count: { type: String, required: true },
});

const HotelInfoSchema = new mongoose.Schema({
  id: { type: Number, default: 0 },
  name: { type: String, required: true },
  type: { type: String, required: true },
  image: { type: String },
  checkIn: { type: Date, required: true },
  checkOut: { type: Date, required: true },
  meals: { type: [String], default: [] },
  rooms: { type: [RoomsInfo], required: true },
  roomsPrice: { type: [Number], required: true },
  adult: { type: Number, required: true },
  child: { type: Number, default: 0 },
  infant: { type: Number, default: 0 },
  extraBed: { type: Number, default: 0 },
});

const CitySchema = new mongoose.Schema({
  id: { type: Number, default: 0 },
  cityName: { type: String, required: true },
  hotelInfo: { type: [HotelInfoSchema], required: true },
});

const LocationSchema = new mongoose.Schema({
  place: { type: String, required: true },
  city: { type: String },
  state: { type: String, required: true },
});

const TransportInfoSchema = new mongoose.Schema({
  vehicleType: { type: String, required: true },
  // from: { type: String, required: true },
  from: { type: LocationSchema, required: true },
  isLocal: { type: Boolean },
  // checkpoints: { type: [String], default: [] },
  checkpoints: { type: [LocationSchema], default: [] },
  // to: { type: String, required: true },
  to: { type: LocationSchema, required: true },
  transportStartDate: { type: Date, required: true },
  transportEndDate: { type: Date, required: true },
});

const QuotationSchema = new mongoose.Schema(
  {
    quotationName: { type: String, required: true },
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
    userId: { type: String, required: true },
    totalAmount: { type: String },
    userName: { type: String },
    companyName: { type: String },
    status: { type: String, default: "draft" },
    pdfUrl: { type: String },
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
