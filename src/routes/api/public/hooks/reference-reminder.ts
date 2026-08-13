import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/api/public/hooks/reference-reminder")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const apiKey = request.headers.get("apikey");
        if (!apiKey || apiKey !== process.env["SUPABASE_PUBLISHABLE_KEY"]) {
          return new Response("Unauthorized", { status: 401 });
        }
        const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
        const { sendEmail, emailShell } = await import("@/lib/email.server");

        const url = new URL(request.url);
        const baseUrl = `${url.protocol}//${url.host}`;
        const { data: admins } = await supabaseAdmin
          .from("admins")
          .select("name, email, access_token");

        for (const admin of admins ?? []) {
          await sendEmail(
            [admin.email],
            "CAPA-Buddy: time to review the reference document",
            emailShell(
              "Quick reminder",
              `<p>Hi ${admin.name},</p>
               <p>Please take a moment to check that the CAPA-Buddy reference document is still up to date. This is the document CAPA-Buddy searches when a candidate asks something outside the main topics.</p>
               <p><a href="${baseUrl}/admin/${admin.access_token}" style="display:inline-block;background:#131c3a;color:#fff;padding:12px 20px;border-radius:8px;text-decoration:none">Open the admin area</a></p>
               <p style="font-size:13px;color:#6b7391">Editing is optional — this is just a nudge. Your link is personal, please don't forward it.</p>`,
            ),
          );
        }
        return Response.json({ ok: true, sent: admins?.length ?? 0 });
      },
    },
  },
});