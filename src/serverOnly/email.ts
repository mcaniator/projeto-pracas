import nodemailer from "nodemailer";

const emailTransporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.SYSTEM_GMAIL_USER,
    pass: process.env.SYSTEM_GMAIL_APP_PASSWORD,
  },
});

export { emailTransporter };
