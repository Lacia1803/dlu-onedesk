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
    return { success: false, error: (e as any).message };
  }
}
