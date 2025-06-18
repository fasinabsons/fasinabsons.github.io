import React from 'react';
import { TemplateStyle } from '../types';
import { TEMPLATE_STYLES } from '../utils/templateProcessor';

interface TemplateSelectorProps {
  selectedTemplate: TemplateStyle | null;
  onSelect: (template: TemplateStyle) => void;
}

const TemplateSelector: React.FC<TemplateSelectorProps> = ({ selectedTemplate, onSelect }) => {
  return (
    <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6">
      <h3 className="text-xl font-semibold text-white mb-6">Choose Template Style</h3>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {TEMPLATE_STYLES.map((template) => (
          <div
            key={template.id}
            className={`p-4 rounded-lg border-2 cursor-pointer transition-all duration-300 ${
              selectedTemplate?.id === template.id
                ? 'border-purple-500 bg-purple-500/20'
                : 'border-gray-600 bg-white/5 hover:border-purple-400 hover:bg-white/10'
            }`}
            onClick={() => onSelect(template)}
          >
            <h4 className="text-white font-semibold mb-2">{template.name}</h4>
            <p className="text-gray-300 text-sm mb-3">{template.description}</p>
            <div className="text-xs text-gray-400">{template.preview}</div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default TemplateSelector;