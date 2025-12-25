import nodemailer from 'nodemailer';

const generateEmailTemplate = (otp, userName) => {
    return `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #e0e0e0; border-radius: 10px; overflow: hidden;">
        <div style="background-color: #4A90E2; padding: 20px; text-align: center;">
            <h1 style="color: white; margin: 0; font-size: 24px;">College Marketplace</h1>
        </div>
        <div style="padding: 30px; color: #333; line-height: 1.6;">
            <h2 style="color: #4A90E2;">Verify Your Account</h2>
            <p>Hi <strong>${userName}</strong>,</p>
            <p>Thank you for joining the College Marketplace! To ensure a safe community for all students, please use the verification code below to complete your registration:</p>
            
            <div style="text-align: center; margin: 30px 0;">
                <span style="font-size: 32px; font-weight: bold; letter-spacing: 5px; color: #4A90E2; background: #f0f7ff; padding: 10px 20px; border-radius: 5px; border: 1px dashed #4A90E2;">
                    ${otp}
                </span>
            </div>
            
            <p style="font-size: 14px; color: #666;">This code is valid for <strong>20 minutes</strong>. If you did not request this, please ignore this email.</p>
        </div>
        <div style="background-color: #f9f9f9; padding: 15px; text-align: center; font-size: 12px; color: #999;">
            <p>Only for verified students of Your College Name</p>
            <p>&copy; 2025 College Marketplace Team</p>
        </div>
    </div>
    `;
};

export const sendEmail = async (options) => {
    const transporter = nodemailer.createTransport({
        service: 'Gmail', // or your email provider
        auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASS, // This is an App Password, not your regular login!
        },
    });
    const htmlContent = generateEmailTemplate(options.otp, options.name)

    const mailOptions = {
        from: '"College Marketplace" <noreply@mnnit.ac.in>',
        to: options.email,
        subject: options.subject,
        html: htmlContent,
    };

    await transporter.sendMail(mailOptions);
};