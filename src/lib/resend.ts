import { Resend } from 'resend';
import 'dotenv/config'

if (!process.env.RESEND_API_KEY) {
  console.warn('RESEND_API_KEY is not set in the environment variables. Email sending will be disabled.');
}

export const resend = process.env.RESEND_API_KEY 
  ? new Resend(process.env.RESEND_API_KEY)
  : null;
