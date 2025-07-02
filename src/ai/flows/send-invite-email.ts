'use server';

/**
 * @fileOverview A flow to send an invitation email to a financial officer.
 *
 * - sendInviteEmail - A function that sends an invitation code to a specified email address.
 * - SendInviteEmailInput - The input type for the sendInviteEmail function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';
import {Resend} from 'resend';

const SendInviteEmailInputSchema = z.object({
  email: z.string().email().describe('The email address to send the invitation to.'),
  code: z.string().describe('The 6-digit invitation code.'),
});
export type SendInviteEmailInput = z.infer<typeof SendInviteEmailInputSchema>;

export async function sendInviteEmail(input: SendInviteEmailInput): Promise<{success: boolean}> {
  return sendInviteEmailFlow(input);
}

const sendInviteEmailFlow = ai.defineFlow(
  {
    name: 'sendInviteEmailFlow',
    inputSchema: SendInviteEmailInputSchema,
    outputSchema: z.object({success: z.boolean()}),
  },
  async (input) => {
    const resend = new Resend(process.env.RESEND_API_KEY);
    try {
      await resend.emails.send({
        from: 'Invoice Manager <onboarding@resend.dev>',
        to: input.email,
        subject: `You're Invited to Codelits Studio Invoice Manager`,
        html: `
          <div style="font-family: sans-serif; text-align: center;">
            <h2>You're Invited!</h2>
            <p>You have been invited to join the Invoice Manager as a Financial Officer.</p>
            <p>To accept the invitation and set up your account, please use the following code:</p>
            <p style="font-size: 24px; font-weight: bold; letter-spacing: 2px;">${input.code}</p>
            <p>You will need this code to create your account. Please go to the login page and follow the instructions for new officers.</p>
          </div>
        `,
      });
      return {success: true};
    } catch (error) {
      console.error('Failed to send invitation email:', error);
      return {success: false};
    }
  }
);
