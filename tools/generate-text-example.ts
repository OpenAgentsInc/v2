import { openai } from '@ai-sdk/openai';
import { generateText } from 'ai';

async function generateTextExample() {
  try {
    const { text } = await generateText({
      model: openai('gpt-4-turbo'),
      prompt: 'Explain the concept of AI-driven text generation in 3 sentences.',
      maxTokens: 100,
      temperature: 0.7,
    });

    console.log('Generated text:');
    console.log(text);
  } catch (error) {
    console.error('Error generating text:', error);
  }
}

generateTextExample();