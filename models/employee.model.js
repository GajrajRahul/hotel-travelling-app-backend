import bcrypt from "bcrypt";
import path from "path";
import fs from "fs";
import crypto, { randomUUID } from "crypto";
import jwt from "jsonwebtoken";

import { EmployeeAuthSchemaModel } from "./schema/authSchema.model.js";
import { EmployeeQuotationSchemaModel } from "./schema/quotationSchema.model.js";

class EmployeeModel {
  employeeSignUp = async (data) => {
    const {
      logo,
      name,
      email,
      password,
      address,
      companyName,
      mobile,
      referringAgent,
    } = data;

    try {
      const existingEmployee = await EmployeeAuthSchemaModel.findOne({ email });
      if (existingEmployee) {
        return {
          status: false,
          statusCode: 409,
          data: null,
          error: "Email already exists",
        };
      }

      const hashedPassword = await bcrypt.hash(password, 10);
      const employeeId = `employee_${new Date().getTime()}_${Math.random()
        .toString(36)
        .substring(2, 15)}`;

      let fileName = null;
      if (logo) {
        // Save base64 logo image
        const base64Data = logo.replace(/^data:image\/\w+;base64,/, "");
        const buffer = Buffer.from(base64Data, "base64");
        const extension = logo.substring(
          "data:image/".length,
          logo.indexOf(";base64")
        );
        fileName = `${randomUUID()}_${Date.now()}.${extension}`;
        const filePath = path.join(process.env.IMAGE_DIRECTORY, fileName);

        await fs.promises.writeFile(filePath, buffer); // Save the file asynchronously
      }

      const newEmployee = new EmployeeAuthSchemaModel({
        logo: fileName ? `${process.env.BASE_URL}/images/${fileName}` : null,
        name,
        email,
        password: hashedPassword,
        address,
        companyName,
        mobile,
        referringAgent,
        employeeId,
        isApproved: false,
      });

      await newEmployee.save();

      return {
        status: true,
        statusCode: 200,
        data: "Employee created successfully",
        error: null,
      };
    } catch (error) {
      console.error("Error during employeeSignUp:", error);
      return { status: false, data: null, error, statusCode: 500 };
    }
  };

  employeeSignIn = async (data) => {
    try {
      const { email, password } = data;

      const existingEmployee = await EmployeeAuthSchemaModel.findOne({ email });
      if (!existingEmployee) {
        return {
          status: false,
          statusCode: 404,
          data: null,
          error: "Employee doesn't exist",
        };
      }

      const {
        logo,
        name,
        password: p_password,
        address,
        companyName,
        mobile,
        referringAgent,
        employeeId,
        isApproved,
      } = existingEmployee;

      const isMatch = await bcrypt.compare(password, p_password);
      if (!isMatch) {
        return {
          status: false,
          statusCode: 401,
          data: null,
          error: "Invalid username or password",
        };
      }

      // if (!isApproved) {
      //   return {
      //     status: false,
      //     statusCode: 401,
      //     data: null,
      //     error:
      //       "Hold tight! Your account awaits admin approval—confirmation coming soon!",
      //   };
      // }

      const token = jwt.sign(
        { email, name, employeeId },
        process.env.JWT_SECRET,
        {
          expiresIn: "24h",
        }
      );

      const response = {
        token,
        user_data: {
          logo,
          name,
          email,
          address,
          companyName,
          mobile,
          referringAgent,
          employeeId,
        },
      };

      return {
        status: true,
        statusCode: 200,
        data: response,
        error: null,
      };
    } catch (error) {
      return {
        status: false,
        data: null,
        error: error.message,
        statusCode: 500,
      };
    }
  };

  fetchEmployeeProfile = async (data) => {
    const { employeeid: employeeId } = data.headers;

    try {
      const employeeDetails = await EmployeeAuthSchemaModel.findOne({
        employeeId,
      });
      if (!employeeDetails) {
        return {
          status: false,
          statusCode: 404,
          data: null,
          error: "Employee doesn't exist",
        };
      }

      return {
        status: true,
        statusCode: 200,
        data: employeeDetails,
        error: null,
      };
    } catch (error) {
      return {
        status: false,
        statusCode: 500,
        data: null,
        error: "Something went wrong",
      };
    }
  };

