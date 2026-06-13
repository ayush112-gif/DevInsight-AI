import dotenv from "dotenv";

dotenv.config({ quiet: true });

const parsePort = (value: string | undefined): number => {
  if (!value) {
    return 5000;
  }

  const port = Number(value);

  if (!Number.isInteger(port) || port <= 0 || port > 65535) {
    throw new Error("PORT must be a valid TCP port between 1 and 65535");
  }

  return port;
};

export const env = {
  nodeEnv: process.env.NODE_ENV ?? "development",
  port: parsePort(process.env.PORT),
  openRouterApiKey: process.env.OPENROUTER_API_KEY ?? "",
};