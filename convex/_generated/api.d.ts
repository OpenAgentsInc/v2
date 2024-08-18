/* eslint-disable */
/**
 * Generated `api` utility.
 *
 * THIS CODE IS AUTOMATICALLY GENERATED.
 *
 * Generated by convex@1.14.0.
 * To regenerate, run `npx convex dev`.
 * @module
 */

import type {
  ApiFromModules,
  FilterApi,
  FunctionReference,
} from "convex/server";
import type * as documents from "../documents.js";
import type * as messages_fetchThreadMessages from "../messages/fetchThreadMessages.js";
import type * as messages_getChatById from "../messages/getChatById.js";
import type * as messages_getLastMessage from "../messages/getLastMessage.js";
import type * as messages_index from "../messages/index.js";
import type * as messages_saveChatMessage from "../messages/saveChatMessage.js";
import type * as swebench from "../swebench.js";
import type * as threads_createNewThread from "../threads/createNewThread.js";
import type * as threads_createOrGetUser from "../threads/createOrGetUser.js";
import type * as threads_deleteThread from "../threads/deleteThread.js";
import type * as threads_generateTitle from "../threads/generateTitle.js";
import type * as threads_getLastEmptyThread from "../threads/getLastEmptyThread.js";
import type * as threads_getSharedThread from "../threads/getSharedThread.js";
import type * as threads_getThreadByClerkId from "../threads/getThreadByClerkId.js";
import type * as threads_getThreadMessageCount from "../threads/getThreadMessageCount.js";
import type * as threads_getThreadMessages from "../threads/getThreadMessages.js";
import type * as threads_getUserThreads from "../threads/getUserThreads.js";
import type * as threads_index from "../threads/index.js";
import type * as threads_shareThread from "../threads/shareThread.js";
import type * as threads_updateThreadData from "../threads/updateThreadData.js";
import type * as users_createOrGetUser from "../users/createOrGetUser.js";
import type * as users_getUserBalance from "../users/getUserBalance.js";
import type * as users_getUserData from "../users/getUserData.js";
import type * as users_index from "../users/index.js";
import type * as users_saveMessageAndUpdateBalance from "../users/saveMessageAndUpdateBalance.js";
import type * as users_updateUser from "../users/updateUser.js";
import type * as users_updateUserCredits from "../users/updateUserCredits.js";
import type * as users from "../users.js";
import type * as utils from "../utils.js";

/**
 * A utility for referencing Convex functions in your app's API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = api.myModule.myFunction;
 * ```
 */
declare const fullApi: ApiFromModules<{
  documents: typeof documents;
  "messages/fetchThreadMessages": typeof messages_fetchThreadMessages;
  "messages/getChatById": typeof messages_getChatById;
  "messages/getLastMessage": typeof messages_getLastMessage;
  "messages/index": typeof messages_index;
  "messages/saveChatMessage": typeof messages_saveChatMessage;
  swebench: typeof swebench;
  "threads/createNewThread": typeof threads_createNewThread;
  "threads/createOrGetUser": typeof threads_createOrGetUser;
  "threads/deleteThread": typeof threads_deleteThread;
  "threads/generateTitle": typeof threads_generateTitle;
  "threads/getLastEmptyThread": typeof threads_getLastEmptyThread;
  "threads/getSharedThread": typeof threads_getSharedThread;
  "threads/getThreadByClerkId": typeof threads_getThreadByClerkId;
  "threads/getThreadMessageCount": typeof threads_getThreadMessageCount;
  "threads/getThreadMessages": typeof threads_getThreadMessages;
  "threads/getUserThreads": typeof threads_getUserThreads;
  "threads/index": typeof threads_index;
  "threads/shareThread": typeof threads_shareThread;
  "threads/updateThreadData": typeof threads_updateThreadData;
  "users/createOrGetUser": typeof users_createOrGetUser;
  "users/getUserBalance": typeof users_getUserBalance;
  "users/getUserData": typeof users_getUserData;
  "users/index": typeof users_index;
  "users/saveMessageAndUpdateBalance": typeof users_saveMessageAndUpdateBalance;
  "users/updateUser": typeof users_updateUser;
  "users/updateUserCredits": typeof users_updateUserCredits;
  users: typeof users;
  utils: typeof utils;
}>;
export declare const api: FilterApi<
  typeof fullApi,
  FunctionReference<any, "public">
>;
export declare const internal: FilterApi<
  typeof fullApi,
  FunctionReference<any, "internal">
>;
