import React, { useState, useCallback, useRef, useEffect } from 'react';
import { ArrowLeft, Upload, Download, Eye, Loader2, Check } from 'lucide-react';
import { Contact, QRCodeStyle } from '../types';
import { ContactForm, QRStyleForm } from './QRFormUtils';
import FontSelector from './FontSelector';
import { generateEmbeddedQRCard, EmbeddedQRSettings, processBackgroundImage } from '../utils/embeddedQRGenerator';
import { createVCardBlob, sanitizeFilename, validateContact } from '../utils/qrGenerator';
import { svgTemplates, templateCache } from '../utils/svgToPngConverter';

interface TemplateGeneratorProps {
  onBack: () => void;
}

interface TemplateOption {
  id: string;
  name: string;
  description: string;
  layout: 'qr-bottom' | 'qr-middle' | 'qr-top' | 'qr-both-bottom';
}

interface BackgroundOption {
  id: string;
  name: string;
  url: string | null;
}

const TEMPLATES: TemplateOption[] = [
  {
    id: 'qr-center-balanced',
    name: 'Professional Center',
    description: 'Expert centered layout with mathematical precision',
    layout: 'qr-bottom'
  },
  {
    id: 'qr-mobile-portrait',
    name: 'Mobile Wallpaper',
    description: 'Optimized for mobile screens with thumb-friendly access',
    layout: 'qr-middle'
  },
  {
    id: 'qr-top-executive',
    name: 'Executive Premium',
    description: 'Golden ratio positioning with professional hierarchy',
    layout: 'qr-top'
  },
  {
    id: 'qr-landscape-pro',
    name: 'Landscape Professional',
    description: 'Side-by-side layout for wide-screen displays',
    layout: 'qr-both-bottom'
  }
];

// Using SVG templates instead of heavy PNG files for better performance
const DEFAULT_BACKGROUNDS: BackgroundOption[] = svgTemplates.map(template => ({
  id: template.id,
  name: template.name,
  url: null // Will be generated from SVG
}));

