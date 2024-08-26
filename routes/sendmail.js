const nodemailer = require('nodemailer');

const sendmail = (email, html ) => {
    const transport = nodemailer.createTransport({
        service: "gmail",
        host: "smtp.gamil.com",
        port: process.env.EMAIL_PORT,
        auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASS
        },
    });

    const mailOptions ={
        from: "StreakTrack Application",
        to: email,
        subject: "test mail send by Ayush",
        html: html,
    };

    transport.sendMail(mailOptions, (error, info) => {
        if (error) {
          console.error(error);
          return res.json({ success: false, message: 'Failed to send OTP. Please try again.' });
        }
        console.log('OTP sent:', info.response);
        res.json({ success: true });
      });
}

module.exports = sendmail;