import nodemailer from "nodemailer";

const emailTransporter = nodemailer.createTransport({
  service: "gmail",
  auth:
    process.env.GMAIL_AUTHENTICATION_METHOD === "OAUTH" ?
      {
        type: "OAuth2",
        user: process.env.SYSTEM_GMAIL_USER,
        clientId: process.env.GOOGLE_CLIENT_ID,
        clientSecret: process.env.GOOGLE_CLIENT_SECRET,
        refreshToken: process.env.GOOGLE_REFRESH_TOKEN,
      }
    : {
        user: process.env.SYSTEM_GMAIL_USER,
        pass: process.env.SYSTEM_GMAIL_APP_PASSWORD,
      },
});

export { emailTransporter };
