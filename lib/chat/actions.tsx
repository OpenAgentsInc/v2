import { createAI, createStreamableUI, getMutableAIState, AIState } from 'ai/rsc';
import { nanoid } from '@/lib/utils';
import { Message, ServerMessage, ClientMessage } from '@/lib/types';

// Function to continue the conversation
async function continueConversation(message: ClientMessage) {
  'use server';

  const aiState = getMutableAIState<AIState>();
  aiState.update([...aiState.get(), { role: 'user', content: message.content, id: nanoid() }]);

  const ui = createStreamableUI(
    <div className="inline-block px-3 py-1 rounded-lg bg-gray-100 text-gray-800">
      Thinking...
    </div>
  );

  // Simulate AI response (replace with actual AI integration)
  await new Promise((resolve) => setTimeout(resolve, 1000));
  
  const aiMessage: ServerMessage = {
    id: nanoid(),
    role: 'assistant',
    content: `This is a simulated AI response to: "${message.content}"`,
  };

  aiState.update([...aiState.get(), aiMessage]);
  ui.update(
    <div className="inline-block px-3 py-1 rounded-lg bg-blue-500 text-white">
      {aiMessage.content as string}
    </div>
  );
  ui.done();

  return aiMessage;
}

// Create the AI context
export const AI = createAI<ServerMessage[], ClientMessage[]>({
  actions: {
    continueConversation,
  },
  initialAIState: [],
  initialUIState: [],
  onSetAIState: async ({ state, done }) => {
    'use server';
    if (done) {
      // Save chat to database (implement this function)
      // await saveChatToDB(state);
    }
  },
  onGetUIState: async () => {
    'use server';
    // Implement logic to restore UI state from AI state if needed
    // const historyFromDB = await loadChatFromDB();
    // const historyFromApp = getAIState();
    // if (historyFromDB.length !== historyFromApp.length) {
    //   return historyFromDB.map(({ role, content }) => ({
    //     id: nanoid(),
    //     role,
    //     content,
    //   }));
    // }
    return []; // Return an empty array as a placeholder
  },
});

export default AI;