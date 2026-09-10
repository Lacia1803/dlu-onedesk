import nodemailer from "nodemailer";

export async function sendSlack(text: string) {
  const webhookUrl = process.env.SLACK_WEBHOOK_URL;
  if (!webhookUrl) return { success: false, error: "SLACK_WEBHOOK_URL not set" };

  try {
    const res = await fetch(webhookUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ text }),
    });
    if (!res.ok) {
      const body = await res.text();
      return { success: false, error: `Slack webhook error ${res.status}: ${body}` };
    }
    return { success: true };
  } catch (e) {
    return { success: false, error: (e instanceof Error ? e.message : String(e)) };
  }
}

async function sendAlertEmail(subject: string, text: string) {
  if (!process.env.SMTP_HOST || !process.env.ALERT_EMAIL_TO) {
    return { success: false, error: "SMTP_HOST/ALERT_EMAIL_TO not set" };
  }
  try {
    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: Number(process.env.SMTP_PORT ?? 587),
      secure: Number(process.env.SMTP_PORT) === 465,
      auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS },
    });
    await transporter.sendMail({
      from: process.env.SMTP_FROM || "no-reply@dlu.edu.vn",
      to: process.env.ALERT_EMAIL_TO,
      subject,
      text,
    });
    return { success: true };
  } catch (e) {
    return { success: false, error: (e instanceof Error ? e.message : String(e)) };
  }
}

/**
 * Gửi cảnh báo vận hành: ưu tiên Slack, fallback sang email (ALERT_EMAIL_TO).
 * Trả về { channel } để caller log nếu cần.
 */
export async function sendAlert(subject: string, text: string) {
  const slack = await sendSlack(text);
  if (slack.success) return { success: true, channel: "slack" as const };

  const email = await sendAlertEmail(subject, text);
  if (email.success) return { success: true, channel: "email" as const };

  // ponytail: im lặng fail — nâng cấp thành audit log khi cần trace cảnh báo bị mất
  return { success: false, channel: "none" as const };
}
