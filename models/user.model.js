import {
  AdminQuotationSchemaModel,
  EmployeeQuotationSchemaModel,
  PartnerQuotationSchemaModel,
} from "./schema/quotationSchema.model.js";

class UserModel {
  trackPdf = async (data) => {
    // action will be view or download
    const { id, action } = data.body;
    try {
      //   let updatedQuotation = null;
      const updatedQuotation = await Promise.any([
        AdminQuotationSchemaModel.findOneAndUpdate(
          { _id: id },
          { $inc: { [action]: 1 } },
          { new: true }
        ),
        EmployeeQuotationSchemaModel.findOneAndUpdate(
          { _id: id },
          { $inc: { [action]: 1 } },
          { new: true }
        ),
        PartnerQuotationSchemaModel.findOneAndUpdate(
          { _id: id },
          { $inc: { [action]: 1 } },
          { new: true }
        ),
      ]);

      if (updatedQuotation) {
        return {
          status: true,
          statusCode: 200,
          data: { link: updatedQuotation.pdfUrl, message: "Success" },
          error: null,
        };
      }

      return {
        status: fasle,
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
