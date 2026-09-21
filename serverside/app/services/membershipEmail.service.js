const { Resend } = require("resend");

const resend = new Resend("re_N9JtaMBF_Dib35zQvqQExL75vPTGaY6rQ");

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

const isMembershipEmailConfigured = () => Boolean(resend);

module.exports = {
  sendMembershipRequestEmail,
  isMembershipEmailConfigured,
};
