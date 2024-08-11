import { CompletionTokenUsage } from './token-usage';

export interface OnFinishResult {
    finishReason: string;
    usage: CompletionTokenUsage;
}
