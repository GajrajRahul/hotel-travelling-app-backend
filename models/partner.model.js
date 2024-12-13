import bcrypt from "bcrypt";
import path from "path";
import fs from "fs";
import crypto, { randomUUID } from "crypto";
import jwt from "jsonwebtoken";

import { PartnerAuthSchemaModel } from "./schema/authSchema.model.js";
import { PartnerQuotationSchemaModel } from "./schema/quotationSchema.model.js";

class PartnerModel {
  partnerSignUp = async (data) => {
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
      const existingPartner = await PartnerAuthSchemaModel.findOne({ email });
      if (existingPartner) {
        return {
          status: false,
          statusCode: 409,
          data: null,
          error: "Email already exists",
        };
      }

      const hashedPassword = await bcrypt.hash(password, 10);
      const partnerId = `partner_${new Date().getTime()}_${Math.random()
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

      const newPartner = new PartnerAuthSchemaModel({
        logo: fileName ? `${process.env.BASE_URL}/images/${fileName}` : null,
        name,
        email,
        password: hashedPassword,
        address,
        companyName,
        mobile,
        referringAgent,
        partnerId,
        isApproved: false
      })

      await newPartner.save();

      return {
        status: true,
        statusCode: 200,
        data: "Partner created successfully",
        error: null,
      };
    } catch (error) {
      console.error("Error during partnerSignUp:", error);
      return { status: false, data: null, error, statusCode: 500 };
    }
  };

  partnerSignIn = async (data) => {
    try {
      const { email, password } = data;

      const existingPartner = await PartnerAuthSchemaModel.findOne({ email });
      if (!existingPartner) {
        return {
          status: false,
          statusCode: 404,
          data: null,
          error: "Partner doesn't exist",
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
        partnerId,
        isApproved
      } = existingPartner;

      const isMatch = await bcrypt.compare(password, p_password);
      if (!isMatch) {
        return {
          status: false,
          statusCode: 401,
          data: null,
          error: "Invalid username or password",
        };
      }

      if(!isApproved) {
        return {
          status: false,
          statusCode: 401,
          data: null,
          error: "Hold tight! Your account awaits admin approval—confirmation coming soon!",
        }
      }

      const token = jwt.sign(
        { email, name, partnerId },
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
          partnerId,
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

  fetchPartnerProfile = async (data) => {
    const { partnerid: partnerId } = data.headers;

    try {
      const partnerDetails = await PartnerAuthSchemaModel.findOne({ partnerId });
      if (!partnerDetails) {
        return {
          status: false,
          statusCode: 404,
          data: null,
          error: "Partner doesn't exist",
        };
      }

      return {
        status: true,
        statusCode: 200,
        data: partnerDetails,
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

  partnerForgotPassword = async (data) => {
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
      const partner = await PartnerAuthSchemaModel.findOne({ email });
      if (!partner) {
        return {
          status: false,
          statusCode: 404,
          data: null,
          error: "Partner doesn't exist",
        };
      }

      const resetToken = crypto.randomBytes(32).toString("hex");
      const hashedToken = crypto
        .createHash("sha256")
        .update(resetToken)
        .digest("hex");

      partner.passwordResetToken = hashedToken;
      partner.passwordResetExpires = Date.now() + 3600000; // 1 hour
      await partner.save();

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

  partnerResetPassword = async (data) => {
    try {
      const { token, password } = data;

      // Hash the provided token to match it against the saved one
      const hashedToken = crypto
        .createHash("sha256")
        .update(token)
        .digest("hex");

      // Find the user by the reset token and check if it's still valid
      const partner = await PartnerAuthSchemaModel.findOne({
        passwordResetToken: hashedToken,
        passwordResetExpires: { $gt: Date.now() }, // Check if the token is not expired
      });

      if (!partner) {
        return {
          status: false,
          statusCode: 400,
          data: null,
          error: "Invalid or expired reset token",
        };
      }

      // Update the user's password
      const hashedPassword = await bcrypt.hash(password, 10);
      partner.password = hashedPassword;
      partner.passwordResetToken = undefined; // Clear the token
      partner.passwordResetExpires = undefined; // Clear the expiration
      await partner.save();

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

  createPartnerQuotation = async (data) => {
    const { partnerid: partnerId } = data.headers;

    try {
      const partnerDetails = await PartnerAuthSchemaModel.findOne({ partnerId });
      if (!partnerDetails) {
        return {
          status: false,
          statusCode: 404,
          data: null,
          error: "Partner doesn't exist",
        };
      }

      const newQuotation = new PartnerQuotationSchemaModel(quotationData);

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

  updatePartnerQuotation = async (data) => {
    const { partnerid: partnerId } = data.headers;
    const { id } = data.body;

    try {
      const existingQuotation = await PartnerQuotationSchemaModel.findOne({
        _id: id,
        partnerId,
      });
      if (!existingQuotation) {
        return {
          status: false,
          statusCode: 404,
          data: null,
          error: "Quotation not found or doesn't belong to the partner",
        };
      }

      const updatedQuotation = await PartnerQuotationSchemaModel.findByIdAndUpdate(
        id,
        { ...updateData },
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

  fetchPartnerQuotations = async (data) => {
    const { partnerid: partnerId } = data.headers;

    try {
      const existingQuotations = await PartnerQuotationSchemaModel.find({
        partnerId,
      });

      if (!existingQuotations) {
        return {
          status: false,
          statusCode: 404,
          data: null,
          error: "Partner doesn't exist",
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

  deletePartnerQuotation = async (data) => {
    const { partnerid: partnerId } = data.headers;
    const { id } = data.body;

    try {
      const existingQuotations = await PartnerQuotationSchemaModel.findOneAndDelete({
        _id: id,
        partnerId,
      });

      if (!existingQuotations) {
        return {
          status: false,
          statusCode: 404,
          data: null,
          error: "Partner doesn't exist",
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

export default new PartnerModel();
