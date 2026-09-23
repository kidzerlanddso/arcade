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

async function uploadToBucket(bucket, filePath, buffer, contentType) {
  // Sharp/Node 22 can hand back a Buffer backed by SharedArrayBuffer,
  // which undici/fetch rejects during Supabase Storage uploads.
  const uploadBuffer = Buffer.isBuffer(buffer)
    ? Buffer.from(buffer)
    : Buffer.from(buffer || []);

  if (!config.secretKey) {
    const uploadDir = path.join(__dirname, "..", "..", "uploads");
    const targetPath = path.join(uploadDir, filePath.replace(/\//g, path.sep));

    fs.mkdirSync(path.dirname(targetPath), { recursive: true });
    fs.writeFileSync(targetPath, uploadBuffer);

    const baseUrl = process.env.APP_BASE_URL || "http://localhost:3001";
    return `${baseUrl}/uploads/${filePath.replace(/\\/g, "/")}`;
  }

  const supabase = getSupabaseClient();

  const { error } = await supabase.storage.from(bucket).upload(filePath, uploadBuffer, {
    contentType,
    upsert: true,
    cacheControl: "3600",
  });

  if (error) {
    throw error;
  }

  const { data } = supabase.storage.from(bucket).getPublicUrl(filePath);
  return data.publicUrl;
}

const uploadProfileImage = (filePath, buffer, contentType) =>
  uploadToBucket(config.bucket, filePath, buffer, contentType);

const uploadTeacherAvatar = (filePath, buffer, contentType) =>
  uploadToBucket(config.teacherAvatarBucket, filePath, buffer, contentType);

module.exports = {
  uploadProfileImage,
  uploadTeacherAvatar,
};
