// import dotenv from "dotenv";
// import nodemailer from "nodemailer";

// dotenv.config();

// const transporter = nodemailer.createTransport({
//   service: "gmail",
//   auth: {
//     user: process.env.EMAIL_USER,
//     pass: process.env.EMAIL_PASS,
//   },
// });

// // Function to send email
// const sendEmail = async (to, subject, text, html) => {
//   try {
//     const info = await transporter.sendMail({
//       from: `"Backend" <${process.env.EMAIL_USER}>`,
//       to,
//       subject,
//       text,
//       html,
//     });

//     console.log("Message sent: %s", info.messageId);
//   } catch (error) {
//     console.error("Error sending email:", error);
//   }
// };

// export const sendRegistrationEmail = async (userEmail, name) => {
//   const subject = "Welcome to backend";
//   const text = `Hello ${name},\n\nThank you for registration`;
//   const html = `<p>Hello ${name},</p><p>Thank you for registration</p>`;

//   await sendEmail(userEmail, subject, text, html);
// };

// export default transporter;
