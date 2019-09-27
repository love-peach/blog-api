const nodemailer = require('nodemailer');
const emailConfig = require('../config/email.config');

const transporter = nodemailer.createTransport({
  host: emailConfig.host,
  port: 465,
  secure: true,
  auth: {
    user: emailConfig.address,
    pass: emailConfig.pass,
  },
});

const mailPoster = async mailOptions => new Promise((resolve, reject) => {
  transporter
    .sendMail(mailOptions)
    .then((res) => {
      resolve(res);
    })
    .catch((err) => {
      reject(err);
    });
});

module.exports = {
  mailPoster,
};
