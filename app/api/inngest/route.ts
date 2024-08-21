import { serve } from "inngest/next"
import { helloWorld, processMessage } from "@/inngest/functions"
import { inngest } from "../../../inngest/client"

// Create an API that serves our functions
export const { GET, POST, PUT } = serve({
  client: inngest,
  functions: [
    helloWorld,
    processMessage
  ],
});