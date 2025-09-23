import { Resend } from 'resend';

// Next.js automatically loads environment variables from .env files.
// We no longer need to manually call `dotenv/config`.

// We check if the key exists. If it does, we initialize Resend.
// If not, we export `null` and log a warning.
const resendKey = process.env.RESEND_API_KEY;

if (!resendKey) {
  console.warn('RESEND_API_KEY is not set in the environment variables. Email sending will be disabled.');
}

export const resend = resendKey ? new Resend(resendKey) : null;
