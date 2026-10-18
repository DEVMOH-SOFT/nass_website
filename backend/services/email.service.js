import nodemailer from 'nodemailer';
import dns from 'dns';
import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const CONFIG_FILE = path.join(__dirname, '../data/mailer_config.json');

// Read persisted credentials fallback
const loadMailerConfig = () => {
  let fileConfig = {};
  if (fs.existsSync(CONFIG_FILE)) {
    try {
      fileConfig = JSON.parse(fs.readFileSync(CONFIG_FILE, 'utf8'));
    } catch (e) {
      // ignore
    }
  }
  return {
    host: process.env.SMTP_HOST || fileConfig.host || 'smtp.gmail.com',
    port: parseInt(process.env.SMTP_PORT || fileConfig.port || '587', 10),
    user: process.env.SMTP_USER || fileConfig.user || 'nasslasustech@gmail.com',
    pass: process.env.SMTP_PASS || fileConfig.pass || '',
    fromName: process.env.SMTP_FROM_NAME || fileConfig.fromName || 'Nigerian Association of Science Students (NASS LASUSTECH)',
    fromEmail: process.env.SMTP_FROM_EMAIL || fileConfig.fromEmail || fileConfig.user || 'nasslasustech@gmail.com',
  };
};

const mailerCfg = loadMailerConfig();

const transporter = nodemailer.createTransport({
  host: mailerCfg.host,
  port: mailerCfg.port,
  secure: mailerCfg.port === 465,
  auth: {
    user: mailerCfg.user,
    pass: mailerCfg.pass,
  },
  tls: {
    rejectUnauthorized: false,
  },
  // Force IPv4 lookup
  dnsLookup: (hostname, options, callback) => {
    dns.lookup(hostname, { family: 4 }, callback);
  },
  connectionTimeout: 15000,
  greetingTimeout: 15000,
  socketTimeout: 20000,
});

// Verify connection
transporter.verify((error) => {
  if (error) {
    console.error('❌ Email Server Connection Notice:', error.message);
  } else {
    console.log('🚀 Email Server Gateway is verified and ready for delivery');
  }
});

const APP_NAME = 'Nigerian Association of Science Students (NASS LASUSTECH)';
const PRIMARY_COLOR = '#047857';
const SECONDARY_COLOR = '#064e3b';
const SENDER_EMAIL = mailerCfg.user || 'nasslasustech@gmail.com';

const buildStandardHeaders = () => {
  const domain = SENDER_EMAIL.includes('@') ? SENDER_EMAIL.split('@')[1] : 'lasustech.edu.ng';
  return {
    messageId: `<nass.${Date.now()}.${Math.random().toString(36).substring(2, 9)}@${domain}>`,
    date: new Date(),
    headers: {
      'X-Mailer': 'NASS LASUSTECH Secretariat Portal v2.0',
      'List-Unsubscribe': `<mailto:${SENDER_EMAIL}?subject=Unsubscribe>`,
      'List-Unsubscribe-Post': 'List-Unsubscribe=One-Click',
      'Precedence': 'bulk',
      'X-Auto-Response-Suppress': 'OOF, AutoReply',
    },
  };
};

const spamAdvisoryHtml = `
  <div style="margin-top: 24px; padding: 14px 18px; background-color: #ecfdf5; border: 1px solid #a7f3d0; border-radius: 8px; font-size: 11.5px; line-height: 1.55; color: #065f46;">
    <strong style="color: #047857; font-size: 12px; display: block; margin-bottom: 3px;">
      📬 Delivery Advisory — Keep Official Dispatches in Your Primary Inbox:
    </strong>
    If this message arrived in your <strong>Spam / Junk</strong> folder or <strong>Promotions</strong> tab, please click <strong>"Report Not Spam"</strong> or move it to your <strong>Primary Inbox</strong>. Adding <strong>${SENDER_EMAIL}</strong> to your contacts ensures you receive vital dues clearance receipts and exam passes without delay.
  </div>
`;

