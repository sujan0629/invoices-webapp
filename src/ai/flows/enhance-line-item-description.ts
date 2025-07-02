'use server';

/**
 * @fileOverview A Genkit flow to enhance an invoice line item description.
 *
 * - enhanceLineItemDescription - A function that enhances a line item description.
 * - EnhanceLineItemDescriptionInput - The input type for the enhanceLineItemDescription function.
 * - EnhanceLineItemDescriptionOutput - The return type for the enhanceLineItemDescription function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const EnhanceLineItemDescriptionInputSchema = z.object({
  description: z
    .string()
    .describe('The original description of the invoice line item.'),
});
export type EnhanceLineItemDescriptionInput = z.infer<
  typeof EnhanceLineItemDescriptionInputSchema
>;

const EnhanceLineItemDescriptionOutputSchema = z.object({
  enhancedDescription: z
    .string()
    .describe('The enhanced, more professional description.'),
});
export type EnhanceLineItemDescriptionOutput = z.infer<
  typeof EnhanceLineItemDescriptionOutputSchema
>;

export async function enhanceLineItemDescription(
  input: EnhanceLineItemDescriptionInput
): Promise<EnhanceLineItemDescriptionOutput> {
  return enhanceLineItemDescriptionFlow(input);
}

const prompt = ai.definePrompt({
  name: 'enhanceLineItemDescriptionPrompt',
  input: {schema: EnhanceLineItemDescriptionInputSchema},
  output: {schema: EnhanceLineItemDescriptionOutputSchema},
  prompt: `You are an expert copywriter specializing in creating professional invoice descriptions.
Enhance the following line item description to be more clear, professional, and detailed.
Return only the single enhanced description in the 'enhancedDescription' field. Do not add any preamble.

Original Description:
"{{{description}}}"

Enhanced Description:`,
});

const enhanceLineItemDescriptionFlow = ai.defineFlow(
  {
    name: 'enhanceLineItemDescriptionFlow',
    inputSchema: EnhanceLineItemDescriptionInputSchema,
    outputSchema: EnhanceLineItemDescriptionOutputSchema,
  },
  async (input) => {
    const {output} = await prompt(input);
    return output!;
  }
);
