import { ProcessMessageData } from "./"

export async function gatherContext({ content, threadId, userId }: ProcessMessageData) {
  return {
    messages: [],
    tools: []
  }
}
