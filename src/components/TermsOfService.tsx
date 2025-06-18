import React from 'react';
import { ArrowLeft, Shield, Users, Globe, FileText, AlertTriangle, Scale } from 'lucide-react';

interface TermsOfServiceProps {
  onBack: () => void;
}

const TermsOfService: React.FC<TermsOfServiceProps> = ({ onBack }) => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center mb-8">
          <button
            onClick={onBack}
            className="flex items-center gap-2 text-white hover:text-purple-300 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
            Back to Home
          </button>
        </div>

        <div className="max-w-4xl mx-auto">
          {/* Title Section */}
          <div className="text-center mb-12">
            <div className="flex items-center justify-center gap-3 mb-4">
              <Scale className="w-8 h-8 text-purple-400" />
              <h1 className="text-4xl font-bold text-white">Terms of Service</h1>
            </div>
            <p className="text-gray-300 text-lg">
              Professional QR Business Card Generator - Legal Terms and Conditions
            </p>
            <p className="text-gray-400 text-sm mt-2">
              Last updated: {new Date().toLocaleDateString('en-US', { 
                year: 'numeric', 
                month: 'long', 
                day: 'numeric' 
              })}
            </p>
          </div>

          {/* Content */}
          <div className="bg-white/10 backdrop-blur-sm rounded-xl p-8 space-y-8">
            
            {/* Introduction */}
            <section>
              <div className="flex items-center gap-3 mb-4">
                <FileText className="w-6 h-6 text-purple-400" />
                <h2 className="text-2xl font-semibold text-white">1. Introduction</h2>
              </div>
              <div className="text-gray-300 space-y-4">
                <p>
                  Welcome to QR Business Card Generator ("we," "our," or "us"). These Terms of Service ("Terms") 
                  govern your use of our professional QR code and business card generation service, including our 
                  website, applications, and related services (collectively, the "Service").
                </p>
                <p>
                  By accessing or using our Service, you agree to be bound by these Terms. If you disagree with 
                  any part of these terms, then you may not access the Service.
                </p>
              </div>
            </section>

            {/* Service Description */}
            <section>
              <div className="flex items-center gap-3 mb-4">
                <Globe className="w-6 h-6 text-purple-400" />
                <h2 className="text-2xl font-semibold text-white">2. Service Description</h2>
              </div>
              <div className="text-gray-300 space-y-4">
                <p>
                  Our Service provides tools for creating professional QR codes and business cards, including:
                </p>
                <ul className="list-disc list-inside space-y-2 ml-4">
                  <li>Single and bulk QR code generation for contact information</li>
                  <li>Professional business card templates with customizable designs</li>
                  <li>vCard file generation for easy contact sharing</li>
                  <li>OCR scanning capabilities for business card digitization</li>
                  <li>Excel/CSV template processing for bulk operations</li>
                  <li>International contact format support</li>
                </ul>
                <p>
                  The Service is designed for professional use by individuals, businesses, and organizations 
                  worldwide for legitimate business networking and contact management purposes.
                </p>
              </div>
            </section>

            {/* User Responsibilities */}
            <section>
              <div className="flex items-center gap-3 mb-4">
                <Users className="w-6 h-6 text-purple-400" />
                <h2 className="text-2xl font-semibold text-white">3. User Responsibilities</h2>
              </div>
              <div className="text-gray-300 space-y-4">
                <p>By using our Service, you agree to:</p>
                <ul className="list-disc list-inside space-y-2 ml-4">
                  <li>Provide accurate and truthful information in your business cards and contact details</li>
                  <li>Use the Service only for lawful business and professional networking purposes</li>
                  <li>Respect intellectual property rights and not use copyrighted materials without permission</li>
                  <li>Not generate QR codes or business cards containing harmful, offensive, or illegal content</li>
                  <li>Not attempt to reverse engineer, hack, or compromise the Service's security</li>
                  <li>Comply with all applicable local, national, and international laws and regulations</li>
                </ul>
                <div className="bg-yellow-500/20 border border-yellow-500/50 rounded-lg p-4 mt-4">
                  <div className="flex items-start gap-3">
                    <AlertTriangle className="w-5 h-5 text-yellow-400 mt-0.5" />
                    <div>
                      <p className="text-yellow-200 font-medium">Important Notice</p>
                      <p className="text-yellow-300 text-sm mt-1">
                        You are solely responsible for the content you create and share using our Service. 
                        Ensure all contact information is accurate and that you have permission to use any 
                        logos, images, or other materials.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </section>

            {/* Data and Privacy */}
            <section>
              <div className="flex items-center gap-3 mb-4">
                <Shield className="w-6 h-6 text-purple-400" />
                <h2 className="text-2xl font-semibold text-white">4. Data Processing and Privacy</h2>
              </div>
              <div className="text-gray-300 space-y-4">
                <p>
                  Our Service processes contact information and business card data to provide QR code generation 
                  and related services. Key points regarding data handling:
                </p>
                <ul className="list-disc list-inside space-y-2 ml-4">
                  <li>All QR code generation and processing occurs locally in your browser</li>
                  <li>We do not store or transmit your personal contact information to our servers</li>
                  <li>Uploaded images and files are processed temporarily and not permanently stored</li>
                  <li>Generated QR codes and vCards are created on your device</li>
                  <li>Our Privacy Policy provides detailed information about data collection and use</li>
                </ul>
                <p>
                  For complete details on how we handle your data, please review our Privacy Policy, 
                  which is incorporated into these Terms by reference.
                </p>
              </div>
            </section>

            {/* Intellectual Property */}
            <section>
              <h2 className="text-2xl font-semibold text-white mb-4">5. Intellectual Property</h2>
              <div className="text-gray-300 space-y-4">
                <p>
                  The Service, including its design, functionality, and underlying technology, is owned by us 
                  and protected by intellectual property laws. You retain ownership of the content you create 
                  using our Service, including:
                </p>
                <ul className="list-disc list-inside space-y-2 ml-4">
                  <li>Your contact information and business details</li>
                  <li>Generated QR codes containing your information</li>
                  <li>Custom business card designs you create</li>
                  <li>Any logos or images you upload (subject to your ownership rights)</li>
                </ul>
              </div>
            </section>

            {/* Service Availability */}
            <section>
              <h2 className="text-2xl font-semibold text-white mb-4">6. Service Availability</h2>
              <div className="text-gray-300 space-y-4">
                <p>
                  We strive to maintain high service availability, but we cannot guarantee uninterrupted access. 
                  The Service may be temporarily unavailable due to:
                </p>
                <ul className="list-disc list-inside space-y-2 ml-4">
                  <li>Scheduled maintenance and updates</li>
                  <li>Technical issues or server problems</li>
                  <li>Force majeure events beyond our control</li>
                  <li>Security incidents requiring service suspension</li>
                </ul>
                <p>
                  We will make reasonable efforts to provide notice of planned maintenance when possible.
                </p>
              </div>
            </section>

            {/* Limitation of Liability */}
            <section>
              <h2 className="text-2xl font-semibold text-white mb-4">7. Limitation of Liability</h2>
              <div className="text-gray-300 space-y-4">
                <p>
                  To the maximum extent permitted by law, we shall not be liable for any indirect, incidental, 
                  special, consequential, or punitive damages, including but not limited to:
                </p>
                <ul className="list-disc list-inside space-y-2 ml-4">
                  <li>Loss of profits, data, or business opportunities</li>
                  <li>Service interruptions or technical failures</li>
                  <li>Errors in generated QR codes or business cards</li>
                  <li>Third-party actions or misuse of generated content</li>
                </ul>
                <p>
                  Our total liability for any claim related to the Service shall not exceed the amount 
                  you paid for the Service in the twelve months preceding the claim.
                </p>
              </div>
            </section>

            {/* Modifications */}
            <section>
              <h2 className="text-2xl font-semibold text-white mb-4">8. Modifications to Terms</h2>
              <div className="text-gray-300 space-y-4">
                <p>
                  We reserve the right to modify these Terms at any time. When we make changes, we will:
                </p>
                <ul className="list-disc list-inside space-y-2 ml-4">
                  <li>Update the "Last updated" date at the top of this page</li>
                  <li>Notify users of significant changes through the Service interface</li>
                  <li>Provide a reasonable notice period for material changes</li>
                </ul>
                <p>
                  Your continued use of the Service after any modifications constitutes acceptance of the 
                  updated Terms.
                </p>
              </div>
            </section>

            {/* Contact Information */}
            <section>
              <h2 className="text-2xl font-semibold text-white mb-4">9. Contact Information</h2>
              <div className="text-gray-300 space-y-4">
                <p>
                  If you have any questions about these Terms of Service, please contact us through 
                  the contact information provided in our Service or Privacy Policy.
                </p>
                <p>
                  For legal notices and formal communications, please use the official contact methods 
                  specified in our Service documentation.
                </p>
              </div>
            </section>

            {/* Governing Law */}
            <section>
              <h2 className="text-2xl font-semibold text-white mb-4">10. Governing Law</h2>
              <div className="text-gray-300 space-y-4">
                <p>
                  These Terms shall be governed by and construed in accordance with applicable international 
                  laws and regulations. Any disputes arising from these Terms or the use of our Service 
                  shall be resolved through appropriate legal channels in the jurisdiction where our 
                  Service is operated.
                </p>
              </div>
            </section>

          </div>

          {/* Footer */}
          <div className="text-center mt-8">
            <p className="text-gray-400 text-sm">
              By using our QR Business Card Generator, you acknowledge that you have read, understood, 
              and agree to be bound by these Terms of Service.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TermsOfService; 