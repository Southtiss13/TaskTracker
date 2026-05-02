import { Resend } from "resend";

type SendVerificationEmailParams = {
  to: string;
  token: string;
};

function getVerificationUrl(token: string) {
  const appUrl = (process.env.APP_URL ?? "http://localhost:3000").replace(
    /\/$/,
    "",
  );

  return `${appUrl}/verify-email#token=${token}`;
}

export async function sendVerificationEmail({
  to,
  token,
}: SendVerificationEmailParams) {
  const verificationUrl = getVerificationUrl(token);
  const apiKey = process.env.RESEND_API_KEY;

  if (!apiKey) {
    if (process.env.NODE_ENV === "production") {
      throw new Error("RESEND_API_KEY is required in production.");
    }

    console.log("Email verification URL:", verificationUrl);
    return;
  }

  const resend = new Resend(apiKey);

  await resend.emails.send({
    from: process.env.EMAIL_FROM ?? "TaskTracker <onboarding@resend.dev>",
    to,
    subject: "Verify your TaskTracker email",
    html: `
      <!doctype html>
      <html>
        <body style="margin:0;background:#f7f3ff;padding:32px 16px;font-family:Arial,Helvetica,sans-serif;color:#00033d;">
          <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="max-width:560px;margin:0 auto;background:#ffffff;border:1px solid rgba(151,125,255,0.2);border-radius:28px;box-shadow:0 24px 70px rgba(6,0,171,0.12);overflow:hidden;">
            <tr>
              <td style="padding:34px 32px 30px;">
                <p style="margin:0 0 12px;font-size:12px;font-weight:700;letter-spacing:0.22em;text-transform:uppercase;color:rgba(6,0,171,0.62);">
                  TaskTracker
                </p>
                <h1 style="margin:0;font-size:30px;line-height:1.15;font-weight:700;color:#00033d;">
                  Verify your email
                </h1>
                <p style="margin:18px 0 0;font-size:16px;line-height:1.7;color:rgba(0,3,61,0.72);">
                  Welcome to TaskTracker. Please confirm this email address so you can log in and start managing your tasks.
                </p>
                <table role="presentation" cellspacing="0" cellpadding="0" style="margin:28px 0;">
                  <tr>
                    <td>
                      <a href="${verificationUrl}" style="display:inline-block;border-radius:18px;background:#0600ab;padding:14px 22px;font-size:15px;font-weight:700;color:#ffffff;text-decoration:none;box-shadow:0 18px 42px rgba(6,0,171,0.24);">
                        Verify email
                      </a>
                    </td>
                  </tr>
                </table>
                <p style="margin:0;font-size:14px;line-height:1.7;color:rgba(0,3,61,0.66);">
                  This link expires in 24 hours.
                </p>
                <p style="margin:14px 0 0;font-size:14px;line-height:1.7;color:rgba(0,3,61,0.66);">
                  If you did not create a TaskTracker account, you can ignore this email.
                </p>
              </td>
            </tr>
          </table>
        </body>
      </html>
    `,
    text: [
      "Welcome to TaskTracker.",
      "",
      "Please verify your email address by opening this link:",
      verificationUrl,
      "",
      "This link expires in 24 hours.",
      "If you did not create a TaskTracker account, you can ignore this email.",
    ].join("\n"),
  });
}
