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
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { UploadCloud, FileText, X, AlertCircle, Clipboard, Check, Mail, User, Download, Paperclip, Sparkles, Send, Eye, Edit3 } from 'lucide-react';
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

// Helper function to format file size
const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

// Helper function to create email with attachment
const createEmailWithAttachment = (email: NonNullable<GeneratePersonalizedEmailOutput['email']>, resumeFile: File | null) => {
  const subject = encodeURIComponent(email.subject);
  const body = encodeURIComponent(email.body);
  
  if (resumeFile) {
    // For Gmail web, we can't directly attach files, but we can mention it in the body
    const bodyWithAttachment = encodeURIComponent(
      email.body + '\n\n[Please attach your resume file: ' + resumeFile.name + ']'
    );
    return `https://mail.google.com/mail/?view=cm&fs=1&to=${email.to}&su=${subject}&body=${bodyWithAttachment}`;
  }
  
  return `https://mail.google.com/mail/?view=cm&fs=1&to=${email.to}&su=${subject}&body=${body}`;
};

function SubmitButton({ disabled }: { disabled: boolean }) {
  const { pending } = useFormStatus();
  return (
    <Button 
      type="submit" 
      disabled={pending || disabled} 
      className="w-full h-10 sm:h-12 text-sm sm:text-base font-semibold bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white shadow-lg hover:shadow-xl transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
    >
      {pending ? (
        <div className="flex items-center gap-2">
          <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
          <Sparkles className="h-4 w-4 animate-pulse" />
          <span className="hidden sm:inline">Crafting your email...</span>
          <span className="sm:hidden">Generating...</span>
        </div>
      ) : (
        <div className="flex items-center gap-2">
          <Sparkles className="h-4 w-4" />
          <span className="hidden sm:inline">Generate Application Email</span>
          <span className="sm:hidden">Generate Email</span>
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
          </svg>
        </div>
      )}
    </Button>
  );
}

