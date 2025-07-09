'use server';

/**
 * @fileOverview This file defines a Genkit flow for extracting details from an image and a resume PDF.
 *
 * - extractDetails - A function that orchestrates the extraction and processing of information.
 * - ExtractDetailsInput - The input type for the extractDetails function, including image and resume data.
 * - ExtractDetailsOutput - The output type for the extractDetails function, containing extracted details and email draft.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';
import {extractTextFromImage} from '@/services/ocr-service';
import {parseResume} from '@/services/resume-parser';

const ExtractDetailsInputSchema = z.object({
  jobDetailsImage: z
    .string()
    .describe(
      "A photo of job details, as a data URI that must include a MIME type and use Base64 encoding. Expected format: 'data:<mimetype>;base64,<encoded_data>'."
    ),
  resumePdf: z
    .string()
    .describe(
      "The user's resume as a PDF, as a data URI that must include a MIME type and use Base64 encoding. Expected format: 'data:<mimetype>;base64,<encoded_data>'."
    ),
});
export type ExtractDetailsInput = z.infer<typeof ExtractDetailsInputSchema>;

const ExtractDetailsOutputSchema = z.object({
  email: z.object({
    to: z.string().describe('Recipient email address.'),
    subject: z.string().describe('Generated email subject line.'),
    body: z.string().describe('Generated email body text.'),
  }),
  candidate: z
    .object({
      name: z.string().describe('Candidate name.'),
      skills: z.array(z.string()).describe('Candidate skills.'),
      projects: z.array(z.string()).describe('Candidate projects.'),
      emailFoundInResume: z.string().optional().describe('Candidate email found in the resume, if any'),
    })
    .describe('Candidate details extracted from the resume.'),
});
export type ExtractDetailsOutput = z.infer<typeof ExtractDetailsOutputSchema>;

export async function extractDetails(input: ExtractDetailsInput): Promise<ExtractDetailsOutput> {
  return extractDetailsFlow(input);
}

const extractDetailsPrompt = ai.definePrompt({
  name: 'extractDetailsPrompt',
  input: {schema: ExtractDetailsInputSchema},
  output: {schema: ExtractDetailsOutputSchema},
  prompt: `You are an AI email assistant.

You will receive:
- Job or company details extracted from an image: "{{jobDetails}}".
- Resume content: "{{resumeContent}}".

Your job is to:
1. Understand:
   - Candidate's name, skills, experience, and projects
   - Company name, job title, and recipient email
2. Generate a personalized job application email.

Constraints:
- Keep the tone professional and concise.
- Mention that the resume is attached.
- If any info is missing, make assumptions based on the resume.

Output format: JSON
`,
});

const extractDetailsFlow = ai.defineFlow(
  {
    name: 'extractDetailsFlow',
    inputSchema: ExtractDetailsInputSchema,
    outputSchema: ExtractDetailsOutputSchema,
  },
  async input => {
    const [jobDetails, resumeContent] = await Promise.all([
      extractTextFromImage(input.jobDetailsImage),
      parseResume(input.resumePdf),
    ]);

    const {output} = await extractDetailsPrompt({
      ...input,
      jobDetails,
      resumeContent,
    });
    return output!;
  }
);
