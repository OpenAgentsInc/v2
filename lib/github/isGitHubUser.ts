import { User } from "@clerk/nextjs/server";

export function isGitHubUser(user: User) {
    return user.externalAccounts.some(account => account.provider === 'oauth_github');
}
