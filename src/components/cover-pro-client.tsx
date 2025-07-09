'use client';

import { useState, useRef, useEffect, useActionState } from 'react';
import { useFormStatus } from 'react-dom';
import { generateEmailAction } from '@/lib/actions';
import type { GeneratePersonalizedEmailOutput } from '@/ai/flows/generate-personalized-email';
import Image from 'next/image';

import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Skeleton } from '@/components/ui/skeleton';
import { UploadCloud, FileText, X, AlertCircle, Clipboard, Check, Mail, User, Settings } from 'lucide-react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';

const initialState: { result: GeneratePersonalizedEmailOutput | null; error: string | null } = {
  result: null,
  error: null,
};

// Helper function to convert file to base64 data URI
const fileToBase64 = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = (error) => reject(error);
  });
};

// Helper function to convert data URI back to a File object
const dataURIToFile = (dataURI: string, filename: string): File => {
  const arr = dataURI.split(',');
  const mimeMatch = arr[0].match(/:(.*?);/);
  if (!mimeMatch) {
    throw new Error('Invalid data URI format');
  }
  const mime = mimeMatch[1];
  const bstr = atob(arr[1]);
  let n = bstr.length;
  const u8arr = new Uint8Array(n);
  while (n--) {
    u8arr[n] = bstr.charCodeAt(n);
  }
  return new File([u8arr], filename, { type: mime });
};

function SubmitButton({ disabled }: { disabled: boolean }) {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" disabled={pending || disabled} className="w-full text-lg py-6">
      {pending ? (
        <>
          <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          Generating...
        </>
      ) : (
        'Generate Email'
      )}
    </Button>
  );
}