const emailHeader = `
  <div style="padding: 24px 12px; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color: #1e293b; background-color: #f1f5f9;">
    <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff; border: 1px solid #e2e8f0; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 12px rgba(0,0,0,0.04);">
      <div style="padding: 24px; background: linear-gradient(135deg, ${SECONDARY_COLOR} 0%, ${PRIMARY_COLOR} 100%); color: #ffffff;">
        <div style="color: #a7f3d0; font-size: 10px; font-weight: 800; text-transform: uppercase; letter-spacing: 2px; margin-bottom: 4px;">DEVMOH-Led Administration</div>
        <h2 style="margin: 0; color: #ffffff; font-size: 19px; font-weight: 800; letter-spacing: -0.3px;">${APP_NAME}</h2>
        <div style="color: #6ee7b7; font-size: 11.5px; margin-top: 3px; font-weight: 600;">College of Basic Sciences • LASUSTECH Chapter</div>
      </div>
      <div style="padding: 28px 24px 20px 24px;">
`;

const emailFooter = `
        ${spamAdvisoryHtml}
      </div>
      <div style="padding: 20px 24px; background-color: #f8fafc; border-top: 1px solid #e2e8f0; font-size: 11px; color: #64748b; text-align: center; line-height: 1.5;">
        <p style="margin: 0 0 6px 0; font-weight: 600; color: #334155;">© ${new Date().getFullYear()} Nigerian Association of Science Students (NASS) LASUSTECH Chapter</p>
        <p style="margin: 0 0 6px 0; font-size: 10.5px; color: #94a3b8;">
          College of Basic Sciences, LASUSTECH • KM 33, Itoikin Road, Ikorodu Main Campus, P.M.B. 1007, Lagos State, Nigeria
        </p>
        <p style="margin: 0; font-size: 10px; color: #cbd5e1;">Official Collegiate Dispatch • DEVMOH-Led Administration</p>
      </div>
    </div>
  </div>
`;

/**
 * Send Contact Form Confirmation to User
 */
export const sendContactConfirmation = async (userEmail, userName) => {
  const mailOptions = {
    from: `"${APP_NAME}" <${SENDER_EMAIL}>`,
    replyTo: SENDER_EMAIL,
    to: userEmail,
    subject: 'Message Received — NASS LASUSTECH Secretariat',
    text: `Hello ${userName},\n\nThank you for reaching out to the NASS LASUSTECH Chapter (College of Basic Sciences).\n\nWe have received your message and our secretariat team is attending to your inquiry. You will receive a direct reply as soon as possible.\n\nNote: If this message landed in your Spam/Junk folder, please click 'Report Not Spam' and add ${SENDER_EMAIL} to your contacts.\n\nBest regards,\nExecutive Secretariat\nNigerian Association of Science Students (NASS LASUSTECH)`,
    html: `
      ${emailHeader}
      <h2 style="color: #0f172a; margin-top: 0; font-size: 18px; font-weight: 800;">Hello ${userName},</h2>
      <p style="color: #475569; line-height: 1.6; font-size: 14px;">
        Thank you for reaching out to the <strong>Nigerian Association of Science Students (NASS) LASUSTECH Chapter</strong>. We have received your inquiry and our secretariat team is looking into it.
      </p>
      <p style="color: #475569; line-height: 1.6; font-size: 14px;">
        You will hear from us shortly. In the meantime, feel free to explore academic resources and past questions on the student portal.
      </p>
      
      <div style="margin: 24px 0; padding: 16px; background-color: #f8fafc; border-left: 4px solid ${PRIMARY_COLOR}; border-radius: 4px;">
        <p style="margin: 0; font-style: italic; color: #475569; font-size: 13px;">
          "Advancing scientific excellence, innovation, and unity across the College of Basic Sciences."
        </p>
      </div>
      
      <p style="color: #475569; line-height: 1.6; font-size: 14px;">
        Best regards,<br>
        <strong style="color: #047857;">The Executive Secretariat</strong><br>
        DEVMOH-Led Administration, NASS LASUSTECH
      </p>
      ${emailFooter}
    `,
    ...buildStandardHeaders(),
  };

  return transporter.sendMail(mailOptions);
};

