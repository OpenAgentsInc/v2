# OpenAgents.com Monetization

The v2 OpenAgents platform earns profit from day one by passing its costs to the user, with an added premium.

Our costs are primarily compute paid to the LLM providers like OpenAI and Anthropic. They charge per token. Each message has an associated amount of tokens associated. We calculate that amount of tokens, add our profit multiplier, and charge the user by deducting credits from their account.

Structure of token usage response from server:


