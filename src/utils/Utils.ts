import nodemailer from "nodemailer";
import Crypto from "crypto";

const config = process.env;

export const sendEmail = async (
  receiverAddress: string,
  subject: string,
  htmlContent: string
) => {
  const { HOST_USERNAME, HOST_PASSWORD } = config;

  const transporter = nodemailer.createTransport({
    host: config.HOST,
    port: 465,
    secure: true,
    auth: {
      user: HOST_USERNAME,
      pass: HOST_PASSWORD,
    },
  });
  await transporter
    .sendMail({
      from: {
        name: "Accounting App",
        address: String(<string>config.HOST_EMAIL_ADRESS),
      },
      to: receiverAddress,
      subject: subject,
      html: htmlContent,
    })
    .then(() => {
      console.log(`Email sent successfully`);
    })
    .catch((error) => {
      console.log(`Fail to send Email`);
      console.log(error);
    });
};

export const generateRandomToken = () => {
  return Crypto.randomBytes(64).toString("hex").substring(0, 5);
};

export const isInThePast = (date: Date) => {
  const today = new Date();

  // 👇️ OPTIONAL!
  // This line sets the hour of the current date to midnight
  // so the comparison only returns `true` if the passed in date
  // is at least yesterday
  today.setHours(0, 0, 0, 0);

  return date < today;
};