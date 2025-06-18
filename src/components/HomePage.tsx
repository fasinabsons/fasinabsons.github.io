import React from 'react';
import { CreditCard, Scan, FileText, Shield, Info, QrCode, Sparkles } from 'lucide-react';

interface HomePageProps {
  onNavigate: (route: string) => void;
}

const HomePage: React.FC<HomePageProps> = ({ onNavigate }) => {
  const features = [
    {
      icon: QrCode,
      title: 'Standard Generator',
      description: 'Create simple QR codes with your contact information - no templates, just clean QR codes and vCards',
      color: 'bg-blue-500'
    },
    {
      icon: Sparkles,
      title: 'Template Generator',
      description: 'Design beautiful QR code cards with professional templates, backgrounds, and custom messages',
      color: 'bg-purple-500'
    },
    {
      icon: Scan,
      title: 'Business Card Scanner',
      description: 'Scan existing business cards and convert them to QR code cards with OCR technology',
      color: 'bg-green-500'
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <header className="text-center mb-16">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-white rounded-full shadow-lg mb-6">
            <CreditCard className="w-10 h-10 text-purple-600" />
          </div>
          <h1 className="text-4xl md:text-6xl font-bold text-white mb-4">
            QR Code
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-400">
              {' '}Generator
            </span>
          </h1>
          <p className="text-xl text-gray-300 max-w-2xl mx-auto">
            Create embedded QR code cards for phone wallpapers. Generate vCards for easy contact sharing with customizable styles and professional templates.
          </p>
        </header>

        {/* Features Grid */}
        <div className="grid md:grid-cols-3 gap-8 mb-16">
          {features.map((feature, index) => (
            <div key={index} className="bg-white/10 backdrop-blur-sm rounded-2xl p-8 hover:bg-white/20 transition-all duration-300 hover:scale-105">
              <div className={`inline-flex items-center justify-center w-16 h-16 ${feature.color} rounded-xl mb-6`}>
                <feature.icon className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-2xl font-bold text-white mb-4">{feature.title}</h3>
              <p className="text-gray-300 leading-relaxed">{feature.description}</p>
            </div>
          ))}
        </div>

        {/* Main Actions */}
        <div className="flex flex-col sm:flex-row gap-6 justify-center mb-16">
          <button
            onClick={() => onNavigate('method-select')}
            className="bg-gradient-to-r from-purple-600 to-pink-600 text-white px-8 py-4 rounded-full font-semibold text-lg hover:from-purple-700 hover:to-pink-700 transform hover:scale-105 transition-all duration-300 shadow-lg hover:shadow-xl"
          >
            Create QR Codes
          </button>
          <button
            onClick={() => onNavigate('ocr')}
            className="bg-white/20 backdrop-blur-sm text-white px-8 py-4 rounded-full font-semibold text-lg hover:bg-white/30 transform hover:scale-105 transition-all duration-300 border border-white/30"
          >
            <Scan className="w-5 h-5 inline mr-2" />
            Scan Business Card
          </button>
        </div>

        {/* Footer Links */}
        <footer className="text-center">
          <div className="flex flex-wrap justify-center gap-8 text-gray-400">
            <button
              onClick={() => onNavigate('about')}
              className="flex items-center gap-2 hover:text-white transition-colors"
            >
              <Info className="w-4 h-4" />
              About
            </button>
            <button
              onClick={() => onNavigate('privacy')}
              className="flex items-center gap-2 hover:text-white transition-colors"
            >
              <Shield className="w-4 h-4" />
              Privacy Policy
            </button>
            <button
              onClick={() => onNavigate('terms')}
              className="flex items-center gap-2 hover:text-white transition-colors"
            >
              <FileText className="w-4 h-4" />
              Terms & Conditions
            </button>
          </div>
          <div className="mt-8 text-gray-500">
            <p>&copy; 2025 QR Code Generator. All rights reserved.</p>
          </div>
        </footer>
      </div>
    </div>
  );
};

export default HomePage;