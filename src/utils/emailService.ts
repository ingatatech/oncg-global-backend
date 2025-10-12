import nodemailer from "nodemailer";

// Send OTP for password reset
export async function sendOTPEmail(userData: {
  email: string;
  otp: string;
  name?: string;
}) {
  try {
    const emailContent = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 8px;">
        <div style="text-align: center; margin-bottom: 30px;">
          <h1 style="color: #0ea5e9; margin-bottom: 10px;">Password Reset Request</h1>
        </div>
        
        <p style="font-size: 16px; color: #333;">Hello${userData.name ? ` ${userData.name}` : ''},</p>
        
        <p style="font-size: 16px; color: #333; line-height: 1.5;">
          We received a request to reset your password. Please use the following One-Time Password (OTP) to proceed with your password reset:
        </p>
        
        <div style="background-color: #f8fafc; border: 2px dashed #0ea5e9; border-radius: 8px; padding: 20px; text-align: center; margin: 30px 0;">
          <h2 style="color: #0ea5e9; font-size: 32px; letter-spacing: 4px; margin: 0; font-family: 'Courier New', monospace;">
            ${userData.otp}
          </h2>
          <p style="color: #64748b; font-size: 14px; margin: 10px 0 0 0;">This OTP is valid for 5 minutes</p>
        </div>
        
        <div style="background-color: #fff3cd; border: 1px solid #ffeaa7; border-radius: 6px; padding: 15px; margin: 20px 0;">
          <p style="color: #856404; margin: 0; font-size: 14px;">
            <strong>Security Notice:</strong> If you didn't request this password reset, please ignore this email. Your password will remain unchanged.
          </p>
        </div>
        
        <p style="font-size: 14px; color: #64748b; line-height: 1.5; margin-top: 30px;">
          If you're having trouble, please contact our support team or try again later.
        </p>
        
        <hr style="border: none; border-top: 1px solid #e0e0e0; margin: 30px 0;">
        
        <p style="font-size: 14px; color: #64748b; text-align: center;">
          Best regards,<br/>
          <strong>Omega Sir Team</strong>
        </p>
      </div>
    `;

    await transporter.sendMail({
      from: `Omega Sir <${process.env.EMAIL_USER}>`,
      to: userData.email,
      subject: "Password Reset OTP - Omega Sir",
      html: emailContent,
    });
    return true;
  } catch (error) {
    console.error("Error sending OTP email:", error);
    return false;
  }
}

// Send password reset confirmation email
export async function sendPasswordResetConfirmationEmail(userData: {
  email: string;
  name?: string;
}) {
  try {
    const currentDate = new Date().toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });

    const emailContent = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 8px;">
        <div style="text-align: center; margin-bottom: 30px;">
          <div style="background-color: #10b981; width: 60px; height: 60px; border-radius: 50%; margin: 0 auto 20px; display: flex; align-items: center; justify-content: center;">
            <span style="color: white; font-size: 24px;">✓</span>
          </div>
          <h1 style="color: #10b981; margin-bottom: 10px;">Password Reset Successful</h1>
        </div>
        
        <p style="font-size: 16px; color: #333;">Hello${userData.name ? ` ${userData.name}` : ''},</p>
        
        <p style="font-size: 16px; color: #333; line-height: 1.5;">
          Your password has been successfully reset. You can now log in to your account using your new password.
        </p>
        
        <div style="background-color: #f0f9ff; border: 1px solid #0ea5e9; border-radius: 8px; padding: 20px; margin: 25px 0;">
          <h3 style="color: #0ea5e9; margin-top: 0;">Reset Details:</h3>
          <p style="color: #333; margin: 8px 0;"><strong>Email:</strong> ${userData.email}</p>
          <p style="color: #333; margin: 8px 0;"><strong>Date & Time:</strong> ${currentDate}</p>
        </div>
        
        <div style="background-color: #fef2f2; border: 1px solid #fca5a5; border-radius: 6px; padding: 15px; margin: 20px 0;">
          <p style="color: #991b1b; margin: 0; font-size: 14px;">
            <strong>Security Alert:</strong> If you didn't reset your password, please contact our support team immediately and consider changing your password again.
          </p>
        </div>
        
        <div style="text-align: center; margin: 30px 0;">
          <a href="${process.env.FRONTEND_URL || 'https://oncg.com'}/login" 
             style="background-color: #0ea5e9; color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; font-weight: bold; display: inline-block;">
            Login to Your Account
          </a>
        </div>
        
        <p style="font-size: 14px; color: #64748b; line-height: 1.5;">
          For your security, we recommend:
        </p>
        <ul style="font-size: 14px; color: #64748b; line-height: 1.5;">
          <li>Using a strong, unique password</li>
          <li>Not sharing your login credentials</li>
          <li>Logging out from shared devices</li>
        </ul>
        
        <hr style="border: none; border-top: 1px solid #e0e0e0; margin: 30px 0;">
        
        <p style="font-size: 14px; color: #64748b; text-align: center;">
          Best regards,<br/>
          <strong>Omega Sir Team</strong><br/>
          <a href="mailto:support@oncg.com" style="color: #0ea5e9;">support@oncg.com</a>
        </p>
      </div>
    `;

    await transporter.sendMail({
      from: `Omega Sir <${process.env.EMAIL_USER}>`,
      to: userData.email,
      subject: "Password Reset Successful - Omega Sir",
      html: emailContent,
    });
    return true;
  } catch (error) {
    console.error("Error sending password reset confirmation email:", error);
    return false;
  }
}
// Create transporter
const transporter = nodemailer.createTransport({
  service: "gmail", // or your preferred email service
  auth: {
    user: process.env.EMAIL_USER || "ericnemachine@gmail.com",
    pass: process.env.EMAIL_PASSWORD || "qcdd nsof kcje dvib",
  },
});
console.log(process.env.EMAIL_USER, process.env.EMAIL_PASSWORD);


