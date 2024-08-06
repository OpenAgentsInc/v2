import { openai } from '@ai-sdk/openai';
import { convertToCoreMessages, streamText } from 'ai';
import { z } from 'zod';

// Allow streaming responses up to 30 seconds
export const dynamic = 'force-dynamic';
export const maxDuration = 60;

export async function POST(req: Request) {
    const { messages } = await req.json();
    console.log('messages', messages);

    const result = await streamText({
        model: openai('gpt-4o'),
        messages: convertToCoreMessages(messages),
        tools: {
            // server-side tool with execute function:
            getWeatherInformation: {
                description: 'show the weather in a given city to the user',
                parameters: z.object({ city: z.string() }),
                execute: async ({ }: { city: string }) => {
                    const weatherOptions = ['sunny', 'cloudy', 'rainy', 'snowy', 'windy'];
                    return weatherOptions[
                        Math.floor(Math.random() * weatherOptions.length)
                    ];
                },
            },
            // client-side tool that starts user interaction:
            askForConfirmation: {
                description: 'Ask the user for confirmation.',
                parameters: z.object({
                    message: z.string().describe('The message to ask for confirmation.'),
                }),
            },
            // client-side tool that is automatically executed on the client:
            getLocation: {
                description:
                    'Get the user location. Always ask for confirmation before using this tool.',
                parameters: z.object({}),
            },
        },
    });

    return result.toAIStreamResponse();
}
