const nodemailer = require('nodemailer');

function sendEmail(subject, text, toEmail, fromEmail = "Eraswap Support") {
    const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
          user: 'lori.bauscher@gmail.com',
          pass: "gyyb ewkg briz nkpd"
      }
    });
    // E-Mail senden
    transporter.sendMail({
      from: `"${fromEmail}" <lori.bauscher@gmail.com>`, // Absender
      to: toEmail, // Empfänger
      subject: subject,
      text: text, // Nachricht im Textformat
      html: `<h1>${text}</h1>` // Nachricht im HTML-Format
    }, (error, info) => {
      if (error) {
        throw error
      }
    });
    return "Nachricht erfolgreich gesendet!"
}

export default sendEmail;

