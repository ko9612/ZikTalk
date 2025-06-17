import { createTransport } from "nodemailer";

export const sendEmail = async (email, attributes = {}) => {
  try {
    const transporter = createTransport({
      service: "gmail",
      host: "smtp.gmail.com",
      port: 587,
      secure: false,
      auth: {
        type: "OAuth2",
        user: process.env.GMAIL_OAUTH_USER,
        clientId: process.env.GMAIL_OAUTH_CLIENT_ID,
        clientSecret: process.env.GMAIL_OAUTH_CLIENT_SECRET,
        refreshToken: process.env.GMAIL_OAUTH_REFRESH_TOKEN,
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
