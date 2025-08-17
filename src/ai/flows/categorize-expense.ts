'use server';

/**
 * @fileOverview Provides a Genkit flow for suggesting relevant expense categories based on the user's description of the expense.
 *
 * - suggestExpenseCategories - A function that suggests expense categories based on the description.
 * - SuggestExpenseCategoriesInput - The input type for the suggestExpenseCategories function.
 * - SuggestExpenseCategoriesOutput - The return type for the suggestExpenseCategories function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const SuggestExpenseCategoriesInputSchema = z.object({
  description: z.string().describe('The description of the expense.'),
});
export type SuggestExpenseCategoriesInput = z.infer<typeof SuggestExpenseCategoriesInputSchema>;

const SuggestExpenseCategoriesOutputSchema = z.object({
  categories: z.array(z.string()).describe('An array of suggested expense categories.'),
});
export type SuggestExpenseCategoriesOutput = z.infer<typeof SuggestExpenseCategoriesOutputSchema>;

export async function suggestExpenseCategories(input: SuggestExpenseCategoriesInput): Promise<SuggestExpenseCategoriesOutput> {
  return suggestExpenseCategoriesFlow(input);
}

const prompt = ai.definePrompt({
  name: 'suggestExpenseCategoriesPrompt',
  input: {schema: SuggestExpenseCategoriesInputSchema},
  output: {schema: SuggestExpenseCategoriesOutputSchema},
  prompt: `Given the following expense description, suggest relevant expense categories.  Return the categories as a JSON array of strings.\n\nDescription: {{{description}}}`,
});

const suggestExpenseCategoriesFlow = ai.defineFlow(
  {
    name: 'suggestExpenseCategoriesFlow',
    inputSchema: SuggestExpenseCategoriesInputSchema,
    outputSchema: SuggestExpenseCategoriesOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
