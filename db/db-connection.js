import mongoose from "mongoose";
import dotenv from "dotenv";

dotenv.config();

// const BASE_URI = process.env.DB_BASE_URI

// const connectDB = async () => {
//   try {
 
//     const uri =
//     `${process.env.DB_BASE_URI}/travelling`
//     await mongoose.connect(uri, {
//       useNewUrlParser: true,
//       useUnifiedTopology: true,
//     });
//     console.log("Connected to MongoDB successfully");
//   } catch (error) {
//     console.error("Failed to connect to MongoDB:", error);
//     process.exit(1);
//   }
// };

const createDatabaseConnection = async (dbName) => {
  try {
    const uri = `${process.env.DB_BASE_URI}/${dbName}`;
    const connection = mongoose.createConnection(uri, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    // console.log(`Connected to MongoDB database: ${dbName}`);
    return connection;
  } catch (error) {
    console.error(`Failed to connect to MongoDB database: ${dbName}`, error);
    process.exit(1);
  }
};

// Export individual connections
const adminDBConnection = await createDatabaseConnection(process.env.DB_ADMIN_COLLECTION);
const partnerDBConnection = await createDatabaseConnection(process.env.DB_PARTNER_COLLECTION);
const employeeDBConnection = await createDatabaseConnection(process.env.DB_EMPLOYEE_COLLECTION);

export { adminDBConnection, partnerDBConnection, employeeDBConnection };

// export default connectDB;