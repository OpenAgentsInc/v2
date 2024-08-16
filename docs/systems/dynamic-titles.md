After the first message is received from an assistant, a dynamic title should be generated via OpenAI.

In our pre-refactored code we used this:

```typescript
'use server'
import { sql } from '@vercel/postgres'
import { Message } from '@/types'
import { openai } from '@ai-sdk/openai'
import { generateText } from 'ai'
import { models } from '@/lib/models'

export async function generateTitle(threadId: number): Promise<string> {
    console.log('Fetching messages for thread:', threadId);

    try {
        // Fetch messages for the given thread
        const result = await sql`
            SELECT content, role
            FROM messages
            WHERE thread_id = ${threadId}
            ORDER BY created_at ASC
        `;

        const messages = result.rows;

        if (messages.length === 0) {
            console.log('No messages found for thread:', threadId);
            return "New Thread";
        }

        // Format messages for AI function
        const formattedMessages = messages.map(msg => `${msg.role}: ${msg.content}`).join('\n');

        console.log('Formatted messages:', formattedMessages);

        // Use OpenAI to generate the title
        const modelObj = models.find(m => m.name === 'GPT-4o Mini');
        if (!modelObj) {
            throw new Error('Model not found');
        }

        const { text } = await generateText({
            model: openai(modelObj.id),
            messages: [
                { role: 'system', content: 'You are a helpful assistant that generates concise and relevant titles for chat conversations.' },
                { role: 'user', content: `Please generate a short, concise title (5 words or less) for the following conversation:\n\n${formattedMessages}` }
            ],
            temperature: 0.7,
            maxTokens: 10
        });

        const generatedTitle = text.trim();
        console.log('Generated title:', generatedTitle);

        // Update the thread title in the database
        await sql`
            UPDATE threads
            SET metadata = jsonb_set(COALESCE(metadata, '{}'), '{title}', ${JSON.stringify(generatedTitle)})
            WHERE id = ${threadId}
        `;

        return generatedTitle;
    } catch (error) {
        console.error('Error in generateTitle:', error);
        throw error;
    }
}
```
