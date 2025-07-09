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


  if (!jobImageFile || jobImageFile.size === 0 || !resumePdfFile || resumePdfFile.size === 0) {
    return { result: null, error: 'Please upload both a job description image and a resume PDF.' };
  }

  try {
    const [jobDetailsImage, resumePdf] = await Promise.all([
      fileToBase64(jobImageFile),
      fileToBase64(resumePdfFile),
    ]);

    const result = await generatePersonalizedEmail({
      jobDetailsImage,
      resumePdf,
      name,
      skills,
      projects,
      phone,
      email,
    });
    
    return { result, error: null };
  } catch (e) {
    console.error(e);
    const errorMessage = e instanceof Error ? e.message : 'An unknown error occurred.';
    return { result: null, error: `Failed to generate email. The AI model may be temporarily unavailable. Details: ${errorMessage}` };
  }
}
