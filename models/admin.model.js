import bcrypt from "bcrypt";
import path from "path";
import fs from "fs";
import crypto, { randomUUID } from "crypto";
import jwt from "jsonwebtoken";
import { DeleteObjectCommand, PutObjectCommand } from "@aws-sdk/client-s3";
import nodemailer from "nodemailer";

import {
  AdminAuthSchemaModel,
  EmployeeAuthSchemaModel,
  PartnerAuthSchemaModel,
} from "./schema/authSchema.model.js";
import {
  AdminQuotationSchemaModel,
  EmployeeQuotationSchemaModel,
  PartnerQuotationSchemaModel,
} from "./schema/quotationSchema.model.js";
import s3 from "../utils/awsSdkConfig.js";
import {
  compressPdf,
  generatePdfFromHtml,
  getBlockedSignupHTML,
  getForgotPasswordHTML,
  getRejectedSignupHTML,
  getSuccessSignupHTML,
} from "../utils/function.js";
import {
  AdminTaxiSchemaModel,
  EmployeeTaxiSchemaModel,
  PartnerTaxiSchemaModel,
} from "./schema/taxiSchema.model.js";
import {
  AdminNotificationSchema,
  EmployeeNotificationSchema,
  PartnerNotificationSchema,
} from "./schema/notificationSchema.modle.js";
import mongoose from "mongoose";

