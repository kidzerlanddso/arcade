/**
 * Stub for membership notification emails.
 * Replace with the real Resend-backed implementation when available.
 */
function isMembershipEmailConfigured() {
  return Boolean(process.env.RESEND_API_KEY);
}

async function sendMembershipRequestEmail({ profile } = {}) {
  console.warn(
    "[membership-email] Stub service in use; email was not sent.",
    profile?.username ? { username: profile.username } : {},
  );
  return { id: null, stub: true };
}

module.exports = {
  isMembershipEmailConfigured,
  sendMembershipRequestEmail,
};
