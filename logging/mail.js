import nodemailer from 'nodemailer';

async function sendEmail(subject, html, toEmail, fromEmail = "Eraswap Support") {
  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: 'lori.bauscher@gmail.com',
      pass: 'gyyb ewkg briz nkpd'
    }
  });

  return transporter.sendMail({
    from: `"${fromEmail}" <lori.bauscher@gmail.com>`,
    to: toEmail,
    subject: subject,
    text: 'Please verify your EraSwap account.',
    html: html
  });
}


export default sendEmail;

