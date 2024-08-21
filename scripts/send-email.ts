import { ConvexHttpClient } from "convex/browser"
import * as dotenv from "dotenv"
import fs from "fs"
import { Resend } from "resend"
import { api } from "../convex/_generated/api.js"
import OpenAgentsEmail from "../emails/superpower"

dotenv.config({ path: ".env.production" });

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

const excludedEmails = [
  "thewildhustle@proton.me",
  "chris@arcadelabs.co",
  "aquarianprojectmgmt@gmail.com",
  "chris+1@openagents.com",
  "shomasoccer71@gmail.com",
  "cypherperro@protonmail.com",
  "st.mytchyk@gmail.com",
  "datadelaurier@gmail.com",
  "bob.tomazic@yahoo.com",
  "john@blockrewards.ca"
];

function sleep(ms: number) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function sendEmails() {
  try {
    const users = await client.query(api.users.getAllUsers.getAllUsers);
    const existingEmails = new Set(users.map(user => user.email));

    // Read and parse the JSON file
    const jsonData = JSON.parse(fs.readFileSync('emails/usersemails.json', 'utf-8'));
    const newEmails = jsonData
      .map((item: { email: string }) => item.email)
      .filter((email: string) =>
        email &&
        email.length >= 3 &&
        !existingEmails.has(email) &&
        !excludedEmails.includes(email) &&
        !email.endsWith('@notanemail.com')
      );

    console.log(`Found ${newEmails.length} new emails to send to.`);

    for (const email of newEmails) {
      try {
        const data = await resend.emails.send({
          from: "Chris from OpenAgents <chris@openagents.com>",
          to: email,
          subject: "What AI agent can we build for you?",
          react: OpenAgentsEmail({ balance: 0 }), // New users start with 0 credits
        });

        console.log(`Email sent successfully to ${email}.`, data);
        await sleep(2000);
      } catch (error) {
        console.error(`Failed to send email to ${email}:`, error);
      }
    }

    console.log(`Finished sending emails. Total sent: ${newEmails.length}`);
  } catch (error) {
    console.error("Failed to fetch users or send emails:", error);
  }
}

sendEmails();
