import { Resend } from 'resend';

// This file initializes the Resend client.
// It relies on the RESEND_API_KEY environment variable being set.
// Next.js automatically loads this from .env files.

const resendKey = process.env.RESEND_API_KEY;

export const resend = resendKey ? new Resend(resendKey) : null;
