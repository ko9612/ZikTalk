import { createTransport } from "nodemailer";

export const sendEmail = async (email, attributes = {}) => {
  try {
    const transporter = createTransport({
      service: "gmail",
      host: "smtp.gmail.com",
      port: 587,
      secure: false,
      auth: {
        user: process.env.GMAIL_EMAIL_USER,
        pass: process.env.GMAIL_EMAIL_PASS,
      },
    });
    const mailOptions = {
      from: process.env.GMAIL_OAUTH_USER,
      to: email,
      ...attributes,
    };

    await transporter.sendMail(mailOptions);
  } catch (e) {
    console.error(e);
    throw e;
  }
};
