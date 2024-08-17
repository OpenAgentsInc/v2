# Sharing and Referrals

On the Chats pane, the ChatsActions component includes a button to share a chat.

The button pops up a modal window explaining that there's a share link that will let the public access current and future messages in that chat thread. That modal also includes a button to share on twitter, and a button to copy the share link to the clipboard, and a message like "Anyone who signs up after clicking your link will give you $5 of credit."

The share link is `https://openagents.com/share/{threadId}?ref={userId}`

## Referral System

When a user shares a chat, their user ID is included in the share link as a referral parameter. When a new user signs up through this shared link, the referrer's ID is stored in the new user's record.

### Implementation Details

1. The user schema has been updated to include an optional `referrer_id` field.

2. The `createOrGetUser` function in `convex/users/createOrGetUser.ts` now accepts an optional `referrer_id` parameter. If provided, it's stored in the new user's record.

3. When a new user signs up through a referral link, the referrer receives 500 credits ($5 worth) as a reward.

4. The `handleCopyShareLink` and `handleShareTwitter` functions in `panes/chats/useChatActions.ts` have been updated to include the current user's ID in the share link.

### Workflow

1. User A shares a chat link.
2. The share link includes User A's ID as a referral parameter.
3. User B clicks the link and signs up.
4. During User B's signup process, User A's ID is stored as the referrer.
5. User A receives 500 credits as a referral bonus.

This system incentivizes users to share their chats and grow the platform's user base while rewarding them for successful referrals.

## Recent Changes

- Added `referrer_id` field to the user schema
- Updated `createOrGetUser` function to handle referrals
- Modified share link generation to include referrer ID
- Implemented referral bonus system (500 credits per successful referral)