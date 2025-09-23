import { Resend } from "resend";
import { config } from 'dotenv';

config(); // Load environment variables from .env file

export async function POST(req: Request) {
  try {
    if (!process.env.RESEND_API_KEY) {
      throw new Error("Resend API key is not configured.");
    }
    const resend = new Resend(process.env.RESEND_API_KEY);
    
    const body = await req.json();
    const { email, bookId, bookName, ownerName } = body;

    // Construct the invitation URL
    const invitationUrl = `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:9002'}/invite?bookId=${bookId}&email=${email}`;

    const { data, error } = await resend.emails.send({
      from: "BudgetWise <noreply@chandupasasmitha.me>",
      to: email,
      subject: `Invitation to collaborate on "${bookName}"`,
      html: `
        <h1>You're Invited!</h1>
        <p><strong>${ownerName}</strong> has invited you to collaborate on the cash book: <strong>${bookName}</strong>.</p>
        <p>Click the link below to accept the invitation and join the cash book.</p>
        <a href="${invitationUrl}" style="background-color: #4f46e5; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; display: inline-block;">
          Accept Invitation
        </a>
        <p>If you were not expecting this invitation, you can safely ignore this email.</p>
      `,
    });

    if (error) {
      console.error("Resend API Error:", JSON.stringify(error, null, 2));
      return Response.json({ success: false, error: error.message }, { status: 500 });
    }

    return Response.json({ success: true, data });
  } catch (error: any) {
    console.error("General Error in send-invitation route:", error);
    return Response.json({ success: false, error: error.message }, { status: 500 });
  }
}
