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
        name: "Sndbx By Id8",
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
  return Crypto.randomBytes(64).toString("hex");
};
