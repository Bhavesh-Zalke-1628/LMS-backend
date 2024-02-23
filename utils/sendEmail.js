
import nodemailer from 'nodemailer';

const sendEmail = async (email, subject, message) => {

    const transporter = nodemailer.createTransport({
        host: "smtp.gmail.com",
        port: 587,
        secure: false,
        auth: {
            user: "zalkebhavesh@gmail.com",
            pass: "rrcp osgs losc dzwy",
        },
    });
    const mailOptions = {
        from: "zalkebhavesh@gmail.com",
        to: email,
        subject: subject,
        html: message
    }
    await transporter.sendMail(mailOptions)
    console.log("Email send successfully")
}

export default sendEmail;