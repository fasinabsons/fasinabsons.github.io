import React, { useState, useCallback, useRef } from 'react';
import { ArrowLeft, Upload, Download, Eye, Loader2, Palette, Type } from 'lucide-react';
import { Contact, QRCodeStyle, CardSettings } from '../types';
import { ContactForm, QRStyleForm, QRLayoutForm } from './QRFormUtils';
import TemplateSelector from './TemplateSelector';
import { generateVCard, generateQRCode, createVCardBlob, sanitizeFilename, validateContact } from '../utils/qrGenerator';
import { generateTemplateCard, processBackgroundImage, loadCustomFont, DEFAULT_FONTS } from '../utils/templateProcessor';

interface TemplateSingleGeneratorProps {
  onBack: () => void;
}

// Debounce hook for performance optimization
const useDebounce = (callback: () => void, delay: number) => {
  const timeoutRef = useRef<NodeJS.Timeout>();
  
  return useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    timeoutRef.current = setTimeout(callback, delay);
  }, [callback, delay]);
};

const TemplateSingleGenerator: React.FC<TemplateSingleGeneratorProps> = ({ onBack }) => {
  const [contact, setContact] = useState<Contact>({
    name: '',
    firstName: '',
    lastName: '',
    prefix: '',
    suffix: '',
    email: '',
    phone: '',
    mobilePhone: '',
    workPhone: '',
    homePhone: '',
    faxPhone: '',
    organization: '',
    title: '',
    department: '',
    address: '',
    street: '',
    city: '',
    state: '',
    zipcode: '',
    country: '',
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

  const [cardSettings, setCardSettings] = useState<CardSettings>({
    template: { id: 1, name: 'QR Top', description: 'QR code at the top', layout: 'qr-top', preview: '' },
    backgroundImage: '/src/assets/01.png',
    font: 'Inter',
    textColor: '#ffffff',
    qrStyle: qrStyle,
    messages: {
      enabled: false,
      position: 'top',
      text1: '',
      text2: ''
    },
    layout: {
      qrPosition: 'middle',
      textSpacing: 15,
      qrSize: 35
    }
  });

  const [isGenerating, setIsGenerating] = useState(false);
  const [isProcessingImage, setIsProcessingImage] = useState(false);
  const [isLoadingFont, setIsLoadingFont] = useState(false);
  const [generatedData, setGeneratedData] = useState<{
    qrCodeUrl: string;
    vCardBlob: Blob;
    cardImageUrl: string;
    filename: string;
  } | null>(null);

  const [errors, setErrors] = useState<string[]>([]);
  const backgroundInputRef = useRef<HTMLInputElement>(null);
  const fontInputRef = useRef<HTMLInputElement>(null);

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
      setCardSettings(prev => ({ ...prev, backgroundImage: processedImageUrl }));
      setErrors([]);
    } catch {
      setErrors(['Failed to process background image']);
    } finally {
      setIsProcessingImage(false);
    }
  }, []);

  const handleFontUpload = useCallback(async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (file.size > 10 * 1024 * 1024) { // 10MB limit
      setErrors(['Font file must be less than 10MB']);
      return;
    }

    setIsLoadingFont(true);
    try {
      const fontName = await loadCustomFont(file);
      setCardSettings(prev => ({ ...prev, font: fontName }));
      setErrors([]);
    } catch {
      setErrors(['Failed to load custom font']);
    } finally {
      setIsLoadingFont(false);
    }
  }, []);

  // Real-time preview update function with debouncing
  const updatePreview = useCallback(async () => {
    if (!contact.name || !contact.email) return; // Skip if essential fields are missing
    
    try {
      const vcard = generateVCard(contact);
      const qrCodeUrl = await generateQRCode(vcard, qrStyle, 512, true);
      const updatedSettings = { ...cardSettings, qrStyle };
      const cardImageUrl = await generateTemplateCard(contact, qrCodeUrl, updatedSettings);
      
      if (generatedData) {
        setGeneratedData(prev => prev ? {
          ...prev,
          qrCodeUrl,
          cardImageUrl
        } : null);
      }
    } catch (error) {
      console.error('Preview update failed:', error);
    }
  }, [contact, qrStyle, cardSettings, generatedData]);

  // Debounced version for real-time updates
  const handlePreviewUpdate = useDebounce(updatePreview, 300);

  const handleGenerate = useCallback(async () => {
    const validationErrors = validateContact(contact);
    if (validationErrors.length > 0) {
      setErrors(validationErrors);
      return;
    }

    setErrors([]);
    setIsGenerating(true);

    try {
      const vcard = generateVCard(contact);
      // Generate high-quality QR code that works for both preview and download
      const qrCodeUrl = await generateQRCode(vcard, qrStyle, 512, true);
      const vCardBlob = createVCardBlob(vcard);
      const filename = sanitizeFilename(contact.name);

      // Generate template card
      const updatedSettings = { ...cardSettings, qrStyle };
      const cardImageUrl = await generateTemplateCard(contact, qrCodeUrl, updatedSettings);

      setGeneratedData({
        qrCodeUrl,
        vCardBlob,
        cardImageUrl,
        filename
      });
    } catch (error) {
      console.error('Generation failed:', error);
      setErrors(['Failed to generate business card. Please try again.']);
    } finally {
      setIsGenerating(false);
    }
  }, [contact, qrStyle, cardSettings]);

  const handleDownload = useCallback((type: 'qr' | 'vcard' | 'card') => {
    if (!generatedData) return;

    const link = document.createElement('a');
    
    switch (type) {
      case 'qr':
        // Use the same QR code that was generated for preview
        link.href = generatedData.qrCodeUrl;
        link.download = `${generatedData.filename}_QR.png`;
        break;
      case 'vcard': {
        const url = URL.createObjectURL(generatedData.vCardBlob);
        link.href = url;
        link.download = `${generatedData.filename}.vcf`;
        break;
      }
      case 'card':
        link.href = generatedData.cardImageUrl;
        link.download = `${generatedData.filename}_Card.png`;
        break;
    }
    
    link.click();
    if (type === 'vcard') {
      URL.revokeObjectURL(link.href);
    }
  }, [generatedData]);

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
            Template Single Generator
          </h1>
          <p className="text-gray-300">Create a professional business card with custom templates</p>
        </div>

        <div className="grid lg:grid-cols-2 gap-8">
          {/* Left Column - Forms and Settings */}
          <div className="space-y-6">
            <TemplateSelector
              selectedTemplate={cardSettings.template}
              onSelect={(template) => setCardSettings(prev => ({ ...prev, template }))}
            />

            <ContactForm
              contact={contact}
              onChange={setContact}
              errors={errors}
            />

            {/* Background and Font Settings */}
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6">
              <h3 className="text-xl font-semibold text-white mb-6">Design Settings</h3>
              
              <div className="space-y-6">
                {/* Background Image */}
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Background Image
                  </label>
                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => backgroundInputRef.current?.click()}
                      disabled={isProcessingImage}
                      className="flex items-center gap-2 bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition-colors disabled:opacity-50"
                    >
                      {isProcessingImage ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <Upload className="w-4 h-4" />
                      )}
                      {isProcessingImage ? 'Processing...' : 'Upload Background'}
                    </button>
                    <span className="text-gray-400 text-sm">Professional images only - gradients removed automatically</span>
                  </div>
                  <input
                    ref={backgroundInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleBackgroundUpload}
                    className="hidden"
                    aria-label="Upload background image"
                  />
                </div>

                {/* Font Selection */}
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Font Family
                  </label>
                  <div className="flex items-center gap-3 mb-3">
                    <select
                      value={cardSettings.font}
                      onChange={(e) => setCardSettings(prev => ({ ...prev, font: e.target.value }))}
                      className="flex-1 px-3 py-2 bg-white/10 border border-gray-600 rounded-lg text-white focus:border-purple-500 focus:ring-1 focus:ring-purple-500"
                      aria-label="Select font family"
                    >
                      {DEFAULT_FONTS.map(font => (
                        <option key={font} value={font} className="bg-gray-800">{font}</option>
                      ))}
                    </select>
                    <button
                      onClick={() => fontInputRef.current?.click()}
                      disabled={isLoadingFont}
                      className="flex items-center gap-2 bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700 transition-colors disabled:opacity-50"
                    >
                      {isLoadingFont ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <Type className="w-4 h-4" />
                      )}
                      Custom
                    </button>
                  </div>
                  <input
                    ref={fontInputRef}
                    type="file"
                    accept=".ttf,.otf,.woff,.woff2"
                    onChange={handleFontUpload}
                    className="hidden"
                    aria-label="Upload custom font"
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
                      value={cardSettings.textColor}
                      onChange={(e) => setCardSettings(prev => ({ ...prev, textColor: e.target.value }))}
                      className="w-12 h-10 rounded-lg border-2 border-gray-600 bg-transparent"
                      aria-label="Select text color"
                    />
                    <input
                      type="text"
                      value={cardSettings.textColor}
                      onChange={(e) => setCardSettings(prev => ({ ...prev, textColor: e.target.value }))}
                      className="flex-1 px-3 py-2 bg-white/10 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:border-purple-500 focus:ring-1 focus:ring-purple-500"
                      placeholder="Enter hex color code"
                      aria-label="Text color hex code"
                    />
                  </div>
                </div>


              </div>
            </div>

            <QRLayoutForm
              settings={cardSettings}
              onChange={setCardSettings}
              onPreviewUpdate={handlePreviewUpdate}
            />

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
                  Generate Business Card
                </>
              )}
            </button>
          </div>

          {/* Right Column - Preview */}
          <div className="space-y-6">
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6">
              <h3 className="text-xl font-semibold text-white mb-6">Preview</h3>
              
              <div className="bg-white rounded-lg p-4">
                {generatedData ? (
                  <div className="space-y-4">
                    <div className="text-center">
                      <img
                        src={generatedData.cardImageUrl}
                        alt="Generated Business Card"
                        className="w-full max-w-sm mx-auto rounded-lg shadow-lg"
                      />
                    </div>
                    
                    {/* Download Buttons */}
                    <div className="flex flex-wrap gap-2 justify-center">
                      <button
                        onClick={() => handleDownload('qr')}
                        className="flex items-center gap-2 bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition-colors"
                      >
                        <Download className="w-4 h-4" />
                        Download QR Code
                      </button>
                      <button
                        onClick={() => handleDownload('vcard')}
                        className="flex items-center gap-2 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors"
                      >
                        <Download className="w-4 h-4" />
                        Download vCard
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="text-gray-400 py-16 text-center">
                    <Palette className="w-16 h-16 mx-auto mb-4 opacity-50" />
                    <p>Configure your template and generate to see preview</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
  };

export default TemplateSingleGenerator;