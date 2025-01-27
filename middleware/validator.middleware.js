import { body, validationResult } from "express-validator";

const validateRequest = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  next();
};

export const validateSignupRequest = [
  body("email").notEmpty().withMessage("Email is required"),
  body("password")
    .notEmpty()
    .isLength({ min: 6 })
    .withMessage("Password must be at least 6 characters long"),
  body("name").notEmpty().withMessage("Name is required"),
  // body("logo").notEmpty().withMessage("Logo is required"),
  body("companyName").notEmpty().withMessage("Company Name is required"),
  body("mobile").notEmpty().withMessage("Mobile Number is required"),
  // body("referringAgent").notEmpty().withMessage("Referring Agent is required"),
  validateRequest,
];

export const validateLoginRequest = [
  body("email").notEmpty().withMessage("Email is required"),
  body("password").notEmpty().withMessage("Password is required"),
  validateRequest,
];

export const validateForgotPasswordRequest = [
  body("email").notEmpty().withMessage("Email is required"),
  validateRequest,
];

export const validateResetPasswordRequest = [
  body("password")
    .notEmpty()
    .isLength({ min: 6 })
    .withMessage("New password must be at least 6 characters long"),
  // body("confirmnewpassword")
  //   .notEmpty()
  //   .custom((value, { req }) => value === req.body.newpassword)
  //   .withMessage("Passwords do not match"),
  validateRequest,
];

// export const validateUpsertQuotationRequest = [
//   body("name").notEmpty().withMessage("Name is required"),
//   body("journeyStartDate").notEmpty().withMessage("Journey start Date is required"),
//   body("journeyEndDate").notEmpty().withMessage("Journey end Date is required"),
//   body("cities.*.cityName").notEmpty().withMessage("City name is required"),
//   body("**.hotelName").notEmpty().withMessage("Hotel name is required"),
//   body("**.hotelType").notEmpty().withMessage("Hotel type is required"),
//   body("**.rooms").notEmpty().withMessage("Minimum 1 room is required"),
//   body("**.roomsType").notEmpty().withMessage("Minimum 1 room type is required"),
//   body("**.persons").notEmpty().withMessage("Minimum 1 person is required"),
//   body("**.hotelCheckIn").isDate().notEmpty().withMessage("Hotel checkin date is required"),
//   body("**.hotelCheckOut").isDate().notEmpty().withMessage("Hotel checkout date is required"),
//   validateRequest,
// ]

export const validateUpsertQuotationRequest = [
  // travelInfo validations
  body("travelInfo.userName").notEmpty().withMessage("Name is required"),
  body("travelInfo.journeyStartDate")
    .notEmpty()
    .withMessage("Journey start date is required"),
  body("travelInfo.journeyEndDate")
    .notEmpty()
    .withMessage("Journey end date is required"),

  // citiesHotelsInfo validations
  body("citiesHotelsInfo.cities")
    .isArray({ min: 1 })
    .withMessage("Minimum 1 city is required"),
  body("citiesHotelsInfo.cities.*.cityName")
    .notEmpty()
    .withMessage("City name is required"),
    body("citiesHotelsInfo.cities.*.hotelInfo")
    .isArray({ min: 1 })
    .withMessage("Minimum 1 hotel is required"),
  body("citiesHotelsInfo.cities.*.hotelInfo.*.name")
    .notEmpty()
    .withMessage("Hotel name is required"),
  body("citiesHotelsInfo.cities.*.hotelInfo.*.type")
    .notEmpty()
    .withMessage("Hotel type is required"),
  body("citiesHotelsInfo.cities.*.hotelInfo.*.rooms")
    .isArray({ min: 1 })
    .withMessage("Minimum 1 room is required"),
  body("citiesHotelsInfo.cities.*.hotelInfo.*.adult")
    .isInt({ gt: 0 })
    .withMessage("Minimum 1 person is required"),
  // body("citiesHotelsInfo.cities.*.hotelInfo.checkIn").isISO8601().withMessage("Hotel check-in date is required"),
  // body("citiesHotelsInfo.cities.*.hotelInfo.checkOut").isISO8601().withMessage("Hotel check-out date is required"),
  body("citiesHotelsInfo.cities.*.hotelInfo.*.checkIn")
    .notEmpty()
    .withMessage("Hotel check-in date is required"),
  body("citiesHotelsInfo.cities.*.hotelInfo.*.checkOut")
    .notEmpty()
    .withMessage("Hotel check-out date is required"),

  // transportInfo validations
  body("transportInfo.vehicleType")
    .notEmpty()
    .withMessage("Vehicle type is required"),
  // body("transportInfo.from")
  //   .notEmpty()
  //   .withMessage("From location is required"),
  // body("transportInfo.to").notEmpty().withMessage("To location is required"),
  // body("transportInfo.to").notEmpty().withMessage("To location is required"),
  body("transportInfo.from.place")
    .notEmpty()
    .withMessage("Place is required"),
  // body("transportInfo.from.city")
  //   .notEmpty()
  //   .withMessage("City is required"),
  // body("transportInfo.from.state")
  //   .notEmpty()
  //   .withMessage("State is required"),
  body("transportInfo.to.place")
    .notEmpty()
    .withMessage("Place is required"),
  // body("transportInfo.to.city")
  //   .notEmpty()
  //   .withMessage("City is required"),
  // body("transportInfo.to.state")
  //   .notEmpty()
  //   .withMessage("State is required"),

  validateRequest,
];

export const validateDeleteQuotation = [
  body("id").notEmpty().withMessage("Quotation Id is required"),
  validateRequest,
];
