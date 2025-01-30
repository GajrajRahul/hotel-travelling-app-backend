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
  const pdfBuffer = await page.pdf({ format: "A4", printBackground: true });
  await browser.close();
  return pdfBuffer;
};

export const compressPdf = async (pdfBuffer) => {
  const pdfDoc = await PDFDocument.load(pdfBuffer);
  const compressedPdfBuffer = await pdfDoc.save();
  return compressedPdfBuffer;
  // const compressedBuffer = zlib.gzipSync(pdfBuffer);
  // return compressedBuffer;
};

export const getForgotPasswordHTML = (resetLink) => {
  // console.log(resetLink)
  return `<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Reset Password Request | Adventure Richa Holidays</title>
  </head>
  <body style="margin: 0; padding: 0; background-color: #fff3e7">
    <table
      width="100%"
      cellspacing="0"
      cellpadding="0"
      border="0"
      style="background-color: #fff3e7"
    >
      <tr>
        <td align="center" style="padding: 20px 20px 0px 20px">
          <img
            src="https://s3.ap-south-1.amazonaws.com/asset.adventurerichaholidays.com/arh-full-logo.png"
            alt="Logo"
            style="
              display: block;
              margin: 0 auto;
              width: 150px;
              max-width: 150px;
              height: auto;
            "
          />
        </td>
      </tr>
      <tr>
        <td align="center" style="padding: 20px">
          <table
            width="600"
            cellspacing="0"
            cellpadding="0"
            border="0"
            style="
              background-color: #ffffff;
              border-radius: 20px;
              margin: 0 auto;
            "
          >
            <tr>
              <td align="center" style="padding: 20px">
                <img
                  src="https://s3.ap-south-1.amazonaws.com/asset.adventurerichaholidays.com/password_reset.jpg"
                  alt="Marketing Image"
                  style="
                    width: 250px;
                    max-width: 100%;
                    height: auto;
                    display: block;
                    margin: 0 auto;
                  "
                />
              </td>
            </tr>
            <tr>
              <td align="center" style="padding-bottom: 0px">
                <h1
                  style="
                    font-family: Helvetica, sans-serif;
                    font-size: 24px;
                    color: #375a64;
                    margin: 0;
                  "
                >
                  Forgot Your Password?
                </h1>
              </td>
            </tr>
            <tr>
              <td align="center" style="padding: 10px 0px 20px 0px">
                <p
                  style="
                    font-family: Helvetica, sans-serif;
                    font-size: 15px;
                    color: #375a64;
                    font-weight: 100;
                    margin: 0;
                    width: 85%;
                    max-width: 500px;
                  "
                >
                  We received a request to reset your password. Click the button
                  below to reset it. If you didn’t request this, please ignore
                  this email.
                </p>
              </td>
            </tr>
            <tr>
              <td align="center" style="padding-bottom: 20px">
                <a
                  href="${resetLink}"
                  style="
                    display: inline-block;
                    background-color: #ffc803;
                    letter-spacing: 1px;
                    color: #30354f;
                    font-weight: 400;
                    font-family: Helvetica, sans-serif;
                    font-size: 13px;
                    text-decoration: none;
                    padding: 10px 20px;
                    border-radius: 5px;
                    margin: 0 auto;
                  "
                  >Reset Password</a
                >
              </td>
            </tr>
            <tr>
              <td align="center" style="padding-bottom: 20px">
                <p
                  style="
                    font-family: Helvetica, sans-serif;
                    font-size: 12px;
                    font-weight: 100;
                    color: #949494;
                    margin: 0;
                  "
                >
                  For security reasons, this link will expire in 1 hour.<br />If
                  you have any questions, feel free to contact us at
                  <a
                    style="
                      color: #6c6c6c;
                      text-decoration: none;
                      font-weight: 600;
                    "
                    href="mailto:support@adventurerichaholidays.com"
                    >support@adventurerichaholidays.com</a
                  >
                </p>
              </td>
            </tr>
          </table>
        </td>
      </tr>
      <tr>
        <td align="center" style="padding-bottom: 15px">
          <a href="#"
            ><img
              src="https://s3.ap-south-1.amazonaws.com/asset.adventurerichaholidays.com/facebook.png"
              alt="Facebook"
              style="width: 19px; max-width: 19px; height: auto; margin: 0 3px"
          /></a>
          <a href="#"
            ><img
              src="https://s3.ap-south-1.amazonaws.com/asset.adventurerichaholidays.com/instagram.png"
              alt="Instagram"
              style="width: 19px; max-width: 19px; height: auto; margin: 0 3px"
          /></a>
          <a href="#"
            ><img
              src="https://s3.ap-south-1.amazonaws.com/asset.adventurerichaholidays.com/linkedin.png"
              alt="LinkedIn"
              style="width: 19px; max-width: 19px; height: auto; margin: 0 3px"
          /></a>
          <a href="#"
            ><img
              src="https://s3.ap-south-1.amazonaws.com/asset.adventurerichaholidays.com/tripadvisor.png"
              alt="Tripadvisor"
              style="width: 19px; max-width: 19px; height: auto; margin: 0 3px"
          /></a>
        </td>
      </tr>
      <tr>
        <td align="center" style="padding-bottom: 10px; text-align: center">
          <table cellspacing="0" cellpadding="0" border="0" align="center">
            <tr>
              <td style="padding: 0 5px">
                <a
                  href="#"
                  style="
                    font-family: Helvetica, sans-serif;
                    font-size: 10px;
                    font-weight: 100;
                    color: #949494;
                    text-decoration: none;
                    display: inline-flex;
                    align-items: center;
                  "
                >
                  <img
                    src="https://s3.ap-south-1.amazonaws.com/asset.adventurerichaholidays.com/document.png"
                    alt="Terms Icon"
                    style="width: 10px; height: 10px; margin-right: 5px"
                  />
                  Terms & Conditions
                </a>
              </td>
              <td style="padding: 0 5px">
                <a
                  href="#"
                  style="
                    font-family: Helvetica, sans-serif;
                    font-size: 10px;
                    font-weight: 100;
                    color: #949494;
                    text-decoration: none;
                    display: inline-flex;
                    align-items: center;
                  "
                >
                  <img
                    src="https://s3.ap-south-1.amazonaws.com/asset.adventurerichaholidays.com/help.png"
                    alt="Help Icon"
                    style="width: 10px; height: 10px; margin-right: 5px"
                  />
                  Help
                </a>
              </td>
              <td style="padding: 0 5px">
                <a
                  href="#"
                  style="
                    color: #949494;
                    font-family: Helvetica, sans-serif;
                    font-size: 10px;
                    font-weight: 100;
                    text-decoration: none;
                    display: inline-flex;
                    align-items: center;
                  "
                >
                  <img
                    src="https://s3.ap-south-1.amazonaws.com/asset.adventurerichaholidays.com/lock.png"
                    alt="Privacy Icon"
                    style="width: 10px; height: 10px; margin-right: 5px"
                  />
                  Privacy & Policies
                </a>
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  </body>
</html>
`;
};

