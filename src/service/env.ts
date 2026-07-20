import dotenv from "dotenv";

dotenv.config();

function getEnv(key: string, fallback?: string): string {
  const value = process.env[key];
  if (value === undefined) {
    if (fallback !== undefined) return fallback;
    throw new Error(`Missing required env variable: ${key}`);
  }
  return value;
}

export const Env = {
  port: Number(getEnv("PORT", "7001")),
  gTimeout: Number(getEnv("GRPC_TIMEOUT", "10000")),
  frontendUrl: getEnv("FRONTEND_URL", "http://localhost:7010"),
  databseUrl: getEnv(
    "DATABASE_URL",
    "mongodb://root:example@127.0.0.1/altverse",
  ),
  devMode: getEnv("DEV_MODE", "true") == "true",
  registerToken: getEnv("REGISTER_TOKEN", "9a506d6c192035582d7e53854a16eeb1"),
  cookieSecret: getEnv("COOKIE_SECRET", "Some secret"),
  serviceCert: getEnv("SERVICE_CERT", "service.pem"),
  serviceKey: getEnv("SERVICE_KEY", "service-key.pem"),
  caCert: getEnv("CA_CERT", "ca.pem"),
};
