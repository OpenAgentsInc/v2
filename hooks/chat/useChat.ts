import { useChatCore } from './useChatCore';
import { useChatMessages } from './useChatMessages';
import { useChatThread } from './useChatThread';
import { useChatMutations } from './useChatMutations';

export const useChat = () => {
  const core = useChatCore();
  const messages = useChatMessages(core);
  const thread = useChatThread(core);
  const mutations = useChatMutations(core);

  return {
    ...core,
    ...messages,
    ...thread,
    ...mutations,
  };
};