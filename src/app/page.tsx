import CoverProClient from '@/components/cover-pro-client';
import { CoverProIcon } from '@/components/icons';

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen bg-background text-foreground">
      <main className="flex-1">
        <div className="container mx-auto px-4 py-8 sm:px-6 lg:px-8">
          <div className="max-w-4xl mx-auto">
            <div className="flex flex-col items-center text-center mb-12">
              <CoverProIcon className="h-16 w-16 mb-4 text-primary" />
              <h1 className="text-4xl font-bold font-headline text-primary tracking-tight sm:text-5xl">
                CoverPro AI
              </h1>
              <p className="mt-4 text-lg text-muted-foreground max-w-2xl">
                Generate professional, personalized job application emails in seconds. Just upload the job details and your resume.
              </p>
            </div>
            <CoverProClient />
          </div>
        </div>
      </main>
      <footer className="py-6">
        <div className="container mx-auto text-center text-sm text-muted-foreground">
          Powered by Generative AI
        </div>
      </footer>
    </div>
  );
}
