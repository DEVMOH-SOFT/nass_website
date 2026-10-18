/**
 * NASS LASUSTECH Email & Communication Service
 * ─────────────────────────────────────────────────────────────────────────────
 * Direct integration with Node/Nodemailer backend for real inbox delivery.
 * Supports Gmail SMTP, App Password authentication, and broadcast communications.
 */

export interface EmailAttachment {
  filename: string;
  content: string; // base64 string or data URL
  contentType?: string;
  size?: number;
}

export interface MailPayload {
  to: string | string[];
  subject: string;
  studentName?: string;
  matricNumber?: string;
  body?: string;
  template?:
    | "dues_receipt"
    | "matric_update_reminder"
    | "admin_broadcast"
    | "general_notice"
    | "contact_notice"
    | "contact_ack";
  meta?: Record<string, any>;
  attachments?: EmailAttachment[];
}

export interface DispatchedMailLog {
  id: string;
  recipients: string[];
  recipientCount: number;
  subject: string;
  template?: string;
  targetGroup: string;
  sentAt: string;
  status: "Sent" | "Queued" | "Failed";
  error?: string;
}

export interface MailerConfigStatus {
  configured: boolean;
  host: string;
  port: number;
  user: string;
  rawUser?: string;
  fromName: string;
  fromEmail: string;
}

const STORAGE_KEY = "nass_dispatched_emails";
const SMTP_CACHE_KEY = "nass_admin_smtp_cache";

// Uses VITE_API_URL when set (production); otherwise the relative /api path that the Vite dev proxy forwards.
const MAILER_BASE = `${(import.meta.env.VITE_API_URL || "/api").replace(/\/$/, "")}/mailer`;

// Admin-only mailer calls carry the admin session token.
const mailerHeaders = (): Record<string, string> => {
  const headers: Record<string, string> = { "Content-Type": "application/json" };
  try {
    const token = localStorage.getItem("adminToken");
    if (token) headers.Authorization = `Bearer ${token}`;
  } catch {
    // storage unavailable
  }
  return headers;
};

/**
 * Returns list of previously dispatched admin emails
 */
export const getDispatchedEmails = (): DispatchedMailLog[] => {
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    return data ? JSON.parse(data) : [];
  } catch (e) {
    return [];
  }
};

/**
 * Logs a sent email into local storage history
 */
const logSentEmail = (log: DispatchedMailLog) => {
  try {
    const list = getDispatchedEmails();
    localStorage.setItem(STORAGE_KEY, JSON.stringify([log, ...list]));
    window.dispatchEvent(new Event("storage"));
  } catch (e) {
    console.error("Failed to log dispatched email:", e);
  }
};

/**
 * Fetch Mailer SMTP status from backend with resilient local cache fallback
 */
export const getMailerConfigApi = async (): Promise<MailerConfigStatus> => {
  let cached: MailerConfigStatus | null = null;
  try {
    const raw = localStorage.getItem(SMTP_CACHE_KEY);
    if (raw) cached = JSON.parse(raw);
  } catch {}

  try {
    const res = await fetch(`${MAILER_BASE}/config`, { headers: mailerHeaders() });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data: MailerConfigStatus = await res.json();
    try {
      localStorage.setItem(SMTP_CACHE_KEY, JSON.stringify(data));
    } catch {}
    return data;
  } catch (err: any) {
    if (cached) return cached;
    return {
      configured: false,
      host: "smtp.gmail.com",
      port: 587,
      user: "",
      fromName: "NASS LASUSTECH Secretariat",
      fromEmail: "",
    };
  }
};

/**
 * Update Mailer SMTP credentials on backend
 */
