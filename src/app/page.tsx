import CoverProClient from '@/components/cover-pro-client';
import { ApplyGeniusIcon } from '@/components/icons';

export default function Home() {
  return (
    <div className="min-h-screen bg-white">
      {/* Compact Header */}
      <header className="border-b border-gray-100 bg-white/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-3 sm:px-4 lg:px-6 py-3 sm:py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2 sm:space-x-3">
              <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-br from-blue-600 to-indigo-700 rounded-xl flex items-center justify-center shadow-lg">
                <ApplyGeniusIcon className="h-5 w-5 sm:h-6 sm:w-6 text-white" />
              </div>
              <div>
                <h1 className="text-lg sm:text-xl font-bold text-gray-900">ApplyGenius</h1>
                <p className="text-xs text-gray-500 hidden sm:block">AI-Powered Career Solutions</p>
              </div>
            </div>
            <div className="hidden md:flex items-center space-x-6 text-sm text-gray-600">
              <span className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <span>AI Online</span>
              </span>
            </div>
          </div>
        </div>
      </header>

      {/* Compact Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-gray-50 via-white to-blue-50/30">
        <div className="absolute inset-0 bg-grid-gray-100/50 [mask-image:linear-gradient(0deg,white,rgba(255,255,255,0.6))]"></div>
        <div className="relative container mx-auto px-3 sm:px-4 lg:px-6 py-8 sm:py-12 lg:py-16">
          <div className="max-w-4xl mx-auto text-center">
            <div className="inline-flex items-center px-3 py-1.5 sm:px-4 sm:py-2 bg-blue-50 border border-blue-200 rounded-full text-blue-700 text-xs sm:text-sm font-medium mb-4 sm:mb-6">
              <span className="w-2 h-2 bg-blue-500 rounded-full mr-2 animate-pulse"></span>
              Trusted by 10,000+ professionals
            </div>
            
            <h1 className="text-2xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-gray-900 mb-4 sm:mb-6 leading-tight">
              Land Your
              <span className="block bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 bg-clip-text text-transparent">
                Dream Job
              </span>
            </h1>
            
            <p className="text-base sm:text-lg md:text-xl text-gray-600 mb-6 sm:mb-8 max-w-3xl mx-auto leading-relaxed">
              Create compelling, personalized job application emails that get noticed. 
              Our AI analyzes job postings and your resume to craft the perfect pitch.
            </p>

            {/* Compact Key Benefits */}
            <div className="grid gap-3 sm:gap-4 md:grid-cols-3 max-w-4xl mx-auto mb-6 sm:mb-8">
              <div className="bg-white/60 backdrop-blur-sm border border-gray-200 rounded-xl p-3 sm:p-4 lg:p-6 text-center hover:shadow-lg transition-all duration-300">
                <div className="w-8 h-8 sm:w-10 sm:h-10 lg:w-12 lg:h-12 bg-blue-100 rounded-xl flex items-center justify-center mx-auto mb-2 sm:mb-3 lg:mb-4">
                  <svg className="w-4 h-4 sm:w-5 sm:h-5 lg:w-6 lg:h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                </div>
                <h3 className="font-semibold text-gray-900 mb-1 sm:mb-2 text-sm sm:text-base">Instant Generation</h3>
                <p className="text-gray-600 text-xs sm:text-sm">Get professional emails in under 30 seconds</p>
              </div>
              
              <div className="bg-white/60 backdrop-blur-sm border border-gray-200 rounded-xl p-3 sm:p-4 lg:p-6 text-center hover:shadow-lg transition-all duration-300">
                <div className="w-8 h-8 sm:w-10 sm:h-10 lg:w-12 lg:h-12 bg-indigo-100 rounded-xl flex items-center justify-center mx-auto mb-2 sm:mb-3 lg:mb-4">
                  <svg className="w-4 h-4 sm:w-5 sm:h-5 lg:w-6 lg:h-6 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                  </svg>
                </div>
                <h3 className="font-semibold text-gray-900 mb-1 sm:mb-2 text-sm sm:text-base">AI-Powered Matching</h3>
                <p className="text-gray-600 text-xs sm:text-sm">Smart analysis of job requirements and your skills</p>
              </div>
              
              <div className="bg-white/60 backdrop-blur-sm border border-gray-200 rounded-xl p-3 sm:p-4 lg:p-6 text-center hover:shadow-lg transition-all duration-300 md:col-span-1">
                <div className="w-8 h-8 sm:w-10 sm:h-10 lg:w-12 lg:h-12 bg-purple-100 rounded-xl flex items-center justify-center mx-auto mb-2 sm:mb-3 lg:mb-4">
                  <svg className="w-4 h-4 sm:w-5 sm:h-5 lg:w-6 lg:h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <h3 className="font-semibold text-gray-900 mb-1 sm:mb-2 text-sm sm:text-base">Higher Success Rate</h3>
                <p className="text-gray-600 text-xs sm:text-sm">3x more likely to get interview callbacks</p>
              </div>
            </div>

            {/* Compact CTA Button */}
            <div className="flex justify-center">
              <a href="#application" className="inline-flex items-center px-6 py-3 sm:px-8 sm:py-4 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-semibold rounded-xl sm:rounded-2xl hover:from-blue-700 hover:to-indigo-700 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-1 text-sm sm:text-base">
                <span>Start Creating Your Email</span>
                <svg className="ml-2 w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                </svg>
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* Compact Main Application Section */}
      <section id="application" className="py-8 sm:py-12 lg:py-16 bg-white">
        <div className="container mx-auto px-3 sm:px-4 lg:px-6">
          <div className="max-w-4xl lg:max-w-6xl mx-auto">
            {/* Compact Section Header */}
            <div className="text-center mb-6 sm:mb-8 lg:mb-12">
              <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900 mb-2 sm:mb-4">
                Create Your Application Email
              </h2>
              <p className="text-sm sm:text-base lg:text-lg text-gray-600 max-w-2xl mx-auto">
                Follow these simple steps to generate a professional, personalized job application email
              </p>
            </div>

            {/* Application Component */}
            <CoverProClient />
          </div>
        </div>
      </section>

      {/* Compact Footer */}
      <footer className="bg-gray-50 border-t border-gray-200">
        <div className="container mx-auto px-3 sm:px-4 lg:px-6 py-6 sm:py-8 lg:py-12">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center space-x-2 sm:space-x-3">
              <div className="w-6 h-6 sm:w-8 sm:h-8 bg-gradient-to-br from-blue-600 to-indigo-700 rounded-lg flex items-center justify-center">
                <ApplyGeniusIcon className="h-4 w-4 sm:h-5 sm:w-5 text-white" />
              </div>
              <div>
                <span className="font-semibold text-gray-900 text-sm sm:text-base">ApplyGenius</span>
                <p className="text-xs text-gray-500">© 2025 All rights reserved</p>
              </div>
            </div>
            <div className="flex flex-wrap items-center justify-center gap-2 sm:gap-4 text-xs sm:text-sm text-gray-600">
              <span>Powered by Advanced AI</span>
              <span className="hidden sm:inline">•</span>
              <span>Secure & Private</span>
              <span className="hidden sm:inline">•</span>
              <span>Enterprise Ready</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
