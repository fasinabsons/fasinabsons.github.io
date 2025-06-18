import React, { useState, useCallback, useMemo, useRef } from 'react';
import { ArrowLeft, Download, Eye, Loader2 } from 'lucide-react';
import { Contact, QRCodeStyle } from '../types';
import { ContactForm, QRStyleForm } from './QRFormUtils';
import { generateVCard, generateQRCode, createVCardBlob, sanitizeFilename, validateContact } from '../utils/qrGenerator';

interface StandardSingleGeneratorProps {
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

const StandardSingleGenerator: React.FC<StandardSingleGeneratorProps> = ({ onBack }) => {
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

  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedData, setGeneratedData] = useState<{
    qrCodeUrl: string;
    vCardBlob: Blob;
    filename: string;
  } | null>(null);

  const [errors, setErrors] = useState<string[]>([]);
  const [realTimePreview, setRealTimePreview] = useState(false);

  // Real-time preview update function
  const updatePreview = useCallback(async () => {
    if (!contact.name || !contact.email) return; // Skip if essential fields are missing
    
    try {
      const vcard = generateVCard(contact);
      const qrCodeUrl = await generateQRCode(vcard, qrStyle, 512, true);
      const vCardBlob = createVCardBlob(vcard);
      const filename = sanitizeFilename(contact.name);

      setGeneratedData({
        qrCodeUrl,
        vCardBlob,
        filename
      });
    } catch (error) {
      console.error('Preview update failed:', error);
    }
  }, [contact, qrStyle]);

  // Debounced version for real-time updates
  const handlePreviewUpdate = useDebounce(updatePreview, 200);

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

      setGeneratedData({
        qrCodeUrl,
        vCardBlob,
        filename
      });
    } catch (error) {
      console.error('Generation failed:', error);
      setErrors(['Failed to generate QR code. Please try again.']);
    } finally {
      setIsGenerating(false);
    }
  }, [contact, qrStyle]);

  const handleDownloadQR = useCallback(() => {
    if (!generatedData) return;

    // Use the same QR code that was generated for preview
    const link = document.createElement('a');
    link.href = generatedData.qrCodeUrl;
    link.download = `${generatedData.filename}_QR.png`;
    link.click();
  }, [generatedData]);

  const handleDownloadVCard = useCallback(() => {
    if (!generatedData) return;

    const url = URL.createObjectURL(generatedData.vCardBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${generatedData.filename}.vcf`;
    link.click();
    URL.revokeObjectURL(url);
  }, [generatedData]);

  const previewStyle = useMemo(() => {
    if (qrStyle.gradient) {
      return {
        background: `linear-gradient(135deg, ${qrStyle.foregroundColor}, ${qrStyle.gradientColor})`,
        borderRadius: `${qrStyle.borderRadius}px`
      };
    }
    return {
      backgroundColor: qrStyle.transparent ? 'transparent' : qrStyle.backgroundColor,
      borderRadius: `${qrStyle.borderRadius}px`
    };
  }, [qrStyle]);

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
            Standard QR Generator
          </h1>
          <p className="text-gray-300">Create a single QR code with your contact information</p>
        </div>

        <div className="grid lg:grid-cols-2 gap-8">
          {/* Left Column - Forms */}
          <div className="space-y-6">
            <ContactForm
              contact={contact}
              onChange={(newContact) => {
                setContact(newContact);
                if (realTimePreview) {
                  handlePreviewUpdate();
                }
              }}
              errors={errors}
            />

            <QRStyleForm
              style={qrStyle}
              onChange={(newStyle) => {
                setQrStyle(newStyle);
                if (realTimePreview) {
                  handlePreviewUpdate();
                }
              }}
            />

            {/* Real-time Preview Toggle */}
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6">
              <label className="flex items-center gap-2 text-gray-300">
                <input
                  type="checkbox"
                  checked={realTimePreview}
                  onChange={(e) => setRealTimePreview(e.target.checked)}
                  className="w-4 h-4 text-purple-600 bg-white/10 border-gray-600 rounded focus:ring-purple-500"
                />
                Enable Real-time Preview
              </label>
              <p className="text-gray-400 text-sm mt-2">
                Automatically update preview as you type (may impact performance on slower devices)
              </p>
            </div>

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
                  Generate QR Code
                </>
              )}
            </button>
          </div>

          {/* Right Column - Preview */}
          <div className="space-y-6">
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6">
              <h3 className="text-xl font-semibold text-white mb-6">Preview</h3>
              
              <div className="bg-white rounded-lg p-8 text-center">
                {generatedData ? (
                  <div className="space-y-4">
                    <div className="inline-block" style={previewStyle}>
                      <img
                        src={generatedData.qrCodeUrl}
                        alt="Generated QR Code"
                        className="w-64 h-64 mx-auto object-contain"
                        style={{ borderRadius: `${qrStyle.borderRadius}px` }}
                      />
                    </div>
                    <div className="text-gray-800">
                      <p className="font-bold text-lg">{contact.name}</p>
                      {contact.title && <p className="text-gray-600">{contact.title}</p>}
                      {contact.organization && <p className="text-gray-600">{contact.organization}</p>}
                      {contact.message1 && <p className="text-sm text-gray-500 mt-2">{contact.message1}</p>}
                      {contact.message2 && <p className="text-sm text-gray-500">{contact.message2}</p>}
                    </div>
                    
                    {/* Download Buttons */}
                    <div className="flex gap-3 justify-center pt-4">
                      <button
                        onClick={handleDownloadQR}
                        className="flex items-center gap-2 bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition-colors"
                      >
                        <Download className="w-4 h-4" />
                        Download QR Code
                      </button>
                      <button
                        onClick={handleDownloadVCard}
                        className="flex items-center gap-2 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors"
                      >
                        <Download className="w-4 h-4" />
                        Download vCard
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="text-gray-400 py-16">
                    <Eye className="w-16 h-16 mx-auto mb-4 opacity-50" />
                    <p>Fill out the form and click "Generate QR Code" to see your preview</p>
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

export default StandardSingleGenerator;