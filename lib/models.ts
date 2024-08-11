import { Model } from '@/types'

export const models: Model[] = [
    {
        name: 'Claude 3.5 Sonnet',
        id: 'claude-3-5-sonnet-20240620',
        provider: 'anthropic',
        providerCentsPerMillionInputTokens: 300,
        providerCentsPerMillionOutputTokens: 1500
    },
    {
        name: 'Claude 3 Opus',
        id: 'claude-3-opus-20240229',
        provider: 'anthropic',
        providerCentsPerMillionInputTokens: 1500,
        providerCentsPerMillionOutputTokens: 7500
    },
    {
        name: 'Claude 3 Haiku',
        id: 'claude-3-haiku-20240307',
        provider: 'anthropic',
        providerCentsPerMillionInputTokens: 25,
        providerCentsPerMillionOutputTokens: 125
    },
    {
        name: 'GPT-4o',
        id: 'gpt-4o',
        provider: 'openai',
        providerCentsPerMillionInputTokens: 500,
        providerCentsPerMillionOutputTokens: 1500
    },
    {
        name: 'GPT-4o Mini',
        id: 'gpt-4o-mini',
        provider: 'openai',
        providerCentsPerMillionInputTokens: 15,
        providerCentsPerMillionOutputTokens: 60
    },
]
