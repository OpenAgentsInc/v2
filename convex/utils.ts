import { Model, CompletionTokenUsage } from '../types';

const PROFIT_MULTIPLIER = 2;

export const calculateMessageCost = (model: Model, usage: CompletionTokenUsage): number => {
    console.log("[calculateMessageCost] with model and usage: ", model, usage);
    const providerCentsPerMillionInputTokens = model.providerCentsPerMillionInputTokens;
    const providerCentsPerMillionOutputTokens = model.providerCentsPerMillionOutputTokens;
    const inputTokens = usage.promptTokens;
    const outputTokens = usage.completionTokens;
    const inputCost = (providerCentsPerMillionInputTokens * inputTokens) / 1000000;
    const outputCost = (providerCentsPerMillionOutputTokens * outputTokens) / 1000000;
    const totalCost = inputCost + outputCost;
    const costWithProfit = totalCost * PROFIT_MULTIPLIER;
    console.log("[calculateMessageCost] costWithProfit: ", costWithProfit);
    return costWithProfit;
};