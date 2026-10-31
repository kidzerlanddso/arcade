const dbPassword = process.env.DB_PASSWORD;
const dbHost = process.env.DB_HOST || "localhost";

if (typeof dbPassword !== "string" || dbPassword.length === 0) {
  throw new Error(
    "DB_PASSWORD is missing. Set it in serverside/.env before starting the server.",
  );
}

if (/^https?:\/\//i.test(dbHost)) {
  throw new Error(
    "DB_HOST must be a database hostname, without https:// or a path. For Supabase, use the Database host from Connect.",
  );
}

module.exports = {
  HOST: "aws-0-ap-southeast-1.pooler.supabase.com",
  PORT: 5432,
  USER: "postgres.bkzpbqbnjsxcmhkrslmj",
  PASSWORD: "R!du@2023!!",
  DB: "postgres",
  SSL: "true",
  JWT_SECRET: "my_JWT_secret_key_COMPX_596",
  REFRESH_SECRET: "our_jwt_refresh_secret_CSMAX_kl_invoicing_platform",
};
