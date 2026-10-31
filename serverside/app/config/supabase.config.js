const PROJECT_REF = "bkzpbqbnjsxcmhkrslmj";

module.exports = {
  url: process.env.SUPABASE_URL || `https://${PROJECT_REF}.supabase.co`,
  secretKey:
    process.env.SUPABASE_SECRET_KEY ||
    process.env.SUPABASE_SERVICE_ROLE_KEY ||
    "",
};
