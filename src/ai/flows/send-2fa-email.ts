'use server';

/**
 * @fileOverview A flow to send a 2FA code via email using Resend.
 *
 * - send2faCode - A function that sends a one-time code to a specified email address.
 * - Send2faCodeInput - The input type for the send2faCode function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';
import {Resend} from 'resend';

const Send2faCodeInputSchema = z.object({
  email: z.string().email().describe('The email address to send the code to.'),
  code: z.string().describe('The 6-digit verification code.'),
});
export type Send2faCodeInput = z.infer<typeof Send2faCodeInputSchema>;

export async function send2faCode(input: Send2faCodeInput): Promise<{success: boolean}> {
  return send2faCodeFlow(input);
}

const send2faCodeFlow = ai.defineFlow(
  {
    name: 'send2faCodeFlow',
    inputSchema: Send2faCodeInputSchema,
    outputSchema: z.object({success: z.boolean()}),
  },
  async (input) => {
    const resend = new Resend(process.env.RESEND_API_KEY);
    try {
      await resend.emails.send({
        from: 'Invoice Manager <onboarding@resend.dev>',
        to: input.email,
        subject: `Your Invoice Manager Verification Code`,
        html: `
          <div style="font-family: sans-serif; text-align: center;">
            <h2>Verification Code</h2>
            <p>Your one-time verification code is:</p>
            <p style="font-size: 24px; font-weight: bold; letter-spacing: 2px;">${input.code}</p>
            <p>This code will expire in 10 minutes.</p>
          </div>
        `,
      });
      return {success: true};
    } catch (error) {
      console.error('Failed to send 2FA email:', error);
      // It's important to not throw the error here to avoid leaking info.
      // We just return a failure status.
      return {success: false};
    }
  }
);
