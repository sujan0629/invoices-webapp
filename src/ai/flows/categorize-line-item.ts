'use server';

/**
 * @fileOverview A Genkit flow to categorize an invoice line item based on its description.
 *
 * - categorizeLineItem - A function that suggests a category for a line item.
 * - CategorizeLineItemInput - The input type for the categorizeLineItem function.
 * - CategorizeLineItemOutput - The return type for the categorizeLineItem function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const CategorizeLineItemInputSchema = z.object({
  description: z
    .string()
    .describe('The description of the invoice line item.'),
});
export type CategorizeLineItemInput = z.infer<
  typeof CategorizeLineItemInputSchema
>;

const CategorizeLineItemOutputSchema = z.object({
  category: z
    .string()
    .describe(
      'A concise category for the line item (e.g., "Web Development", "Consulting", "Graphic Design").'
    ),
});
export type CategorizeLineItemOutput = z.infer<
  typeof CategorizeLineItemOutputSchema
>;

export async function categorizeLineItem(
  input: CategorizeLineItemInput
): Promise<CategorizeLineItemOutput> {
  return categorizeLineItemFlow(input);
}

const prompt = ai.definePrompt({
  name: 'categorizeLineItemPrompt',
  input: {schema: CategorizeLineItemInputSchema},
  output: {schema: CategorizeLineItemOutputSchema},
  prompt: `You are an expert accountant. Based on the following invoice line item description, provide a single, concise category for it.

Description: {{{description}}}

Category:`,
});

const categorizeLineItemFlow = ai.defineFlow(
  {
    name: 'categorizeLineItemFlow',
    inputSchema: CategorizeLineItemInputSchema,
    outputSchema: CategorizeLineItemOutputSchema,
  },
  async (input) => {
    const {output} = await prompt(input);
    return output!;
  }
);