/**
 * Send Contact Form Notification to Admin
 */
export const sendContactNotificationToAdmin = async (contactData) => {
  const { full_name, email, subject, message } = contactData;
  const mailOptions = {
    from: `"${APP_NAME} Portal" <${SENDER_EMAIL}>`,
    replyTo: email,
    to: process.env.ADMIN_EMAIL || SENDER_EMAIL,
    subject: `[Secretariat Inquiry] ${subject}`,
    text: `New Student / Affiliate Inquiry\n\nName: ${full_name}\nEmail: ${email}\nSubject: ${subject}\n\nMessage:\n${message}`,
    html: `
      ${emailHeader}
      <h3 style="color: #0f172a; margin-top: 0; font-size: 17px;">New Secretariat Inquiry Submission</h3>
      <p style="color: #475569; font-size: 13.5px;">A new message has been submitted via the NASS LASUSTECH student portal.</p>
      
      <div style="margin: 20px 0; padding: 16px; background-color: #f8fafc; border-radius: 8px; border: 1px solid #e2e8f0; font-size: 13px;">
        <p style="margin: 0 0 6px 0;"><strong>Sender Name:</strong> ${full_name}</p>
        <p style="margin: 0 0 6px 0;"><strong>Email:</strong> ${email}</p>
        <p style="margin: 0 0 10px 0;"><strong>Subject:</strong> ${subject}</p>
        <hr style="border: 0; border-top: 1px solid #e2e8f0; margin: 12px 0;">
        <p style="margin: 0 0 4px 0; font-weight: 700; color: #047857;">Message Content:</p>
        <p style="white-space: pre-wrap; color: #334155; margin: 0; line-height: 1.6;">${message}</p>
      </div>
      ${emailFooter}
    `,
    ...buildStandardHeaders(),
  };

  return transporter.sendMail(mailOptions);
};

/**
 * Send Payment Receipt to User
 */
export const sendPaymentReceipt = async (userEmail, userName, paymentData) => {
  const { amount, reference, type, date } = paymentData;
  const mailOptions = {
    from: `"${APP_NAME} Finance" <${SENDER_EMAIL}>`,
    replyTo: SENDER_EMAIL,
    to: userEmail,
    subject: `Payment Receipt: ${type} — Ref: ${reference}`,
    text: `Hello ${userName},\n\nPayment Successful!\n\nReference: ${reference}\nType: ${type}\nAmount: ₦${parseFloat(amount).toLocaleString()}\nDate: ${date || new Date().toLocaleDateString()}\n\nYour collegiate clearance record has been updated. You can view and download your full digital receipt and ID card anytime on your portal dashboard.\n\nDelivery Note: If this receipt landed in your Spam/Junk folder, please click 'Report Not Spam' and add ${SENDER_EMAIL} to your Google Contacts.\n\nThank you.\nExecutive Treasurer & Secretariat\nNASS LASUSTECH`,
    html: `
      ${emailHeader}
      <h3 style="color: #0f172a; margin-top: 0; font-size: 18px; font-weight: 800;">Payment Clearance Confirmed</h3>
      <p style="color: #475569; font-size: 14px;">Hello <strong>${userName}</strong>, thank you for your payment. Here is your official clearance record.</p>
      
      <div style="margin: 20px 0; padding: 20px; border: 1px solid #e2e8f0; border-radius: 10px; background-color: #fafafa;">
        <table style="width: 100%; border-collapse: collapse; font-size: 13.5px;">
          <tr>
            <td style="padding: 8px 0; color: #64748b;">Transaction Reference</td>
            <td style="padding: 8px 0; text-align: right; font-weight: 700; color: #0f172a; font-family: monospace;">${reference}</td>
          </tr>
          <tr>
            <td style="padding: 8px 0; color: #64748b;">Payment Purpose</td>
            <td style="padding: 8px 0; text-align: right; font-weight: 700; color: #0f172a;">${type}</td>
          </tr>
          <tr>
            <td style="padding: 8px 0; color: #64748b;">Transaction Date</td>
            <td style="padding: 8px 0; text-align: right; font-weight: 600; color: #0f172a;">${date || new Date().toLocaleDateString()}</td>
          </tr>
          <tr style="border-top: 2px solid #e2e8f0;">
            <td style="padding: 16px 0 0 0; font-weight: 800; font-size: 15px; color: #0f172a;">Amount Paid</td>
            <td style="padding: 16px 0 0 0; text-align: right; color: ${PRIMARY_COLOR}; font-weight: 900; font-size: 18px;">₦${parseFloat(amount).toLocaleString()}</td>
          </tr>
        </table>
      </div>
      
      <p style="color: #475569; font-size: 13.5px; line-height: 1.6;">
        Your dues clearance has been verified. You can generate your official collegiate digital ID card and download your printable clearance receipt directly from your student dashboard.
      </p>
      ${emailFooter}
    `,
    ...buildStandardHeaders(),
  };

  return transporter.sendMail(mailOptions);
};