export const getSuccessSignupHTML = () => {
  return `<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Signup Approved | Welcome to Adventure Richa Holidays</title>
  </head>
  <body style="margin: 0; padding: 0; background-color: #fff3e7">
    <table
      width="100%"
      cellspacing="0"
      cellpadding="0"
      border="0"
      style="background-color: #fff3e7"
    >
      <tr>
        <td align="center" style="padding: 20px 20px 0px 20px">
          <img
            src="https://s3.ap-south-1.amazonaws.com/asset.adventurerichaholidays.com/arh-full-logo.png"
            alt="Logo"
            style="
              display: block;
              margin: 0 auto;
              width: 150px;
              max-width: 150px;
              height: auto;
            "
          />
        </td>
      </tr>
      <tr>
        <td align="center" style="padding: 20px">
          <table
            width="600"
            cellspacing="0"
            cellpadding="0"
            border="0"
            style="
              background-color: #ffffff;
              border-radius: 20px;
              margin: 0 auto;
            "
          >
            <tr>
              <td align="center" style="padding: 20px">
                <img
                  src="https://s3.ap-south-1.amazonaws.com/asset.adventurerichaholidays.com/signup+approved.jpg"
                  alt="Marketing Image"
                  style="
                    width: 250px;
                    max-width: 100%;
                    height: auto;
                    display: block;
                    margin: 0 auto;
                  "
                />
              </td>
            </tr>
            <tr>
              <td align="center" style="padding-bottom: 0px">
                <h1
                  style="
                    font-family: Helvetica, sans-serif;
                    font-size: 24px;
                    color: #375a64;
                    margin: 0;
                  "
                >
                Welcome to <br> Adventure Richa Holidays!
                </h1>
              </td>
            </tr>
            <tr>
              <td align="center" style="padding: 10px 0px 20px 0px">
                <p
                  style="
                    font-family: Helvetica, sans-serif;
                    font-size: 15px;
                    color: #375a64;
                    font-weight: 100;
                    margin: 0;
                    width: 85%;
                    max-width: 500px;
                  "
                >
                Your account has been approved by the admin. You can now log in to your account and start using our services.Click the button below to log in:
                </p>
              </td>
            </tr>
            <tr>
              <td align="center" style="padding-bottom: 20px">
                <a
                  href="https://crm.adventurerichaholidays.com/login/"
                  style="
                    display: inline-block;
                    background-color: #ffc803;
                    letter-spacing: 1px;
                    color: #30354f;
                    font-weight: 400;
                    font-family: Helvetica, sans-serif;
                    font-size: 13px;
                    text-decoration: none;
                    padding: 10px 20px;
                    border-radius: 5px;
                    margin: 0 auto;
                  "
                  >Log In Now</a>
              </td>
            </tr>
            <tr>
              <td align="center" style="padding-bottom: 20px">
                <p
                  style="
                    font-family: Helvetica, sans-serif;
                    font-size: 12px;
                    font-weight: 100;
                    color: #949494;
                    margin: 0;
                  "
                >
                  If you have any questions, feel free to contact us at
                  <a
                    style="
                      color: #6c6c6c;
                      text-decoration: none;
                      font-weight: 600;
                    "
                    href="mailto:support@adventurerichaholidays.com"
                    >support@adventurerichaholidays.com</a
                  >
                </p>
              </td>
            </tr>
          </table>
        </td>
      </tr>
      <tr>
        <td align="center" style="padding-bottom: 15px">
          <a href="#"
            ><img
              src="https://s3.ap-south-1.amazonaws.com/asset.adventurerichaholidays.com/facebook.png"
              alt="Facebook"
              style="width: 19px; max-width: 19px; height: auto; margin: 0 3px"
          /></a>
          <a href="#"
            ><img
              src="https://s3.ap-south-1.amazonaws.com/asset.adventurerichaholidays.com/instagram.png"
              alt="Instagram"
              style="width: 19px; max-width: 19px; height: auto; margin: 0 3px"
          /></a>
          <a href="#"
            ><img
              src="https://s3.ap-south-1.amazonaws.com/asset.adventurerichaholidays.com/linkedin.png"
              alt="LinkedIn"
              style="width: 19px; max-width: 19px; height: auto; margin: 0 3px"
          /></a>
          <a href="#"
            ><img
              src="https://s3.ap-south-1.amazonaws.com/asset.adventurerichaholidays.com/tripadvisor.png"
              alt="Tripadvisor"
              style="width: 19px; max-width: 19px; height: auto; margin: 0 3px"
          /></a>
        </td>
      </tr>
      <tr>
        <td align="center" style="padding-bottom: 10px; text-align: center">
          <table cellspacing="0" cellpadding="0" border="0" align="center">
            <tr>
              <td style="padding: 0 5px">
                <a
                  href="#"
                  style="
                    font-family: Helvetica, sans-serif;
                    font-size: 10px;
                    font-weight: 100;
                    color: #949494;
                    text-decoration: none;
                    display: flex;
                    align-items: center;
                  "
                >
                  <img
                    src="https://s3.ap-south-1.amazonaws.com/asset.adventurerichaholidays.com/document.png"
                    alt="Terms Icon"
                    style="width: 10px; height: 10px; margin-right: 5px"
                  />
                  Terms & Conditions
                </a>
              </td>
              <td style="padding: 0 5px">
                <a
                  href="#"
                  style="
                    font-family: Helvetica, sans-serif;
                    font-size: 10px;
                    font-weight: 100;
                    color: #949494;
                    text-decoration: none;
                    display: flex;
                    align-items: center;
                  "
                >
                  <img
                    src="https://s3.ap-south-1.amazonaws.com/asset.adventurerichaholidays.com/help.png"
                    alt="Help Icon"
                    style="width: 10px; height: 10px; margin-right: 5px"
                  />
                  Help
                </a>
              </td>
              <td style="padding: 0 5px;">
                <a
                  href="#"
                  style="
                    color: #949494;
                    font-family: Helvetica, sans-serif;
                    font-size: 10px;
                    font-weight: 100;
                    text-decoration: none;
                    display: flex;
                    align-items: center;
                  "
                >
                  <img
                    src="https://s3.ap-south-1.amazonaws.com/asset.adventurerichaholidays.com/lock.png"
                    alt="Privacy Icon"
                    style="width: 10px; height: 10px; margin-right: 5px"
                  />
                  Privacy & Policies
                </a>
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  </body>
</html>
`;
};

