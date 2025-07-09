// src/ai/flows/generate-personalized-email.ts
'use server';

/**
 * @fileOverview Generates a personalized job application email.
 *
 * - generatePersonalizedEmail - A function that generates the email.
 * - GeneratePersonalizedEmailInput - The input type for the generatePersonalizedEmail function.
 * - GeneratePersonalizedEmailOutput - The return type for the generatePersonalizedEmail function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GeneratePersonalizedEmailInputSchema = z.object({
  jobDetailsImage: z
    .string()
    .describe(
      "A photo of job or company details, as a data URI that must include a MIME type and use Base64 encoding. Expected format: 'data:<mimetype>;base64,<encoded_data>'."
    ),
  resumePdf: z
    .string()
    .describe(
      "A PDF file of the user's resume, as a data URI that must include a MIME type and use Base64 encoding. Expected format: 'data:<mimetype>;base64,<encoded_data>'."
    ),
  name: z.string().optional().describe("The candidate's full name."),
  skills: z
    .string()
    .optional()
    .describe("A list of the candidate's skills."),
  projects: z
    .string()
    .optional()
    .describe("A list of the candidate's projects or experience."),
  phone: z
    .string()
    .optional()
    .describe("The candidate's phone number."),
  email: z
    .string()
    .optional()
    .describe("The candidate's email address."),
});
export type GeneratePersonalizedEmailInput = z.infer<typeof GeneratePersonalizedEmailInputSchema>;

const GeneratePersonalizedEmailOutputSchema = z.object({
  email: z.object({
    to: z.string().describe('The recipient email address.'),
    subject: z.string().describe('The subject line of the email.'),
    body: z.string().describe('The body of the email.'),
  }),
});
export type GeneratePersonalizedEmailOutput = z.infer<
  typeof GeneratePersonalizedEmailOutputSchema
>;

export async function generatePersonalizedEmail(
  input: GeneratePersonalizedEmailInput
): Promise<GeneratePersonalizedEmailOutput> {
  return generatePersonalizedEmailFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generatePersonalizedEmailPrompt',
  input: {
    schema: GeneratePersonalizedEmailInputSchema,
  },
  output: {
    schema: GeneratePersonalizedEmailOutputSchema,
  },
  prompt: `You are an AI email assistant.

You will receive:
- An image that contains job or company details (e.g. company name, email, position).
- A PDF file of the user's resume.
{{#if name}}
- Candidate's Name: {{name}}
{{/if}}
{{#if skills}}
- Candidate's Skills: {{skills}}
{{/if}}
{{#if projects}}
- Candidate's Projects/Experience: {{projects}}
{{/if}}
{{#if phone}}
- Candidate's Phone: {{phone}}
{{/if}}
{{#if email}}
- Candidate's Email: {{email}}
{{/if}}

Your job is to:
1. Analyze the image and the resume content.
2. Use all provided sources to understand the candidate and the job opportunity.
3. Prioritize the provided candidate details (Name, Skills, Projects) if available. Use the resume to supplement this information.
4. Generate a personalized, professional job application email.
5. Extract the recipient's email address from the job details image.
6. DO NOT include a signature at the end of the email. The signature will be added automatically by the client.

Constraints:
- Keep the tone professional and concise.
- Mention that the resume is attached.
- If any info is missing, make assumptions based on the available information.
- DO NOT include any signature like "Sincerely," or "Regards," at the end of the email. The signature will be added automatically.

Here is the job details image: {{media url=jobDetailsImage}}
Here is the resume: {{media url=resumePdf}}`,
});

const generatePersonalizedEmailFlow = ai.defineFlow(
  {
    name: 'generatePersonalizedEmailFlow',
    inputSchema: GeneratePersonalizedEmailInputSchema,
    outputSchema: GeneratePersonalizedEmailOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
