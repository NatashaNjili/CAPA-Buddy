const SENDER = "kmaqinana08@gmail.com";

export async function sendEmail(to: string[], subject: string, html: string) {
  const key = process.env["SENDGRID_API_KEY"];
  if (!key) {
    console.error("Missing SENDGRID_API_KEY");
    return { sent: false, reason: "missing_key" };
  }
  const res = await fetch("https://api.sendgrid.com/v3/mail/send", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${key}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      personalizations: to.map((email) => ({ to: [{ email }] })),
      from: { email: SENDER, name: "CAPA-Buddy" },
      subject,
      content: [{ type: "text/html", value: html }],
    }),
  });
  if (!res.ok) {
    const body = await res.text();
    console.error("SendGrid error", res.status, body);
    return { sent: false, reason: `sendgrid_${res.status}` };
  }
  return { sent: true };
}

export function emailShell(title: string, body: string) {
  return `<div style="font-family:Segoe UI,Arial,sans-serif;background:#f4f6fb;padding:24px">
    <div style="max-width:600px;margin:0 auto;background:#ffffff;border-radius:14px;overflow:hidden;border:1px solid #e3e8f3">
      <div style="background:#131c3a;color:#ffffff;padding:20px 24px;font-size:20px;font-weight:700">CAPA-Buddy</div>
      <div style="padding:24px;color:#1c2340;font-size:15px;line-height:1.6">
        <h2 style="margin-top:0;color:#131c3a">${title}</h2>
        ${body}
      </div>
    </div>
  </div>`;
}