export const saveMailerConfigApi = async (config: {
  host?: string;
  port?: number;
  user: string;
  pass?: string;
  fromName?: string;
  fromEmail?: string;
}): Promise<{ success: boolean; message: string; configured?: boolean }> => {
  // Preserve entered credentials optimistically in local cache so form values are never lost
  try {
    const optimistic: MailerConfigStatus = {
      configured: Boolean(config.user && (config.pass || true)),
      host: config.host || "smtp.gmail.com",
      port: config.port || 587,
      user: config.user ? `${config.user.slice(0, 3)}***@${config.user.split('@')[1] || ''}` : '',
      rawUser: config.user,
      fromName: config.fromName || "Nigerian Association of Science Students (NASS LASUSTECH)",
      fromEmail: config.fromEmail || config.user,
    };
    localStorage.setItem(SMTP_CACHE_KEY, JSON.stringify(optimistic));
  } catch {}

  try {
    const res = await fetch(`${MAILER_BASE}/config`, {
      method: "POST",
      headers: mailerHeaders(),
      body: JSON.stringify(config),
    });

    const data = await res.json().catch(() => null);

    if (!res.ok || !data?.success) {
      const errMsg = data?.message || (res.status === 401
        ? "Admin authentication required. Please re-login to the Admin Portal."
        : `Server responded with error (${res.status}).`);
      return {
        success: false,
        message: errMsg,
      };
    }

    return {
      success: true,
      message: data.message || "Mailer settings updated successfully.",
      configured: data.configured ?? true,
    };
  } catch (err: any) {
    console.warn("Failed to reach backend mailer config endpoint:", err);
    return {
      success: false,
      message: `Cannot connect to backend at ${MAILER_BASE}. ${err.message || "Network request failed"}. Please ensure the backend server is running.`,
    };
  }
};

/**
 * Send instant test email to verify credentials directly
 */
export const sendTestEmailApi = async (targetEmail: string): Promise<{ success: boolean; message: string }> => {
  try {
    const res = await fetch(`${MAILER_BASE}/test`, {
      method: "POST",
      headers: mailerHeaders(),
      body: JSON.stringify({ targetEmail }),
    });
    const data = await res.json().catch(() => null);
    if (!res.ok || !data?.success) {
      const msg = data?.message || (res.status === 401
        ? "Admin authentication required. Please log in."
        : `Email delivery test failed (${res.status}).`);
      throw new Error(msg);
    }
    return data;
  } catch (err: any) {
    if (err.name === "TypeError" && err.message?.includes("fetch")) {
      throw new Error(`Cannot reach mailer server at ${MAILER_BASE}. Please verify that the backend application is started.`);
    }
    throw err;
  }
};

/**
 * Dispatches an email via backend endpoint directly into user inboxes
 */
export const sendCollegiateEmail = async (payload: MailPayload): Promise<{ success: boolean; message: string }> => {
  const recipients = Array.isArray(payload.to) ? payload.to : [payload.to];
  const cleanRecipients = recipients.filter(email => email && typeof email === "string" && email.includes("@"));

  if (cleanRecipients.length === 0) {
    return { success: false, message: "No valid email recipients provided." };
  }

  try {
    const response = await fetch(`${MAILER_BASE}/send`, {
      method: "POST",
      headers: mailerHeaders(),
      body: JSON.stringify({
        recipients: cleanRecipients,
        subject: payload.subject,
        student_name: payload.studentName,
        matric_number: payload.matricNumber,
        template: payload.template,
        body: payload.body,
        attachments: payload.attachments,
        meta: payload.meta,
      }),
    });

    const data = await response.json().catch(() => null);

    if (!response.ok || !data?.success) {
      const errMsg = data?.message || (response.status === 401 || response.status === 403
        ? "Admin authentication required. Please ensure you are logged into the Admin Portal."
        : `Email server returned error (${response.status})`);
      logSentEmail({
        id: `mail-${Date.now()}-${Math.floor(100 + Math.random() * 900)}`,
        recipients: cleanRecipients,
        recipientCount: cleanRecipients.length,
        subject: payload.subject,
        template: payload.template || "custom",
        targetGroup: payload.meta?.targetGroup || "Individual Scholar",
        sentAt: new Date().toISOString(),
        status: "Failed",
        error: errMsg,
      });
      throw new Error(errMsg);
    }

    logSentEmail({
      id: `mail-${Date.now()}-${Math.floor(100 + Math.random() * 900)}`,
      recipients: cleanRecipients,
      recipientCount: cleanRecipients.length,
      subject: payload.subject,
      template: payload.template || "custom",
      targetGroup: payload.meta?.targetGroup || "Individual Scholar",
      sentAt: new Date().toISOString(),
      status: "Sent",
    });

    return {
      success: true,
      message: data.message || `Dispatched successfully to ${cleanRecipients.length} recipient(s).`,
    };
  } catch (err: any) {
    console.error("Collegiate email dispatch error:", err);
    const friendlyMsg = (err.name === "TypeError" && err.message?.includes("fetch"))
      ? `Cannot reach backend mailer server at ${MAILER_BASE}. Please ensure the backend server is running and accessible.`
      : (err.message || "Failed to dispatch email broadcast.");

    logSentEmail({
      id: `mail-${Date.now()}-${Math.floor(100 + Math.random() * 900)}`,
      recipients: cleanRecipients,
      recipientCount: cleanRecipients.length,
      subject: payload.subject,
      template: payload.template || "custom",
      targetGroup: payload.meta?.targetGroup || "Individual Scholar",
      sentAt: new Date().toISOString(),
      status: "Failed",
      error: friendlyMsg,
    });
    throw new Error(friendlyMsg);
  }
};

