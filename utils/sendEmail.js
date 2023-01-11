const nodemailer = require("nodemailer");

const sendEmail = async (options) => {
  const transporter = nodemailer.createTransport({
    service:"SendinBlue",
    auth: {
      user: `dt9280332@gmail.com`,
      pass: `gTXs53dpFrGy7Y1U`,
    }
  });
  // ad sender address syntax
  const message = {
    from: `dt9280332@gmail.com`,
    to: options.to,
    subject: options.subject,
    html: options.html,
  };
  await transporter.sendMail(message);
};

module.exports = sendEmail;
