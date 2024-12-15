import bcrypt from "bcrypt";
import path from "path";
import fs from "fs";
import crypto, { randomUUID } from "crypto";
import jwt from "jsonwebtoken";

import { AdminAuthSchemaModel } from "./schema/authSchema.model.js";
import { AdminQuotationSchemaModel } from "./schema/quotationSchema.model.js";

class AdminModel {
  adminSignUp = async (data) => {
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
      const existingAdmin = await AdminAuthSchemaModel.findOne({ email });
      if (existingAdmin) {
        return {
          status: false,
          statusCode: 409,
          data: null,
          error: "Email already exists",
        };
      }

      const hashedPassword = await bcrypt.hash(password, 10);
      const adminId = `admin_${new Date().getTime()}_${Math.random()
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

      const newAdmin = new AdminAuthSchemaModel({
        logo: fileName ? `${process.env.BASE_URL}/images/${fileName}` : null,
        name,
        email,
        password: hashedPassword,
        address,
        companyName,
        mobile,
        referringAgent,
        adminId,
      });

      await newAdmin.save();

      return {
        status: true,
        statusCode: 200,
        data: "Admin created successfully",
        error: null,
      };
    } catch (error) {
      console.error("Error during adminSignUp:", error);
      return { status: false, data: null, error, statusCode: 500 };
    }
  };

  adminSignIn = async (data) => {
    try {
      const { email, password } = data;

      const existingAdmin = await AdminAuthSchemaModel.findOne({ email });
      if (!existingAdmin) {
        return {
          status: false,
          statusCode: 404,
          data: null,
          error: "Admin doesn't exist",
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
        adminId,
      } = existingAdmin;

      const isMatch = await bcrypt.compare(password, p_password);
      if (!isMatch) {
        return {
          status: false,
          statusCode: 401,
          data: null,
          error: "Invalid username or password",
        };
      }

      const token = jwt.sign({ email, name, adminId }, process.env.JWT_SECRET, {
        expiresIn: "24h",
      });

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
          adminId,
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

  fetchAdminProfile = async (data) => {
    const { adminid: adminId } = data.headers;

    try {
      const adminDetails = await AdminAuthSchemaModel.findOne({
        adminId,
      });
      if (!adminDetails) {
        return {
          status: false,
          statusCode: 404,
          data: null,
          error: "Admin doesn't exist",
        };
      }

      return {
        status: true,
        statusCode: 200,
        data: adminDetails,
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

  // fetchAdminNotifications = async (data) => {
  //   try {
  //     const notifications = await AdminNotificationSchema.find().sort({
  //       timestamp: -1,
  //     }); // Sort by most recent
  //     // .populate("partnerId", "name email"); // Optionally populate partner details

  //     return {
  //       status: true,
  //       statusCode: 200,
  //       data: notifications,
  //       error: false,
  //     };
  //   } catch (error) {
  //     return {
  //       status: false,
  //       statusCode: 500,
  //       data: null,
  //       error: "Something went wrong",
  //     };
  //   }
  // };

  // approveRegistration = async (data) => {
  //   try {
  //     const { partnerId, isApproved } = data.body;

  //     // Update the isApproved flag in the partner database
  //     const updatedPartner = await PartnerModel.findByIdAndUpdate(
  //       partnerId,
  //       { isApproved },
  //       { new: true }
  //     );

  //     if (!updatedPartner) {
  //       return res.status(404).json({ error: "Partner not found." });
  //     }

  //     res
  //       .status(200)
  //       .json({
  //         message: "Partner approved successfully.",
  //         partner: updatedPartner,
  //       });
  //   } catch (error) {
  //     res.status(500).json({ error: "Error approving partner." });
  //   }
  // };

  adminForgotPassword = async (data) => {
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
      const admin = await AdminAuthSchemaModel.findOne({ email });
      if (!admin) {
        return {
          status: false,
          statusCode: 404,
          data: null,
          error: "Admin doesn't exist",
        };
      }

      const resetToken = crypto.randomBytes(32).toString("hex");
      const hashedToken = crypto
        .createHash("sha256")
        .update(resetToken)
        .digest("hex");

      admin.passwordResetToken = hashedToken;
      admin.passwordResetExpires = Date.now() + 3600000; // 1 hour
      await admin.save();

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

  adminResetPassword = async (data) => {
    try {
      const { token, password } = data;

      // Hash the provided token to match it against the saved one
      const hashedToken = crypto
        .createHash("sha256")
        .update(token)
        .digest("hex");

      // Find the user by the reset token and check if it's still valid
      const admin = await AdminAuthSchemaModel.findOne({
        passwordResetToken: hashedToken,
        passwordResetExpires: { $gt: Date.now() }, // Check if the token is not expired
      });

      if (!admin) {
        return {
          status: false,
          statusCode: 400,
          data: null,
          error: "Invalid or expired reset token",
        };
      }

      // Update the user's password
      const hashedPassword = await bcrypt.hash(password, 10);
      admin.password = hashedPassword;
      admin.passwordResetToken = undefined; // Clear the token
      admin.passwordResetExpires = undefined; // Clear the expiration
      await admin.save();

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

  createAdminQuotation = async (data) => {
    const { adminid: adminId } = data.headers;
    // const { quotationData } = data.body;

    try {
      const adminDetails = await AdminAuthSchemaModel.findOne({
        adminId,
      });
      if (!adminDetails) {
        return {
          status: false,
          statusCode: 404,
          data: null,
          error: "Admin doesn't exist",
        };
      }

      const newQuotation = new AdminQuotationSchemaModel(data.body);

      await newQuotation.save();

      return {
        status: true,
        statusCode: 200,
        data: "Quotation saved successfully",
        error: null,
      };
    } catch (error) {
      // console.log(error);
      return {
        status: false,
        statusCode: 500,
        data: null,
        error: error.message,
      };
    }
  };

  updateAdminQuotation = async (data) => {
    // const { adminid: adminId } = data.headers;
    const { id, citiesHHotelsInfo, quotationName, transportInfo, travelinfo } =
      data.body;

    try {
      const existingQuotation = await AdminQuotationSchemaModel.findOne({
        _id: id,
        // adminId,
      });
      if (!existingQuotation) {
        return {
          status: false,
          statusCode: 404,
          data: null,
          error: "Quotation not found or doesn't belong to the admin",
        };
      }

      const updatedQuotation =
        await AdminQuotationSchemaModel.findByIdAndUpdate(
          id,
          // { ...updateData },
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

  fetchAdminQuotations = async (data) => {
    // const { adminid: adminId } = data.headers;

    try {
      const existingQuotations = await AdminQuotationSchemaModel.find({
        // adminId,
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

  deleteAdminQuotation = async (data) => {
    // const { adminid: adminId } = data.headers;
    const { id } = data.body;

    try {
      const existingQuotations =
        await AdminQuotationSchemaModel.findOneAndDelete({
          _id: id,
          // adminId,
        });

      if (!existingQuotations) {
        return {
          status: false,
          statusCode: 404,
          data: null,
          error: "Admin doesn't exist",
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

export default new AdminModel();