/**
 * Dispatches an official dues payment receipt email to the student's Gmail
 */
export const sendDuesReceiptEmail = async (params: {
  to: string;
  studentName: string;
  matricNumber: string;
  amount: number;
  reference: string;
  department: string;
  level: string;
  isFresher?: boolean;
}) => {
  return sendCollegiateEmail({
    to: params.to,
    studentName: params.studentName,
    matricNumber: params.matricNumber,
    subject: `Official Receipt: NASS LASUSTECH Session Dues Clearance - Ref: ${params.reference}`,
    template: "dues_receipt",
    meta: {
      amount: params.amount,
      reference: params.reference,
      department: params.department,
      level: params.level,
      isFresher: params.isFresher,
      targetGroup: "Dues Payment Receipt",
    },
    body: `Dear ${params.studentName},

This is your official payment confirmation from the Nigerian Association of Science Students (NASS), College of Basic Sciences, LASUSTECH.

We confirm receipt of ₦${params.amount.toLocaleString()} for your 2025/2026 Statutory Session Dues.

Transaction Details:
• Student Name: ${params.studentName}
• Matric / Scholar ID: ${params.matricNumber}
• Department: ${params.department}
• Level: ${params.level}
• Reference: ${params.reference}
• Status: Cleared & Verified

${params.isFresher ? "Note for Freshers: Once your permanent LASUSTECH matriculation number is issued by the Academic Affairs Division, log into your portal to update your profile.\n" : ""}
You can download your verified digital receipt and print your official ID card anytime on your student portal.

Office of the Executive Treasurer,
DEVMOH-Led Administration, NASS LASUSTECH.`,
  });
};

/**
 * Dispatches a reminder email to freshers to update their matriculation number
 */
export const sendFreshersMatricReminderEmail = async (recipients: string[]) => {
  return sendCollegiateEmail({
    to: recipients,
    subject: "Action Required: Update Your Official LASUSTECH Matriculation Number",
    template: "matric_update_reminder",
    meta: {
      targetGroup: "Freshers (100L)",
    },
    body: `Dear Science Fresher,

The Academic Affairs Division is finalizing matriculation number allocations for newly admitted 100-Level undergraduates in the College of Basic Sciences.

If your permanent LASUSTECH matriculation number has been released:
1. Log in to the NASS Science Portal (https://nass-lasustech.edu.ng)
2. Go to your Dashboard Overview
3. Look for the "Freshers Matriculation Number Update" card
4. Enter and save your official matric number

This will immediately update your collegiate profile, dues clearance records, and digital ID card.

Best regards,
DEVMOH-Led Administration
Secretariat, NASS LASUSTECH`,
  });
};
