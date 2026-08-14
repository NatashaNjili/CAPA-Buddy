import { sendEmail, emailShell } from "./email.server";

export const ROLE_DESCRIPTIONS: Record<string, string> = {
  "IT Support":
    "hardware failures, login/password resets, software install or troubleshooting, Wi-Fi and network issues",
  "Team Development Coach":
    "personal or emotional support, attendance concerns, feeling unsupported, career development, general well-being",
  "Digital Tech Mentor":
    "assessment help, guidance on systems/apps being built, code reviews, technical mentorship",
  HR: "contracts, employment agreements, personnel documents, administrative HR matters",
};

export type AdminRow = {
  id: string;
  name: string;
  email: string;
  role: string;
  access_token: string;
};

// Emails must always link to a publicly reachable URL. The worker request URL can be
// an internal/localhost host, which produces dead links in emails.
export const PUBLIC_BASE_URL = "https://capa-buddy-ask.lovable.app";

export function baseUrlFromRequest(request: Request) {
  try {
    const url = new URL(request.url);
    const host = request.headers.get("x-forwarded-host") ?? url.host;
    if (!host || host.includes("localhost") || host.startsWith("127.") || host.includes("::1")) {
      return PUBLIC_BASE_URL;
    }
    return `https://${host}`;
  } catch {
    return PUBLIC_BASE_URL;
  }
}

export async function notifyAdminsOfSuggestion(
  admins: AdminRow[],
  question: string,
  approvalToken: string,
  baseUrl: string,
) {
  for (const admin of admins) {
    const link = `${baseUrl}/approve/${approvalToken}?a=${admin.access_token}`;
    await sendEmail(
      [admin.email],
      "CAPA-Buddy: a question needs an answer",
      emailShell(
        "A question keeps coming up",
        `<p>Hi ${admin.name},</p>
         <p>Candidates have asked this question several times and CAPA-Buddy has no approved answer for it yet:</p>
         <blockquote style="border-left:4px solid #e8623c;margin:16px 0;padding:8px 16px;background:#f7f9ff">${escapeHtml(question)}</blockquote>
         <p>Open the link below, enter your personal PIN, and add the answer. Whoever answers first closes it for everyone.</p>
         <p><a href="${link}" style="display:inline-block;background:#131c3a;color:#fff;padding:12px 20px;border-radius:8px;text-decoration:none">Review &amp; answer this question</a></p>
         <p style="font-size:13px;color:#6b7391">This link is personal to you — please don't forward it.</p>`,
      ),
    );
  }
}

export function escapeHtml(text: string) {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}