'use server';

import { suggestExpenseCategories } from '@/ai/flows/categorize-expense';

export async function suggestCategoriesAction(description: string) {
  try {
    const result = await suggestExpenseCategories({ description });
    return result.categories;
  } catch (error) {
    console.error(error);
    return [];
  }
}
