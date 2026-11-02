import dotenv from "dotenv";

dotenv.config({ path: new URL("../../.env", import.meta.url) });

if (!process.env.DB_URL) {
  throw new Error("DB uri not found!");
}

if (!process.env.PORT) {
  throw new Error("PORT address not found!");
}

if (!process.env.GOOGLE_CLIENT_ID) {
  throw new Error("Google client id is not found!");
}

if (!process.env.GOOGLE_CLIENT_SECRET) {
  throw new Error("Google client secret is not found!");
}

if (!process.env.GOOGLE_REFRESH_TOKEN) {
  throw new Error("Google Refresh token not found!");
}

if (!process.env.GOOGLE_USER) {
  throw new Error("Google use is not found!");
}


const config = {
  MONGODB_URI: process.env.DB_URL,
  PORT: process.env.PORT,
  JWT_KEY: process.env.JWT_KEY,
  SALT: Number(process.env.SALT),
  GOOGLE_CLIENT_ID: process.env.GOOGLE_CLIENT_ID,
  GOOGLE_CLIENT_SECRET: process.env.GOOGLE_CLIENT_SECRET,
  GOOGLE_REFRESH_TOKEN: process.env.GOOGLE_REFRESH_TOKEN,
  GOOGLE_USER: process.env.GOOGLE_USER
}

export default config;