import { clerkClient, User } from "@clerk/nextjs/server";

export function isGitHubUser(user: User) {
    return user.externalAccounts.some(account => account.provider === 'oauth_github');
}

export async function getGitHubToken(user: User) {
    const tokenResponse = await clerkClient().users.getUserOauthAccessToken(user.id, 'oauth_github');
    if (tokenResponse.data.length > 0) {
        return tokenResponse.data[0].token;
    } else {
        console.log("No GitHub token found for user:", user.id);
        return undefined;
    }
}



