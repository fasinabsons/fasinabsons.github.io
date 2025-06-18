import React from 'react';
import { ArrowLeft, QrCode, Users, Globe, Zap, Shield, Smartphone, Download, Star, CheckCircle } from 'lucide-react';

interface AboutProps {
  onBack: () => void;
}

const About: React.FC<AboutProps> = ({ onBack }) => {
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

        <div className="max-w-6xl mx-auto">
          {/* Hero Section */}
          <div className="text-center mb-16">
            <div className="flex items-center justify-center gap-3 mb-6">
              <QrCode className="w-12 h-12 text-purple-400" />
              <h1 className="text-5xl font-bold text-white">QR Business Card Generator</h1>
            </div>
            <p className="text-xl text-gray-300 max-w-3xl mx-auto leading-relaxed">
              The most comprehensive and professional QR code business card generator designed for 
              modern professionals, businesses, and organizations worldwide. Create stunning QR codes 
              and business cards with advanced features and international support.
            </p>
          </div>

          {/* Key Features Grid */}
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16">
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 text-center">
              <div className="w-16 h-16 bg-purple-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <Smartphone className="w-8 h-8 text-purple-400" />
              </div>
              <h3 className="text-xl font-semibold text-white mb-3">Smart OCR Scanning</h3>
              <p className="text-gray-300 text-sm">
                Advanced OCR technology that intelligently extracts contact information from business 
                cards, supporting multiple languages and complex layouts.
              </p>
            </div>

            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 text-center">
              <div className="w-16 h-16 bg-blue-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <Users className="w-8 h-8 text-blue-400" />
              </div>
              <h3 className="text-xl font-semibold text-white mb-3">Bulk Processing</h3>
              <p className="text-gray-300 text-sm">
                Professional Excel/CSV templates with 21 comprehensive fields, supporting bulk 
                generation of hundreds of QR codes and business cards.
              </p>
            </div>

            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 text-center">
              <div className="w-16 h-16 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <Globe className="w-8 h-8 text-green-400" />
              </div>
              <h3 className="text-xl font-semibold text-white mb-3">International Support</h3>
              <p className="text-gray-300 text-sm">
                Complete support for international contact formats, addresses, phone numbers, 
                and multi-language content for global professionals.
              </p>
            </div>

            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 text-center">
              <div className="w-16 h-16 bg-red-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <Shield className="w-8 h-8 text-red-400" />
              </div>
              <h3 className="text-xl font-semibold text-white mb-3">Privacy-First</h3>
              <p className="text-gray-300 text-sm">
                All processing happens locally in your browser. Your contact information never 
                leaves your device, ensuring complete privacy and security.
              </p>
            </div>

            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 text-center">
              <div className="w-16 h-16 bg-yellow-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <Zap className="w-8 h-8 text-yellow-400" />
              </div>
              <h3 className="text-xl font-semibold text-white mb-3">Lightning Fast</h3>
              <p className="text-gray-300 text-sm">
                Instant QR code generation with real-time preview, high-resolution output, 
                and optimized performance for both single and bulk operations.
              </p>
            </div>

            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 text-center">
              <div className="w-16 h-16 bg-indigo-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <Star className="w-8 h-8 text-indigo-400" />
              </div>
              <h3 className="text-xl font-semibold text-white mb-3">Professional Templates</h3>
              <p className="text-gray-300 text-sm">
                10 stunning business card templates with customizable backgrounds, fonts, 
                colors, and layouts for every professional need.
              </p>
            </div>
          </div>

          {/* Comprehensive Features */}
          <div className="bg-white/10 backdrop-blur-sm rounded-xl p-8 mb-16">
            <h2 className="text-3xl font-bold text-white text-center mb-8">Comprehensive Feature Set</h2>
            
            <div className="grid md:grid-cols-2 gap-8">
              <div>
                <h3 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
                  <CheckCircle className="w-5 h-5 text-green-400" />
                  Contact Information
                </h3>
                <ul className="space-y-2 text-gray-300">
                  <li>• Complete name fields (Prefix, First Name, Last Name, Suffix)</li>
                  <li>• Multiple phone types (Mobile, Work, Home, Fax)</li>
                  <li>• Professional email addresses</li>
                  <li>• Organization and department details</li>
                  <li>• Job titles and positions</li>
                  <li>• Website and social media links</li>
                </ul>
              </div>

              <div>
                <h3 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
                  <CheckCircle className="w-5 h-5 text-green-400" />
                  Address Components
                </h3>
                <ul className="space-y-2 text-gray-300">
                  <li>• Street addresses and P.O. Boxes</li>
                  <li>• City and state/province information</li>
                  <li>• ZIP/postal codes</li>
                  <li>• Country support for global addresses</li>
                  <li>• Complete address formatting</li>
                  <li>• International address standards</li>
                </ul>
              </div>

              <div>
                <h3 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
                  <CheckCircle className="w-5 h-5 text-green-400" />
                  QR Code Customization
                </h3>
                <ul className="space-y-2 text-gray-300">
                  <li>• Custom colors and gradients</li>
                  <li>• Adjustable border radius</li>
                  <li>• Transparent backgrounds</li>
                  <li>• High-resolution output (512x512)</li>
                  <li>• Preview-optimized display</li>
                  <li>• Professional styling options</li>
                </ul>
              </div>

              <div>
                <h3 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
                  <CheckCircle className="w-5 h-5 text-green-400" />
                  Export Options
                </h3>
                <ul className="space-y-2 text-gray-300">
                  <li>• High-quality PNG QR codes</li>
                  <li>• Standard vCard (.vcf) files</li>
                  <li>• Professional business card images</li>
                  <li>• Bulk ZIP file downloads</li>
                  <li>• Individual file downloads</li>
                  <li>• Cross-platform compatibility</li>
                </ul>
              </div>
            </div>
          </div>

          {/* Use Cases */}
          <div className="bg-gradient-to-r from-purple-500/20 to-pink-500/20 rounded-xl p-8 mb-16">
            <h2 className="text-3xl font-bold text-white text-center mb-8">Perfect For</h2>
            
            <div className="grid md:grid-cols-3 gap-6">
              <div className="text-center">
                <div className="w-20 h-20 bg-purple-500/30 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Users className="w-10 h-10 text-purple-300" />
                </div>
                <h3 className="text-xl font-semibold text-white mb-3">Business Professionals</h3>
                <p className="text-gray-300 text-sm">
                  Sales teams, consultants, executives, and entrepreneurs who need professional 
                  digital business cards for networking and client meetings.
                </p>
              </div>

              <div className="text-center">
                <div className="w-20 h-20 bg-blue-500/30 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Globe className="w-10 h-10 text-blue-300" />
                </div>
                <h3 className="text-xl font-semibold text-white mb-3">Organizations</h3>
                <p className="text-gray-300 text-sm">
                  Companies, nonprofits, and institutions managing large teams and requiring 
                  consistent, professional contact sharing solutions.
                </p>
              </div>

              <div className="text-center">
                <div className="w-20 h-20 bg-green-500/30 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Smartphone className="w-10 h-10 text-green-300" />
                </div>
                <h3 className="text-xl font-semibold text-white mb-3">Event Organizers</h3>
                <p className="text-gray-300 text-sm">
                  Conference organizers, trade show exhibitors, and networking event hosts 
                  facilitating seamless contact exchange.
                </p>
              </div>
            </div>
          </div>

          {/* Technology Stack */}
          <div className="bg-white/10 backdrop-blur-sm rounded-xl p-8 mb-16">
            <h2 className="text-3xl font-bold text-white text-center mb-8">Built with Modern Technology</h2>
            
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 text-center">
              <div className="p-4">
                <div className="w-16 h-16 bg-blue-500/20 rounded-lg flex items-center justify-center mx-auto mb-3">
                  <span className="text-2xl font-bold text-blue-400">React</span>
                </div>
                <h4 className="font-semibold text-white">React 18</h4>
                <p className="text-gray-400 text-sm">Modern UI framework</p>
              </div>

              <div className="p-4">
                <div className="w-16 h-16 bg-blue-500/20 rounded-lg flex items-center justify-center mx-auto mb-3">
                  <span className="text-2xl font-bold text-blue-400">TS</span>
                </div>
                <h4 className="font-semibold text-white">TypeScript</h4>
                <p className="text-gray-400 text-sm">Type-safe development</p>
              </div>

              <div className="p-4">
                <div className="w-16 h-16 bg-purple-500/20 rounded-lg flex items-center justify-center mx-auto mb-3">
                  <span className="text-2xl font-bold text-purple-400">QR</span>
                </div>
                <h4 className="font-semibold text-white">QR Code</h4>
                <p className="text-gray-400 text-sm">Advanced QR generation</p>
              </div>

              <div className="p-4">
                <div className="w-16 h-16 bg-green-500/20 rounded-lg flex items-center justify-center mx-auto mb-3">
                  <span className="text-2xl font-bold text-green-400">OCR</span>
                </div>
                <h4 className="font-semibold text-white">Tesseract</h4>
                <p className="text-gray-400 text-sm">Optical character recognition</p>
              </div>
            </div>
          </div>

          {/* Statistics */}
          <div className="grid md:grid-cols-4 gap-6 mb-16">
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 text-center">
              <div className="text-3xl font-bold text-purple-400 mb-2">21</div>
              <div className="text-gray-300 text-sm">Contact Fields</div>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 text-center">
              <div className="text-3xl font-bold text-blue-400 mb-2">10</div>
              <div className="text-gray-300 text-sm">Professional Templates</div>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 text-center">
              <div className="text-3xl font-bold text-green-400 mb-2">50+</div>
              <div className="text-gray-300 text-sm">Supported Countries</div>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 text-center">
              <div className="text-3xl font-bold text-yellow-400 mb-2">100%</div>
              <div className="text-gray-300 text-sm">Privacy Protected</div>
            </div>
          </div>

          {/* Getting Started */}
          <div className="bg-gradient-to-r from-purple-600 to-pink-600 rounded-xl p-8 text-center">
            <h2 className="text-3xl font-bold text-white mb-4">Ready to Get Started?</h2>
            <p className="text-purple-100 text-lg mb-6 max-w-2xl mx-auto">
              Create professional QR codes and business cards in minutes. Choose from single 
              generation, bulk processing, or advanced template customization.
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <button
                onClick={onBack}
                className="bg-white text-purple-600 px-8 py-3 rounded-lg font-semibold hover:bg-gray-100 transition-colors flex items-center gap-2"
              >
                <QrCode className="w-5 h-5" />
                Start Creating
              </button>
              <button
                onClick={() => {
                  // Download sample template
                  import('../utils/bulkProcessor').then(({ downloadProfessionalExcelTemplate }) => {
                    downloadProfessionalExcelTemplate();
                  });
                }}
                className="bg-purple-800 text-white px-8 py-3 rounded-lg font-semibold hover:bg-purple-900 transition-colors flex items-center gap-2"
              >
                <Download className="w-5 h-5" />
                Download Template
              </button>
            </div>
          </div>

          {/* Footer */}
          <div className="text-center mt-12">
            <p className="text-gray-400">
              QR Business Card Generator - Professional contact management for the digital age
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default About; 