function CoverProFormBody({
  state,
  jobImageFile,
  jobImageUrl,
  resumePdfFile,
  userDetails,
  generatedEmail,
  copied,
  jobImageInputRef,
  resumePdfInputRef,
  resumeDialogInputRef,
  handleFileChange,
  handleRemoveFile,
  handleDetailsChange,
  handleEmailEdit,
  handleCopy,
  handleOpenInGmail,
}: {
  state: typeof initialState;
  jobImageFile: File | null;
  jobImageUrl: string | null;
  resumePdfFile: File | null;
  userDetails: { name: string; skills: string; projects: string; phone: string; email: string };
  generatedEmail: GeneratePersonalizedEmailOutput['email'] | null;
  copied: boolean;
  jobImageInputRef: React.RefObject<HTMLInputElement>;
  resumePdfInputRef: React.RefObject<HTMLInputElement>;
  resumeDialogInputRef: React.RefObject<HTMLInputElement>;
  handleFileChange: (e: React.ChangeEvent<HTMLInputElement>, type: 'image' | 'pdf') => void;
  handleRemoveFile: (type: 'image' | 'pdf') => void;
  handleDetailsChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
  handleEmailEdit: (field: keyof NonNullable<typeof generatedEmail>, value: string) => void;
  handleCopy: () => void;
  handleOpenInGmail: () => void;
}) {
  const { pending } = useFormStatus();

  return (
    <div className="space-y-8">
      <Card className="shadow-lg">
        <CardHeader>
          <div className="flex justify-between items-center">
            <div className="space-y-1.5">
              <CardTitle className="font-headline text-2xl">1. Job & Resume</CardTitle>
              <CardDescription>Upload job details and your resume. Click the gear to add your info.</CardDescription>
            </div>
            <Dialog>
              <DialogTrigger asChild>
                <Button variant="outline" size="icon">
                  <Settings className="h-5 w-5" />
                  <span className="sr-only">Settings</span>
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[425px] max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle className="font-headline flex items-center gap-2">
                    <User className="h-6 w-6" />
                    Your Information
                  </DialogTitle>
                  <DialogDescription>
                    Provide your details to help the AI generate a more personalized email. This is saved in your browser.
                  </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                  <div className="space-y-2">
                    <Label htmlFor="name-dialog">Full Name</Label>
                    <Input id="name-dialog" name="name" value={userDetails.name} onChange={handleDetailsChange} placeholder="e.g. Jane Doe" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="skills-dialog">Your Top Skills (comma-separated)</Label>
                    <Textarea id="skills-dialog" name="skills" value={userDetails.skills} onChange={handleDetailsChange} placeholder="e.g. React, Next.js, TypeScript, AI Integration" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="projects-dialog">Key Projects or Experience (one per line)</Label>
                    <Textarea id="projects-dialog" name="projects" value={userDetails.projects} onChange={handleDetailsChange} placeholder={`- Developed a full-stack e-commerce app\n- Led a team on a real-time chat application`} />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="phone-dialog">Phone Number</Label>
                    <Input id="phone-dialog" name="phone" value={userDetails.phone} onChange={handleDetailsChange} placeholder="e.g. (555) 123-4567" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email-dialog">Email Address</Label>
                    <Input id="email-dialog" name="email" value={userDetails.email} onChange={handleDetailsChange} placeholder="e.g. your.name@example.com" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="resume-dialog">Your Resume (PDF)</Label>
                    <Input ref={resumeDialogInputRef} id="resume-dialog" type="file" accept=".pdf" onChange={(e) => handleFileChange(e, 'pdf')} />
                    {resumePdfFile && (
                        <div className="text-sm text-muted-foreground flex items-center justify-between">
                            <span>Current: {resumePdfFile.name}</span>
                            <Button variant="link" size="sm" className="h-auto p-0" onClick={() => handleRemoveFile('pdf')}>Remove</Button>
                        </div>
                    )}
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-2 gap-6">
            {[
              { type: 'image', file: jobImageFile, url: jobImageUrl, ref: jobImageInputRef, label: 'Job Description Image', accept: 'image/*' },
              { type: 'pdf', file: resumePdfFile, url: null, ref: resumePdfInputRef, label: 'Your Resume (PDF)', accept: '.pdf' }
            ].map(item => (
              <div key={item.type} className="space-y-2">
                <Label htmlFor={item.type}>{item.label}</Label>
                <div 
                  className="relative border-2 border-dashed border-border rounded-lg p-4 text-center cursor-pointer hover:border-primary transition-colors h-64 flex flex-col items-center justify-center group"
                  onClick={() => item.ref.current?.click()}
                >
                  <input ref={item.ref} id={item.type} name={item.type === 'image' ? 'jobImage' : 'resumePdf'} type="file" accept={item.accept} className="hidden" onChange={(e) => handleFileChange(e, item.type as 'image'|'pdf')} />
                  {item.file ? (
                    <>
                      {item.type === 'image' && item.url ? (
                        <Image src={item.url} alt="Preview" fill className="object-contain rounded-md p-2" />
                      ) : (
                        <div className="flex flex-col items-center gap-2 text-primary">
                          <FileText className="h-16 w-16" />
                          <span className="font-semibold text-sm break-all">{item.file.name}</span>
                        </div>
                      )}
                      <Button variant="destructive" size="icon" className="absolute top-2 right-2 h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity" onClick={(e) => { e.stopPropagation(); handleRemoveFile(item.type as 'image' | 'pdf'); }}>
                        <X className="h-4 w-4" />
                      </Button>
                    </>
                  ) : (
                    <div className="flex flex-col items-center gap-2 text-muted-foreground">
                      <UploadCloud className="h-12 w-12" />
                      <span className="font-semibold">Click or drag to upload</span>
                      <span className="text-xs">{item.type === 'image' ? 'PNG, JPG, etc.' : 'PDF only'}</span>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
        <CardFooter>
          <SubmitButton disabled={!jobImageFile || !resumePdfFile} />
        </CardFooter>
      </Card>
      
      {pending && (
        <Card className="shadow-lg">
            <CardHeader>
                <CardTitle>Generating Your Email...</CardTitle>
                <Skeleton className="h-4 w-3/4 mt-2" />
            </CardHeader>
            <CardContent className="space-y-4">
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-24 w-full" />
                <Skeleton className="h-10 w-full" />
            </CardContent>
        </Card>
      )}

      {state.error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{state.error}</AlertDescription>
        </Alert>
      )}

      {generatedEmail && !pending &&(
        <Card className="shadow-lg sticky top-8">
            <CardHeader>
                <CardTitle className="font-headline text-2xl">2. Review Your Email</CardTitle>
                <CardDescription>Review and edit the generated email before sending.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
                <div className="space-y-2">
                    <Label htmlFor="emailTo">To</Label>
                    <Input id="emailTo" value={generatedEmail.to} onChange={(e) => handleEmailEdit('to', e.target.value)} />
                </div>
                <div className="space-y-2">
                    <Label htmlFor="emailSubject">Subject</Label>
                    <Input id="emailSubject" value={generatedEmail.subject} onChange={(e) => handleEmailEdit('subject', e.target.value)} />
                </div>
                <div className="space-y-2">
                    <Label htmlFor="emailBody">Body</Label>
                    <Textarea id="emailBody" value={generatedEmail.body} onChange={(e) => handleEmailEdit('body', e.target.value)} rows={10} />
                </div>
            </CardContent>
            <CardFooter className="flex flex-col sm:flex-row gap-2">
                <Button variant="outline" className="w-full" onClick={handleCopy}>
                    {copied ? <Check className="h-4 w-4" /> : <Clipboard className="h-4 w-4" />}
                    <span className="ml-2">{copied ? 'Copied!' : 'Copy Email'}</span>
                </Button>
                <Button className="w-full" onClick={handleOpenInGmail}>
                    <Mail className="h-4 w-4" />
                    <span className="ml-2">Open in Gmail</span>
                </Button>
            </CardFooter>
        </Card>
      )}
    </div>
  );
}

export default function CoverProClient() {
  const [state, formAction] = useActionState(generateEmailAction, initialState);

  const [jobImageFile, setJobImageFile] = useState<File | null>(null);
  const [jobImageUrl, setJobImageUrl] = useState<string | null>(null);
  const [resumePdfFile, setResumePdfFile] = useState<File | null>(null);
  const [userDetails, setUserDetails] = useState({ name: '', skills: '', projects: '', phone: '', email: '' });
  const [generatedEmail, setGeneratedEmail] = useState<GeneratePersonalizedEmailOutput['email'] | null>(null);
  const [copied, setCopied] = useState(false);
  const [showDetailsAlert, setShowDetailsAlert] = useState(false);

  const jobImageInputRef = useRef<HTMLInputElement>(null);
  const resumePdfInputRef = useRef<HTMLInputElement>(null);
  const resumeDialogInputRef = useRef<HTMLInputElement>(null);

  // Function to ensure email has a proper signature
  const ensureSignature = (email: GeneratePersonalizedEmailOutput['email']): GeneratePersonalizedEmailOutput['email'] => {
    let { body } = email;
    
    // Check for specific signature format with name, phone, email
    const specificSignaturePattern = new RegExp(`Sincerely,\\s*${userDetails.name.trim()}\\s*${userDetails.phone.trim()}\\s*${userDetails.email.trim()}`, 'i');
    
    // Check for general signature patterns
    const generalSignaturePatterns = [
      /Sincerely,\s*(.+?)(\s*\n.*)?$/i,
      /Regards,\s*(.+?)(\s*\n.*)?$/i,
      /Best regards,\s*(.+?)(\s*\n.*)?$/i,
      /Yours truly,\s*(.+?)(\s*\n.*)?$/i,
      /Respectfully,\s*(.+?)(\s*\n.*)?$/i
    ];
    
    // Check if our specific signature format exists
    if (specificSignaturePattern.test(body.replace(/\n/g, ' '))) {
      return email;
    }
    
    // Check if any general signature pattern exists
    const hasGeneralSignature = generalSignaturePatterns.some(pattern => pattern.test(body));
    
    // If the email already has any signature, don't modify it
    if (hasGeneralSignature) {
      return email;
    }
    
    // Only add signature if user has provided their name
    if (userDetails.name) {
      // Otherwise, append a signature
      let signature = `\n\nSincerely,\n${userDetails.name}`;
      if (userDetails.phone) {
        signature += `\n${userDetails.phone}`;
      }
      if (userDetails.email) {
        signature += `\n${userDetails.email}`;
      }
      
      return {
        ...email,
        body: body + signature
      };
    }
    
    return email;
  };

  useEffect(() => {
    try {
      const savedDetails = localStorage.getItem('coverProUserDetails');
      if (savedDetails) {
        setUserDetails(JSON.parse(savedDetails));
      }
      const savedResume = localStorage.getItem('coverProResume');
      if (savedResume) {
        const { name, data } = JSON.parse(savedResume);
        if (name && data) {
          setResumePdfFile(dataURIToFile(data, name));
        }
      }
    } catch (error) {
      console.error("Failed to parse data from localStorage", error);
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('coverProUserDetails', JSON.stringify(userDetails));
  }, [userDetails]);
  
  useEffect(() => {
    if (state.result) {
      setGeneratedEmail(ensureSignature(state.result.email));
    }
  }, [state.result, userDetails]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, type: 'image' | 'pdf') => {
    const file = e.target.files?.[0];
    if (file) {
      if (type === 'image') {
        setJobImageFile(file);
        setJobImageUrl(URL.createObjectURL(file));
      } else {
        setResumePdfFile(file);
        fileToBase64(file).then(base64 => {
          localStorage.setItem('coverProResume', JSON.stringify({ name: file.name, data: base64 }));
        });
      }
    }
  };

  const handleRemoveFile = (type: 'image' | 'pdf') => {
    if (type === 'image') {
        setJobImageFile(null);
        setJobImageUrl(null);
        if(jobImageInputRef.current) jobImageInputRef.current.value = "";
    } else {
        setResumePdfFile(null);
        localStorage.removeItem('coverProResume');
        if(resumePdfInputRef.current) resumePdfInputRef.current.value = "";
        if(resumeDialogInputRef.current) resumeDialogInputRef.current.value = "";
    }
  };

  const handleCopy = () => {
    if (generatedEmail?.body) {
      navigator.clipboard.writeText(generatedEmail.body);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };
  
  const handleOpenInGmail = () => {
    if (generatedEmail) {
      const { to, subject, body } = generatedEmail;
      const gmailUrl = `https://mail.google.com/mail/?view=cm&fs=1&to=${encodeURIComponent(to)}&su=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
      window.open(gmailUrl, '_blank');
    }
  };

  const handleDetailsChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setUserDetails((prev) => ({ ...prev, [name]: value }));
  };
  
  const handleEmailEdit = (field: keyof NonNullable<typeof generatedEmail>, value: string) => {
    setGeneratedEmail(prev => {
        if (!prev) return null;
        return { ...prev, [field]: value };
    });
  };

  const formActionWrapper = (formData: FormData) => {
    const jobImageFromForm = formData.get('jobImage') as File;
    if (jobImageFile && (!jobImageFromForm || jobImageFromForm.size === 0)) {
        formData.set('jobImage', jobImageFile);
    }

    const resumePdfFromForm = formData.get('resumePdf') as File;
    if (resumePdfFile && (!resumePdfFromForm || resumePdfFromForm.size === 0)) {
        formData.set('resumePdf', resumePdfFile);
    }
    
    // Check if user has entered their details
    if (!userDetails.name || !userDetails.phone || !userDetails.email) {
      setShowDetailsAlert(true);
      setTimeout(() => setShowDetailsAlert(false), 5000); // Hide after 5 seconds
      return;
    }
    
    formAction(formData);
  };

  return (
    <form action={formActionWrapper}>
      <input type="hidden" name="name" value={userDetails.name} />
      <input type="hidden" name="skills" value={userDetails.skills} />
      <input type="hidden" name="projects" value={userDetails.projects} />
      <input type="hidden" name="phone" value={userDetails.phone} />
      <input type="hidden" name="email" value={userDetails.email} />
      
      {showDetailsAlert && (
        <Alert className="mb-6 border-amber-500 text-amber-800 bg-amber-50">
          <AlertCircle className="h-4 w-4 text-amber-500" />
          <AlertTitle>Please update your information</AlertTitle>
          <AlertDescription>
            For a proper signature in your email, please click the settings icon and enter your name, phone number, and email address.
          </AlertDescription>
        </Alert>
      )}
      
      <CoverProFormBody
        state={state}
        jobImageFile={jobImageFile}
        jobImageUrl={jobImageUrl}
        resumePdfFile={resumePdfFile}
        userDetails={userDetails}
        generatedEmail={generatedEmail}
        copied={copied}
        jobImageInputRef={jobImageInputRef}
        resumePdfInputRef={resumePdfInputRef}
        resumeDialogInputRef={resumeDialogInputRef}
        handleFileChange={handleFileChange}
        handleRemoveFile={handleRemoveFile}
        handleDetailsChange={handleDetailsChange}
        handleEmailEdit={handleEmailEdit}
        handleCopy={handleCopy}
        handleOpenInGmail={handleOpenInGmail}
      />
    </form>
  )
}
