const nodemailer = require('nodemailer');
const dotenv = require('dotenv');

dotenv.config();

const smtpPort = Number(process.env.EMAIL_PORT || 587);
const smtpHost = process.env.EMAIL_HOST || 'smtp.gmail.com';
const smtpSecure = process.env.EMAIL_SECURE === 'true' || smtpPort === 465;

const transporter = nodemailer.createTransport({
    host: smtpHost,
    port: smtpPort,
    secure: smtpSecure,
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
    },
    connectionTimeout: Number(process.env.EMAIL_CONNECTION_TIMEOUT || 20000),
    greetingTimeout: Number(process.env.EMAIL_GREETING_TIMEOUT || 20000),
    socketTimeout: Number(process.env.EMAIL_SOCKET_TIMEOUT || 30000)
});

const verifyEmailTransport = async () => {
    if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
        console.warn('EMAIL_USER/EMAIL_PASS missing. Email delivery is disabled.');
        return;
    }

    try {
        await transporter.verify();
        console.log(`SMTP ready (${smtpHost}:${smtpPort})`);
    } catch (error) {
        console.error('SMTP verify failed:', error.message);
    }
};

verifyEmailTransport();

const sendBookingEmail = async (userEmail, userName, eventTitle) => {
    try {
        if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
            return false;
        }
        const mailOptions = {
            from: process.env.EMAIL_USER,
            to: userEmail,
            subject: `Booking Confirmed: ${eventTitle}`,
            html: `
        <h2>Hi ${userName}!</h2>
        <p>Your booking for the event <strong>${eventTitle}</strong> is successfully confirmed.</p>
        <p>Thank you for choosing EventNest.</p>
      `
        };
        await transporter.sendMail(mailOptions);
        console.log('Email sent successfully to', userEmail);
        return true;
    } catch (error) {
        console.error('Error sending email:', error);
        return false;
    }
};

const sendOTPEmail = async (userEmail, otp, type) => {
    try {
        if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
            return false;
        }
        const title = type === 'account_verification' ? 'Verify your EventNest Account' : 'EventNest Booking Verification';
        const msg = type === 'account_verification'
            ? 'Please use the following OTP to verify your new EventNest account.'
            : 'Please use the following OTP to verify and confirm your event booking.';

        const mailOptions = {
            from: process.env.EMAIL_USER,
            to: userEmail,
            subject: title,
            html: `
                <div style="font-family: Arial, sans-serif; text-align: center; padding: 20px;">
                    <h2 style="color: #111;">${title}</h2>
                    <p style="color: #555; font-size: 16px;">${msg}</p>
                    <div style="margin: 20px auto; padding: 15px; font-size: 24px; font-weight: bold; background: #f4f4f4; width: max-content; letter-spacing: 5px;">
                        ${otp}
                    </div>
                    <p style="color: #999; font-size: 12px;">This code expires in 5 minutes. If you didn't request this, please ignore this email.</p>
                </div>
            `
        };
        await transporter.sendMail(mailOptions);
        console.log(`OTP sent to ${userEmail} for ${type}`);
        return true;
    } catch (error) {
        console.error('Error sending OTP email:', error);
        return false;
    }
};

module.exports = { sendBookingEmail, sendOTPEmail };