class AdminModel {
  adminSignUp = async (data) => {
    const { companyName, designation, tagline, gender, title, about } = data;
    const { logo, name, email, password, mobile, address } = data;

    try {
      const existingAdmin = await AdminAuthSchemaModel.findOne({
        email: email.toLowerCase(),
      });
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
      let s3LogoUrl = null;
      if (logo) {
        const base64Data = logo.replace(/^data:image\/\w+;base64,/, "");
        const buffer = Buffer.from(base64Data, "base64");
        const extension = logo.substring(
          "data:image/".length,
          logo.indexOf(";base64")
        );
        fileName = `${randomUUID()}_${Date.now()}.${extension}`;

        const uploadParams = {
          Bucket: process.env.S3_BUCKET_NAME,
          Key: `logos/${fileName}`,
          Body: buffer,
          ContentType: `image/${extension}`,
          // ACL: "public-read",
        };

        const uploadResult = await s3.send(new PutObjectCommand(uploadParams));

        // s3LogoUrl = `https://${process.env.S3_BUCKET_NAME}.s3.${process.env.AWS_REGION}.amazonaws.com/logos/${fileName}`;
        s3LogoUrl = `https://${process.env.S3_BUCKET_NAME}/${uploadParams.Key}`;
      }

      const newAdmin = new AdminAuthSchemaModel({
        logo: s3LogoUrl,
        name,
        email: email.toLowerCase(),
        password: hashedPassword,
        originalPassword: password,
        address,
        companyName,
        mobile,
        adminId,
        status: "approved",
        designation: designation || "",
        tagline: tagline || "",
        gender: gender || "",
        title: title || "",
        about: about || "",
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

      const existingAdmin = await AdminAuthSchemaModel.findOne({
        email: email.toLowerCase(),
      });
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
        adminId,
        status,
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
          adminId,
          status,
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

  adminForgotPassword = async (data) => {
    const { email } = data;

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

      const resetLink = `${process.env.FRONTEND_URL}/reset-password/admin?token=${resetToken}`;
      const transporter = nodemailer.createTransport({
        host: "smtp.hostinger.com",
        port: 465,
        secure: true,
        auth: {
          user: process.env.EMAIL_USER,
          pass: process.env.EMAIL_PASSWORD,
        },
      });

      await transporter.sendMail({
        from: process.env.EMAIL_USER,
        to: email,
        subject: "Reset Password Request | Adventure Richa Holidays",
        text: `Please click the link to reset your password: ${resetLink}`,
        // html: `<a href="${resetLink}">Reset Password</a>`,
        html: getForgotPasswordHTML(resetLink),
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
      admin.originalPassword = password;
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

  updateAdminProfile = async (data) => {
    const { adminid: adminId } = data.headers;

    try {
      const existingAdmin = await AdminAuthSchemaModel.findOne({ adminId });
      if (!existingAdmin) {
        return {
          status: false,
          statusCode: 404,
          data: null,
          error: "Admin not found",
        };
      }

      // Handle logo update
      let newLogoUrl = existingAdmin.logo; // Default to the current logo
      if (data.body.logo) {
        // Remove the old logo from S3 if it exists
        if (existingAdmin.logo) {
          const oldKey = existingAdmin.logo.split("/").slice(-2).join("/"); // Extract the S3 key
          const deleteParams = {
            Bucket: process.env.S3_BUCKET_NAME,
            Key: oldKey,
          };
          await s3.send(new DeleteObjectCommand(deleteParams));
        }

        // Upload the new logo to S3
        const base64Data = data.body.logo.replace(
          /^data:image\/\w+;base64,/,
          ""
        );
        const buffer = Buffer.from(base64Data, "base64");
        const extension = data.body.logo.substring(
          "data:image/".length,
          data.body.logo.indexOf(";base64")
        );
        const newFileName = `${randomUUID()}_${Date.now()}.${extension}`;

        const uploadParams = {
          Bucket: process.env.S3_BUCKET_NAME,
          Key: `logos/${newFileName}`,
          Body: buffer,
          ContentType: `image/${extension}`,
        };

        const uploadResult = await s3.send(new PutObjectCommand(uploadParams));
        // newLogoUrl = `https://${process.env.S3_BUCKET_NAME}.s3.${process.env.AWS_REGION}.amazonaws.com/logos/${newFileName}`;
        newLogoUrl = `https://${process.env.S3_BUCKET_NAME}/${uploadParams.Key}`;
      }

      const existingAdminProfile = await AdminAuthSchemaModel.findOneAndUpdate(
        { adminId },
        {
          ...data.body,
          email: data.body.email.toLowerCase(),
          logo: newLogoUrl,
        },
        { new: true }
      );

      return {
        status: true,
        statusCode: 200,
        data: existingAdminProfile,
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

  createAdminQuotation = async (data) => {
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

      let htmlContent = data.body.htmlContent;
      htmlContent = htmlContent.replaceAll("&quot;", "");
      let pdfUrl = "";

      if (data.body.willGenerateNewPdf) {
        const pdfBuffer = await generatePdfFromHtml(htmlContent);

        // Step 2: Compress the PDF
        const compressedPdfBuffer = await compressPdf(pdfBuffer);

        // Step 3: Upload to S3
        const uploadParams = {
          Bucket: process.env.S3_BUCKET_NAME,
          Key: `itinerary-pdfs/${Date.now()}-arh.pdf`,
          Body: compressedPdfBuffer,
          // Body: pdfBuffer,
          ContentType: "application/pdf",
        };

        const uploadResult = await s3.send(new PutObjectCommand(uploadParams));
        // const pdfUrl = `https://${uploadParams.Bucket}.s3.amazonaws.com/${uploadParams.Key}`;
        pdfUrl = `https://${uploadParams.Bucket}/${uploadParams.Key}`;
      }
      // Step 1: Convert HTML to PDF

      const newQuotation = new AdminQuotationSchemaModel({
        ...data.body,
        pdfUrl,
        userId: adminId,
      });

      await newQuotation.save();

      return {
        status: true,
        statusCode: 200,
        data: {
          link: pdfUrl,
          message: "Quotation saved successfully",
          id: newQuotation._id.toString(),
        },
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

  updateAdminQuotation = async (data) => {
    const {
      adminid: adminId,
      partnerid: partnerId,
      employeeid: employeeId,
    } = data.headers;
    // const { id, adminId, partnerId, employeeId } = data.body;
    const { id } = data.body;

    try {
      let updatedQuotation = null;
      let htmlContent = data.body.htmlContent;
      htmlContent = htmlContent.replaceAll("&quot;", "");
      let pdfUrl = "";

      if (data.body.willGenerateNewPdf) {
        // Step 1: Convert HTML to PDF
        const pdfBuffer = await generatePdfFromHtml(htmlContent);

        // Step 2: Compress the PDF
        const compressedPdfBuffer = await compressPdf(pdfBuffer);

        // Step 3: Upload to S3
        const uploadParams = {
          Bucket: process.env.S3_BUCKET_NAME,
          Key: `itinerary-pdfs/${Date.now()}-arh.pdf`,
          Body: compressedPdfBuffer,
          // Body: pdfBuffer,
          ContentType: "application/pdf",
        };

        const uploadResult = await s3.send(new PutObjectCommand(uploadParams));
        // const pdfUrl = `https://${uploadParams.Bucket}.s3.amazonaws.com/${uploadParams.Key}`;
        pdfUrl = `https://${uploadParams.Bucket}/${uploadParams.Key}`;
      }

      if (adminId) {
        updatedQuotation = await AdminQuotationSchemaModel.findOneAndUpdate(
          { _id: id, userId: adminId },
          { ...data.body, pdfUrl },
          { new: true }
        );
      } else if (employeeId) {
        updatedQuotation = await EmployeeQuotationSchemaModel.findOneAndUpdate(
          { _id: id, userId: employeeId },
          { ...data.body, pdfUrl },
          { new: true }
        );
      } else {
        updatedQuotation = await PartnerQuotationSchemaModel.findOneAndUpdate(
          { _id: id, userId: partnerId },
          { ...data.body, pdfUrl },
          { new: true }
        );
      }

      if (updatedQuotation) {
        return {
          status: true,
          statusCode: 200,
          data: { link: pdfUrl, message: "Quotation updated successfully", id },
          error: null,
        };
      }

      return {
        status: false,
        statusCode: 404,
        data: null,
        error: "Quotation not found",
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

  fetchAdminQuotations = async () => {
    try {
      const [adminQuotations, partnerQuotations, employeeQuotations] =
        await Promise.allSettled([
          AdminQuotationSchemaModel.find({}),
          PartnerQuotationSchemaModel.find({}),
          EmployeeQuotationSchemaModel.find({}),
        ]);

      const allQuotations = [
        ...(adminQuotations.status === "fulfilled"
          ? adminQuotations.value
          : []),
        ...(partnerQuotations.status === "fulfilled"
          ? partnerQuotations.value
          : []),
        ...(employeeQuotations.status === "fulfilled"
          ? employeeQuotations.value
          : []),
      ];

      return {
        status: true,
        statusCode: 200,
        data: allQuotations.map((quotation) => ({
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
    const {
      adminid: adminId,
      partnerid: partnerId,
      employeeid: employeeId,
    } = data.headers;
    const { id } = data.body;

    try {
      let deletedQuotation = null;

      if (!deletedQuotation) {
        deletedQuotation = await AdminQuotationSchemaModel.findOneAndDelete({
          _id: id,
          // adminId,
        });
      }
      if (!deletedQuotation) {
        deletedQuotation = await PartnerQuotationSchemaModel.findOneAndDelete({
          _id: id,
          // partnerId,
        });
      }
      if (!deletedQuotation) {
        deletedQuotation = await EmployeeQuotationSchemaModel.findOneAndDelete({
          _id: id,
          // employeeId,
        });
      }

      if (!deletedQuotation) {
        return {
          status: false,
          statusCode: 404,
          data: null,
          error: "Quotation not found in any collection",
        };
      }

      return {
        status: true,
        statusCode: 200,
        data: {
          id: deletedQuotation._id.toString(),
          message: "Quotation deleted successfully",
        },
        error: null,
      };
    } catch (error) {
      if (error instanceof AggregateError) {
        return {
          status: false,
          statusCode: 404,
          data: null,
          error: "Quotation not found in any collection",
        };
      }

      return {
        status: false,
        statusCode: 500,
        data: null,
        error: error.message,
      };
    }
  };

  getEmployeeQuoteCount = async (employee) => {
    try {
      const count = await EmployeeQuotationSchemaModel.countDocuments({
        userId: employee.employeeId,
      });
      return count;
    } catch (error) {
      console.error("Error getting document count:", error);
      return 0;
    }
  };

  getPartnerQuoteCount = async (partner) => {
    try {
      const count = await PartnerQuotationSchemaModel.countDocuments({
        userId: partner.partnerId,
      });
      return count;
    } catch (error) {
      console.error("Error getting document count:", error);
      return 0;
    }
  };

  fetchAllUsers = async (data) => {
    try {
      const [partnerUsers, employeeUsers] = await Promise.allSettled([
        PartnerAuthSchemaModel.find({}),
        EmployeeAuthSchemaModel.find({}),
      ]);

      let allUsers = [
        ...(partnerUsers.status === "fulfilled"
          ? partnerUsers.value.map((partner) => ({
              ...partner.toObject(),
              role: "Partner",
            }))
          : []),
        ...(employeeUsers.status === "fulfilled"
          ? employeeUsers.value.map((employee) => ({
              ...employee.toObject(),
              role: "Employee",
            }))
          : []),
      ];

      allUsers = await Promise.all(
        allUsers.map(async (user) => {
          const totalQuote =
            user.role === "Partner"
              ? await this.getPartnerQuoteCount(user)
              : await this.getEmployeeQuoteCount(user);

          return {
            ...user,
            id: user._id.toString(),
            totalQuote,
          };
        })
      );

      return {
        status: true,
        statusCode: 200,
        data: allUsers.map((user) => ({
          ...user,
          id: user._id.toString(),
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

  updateUserStatus = async (data) => {
    const { id, employeeId, partnerId, status, email } = data.body;

    try {
      let existingUser = null;

      const Model = employeeId
        ? EmployeeAuthSchemaModel
        : partnerId
        ? PartnerAuthSchemaModel
        : null;

      if (!Model) {
        return {
          status: false,
          statusCode: 500,
          data: null,
          error: "Neither employeeId nor partnerId provided.",
        };
      }

      // Find the user
      existingUser = await Model.findOne({
        _id: id,
        ...(employeeId ? { employeeId } : { partnerId }),
      });

      if (!existingUser) {
        return {
          status: false,
          statusCode: 404,
          data: null,
          error: "User not found.",
        };
      }

      // Update status
      existingUser.status = status;
      await existingUser.save();

      const transporter = nodemailer.createTransport({
        host: "smtp.hostinger.com",
        port: 465,
        secure: true,
        auth: {
          user: process.env.EMAIL_USER,
          pass: process.env.EMAIL_PASSWORD,
        },
      });

      await transporter.sendMail({
        from: process.env.EMAIL_USER,
        to: email,
        subject:
          status == "approved"
            ? "Signup Approved | Welcome to Adventure Richa Holidays"
            : status == "rejected"
            ? "Signup Rejected | Adventure Richa Holidays"
            : "Account Unblocked | Adventure Richa Holidays",
        text: `Your status is ${
          status == "approved"
            ? "Approved"
            : status == "rejected"
            ? "Rejected"
            : "Blocked"
        } by the Admin`,
        html:
          status == "approved"
            ? getSuccessSignupHTML()
            : status == "rejected"
            ? getRejectedSignupHTML()
            : getBlockedSignupHTML(),
      });

      if (existingUser) {
        return {
          status: true,
          statusCode: 200,
          data: {
            ...existingUser.toObject(),
            id: existingUser._id.toString(),
          },
          error: null,
        };
      }
    } catch (error) {
      return {
        status: false,
        statusCode: 500,
        data: null,
        error: error.message,
      };
    }
  };

  createTaxi = async (data) => {
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

      const newTaxi = new AdminTaxiSchemaModel({
        ...data.body,
        userId: adminId,
      });
      await newTaxi.save();

      return {
        status: true,
        statusCode: 200,
        data: "Saved Sccessfully",
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

  updateTaxi = async (data) => {
    const { id } = data.body;

    try {
      // const objectId = new mongoose.Types.ObjectId(id);
      //   let updatedQuotation = null;
      const results = await Promise.allSettled([
        AdminTaxiSchemaModel.findOneAndUpdate({ _id: id }, data.body, {
          new: true,
        }),
        PartnerTaxiSchemaModel.findOneAndUpdate({ _id: id }, data.body, {
          new: true,
        }),
      ]);

      const updatedTaxiData = results
        .filter((res) => res.status === "fulfilled" && res.value !== null)
        .map((res) => res.value)[0];

      if (updatedTaxiData) {
        return {
          status: true,
          statusCode: 200,
          data: "Success",
          error: null,
        };
      }

      return {
        status: false,
        statusCode: 404,
        data: null,
        error: "Taxi Data not found",
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

  deleteTaxi = async (data) => {
    const { id } = data.body;

    try {
      const results = await Promise.allSettled([
        AdminTaxiSchemaModel.findByIdAndDelete(id),
        PartnerTaxiSchemaModel.findByIdAndDelete(id),
      ]);

      const isDeleted = results.find(
        (res) => res.status === "fulfilled" && res.value !== null
      )?.value;

      if (isDeleted) {
        return {
          status: true,
          statusCode: 200,
          data: "Success",
          error: null,
        };
      }

      return {
        status: false,
        statusCode: 404,
        data: null,
        error: "Taxi Data not found",
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

  fatchTaxis = async () => {
    try {
      const [adminTaxis, partnerTaxis] = await Promise.allSettled([
        AdminTaxiSchemaModel.find({}),
        PartnerTaxiSchemaModel.find({}),
      ]);

      const allTaxisData = [
        ...(adminTaxis.status === "fulfilled"
          ? adminTaxis.value.map((admin) => {
              return { ...admin.toObject(), role: "Admin" };
            })
          : []),
        ...(partnerTaxis.status === "fulfilled"
          ? partnerTaxis.value.map((partner) => {
              return { ...partner.toObject(), role: "Partner" };
            })
          : []),
      ];

      return {
        status: true,
        statusCode: 200,
        data: allTaxisData.map((taxiData) => ({
          ...taxiData,
          id: taxiData._id.toString(),
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

  fetchTaxiData = async (data) => {
    const { adminId, partnerId, id } = data.body;

    try {
      if (!id) {
        return {
          status: false,
          statusCode: 400,
          data: null,
          error: "Taxi id is required",
        };
      }

      const existingTaxiData = adminId
        ? await AdminTaxiSchemaModel.findOne({ _id: id, userId: adminId })
        : await PartnerTaxiSchemaModel.findOne({ _id: id, userId: partnerId });

      if (!existingTaxiData) {
        return {
          status: false,
          statusCode: 404,
          data: null,
          error: "Taxi data not found",
        };
      }

      return {
        status: true,
        statusCode: 200,
        data: existingTaxiData,
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

  sendCustomNotification = async (data) => {
    const { title, description, link, logo, users } = data;

    try {
      let fileName = null;
      let s3LogoUrl = null;
      if (logo) {
        const base64Data = logo.replace(/^data:image\/\w+;base64,/, "");
        const buffer = Buffer.from(base64Data, "base64");
        const extension = logo.substring(
          "data:image/".length,
          logo.indexOf(";base64")
        );
        fileName = `${randomUUID()}_${Date.now()}.${extension}`;

        const uploadParams = {
          Bucket: process.env.S3_BUCKET_NAME,
          Key: `logos/${fileName}`,
          Body: buffer,
          ContentType: `image/${extension}`,
          // ACL: "public-read",
        };

        const uploadResult = await s3.send(new PutObjectCommand(uploadParams));

        // s3LogoUrl = `https://${process.env.S3_BUCKET_NAME}.s3.${process.env.AWS_REGION}.amazonaws.com/logos/${fileName}`;
        s3LogoUrl = `https://${process.env.S3_BUCKET_NAME}/${uploadParams.Key}`;
      }

      for (const user of users) {
        const { userId, name, email } = user;
        const createdAt = Date.now();
        const notificationData = {
          userId,
          type: "custom",
          title,
          description,
          logo: s3LogoUrl,
          name,
          link,
          email,
          createdAt,
        };

        let notification;
        let savedNotification;
        if (userId.includes("employee")) {
          notification = new EmployeeNotificationSchema(notificationData);
          savedNotification = await notification.save();
        } else if (userId.includes("partner")) {
          notification = new PartnerNotificationSchema(notificationData);
          savedNotification = await notification.save();
        }

        try {
          getIOInstance().to(userId).emit("custom", {
            userId,
            title,
            name,
            link,
            type: "custom",
            notificationId: savedNotification._id.toString(),
            description,
            createdAt,
          });
        } catch (err) {
          // console.log("err in employee update quotation", err);
          // console.error("Socket.io not initialized. Cannot emit event.");
        }
      }

      return {
        status: true,
        statusCode: 200,
        data: "Success",
        error: null,
      };
    } catch (error) {
      return {
        status: false,
        statusCode: 500,
        data: null,
        error: error.meaasge,
      };
    }
  };

  fetchNotifications = async (data) => {
    try {
      const notifications = await AdminNotificationSchema.find({
        isRead: false,
      }).sort({
        timestamp: -1,
      });

      return {
        status: true,
        statusCode: 200,
        data: notifications.map((notification) => ({
          ...notification.toObject(),
          notificationId: notification._id.toString(),
          id: notification._id.toString(),
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

  updateNotificationStatus = async (data) => {
    try {
      const notification = await AdminNotificationSchema.findByIdAndUpdate(
        data.id,
        { isRead: true },
        { new: true }
      );

      return {
        status: true,
        statusCode: 200,
        data: notification,
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
