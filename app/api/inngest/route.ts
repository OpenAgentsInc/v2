import { serve } from "inngest/next"
import { inngest } from "@/inngest/client"
import { processMessage } from "@/inngest/functions"

// Create an API that serves our functions
export const { GET, POST, PUT } = serve({
  client: inngest,
  functions: [
    processMessage
  ],
});
