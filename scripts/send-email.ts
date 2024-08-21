import { ConvexHttpClient } from "convex/browser"
import * as dotenv from "dotenv"
import { api } from "../convex/_generated/api.js"

dotenv.config({ path: ".env.local" });
// dotenv.config({ path: ".env.production" });

const url = process.env["NEXT_PUBLIC_CONVEX_URL"] as string
if (!url) {
  throw new Error("NEXT_PUBLIC_CONVEX_URL is not defined")
}

const client = new ConvexHttpClient(url);

client.query(api.users.getAllUsers.getAllUsers).then(users => {

  users.forEach(user => {
    if (!user.email || user.email === "" || user.email.length < 3) return
    console.log(user.email);
  });

});
