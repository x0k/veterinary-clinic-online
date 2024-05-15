import { createEnv } from "@t3-oss/env-nextjs";
import { z } from "zod";
 
export const env = createEnv({
  server: {
    PRODUCTION_CALENDAR_URL: z.string().url(),
    CALENDAR_REVALIDATE_INTERVAL: z.coerce.number().default(7 * 24 * 60 * 60),
    SERVICES_REVALIDATE_INTERVAL: z.coerce.number().default(24 * 60 * 60),
    NOTION_CLIENT_SECRET: z.string(),
    NOTION_SERVICES_PAGE_ID: z.string(),
    NOTION_RECORDS_PAGE_ID: z.string(),
    NOTION_BREAKS_PAGE_ID: z.string(),
    NOTION_CUSTOMERS_PAGE_ID: z.string(),
    NOTION_INFO_PAGE_ID: z.string(),
    NOTION_PRIVACY_POLICY_PAGE_ID: z.string(),
    AUTH_SECRET: z.string(),
    VK_CLIENT_SECRET: z.string(),
    GOOGLE_CLIENT_SECRET: z.string(),
  },
  // For Next.js >= 13.4.4, you only need to destructure client variables:
  experimental__runtimeEnv: {}
});
