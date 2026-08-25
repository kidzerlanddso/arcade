const PROJECT_REF = "qfnpgierpdjdwhmxfaho";

module.exports = {
  url: process.env.SUPABASE_URL || `https://${PROJECT_REF}.supabase.co`,
  secretKey:
    process.env.SUPABASE_SECRET_KEY ||
    process.env.SUPABASE_SERVICE_ROLE_KEY ||
    "",
  bucket: process.env.SUPABASE_STORAGE_BUCKET || "profile-images",
};
