import mongoose from "mongoose";
import {
  adminDBConnection,
  employeeDBConnection,
  partnerDBConnection,
} from "../../db/db-connection.js";

const RoomTypeInfo = new mongoose.Schema({
  roomName: { type: String, required: true },
  roomCount: { type: String, required: true },
});

const HotelInfoSchema = new mongoose.Schema({
  id: { type: Number, default: 0 },
  hotelName: { type: String, required: true },
  hotelType: { type: String, required: true },
  hotelImage: { type: String },
  checkIn: { type: Date, required: true },
  checkOut: { type: Date, required: true },
  isBreakfast: { type: Boolean, default: false },
  isLunch: { type: Boolean, default: false },
  isDinner: { type: Boolean, default: false },
  rooms: { type: Number, required: true },
  roomType: { type: [String], required: true },
  // roomType: { type: [RoomTypeInfo], required: true },
  adult: { type: Number, required: true },
  child: { type: Number, default: 0 },
  extraBed: { type: Number, default: 0 },
  price: { type: String },
  image: { type: String },
});

const CitySchema = new mongoose.Schema({
  id: { type: Number, default: 0 },
  cityName: { type: String, required: true },
  hotelInfo: { type: [HotelInfoSchema], required: true },
});

const TransportInfoSchema = new mongoose.Schema({
  vehicleType: { type: String, required: true },
  from: { type: String, required: true },
  checkpoints: { type: [String], default: [] },
  to: { type: String, required: true },
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
    adminId: { type: String },
    employeeId: { type: String },
    partnerId: { type: String },
    totalAmount: { type: String },
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
