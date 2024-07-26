import nodemailer from "nodemailer";

export default async (req, res) => {
  const allowedOrigins = ["https://bradygehrman.vercel.app"];

  const origin = req.headers.origin;

  if (allowedOrigins.includes(origin)) {
    res.setHeader("Access-Control-Allow-Origin", origin);
  }

  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }

  const { fullName, email, message } = req.body;

  if (!fullName || !email || !message) {
    return res.status(400).send("All fields are required.");
  }

  const transporter = nodemailer.createTransport({
    host: "smtp-mail.outlook.com",
    port: 587,
    secure: false,
    auth: {
      user: process.env.EMAIL_USERNAME,
      pass: process.env.EMAIL_PASSWORD,
    },
  });

  const mailOptions = {
    from: process.env.EMAIL_USERNAME,
    to: process.env.MY_EMAIL_USERNAME,
    subject: `${email} (${fullName})`,
    text: message,
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    res.status(200).send("Email sent: " + info.response);
  } catch (error) {
    console.error("Error sending email:", error);
    res.status(500).send("Failed to send email. Please try again later.");
  }
};
