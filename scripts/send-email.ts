import { ConvexHttpClient } from "convex/browser";
import * as dotenv from "dotenv";
import { api } from "../convex/_generated/api.js";
import { Resend } from "resend";
import OpenAgentsEmail from "../emails/superpower";

dotenv.config({ path: ".env.local" });
// dotenv.config({ path: ".env.production" });

const url = process.env["NEXT_PUBLIC_CONVEX_URL"] as string;
if (!url) {
  throw new Error("NEXT_PUBLIC_CONVEX_URL is not defined");
}

const resendApiKey = process.env["RESEND_API_KEY"] as string;
if (!resendApiKey) {
  throw new Error("RESEND_API_KEY is not defined");
}

const client = new ConvexHttpClient(url);
const resend = new Resend(resendApiKey);

const excludedEmails = ["thewildhustle@proton.me", "chris@arcadelabs.co"];

function sleep(ms: number) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function sendEmails() {
  try {
    const users = await client.query(api.users.getAllUsers.getAllUsers);

    for (const user of users) {
      if (!user.email || user.email === "" || user.email.length < 3 || excludedEmails.includes(user.email)) continue;

      try {
        const data = await resend.emails.send({
          from: "Chris from OpenAgents <chris@openagents.com>",
          to: user.email,
          subject: "What AI agent can we build for you?",
          react: OpenAgentsEmail({ balance: user.credits }),
        });

        console.log(`Email sent successfully to ${user.email}. ID: ${data.id}`);
        
        // Add a delay of 0.6 seconds (to stay under the 2 requests per second limit)
        await sleep(600);
      } catch (error) {
        console.error(`Failed to send email to ${user.email}:`, error);
        
        // If we hit the rate limit, wait for 5 seconds before continuing
        if (error.statusCode === 429) {
          console.log("Rate limit hit. Waiting for 5 seconds...");
          await sleep(5000);
        }
      }
    }
  } catch (error) {
    console.error("Failed to fetch users or send emails:", error);
  }
}

sendEmails();