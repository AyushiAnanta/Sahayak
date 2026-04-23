import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

//  Email templates per notification type
const getEmailTemplate = (notification_type, message, grievanceId, district) => {
  const typeConfig = {
    Initiated: {
      subject: "✅ Grievance Submitted Successfully — Sahayak",
      color: "#4ade80",
      icon: "✅",
      heading: "Grievance Submitted",
    },
    "Under Process": {
      subject: "🔄 Your Grievance is Being Processed — Sahayak",
      color: "#60a5fa",
      icon: "🔄",
      heading: "Under Process",
    },
    Completed: {
      subject: "🎉 Your Grievance Has Been Resolved — Sahayak",
      color: "#4ade80",
      icon: "🎉",
      heading: "Grievance Resolved",
    },
    Dropped: {
      subject: "❌ Your Grievance Was Rejected — Sahayak",
      color: "#f87171",
      icon: "❌",
      heading: "Grievance Rejected",
    },
    Update: {
      subject: "📋 Grievance Status Update — Sahayak",
      color: "#c4a882",
      icon: "📋",
      heading: "Status Update",
    },
  };

  const config = typeConfig[notification_type] || typeConfig.Update;

  return {
    subject: config.subject,
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      </head>
      <body style="margin:0;padding:0;background:#f4f4f5;font-family:'Segoe UI',Arial,sans-serif;">
        <table width="100%" cellpadding="0" cellspacing="0" style="background:#f4f4f5;padding:40px 0;">
          <tr>
            <td align="center">
              <table width="600" cellpadding="0" cellspacing="0" style="background:#1f1f23;border-radius:16px;overflow:hidden;max-width:600px;width:100%;">

                <!-- HEADER -->
                <tr>
                  <td style="background:#2a2a2f;padding:24px 32px;border-bottom:2px solid ${config.color};">
                    <h1 style="margin:0;color:#e8d4a2;font-size:24px;font-weight:700;">Sahayak</h1>
                    <p style="margin:4px 0 0;color:#9ca3af;font-size:13px;">Citizen Grievance Portal</p>
                  </td>
                </tr>

                <!-- BODY -->
                <tr>
                  <td style="padding:32px;">

                    <!-- STATUS BADGE -->
                    <div style="text-align:center;margin-bottom:24px;">
                      <span style="font-size:48px;">${config.icon}</span>
                      <h2 style="margin:12px 0 0;color:#ffffff;font-size:22px;">${config.heading}</h2>
                    </div>

                    <!-- MESSAGE BOX -->
                    <div style="background:#2a2a2f;border-left:4px solid ${config.color};border-radius:8px;padding:16px 20px;margin-bottom:24px;">
                      <p style="margin:0;color:#e5e7eb;font-size:15px;line-height:1.6;">${message}</p>
                    </div>

                    <!-- GRIEVANCE DETAILS -->
                    <table width="100%" cellpadding="0" cellspacing="0" style="background:#2a2a2f;border-radius:8px;overflow:hidden;margin-bottom:24px;">
                      <tr>
                        <td style="padding:12px 16px;border-bottom:1px solid #374151;">
                          <span style="color:#9ca3af;font-size:12px;">GRIEVANCE ID</span><br/>
                          <span style="color:#e5e7eb;font-size:14px;font-family:monospace;">${grievanceId}</span>
                        </td>
                      </tr>
                      ${district ? `
                      <tr>
                        <td style="padding:12px 16px;">
                          <span style="color:#9ca3af;font-size:12px;">DISTRICT</span><br/>
                          <span style="color:#e5e7eb;font-size:14px;text-transform:capitalize;">${district}</span>
                        </td>
                      </tr>` : ""}
                    </table>

                    <p style="color:#6b7280;font-size:13px;text-align:center;margin:0;">
                      This is an automated notification from Sahayak Grievance Portal.<br/>
                      Please do not reply to this email.
                    </p>
                  </td>
                </tr>

                <!-- FOOTER -->
                <tr>
                  <td style="background:#2a2a2f;padding:16px 32px;text-align:center;">
                    <p style="margin:0;color:#4b5563;font-size:12px;">© 2025 Sahayak · Citizen Grievance Portal</p>
                  </td>
                </tr>

              </table>
            </td>
          </tr>
        </table>
      </body>
      </html>
    `,
  };
};

//  Main send function 
export const sendEmailNotification = async ({
  toEmail,
  toName,
  message,
  notification_type,
  grievanceId,
  district,
}) => {
  if (!toEmail) {
    console.warn("[email] No email address provided — skipping");
    return;
  }

  const { subject, html } = getEmailTemplate(
    notification_type,
    message,
    grievanceId,
    district
  );

  try {
    const info = await transporter.sendMail({
      from: `"Sahayak Portal" <${process.env.EMAIL_USER}>`,
      to: `"${toName || "Citizen"}" <${toEmail}>`,
      subject,
      html,
    });

    console.log(`[email] Sent to ${toEmail} | MessageId: ${info.messageId}`);
    return info;
  } catch (err) {
    console.error(`[email] Failed to send to ${toEmail}:`, err.message);
  }
};