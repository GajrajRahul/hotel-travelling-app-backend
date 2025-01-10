import bcrypt from "bcrypt";
import crypto, { randomUUID } from "crypto";
import jwt from "jsonwebtoken";
import nodemailer from "nodemailer";
import { DeleteObjectCommand, PutObjectCommand } from "@aws-sdk/client-s3";

import { PartnerAuthSchemaModel } from "./schema/authSchema.model.js";
import { PartnerQuotationSchemaModel } from "./schema/quotationSchema.model.js";
import s3 from "../utils/awsSdkConfig.js";
import { compressPdf, generatePdfFromHtml } from "../utils/function.js";
import { PartnerTaxiSchemaModel } from "./schema/taxiSchema.model.js";

// import { AdminNotificationSchema } from "./schema/notificationSchema.modle.js";

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
      const existingPartner = await PartnerAuthSchemaModel.findOne({
        email: email.toLowerCase(),
      });
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

        s3LogoUrl = `https://${process.env.S3_BUCKET_NAME}.s3.${process.env.AWS_REGION}.amazonaws.com/logos/${fileName}`;
      }

      const newPartner = new PartnerAuthSchemaModel({
        logo: s3LogoUrl,
        name,
        email: email.toLowerCase(),
        password: hashedPassword,
        address,
        companyName,
        mobile,
        referringAgent,
        partnerId,
        status: "pending",
        isApproved: false,
      });

      await newPartner.save();

      // const newNotification = new AdminNotificationSchema({
      //   message: `New partner signup: ${name}`,
      //   email,
      //   partnerId,
      // });

      // await newNotification.save();

      return {
        status: true,
        statusCode: 200,
        data: "Signup successful! Waiting for admin approval.",
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

      const existingPartner = await PartnerAuthSchemaModel.findOne({
        email: email.toLowerCase(),
      });
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
        isApproved,
        status,
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

      if (status == "pending") {
        return {
          status: false,
          statusCode: 401,
          data: null,
          error:
            // "Hold tight! Your account awaits admin approval—confirmation coming soon!",
            "Stay tuned! Request under review.",
        };
      } else if (status == "rejected") {
        return {
          status: false,
          statusCode: 401,
          data: null,
          error: "Oops! Admin rejected your signup",
        };
      } else if (status == "blocked") {
        return {
          status: false,
          statusCode: 401,
          data: null,
          error: "Uh-oh! Your account is blocked.",
        };
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

  fetchPartnerProfile = async (data) => {
    const { partnerid: partnerId } = data.headers;

    try {
      const partnerDetails = await PartnerAuthSchemaModel.findOne({
        partnerId,
      });
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

  updatePartnerProfile = async (data) => {
    const { partnerid: partnerId } = data.headers;

    try {
      const existingPartner = await PartnerAuthSchemaModel.findOne({
        partnerId,
      });
      if (!existingPartner) {
        return {
          status: false,
          statusCode: 404,
          data: null,
          error: "Partner not found",
        };
      }

      // Handle logo update
      let newLogoUrl = existingPartner.logo; // Default to the current logo
      if (data.body.logo) {
        // Remove the old logo from S3 if it exists
        if (existingPartner.logo) {
          const oldKey = existingPartner.logo.split("/").slice(-2).join("/"); // Extract the S3 key
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
          // ACL: "public-read",
        };

        const uploadResult = await s3.send(new PutObjectCommand(uploadParams));
        newLogoUrl = `https://${process.env.S3_BUCKET_NAME}.s3.${process.env.AWS_REGION}.amazonaws.com/logos/${newFileName}`;
      }

      const existingPartnerProfile =
        await PartnerAuthSchemaModel.findOneAndUpdate(
          { partnerId },
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
        data: existingPartnerProfile,
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

  partnerForgotPassword = async (data) => {
    const { email } = data;

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

      const resetLink = `${process.env.FRONTEND_URL}/reset-password/partner?token=${resetToken}`;
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
    // const { quotationData } = data.body;

    try {
      const partnerDetails = await PartnerAuthSchemaModel.findOne({
        partnerId,
      });
      if (!partnerDetails) {
        return {
          status: false,
          statusCode: 404,
          data: null,
          error: "Partner doesn't exist",
        };
      }

      let htmlContent = data.body.htmlContent;
      htmlContent = htmlContent.replaceAll("&quot;", "");

      // Step 1: Convert HTML to PDF
      // console.log(htmlContent);
      // return {
      //   status: false,
      //   statusCode: 500,
      //   data: null,
      //   error: error.message,
      // };
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
        ContentEncoding: "gzip",
      };

      const uploadResult = await s3.send(new PutObjectCommand(uploadParams));
      const pdfUrl = `https://${uploadParams.Bucket}.s3.amazonaws.com/${uploadParams.Key}`;

      const newQuotation = new PartnerQuotationSchemaModel({
        ...data.body,
        pdfUrl,
        partnerId,
      });

      await newQuotation.save();

      return {
        status: true,
        statusCode: 200,
        data: { link: pdfUrl, message: "Quotation saved successfully" },
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
    // const { id, citiesHotelsInfo, quotationName, transportInfo, travelinfo } =
    //   data.body;
    const { id, ...others } = data.body;

    try {
      let htmlContent = data.body.htmlContent;
      htmlContent = htmlContent.replaceAll("&quot;", "");

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
      const pdfUrl = `https://${uploadParams.Bucket}.s3.amazonaws.com/${uploadParams.Key}`;

      const existingQuotation = await PartnerQuotationSchemaModel.findOne({
        _id: id,
        partnerId: partnerId ?? data.body.partnerId,
      });
      if (!existingQuotation) {
        return {
          status: false,
          statusCode: 404,
          data: null,
          error: "Quotation not found or doesn't belong to the partner",
        };
      }

      const updatedQuotation =
        await PartnerQuotationSchemaModel.findByIdAndUpdate(
          id,
          { ...others, partnerId: partnerId ?? data.body.partnerId, pdfUrl },
          { new: true, runValidators: true } // new: true to return the updated document
        );

      return {
        status: true,
        statusCode: 200,
        data: { link: pdfUrl, message: "Quotation updated successfully" },
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

  deletePartnerQuotation = async (data) => {
    const { partnerid: partnerId } = data.headers;
    const { id } = data.body;

    try {
      const existingQuotations =
        await PartnerQuotationSchemaModel.findOneAndDelete({
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

  createTaxi = async (data) => {
    const { partnerid: partnerId } = data.headers;

    try {
      const partnerDetails = await PartnerAuthSchemaModel.findOne({
        partnerId,
      });
      if (!partnerDetails) {
        return {
          status: false,
          statusCode: 404,
          data: null,
          error: "Partner doesn't exist",
        };
      }

      const newTaxi = new PartnerTaxiSchemaModel({ ...data.body, partnerId });
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

  fetchPartnerTaxis = async (data) => {
    const { partnerid: partnerId } = data.headers;

    try {
      const partnerDetails = await PartnerAuthSchemaModel.findOne({
        partnerId,
      });
      if (!partnerDetails) {
        return {
          status: false,
          statusCode: 404,
          data: null,
          error: "Partner doesn't exist",
        };
      }

      const existingTaxis = await PartnerTaxiSchemaModel.find({
        partnerId,
      });

      return {
        status: true,
        statusCode: 200,
        data: existingTaxis.map((taxis) => ({
          ...taxis.toObject(),
          id: taxis._id.toString(),
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
}

export default new PartnerModel();
