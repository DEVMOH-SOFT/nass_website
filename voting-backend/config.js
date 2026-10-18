import dotenv from "dotenv";

// Load environment variables for the voting application
dotenv.config();

export const config = {
  port: Number.parseInt(process.env.PORT || "5050", 10),
  nodeEnv: process.env.NODE_ENV || "development",
  frontendUrl: process.env.FRONTEND_URL || "http://localhost:8080",
  webhookBaseUrl: process.env.VOTING_WEBHOOK_BASE_URL || `http://localhost:${process.env.PORT || "5050"}`,
  db: {
    host: process.env.DB_HOST || "127.0.0.1",
    port: Number.parseInt(process.env.DB_PORT || "3306", 10),
    database: process.env.DB_NAME || "nacos_awards",
    user: process.env.DB_USER || "root",
    password: process.env.DB_PASSWORD || "",
  },
  korapay: {
    publicKey: (process.env.KORAPAY_MODE === "test" || process.env.KORAPAY_SECRET_KEY?.startsWith("sk_test_"))
      ? (process.env.KORAPAY_TEST_PUBLIC_KEY || process.env.KORAPAY_PUBLIC_KEY || "")
      : (process.env.KORAPAY_PUBLIC_KEY || process.env.KORAPAY_TEST_PUBLIC_KEY || ""),
    secretKey: (process.env.KORAPAY_MODE === "test" || process.env.KORAPAY_SECRET_KEY?.startsWith("sk_test_"))
      ? (process.env.KORAPAY_TEST_SECRET_KEY || process.env.KORAPAY_SECRET_KEY || "")
      : (process.env.KORAPAY_SECRET_KEY || process.env.KORAPAY_TEST_SECRET_KEY || ""),
    baseUrl: process.env.KORAPAY_BASE_URL || "https://api.korapay.com/merchant/api/v1",
  },
  admin: {
    username: process.env.ADMIN_USERNAME || "admin",
    password: process.env.ADMIN_PASSWORD || "admin123",
    displayName: process.env.ADMIN_DISPLAY_NAME || "NACOS Admin",
    jwtSecret: process.env.JWT_SECRET || "nacos_secret_2025",
  },
  voting: {
    eventName: process.env.VOTING_EVENT_NAME || "NACOS Awards",
    eventEdition: process.env.VOTING_EVENT_EDITION || "2026",
    awardsDate: process.env.VOTING_AWARDS_DATE || "2026-06-17T18:00:00+01:00",
    closesAt: process.env.VOTING_CLOSES_AT || "2026-06-07T23:59:59+01:00",
    votePrice: Number.parseInt(process.env.VOTE_PRICE || "100", 10),
    currency: process.env.VOTE_CURRENCY || "NGN",
  },
};
