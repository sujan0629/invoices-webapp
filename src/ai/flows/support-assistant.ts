
'use server';

/**
 * @fileOverview A flow to power the AI support assistant.
 *
 * - askSupportAssistant - A function that gets an answer from the AI assistant.
 * - SupportAssistantInput - The input type for the askSupportAssistant function.
 * - SupportAssistantOutput - The return type for the askSupportAssistant function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const SupportAssistantInputSchema = z.object({
  query: z.string().describe("The user's question for the support assistant."),
});
export type SupportAssistantInput = z.infer<typeof SupportAssistantInputSchema>;

const SupportAssistantOutputSchema = z.object({
  response: z.string().describe("The AI assistant's response."),
});
export type SupportAssistantOutput = z.infer<typeof SupportAssistantOutputSchema>;

export async function askSupportAssistant(
  input: SupportAssistantInput
): Promise<SupportAssistantOutput> {
  return supportAssistantFlow(input);
}

const prompt = ai.definePrompt({
  name: 'supportAssistantPrompt',
  input: {schema: SupportAssistantInputSchema},
  output: {schema: SupportAssistantOutputSchema},
  prompt: `You are a friendly and helpful support assistant for the Codelits Studio Invoice Manager application.

Your goal is to help users understand how to use the application. Be concise and clear in your answers.

Here is a summary of the application's features:
- Dashboard: Shows a list of all invoices and a reports tab with financial summaries.
- Create Invoice: A form to create new invoices for clients, add line items, and specify details like taxes (VAT, TDS).
- Invite Officer: An admin-only feature to send email invitations to new financial officers.
- Clients & Projects: A section to manage a list of client contacts.
- Settings: Allows users to update their company profile (name, address, PAN, logo) and set default tax rates for new invoices.
- Authentication: The app supports two roles: Admin and Financial Officer. Admins can invite officers. All users must use 2-Factor Authentication (2FA) to log in.

User's Question:
"{{{query}}}"
`,
});

const supportAssistantFlow = ai.defineFlow(
  {
    name: 'supportAssistantFlow',
    inputSchema: SupportAssistantInputSchema,
    outputSchema: SupportAssistantOutputSchema,
  },
  async (input) => {
    const {output} = await prompt(input);
    return output!;
  }
);
