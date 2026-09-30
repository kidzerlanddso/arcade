const { Resend } = require("resend");

let resendClient = null;

const getResendClient = () => {
  if (!resendClient && process.env.RESEND_API_KEY) {
    resendClient = new Resend(process.env.RESEND_API_KEY);
  }
  return resendClient;
};

const maskEmail = (email) => {
  const [name, domain] = String(email).split("@");
  if (!domain) return "[invalid email]";
  return `${name.slice(0, 2)}***@${domain}`;
};

const escapeHtml = (value) =>
  String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");

const sendMembershipRequestEmail = async ({ profile, pathway }) => {
  const resend = getResendClient();
  if (!resend) {
    throw new Error("RESEND_API_KEY is not configured.");
  }

  const fullName =
    `${profile.firstname || ""} ${profile.lastname || ""}`.trim();
  const pathwayDescription =
    pathway?.type === "studying"
      ? `Studying at ${pathway.institution} toward ${pathway.qualification} in ${pathway.field_of_study}.`
      : `Working at ${pathway.company} as ${pathway.job_title}.`;

  const recipients = profile.adminEmails || [];
  const from =
    process.env.RESEND_FROM_EMAIL || "Alumni Connect <onboarding@resend.dev>";

  console.log("[membership-email] Sending membership request email", {
    from,
    recipientCount: recipients.length,
    recipients: recipients.map(maskEmail),
  });

  const { data, error } = await resend.emails.send({
    from,
    to: recipients,
    subject: `New Alumni Connect membership request: ${fullName || profile.email}`,
    html: `
      <h2>New Alumni Connect membership request</h2>
      <p>A new alumni registration has been submitted and is waiting for approval.</p>
      <p><strong>Name:</strong> ${escapeHtml(fullName || "Not provided")}</p>
      <p><strong>Email:</strong> ${escapeHtml(profile.email)}</p>
      <p><strong>Batch of:</strong> ${escapeHtml(profile.year || "Not provided")}</p>
      <p><strong>Student Id:</strong> ${escapeHtml(profile.student_id || "Not provided")}</p>
      <p><strong>Current situation:</strong> ${escapeHtml(pathwayDescription)}</p>
      <p>Please sign in to Alumni Connect to review this membership request.</p>
    `,
  });

  if (error) {
    console.error("[membership-email] Resend rejected the email", error);
    throw new Error(error.message || "Resend rejected the email.");
  }

  console.log("[membership-email] Resend accepted the email", {
    messageId: data?.id || null,
  });

  return data;
};

const sendTemporaryPasswordEmail = async ({ email, temporaryPassword }) => {
  const resend = getResendClient();
  if (!resend) {
    throw new Error("RESEND_API_KEY is not configured.");
  }

  const from =
    process.env.RESEND_FROM_EMAIL || "Alumni Connect <onboarding@resend.dev>";
  const { data, error } = await resend.emails.send({
    from,
    to: [email],
    subject: "Your Alumni Connect temporary password",
    text: `Your temporary Alumni Connect password is: ${temporaryPassword}\n\nSign in with this password, then use the Reset Password option in your account menu to choose a new password. If you did not initiate this request, contact the RSHS AlumniConnect administrator.`,
    html: `
      <h2>Your temporary Alumni Connect password</h2>
      <p>Use this temporary password to sign in:</p>
      <p style="font-size: 20px; font-weight: bold; letter-spacing: 1px;">${escapeHtml(temporaryPassword)}</p>
      <p>After signing in, use <strong>Reset Password</strong> in your account menu to choose a new password.</p>
      <p>If you did not request this, contact the school administrator.</p>
    `,
  });

  if (error) {
    console.error("[password-reset-email] Resend rejected the email", error);
    throw new Error(error.message || "Resend rejected the email.");
  }

  console.log("[password-reset-email] Resend accepted the email", {
    messageId: data?.id || null,
  });
  return data;
};

const isMembershipEmailConfigured = () => Boolean(process.env.RESEND_API_KEY);

module.exports = {
  sendMembershipRequestEmail,
  sendTemporaryPasswordEmail,
  isMembershipEmailConfigured,
};
