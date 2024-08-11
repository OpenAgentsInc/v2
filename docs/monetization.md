# OpenAgents.com Monetization

The v2 OpenAgents platform earns profit from day one by passing its costs to the user, with an added premium.

Our costs are primarily compute paid to the LLM providers like OpenAI and Anthropic. They charge per token. Each message has an associated amount of tokens associated. We calculate that amount of tokens, add our profit multiplier, and charge the user by deducting credits from their account.

In `hooks/useChat.ts` we wrap the Vercel AI SDK's `useChat()` hook, passing an `onFinish()` callback that saves the message including its token amounts and calculates usage based on current prices.

The calculation and user balance deduction is for now done all in the `db/actions/saveChatMessage.ts` file, calling `lib/calculateMessageCost.ts` and `lib/deductUserCredits.ts`.

## Proposal: Integrating Stripe Checkout for Adding Credits

To integrate the Stripe checkout flow into our current "add credits" functionality, we propose the following changes:

1. Update `components/hud/balance.tsx`:
   - Replace the existing buttons with a slider-based input for selecting credit amounts.
   - Integrate the `CustomDonationInput` component from `components/CheckoutForm.tsx`.
   - Add a "Add Credits" button that triggers the Stripe checkout process.

2. Create a new component `components/AddCreditsForm.tsx`:
   - This component will be based on the `CheckoutForm` from `app/donate-with-checkout/page.tsx`.
   - Modify the component to handle credit purchases instead of donations.
   - Use the slider input for selecting credit amounts.

3. Update Stripe integration:
   - Modify `lib/stripe/actions.ts` to handle credit purchases.
   - Update `app/api/webhooks/route.ts` to process successful credit purchases and update user balances.

4. UI/UX changes:
   - Update the dialog in `components/hud/balance.tsx` to show the new AddCreditsForm.
   - Ensure the design is consistent with the existing UI.

5. State management:
   - Update the balance store to reflect changes after successful credit purchases.

6. Testing and security:
   - Implement proper error handling and validation.
   - Ensure PCI compliance and secure handling of payment information.

Implementation steps:

1. Create `AddCreditsForm` component based on `CheckoutForm`.
2. Modify `balance.tsx` to use the new `AddCreditsForm`.
3. Update Stripe-related files (`actions.ts`, `webhooks/route.ts`) to handle credit purchases.
4. Implement state updates for successful purchases.
5. Test the entire flow, including error scenarios.
6. Update documentation and add any necessary instructions for users.

By integrating the Stripe checkout flow, we can provide a smooth and secure process for users to add credits to their accounts, improving the overall user experience and monetization strategy of the platform.