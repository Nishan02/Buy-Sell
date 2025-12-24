import nodemailer from 'nodemailer';

export const sendEmail = async (options) => {
    const transporter = nodemailer.createTransport({
        service: 'Gmail', // or your email provider
        auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASS, // This is an App Password, not your regular login!
        },
    });

    const mailOptions = {
        from: '"College Marketplace" <noreply@mnnit.ac.in>',
        to: options.email,
        subject: options.subject,
        text: options.message,
    };

    await transporter.sendMail(mailOptions);
};