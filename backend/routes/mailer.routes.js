import { Router } from 'express';
import nodemailer from 'nodemailer';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import jwt from 'jsonwebtoken';
import JWT_SECRET from '../jwt-secret.js';
import rateLimit from 'express-rate-limit';
import protect from '../middleware/auth.middleware.js';
import isAdmin from '../middleware/admin.middleware.js';

const router = Router();
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const CONFIG_FILE = path.join(__dirname, '../data/mailer_config.json');

/**
 * Access model
 * ---------------------------------------------------------
 * - config / test: admin only.
 * - send: admins can send anything. Everyone else (contact form, dues
 *   receipt after payment) may only trigger fixed templates whose content
 *   is built here on the server, rate limited per IP and per recipient.
 */
const isAdminRequest = (req) => {
  const header = req.headers.authorization || '';
  if (!header.startsWith('Bearer ')) return false;
  try {
    const user = jwt.verify(header.slice(7), JWT_SECRET);
    return user?.role === 'admin';
  } catch (_err) {
    return false;
  }
};

const publicSendLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: 60,
  skip: isAdminRequest,
  message: { success: false, message: 'Too many emails requested. Please try again later.' },
});

// Max public emails to one recipient per hour (stops using us to spam one inbox).
const RECIPIENT_LIMIT = 3;
const recipientHits = new Map();
const recipientAllowed = (email) => {
  const now = Date.now();
  const key = email.toLowerCase();
  const hits = (recipientHits.get(key) || []).filter((t) => now - t < 60 * 60 * 1000);
  if (hits.length >= RECIPIENT_LIMIT) {
    recipientHits.set(key, hits);
    return false;
  }
  hits.push(now);
  recipientHits.set(key, hits);
  if (recipientHits.size > 5000) {
    for (const [k, v] of recipientHits) {
      if (v.every((t) => now - t >= 60 * 60 * 1000)) recipientHits.delete(k);
    }
  }
  return true;
};

