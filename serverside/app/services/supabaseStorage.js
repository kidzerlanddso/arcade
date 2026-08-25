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