export async function sendApplicationConfirmationEmail(appData: {
  name: string;
  email: string;
  jobTitle: string;
}) {
  try {
    const emailContent = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #0ea5e9;">Thank you for applying!</h2>
        <p>Dear ${appData.name},</p>
        <p>We have received your application for the <strong>${appData.jobTitle}</strong> position at Omega Sir.</p>
        <p>Our team will review your application and contact you if you are shortlisted for the next steps.</p>
        <p>Best regards,<br/>Omega Sir Team</p>
      </div>
    `;
    await transporter.sendMail({
      from: `Omega Sir <${process.env.EMAIL_USER}>`,
      to: appData.email,
      subject: `Application Received: ${appData.jobTitle}`,
      html: emailContent,
    });
    return true;
  } catch (error) {
    console.error("Error sending application confirmation email:", error);
    return false;
  }
}

export async function sendApplicationCongratulationsEmail(appData: {
  name: string;
  email: string;
  jobTitle: string;
}) {
  try {
    const emailContent = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #10b981;">Congratulations!</h2>
        <p>Dear ${appData.name},</p>
        <p>We are pleased to inform you that your application for the <strong>${appData.jobTitle}</strong> position has been successful.</p>
        <p>Our team will contact you soon with the next steps.</p>
        <p>Best regards,<br/>Omega Sir Team</p>
      </div>
    `;
    await transporter.sendMail({
      from: `Omega Sir <${process.env.EMAIL_USER}>`,
      to: appData.email,
      subject: `Congratulations: ${appData.jobTitle} Application Successful!`,
      html: emailContent,
    });
    return true;
  } catch (error) {
    console.error("Error sending application congratulations email:", error);
    return false;
  }
}

export async function sendApplicationRejectionEmail(appData: {
  name: string;
  email: string;
  jobTitle: string;
}) {
  try {
    const emailContent = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #f59e42;">Update on Your Application</h2>
        <p>Dear ${appData.name},</p>
        <p>Thank you for your interest in the <strong>${appData.jobTitle}</strong> position at Omega Sir. We truly appreciate the time and effort you put into your application.</p>
        <p>After careful consideration, we have decided to move forward with other candidates for this particular role. This decision was not easy, as we received many strong applications.</p>
        <p>We encourage you to apply for future opportunities that match your skills and experience. We wish you all the best in your job search and future endeavors.</p>
        <p>Thank you again for considering Omega Sir.</p>
        <p>Best regards,<br/>Omega Sir Team</p>
      </div>
    `;
    await transporter.sendMail({
      from: `Omega Sir <${process.env.EMAIL_USER}>`,
      to: appData.email,
      subject: `Update on Your Application: ${appData.jobTitle}`,
      html: emailContent,
    });
    return true;
  } catch (error) {
    console.error("Error sending application rejection email:", error);
    return false;
  }
}

export async function sendInsightNotificationEmail(payload: {
  email: string;
  title: string;
  preview?: string;
  industry?: string;
  link: string;
}) {
  try {
    const emailContent = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #0ea5e9; margin-bottom: 8px;">New Insight Published</h2>
        <p style="margin: 0 0 12px 0; color: #111; font-size: 16px;"><strong>${payload.title}</strong></p>
        ${payload.industry ? `<p style="margin: 0 0 8px 0; color: #555;">Industry: ${payload.industry}</p>` : ''}
        ${payload.preview ? `<p style="margin: 0 0 16px 0; color: #333; line-height: 1.5;">${payload.preview}...</p>` : ''}
        <div style="margin: 18px 0;">
          <a href="${payload.link}" style="background-color: #0ea5e9; color: white; padding: 10px 18px; text-decoration: none; border-radius: 6px;">Read Insight</a>
        </div>
        <p style="color: #64748b; font-size: 12px;">You are receiving this because you subscribed to new insights updates.</p>
      </div>
    `;

    await transporter.sendMail({
      from: `Omega Sir <${process.env.EMAIL_USER}>`,
      to: payload.email,
      subject: `New Insight: ${payload.title}`,
      html: emailContent,
    });
    return true;
  } catch (error) {
    console.error("Error sending insight notification email:", error);
    return false;
  }
}