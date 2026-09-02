const fs = require("fs");
const path = require("path");
const { createClient } = require("@supabase/supabase-js");
const config = require("../config/supabase.config");

let supabaseClient = null;

function getSupabaseClient() {
  if (!config.secretKey) {
    throw new Error(
      "SUPABASE_SECRET_KEY is not configured. Add it to serverside/.env."
    );
  }

  if (!supabaseClient) {
    supabaseClient = createClient(config.url, config.secretKey, {
      auth: {
        persistSession: false,
        autoRefreshToken: false,
      },
    });
  }

  return supabaseClient;
}

async function uploadProfileImage(filePath, buffer, contentType) {
  if (!config.secretKey) {
    const uploadDir = path.join(__dirname, "..", "..", "uploads");
    const targetPath = path.join(uploadDir, filePath.replace(/\//g, path.sep));

    fs.mkdirSync(path.dirname(targetPath), { recursive: true });
    fs.writeFileSync(targetPath, buffer);

    const baseUrl = process.env.APP_BASE_URL || "http://localhost:3001";
    return `${baseUrl}/uploads/${filePath.replace(/\\/g, "/")}`;
  }

  const supabase = getSupabaseClient();

  const { error } = await supabase.storage.from(config.bucket).upload(filePath, buffer, {
    contentType,
    upsert: true,
    cacheControl: "3600",
  });

  if (error) {
    throw error;
  }

  const { data } = supabase.storage.from(config.bucket).getPublicUrl(filePath);
  return data.publicUrl;
}

module.exports = {
  uploadProfileImage,
};
