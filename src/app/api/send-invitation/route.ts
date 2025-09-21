import { Resend } from "resend";

export async function POST(req: Request) {
  try {
    const resend = new Resend(process.env.RESEND_API_KEY);
    
    const body = await req.json();
    const { email, bookId, bookName, ownerName } = body;

    // Construct the invitation URL
    const invitationUrl = `${process.env.NEXT_PUBLIC_APP_URL}/invite?bookId=${bookId}&email=${email}`;

    const data = await resend.emails.send({
      from: "BudgetWise <noreply@yourdomain.com>",
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

    return Response.json({ success: true, data });
  } catch (error: any) {
    console.error("Resend error:", error);
    return Response.json({ success: false, error: error.message }, { status: 500 });
  }
}
