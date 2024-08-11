import { Model } from './model';
import { CompletionTokenUsage } from './token-usage';

export interface OnFinishOptions {
    finishReason: string;
    usage: CompletionTokenUsage;
    model: Model;
}