export const getBlockedSignupHTML = () => {
  return `<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Your Account Has Been Blocked</title>
  </head>
  <body style="margin: 0; padding: 0; background-color: #fff3e7">
    <table
      width="100%"
      cellspacing="0"
      cellpadding="0"
      border="0"
      style="background-color: #fff3e7"
    >
      <tr>
        <td align="center" style="padding: 20px 20px 0px 20px">
          <img
            src="https://s3.ap-south-1.amazonaws.com/asset.adventurerichaholidays.com/arh-full-logo.png"
            alt="Logo"
            style="
              display: block;
              margin: 0 auto;
              width: 150px;
              max-width: 150px;
              height: auto;
            "
          />
        </td>
      </tr>
      <tr>
        <td align="center" style="padding: 20px">
          <table
            width="600"
            cellspacing="0"
            cellpadding="0"
            border="0"
            style="
              background-color: #ffffff;
              border-radius: 20px;
              margin: 0 auto;
            "
          >
            <tr>
              <td align="center" style="padding: 20px">
                <img
                  src="https://s3.ap-south-1.amazonaws.com/asset.adventurerichaholidays.com/user-blocked.jpg"
                  alt="Marketing Image"
                  style="
                    width: 250px;
                    max-width: 100%;
                    height: auto;
                    display: block;
                    margin: 0 auto;
                  "
                />
              </td>
            </tr>
            <tr>
              <td align="center" style="padding-bottom: 0px">
                <h1
                  style="
                    font-family: Helvetica, sans-serif;
                    font-size: 24px;
                    color: #375a64;
                    margin: 0;
                  "
                >
                  Your Account Has Been Blocked
                </h1>
              </td>
            </tr>
            <tr>
              <td align="center" style="padding: 10px 0px 20px 0px">
                <p
                  style="
                    font-family: Helvetica, sans-serif;
                    font-size: 15px;
                    color: #375a64;
                    font-weight: 100;
                    margin: 0;
                    width: 85%;
                    max-width: 500px;
                  "
                >
                  We noticed some unusual activity on your account that violates
                  our Privacy Policy or Terms of Service. As a result, your
                  account has been temporarily blocked by Admin.
                </p>
              </td>
            </tr>

            <tr>
              <td align="center" style="padding-bottom: 20px">
                <p
                  style="
                    font-family: Helvetica, sans-serif;
                    font-size: 12px;
                    font-weight: 100;
                    color: #949494;
                    margin: 0;
                  "
                >
                  If you have any questions, feel free to contact us at
                  <a
                    style="
                      color: #6c6c6c;
                      text-decoration: none;
                      font-weight: 600;
                    "
                    href="mailto:support@adventurerichaholidays.com"
                    >support@adventurerichaholidays.com</a
                  >
                </p>
              </td>
            </tr>
          </table>
        </td>
      </tr>
      <tr>
        <td align="center" style="padding-bottom: 15px">
          <a href="#"
            ><img
              src="https://s3.ap-south-1.amazonaws.com/asset.adventurerichaholidays.com/facebook.png"
              alt="Facebook"
              style="width: 19px; max-width: 19px; height: auto; margin: 0 3px"
          /></a>
          <a href="#"
            ><img
              src="https://s3.ap-south-1.amazonaws.com/asset.adventurerichaholidays.com/instagram.png"
              alt="Instagram"
              style="width: 19px; max-width: 19px; height: auto; margin: 0 3px"
          /></a>
          <a href="#"
            ><img
              src="https://s3.ap-south-1.amazonaws.com/asset.adventurerichaholidays.com/linkedin.png"
              alt="LinkedIn"
              style="width: 19px; max-width: 19px; height: auto; margin: 0 3px"
          /></a>
          <a href="#"
            ><img
              src="https://s3.ap-south-1.amazonaws.com/asset.adventurerichaholidays.com/tripadvisor.png"
              alt="Tripadvisor"
              style="width: 19px; max-width: 19px; height: auto; margin: 0 3px"
          /></a>
        </td>
      </tr>
      <tr>
        <td align="center" style="padding-bottom: 10px; text-align: center">
          <table cellspacing="0" cellpadding="0" border="0" align="center">
            <tr>
              <td style="padding: 0 5px">
                <a
                  href="#"
                  style="
                    font-family: Helvetica, sans-serif;
                    font-size: 10px;
                    font-weight: 100;
                    color: #949494;
                    text-decoration: none;
                    display: flex;
                    align-items: center;
                  "
                >
                  <img
                    src="https://s3.ap-south-1.amazonaws.com/asset.adventurerichaholidays.com/document.png"
                    alt="Terms Icon"
                    style="width: 10px; height: 10px; margin-right: 5px"
                  />
                  Terms & Conditions
                </a>
              </td>
              <td style="padding: 0 5px">
                <a
                  href="#"
                  style="
                    font-family: Helvetica, sans-serif;
                    font-size: 10px;
                    font-weight: 100;
                    color: #949494;
                    text-decoration: none;
                    display: flex;
                    align-items: center;
                  "
                >
                  <img
                    src="https://s3.ap-south-1.amazonaws.com/asset.adventurerichaholidays.com/help.png"
                    alt="Help Icon"
                    style="width: 10px; height: 10px; margin-right: 5px"
                  />
                  Help
                </a>
              </td>
              <td style="padding: 0 5px">
                <a
                  href="#"
                  style="
                    color: #949494;
                    font-family: Helvetica, sans-serif;
                    font-size: 10px;
                    font-weight: 100;
                    text-decoration: none;
                    display: flex;
                    align-items: center;
                  "
                >
                  <img
                    src="https://s3.ap-south-1.amazonaws.com/asset.adventurerichaholidays.com/lock.png"
                    alt="Privacy Icon"
                    style="width: 10px; height: 10px; margin-right: 5px"
                  />
                  Privacy & Policies
                </a>
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  </body>
</html>
`;
};

