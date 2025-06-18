import React from 'react';
import { ArrowLeft, Shield, Eye, Lock, Database, Globe, UserCheck, AlertCircle } from 'lucide-react';

interface PrivacyPolicyProps {
  onBack: () => void;
}

const PrivacyPolicy: React.FC<PrivacyPolicyProps> = ({ onBack }) => {
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
              <Shield className="w-8 h-8 text-purple-400" />
              <h1 className="text-4xl font-bold text-white">Privacy Policy</h1>
            </div>
            <p className="text-gray-300 text-lg">
              How we protect and handle your personal information
            </p>
            <p className="text-gray-400 text-sm mt-2">
              Last updated: {new Date().toLocaleDateString('en-US', { 
                year: 'numeric', 
                month: 'long', 
                day: 'numeric' 
              })}
            </p>
          </div>

          {/* Privacy Commitment Banner */}
          <div className="bg-green-500/20 border border-green-500/50 rounded-xl p-6 mb-8">
            <div className="flex items-start gap-4">
              <Lock className="w-8 h-8 text-green-400 mt-1" />
              <div>
                <h3 className="text-xl font-semibold text-green-200 mb-2">Privacy-First Design</h3>
                <p className="text-green-300">
                  Our QR Business Card Generator is designed with privacy at its core. All processing 
                  happens locally in your browser, and we do not store or transmit your personal 
                  contact information to our servers.
                </p>
              </div>
            </div>
          </div>

          {/* Content */}
          <div className="bg-white/10 backdrop-blur-sm rounded-xl p-8 space-y-8">
            
            {/* Introduction */}
            <section>
              <div className="flex items-center gap-3 mb-4">
                <Eye className="w-6 h-6 text-purple-400" />
                <h2 className="text-2xl font-semibold text-white">1. Introduction</h2>
              </div>
              <div className="text-gray-300 space-y-4">
                <p>
                  This Privacy Policy explains how QR Business Card Generator ("we," "our," or "us") 
                  collects, uses, processes, and protects your information when you use our service. 
                  We are committed to protecting your privacy and ensuring transparency about our 
                  data practices.
                </p>
                <p>
                  By using our Service, you consent to the data practices described in this policy. 
                  If you do not agree with our practices, please do not use our Service.
                </p>
              </div>
            </section>

            {/* Information We Collect */}
            <section>
              <div className="flex items-center gap-3 mb-4">
                <Database className="w-6 h-6 text-purple-400" />
                <h2 className="text-2xl font-semibold text-white">2. Information We Collect</h2>
              </div>
              <div className="text-gray-300 space-y-4">
                <h3 className="text-xl font-semibold text-white">2.1 Contact Information (Processed Locally)</h3>
                <p>
                  When you use our QR code generation features, you may provide:
                </p>
                <ul className="list-disc list-inside space-y-2 ml-4">
                  <li>Names (including prefixes and suffixes)</li>
                  <li>Phone numbers (mobile, work, home, fax)</li>
                  <li>Email addresses</li>
                  <li>Organization and job title information</li>
                  <li>Address components (street, city, state, country)</li>
                  <li>Website URLs</li>
                  <li>Custom messages and notes</li>
                </ul>
                <div className="bg-blue-500/20 border border-blue-500/50 rounded-lg p-4">
                  <p className="text-blue-200 font-medium">Important: Local Processing</p>
                  <p className="text-blue-300 text-sm mt-1">
                    All contact information is processed entirely within your browser. This data is 
                    not transmitted to our servers or stored by us.
                  </p>
                </div>

                <h3 className="text-xl font-semibold text-white mt-6">2.2 Technical Information</h3>
                <p>We may collect limited technical information including:</p>
                <ul className="list-disc list-inside space-y-2 ml-4">
                  <li>Browser type and version</li>
                  <li>Operating system information</li>
                  <li>IP address (for security and analytics)</li>
                  <li>Usage patterns and feature preferences</li>
                  <li>Error logs and performance metrics</li>
                </ul>

                <h3 className="text-xl font-semibold text-white mt-6">2.3 Uploaded Files</h3>
                <p>
                  When you upload images or CSV files:
                </p>
                <ul className="list-disc list-inside space-y-2 ml-4">
                  <li>Files are processed temporarily in your browser</li>
                  <li>Business card images are processed for OCR extraction</li>
                  <li>CSV files are parsed for contact information</li>
                  <li>Files are not permanently stored on our servers</li>
                </ul>
              </div>
            </section>

            {/* How We Use Information */}
            <section>
              <div className="flex items-center gap-3 mb-4">
                <UserCheck className="w-6 h-6 text-purple-400" />
                <h2 className="text-2xl font-semibold text-white">3. How We Use Your Information</h2>
              </div>
              <div className="text-gray-300 space-y-4">
                <p>We use the collected information for the following purposes:</p>
                
                <h3 className="text-xl font-semibold text-white">3.1 Service Provision</h3>
                <ul className="list-disc list-inside space-y-2 ml-4">
                  <li>Generate QR codes and vCards from your contact information</li>
                  <li>Create professional business card templates</li>
                  <li>Process bulk contact data from CSV files</li>
                  <li>Provide OCR scanning capabilities for business cards</li>
                  <li>Enable customization of QR code styles and templates</li>
                </ul>

                <h3 className="text-xl font-semibold text-white mt-6">3.2 Service Improvement</h3>
                <ul className="list-disc list-inside space-y-2 ml-4">
                  <li>Analyze usage patterns to improve functionality</li>
                  <li>Monitor performance and fix technical issues</li>
                  <li>Develop new features based on user needs</li>
                  <li>Ensure security and prevent abuse</li>
                </ul>

                <h3 className="text-xl font-semibold text-white mt-6">3.3 Legal Compliance</h3>
                <ul className="list-disc list-inside space-y-2 ml-4">
                  <li>Comply with applicable laws and regulations</li>
                  <li>Respond to legal requests and court orders</li>
                  <li>Protect our rights and prevent fraud</li>
                  <li>Ensure service security and integrity</li>
                </ul>
              </div>
            </section>

            {/* Data Security */}
            <section>
              <div className="flex items-center gap-3 mb-4">
                <Lock className="w-6 h-6 text-purple-400" />
                <h2 className="text-2xl font-semibold text-white">4. Data Security</h2>
              </div>
              <div className="text-gray-300 space-y-4">
                <p>We implement comprehensive security measures to protect your information:</p>
                
                <h3 className="text-xl font-semibold text-white">4.1 Technical Safeguards</h3>
                <ul className="list-disc list-inside space-y-2 ml-4">
                  <li>HTTPS encryption for all data transmission</li>
                  <li>Client-side processing to minimize data exposure</li>
                  <li>Secure coding practices and regular security audits</li>
                  <li>Protection against common web vulnerabilities</li>
                </ul>

                <h3 className="text-xl font-semibold text-white mt-6">4.2 Data Minimization</h3>
                <ul className="list-disc list-inside space-y-2 ml-4">
                  <li>We collect only the minimum data necessary for service operation</li>
                  <li>Contact information is processed locally without server storage</li>
                  <li>Temporary files are automatically cleared from memory</li>
                  <li>No persistent storage of personal contact details</li>
                </ul>

                <div className="bg-amber-500/20 border border-amber-500/50 rounded-lg p-4 mt-4">
                  <div className="flex items-start gap-3">
                    <AlertCircle className="w-5 h-5 text-amber-400 mt-0.5" />
                    <div>
                      <p className="text-amber-200 font-medium">Security Notice</p>
                      <p className="text-amber-300 text-sm mt-1">
                        While we implement strong security measures, no system is 100% secure. 
                        Please ensure your own devices are secure when using our Service.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </section>

            {/* Data Sharing */}
            <section>
              <div className="flex items-center gap-3 mb-4">
                <Globe className="w-6 h-6 text-purple-400" />
                <h2 className="text-2xl font-semibold text-white">5. Data Sharing and Disclosure</h2>
              </div>
              <div className="text-gray-300 space-y-4">
                <p>
                  We do not sell, trade, or otherwise transfer your personal contact information to 
                  third parties. Limited data sharing may occur in the following circumstances:
                </p>
                
                <h3 className="text-xl font-semibold text-white">5.1 Service Providers</h3>
                <ul className="list-disc list-inside space-y-2 ml-4">
                  <li>Hosting and infrastructure providers (limited technical data only)</li>
                  <li>Analytics services for service improvement (anonymized data)</li>
                  <li>Security services for fraud prevention</li>
                </ul>

                <h3 className="text-xl font-semibold text-white mt-6">5.2 Legal Requirements</h3>
                <ul className="list-disc list-inside space-y-2 ml-4">
                  <li>When required by law or legal process</li>
                  <li>To protect our rights and property</li>
                  <li>To ensure user safety and service security</li>
                  <li>In connection with business transfers or mergers</li>
                </ul>

                <p className="font-medium text-green-300">
                  Important: Your contact information processed for QR code generation is never 
                  shared with third parties as it remains on your device.
                </p>
              </div>
            </section>

            {/* Your Rights */}
            <section>
              <h2 className="text-2xl font-semibold text-white mb-4">6. Your Privacy Rights</h2>
              <div className="text-gray-300 space-y-4">
                <p>You have the following rights regarding your personal information:</p>
                
                <ul className="list-disc list-inside space-y-2 ml-4">
                  <li><strong>Access:</strong> Request information about data we collect</li>
                  <li><strong>Correction:</strong> Request correction of inaccurate information</li>
                  <li><strong>Deletion:</strong> Request deletion of your personal data</li>
                  <li><strong>Portability:</strong> Request a copy of your data in a portable format</li>
                  <li><strong>Restriction:</strong> Request limitation of processing activities</li>
                  <li><strong>Objection:</strong> Object to certain types of data processing</li>
                </ul>

                <p>
                  To exercise these rights or ask questions about our privacy practices, 
                  please contact us using the information provided in our Service.
                </p>
              </div>
            </section>

            {/* International Transfers */}
            <section>
              <h2 className="text-2xl font-semibold text-white mb-4">7. International Data Transfers</h2>
              <div className="text-gray-300 space-y-4">
                <p>
                  Our Service may be accessed from various countries. When you use our Service:
                </p>
                <ul className="list-disc list-inside space-y-2 ml-4">
                  <li>Your contact information is processed locally on your device</li>
                  <li>Limited technical data may be transferred to our service infrastructure</li>
                  <li>We ensure appropriate safeguards for international data transfers</li>
                  <li>We comply with applicable data protection regulations</li>
                </ul>
              </div>
            </section>

            {/* Children's Privacy */}
            <section>
              <h2 className="text-2xl font-semibold text-white mb-4">8. Children's Privacy</h2>
              <div className="text-gray-300 space-y-4">
                <p>
                  Our Service is designed for professional and business use. We do not knowingly 
                  collect personal information from children under 13 years of age. If you are 
                  under 13, please do not use our Service or provide any personal information.
                </p>
                <p>
                  If we become aware that we have collected personal information from a child 
                  under 13, we will take steps to delete such information promptly.
                </p>
              </div>
            </section>

            {/* Changes to Privacy Policy */}
            <section>
              <h2 className="text-2xl font-semibold text-white mb-4">9. Changes to This Privacy Policy</h2>
              <div className="text-gray-300 space-y-4">
                <p>
                  We may update this Privacy Policy from time to time. When we make changes:
                </p>
                <ul className="list-disc list-inside space-y-2 ml-4">
                  <li>We will update the "Last updated" date</li>
                  <li>We will notify users of significant changes through our Service</li>
                  <li>We will provide a reasonable notice period for material changes</li>
                  <li>Continued use of the Service constitutes acceptance of updates</li>
                </ul>
              </div>
            </section>

            {/* Contact Information */}
            <section>
              <h2 className="text-2xl font-semibold text-white mb-4">10. Contact Us</h2>
              <div className="text-gray-300 space-y-4">
                <p>
                  If you have any questions about this Privacy Policy, our data practices, 
                  or wish to exercise your privacy rights, please contact us through the 
                  contact information provided in our Service.
                </p>
                <p>
                  We are committed to addressing your privacy concerns and will respond to 
                  your inquiries in a timely manner.
                </p>
              </div>
            </section>

          </div>

          {/* Footer */}
          <div className="text-center mt-8">
            <p className="text-gray-400 text-sm">
              We are committed to protecting your privacy and maintaining the security of your personal information.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PrivacyPolicy; 