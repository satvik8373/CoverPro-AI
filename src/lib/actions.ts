'use server';

import { generatePersonalizedEmail, type GeneratePersonalizedEmailOutput } from '@/ai/flows/generate-personalized-email';

// Helper function to convert file to base64
const fileToBase64 = async (file: File): Promise<string> => {
  const arrayBuffer = await file.arrayBuffer();
  const buffer = Buffer.from(arrayBuffer);
  return `data:${file.type};base64,${buffer.toString('base64')}`;
};

interface FormState {
    result: GeneratePersonalizedEmailOutput | null;
    error: string | null;
}

export async function generateEmailAction(
  prevState: FormState,
  formData: FormData
): Promise<FormState> {
  const jobImageFile = formData.get('jobImage') as File;
  const resumePdfFile = formData.get('resumePdf') as File;
  const name = formData.get('name') as string;
  const skills = formData.get('skills') as string;
  const projects = formData.get('projects') as string;
  const phone = formData.get('phone') as string;
  const email = formData.get('email') as string;

  // Validate required files
  if (!jobImageFile || jobImageFile.size === 0) {
    return { result: null, error: 'Please upload a job posting image. Take a screenshot or photo of the job listing you want to apply for.' };
  }

  if (!resumePdfFile || resumePdfFile.size === 0) {
    return { result: null, error: 'Please upload your resume as a PDF file.' };
  }

  // Validate file types
  if (!jobImageFile.type.startsWith('image/')) {
    return { result: null, error: 'Job posting must be an image file (PNG, JPG, JPEG). Please upload a screenshot or photo of the job listing.' };
  }

  if (resumePdfFile.type !== 'application/pdf') {
    return { result: null, error: 'Resume must be a PDF file. Please convert your resume to PDF format and try again.' };
  }

  // Validate file sizes (10MB limit)
  const maxSize = 10 * 1024 * 1024; // 10MB
  if (jobImageFile.size > maxSize) {
    return { result: null, error: 'Job posting image is too large. Please use an image smaller than 10MB.' };
  }

  if (resumePdfFile.size > maxSize) {
    return { result: null, error: 'Resume PDF is too large. Please use a PDF file smaller than 10MB.' };
  }

  try {
    const [jobDetailsImage, resumePdf] = await Promise.all([
      fileToBase64(jobImageFile),
      fileToBase64(resumePdfFile),
    ]);

    const result = await generatePersonalizedEmail({
      jobDetailsImage,
      resumePdf,
      name: name || '',
      skills: skills || '',
      projects: projects || '',
      phone: phone || '',
      email: email || '',
    });

    // Enhance the email body to mention resume attachment
    if (result.email.body && resumePdfFile.name) {
      // Check if the email already mentions attachment
      const hasAttachmentMention = /attach|resume|cv|document/i.test(result.email.body);
      
      if (!hasAttachmentMention) {
        // Add a professional note about the attachment
        const attachmentNote = `\n\nI have attached my resume for your review. Please find it attached to this email.`;
        result.email.body += attachmentNote;
      }
    }
    
    return { result, error: null };
  } catch (e) {
    console.error('Email generation error:', e);
    const errorMessage = e instanceof Error ? e.message : 'An unknown error occurred.';
    
    // Provide more specific error messages
    if (errorMessage.includes('quota')) {
      return { 
        result: null, 
        error: 'AI service quota exceeded. Please try again in a few minutes or check your API limits.' 
      };
    }
    
    if (errorMessage.includes('timeout')) {
      return { 
        result: null, 
        error: 'Request timed out. Please try again with smaller files or check your internet connection.' 
      };
    }
    
    return { 
      result: null, 
      error: `Failed to generate email. ${errorMessage}` 
    };
  }
}
