import React, { useState, useCallback } from 'react';
import { ArrowLeft, Download, Loader2, QrCode } from 'lucide-react';
import { Contact, QRCodeStyle } from '../types';
import { ContactForm, QRStyleForm } from './QRFormUtils';
import { generateQRCode } from '../utils/qrGenerator';
import { createVCardBlob, sanitizeFilename, validateContact } from '../utils/qrGenerator';

interface StandardGeneratorProps {
  onBack: () => void;
}

const StandardGenerator: React.FC<StandardGeneratorProps> = ({ onBack }) => {
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

  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedData, setGeneratedData] = useState<{
    qrCodeUrl: string;
    vCardBlob: Blob;
    filename: string;
    vCardData: string;
  } | null>(null);

  const [errors, setErrors] = useState<string[]>([]);

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

  const handleGenerate = useCallback(async () => {
    const validationErrors = validateContact(contact);
    if (validationErrors.length > 0) {
      setErrors(validationErrors);
      return;
    }

    setErrors([]);
    setIsGenerating(true);

    try {
      // Generate vCard data
      const vCardData = generateVCard(contact);
      
      // Generate QR code from vCard
      const qrCodeUrl = await generateQRCode(vCardData, qrStyle);
      
      // Create vCard file blob
      const vCardBlob = createVCardBlob(vCardData);
      const filename = sanitizeFilename(contact.name);

      setGeneratedData({
        qrCodeUrl,
        vCardBlob,
        filename,
        vCardData
      });
    } catch (error) {
      console.error('Generation failed:', error);
      setErrors(['Failed to generate QR code. Please try again.']);
    } finally {
      setIsGenerating(false);
    }
  }, [contact, qrStyle]);

  const handleDownloadQRCode = useCallback(() => {
    if (!generatedData) return;

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

  const handleDownloadBoth = useCallback(async () => {
    if (!generatedData) return;

    // Download QR Code
    handleDownloadQRCode();
    
    // Download vCard with a small delay
    setTimeout(() => {
      handleDownloadVCard();
    }, 100);
  }, [generatedData, handleDownloadQRCode, handleDownloadVCard]);

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
          <p className="text-gray-300">Create a QR code and vCard with your contact information - simple and clean</p>
        </div>

        <div className="grid lg:grid-cols-2 gap-8">
          {/* Left Column - Forms */}
          <div className="space-y-6">
            <ContactForm
              contact={contact}
              onChange={setContact}
              errors={errors}
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
                  <QrCode className="w-5 h-5" />
                  Generate QR Code
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
              
              {generatedData ? (
                <div className="space-y-6">
                  {/* QR Code Preview */}
                  <div className="text-center">
                    <div className="inline-block p-4 bg-white rounded-lg shadow-lg">
                      <img 
                        src={generatedData.qrCodeUrl} 
                        alt="Generated QR Code"
                        className="w-48 h-48 mx-auto"
                      />
                    </div>
                    <p className="text-gray-300 mt-3 text-sm">
                      Scan this QR code to save contact information
                    </p>
                  </div>

                  {/* Download Buttons */}
                  <div className="space-y-3">
                    <button
                      onClick={handleDownloadQRCode}
                      className="w-full flex items-center justify-center gap-2 py-3 px-4 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                    >
                      <Download className="w-4 h-4" />
                      Download QR Code (.png)
                    </button>
                    
                    <button
                      onClick={handleDownloadVCard}
                      className="w-full flex items-center justify-center gap-2 py-3 px-4 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                    >
                      <Download className="w-4 h-4" />
                      Download vCard (.vcf)
                    </button>
                    
                    <button
                      onClick={handleDownloadBoth}
                      className="w-full flex items-center justify-center gap-2 py-3 px-4 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
                    >
                      <Download className="w-4 h-4" />
                      Download Both Files
                    </button>
                  </div>

                  {/* Contact Info Preview */}
                  <div className="bg-white/10 rounded-lg p-4">
                    <h4 className="text-white font-semibold mb-3">Contact Information</h4>
                    <div className="text-sm text-gray-300 space-y-1">
                      <div><strong>Name:</strong> {contact.name}</div>
                      {contact.organization && <div><strong>Organization:</strong> {contact.organization}</div>}
                      {contact.title && <div><strong>Title:</strong> {contact.title}</div>}
                      {contact.email && <div><strong>Email:</strong> {contact.email}</div>}
                      {contact.phone && <div><strong>Phone:</strong> {contact.phone}</div>}
                      {contact.website && <div><strong>Website:</strong> {contact.website}</div>}
                      {contact.address && <div><strong>Address:</strong> {contact.address}</div>}
                    </div>
                  </div>
                </div>
              ) : (
                <div className="text-center py-12">
                  <QrCode className="w-16 h-16 text-gray-600 mx-auto mb-4" />
                  <p className="text-gray-400">Fill in your contact information and click "Generate QR Code" to create your QR code and vCard files.</p>
                </div>
              )}
            </div>

            {/* Info Section */}
            <div className="bg-gradient-to-r from-blue-500/20 to-purple-500/20 rounded-xl p-6 border border-blue-500/30">
              <h4 className="text-white font-semibold mb-3">Standard Mode Features</h4>
              <ul className="text-sm text-gray-300 space-y-2">
                <li>• Clean QR code generation from contact data</li>
                <li>• vCard file (.vcf) for easy contact import</li>
                <li>• Customizable QR code colors and styles</li>
                <li>• High-quality PNG output</li>
                <li>• No templates or backgrounds - just clean QR codes</li>
                <li>• Perfect for simple contact sharing</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StandardGenerator; 