export const getRejectedSignupHTML = () => {
  return `<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Signup Rejected</title>
  </head>
  <body style="margin: 0; padding: 0; background-color: #fff3e7">
    <!-- Main container -->
    <table
      width="100%"
      cellspacing="0"
      cellpadding="0"
      border="0"
      style="background-color: #fff3e7"
    >
      <tr>
        <td align="center" style="padding: 20px 20px 0px 20px">
          <img
            src="https://s3.ap-south-1.amazonaws.com/asset.adventurerichaholidays.com/arh-full-logo.png"
            alt="Logo"
            style="
              display: block;
              margin: 0 auto;
              width: 150px;
              max-width: 150px;
              height: auto;
            "
          />
        </td>
      </tr>
      <tr>
        <td align="center" style="padding: 20px">
          <table
            width="600"
            cellspacing="0"
            cellpadding="0"
            border="0"
            style="
              background-color: #ffffff;
              border-radius: 20px;
              margin: 0 auto;
            "
          >
            <tr>
              <td align="center" style="padding: 20px">
                <img
                  src="https://s3.ap-south-1.amazonaws.com/asset.adventurerichaholidays.com/8038782.jpg"
                  alt="Marketing Image"
                  style="
                    width: 250px;
                    max-width: 100%;
                    height: auto;
                    display: block;
                    margin: 0 auto;
                  "
                />
              </td>
            </tr>
            <tr>
              <td align="center" style="padding-bottom: 0px">
                <h1
                  style="
                    font-family: Helvetica, sans-serif;
                    font-size: 24px;
                    color: #375a64;
                    margin: 0;
                  "
                >
                  Signup Rejected
                </h1>
              </td>
            </tr>
            <tr>
              <td align="center" style="padding: 10px 0px 20px 0px">
                <p
                  style="
                    font-family: Helvetica, sans-serif;
                    font-size: 15px;
                    color: #375a64;
                    font-weight: 100;
                    margin: 0;
                    width: 85%;
                    max-width: 500px;
                  "
                >
                  We couldn't verify the account owner. Please check your
                  details or contact support.
                </p>
              </td>
            </tr>

            <tr>
              <td align="center" style="padding-bottom: 20px">
                <p
                  style="
                    font-family: Helvetica, sans-serif;
                    font-size: 12px;
                    font-weight: 100;
                    color: #949494;
                    margin: 0;
                  "
                >
                  If you have any questions, feel free to contact us at
                  <a
                    style="
                      color: #6c6c6c;
                      text-decoration: none;
                      font-weight: 600;
                    "
                    href="mailto:support@adventurerichaholidays.com"
                    >support@adventurerichaholidays.com</a
                  >
                </p>
              </td>
            </tr>
          </table>
        </td>
      </tr>
      <tr>
        <td align="center" style="padding-bottom: 15px">
          <a href="#"
            ><img
              src="https://s3.ap-south-1.amazonaws.com/asset.adventurerichaholidays.com/facebook.png"
              alt="Facebook"
              style="width: 19px; max-width: 19px; height: auto; margin: 0 3px"
          /></a>
          <a href="#"
            ><img
              src="https://s3.ap-south-1.amazonaws.com/asset.adventurerichaholidays.com/instagram.png"
              alt="Instagram"
              style="width: 19px; max-width: 19px; height: auto; margin: 0 3px"
          /></a>
          <a href="#"
            ><img
              src="https://s3.ap-south-1.amazonaws.com/asset.adventurerichaholidays.com/linkedin.png"
              alt="LinkedIn"
              style="width: 19px; max-width: 19px; height: auto; margin: 0 3px"
          /></a>
          <a href="#"
            ><img
              src="https://s3.ap-south-1.amazonaws.com/asset.adventurerichaholidays.com/tripadvisor.png"
              alt="Tripadvisor"
              style="width: 19px; max-width: 19px; height: auto; margin: 0 3px"
          /></a>
        </td>
      </tr>
      <tr>
        <td align="center" style="padding-bottom: 10px; text-align: center">
          <table cellspacing="0" cellpadding="0" border="0" align="center">
            <tr>
              <td style="padding: 0 5px">
                <a
                  href="#"
                  style="
                    font-family: Helvetica, sans-serif;
                    font-size: 10px;
                    font-weight: 100;
                    color: #949494;
                    text-decoration: none;
                    display: flex;
                    align-items: center;
                  "
                >
                  <img
                    src="https://s3.ap-south-1.amazonaws.com/asset.adventurerichaholidays.com/document.png"
                    alt="Terms Icon"
                    style="width: 10px; height: 10px; margin-right: 5px"
                  />
                  Terms & Conditions
                </a>
              </td>
              <td style="padding: 0 5px">
                <a
                  href="#"
                  style="
                    font-family: Helvetica, sans-serif;
                    font-size: 10px;
                    font-weight: 100;
                    color: #949494;
                    text-decoration: none;
                    display: flex;
                    align-items: center;
                  "
                >
                  <img
                    src="https://s3.ap-south-1.amazonaws.com/asset.adventurerichaholidays.com/help.png"
                    alt="Help Icon"
                    style="width: 10px; height: 10px; margin-right: 5px"
                  />
                  Help
                </a>
              </td>
              <td style="padding: 0 5px">
                <a
                  href="#"
                  style="
                    color: #949494;
                    font-family: Helvetica, sans-serif;
                    font-size: 10px;
                    font-weight: 100;
                    text-decoration: none;
                    display: flex;
                    align-items: center;
                  "
                >
                  <img
                    src="https://s3.ap-south-1.amazonaws.com/asset.adventurerichaholidays.com/lock.png"
                    alt="Privacy Icon"
                    style="width: 10px; height: 10px; margin-right: 5px"
                  />
                  Privacy & Policies
                </a>
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  </body>
</html>`;
};
