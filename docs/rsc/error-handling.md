## Error Handling

### Handling regular errors

Regular errors are thrown and can be handled using the `try/catch` block.

```javascript
import { generateText } from 'ai';

try {
  const { text } = await generateText({
    model: yourModel,
    prompt: 'Write a vegetarian lasagna recipe for 4 people.',
  });
} catch (error) {
  // handle error
}
```

### Handling streaming errors (simple streams)

When errors occur during streams that do not support error chunks, the error is thrown as a regular error. You can handle these errors using the `try/catch` block.

```javascript
import { generateText } from 'ai';

try {
  const { textStream } = await streamText({
    model: yourModel,
    prompt: 'Write a vegetarian lasagna recipe for 4 people.',
  });
  for await (const textPart of textStream) {
    process.stdout.write(textPart);
  }
} catch (error) {
  // handle error
}
```

### Handling streaming errors (streaming with `error` support)

Full streams support error parts. You can handle those parts similar to other parts. It is recommended to also add a try-catch block for errors that happen outside of the streaming.

```javascript
import { generateText } from 'ai';

try {
  const { fullStream } = await streamText({
    model: yourModel,
    prompt: 'Write a vegetarian lasagna recipe for 4 people.',
  });
  for await (const part of fullStream) {
    switch (part.type) {
      // ... handle other part types
      case 'error': {
        const error = part.error;
        // handle error
        break;
      }
    }
  }
} catch (error) {
  // handle error
}
```