export default function CoverProClient() {
  const [state, formAction] = useActionState(generateEmailAction, initialState);
  const [jobImageFile, setJobImageFile] = useState<File | null>(null);
  const [jobImageUrl, setJobImageUrl] = useState<string | null>(null);
  const [resumePdfFile, setResumePdfFile] = useState<File | null>(null);
  const [generatedEmail, setGeneratedEmail] = useState<GeneratePersonalizedEmailOutput['email'] | null>(null);
  const [copied, setCopied] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);
  const [uploadProgress, setUploadProgress] = useState({ job: 0, resume: 0 });
  const [userDetails, setUserDetails] = useState({
    name: '',
    skills: '',
    projects: '',
    phone: '',
    email: '',
  });

  const jobImageInputRef = useRef<HTMLInputElement>(null);
  const resumePdfInputRef = useRef<HTMLInputElement>(null);

  // Load user details and resume from localStorage on mount
  useEffect(() => {
    const savedDetails = localStorage.getItem('applyGeniusUserDetails');
    if (savedDetails) {
      setUserDetails(JSON.parse(savedDetails));
    }

    const savedResume = localStorage.getItem('applyGeniusResume');
    if (savedResume) {
      try {
        const resumeData = JSON.parse(savedResume);
        const file = dataURIToFile(resumeData.dataURI, resumeData.filename);
        setResumePdfFile(file);
      } catch (error) {
        console.error('Error loading saved resume:', error);
        localStorage.removeItem('applyGeniusResume');
      }
    }
  }, []);

  // Save user details to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem('applyGeniusUserDetails', JSON.stringify(userDetails));
  }, [userDetails]);

  // Update generated email when state changes
  useEffect(() => {
    if (state.result?.email) {
      let emailWithSignature = { ...state.result.email };
      
      // Add signature if user details are provided
      if (userDetails.name || userDetails.phone || userDetails.email) {
        const signature = [
          '\n\nBest regards,',
          userDetails.name || '[Your Name]',
          userDetails.phone ? `Phone: ${userDetails.phone}` : '',
          userDetails.email ? `Email: ${userDetails.email}` : '',
        ].filter(Boolean).join('\n');
        
        emailWithSignature.body += signature;
      }
      
      setGeneratedEmail(emailWithSignature);
      setCurrentStep(2);
    }
  }, [state.result, userDetails]);

  const simulateUpload = (type: 'job' | 'resume') => {
    let progress = 0;
    const interval = setInterval(() => {
      progress += Math.random() * 30;
      if (progress >= 100) {
        progress = 100;
        clearInterval(interval);
      }
      setUploadProgress(prev => ({ ...prev, [type]: progress }));
    }, 100);
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>, type: 'image' | 'pdf') => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file size (10MB limit)
    if (file.size > 10 * 1024 * 1024) {
      alert('File size must be less than 10MB');
      return;
    }

    if (type === 'image') {
      // Validate image type
      if (!file.type.startsWith('image/')) {
        alert('Please select a valid image file');
        return;
      }
      
      simulateUpload('job');
      setJobImageFile(file);
      const url = URL.createObjectURL(file);
      setJobImageUrl(url);
    } else {
      // Validate PDF type
      if (file.type !== 'application/pdf') {
        alert('Please select a PDF file');
        return;
      }
      
      simulateUpload('resume');
      setResumePdfFile(file);
      
      // Save resume to localStorage
      try {
        const dataURI = await fileToBase64(file);
        localStorage.setItem('applyGeniusResume', JSON.stringify({
          filename: file.name,
          dataURI: dataURI,
        }));
      } catch (error) {
        console.error('Error saving resume:', error);
      }
    }
  };

  const handleRemoveFile = (type: 'image' | 'pdf') => {
    if (type === 'image') {
      setJobImageFile(null);
      if (jobImageUrl) {
        URL.revokeObjectURL(jobImageUrl);
        setJobImageUrl(null);
      }
      setUploadProgress(prev => ({ ...prev, job: 0 }));
    } else {
      setResumePdfFile(null);
      localStorage.removeItem('applyGeniusResume');
      setUploadProgress(prev => ({ ...prev, resume: 0 }));
    }
  };

  const handleDetailsChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setUserDetails(prev => ({ ...prev, [name]: value }));
  };

  const handleEmailEdit = (field: keyof NonNullable<typeof generatedEmail>, value: string) => {
    if (generatedEmail) {
      setGeneratedEmail({ ...generatedEmail, [field]: value });
    }
  };

  const handleCopy = async () => {
    if (!generatedEmail) return;
    
    const emailText = `To: ${generatedEmail.to}\nSubject: ${generatedEmail.subject}\n\n${generatedEmail.body}`;
    
    try {
      await navigator.clipboard.writeText(emailText);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error('Failed to copy:', error);
    }
  };

  const handleDownloadResume = () => {
    if (!resumePdfFile) return;
    
    const url = URL.createObjectURL(resumePdfFile);
    const a = document.createElement('a');
    a.href = url;
    a.download = resumePdfFile.name;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleOpenInGmail = () => {
    if (!generatedEmail) return;
    
    const gmailUrl = createEmailWithAttachment(generatedEmail, resumePdfFile);
    window.open(gmailUrl, '_blank');
  };

  const handleFormSubmit = (formData: FormData) => {
    // Ensure files are attached to form data
    if (jobImageFile) {
      formData.set('jobImage', jobImageFile);
    }
    if (resumePdfFile) {
      formData.set('resumePdf', resumePdfFile);
    }
    
    // Debug logging
    console.log('Form submission:', {
      hasJobImage: !!formData.get('jobImage'),
      hasResume: !!formData.get('resumePdf'),
      jobImageSize: jobImageFile?.size,
      resumeSize: resumePdfFile?.size,
      userDetails
    });
    
    formAction(formData);
  };

  const isFormValid = jobImageFile && resumePdfFile;
  const isUserDetailsComplete = userDetails.name && userDetails.email;

  return (
    <div className="space-y-3 sm:space-y-4 lg:space-y-6">
      {/* Compact Progress Indicator */}
      <div className="bg-white border border-gray-200 rounded-lg sm:rounded-xl p-3 sm:p-4 shadow-sm">
        <div className="flex items-center justify-center max-w-sm mx-auto">
          <div className="flex items-center space-x-2">
            <div className={`w-6 h-6 sm:w-8 sm:h-8 rounded-full flex items-center justify-center font-semibold text-xs transition-all duration-300 ${
              currentStep >= 1 
                ? 'bg-blue-600 text-white shadow-md' 
                : 'bg-gray-100 text-gray-400'
            }`}>
              {currentStep > 1 ? (
                <svg className="w-3 h-3 sm:w-4 sm:h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              ) : (
                '1'
              )}
            </div>
            <span className={`text-xs sm:text-sm font-medium ${currentStep >= 1 ? 'text-gray-900' : 'text-gray-400'}`}>
              Upload
            </span>
          </div>
          
          <div className={`flex-1 h-0.5 mx-3 sm:mx-4 transition-all duration-300 ${
            currentStep >= 2 ? 'bg-blue-600' : 'bg-gray-200'
          }`}></div>
          
          <div className="flex items-center space-x-2">
            <div className={`w-6 h-6 sm:w-8 sm:h-8 rounded-full flex items-center justify-center font-semibold text-xs transition-all duration-300 ${
              currentStep >= 2 
                ? 'bg-blue-600 text-white shadow-md' 
                : 'bg-gray-100 text-gray-400'
            }`}>
              {currentStep > 2 ? (
                <svg className="w-3 h-3 sm:w-4 sm:h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              ) : (
                '2'
              )}
            </div>
            <span className={`text-xs sm:text-sm font-medium ${currentStep >= 2 ? 'text-gray-900' : 'text-gray-400'}`}>
              Review
            </span>
          </div>
        </div>
      </div>

      <form action={handleFormSubmit} className="space-y-3 sm:space-y-4">
        {/* Hidden inputs for user details */}
        <input type="hidden" name="name" value={userDetails.name} />
        <input type="hidden" name="skills" value={userDetails.skills} />
        <input type="hidden" name="projects" value={userDetails.projects} />
        <input type="hidden" name="phone" value={userDetails.phone} />
        <input type="hidden" name="email" value={userDetails.email} />
        
        {/* Step 1: Compact Document Upload */}
        <div className="bg-white border border-gray-200 rounded-lg sm:rounded-xl shadow-sm overflow-hidden">
          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 px-3 sm:px-4 lg:px-6 py-3 sm:py-4 border-b border-gray-100">
            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3">
              <div className="space-y-1 sm:space-y-2">
                <div className="flex items-center space-x-2">
                  <div className="w-5 h-5 sm:w-6 sm:h-6 bg-blue-600 rounded-lg flex items-center justify-center">
                    <UploadCloud className="h-3 w-3 sm:h-4 sm:w-4 text-white" />
                  </div>
                  <h3 className="text-base sm:text-lg font-semibold text-gray-900">Upload Documents</h3>
                </div>
                <p className="text-xs sm:text-sm text-gray-600">
                  Upload both files to generate your email
                </p>
                <div className="flex flex-wrap gap-2 mt-2">
                  <div className="flex items-center gap-1 text-xs">
                    <div className={`w-2 h-2 rounded-full ${jobImageFile ? 'bg-green-500' : 'bg-gray-300'}`}></div>
                    <span className={jobImageFile ? 'text-green-700 font-medium' : 'text-gray-500'}>
                      Job Image
                    </span>
                  </div>
                  <div className="flex items-center gap-1 text-xs">
                    <div className={`w-2 h-2 rounded-full ${resumePdfFile ? 'bg-green-500' : 'bg-gray-300'}`}></div>
                    <span className={resumePdfFile ? 'text-green-700 font-medium' : 'text-gray-500'}>
                      Resume PDF
                    </span>
                  </div>
                </div>
              </div>
              <Dialog>
                <DialogTrigger asChild>
                  <Button variant="outline" size="sm" className="flex items-center gap-1 sm:gap-2 bg-white hover:bg-gray-50 border-gray-300 text-xs px-2 py-1 sm:px-3 sm:py-2">
                    <User className="h-3 w-3 sm:h-4 sm:w-4" />
                    <span>{isUserDetailsComplete ? 'Edit' : 'Profile'}</span>
                    {!isUserDetailsComplete && <Badge variant="destructive" className="ml-1 px-1 py-0 text-xs">!</Badge>}
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
                  <DialogHeader>
                    <DialogTitle className="font-headline flex items-center gap-3 text-xl">
                      <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                        <User className="h-5 w-5 text-blue-600" />
                      </div>
                      Professional Profile Setup
                    </DialogTitle>
                    <DialogDescription className="text-base leading-relaxed">
                      Complete your profile to generate more personalized and professional emails. 
                      This information will be used for email signatures and personalization.
                    </DialogDescription>
                  </DialogHeader>
                  
                  <div className="py-6">
                    {/* Progress Indicator */}
                    <div className="mb-8">
                      <div className="flex items-center justify-between text-sm text-gray-600 mb-2">
                        <span>Profile Completion</span>
                        <span>{Math.round(((userDetails.name ? 1 : 0) + (userDetails.email ? 1 : 0) + (userDetails.phone ? 1 : 0) + (userDetails.skills ? 1 : 0) + (userDetails.projects ? 1 : 0)) / 5 * 100)}%</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div 
                          className="bg-gradient-to-r from-blue-500 to-indigo-500 h-2 rounded-full transition-all duration-300" 
                          style={{ width: `${((userDetails.name ? 1 : 0) + (userDetails.email ? 1 : 0) + (userDetails.phone ? 1 : 0) + (userDetails.skills ? 1 : 0) + (userDetails.projects ? 1 : 0)) / 5 * 100}%` }}
                        ></div>
                      </div>
                    </div>

                    {/* Essential Information */}
                    <div className="space-y-6">
                      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                        <h4 className="font-semibold text-blue-900 mb-3 flex items-center gap-2">
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                          Essential Information (Required for professional emails)
                        </h4>
                        <div className="grid gap-4">
                          <div className="space-y-2">
                            <Label htmlFor="name-dialog" className="flex items-center gap-2 font-medium">
                              Full Name 
                              <span className="text-red-500">*</span>
                              {userDetails.name && <span className="text-green-600 text-xs">✓</span>}
                            </Label>
                            <Input 
                              id="name-dialog" 
                              name="name" 
                              value={userDetails.name} 
                              onChange={handleDetailsChange} 
                              placeholder="e.g. Sarah Johnson"
                              className="focus:ring-2 focus:ring-blue-500 border-gray-300"
                            />
                            <p className="text-xs text-gray-500">This will appear in your email signature</p>
                          </div>
                          
                          <div className="grid md:grid-cols-2 gap-4">
                            <div className="space-y-2">
                              <Label htmlFor="email-dialog" className="flex items-center gap-2 font-medium">
                                Email Address 
                                <span className="text-red-500">*</span>
                                {userDetails.email && <span className="text-green-600 text-xs">✓</span>}
                              </Label>
                              <Input 
                                id="email-dialog" 
                                name="email" 
                                type="email"
                                value={userDetails.email} 
                                onChange={handleDetailsChange} 
                                placeholder="sarah.johnson@email.com"
                                className="focus:ring-2 focus:ring-blue-500 border-gray-300"
                              />
                              <p className="text-xs text-gray-500">Your professional contact email</p>
                            </div>
                            
                            <div className="space-y-2">
                              <Label htmlFor="phone-dialog" className="flex items-center gap-2 font-medium">
                                Phone Number
                                {userDetails.phone && <span className="text-green-600 text-xs">✓</span>}
                              </Label>
                              <Input 
                                id="phone-dialog" 
                                name="phone" 
                                value={userDetails.phone} 
                                onChange={handleDetailsChange} 
                                placeholder="(555) 123-4567"
                                className="focus:ring-2 focus:ring-blue-500 border-gray-300"
                              />
                              <p className="text-xs text-gray-500">Optional contact number</p>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Professional Details */}
                      <div className="bg-indigo-50 border border-indigo-200 rounded-lg p-4">
                        <h4 className="font-semibold text-indigo-900 mb-3 flex items-center gap-2">
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2-2v2m8 0H8m8 0v2a2 2 0 01-2 2H10a2 2 0 01-2-2V6" />
                          </svg>
                          Professional Details (Enhances personalization)
                        </h4>
                        <div className="space-y-4">
                          <div className="space-y-2">
                            <Label htmlFor="skills-dialog" className="flex items-center gap-2 font-medium">
                              Key Skills & Technologies
                              {userDetails.skills && <span className="text-green-600 text-xs">✓</span>}
                            </Label>
                            <Textarea 
                              id="skills-dialog" 
                              name="skills" 
                              value={userDetails.skills} 
                              onChange={handleDetailsChange} 
                              placeholder="React, Node.js, Python, Project Management, Data Analysis..."
                              className="focus:ring-2 focus:ring-blue-500 border-gray-300 min-h-[80px]"
                            />
                            <p className="text-xs text-gray-500">List your main technical and professional skills (comma-separated)</p>
                          </div>
                          
                          <div className="space-y-2">
                            <Label htmlFor="projects-dialog" className="flex items-center gap-2 font-medium">
                              Notable Projects & Achievements
                              {userDetails.projects && <span className="text-green-600 text-xs">✓</span>}
                            </Label>
                            <Textarea 
                              id="projects-dialog" 
                              name="projects" 
                              value={userDetails.projects} 
                              onChange={handleDetailsChange} 
                              placeholder="• Led development of e-commerce platform serving 10k+ users&#10;• Increased team productivity by 40% through process optimization&#10;• Built machine learning model with 95% accuracy"
                              className="focus:ring-2 focus:ring-blue-500 border-gray-300 min-h-[100px]"
                            />
                            <p className="text-xs text-gray-500">Highlight your most impressive work (one achievement per line, use • for bullets)</p>
                          </div>
                        </div>
                      </div>

                      {/* Profile Preview */}
                      {(userDetails.name || userDetails.email || userDetails.phone) && (
                        <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                          <h4 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                            </svg>
                            Email Signature Preview
                          </h4>
                          <div className="bg-white border rounded p-3 text-sm font-mono">
                            <div className="text-gray-600">
                              Best regards,<br/>
                              {userDetails.name || '[Your Name]'}<br/>
                              {userDetails.phone && `${userDetails.phone}`}<br/>
                              {userDetails.email && `${userDetails.email}`}
                            </div>
                          </div>
                        </div>
                      )}

                      {/* Action Buttons */}
                      <div className="flex gap-3 pt-4 border-t border-gray-200">
                        <DialogTrigger asChild>
                          <Button variant="outline" className="flex-1">
                            Cancel
                          </Button>
                        </DialogTrigger>
                        <DialogTrigger asChild>
                          <Button 
                            className="flex-1 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700"
                            disabled={!userDetails.name || !userDetails.email}
                          >
                            {isUserDetailsComplete ? 'Update Profile' : 'Save Profile'}
                          </Button>
                        </DialogTrigger>
                      </div>
                    </div>
                  </div>
                </DialogContent>
              </Dialog>
            </div>
          </div>
          
          <div className="p-3 sm:p-4 lg:p-6">
            <div className="grid gap-3 sm:gap-4 lg:grid-cols-2 lg:gap-6">
              {/* Job Posting Upload - Compact */}
              <div className="space-y-2 sm:space-y-3">
                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <Label htmlFor="jobImage" className="text-sm font-medium flex items-center gap-2 text-gray-900">
                      <FileText className="h-3 w-3 sm:h-4 sm:w-4 text-blue-600" />
                      Job Image
                      <span className="text-red-500">*</span>
                    </Label>
                    <p className="text-xs text-gray-500">Screenshot of job posting</p>
                  </div>
                  {jobImageFile ? (
                    <Badge variant="secondary" className="text-xs bg-green-50 text-green-700 border-green-200">
                      ✓
                    </Badge>
                  ) : (
                    <Badge variant="outline" className="text-xs text-red-600 border-red-200">
                      Required
                    </Badge>
                  )}
                </div>
                <div 
                  className="relative border-2 border-dashed border-gray-300 rounded-lg p-4 sm:p-6 text-center cursor-pointer hover:border-blue-400 hover:bg-blue-50/50 transition-all duration-200 h-32 sm:h-40 lg:h-48 flex flex-col items-center justify-center group"
                  onClick={() => jobImageInputRef.current?.click()}
                >
                  <input 
                    ref={jobImageInputRef} 
                    id="jobImage" 
                    name="jobImage" 
                    type="file" 
                    accept="image/*" 
                    className="hidden" 
                    onChange={(e) => handleFileChange(e, 'image')} 
                  />
                  {jobImageFile ? (
                    <>
                      {jobImageUrl && (
                        <Image 
                          src={jobImageUrl} 
                          alt="Job Posting Preview" 
                          fill 
                          className="object-contain rounded-lg p-1" 
                        />
                      )}
                      <Button 
                        variant="destructive" 
                        size="icon" 
                        className="absolute top-2 right-2 h-6 w-6 sm:h-8 sm:w-8 opacity-0 group-hover:opacity-100 transition-opacity shadow-lg" 
                        onClick={(e) => { e.stopPropagation(); handleRemoveFile('image'); }}
                      >
                        <X className="h-3 w-3 sm:h-4 sm:w-4" />
                      </Button>
                      {uploadProgress.job > 0 && uploadProgress.job < 100 && (
                        <div className="absolute bottom-2 left-2 right-2">
                          <Progress value={uploadProgress.job} className="h-1 sm:h-2" />
                        </div>
                      )}
                    </>
                  ) : (
                    <div className="flex flex-col items-center gap-2 text-gray-500 group-hover:text-blue-600 transition-colors">
                      <div className="w-8 h-8 sm:w-12 sm:h-12 bg-gray-100 group-hover:bg-blue-100 rounded-xl flex items-center justify-center transition-colors">
                        <UploadCloud className="h-4 w-4 sm:h-6 sm:w-6" />
                      </div>
                      <div className="space-y-1 text-center">
                        <p className="font-semibold text-xs sm:text-sm text-gray-900">Upload Job Image</p>
                        <p className="text-xs text-gray-400">PNG, JPG • Max 10MB</p>
                      </div>
                    </div>
                  )}
                </div>
                {jobImageFile && (
                  <div className="flex items-center justify-between text-xs bg-gray-50 rounded-lg p-2 border">
                    <div className="flex items-center gap-2">
                      <FileText className="h-3 w-3 text-blue-600" />
                      <span className="truncate font-medium">{jobImageFile.name}</span>
                    </div>
                    <span className="text-xs text-gray-500">{formatFileSize(jobImageFile.size)}</span>
                  </div>
                )}
              </div>

              {/* Resume Upload - Compact */}
              <div className="space-y-2 sm:space-y-3">
                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <Label htmlFor="resumePdf" className="text-sm font-medium flex items-center gap-2 text-gray-900">
                      <Paperclip className="h-3 w-3 sm:h-4 sm:w-4 text-indigo-600" />
                      Resume PDF
                      <span className="text-red-500">*</span>
                    </Label>
                    <p className="text-xs text-gray-500">Your professional resume</p>
                  </div>
                  {resumePdfFile ? (
                    <Badge variant="secondary" className="text-xs bg-green-50 text-green-700 border-green-200">
                      ✓
                    </Badge>
                  ) : (
                    <Badge variant="outline" className="text-xs text-red-600 border-red-200">
                      Required
                    </Badge>
                  )}
                </div>
                <div 
                  className="relative border-2 border-dashed border-gray-300 rounded-lg p-4 sm:p-6 text-center cursor-pointer hover:border-indigo-400 hover:bg-indigo-50/50 transition-all duration-200 h-32 sm:h-40 lg:h-48 flex flex-col items-center justify-center group"
                  onClick={() => resumePdfInputRef.current?.click()}
                >
                  <input 
                    ref={resumePdfInputRef} 
                    id="resumePdf" 
                    name="resumePdf" 
                    type="file" 
                    accept=".pdf" 
                    className="hidden" 
                    onChange={(e) => handleFileChange(e, 'pdf')} 
                  />
                  {resumePdfFile ? (
                    <>
                      <div className="flex flex-col items-center gap-2 text-indigo-600">
                        <div className="w-8 h-8 sm:w-12 sm:h-12 bg-indigo-100 rounded-xl flex items-center justify-center">
                          <FileText className="h-4 w-4 sm:h-6 sm:w-6" />
                        </div>
                        <div className="space-y-1 text-center">
                          <p className="font-semibold text-xs sm:text-sm truncate max-w-[120px] sm:max-w-[200px] text-gray-900">{resumePdfFile.name}</p>
                          <p className="text-xs text-gray-500">{formatFileSize(resumePdfFile.size)}</p>
                        </div>
                      </div>
                      <div className="absolute top-2 right-2 flex gap-1">
                        <Button 
                          variant="outline" 
                          size="icon" 
                          className="h-6 w-6 sm:h-8 sm:w-8 opacity-0 group-hover:opacity-100 transition-opacity shadow-lg bg-white" 
                          onClick={(e) => { e.stopPropagation(); handleDownloadResume(); }}
                        >
                          <Download className="h-3 w-3 sm:h-4 sm:w-4" />
                        </Button>
                        <Button 
                          variant="destructive" 
                          size="icon" 
                          className="h-6 w-6 sm:h-8 sm:w-8 opacity-0 group-hover:opacity-100 transition-opacity shadow-lg" 
                          onClick={(e) => { e.stopPropagation(); handleRemoveFile('pdf'); }}
                        >
                          <X className="h-3 w-3 sm:h-4 sm:w-4" />
                        </Button>
                      </div>
                      {uploadProgress.resume > 0 && uploadProgress.resume < 100 && (
                        <div className="absolute bottom-2 left-2 right-2">
                          <Progress value={uploadProgress.resume} className="h-1 sm:h-2" />
                        </div>
                      )}
                    </>
                  ) : (
                    <div className="flex flex-col items-center gap-2 text-gray-500 group-hover:text-indigo-600 transition-colors">
                      <div className="w-8 h-8 sm:w-12 sm:h-12 bg-gray-100 group-hover:bg-indigo-100 rounded-xl flex items-center justify-center transition-colors">
                        <FileText className="h-4 w-4 sm:h-6 sm:w-6" />
                      </div>
                      <div className="space-y-1 text-center">
                        <p className="font-semibold text-xs sm:text-sm text-gray-900">Upload Resume</p>
                        <p className="text-xs text-gray-400">PDF • Max 10MB</p>
                      </div>
                    </div>
                  )}
                </div>
                {resumePdfFile && (
                  <div className="flex items-center justify-between text-xs bg-gray-50 rounded-lg p-2 border">
                    <div className="flex items-center gap-2">
                      <Paperclip className="h-3 w-3 text-indigo-600" />
                      <span className="truncate font-medium">Ready to attach</span>
                    </div>
                    <Badge variant="secondary" className="text-xs">PDF</Badge>
                  </div>
                )}
              </div>
            </div>

            {/* Generate Button - Compact */}
            <div className="mt-4 sm:mt-6 pt-3 sm:pt-4 border-t border-gray-100">
              {!isFormValid && (
                <div className="mb-3 sm:mb-4 p-3 bg-amber-50 border border-amber-200 rounded-lg">
                  <div className="flex items-start gap-2">
                    <AlertCircle className="h-4 w-4 text-amber-600 mt-0.5 flex-shrink-0" />
                    <div>
                      <h4 className="font-medium text-amber-800 mb-1 text-sm">Missing Files</h4>
                      <ul className="text-xs text-amber-700 space-y-1">
                        {!jobImageFile && <li>• Job posting image required</li>}
                        {!resumePdfFile && <li>• Resume PDF required</li>}
                      </ul>
                    </div>
                  </div>
                </div>
              )}
              <SubmitButton disabled={!isFormValid} />
            </div>
          </div>
        </div>

        {/* Loading State */}
        {state.error === null && state.result === null && (
          <div className="hidden" />
        )}
      </form>

      {/* Loading Animation */}
      {!state.error && !state.result && currentStep === 1 && (
        <div className="hidden" />
      )}

      {/* Compact Error State */}
      {state.error && (
        <div className="bg-white border border-red-200 rounded-lg sm:rounded-xl shadow-sm overflow-hidden">
          <div className="bg-red-50 px-3 sm:px-4 py-3 sm:py-4 border-b border-red-100">
            <div className="flex items-center space-x-2">
              <div className="w-6 h-6 bg-red-600 rounded-lg flex items-center justify-center">
                <AlertCircle className="h-4 w-4 text-white" />
              </div>
              <h3 className="text-base sm:text-lg font-semibold text-gray-900">Generation Failed</h3>
            </div>
          </div>
          <div className="p-3 sm:p-4">
            <p className="text-gray-700 mb-4 text-sm sm:text-base leading-relaxed">{state.error}</p>
            <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
              <Button 
                variant="outline" 
                onClick={() => window.location.reload()}
                className="flex items-center gap-2 border-gray-300 hover:bg-gray-50 text-sm"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
                Try Again
              </Button>
              <Button 
                variant="ghost" 
                onClick={() => window.open('mailto:support@applygenius.com', '_blank')}
                className="flex items-center gap-2 text-gray-600 hover:text-gray-900 text-sm"
              >
                <Mail className="w-4 h-4" />
                Contact Support
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Step 2: Compact Email Review */}
      {generatedEmail && currentStep === 2 && (
        <div className="bg-white border border-gray-200 rounded-lg sm:rounded-xl shadow-sm overflow-hidden">
          <div className="bg-gradient-to-r from-green-50 to-emerald-50 px-3 sm:px-4 py-3 sm:py-4 border-b border-gray-100">
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <div className="flex items-center space-x-2">
                  <div className="w-6 h-6 bg-green-600 rounded-lg flex items-center justify-center">
                    <Mail className="h-4 w-4 text-white" />
                  </div>
                  <h3 className="text-base sm:text-lg font-semibold text-gray-900">Application Email</h3>
                </div>
                <p className="text-xs sm:text-sm text-gray-600">
                  Review and customize your email
                </p>
              </div>
              <Badge variant="secondary" className="bg-green-100 text-green-800 border-green-200 text-xs">
                ✓ Ready
              </Badge>
            </div>
          </div>
          
          <div className="p-4 sm:p-6">
            <div className="w-full max-w-none">
              <Tabs defaultValue="preview" className="w-full">
              <TabsList className="grid w-full grid-cols-2 mb-6 bg-gray-100 h-14 p-1 rounded-lg">
                <TabsTrigger 
                  value="preview" 
                  className="flex items-center justify-center gap-1.5 data-[state=active]:bg-white data-[state=active]:shadow-sm text-sm px-3 py-2 rounded-md transition-all duration-200 font-medium"
                >
                  <Eye className="h-4 w-4 flex-shrink-0" />
                  <span>Preview</span>
                </TabsTrigger>
                <TabsTrigger 
                  value="edit" 
                  className="flex items-center justify-center gap-1.5 data-[state=active]:bg-white data-[state=active]:shadow-sm text-sm px-3 py-2 rounded-md transition-all duration-200 font-medium"
                >
                  <Edit3 className="h-4 w-4 flex-shrink-0" />
                  <span>Edit</span>
                </TabsTrigger>
              </TabsList>
              
              <TabsContent value="preview" className="space-y-3 mt-0">
                {/* Email Header - Consistent Layout */}
                <div className="bg-gray-50 rounded-lg border">
                  <div className="p-4 space-y-3">
                    {/* To Field */}
                    <div className="space-y-1.5">
                      <div className="flex items-center gap-2">
                        <Mail className="h-4 w-4 text-gray-500 flex-shrink-0" />
                        <span className="font-medium text-gray-700 text-sm">To:</span>
                      </div>
                      <div className="ml-6 bg-white rounded-md px-3 py-2.5 border border-gray-200">
                        <span className="text-gray-900 font-mono text-sm break-all select-all block">
                          {generatedEmail.to}
                        </span>
                      </div>
                    </div>
                    
                    {/* Subject Field */}
                    <div className="space-y-1.5">
                      <span className="font-medium text-gray-700 text-sm ml-6">Subject:</span>
                      <div className="ml-6 bg-white rounded-md px-3 py-2.5 border border-gray-200">
                        <span className="text-gray-900 text-sm break-words select-all block">
                          {generatedEmail.subject}
                        </span>
                      </div>
                    </div>
                    
                    {/* Attachment Field */}
                    {resumePdfFile && (
                      <div className="space-y-1.5">
                        <div className="flex items-center gap-2">
                          <Paperclip className="h-4 w-4 text-gray-500 flex-shrink-0" />
                          <span className="font-medium text-gray-700 text-sm">Attachment:</span>
                        </div>
                        <div className="ml-6 bg-white rounded-md px-3 py-2.5 border border-gray-200">
                          <div className="flex items-center justify-between gap-2">
                            <span className="text-gray-900 text-sm truncate min-w-0 flex-1">
                              {resumePdfFile.name}
                            </span>
                            <Badge variant="outline" className="text-xs flex-shrink-0">PDF</Badge>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
                
                {/* Email Body - Consistent Layout */}
                <div className="bg-white border-2 border-gray-200 rounded-lg">
                  <div className="p-4">
                    <div className="max-h-[350px] sm:max-h-[400px] overflow-auto mobile-scroll">
                      <pre className="whitespace-pre-wrap font-sans text-sm leading-relaxed text-gray-900 break-words select-all">
                        {generatedEmail.body}
                      </pre>
                    </div>
                  </div>
                </div>
              </TabsContent>
              
              <TabsContent value="edit" className="space-y-3 mt-0">
                <div className="space-y-4">
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div className="space-y-2 w-full min-w-0">
                      <Label htmlFor="emailTo" className="text-sm font-medium text-gray-900">Recipient Email</Label>
                      <Input 
                        id="emailTo" 
                        value={generatedEmail.to} 
                        onChange={(e) => handleEmailEdit('to', e.target.value)}
                        className="focus:ring-2 focus:ring-blue-500 border-gray-300 text-sm h-11 w-full font-mono"
                        placeholder="recipient@company.com"
                      />
                    </div>
                    <div className="space-y-2 w-full min-w-0">
                      <Label htmlFor="emailSubject" className="text-sm font-medium text-gray-900">Subject Line</Label>
                      <Input 
                        id="emailSubject" 
                        value={generatedEmail.subject} 
                        onChange={(e) => handleEmailEdit('subject', e.target.value)}
                        className="focus:ring-2 focus:ring-blue-500 border-gray-300 text-sm h-11 w-full"
                        placeholder="Email subject line"
                      />
                    </div>
                  </div>
                  <div className="space-y-2 w-full">
                    <Label htmlFor="emailBody" className="text-sm font-medium text-gray-900">Email Content</Label>
                    <Textarea 
                      id="emailBody" 
                      value={generatedEmail.body} 
                      onChange={(e) => handleEmailEdit('body', e.target.value)}
                      className="min-h-[350px] sm:min-h-[400px] focus:ring-2 focus:ring-blue-500 border-gray-300 font-mono text-sm w-full resize-y mobile-scroll"
                      placeholder="Your email content..."
                    />
                  </div>
                </div>
              </TabsContent>
            </Tabs>
            </div>
            
            {/* Action Buttons - Modern Design */}
            <div className="mt-6 pt-6 border-t border-gray-200">
              <div className="flex flex-col sm:flex-row gap-3">
                <Button 
                  onClick={handleCopy} 
                  variant="outline" 
                  size="lg"
                  className="flex-1 flex items-center justify-center gap-2 h-14 border-gray-300 hover:bg-gray-50 hover:border-gray-400 text-sm font-medium transition-all duration-200"
                >
                  {copied ? (
                    <>
                      <Check className="h-4 w-4 text-green-600 flex-shrink-0" />
                      <span>Copied to Clipboard!</span>
                    </>
                  ) : (
                    <>
                      <Clipboard className="h-4 w-4 flex-shrink-0" />
                      <span>Copy Email</span>
                    </>
                  )}
                </Button>
                <Button 
                  onClick={handleOpenInGmail} 
                  size="lg"
                  className="flex-1 flex items-center justify-center gap-2 h-14 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white shadow-lg hover:shadow-xl text-sm font-medium transition-all duration-200"
                >
                  <Send className="h-4 w-4 flex-shrink-0" />
                  <span>Send via Gmail</span>
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

