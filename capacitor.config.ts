import type { CapacitorConfig } from "@capacitor/cli";
import { config as dotenvConfig } from "dotenv";

dotenvConfig();

const serverUrl = process.env.NEXT_PUBLIC_BASE_URL;
const isDebug = process.env.NEXT_PUBLIC_DEBUG === "true";

const config: CapacitorConfig = {
  appId: "br.ufjf.pracas",
  appName: "Projeto Praças",
  webDir: "out",
  server:
    isDebug ?
      {
        url: serverUrl,
        cleartext: true,
      }
    : undefined,
};

export default config;