const TemplateGenerator: React.FC<TemplateGeneratorProps> = ({ onBack }) => {
  const [contact, setContact] = useState<Contact>({
    name: '',
    email: '',
    phone: '',
    organization: '',
    title: '',
    address: '',
    website: '',
    message1: '',
    message2: ''
  });

  const [qrStyle, setQrStyle] = useState<QRCodeStyle>({
    foregroundColor: '#000000',
    backgroundColor: '#ffffff',
    transparent: false,
    gradient: false,
    gradientColor: '#8b5cf6',
    borderRadius: 0
  });

  const [selectedTemplate, setSelectedTemplate] = useState<TemplateOption>(TEMPLATES[0]);
  const [selectedBackground, setSelectedBackground] = useState<BackgroundOption>(DEFAULT_BACKGROUNDS[0]);
  const [selectedFont, setSelectedFont] = useState({
    id: 'inter',
    name: 'Inter',
    family: 'Inter, -apple-system, BlinkMacSystemFont, sans-serif',
    category: 'sans-serif',
    weight: '400',
    style: 'normal'
  });
  const [textColor, setTextColor] = useState('#ffffff');
  const [isProcessingImage, setIsProcessingImage] = useState(false);
  
  const [messages, setMessages] = useState({
    message1: '',
    message2: ''
  });

  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedData, setGeneratedData] = useState<{
    embeddedCardUrl: string;
    vCardBlob: Blob;
    filename: string;
    vCardData: string;
  } | null>(null);

  const [errors, setErrors] = useState<string[]>([]);
  const backgroundInputRef = useRef<HTMLInputElement>(null);

  const [loading, setLoading] = useState(false);
  const [generatedImage, setGeneratedImage] = useState<string>('');
  const [layout, setLayout] = useState<'qr-bottom' | 'qr-middle' | 'qr-top' | 'qr-both-bottom'>('qr-bottom');
  const [templatePreviews, setTemplatePreviews] = useState<Record<string, string>>({});
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // Load template previews using SVG system
  useEffect(() => {
    const loadTemplatePreviews = async () => {
      const previews: Record<string, string> = {};
      
      // Load templates in parallel for better performance
      const loadPromises = svgTemplates.map(async (template) => {
        try {
          // Generate smaller preview images (400x700) for better performance
          const previewUrl = await templateCache.getTemplate(template.id, 400, 700);
          previews[template.id] = previewUrl;
        } catch (error) {
          console.error(`Failed to load template ${template.id}:`, error);
          // Fallback to a simple gradient if SVG fails
          previews[template.id] = 'data:image/svg+xml;base64,' + btoa(`
            <svg viewBox="0 0 400 700" xmlns="http://www.w3.org/2000/svg">
              <defs>
                <linearGradient id="fallback" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" style="stop-color:#3b82f6;stop-opacity:1" />
                  <stop offset="100%" style="stop-color:#1e40af;stop-opacity:1" />
                </linearGradient>
              </defs>
              <rect width="100%" height="100%" fill="url(#fallback)"/>
              <text x="50%" y="50%" text-anchor="middle" fill="white" font-size="16">${template.name}</text>
            </svg>
          `);
        }
      });

      await Promise.all(loadPromises);
      setTemplatePreviews(previews);
    };

    loadTemplatePreviews();
  }, []);

  const handleBackgroundUpload = useCallback(async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (file.size > 50 * 1024 * 1024) { // 50MB limit
      setErrors(['Background image must be less than 50MB']);
      return;
    }

    setIsProcessingImage(true);
    try {
      const processedImageUrl = await processBackgroundImage(file);
      setSelectedBackground({
        id: 'custom',
        name: 'Custom Upload',
        url: processedImageUrl
      });
      setErrors([]);
    } catch (error) {
      console.error('Background processing failed:', error);
      setErrors(['Failed to process background image. Please try again.']);
    } finally {
      setIsProcessingImage(false);
    }
  }, []);

  const handleFontSelect = useCallback((font: { id: string; name: string; family: string; category?: string; weight?: string; style?: string }) => {
    setSelectedFont({
      id: font.id,
      name: font.name,
      family: font.family,
      category: font.category || 'sans-serif',
      weight: font.weight || '400',
      style: font.style || 'normal'
    });
  }, []);

  const handleGenerate = useCallback(async () => {
    const validationErrors = validateContact(contact);
    if (validationErrors.length > 0) {
      setErrors(validationErrors);
      return;
    }

    setErrors([]);
    setIsGenerating(true);

          try {
        // Get the full-resolution template from SVG (1440x2560)
        const templateUrl = await templateCache.getTemplate(selectedBackground.id, 1440, 2560);
        
        const settings: EmbeddedQRSettings = {
          contact,
          qrStyle,
          backgroundImage: templateUrl,
          messages: {
            message1: messages.message1 || contact.message1,
            message2: messages.message2 || contact.message2
          },
          layout: selectedTemplate.layout,
          textColor,
          font: selectedFont.family,
          fontSize: 28,
          textShadow: true,
          textOutline: true,
          qrBorderRadius: qrStyle.borderRadius || 0,
          qrShadow: true,
          spacing: {
            margin: 120,
            padding: 60,
            elementGap: 5 // Precise 5px spacing as requested
          },
          typography: {
            messageWeight: 'normal',
            nameWeight: 'bold',
            letterSpacing: 1.2,
            lineHeight: 1.4
          }
        };

        const imageDataUrl = await generateEmbeddedQRCard(settings);
        
        setGeneratedData({
          embeddedCardUrl: imageDataUrl,
          vCardBlob: new Blob(), // Placeholder
          filename: contact.name || 'qr_card',
          vCardData: ''
        });
    } catch (error) {
      console.error('Error generating card:', error);
      setErrors(['Failed to generate card. Please try again.']);
    } finally {
      setIsGenerating(false);
    }
  }, [contact, qrStyle, messages, selectedTemplate, selectedFont, textColor, layout]);

  const handleDownloadCard = useCallback(() => {
    if (!generatedImage) return;

    const link = document.createElement('a');
    link.href = generatedImage;
    link.download = `${contact.name}_qr_card.png`;
    link.click();
  }, [generatedImage, contact.name]);

  const handleDownloadVCard = useCallback(() => {
    if (!generatedData) return;

    const url = URL.createObjectURL(generatedData.vCardBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${generatedData.filename}.vcf`;
    link.click();
    URL.revokeObjectURL(url);
  }, [generatedData]);

  const generateVCard = (contact: Contact): string => {
    const vcard = [
      'BEGIN:VCARD',
      'VERSION:3.0',
      `FN:${contact.name}`,
      `N:${contact.name.split(' ').reverse().join(';')}`,
      contact.email ? `EMAIL:${contact.email}` : '',
      contact.phone ? `TEL:${contact.phone}` : '',
      contact.organization ? `ORG:${contact.organization}` : '',
      contact.title ? `TITLE:${contact.title}` : '',
      contact.address ? `ADR:;;${contact.address}` : '',
      contact.website ? `URL:${contact.website}` : '',
      'END:VCARD'
    ].filter(Boolean).join('\n');

    return vcard;
  };

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
            Back
          </button>
        </div>

        <div className="text-center mb-8">
          <h1 className="text-3xl md:text-4xl font-bold text-white mb-2">
            Template Generator
          </h1>
          <p className="text-gray-300">Create professional QR code cards with custom templates, backgrounds, and messages</p>
        </div>

        <div className="grid lg:grid-cols-2 gap-8">
          {/* Left Column - Forms */}
          <div className="space-y-6">
            {/* Template Selection */}
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6">
              <h3 className="text-xl font-semibold text-white mb-6">Choose Template Layout</h3>
              
              <div className="grid grid-cols-2 gap-3">
                {svgTemplates.map((template) => (
                  <div
                    key={template.id}
                    className={`relative cursor-pointer rounded-lg overflow-hidden border-2 transition-all duration-200 ${
                      selectedTemplate === template.id
                        ? 'border-blue-500 ring-2 ring-blue-200'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                    onClick={() => setSelectedTemplate(template.id)}
                  >
                    <div className="aspect-[2/3] bg-gray-100">
                      {templatePreviews[template.id] ? (
                        <img
                          src={templatePreviews[template.id]}
                          alt={template.name}
                          className="w-full h-full object-cover"
                          loading="lazy"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-gray-200 to-gray-300">
                          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-500"></div>
                        </div>
                      )}
                    </div>
                    <div className="absolute bottom-0 left-0 right-0 bg-black bg-opacity-75 text-white text-xs p-2">
                      <div className="font-medium">{template.name}</div>
                      <div className="text-gray-300 capitalize">{template.category}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Background Selection */}
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6">
              <h3 className="text-xl font-semibold text-white mb-6">Background Image</h3>
              
              <div className="grid grid-cols-3 gap-3 mb-4">
                {DEFAULT_BACKGROUNDS.map((bg) => (
                  <div
                    key={bg.id}
                    className={`relative aspect-square rounded-lg border-2 cursor-pointer transition-all duration-300 overflow-hidden ${
                      selectedBackground.id === bg.id
                        ? 'border-purple-500'
                        : 'border-gray-600 hover:border-purple-400'
                    }`}
                    onClick={() => setSelectedBackground(bg)}
                  >
                    {bg.url ? (
                      <img
                        src={bg.url}
                        alt={bg.name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
                        <span className="text-white text-xs font-medium">Gradient</span>
                      </div>
                    )}
                    {selectedBackground.id === bg.id && (
                      <div className="absolute inset-0 bg-purple-500/20 flex items-center justify-center">
                        <Check className="w-6 h-6 text-white" />
                      </div>
                    )}
                  </div>
                ))}
              </div>

              <button
                onClick={() => backgroundInputRef.current?.click()}
                disabled={isProcessingImage}
                className="w-full flex items-center justify-center gap-2 py-3 px-4 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors disabled:opacity-50"
              >
                {isProcessingImage ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Upload className="w-4 h-4" />
                )}
                {isProcessingImage ? 'Processing...' : 'Upload Custom Background'}
              </button>

              <input
                ref={backgroundInputRef}
                type="file"
                accept="image/*"
                onChange={handleBackgroundUpload}
                className="hidden"
                aria-label="Upload background image"
              />

              <p className="text-xs text-gray-400 mt-2">
                Max 50MB, supports up to 4000x6000 resolution
              </p>
            </div>

            <ContactForm
              contact={contact}
              onChange={setContact}
              errors={errors}
            />

            {/* Messages Section */}
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6">
              <h3 className="text-xl font-semibold text-white mb-6">Custom Messages</h3>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Message 1 (max 100 characters)
                  </label>
                  <textarea
                    value={messages.message1}
                    onChange={(e) => setMessages(prev => ({ ...prev, message1: e.target.value }))}
                    maxLength={100}
                    rows={2}
                    className="w-full px-3 py-2 bg-white/10 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:border-purple-500 focus:ring-1 focus:ring-purple-500 resize-none"
                    placeholder="Enter a custom message to display on your card"
                  />
                  <div className="text-right text-xs text-gray-400 mt-1">
                    {messages.message1.length}/100
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Message 2 (max 100 characters)
                  </label>
                  <textarea
                    value={messages.message2}
                    onChange={(e) => setMessages(prev => ({ ...prev, message2: e.target.value }))}
                    maxLength={100}
                    rows={2}
                    className="w-full px-3 py-2 bg-white/10 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:border-purple-500 focus:ring-1 focus:ring-purple-500 resize-none"
                    placeholder="Enter a second message (optional)"
                  />
                  <div className="text-right text-xs text-gray-400 mt-1">
                    {messages.message2.length}/100
                  </div>
                </div>
              </div>
            </div>

            {/* Font and Color Selection */}
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6">
              <h3 className="text-xl font-semibold text-white mb-6">Design Customization</h3>
              
              <div className="space-y-6">
                {/* Font Selection */}
                <div>
                  <FontSelector
                    onFontSelect={handleFontSelect}
                    selectedFont={selectedFont}
                  />
                </div>

                {/* Text Color */}
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Text Color
                  </label>
                  <div className="flex items-center gap-3">
                    <input
                      type="color"
                      value={textColor}
                      onChange={(e) => setTextColor(e.target.value)}
                      className="w-12 h-10 rounded-lg border border-gray-600 bg-transparent cursor-pointer"
                      aria-label="Select text color"
                    />
                    <input
                      type="text"
                      value={textColor}
                      onChange={(e) => setTextColor(e.target.value)}
                      className="flex-1 px-3 py-2 bg-white/10 border border-gray-600 rounded-lg text-white focus:border-purple-500 focus:ring-1 focus:ring-purple-500"
                      placeholder="#ffffff"
                    />
                  </div>
                </div>
              </div>
            </div>

            <QRStyleForm
              style={qrStyle}
              onChange={setQrStyle}
            />

            <button
              onClick={handleGenerate}
              disabled={isGenerating}
              className="w-full bg-gradient-to-r from-purple-600 to-pink-600 text-white py-3 px-6 rounded-xl font-semibold hover:from-purple-700 hover:to-pink-700 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {isGenerating ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Generating...
                </>
              ) : (
                <>
                  <Eye className="w-5 h-5" />
                  Generate Template Card
                </>
              )}
            </button>

            {errors.length > 0 && (
              <div className="p-3 bg-red-500/20 border border-red-500/50 rounded-lg">
                <div className="text-red-300 text-sm">
                  <ul className="list-disc list-inside space-y-1">
                    {errors.map((error, index) => (
                      <li key={index}>{error}</li>
                    ))}
                  </ul>
                </div>
              </div>
            )}
          </div>

          {/* Right Column - Preview and Downloads */}
          <div className="space-y-6">
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6">
              <h3 className="text-xl font-semibold text-white mb-6">Preview & Download</h3>
              
              {generatedImage ? (
                <div className="space-y-6">
                  {/* Template Card Preview */}
                  <div className="text-center">
                    <div className="bg-black rounded-lg p-4">
                      <div className="relative mx-auto w-[270px] h-[480px]">
                        <img 
                          src={generatedImage}
                          alt="Generated Template Card"
                          className="w-full h-full object-cover rounded-lg shadow-lg"
                        />
                        {/* Phone frame overlay */}
                        <div className="absolute inset-0 rounded-lg border-4 border-gray-800 pointer-events-none"></div>
                      </div>
                    </div>
                    <p className="text-gray-300 mt-3 text-sm">
                      1080x1920 Phone Wallpaper Format
                    </p>
                  </div>

                  {/* Download Buttons */}
                  <div className="space-y-3">
                    <button
                      onClick={handleDownloadCard}
                      className="w-full flex items-center justify-center gap-2 py-3 px-4 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
                    >
                      <Download className="w-4 h-4" />
                      Download Template Card (.png)
                    </button>
                    
                    <button
                      onClick={handleDownloadVCard}
                      className="w-full flex items-center justify-center gap-2 py-3 px-4 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                    >
                      <Download className="w-4 h-4" />
                      Download vCard (.vcf)
                    </button>
                  </div>

                  {/* Contact Info Preview */}
                  <div className="bg-white/10 rounded-lg p-4">
                    <h4 className="text-white font-semibold mb-3">Template Settings</h4>
                    <div className="text-sm text-gray-300 space-y-1">
                      <div><strong>Layout:</strong> {TEMPLATES.find(t => t.id === selectedTemplate)?.name}</div>
                      <div><strong>Font:</strong> {selectedFont.name}</div>
                      <div><strong>Background:</strong> {selectedBackground.name}</div>
                      <div><strong>Text Color:</strong> {textColor}</div>
                      {messages.message1 && <div><strong>Message 1:</strong> {messages.message1}</div>}
                      {messages.message2 && <div><strong>Message 2:</strong> {messages.message2}</div>}
                    </div>
                  </div>
                </div>
              ) : (
                <div className="text-center py-12">
                  <div className="w-24 h-24 mx-auto bg-gray-700 rounded-lg flex items-center justify-center mb-4">
                    <Eye className="w-8 h-8 text-gray-500" />
                  </div>
                  <p className="text-gray-400">Fill in your contact details, choose a template, and click "Generate Template Card" to see the preview</p>
                </div>
              )}
            </div>

            {/* Info Section */}
            <div className="bg-gradient-to-r from-purple-500/20 to-pink-500/20 rounded-xl p-6 border border-purple-500/30">
              <h4 className="text-white font-semibold mb-3">Template Features</h4>
              <ul className="text-sm text-gray-300 space-y-2">
                <li>• Professional layout designs</li>
                <li>• Custom background support (up to 4000x6000)</li>
                <li>• Message positioning per template</li>
                <li>• 1080x1920 phone wallpaper output</li>
                <li>• Advanced font selection with web fonts</li>
                <li>• QR code transparency options</li>
                <li>• Perfect for lockscreen optimization</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TemplateGenerator; 