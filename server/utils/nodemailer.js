const nodemailer = require("nodemailer");

/**
 * Reusable Transporter
 * Uses Gmail service with App Password from .env
 */
const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
    },
});

/**
 * Utility function to send OTP Email
 * @param {string} email - The user's email address
 * @param {string} otp - The 6-digit verification code
 */
const sendOTPEmail = async (email, otp) => {
    try {
        const mailOptions = {
            from: '"Ghar Drop Nepal" <no-reply@ghardrop.com>',
            to: email,
            subject: "Verify your Account - Ghar Drop Nepal",
            html: `
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; border: 1px solid #dcfce7; padding: 20px; border-radius: 15px;">
                    <h2 style="color: #15803d; text-align: center;">Welcome to Ghar Drop Nepal!</h2>
                    <p style="font-size: 16px; color: #374151;">Namaste! You are almost there. Use the verification code below to complete your registration:</p>
                    <div style="text-align: center; margin: 30px 0;">
                        <span style="font-size: 32px; font-weight: bold; letter-spacing: 5px; color: #166534; background: #f0fdf4; padding: 10px 20px; border-radius: 10px; border: 2px dashed #15803d;">
                            ${otp}
                        </span>
                    </div>
                    <p style="font-size: 14px; color: #6b7280; text-align: center;">This code will expire in 10 minutes. Please do not share this code with anyone.</p>
                    <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;">
                    <p style="font-size: 12px; color: #9ca3af; text-align: center;">&copy; 2026 Ghar Drop Nepal. All rights reserved.</p>
                </div>
            `,
        };

        await transporter.sendMail(mailOptions);
        // Log success (optional)
    } catch (error) {
        throw new Error("Failed to send OTP email: " + error.message);
    }
};

module.exports = sendOTPEmail;