/**
 * Send Payment Notification to Admin
 */
export const sendPaymentNotificationToAdmin = async (paymentData, userDetails) => {
  const { amount, reference, type } = paymentData;
  const { full_name, matric_number } = userDetails;
  
  const mailOptions = {
    from: `"${APP_NAME} Portal" <${SENDER_EMAIL}>`,
    replyTo: SENDER_EMAIL,
    to: process.env.ADMIN_EMAIL || SENDER_EMAIL,
    subject: `Payment Alert: ${full_name} (₦${parseFloat(amount).toLocaleString()})`,
    text: `Collegiate Payment Notification\n\nStudent: ${full_name} (${matric_number})\nPayment For: ${type}\nAmount: ₦${parseFloat(amount).toLocaleString()}\nReference: ${reference}`,
    html: `
      ${emailHeader}
      <h3 style="color: #0f172a; margin-top: 0; font-size: 17px;">Collegiate Payment Notification</h3>
      <p style="color: #475569; font-size: 13.5px;">A new statutory session payment has been cleared on the portal.</p>
      
      <div style="margin: 20px 0; padding: 16px; background-color: #f8fafc; border-radius: 8px; border: 1px solid #e2e8f0; font-size: 13px;">
        <p style="margin: 0 0 6px 0;"><strong>Student Name:</strong> ${full_name}</p>
        <p style="margin: 0 0 6px 0;"><strong>Matric / Scholar ID:</strong> ${matric_number}</p>
        <p style="margin: 0 0 6px 0;"><strong>Payment Purpose:</strong> ${type}</p>
        <p style="margin: 0 0 6px 0;"><strong>Amount:</strong> ₦${parseFloat(amount).toLocaleString()}</p>
        <p style="margin: 0;"><strong>Reference:</strong> ${reference}</p>
      </div>
      ${emailFooter}
    `,
    ...buildStandardHeaders(),
  };

  return transporter.sendMail(mailOptions);
};

/**
 * Send Password Reset Notification
 */
