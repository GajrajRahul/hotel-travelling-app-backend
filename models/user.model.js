import mongoose from "mongoose";
import {
  AdminQuotationSchemaModel,
  EmployeeQuotationSchemaModel,
  PartnerQuotationSchemaModel,
} from "./schema/quotationSchema.model.js";

class UserModel {
  trackPdf = async (data) => {
    // action will be view or download
    const { id, action } = data;
    try {
      const objectId = new mongoose.Types.ObjectId(id);
      //   let updatedQuotation = null;
      const results = await Promise.allSettled([
        AdminQuotationSchemaModel.findOneAndUpdate(
          { _id: objectId },
          { $inc: { [action]: 1 } },
          { new: true }
        ),
        EmployeeQuotationSchemaModel.findOneAndUpdate(
          { _id: objectId },
          { $inc: { [action]: 1 } },
          { new: true }
        ),
        PartnerQuotationSchemaModel.findOneAndUpdate(
          { _id: objectId },
          { $inc: { [action]: 1 } },
          { new: true }
        ),
      ]);

      const updatedQuotation = results
        .filter((res) => res.status === "fulfilled" && res.value !== null)
        .map((res) => res.value)[0];

      if (updatedQuotation) {
        return {
          status: true,
          statusCode: 200,
          data: { link: updatedQuotation.pdfUrl, message: "Success" },
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
}

export default new UserModel();
