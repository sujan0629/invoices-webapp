// This file is machine-generated - edit at your own risk.

'use server';

/**
 * @fileOverview This file contains a Genkit flow that suggests line item descriptions
 * based on previous entries to help users quickly populate invoices with accurate
 * and consistent descriptions.
 *
 * - suggestLineItemDescription - A function that suggests line item descriptions based on previous entries.
 * - SuggestLineItemDescriptionInput - The input type for the suggestLineItemDescription function.
 * - SuggestLineItemDescriptionOutput - The return type for the suggestLineItemDescription function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const SuggestLineItemDescriptionInputSchema = z.object({
  previousEntries: z
    .array(z.string())
    .describe("A list of previous line item descriptions."),
  currentInput: z.string().describe('The current input from the user.'),
});
export type SuggestLineItemDescriptionInput = z.infer<
  typeof SuggestLineItemDescriptionInputSchema
>;

const SuggestLineItemDescriptionOutputSchema = z.object({
  suggestions: z
    .array(z.string())
    .describe("A list of suggested line item descriptions."),
});
export type SuggestLineItemDescriptionOutput = z.infer<
  typeof SuggestLineItemDescriptionOutputSchema
>;

export async function suggestLineItemDescription(
  input: SuggestLineItemDescriptionInput
): Promise<SuggestLineItemDescriptionOutput> {
  return suggestLineItemDescriptionFlow(input);
}

const prompt = ai.definePrompt({
  name: 'suggestLineItemDescriptionPrompt',
  input: {schema: SuggestLineItemDescriptionInputSchema},
  output: {schema: SuggestLineItemDescriptionOutputSchema},
  prompt: `You are an AI assistant helping users create invoices.

Based on the user's current input and the list of previous entries, suggest
relevant line item descriptions.

Previous Entries:
{{#each previousEntries}}- {{{this}}}\n{{/each}}

Current Input: {{{currentInput}}}

Suggestions:`,
});

const suggestLineItemDescriptionFlow = ai.defineFlow(
  {
    name: 'suggestLineItemDescriptionFlow',
    inputSchema: SuggestLineItemDescriptionInputSchema,
    outputSchema: SuggestLineItemDescriptionOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