export const sendPasswordReset = async (userEmail, userName, tempPassword) => {
  const mailOptions = {
    from: `"${APP_NAME}" <${SENDER_EMAIL}>`,
    replyTo: SENDER_EMAIL,
    to: userEmail,
    subject: 'Password Reset Request — NASS LASUSTECH',
    text: `Hello ${userName},\n\nWe received a request to reset your NASS LASUSTECH Portal password. Your temporary password is: ${tempPassword}\n\nPlease login and change your password immediately in your profile settings.\n\nIf you did not request this, please contact secretariat support immediately.`,
    html: `
      ${emailHeader}
      <h3 style="color: #0f172a; margin-top: 0; font-size: 18px; font-weight: 800;">Password Reset Request</h3>
      <p style="color: #475569; font-size: 14px;">Hello ${userName}, we received a request to reset your password for the NASS LASUSTECH Student Portal.</p>
      
      <div style="margin: 25px 0; padding: 20px; background-color: #f8fafc; border-radius: 8px; text-align: center; border: 1px solid #e2e8f0;">
        <p style="margin: 0; color: #64748b; font-size: 11px; text-transform: uppercase; letter-spacing: 1px; font-weight: 700;">Temporary Access Password</p>
        <p style="margin: 10px 0 0 0; font-family: monospace; font-size: 26px; color: ${PRIMARY_COLOR}; font-weight: 900; letter-spacing: 2px;">${tempPassword}</p>
      </div>
      
      <p style="color: #475569; font-size: 13.5px; line-height: 1.6;">Please use this password to log in and <strong>change it immediately</strong> from your profile settings.</p>
      <p style="color: #ef4444; font-size: 11.5px;">If you did not request this, please disregard this email or report to the secretariat.</p>
      ${emailFooter}
    `,
    ...buildStandardHeaders(),
  };

  return transporter.sendMail(mailOptions);
};

/**
 * Send OTP for Password Reset
 */
export const sendOtp = async (userEmail, userName, otpCode) => {
  const mailOptions = {
    from: `"${APP_NAME}" <${SENDER_EMAIL}>`,
    replyTo: SENDER_EMAIL,
    to: userEmail,
    subject: `Your Verification Code: ${otpCode} — NASS LASUSTECH`,
    text: `Hello ${userName},\n\nYour NASS LASUSTECH verification code is: ${otpCode}\n\nThis code expires in 10 minutes. If you did not request this code, please ignore this email.`,
    html: `
      ${emailHeader}
      <h3 style="color: #0f172a; margin-top: 0; font-size: 18px; font-weight: 800;">Verify Your Collegiate Account</h3>
      <p style="color: #475569; font-size: 14px;">Hello ${userName}, enter the verification code below to complete your authentication.</p>
      
      <div style="margin: 25px 0; padding: 20px; background-color: #f8fafc; border-radius: 8px; text-align: center; border: 1px solid #e2e8f0;">
        <p style="margin: 0; color: #64748b; font-size: 11px; text-transform: uppercase; letter-spacing: 1px; font-weight: 700;">Security Verification Code</p>
        <p style="margin: 10px 0 0 0; font-family: monospace; font-size: 32px; color: ${PRIMARY_COLOR}; font-weight: 900; letter-spacing: 6px;">${otpCode}</p>
      </div>
      
      <p style="color: #475569; font-size: 13px; line-height: 1.6;">This code will expire in 10 minutes. Never share this code with anyone.</p>
      ${emailFooter}
    `,
    ...buildStandardHeaders(),
  };

  return transporter.sendMail(mailOptions);
};

/**
 * Send Custom HTML Email
 */
export const sendCustomEmail = async (to, subject, htmlContent) => {
  const mailOptions = {
    from: `"${APP_NAME}" <${SENDER_EMAIL}>`,
    replyTo: SENDER_EMAIL,
    to,
    subject,
    html: `
      ${emailHeader}
      ${htmlContent}
      ${emailFooter}
    `,
    ...buildStandardHeaders(),
  };

  return transporter.sendMail(mailOptions);
};

export default {
  sendContactConfirmation,
  sendContactNotificationToAdmin,
  sendPaymentReceipt,
  sendPaymentNotificationToAdmin,
  sendPasswordReset,
  sendOtp,
  sendCustomEmail,
};
