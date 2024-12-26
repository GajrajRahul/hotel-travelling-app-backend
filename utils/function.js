import { PDFDocument } from "pdf-lib";
import puppeteer from "puppeteer";

export const generatePdfFromHtml = async (htmlContent) => {
  const browser = await puppeteer.launch();
  const page = await browser.newPage();
  await page.setContent(htmlContent);
  const pdfBuffer = await page.pdf({ format: "A4" });
  await browser.close();
  return pdfBuffer;
};

export const compressPdf = async (pdfBuffer) => {
  const pdfDoc = await PDFDocument.load(pdfBuffer);
  const compressedPdfBuffer = await pdfDoc.save();
  return compressedPdfBuffer;
};
