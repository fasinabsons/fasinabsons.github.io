import React from 'react';
import { ArrowLeft, Layers, Grid } from 'lucide-react';

interface MethodSelectorProps {
  onBack: () => void;
  onSelect: (method: 'standard' | 'template') => void;
}

const MethodSelector: React.FC<MethodSelectorProps> = ({ onBack, onSelect }) => {
  const methods = [
    {
      id: 'standard' as const,
      icon: Grid,
      title: 'Without Template',
      description: 'Create simple, customizable QR codes with basic design options',
      features: ['Color customization', 'Transparency control', 'Gradient effects', 'Single & bulk generation']
    },
    {
      id: 'template' as const,
      icon: Layers,
      title: 'With Template',
      description: 'Design professional business cards with predefined layouts and advanced styling',
      features: ['Professional templates', 'Background images', 'Custom fonts', 'Message positioning']
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
            Back to Home
          </button>
        </div>

        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
            Choose Your Method
          </h1>
          <p className="text-xl text-gray-300 max-w-2xl mx-auto">
            Select how you'd like to create your business card QR codes
          </p>
        </div>

        {/* Method Cards */}
        <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
          {methods.map((method) => (
            <div
              key={method.id}
              className="bg-white/10 backdrop-blur-sm rounded-2xl p-8 hover:bg-white/20 transition-all duration-300 hover:scale-105 cursor-pointer"
              onClick={() => onSelect(method.id)}
            >
              <div className="text-center mb-6">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-purple-600 to-pink-600 rounded-xl mb-4">
                  <method.icon className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-2xl font-bold text-white mb-2">{method.title}</h3>
                <p className="text-gray-300">{method.description}</p>
              </div>

              <div className="space-y-3">
                {method.features.map((feature, index) => (
                  <div key={index} className="flex items-center gap-3 text-gray-300">
                    <div className="w-2 h-2 bg-purple-400 rounded-full flex-shrink-0"></div>
                    <span>{feature}</span>
                  </div>
                ))}
              </div>

              <button className="w-full mt-6 bg-gradient-to-r from-purple-600 to-pink-600 text-white py-3 rounded-xl font-semibold hover:from-purple-700 hover:to-pink-700 transition-all duration-300">
                Select {method.title}
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default MethodSelector;