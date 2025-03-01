const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
  // Sử dụng dịch vụ email mà bạn có, ví dụ Gmail, SendGrid, Mailgun,...
  // Ví dụ với Gmail (lưu ý: dùng OAuth2 hay App Password để tăng bảo mật)
  service: "Gmail",
  auth: {
    user: process.env.EMAIL_USER, // email của bạn
    pass: process.env.EMAIL_PASS, // mật khẩu ứng dụng hoặc mật khẩu của bạn
  },
});

const sendEmail = async (options) => {
  const mailOptions = {
    from: `"Your App Name" <${process.env.EMAIL_USER}>`,
    to: options.email,
    subject: options.subject,
    html: options.message,
  };

  await transporter.sendMail(mailOptions);
};

module.exports = sendEmail;
