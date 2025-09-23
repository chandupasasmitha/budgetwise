import { Resend } from 'resend';
import { config } from 'dotenv';
import path from 'path';

// Explicitly point to the .env file in the project root
config({ path: path.resolve(process.cwd(), '.env') });

if (!process.env.RESEND_API_KEY) {
  throw new Error('RESEND_API_KEY is not set in the environment variables');
}

export const resend = new Resend(process.env.RESEND_API_KEY);
