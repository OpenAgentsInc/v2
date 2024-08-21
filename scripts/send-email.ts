import { ConvexHttpClient } from "convex/browser"
import * as dotenv from "dotenv"
import { api } from "../convex/_generated/api.js"

dotenv.config({ path: ".env.local" });

const client = new ConvexHttpClient(process.env["CONVEX_URL"] as string);

client.query(api.users.getAllUsers).then(console.log);