  employeeForgotPassword = async (data) => {
    const { email } = data;
    if (!email) {
      return {
        status: false,
        statusCode: 401,
        data: null,
        error: "Email is required",
      };
    }

    try {
      const employee = await EmployeeAuthSchemaModel.findOne({ email });
      if (!employee) {
        return {
          status: false,
          statusCode: 404,
          data: null,
          error: "Employee doesn't exist",
        };
      }

      const resetToken = crypto.randomBytes(32).toString("hex");
      const hashedToken = crypto
        .createHash("sha256")
        .update(resetToken)
        .digest("hex");

      employee.passwordResetToken = hashedToken;
      employee.passwordResetExpires = Date.now() + 3600000; // 1 hour
      await employee.save();

      const resetLink = `${process.env.FRONTEND_URL}/reset-password?token=${resetToken}`;
      const transporter = nodemailer.createTransport({
        service: "Gmail",
        auth: {
          user: process.env.EMAIL_USER,
          pass: process.env.EMAIL_PASSWORD,
        },
      });

      await transporter.sendMail({
        from: '"Support" <no-reply@yourapp.com>',
        to: email,
        subject: "Password Reset Request",
        text: `Please click the link to reset your password: ${resetLink}`,
        html: `<a href="${resetLink}">Reset Password</a>`,
      });

      return {
        status: true,
        statusCode: 200,
        data: "Reset password link sent to email",
        error: null,
      };
    } catch (error) {
      return {
        status: false,
        statusCode: 500,
        data: null,
        error: error,
      };
    }
  };

  employeeResetPassword = async (data) => {
    try {
      const { token, password } = data;

      // Hash the provided token to match it against the saved one
      const hashedToken = crypto
        .createHash("sha256")
        .update(token)
        .digest("hex");

      // Find the user by the reset token and check if it's still valid
      const employee = await EmployeeAuthSchemaModel.findOne({
        passwordResetToken: hashedToken,
        passwordResetExpires: { $gt: Date.now() }, // Check if the token is not expired
      });

      if (!employee) {
        return {
          status: false,
          statusCode: 400,
          data: null,
          error: "Invalid or expired reset token",
        };
      }

      // Update the user's password
      const hashedPassword = await bcrypt.hash(password, 10);
      employee.password = hashedPassword;
      employee.passwordResetToken = undefined; // Clear the token
      employee.passwordResetExpires = undefined; // Clear the expiration
      await employee.save();

      return {
        status: true,
        statusCode: 200,
        data: "Password reset successfully",
        error: null,
      };
    } catch (error) {
      return {
        status: false,
        statusCode: 500,
        data: null,
        error: error,
      };
    }
  };

  createEmployeeQuotation = async (data) => {
    const { employeeid: employeeId } = data.headers;
    // const { quotationData } = data.body;

    try {
      const employeeDetails = await EmployeeAuthSchemaModel.findOne({
        employeeId,
      });
      if (!employeeDetails) {
        return {
          status: false,
          statusCode: 404,
          data: null,
          error: "Employee doesn't exist",
        };
      }

      const newQuotation = new EmployeeQuotationSchemaModel(data.body);

      await newQuotation.save();

      return {
        status: true,
        statusCode: 200,
        data: "Quotation saved successfully",
        error: null,
      };
    } catch (error) {
      return {
        status: false,
        statusCode: 500,
        data: null,
        error: error.message,
      };
    }
  };

  updateEmployeeQuotation = async (data) => {
    // const { employeeid: employeeId } = data.headers;
    const { id, citiesHHotelsInfo, quotationName, transportInfo, travelinfo } = data.body;

    try {
      const existingQuotation = await EmployeeQuotationSchemaModel.findOne({
        _id: id,
        // employeeId,
      });
      if (!existingQuotation) {
        return {
          status: false,
          statusCode: 404,
          data: null,
          error: "Quotation not found or doesn't belong to the employee",
        };
      }

      const updatedQuotation =
        await EmployeeQuotationSchemaModel.findByIdAndUpdate(
          id,
          { citiesHHotelsInfo, quotationName, transportInfo, travelinfo },
          { new: true, runValidators: true } // new: true to return the updated document
        );

      return {
        status: true,
        statusCode: 200,
        data: updatedQuotation,
        error: null,
      };
    } catch (error) {
      return {
        status: false,
        statusCode: 500,
        data: null,
        error: error.message,
      };
    }
  };

  fetchEmployeeQuotations = async (data) => {
    // const { employeeid: employeeId } = data.headers;

    try {
      const existingQuotations = await EmployeeQuotationSchemaModel.find({
        // employeeId,
      });

      return {
        status: true,
        statusCode: 200,
        data: existingQuotations.map((quotation) => ({
          ...quotation.toObject(),
          id: quotation._id.toString(),
        })),
        error: null,
      };
    } catch (error) {
      return {
        status: false,
        statusCode: 500,
        data: null,
        error: error.message,
      };
    }
  };

  deleteEmployeeQuotation = async (data) => {
    // const { employeeid: employeeId } = data.headers;
    const { id } = data.body;

    try {
      const existingQuotations =
        await EmployeeQuotationSchemaModel.findOneAndDelete({
          _id: id,
          // employeeId,
        });

      if (!existingQuotations) {
        return {
          status: false,
          statusCode: 404,
          data: null,
          error: "Employee doesn't exist",
        };
      }

      return {
        status: true,
        statusCode: 200,
        data: existingQuotations,
        error: null,
      };
    } catch (error) {
      return {
        status: false,
        statusCode: 500,
        data: null,
        error: error.message,
      };
    }
  };
}

export default new EmployeeModel();
