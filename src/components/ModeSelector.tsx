import React from 'react';
import { ArrowLeft, User, Users } from 'lucide-react';

interface ModeSelectorProps {
  method: 'standard' | 'template';
  onBack: () => void;
  onSelect: (mode: 'single' | 'bulk') => void;
}

const ModeSelector: React.FC<ModeSelectorProps> = ({ method, onBack, onSelect }) => {
  const modes = [
    {
      id: 'single' as const,
      icon: User,
      title: 'Single',
      description: 'Create one QR code at a time with full customization',
      features: ['Individual customization', 'Real-time preview', 'Instant download', 'Perfect for personal use']
    },
    {
      id: 'bulk' as const,
      icon: Users,
      title: 'Bulk',
      description: 'Generate multiple QR codes from an Excel file',
      features: ['Excel file upload', 'Batch processing', 'ZIP download', 'Great for businesses']
    }
  ];

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
            Back to Methods
          </button>
        </div>

        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
            {method === 'standard' ? 'Standard' : 'Template'} Generator
          </h1>
          <p className="text-xl text-gray-300 max-w-2xl mx-auto">
            Choose between single or bulk generation mode
          </p>
        </div>

        {/* Mode Cards */}
        <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
          {modes.map((mode) => (
            <div
              key={mode.id}
              className="bg-white/10 backdrop-blur-sm rounded-2xl p-8 hover:bg-white/20 transition-all duration-300 hover:scale-105 cursor-pointer"
              onClick={() => onSelect(mode.id)}
            >
              <div className="text-center mb-6">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-purple-600 to-pink-600 rounded-xl mb-4">
                  <mode.icon className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-2xl font-bold text-white mb-2">{mode.title}</h3>
                <p className="text-gray-300">{mode.description}</p>
              </div>

              <div className="space-y-3">
                {mode.features.map((feature, index) => (
                  <div key={index} className="flex items-center gap-3 text-gray-300">
                    <div className="w-2 h-2 bg-purple-400 rounded-full flex-shrink-0"></div>
                    <span>{feature}</span>
                  </div>
                ))}
              </div>

              <button className="w-full mt-6 bg-gradient-to-r from-purple-600 to-pink-600 text-white py-3 rounded-xl font-semibold hover:from-purple-700 hover:to-pink-700 transition-all duration-300">
                Choose {mode.title}
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ModeSelector;