# OpenAgents.com Monetization

The v2 OpenAgents platform earns profit from day one by passing its costs to the user, with an added premium.

Our costs are primarily compute paid to the LLM providers like OpenAI and Anthropic. They charge per token. Each message has an associated amount of tokens associated. We calculate that amount of tokens, add our profit multiplier, and charge the user by deducting credits from their account.

In `hooks/useChat.ts` we wrap the Vercel AI SDK's `useChat()` hook, passing an `onFinish()` callback that saves the message including its token amounts and calculates usage based on current prices.

The calculation and user balance deduction is for now done all in the `db/actions/saveChatMessage.ts` file, calling `lib/calculateMessageCost.ts` and `lib/deductUserCredits.ts`.

## Proposal: Integrating Stripe Checkout for Adding Credits

To integrate the Stripe checkout flow into our current "add credits" functionality, we propose the following changes:

1. Update `components/hud/balance.tsx`:
   - Replace the existing buttons with a slider-based input for selecting credit amounts, using any base shad-ui components in components/ui/ where possible.
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

## Implementation Log

The following changes have been made to implement the Stripe Checkout for adding credits:

1. Created `components/AddCreditsForm.tsx`:
   - Implemented a new component for adding credits using a slider input.
   - Integrated with Stripe Checkout for processing payments.

2. Updated `components/hud/balance.tsx`:
   - Replaced the existing buttons with the new `AddCreditsForm` component.
   - Updated the dialog to show the new form for adding credits.

3. Modified `lib/stripe/actions.ts`:
   - Updated `createCheckoutSession` function to handle credit purchases instead of donations.
   - Changed the product name to "OpenAgents Credits" and updated the success/cancel URLs.

4. Created `app/api/webhooks/route.ts`:
   - Implemented a new webhook handler to process successful Stripe payments.
   - Added logic to update user credits upon successful payment.

These changes implement the core functionality for adding credits using Stripe Checkout. Further testing and refinement may be necessary to ensure a smooth user experience and proper error handling.