const escapeHtml = (value) =>
  String(value ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');

const clip = (value, max) => String(value ?? '').replace(/\r/g, '').slice(0, max);

/**
 * Builds the email for a non-admin request, or returns { status, error }.
 * Nothing the client sends decides who receives the mail or what it says
 * beyond the fields below.
 */
const preparePublicMail = (reqBody, config) => {
  const { template, recipients, subject, body, student_name, matric_number, meta = {} } = reqBody;
  const firstRecipient = (Array.isArray(recipients) ? recipients : [recipients])[0];
  const to = typeof firstRecipient === 'string' ? firstRecipient.trim() : '';
  const when = new Date().toLocaleString();

  if (template === 'contact_notice') {
    // Always goes to the NASS secretariat inbox, never to a client-chosen address.
    return {
      recipients: [config.fromEmail || config.user],
      subject: clip(subject, 200),
      body: clip(body, 5000),
      studentName: clip(student_name, 120),
      matricNumber: '',
    };
  }

  if (template !== 'dues_receipt' && template !== 'contact_ack') {
    return { status: 403, error: 'Admin sign-in required to send this email.' };
  }

  if (!to || to.length > 254 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(to)) {
    return { status: 400, error: 'A valid recipient email is required.' };
  }
  if (!recipientAllowed(to)) {
    return { status: 429, error: 'Too many emails sent to this address. Please try again later.' };
  }

  const name = clip(student_name, 120) || 'Student';

  if (template === 'dues_receipt') {
    const amount = Number(meta.amount);
    const reference = clip(meta.reference, 80);
    if (!Number.isFinite(amount) || amount <= 0 || !reference) {
      return { status: 400, error: 'Receipt details are incomplete.' };
    }
    const department = clip(meta.department, 120);
    const level = clip(meta.level, 40);
    const matric = clip(matric_number, 40);
    return {
      recipients: [to],
      subject: `Official Receipt: NASS LASUSTECH Session Dues Clearance - Ref: ${reference}`,
      studentName: name,
      matricNumber: matric,
      body: `Dear ${name},

This is your official payment confirmation from the Nigerian Association of Science Students (NASS), College of Basic Sciences, LASUSTECH.

We confirm receipt of ₦${amount.toLocaleString()} for your 2025/2026 Statutory Session Dues.

Transaction Details:
• Student Name: ${name}
• Matric / Scholar ID: ${matric}
• Department: ${department}
• Level: ${level}
• Reference: ${reference}
• Status: Cleared & Verified

${meta.isFresher ? 'Note for Freshers: Once your permanent LASUSTECH matriculation number is issued by the Academic Affairs Division, log into your portal to update your profile.\n' : ''}
You can download your verified digital receipt and print your official ID card anytime on your student portal.

Office of the Executive Treasurer,
DEVMOH-Led Administration, NASS LASUSTECH.`,
    };
  }

  // contact_ack
  const department = clip(meta.department, 160);
  return {
    recipients: [to],
    subject: `Acknowledgement: Your Inquiry to NASS LASUSTECH Secretariat [${department}]`,
    studentName: name,
    matricNumber: '',
    body: `Dear ${name},

Thank you for reaching out to the Nigerian Association of Science Students (NASS LASUSTECH).

Your message addressed to the "${department}" has been securely logged and delivered to the Secretariat (${config.fromEmail || config.user}).

Summary of Your Inquiry:
• Designated Unit: ${department}
• Submitted On: ${when}
• Your Message:
"${clip(meta.message, 3000)}"

A representative or executive officer from the Directorate will review your submission and respond to you directly.

Warm regards,
NASS LASUSTECH Secretariat
College of Basic Science Ground Floor, LASUSTECH Main Campus, Ikorodu`,
  };
};

/**
 * Load persisted mailer config from JSON file or environment variables
 */
const getMailerConfig = () => {
  let fileConfig = {};
  if (fs.existsSync(CONFIG_FILE)) {
    try {
      fileConfig = JSON.parse(fs.readFileSync(CONFIG_FILE, 'utf8'));
    } catch (e) {
      console.warn('Could not read mailer_config.json:', e.message);
    }
  }

  return {
    host: fileConfig.host || process.env.SMTP_HOST || 'smtp.gmail.com',
    port: parseInt(fileConfig.port || process.env.SMTP_PORT || '587', 10),
    secure: (fileConfig.port || process.env.SMTP_PORT) == 465,
    user: fileConfig.user || process.env.SMTP_USER || '',
    pass: fileConfig.pass || process.env.SMTP_PASS || '',
    fromName: fileConfig.fromName || 'Nigerian Association of Science Students (NASS LASUSTECH)',
    fromEmail: fileConfig.fromEmail || fileConfig.user || process.env.SMTP_USER || 'nasslasustech@gmail.com',
  };
};

/**
 * Save mailer configuration
 */
const saveMailerConfig = (newConfig) => {
  const current = getMailerConfig();
  const merged = {
    ...current,
    ...newConfig,
    port: parseInt(newConfig.port || current.port || 587, 10),
  };
  fs.writeFileSync(CONFIG_FILE, JSON.stringify(merged, null, 2), 'utf8');
  return merged;
};

/**
 * Format file size into human-readable string
 */
const formatBytes = (bytes) => {
  if (!bytes || bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${(bytes / Math.pow(k, i)).toFixed(1)} ${sizes[i]}`;
};

/**
 * Build collegiate HTML email layout with inbox deliverability optimization
 */
const buildCollegiateHtml = ({
  subject,
  body,
  studentName,
  matricNumber,
  attachments = [],
  senderEmail = 'nasslasustech@gmail.com',
}) => {
  const formattedBody = String(body || '')
    .replace(/\r\n/g, '<br/>')
    .replace(/\n/g, '<br/>');

  const attachmentItems = (attachments || []).map((att) => {
    const sizeStr = att.size ? ` (${formatBytes(att.size)})` : '';
    const isImg = att.contentType && att.contentType.startsWith('image/');
    return `
      <li style="margin-bottom: 6px; display: flex; align-items: center; gap: 8px;">
        <span style="display: inline-block; padding: 2px 6px; background-color: #e0f2fe; color: #0369a1; border-radius: 4px; font-size: 10px; font-weight: 700; text-transform: uppercase;">
          ${isImg ? 'IMAGE' : 'FILE'}
        </span>
        <strong style="color: #0f172a; font-size: 13px;">${att.filename || 'Attachment'}</strong>
        <span style="color: #64748b; font-size: 11px;">${sizeStr}</span>
      </li>
    `;
  }).join('');

  return `
  <!DOCTYPE html>
  <html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <meta http-equiv="X-UA-Compatible" content="IE=edge" />
    <title>${subject}</title>
  </head>
  <body style="margin: 0; padding: 0; background-color: #f1f5f9; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color: #1e293b; -webkit-font-smoothing: antialiased; line-height: 1.6;">
    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background-color: #f1f5f9; padding: 32px 12px;">
      <tr>
        <td align="center">
          <table role="presentation" width="100%" style="max-width: 620px; background-color: #ffffff; border-radius: 18px; overflow: hidden; box-shadow: 0 4px 20px rgba(0,0,0,0.06); border: 1px solid #e2e8f0;">
            <!-- Header Bar -->
            <tr>
              <td style="background: linear-gradient(135deg, #064e3b 0%, #047857 100%); padding: 28px 32px; text-align: left;">
                <table role="presentation" width="100%" cellspacing="0" cellpadding="0">
                  <tr>
                    <td>
                      <div style="color: #a7f3d0; font-size: 10px; font-weight: 800; text-transform: uppercase; letter-spacing: 2px; margin-bottom: 4px;">
                        DEVMOH-Led Administration • Official Dispatch
                      </div>
                      <h1 style="margin: 0; color: #ffffff; font-size: 21px; font-weight: 800; letter-spacing: -0.3px; line-height: 1.25;">
                        Nigerian Association of Science Students
                      </h1>
                      <div style="color: #6ee7b7; font-size: 12px; font-weight: 600; margin-top: 4px;">
                        NASS LASUSTECH Chapter • College of Basic Sciences
                      </div>
                    </td>
                  </tr>
                </table>
              </td>
            </tr>

            <!-- Content Area -->
            <tr>
              <td style="padding: 32px 32px 24px 32px;">
                ${
                  studentName
                    ? `<div style="margin-bottom: 22px; padding: 12px 18px; background-color: #f0fdf4; border-left: 4px solid #059669; border-radius: 8px;">
                        <span style="font-size: 11px; text-transform: uppercase; letter-spacing: 0.5px; color: #166534; font-weight: 800; display: block; margin-bottom: 2px;">Designated Recipient</span>
                        <span style="font-size: 14px; color: #14532d; font-weight: 700;">${studentName}</span>
                        ${matricNumber ? `<span style="font-size: 12px; color: #15803d; font-family: monospace; margin-left: 8px; font-weight: 600;">[${matricNumber}]</span>` : ''}
                       </div>`
                    : ''
                }

                <h2 style="font-size: 18px; font-weight: 800; color: #0f172a; margin-top: 0; margin-bottom: 18px; line-height: 1.35; letter-spacing: -0.2px;">
                  ${subject}
                </h2>

                <div style="font-size: 14.5px; line-height: 1.7; color: #334155; margin-bottom: 26px;">
                  ${formattedBody}
                </div>

                ${
                  attachmentItems
                    ? `<!-- Attached Files Card -->
                       <div style="margin: 22px 0; padding: 14px 18px; background-color: #f8fafc; border: 1px dashed #cbd5e1; border-radius: 10px;">
                         <div style="font-size: 12px; font-weight: 800; color: #0f172a; margin-bottom: 8px; text-transform: uppercase; letter-spacing: 0.5px;">
                           📎 Attached Dispatch Document(s) / Media (${attachments.length})
                         </div>
                         <ul style="margin: 0; padding-left: 0; list-style: none;">
                           ${attachmentItems}
                         </ul>
                         <p style="margin: 8px 0 0 0; font-size: 11px; color: #64748b;">
                           Attachments are included with this message. Check your mail client's attachment bar or bottom section to download or view.
                         </p>
                       </div>`
                    : ''
                }

                <!-- Anti-Spam / Deliverability Instruction Card -->
                <div style="margin-top: 26px; padding: 14px 18px; background-color: #ecfdf5; border: 1px solid #a7f3d0; border-radius: 10px; font-size: 12px; line-height: 1.55; color: #065f46;">
                  <strong style="color: #047857; font-size: 12.5px; display: block; margin-bottom: 4px;">
                    📬 Ensure You Receive Future Official Dispatches in Your Primary Inbox:
                  </strong>
                  <div style="color: #064e3b;">
                    If this official communiqué landed in your <strong>Spam / Junk</strong> folder or <strong>Promotions</strong> tab:
                    <ul style="margin: 6px 0 6px 16px; padding: 0;">
                      <li>Click <strong>"Report Not Spam"</strong> or drag this email into your <strong>Primary</strong> inbox tab.</li>
                      <li>Add <strong>${senderEmail}</strong> to your Google Contacts / Safe Senders list.</li>
                    </ul>
                    This confirms to email providers that official NASS LASUSTECH correspondence is wanted and verified.
                  </div>
                </div>

                <!-- Secretariat Signature -->
                <div style="border-top: 1px solid #f1f5f9; padding-top: 20px; margin-top: 26px;">
                  <table role="presentation" width="100%">
                    <tr>
                      <td style="font-size: 12px; color: #64748b; line-height: 1.5;">
                        <strong style="color: #047857; font-size: 13px;">Executive Secretariat</strong><br/>
                        Nigerian Association of Science Students (NASS)<br/>
                        College of Basic Sciences, LASUSTECH<br/>
                        Ikorodu Main Campus, Lagos State, Nigeria
                      </td>
                      <td align="right" style="vertical-align: bottom;">
                        <span style="display: inline-block; padding: 5px 12px; background-color: #ecfdf5; color: #047857; border: 1px solid #a7f3d0; border-radius: 9999px; font-size: 10px; font-weight: 800; text-transform: uppercase; letter-spacing: 0.5px;">
                          Verified Dispatch
                        </span>
                      </td>
                    </tr>
                  </table>
                </div>
              </td>
            </tr>

            <!-- CAN-SPAM / Legal Footer -->
            <tr>
              <td style="background-color: #f8fafc; padding: 20px 32px; text-align: center; border-top: 1px solid #e2e8f0;">
                <p style="margin: 0 0 6px 0; font-size: 11px; color: #64748b; font-weight: 500;">
                  © ${new Date().getFullYear()} Nigerian Association of Science Students (NASS) LASUSTECH Chapter
                </p>
                <p style="margin: 0 0 6px 0; font-size: 10.5px; color: #94a3b8; line-height: 1.4;">
                  KM 33, Itoikin Road, Ikorodu Main Campus, P.M.B. 1007, Ikorodu, Lagos State, Nigeria.<br/>
                  You are receiving this official correspondence as an enrolled science scholar or collegiate affiliate.
                </p>
                <p style="margin: 0; font-size: 10px; color: #cbd5e1;">
                  Powered by DEVMOH-Led Administration • Collegiate Secure Delivery •
                  <a href="mailto:${senderEmail}?subject=Unsubscribe%20Request" style="color: #94a3b8; text-decoration: underline;">
                    Manage Preferences
                  </a>
                </p>
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  </body>
  </html>
  `;
};

/**
 * Build matching Plain Text layout to ensure spam filters (SpamAssassin / Google)
 * do not penalize the email for HTML/Text disparity.
 */
const buildCollegiatePlainText = ({
  subject,
  body,
  studentName,
  matricNumber,
  attachments = [],
  senderEmail = 'nasslasustech@gmail.com',
}) => {
  const attachmentStr = attachments && attachments.length > 0
    ? `\nATTACHED DOCUMENTS (${attachments.length}):\n` +
      attachments.map((a, i) => `  ${i + 1}. ${a.filename || 'Attachment'}${a.size ? ` (${formatBytes(a.size)})` : ''}`).join('\n') +
      '\n'
    : '';

  return `NIGERIAN ASSOCIATION OF SCIENCE STUDENTS (NASS LASUSTECH)
College of Basic Sciences, Lagos State University of Science and Technology
Official Collegiate Dispatch • DEVMOH-Led Administration
======================================================================

SUBJECT: ${subject}
${studentName ? `RECIPIENT: ${studentName}${matricNumber ? ` [${matricNumber}]` : ''}\n` : ''}
----------------------------------------------------------------------

${body}
${attachmentStr}
----------------------------------------------------------------------
INBOX DELIVERY NOTICE:
If this official communiqué landed in your Spam / Junk folder or Promotions tab,
please click "Report Not Spam" or move it to your Primary Inbox. Add
${senderEmail} to your Google Contacts so future academic announcements
and clearance receipts arrive directly in your inbox.
----------------------------------------------------------------------

Executive Secretariat
Nigerian Association of Science Students (NASS)
College of Basic Sciences, LASUSTECH
KM 33, Itoikin Road, Ikorodu Main Campus, P.M.B. 1007, Lagos State, Nigeria
Official Portal: https://nass-lasustech.edu.ng
Support: ${senderEmail}

© ${new Date().getFullYear()} NASS LASUSTECH. All rights reserved.
`;
};

/**
 * GET /api/mailer/config
 * Returns current configuration status without exposing sensitive pass
 */
router.get('/config', protect, isAdmin, (_req, res) => {
  const config = getMailerConfig();
  res.json({
    configured: Boolean(config.user && config.pass),
    host: config.host,
    port: config.port,
    user: config.user ? `${config.user.slice(0, 3)}***@${config.user.split('@')[1] || ''}` : '',
    rawUser: config.user || '',
    fromName: config.fromName,
    fromEmail: config.fromEmail,
  });
});

/**
 * POST /api/mailer/config
 * Admin updates SMTP settings
 */
router.post('/config', protect, isAdmin, (req, res) => {
  const { host, port, user, pass, fromName, fromEmail } = req.body;
  const current = getMailerConfig();

  const saved = saveMailerConfig({
    host: host || current.host,
    port: port || current.port,
    user: user !== undefined ? user : current.user,
    pass: pass ? pass : current.pass,
    fromName: fromName || current.fromName,
    fromEmail: fromEmail || user || current.fromEmail,
  });

  res.json({
    success: true,
    message: 'Mailer settings updated successfully.',
    configured: Boolean(saved.user && saved.pass),
  });
});

/**
 * POST /api/mailer/test
 * Sends test verification email to admin or specified inbox
 */
router.post('/test', protect, isAdmin, async (req, res) => {
  const { targetEmail } = req.body;
  const config = getMailerConfig();

  if (!config.user || !config.pass) {
    return res.status(400).json({
      success: false,
      message: 'SMTP credentials missing. Please configure your Gmail address and 16-character Google App Password first.',
    });
  }

  if (!targetEmail || !targetEmail.includes('@')) {
    return res.status(400).json({
      success: false,
      message: 'Please provide a valid destination email address.',
    });
  }

  try {
    const transporter = nodemailer.createTransport({
      host: config.host,
      port: config.port,
      secure: config.port === 465,
      auth: {
        user: config.user,
        pass: config.pass,
      },
      tls: {
        rejectUnauthorized: false,
      },
    });

    const testSubject = '✅ NASS LASUSTECH Mailer: Test Email Delivery Confirmed';
    const testBody = `Congratulations!\n\nYour NASS LASUSTECH Email & Communication gateway is active and successfully delivering messages.\n\nSender: ${config.fromName} (${config.user})\nTimestamp: ${new Date().toLocaleString()}\nGateway Status: Verified, Active & Live.`;

    const html = buildCollegiateHtml({
      subject: 'Mailer Gateway Verification Test',
      body: testBody,
      studentName: 'Collegiate Administrator',
      senderEmail: config.user,
    });

    const plainText = buildCollegiatePlainText({
      subject: 'Mailer Gateway Verification Test',
      body: testBody,
      studentName: 'Collegiate Administrator',
      senderEmail: config.user,
    });

    const domain = config.user.includes('@') ? config.user.split('@')[1] : 'lasustech.edu.ng';
    const messageId = `<nass.test.${Date.now()}.${Math.random().toString(36).substring(2, 9)}@${domain}>`;

    const info = await transporter.sendMail({
      from: `"${config.fromName}" <${config.user}>`,
      replyTo: config.fromEmail || config.user,
      to: targetEmail,
      subject: testSubject,
      html,
      text: plainText,
      date: new Date(),
      messageId,
      headers: {
        'X-Mailer': 'NASS LASUSTECH Secretariat Portal v2.0',
        'List-Unsubscribe': `<mailto:${config.user}?subject=Unsubscribe>`,
        'List-Unsubscribe-Post': 'List-Unsubscribe=One-Click',
        'Precedence': 'bulk',
        'X-Auto-Response-Suppress': 'OOF, AutoReply',
      },
    });

    return res.json({
      success: true,
      message: `Test email successfully sent to ${targetEmail}! Message ID: ${info.messageId}`,
      info,
    });
  } catch (error) {
    console.error('Test mail delivery failed:', error);
    return res.status(500).json({
      success: false,
      message: error.message || 'SMTP delivery failed.',
      code: error.code,
    });
  }
});

/**
 * POST /api/mailer/send
 * Main broadcast & single dispatch endpoint
 * Supports attachments (images, PDFs, documents)
 */
router.post('/send', publicSendLimiter, async (req, res) => {
  const admin = isAdminRequest(req);
  let {
    recipients,
    subject,
    body,
    student_name,
    matric_number,
    attachments,
    config: runtimeConfig,
  } = req.body;

  const config = {
    ...getMailerConfig(),
    ...(admin ? runtimeConfig || {} : {}),
  };

  if (!admin) {
    const prepared = preparePublicMail(req.body, config);
    if (prepared.error) {
      return res.status(prepared.status).json({ success: false, message: prepared.error });
    }
    recipients = prepared.recipients;
    subject = prepared.subject;
    body = prepared.body;
    student_name = prepared.studentName;
    matric_number = prepared.matricNumber;
    attachments = [];
  }

  const recipientList = Array.isArray(recipients) ? recipients : [recipients];
  const validRecipients = recipientList.filter((e) => e && typeof e === 'string' && e.includes('@'));

  if (validRecipients.length === 0) {
    return res.status(400).json({
      success: false,
      message: 'No valid recipient email addresses provided.',
    });
  }

  if (!subject || !body) {
    return res.status(400).json({
      success: false,
      message: 'Email subject and body are required.',
    });
  }

  if (!config.user || !config.pass) {
    return res.status(400).json({
      success: false,
      requiresSetup: true,
      message: 'SMTP credentials not configured. Please enter your Gmail & Google App Password in Mailer Settings to enable real inbox delivery.',
    });
  }

  try {
    const transporter = nodemailer.createTransport({
      host: config.host,
      port: config.port,
      secure: config.port === 465,
      auth: {
        user: config.user,
        pass: config.pass,
      },
      tls: {
        rejectUnauthorized: false,
      },
    });

    // Parse and prepare incoming attachments
    const rawAttachments = Array.isArray(attachments) ? attachments : [];
    const formattedAttachments = rawAttachments
      .filter((att) => att && (att.content || att.path))
      .map((att) => {
        let content = att.content || '';
        // If it's a data URL, strip the header
        if (typeof content === 'string' && content.includes('base64,')) {
          content = content.split('base64,')[1];
        }
        return {
          filename: att.filename || 'attachment',
          content: typeof content === 'string' ? Buffer.from(content, 'base64') : content,
          contentType: att.contentType || undefined,
        };
      });

    // Admin content is trusted; anything from public callers is escaped in the HTML part.
    const html = buildCollegiateHtml({
      subject,
      body: admin ? body : escapeHtml(body),
      studentName: admin ? student_name : escapeHtml(student_name),
      matricNumber: admin ? matric_number : escapeHtml(matric_number),
      attachments: rawAttachments,
      senderEmail: config.user,
    });

    const plainText = buildCollegiatePlainText({
      subject,
      body,
      studentName: student_name,
      matricNumber: matric_number,
      attachments: rawAttachments,
      senderEmail: config.user,
    });

    const domain = config.user.includes('@') ? config.user.split('@')[1] : 'lasustech.edu.ng';

    // Send in parallel / chunked
    const sendPromises = validRecipients.map((to) => {
      const messageId = `<nass.${Date.now()}.${Math.random().toString(36).substring(2, 9)}@${domain}>`;
      return transporter.sendMail({
        from: `"${config.fromName}" <${config.user}>`,
        replyTo: config.fromEmail || config.user,
        to,
        subject,
        html,
        text: plainText,
        date: new Date(),
        messageId,
        headers: {
          'X-Mailer': 'NASS LASUSTECH Secretariat Portal v2.0',
          'List-Unsubscribe': `<mailto:${config.user}?subject=Unsubscribe>`,
          'List-Unsubscribe-Post': 'List-Unsubscribe=One-Click',
          'Precedence': 'bulk',
          'X-Auto-Response-Suppress': 'OOF, AutoReply',
          'X-Report-Abuse-To': `mailto:${config.user}`,
        },
        attachments: formattedAttachments,
      });
    });

    const results = await Promise.allSettled(sendPromises);
    const delivered = results.filter((r) => r.status === 'fulfilled').length;
    const failed = results.filter((r) => r.status === 'rejected');

    if (delivered === 0 && failed.length > 0) {
      const firstError = failed[0]?.reason?.message || 'Failed to dispatch email';
      return res.status(500).json({
        success: false,
        message: `Delivery failed: ${firstError}`,
      });
    }

    return res.json({
      success: true,
      delivered,
      total: validRecipients.length,
      attachmentsCount: formattedAttachments.length,
      message: `Successfully delivered to ${delivered} recipient(s) directly to their inbox${
        formattedAttachments.length > 0 ? ` with ${formattedAttachments.length} attachment(s)` : ''
      }.`,
    });
  } catch (err) {
    console.error('Collegiate mail dispatch error:', err);
    return res.status(500).json({
      success: false,
      message: err.message || 'SMTP communication failure.',
    });
  }
});

export default router;
