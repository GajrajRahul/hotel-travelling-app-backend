import { PDFDocument } from "pdf-lib";
import puppeteer from "puppeteer";
import zlib from "zlib";

export const generatePdfFromHtml = async (htmlContent) => {
  const browser = await puppeteer.launch({
    args: ["--no-sandbox", "--disable-setuid-sandbox"],
    headless: true, // Ensure Puppeteer runs in headless mode
  });
  // console.log("browser:", browser);
  const page = await browser.newPage();
  // console.log("page: ", page);
  await page.setContent(htmlContent);
  const pdfBuffer = await page.pdf({ format: "A4", printBackground: true, });
  await browser.close();
  return pdfBuffer;
};

export const compressPdf = async (pdfBuffer) => {
  // const pdfDoc = await PDFDocument.load(pdfBuffer);
  // const compressedPdfBuffer = await pdfDoc.save();
  const compressedBuffer = zlib.gzipSync(pdfBuffer);
  return compressedBuffer;
};
