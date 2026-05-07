const nodemailer = require('nodemailer');
const dotenv = require('dotenv');

dotenv.config();

const smtpPort = Number(process.env.EMAIL_PORT || 587);
const smtpHost = process.env.EMAIL_HOST || 'smtp.gmail.com';
const smtpSecure = process.env.EMAIL_SECURE === 'true' || smtpPort === 465;
const emailFrom = process.env.EMAIL_FROM || process.env.EMAIL_USER;
const emailFromName = process.env.EMAIL_FROM_NAME || 'EventNest';
const brevoApiKey = process.env.BREVO_API_KEY;
const hasBrevoApi = Boolean(brevoApiKey && emailFrom);
const hasSmtpCredentials = Boolean(process.env.EMAIL_USER && process.env.EMAIL_PASS);

const transporter = hasSmtpCredentials
    ? nodemailer.createTransport({
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
    })
    : null;

const sendWithBrevoApi = async ({ to, subject, html }) => {
    if (!brevoApiKey || !emailFrom) {
        return false;
    }

    try {
        const response = await fetch('https://api.brevo.com/v3/smtp/email', {
            method: 'POST',
            headers: {
                'accept': 'application/json',
                'api-key': brevoApiKey,
                'content-type': 'application/json'
            },
            body: JSON.stringify({
                sender: { name: emailFromName, email: emailFrom },
                to: [{ email: to }],
                subject,
                htmlContent: html
            })
        });

        if (!response.ok) {
            const errorBody = await response.text();
            console.error('Brevo API send failed:', response.status, errorBody);
            return false;
        }

        return true;
    } catch (error) {
        console.error('Brevo API request failed:', error.message);
        return false;
    }
};

const sendWithSmtp = async ({ to, subject, html }) => {
    if (!transporter) return false;
    try {
        await transporter.sendMail({
            from: emailFrom,
            to,
            subject,
            html
        });
        return true;
    } catch (error) {
        console.error('SMTP send failed:', error);
        return false;
    }
};

const sendEmail = async ({ to, subject, html }) => {
    if (hasBrevoApi) {
        return sendWithBrevoApi({ to, subject, html });
    }
    return sendWithSmtp({ to, subject, html });
};

const verifyEmailTransport = async () => {
    if (hasBrevoApi) {
        console.log('BREVO_API_KEY detected. Using Brevo API as primary email channel.');
        return;
    }

    if (!transporter) {
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
    const subject = `Booking Confirmed: ${eventTitle}`;
    const html = `
        <h2>Hi ${userName}!</h2>
        <p>Your booking for the event <strong>${eventTitle}</strong> is successfully confirmed.</p>
        <p>Thank you for choosing EventNest.</p>
      `;
    const sent = await sendEmail({ to: userEmail, subject, html });
    if (sent) console.log('Email sent successfully to', userEmail);
    return sent;
};

const getOtpContent = (type) => {
    if (type === 'account_verification') {
        return {
            title: 'Verify your EventNest Account',
            message: 'Please use the following OTP to verify your new EventNest account.'
        };
    }
    return {
        title: 'EventNest Booking Verification',
        message: 'Please use the following OTP to verify and confirm your event booking.'
    };
};

const sendOTPEmail = async (userEmail, otp, type) => {
    const { title, message } = getOtpContent(type);
    const html = `
                <div style="font-family: Arial, sans-serif; text-align: center; padding: 20px;">
                    <h2 style="color: #111;">${title}</h2>
                    <p style="color: #555; font-size: 16px;">${message}</p>
                    <div style="margin: 20px auto; padding: 15px; font-size: 24px; font-weight: bold; background: #f4f4f4; width: max-content; letter-spacing: 5px;">
                        ${otp}
                    </div>
                    <p style="color: #999; font-size: 12px;">This code expires in 5 minutes. If you didn't request this, please ignore this email.</p>
                </div>
            `;
    const sent = await sendEmail({ to: userEmail, subject: title, html });
    if (sent) console.log(`OTP sent to ${userEmail} for ${type}`);
    return sent;
};

module.exports = { sendBookingEmail, sendOTPEmail };
