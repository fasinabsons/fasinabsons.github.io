import React, { useState, useCallback, useRef } from 'react';
import { ArrowLeft, Upload, Scan, Download, Loader2, Eye, Edit, Check } from 'lucide-react';
import { Contact, QRCodeStyle } from '../types';
import { ContactForm } from './QRFormUtils';
import { scanBusinessCard } from '../utils/cardScanner';
import { generateEmbeddedQRCard, EmbeddedQRSettings } from '../utils/embeddedQRGenerator';
import { createVCardBlob, sanitizeFilename, validateContact } from '../utils/qrGenerator';
import FontSelector from './FontSelector';

// Enhanced contact interface for OCR results
interface EnhancedContact extends Contact {
  confidence?: number;
  logoColors?: Array<{ hex: string; rgb: string; frequency: number }>;
  extractedPhones?: string[];
  extractedEmails?: string[];
  processingMetrics?: {
    ocrTime: number;
    preprocessingTime: number;
    parsingTime: number;
    totalTime: number;
    imageQuality: number;
  };
}

interface OCRToQRGeneratorProps {
  onBack: () => void;
}

const DEFAULT_BACKGROUNDS = [
  { id: 'template1', name: 'Template 01', url: '/src/assets/01.png' },
  { id: 'template2', name: 'Template 02', url: '/src/assets/02.png' },
  { id: 'template3', name: 'Template 03', url: '/src/assets/03.png' },
  { id: 'template4', name: 'Template 04', url: '/src/assets/04.png' },
  { id: 'template5', name: 'Template 05', url: '/src/assets/05.png' },
  { id: 'template6', name: 'Template 06', url: '/src/assets/06.png' },
  { id: 'template7', name: 'Template 07', url: '/src/assets/07.png' },
  { id: 'template8', name: 'Template 08', url: '/src/assets/08.png' },
  { id: 'template9', name: 'Template 09', url: '/src/assets/09.png' },
  { id: 'template10', name: 'Template 10', url: '/src/assets/10.png' }
];

const LAYOUT_OPTIONS = [
  { 
    id: 'qr-top', 
    name: 'Top Area', 
    description: 'QR code in upper third (time area) - most visible during quick access',
    position: 'top'
  },
  { 
    id: 'qr-middle', 
    name: 'Middle Area', 
    description: 'QR code in center third - balanced layout with message above/below',
    position: 'middle'
  },
  { 
    id: 'qr-bottom', 
    name: 'Bottom Area', 
    description: 'QR code in lower third - message at top, easiest thumb access',
    position: 'bottom'
  }
];

const OCRToQRGenerator: React.FC<OCRToQRGeneratorProps> = ({ onBack }) => {
  const [step, setStep] = useState<'upload' | 'edit' | 'customize' | 'preview'>('upload');
  const [uploadedImage, setUploadedImage] = useState<string | null>(null);
  const [isScanning, setIsScanning] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [scanError, setScanError] = useState<string | null>(null);
  const [errors, setErrors] = useState<string[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

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
    transparent: true,
    gradient: false,
    gradientColor: '#8b5cf6',
    borderRadius: 0
  });

  const [selectedLayout, setSelectedLayout] = useState(LAYOUT_OPTIONS[2]); // Default to bottom
  const [selectedBackground, setSelectedBackground] = useState(DEFAULT_BACKGROUNDS[0]);
  const [customMessage, setCustomMessage] = useState('');
  const [showNameOnCard, setShowNameOnCard] = useState(false);
  const [messageFont, setMessageFont] = useState({
    family: 'Inter, -apple-system, BlinkMacSystemFont, sans-serif',
    size: 24
  });
  const [messageColor, setMessageColor] = useState('#ffffff');
  
  // Enhanced styling options
  const [enhancedStyling, setEnhancedStyling] = useState<{
    textShadow: boolean;
    textOutline: boolean;
    qrBorderRadius: number;
    qrShadow: boolean;
    spacing: {
      margin: number;
      padding: number;
      elementGap: number;
    };
    typography: {
      messageWeight: 'normal' | 'bold' | 'light';
      nameWeight: 'normal' | 'bold' | 'light';
      letterSpacing: number;
      lineHeight: number;
    };
  }>({
    textShadow: true,
    textOutline: false,
    qrBorderRadius: 8,
    qrShadow: true,
    spacing: {
      margin: 80,
      padding: 60,
      elementGap: 120
    },
    typography: {
      messageWeight: 'normal',
      nameWeight: 'bold',
      letterSpacing: 0.5,
      lineHeight: 1.4
    }
  });

  const [generatedData, setGeneratedData] = useState<{
    embeddedCardUrl: string;
    vCardBlob: Blob;
    filename: string;
    vCardData: string;
  } | null>(null);

  // Enhanced phone number parsing for better display
  const parsePhoneNumbers = (contact: Contact) => {
    const phones = [];
    
    if (contact.mobilePhone) {
      phones.push({ label: 'Mobile', value: contact.mobilePhone, type: 'mobile' });
    }
    if (contact.workPhone) {
      phones.push({ label: 'Work', value: contact.workPhone, type: 'work' });
    }
    if (contact.homePhone) {
      phones.push({ label: 'Home', value: contact.homePhone, type: 'home' });
    }
    if (contact.faxPhone) {
      phones.push({ label: 'Fax', value: contact.faxPhone, type: 'fax' });
    }
    
    // Fallback to parsing the main phone field if no specific phones are set
    if (phones.length === 0 && contact.phone) {
      const phonesList = contact.phone.split('|').map(p => p.trim()).filter(p => p.length > 0);
      phonesList.forEach((phone, index) => {
        let label = `Phone ${index + 1}`;
        let value = phone;
        let type = 'phone';
        
        // Detect phone type from prefix
        if (phone.startsWith('T ')) {
          label = 'Work';
          type = 'work';
          value = phone.substring(2).trim();
        } else if (phone.startsWith('F ')) {
          label = 'Fax';
          type = 'fax';
          value = phone.substring(2).trim();
        } else if (index === 0) {
          label = 'Mobile';
          type = 'mobile';
        }
        
        phones.push({ label, value, type });
      });
    }
    
    return phones;
  };

  const generateVCard = useCallback((contact: Contact): string => {
    const firstName = contact.firstName || '';
    const lastName = contact.lastName || '';
    const fullName = contact.name || [firstName, lastName].filter(Boolean).join(' ');
    
    // Build comprehensive vCard with all contact details
    const vcard = [
      'BEGIN:VCARD',
      'VERSION:3.0',
      `FN:${fullName}`,
      `N:${lastName};${firstName};;;`,
      
      // Organization info
      contact.organization ? `ORG:${contact.organization}` : '',
      contact.title ? `TITLE:${contact.title}` : '',
      contact.department ? `ROLE:${contact.department}` : '',
      
      // Email
      contact.email ? `EMAIL;TYPE=WORK:${contact.email}` : '',
      
      // Phone numbers with proper types
      contact.mobilePhone ? `TEL;TYPE=CELL:${contact.mobilePhone}` : '',
      contact.workPhone ? `TEL;TYPE=WORK:${contact.workPhone}` : '',
      contact.homePhone ? `TEL;TYPE=HOME:${contact.homePhone}` : '',
      contact.faxPhone ? `TEL;TYPE=FAX:${contact.faxPhone}` : '',
      
      // Address (structured)
      contact.street || contact.city || contact.state || contact.zipcode || contact.country ? 
        `ADR;TYPE=WORK:;;${contact.street || ''};${contact.city || ''};${contact.state || ''};${contact.zipcode || ''};${contact.country || ''}` : '',
      
      // Website
      contact.website ? `URL:${contact.website}` : '',
      
      // Notes
      contact.notes ? `NOTE:${contact.notes}` : '',
      
      'END:VCARD'
    ].filter(Boolean);

    return vcard.join('\n');
  }, []);

  const handleImageUpload = useCallback(async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setScanError('Please select a valid image file');
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      setScanError('Image file size must be less than 10MB');
      return;
    }

    setScanError(null);
    setIsScanning(true);

    try {
      const imageUrl = URL.createObjectURL(file);
      setUploadedImage(imageUrl);

      // Enhanced OCR with multi-pass processing and quality assessment
      const scannedContact = await scanBusinessCard(file) as EnhancedContact;
      
      // Apply logo colors to QR style if available
      if (scannedContact.logoColors && scannedContact.logoColors.length > 0) {
        const logoColors = scannedContact.logoColors;
        const primaryColor = logoColors[0].hex;
        setQrStyle(prev => ({
          ...prev,
          foregroundColor: primaryColor,
          gradient: logoColors.length > 1,
          gradientColor: logoColors[1]?.hex || primaryColor
        }));
      }

      setContact(scannedContact);
      setStep('edit');
      
      // Show enhanced processing information
      if (scannedContact.confidence && scannedContact.confidence < 70) {
        setScanError(`OCR confidence: ${scannedContact.confidence}%. Please review extracted information carefully. Advanced processing completed successfully.`);
      } else if (scannedContact.confidence) {
        setScanError(`OCR confidence: ${scannedContact.confidence}%. Information extracted with enhanced processing.`);
      }
      
      // Log processing metrics if available
      if (scannedContact.processingMetrics) {
        console.log('Processing metrics:', scannedContact.processingMetrics);
      }
      
    } catch (error) {
      console.error('Enhanced OCR scanning failed:', error);
      setScanError('Failed to scan the business card. Please try again or enter details manually.');
    } finally {
      setIsScanning(false);
    }
  }, []);

  const handleEditComplete = useCallback(() => {
    const validationErrors = validateContact(contact);
    if (validationErrors.length > 0) {
      setErrors(validationErrors);
      return;
    }
    setErrors([]);
    setStep('customize');
  }, [contact]);

  const handleGenerate = useCallback(async () => {
    const validationErrors = validateContact(contact);
    if (validationErrors.length > 0) {
      setErrors(validationErrors);
      return;
    }

    setErrors([]);
    setIsGenerating(true);

    try {
      const settings: EmbeddedQRSettings = {
        contact,
        qrStyle,
        backgroundImage: selectedBackground.url || undefined,
        messages: {
          message1: customMessage || '',
          message2: showNameOnCard ? contact.name : ''
        },
        layout: selectedLayout.id as 'qr-bottom' | 'qr-middle' | 'qr-top',
        textColor: messageColor,
        font: messageFont.family,
        fontSize: messageFont.size,
        // Enhanced styling options
        textShadow: enhancedStyling.textShadow,
        textOutline: enhancedStyling.textOutline,
        qrBorderRadius: enhancedStyling.qrBorderRadius,
        qrShadow: enhancedStyling.qrShadow,
        spacing: enhancedStyling.spacing,
        typography: enhancedStyling.typography
      };

      const embeddedCardUrl = await generateEmbeddedQRCard(settings);
      const vCardData = generateVCard(contact);
      const vCardBlob = createVCardBlob(vCardData);
      const filename = sanitizeFilename(contact.name || 'contact');

      setGeneratedData({
        embeddedCardUrl,
        vCardBlob,
        filename,
        vCardData
      });

      setStep('preview');
    } catch (error) {
      console.error('Generation failed:', error);
      setErrors(['Failed to generate QR code card. Please try again.']);
    } finally {
      setIsGenerating(false);
    }
  }, [
    contact, 
    qrStyle, 
    selectedBackground, 
    selectedLayout, 
    customMessage, 
    messageFont, 
    messageColor, 
    generateVCard, 
    showNameOnCard,
    enhancedStyling.textShadow,
    enhancedStyling.textOutline,
    enhancedStyling.qrBorderRadius,
    enhancedStyling.qrShadow,
    enhancedStyling.spacing,
    enhancedStyling.typography
  ]);

  const handleDownloadCard = useCallback(() => {
    if (!generatedData) return;
    const link = document.createElement('a');
    link.href = generatedData.embeddedCardUrl;
    link.download = `${generatedData.filename}_Business_Card.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }, [generatedData]);

  const handleDownloadVCard = useCallback(() => {
    if (!generatedData) return;
    const url = URL.createObjectURL(generatedData.vCardBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${generatedData.filename}.vcf`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }, [generatedData]);

  const handleDownloadBoth = useCallback(async () => {
    if (!generatedData) return;
    handleDownloadCard();
    setTimeout(() => {
      handleDownloadVCard();
    }, 100);
  }, [generatedData, handleDownloadCard, handleDownloadVCard]);

  const resetForm = useCallback(() => {
    setStep('upload');
    setUploadedImage(null);
    setContact({
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
    setGeneratedData(null);
    setCustomMessage('');
    setShowNameOnCard(false);
    setErrors([]);
    setScanError(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  }, []);

  const renderUploadStep = () => (
    <div className="text-center">
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-white mb-2">Step 1: Upload Business Card</h2>
        <p className="text-gray-300">Take a photo or upload an image of a business card to scan</p>
      </div>

      <div
        className={`border-2 border-dashed rounded-xl p-12 cursor-pointer transition-colors ${
          isScanning ? 'border-purple-500 bg-purple-500/10' : 'border-gray-600 hover:border-purple-500'
        }`}
        onClick={() => !isScanning && fileInputRef.current?.click()}
      >
        {isScanning ? (
          <div className="space-y-4">
            <Loader2 className="w-16 h-16 text-purple-400 mx-auto animate-spin" />
            <div>
              <p className="text-white text-lg">Scanning business card...</p>
              <p className="text-gray-400 text-sm">Multi-pass OCR with quality assessment</p>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <Upload className="w-16 h-16 text-gray-400 mx-auto" />
            <div>
              <p className="text-white text-lg">Upload Business Card Image</p>
              <p className="text-gray-400 text-sm">PNG, JPG, or GIF up to 10MB</p>
            </div>
          </div>
        )}
      </div>

      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleImageUpload}
        className="hidden"
        disabled={isScanning}
        aria-label="Upload business card image"
      />

      {scanError && (
        <div className="mt-6 p-4 bg-red-500/20 border border-red-500/50 rounded-lg">
          <p className="text-red-300 text-sm">{scanError}</p>
        </div>
      )}

      {uploadedImage && (
        <div className="mt-6">
          <p className="text-white text-sm mb-3">Uploaded Image:</p>
          <img 
            src={uploadedImage} 
            alt="Uploaded business card" 
            className="max-w-sm mx-auto rounded-lg shadow-lg"
          />
        </div>
      )}
    </div>
  );

  const renderEditStep = () => {
    const phoneNumbers = parsePhoneNumbers(contact);
    
    return (
      <div>
        <div className="mb-8 text-center">
          <h2 className="text-2xl font-bold text-white mb-2">Step 2: Review & Edit Details</h2>
          <p className="text-gray-300">Verify the extracted information and make corrections</p>
        </div>

        <div className="grid lg:grid-cols-2 gap-8">
          <div className="space-y-6">
            <ContactForm
              contact={contact}
              onChange={setContact}
              errors={errors}
            />

            <div className="flex justify-between">
              <button
                onClick={() => setStep('upload')}
                className="flex items-center gap-2 px-6 py-3 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
              >
                <ArrowLeft className="w-4 h-4" />
                Back to Upload
              </button>

              <button
                onClick={handleEditComplete}
                className="flex items-center gap-2 px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
              >
                Continue
                <Edit className="w-4 h-4" />
              </button>
            </div>

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

          <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6">
            <h3 className="text-xl font-semibold text-white mb-4">Scanned Image</h3>
            {uploadedImage && (
              <img 
                src={uploadedImage} 
                alt="Scanned business card" 
                className="w-full rounded-lg shadow-lg mb-4"
              />
            )}
            
            <div className="space-y-3">

              {(contact as EnhancedContact).confidence && (
                <div className={`p-3 rounded-lg ${
                  (contact as EnhancedContact).confidence! >= 80 
                    ? 'bg-green-500/20' 
                    : (contact as EnhancedContact).confidence! >= 60 
                    ? 'bg-yellow-500/20' 
                    : 'bg-red-500/20'
                }`}>
                  <p className={`text-sm ${
                    (contact as EnhancedContact).confidence! >= 80 
                      ? 'text-green-300' 
                      : (contact as EnhancedContact).confidence! >= 60 
                      ? 'text-yellow-300' 
                      : 'text-red-300'
                  }`}>
                    <strong>OCR Confidence:</strong> {(contact as EnhancedContact).confidence}%
                  </p>
                </div>
              )}

              {(contact as EnhancedContact).logoColors && (contact as EnhancedContact).logoColors!.length > 0 && (
                <div className="p-3 bg-purple-500/20 rounded-lg">
                  <p className="text-purple-300 text-sm mb-2">
                    <strong>Logo Colors Extracted:</strong>
                  </p>
                  <div className="flex gap-2 flex-wrap">
                    {(contact as EnhancedContact).logoColors!.slice(0, 3).map((color, index) => (
                      <div key={index} className="flex items-center gap-2">
                        <div
                          className="w-4 h-4 rounded border border-gray-400"
                          style={{ backgroundColor: color.hex }}
                        />
                        <span className="text-xs text-purple-200">{color.hex}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {phoneNumbers.length > 1 && (
                <div className="p-3 bg-indigo-500/20 rounded-lg">
                  <p className="text-indigo-300 text-sm mb-2">
                    <strong>Multiple Phone Numbers:</strong>
                  </p>
                  {phoneNumbers.map((phone, index) => (
                    <div key={index} className="text-xs text-indigo-200">
                      {phone.label}: {phone.value}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  };

  const renderCustomizeStep = () => (
    <div>
      <div className="mb-8 text-center">
        <h2 className="text-2xl font-bold text-white mb-2">Step 3: Customize Design</h2>
        <p className="text-gray-300">Choose layout, background, and customize your message</p>
      </div>

      <div className="grid lg:grid-cols-2 gap-8">
        <div className="space-y-6">
          {/* Phone Screen Layout Areas */}
          <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6">
            <h3 className="text-xl font-semibold text-white mb-4">Phone Screen Layout</h3>
            <p className="text-gray-300 text-sm mb-6">Choose the optimal QR code position for phone lockscreen use</p>
            
            <div className="grid gap-3">
              {LAYOUT_OPTIONS.map((layout) => (
                <div
                  key={layout.id}
                  className={`p-4 rounded-lg border-2 cursor-pointer transition-all duration-300 ${
                    selectedLayout.id === layout.id
                      ? 'border-purple-500 bg-purple-500/20'
                      : 'border-gray-600 bg-white/5 hover:border-purple-400'
                  }`}
                  onClick={() => setSelectedLayout(layout)}
                >
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-semibold text-white">{layout.name}</h4>
                    {selectedLayout.id === layout.id && (
                      <Check className="w-5 h-5 text-purple-400" />
                    )}
                  </div>
                  <p className="text-sm text-gray-300">{layout.description}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Background Templates - All 10 */}
          <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6">
            <h3 className="text-xl font-semibold text-white mb-4">Background Templates</h3>
            <p className="text-gray-300 text-sm mb-6">Choose from professional backgrounds</p>
            
            <div className="grid grid-cols-5 gap-2">
              {DEFAULT_BACKGROUNDS.map((bg) => (
                <div
                  key={bg.id}
                  className={`relative aspect-square rounded-lg border-2 cursor-pointer transition-all duration-300 overflow-hidden ${
                    selectedBackground.id === bg.id
                      ? 'border-purple-500 scale-105'
                      : 'border-gray-600 hover:border-purple-400 hover:scale-105'
                  }`}
                  onClick={() => setSelectedBackground(bg)}
                >
                  {bg.url ? (
                    <img
                      src={bg.url}
                      alt={bg.name}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        target.style.display = 'none';
                        target.nextElementSibling?.classList.remove('hidden');
                      }}
                    />
                  ) : null}
                  <div className="hidden w-full h-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
                    <span className="text-white text-xs font-medium text-center p-1">{bg.name}</span>
                  </div>
                  {selectedBackground.id === bg.id && (
                    <div className="absolute inset-0 bg-purple-500/30 flex items-center justify-center">
                      <Check className="w-6 h-6 text-white" />
                    </div>
                  )}
                  <div className="absolute bottom-0 left-0 right-0 bg-black/50 text-white text-xs p-1 text-center">
                    {bg.name}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Message Customization */}
          <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6">
            <h3 className="text-xl font-semibold text-white mb-4">Message Customization</h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Custom Message (max 50 characters)
                </label>
                <input
                  type="text"
                  value={customMessage}
                  onChange={(e) => setCustomMessage(e.target.value.slice(0, 50))}
                  maxLength={50}
                  className="w-full px-3 py-2 bg-white/10 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:border-purple-500 focus:ring-1 focus:ring-purple-500"
                  placeholder="e.g., Scan to save my contact"
                />
                <div className="text-right text-xs text-gray-400 mt-1">
                  {customMessage.length}/50
                </div>
              </div>

              {/* Name Display Option */}
              <div className="flex items-center gap-3">
                <label className="flex items-center gap-2 text-gray-300 text-sm">
                  <input
                    type="checkbox"
                    checked={showNameOnCard}
                    onChange={(e) => setShowNameOnCard(e.target.checked)}
                    className="w-4 h-4 text-purple-600 bg-white/10 border-gray-600 rounded focus:ring-purple-500"
                  />
                  Show name on card
                </label>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Text Color
                  </label>
                  <div className="flex items-center gap-2">
                    <input
                      type="color"
                      value={messageColor}
                      onChange={(e) => setMessageColor(e.target.value)}
                      className="w-12 h-10 rounded border border-gray-600"
                      aria-label="Select text color"
                    />
                    <input
                      type="text"
                      value={messageColor}
                      onChange={(e) => setMessageColor(e.target.value)}
                      className="flex-1 px-3 py-2 bg-white/10 border border-gray-600 rounded text-white text-sm"
                      placeholder="#ffffff"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Font Size
                  </label>
                  <select
                    value={messageFont.size}
                    onChange={(e) => setMessageFont(prev => ({ ...prev, size: parseInt(e.target.value) }))}
                    className="w-full px-3 py-2 bg-white/10 border border-gray-600 rounded-lg text-white"
                    aria-label="Select font size"
                  >
                    <option value={16} className="bg-gray-800">Small (16px)</option>
                    <option value={20} className="bg-gray-800">Medium (20px)</option>
                    <option value={24} className="bg-gray-800">Large (24px)</option>
                    <option value={28} className="bg-gray-800">Extra Large (28px)</option>
                  </select>
                </div>
              </div>
            </div>
          </div>

          {/* Font Selection */}
          <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6">
            <h3 className="text-xl font-semibold text-white mb-4">Font Selection</h3>
            <FontSelector
              onFontSelect={(font) => setMessageFont(prev => ({ ...prev, family: font.family }))}
              selectedFont={{ id: 'current', name: 'Current', family: messageFont.family, category: 'current', weight: '400', style: 'normal' }}
            />
          </div>

          {/* Enhanced Styling Options */}
          <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6">
            <h3 className="text-xl font-semibold text-white mb-4">Professional Styling</h3>
            
            <div className="space-y-4">
              {/* Typography Options */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Message Weight
                  </label>
                  <select
                    value={enhancedStyling.typography.messageWeight}
                    onChange={(e) => setEnhancedStyling(prev => ({
                      ...prev,
                      typography: { ...prev.typography, messageWeight: e.target.value as 'normal' | 'bold' | 'light' }
                    }))}
                    className="w-full px-3 py-2 bg-white/10 border border-gray-600 rounded-lg text-white"
                    aria-label="Message weight"
                  >
                    <option value="light" className="bg-gray-800">Light</option>
                    <option value="normal" className="bg-gray-800">Normal</option>
                    <option value="bold" className="bg-gray-800">Bold</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Name Weight
                  </label>
                  <select
                    value={enhancedStyling.typography.nameWeight}
                    onChange={(e) => setEnhancedStyling(prev => ({
                      ...prev,
                      typography: { ...prev.typography, nameWeight: e.target.value as 'normal' | 'bold' | 'light' }
                    }))}
                    className="w-full px-3 py-2 bg-white/10 border border-gray-600 rounded-lg text-white"
                    aria-label="Name weight"
                  >
                    <option value="light" className="bg-gray-800">Light</option>
                    <option value="normal" className="bg-gray-800">Normal</option>
                    <option value="bold" className="bg-gray-800">Bold</option>
                  </select>
                </div>
              </div>

              {/* Text Effects */}
              <div className="grid grid-cols-2 gap-4">
                <label className="flex items-center gap-2 text-gray-300 text-sm">
                  <input
                    type="checkbox"
                    checked={enhancedStyling.textShadow}
                    onChange={(e) => setEnhancedStyling(prev => ({ ...prev, textShadow: e.target.checked }))}
                    className="w-4 h-4 text-purple-600 bg-white/10 border-gray-600 rounded focus:ring-purple-500"
                  />
                  Text Shadow
                </label>

                <label className="flex items-center gap-2 text-gray-300 text-sm">
                  <input
                    type="checkbox"
                    checked={enhancedStyling.textOutline}
                    onChange={(e) => setEnhancedStyling(prev => ({ ...prev, textOutline: e.target.checked }))}
                    className="w-4 h-4 text-purple-600 bg-white/10 border-gray-600 rounded focus:ring-purple-500"
                  />
                  Text Outline
                </label>
              </div>

              {/* QR Code Styling */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    QR Border Radius
                  </label>
                  <input
                    type="range"
                    min="0"
                    max="20"
                    value={enhancedStyling.qrBorderRadius}
                    onChange={(e) => setEnhancedStyling(prev => ({ ...prev, qrBorderRadius: parseInt(e.target.value) }))}
                    className="w-full"
                    aria-label="QR border radius"
                  />
                  <div className="text-xs text-gray-400 text-center mt-1">
                    {enhancedStyling.qrBorderRadius}px
                  </div>
                </div>

                <div className="flex items-center">
                  <label className="flex items-center gap-2 text-gray-300 text-sm">
                    <input
                      type="checkbox"
                      checked={enhancedStyling.qrShadow}
                      onChange={(e) => setEnhancedStyling(prev => ({ ...prev, qrShadow: e.target.checked }))}
                      className="w-4 h-4 text-purple-600 bg-white/10 border-gray-600 rounded focus:ring-purple-500"
                    />
                    QR Code Shadow
                  </label>
                </div>
              </div>

              {/* Spacing Controls */}
              <div className="space-y-3">
                <h4 className="text-sm font-medium text-gray-300">Professional Spacing</h4>
                
                <div className="grid grid-cols-3 gap-3">
                  <div>
                    <label className="block text-xs text-gray-400 mb-1">Margins</label>
                    <input
                      type="range"
                      min="40"
                      max="120"
                      value={enhancedStyling.spacing.margin}
                      onChange={(e) => setEnhancedStyling(prev => ({
                        ...prev,
                        spacing: { ...prev.spacing, margin: parseInt(e.target.value) }
                      }))}
                      className="w-full"
                      aria-label="Margin spacing control"
                    />
                    <div className="text-xs text-gray-500 text-center">{enhancedStyling.spacing.margin}px</div>
                  </div>

                  <div>
                    <label className="block text-xs text-gray-400 mb-1">Padding</label>
                    <input
                      type="range"
                      min="20"
                      max="100"
                      value={enhancedStyling.spacing.padding}
                      onChange={(e) => setEnhancedStyling(prev => ({
                        ...prev,
                        spacing: { ...prev.spacing, padding: parseInt(e.target.value) }
                      }))}
                      className="w-full"
                      aria-label="Padding spacing control"
                    />
                    <div className="text-xs text-gray-500 text-center">{enhancedStyling.spacing.padding}px</div>
                  </div>

                  <div>
                    <label className="block text-xs text-gray-400 mb-1">Element Gap</label>
                    <input
                      type="range"
                      min="60"
                      max="200"
                      value={enhancedStyling.spacing.elementGap}
                      onChange={(e) => setEnhancedStyling(prev => ({
                        ...prev,
                        spacing: { ...prev.spacing, elementGap: parseInt(e.target.value) }
                      }))}
                      className="w-full"
                      aria-label="Element gap spacing control"
                    />
                    <div className="text-xs text-gray-500 text-center">{enhancedStyling.spacing.elementGap}px</div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="flex justify-between">
            <button
              onClick={() => setStep('edit')}
              className="flex items-center gap-2 px-6 py-3 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to Edit
            </button>

            <button
              onClick={handleGenerate}
              disabled={isGenerating}
              className="flex items-center gap-2 px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors disabled:opacity-50"
            >
              {isGenerating ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Generating...
                </>
              ) : (
                <>
                  Generate Card
                  <Eye className="w-4 h-4" />
                </>
              )}
            </button>
          </div>
        </div>

        <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6">
          <h3 className="text-xl font-semibold text-white mb-6">Preview Settings</h3>
          
          <div className="space-y-4">
            <div className="p-4 bg-white/10 rounded-lg">
              <h4 className="text-white font-semibold mb-3">Contact Information</h4>
              <div className="text-sm text-gray-300 space-y-1">
                <div><strong>Name:</strong> {contact.name || 'Not provided'}</div>
                {contact.organization && <div><strong>Organization:</strong> {contact.organization}</div>}
                {contact.title && <div><strong>Title:</strong> {contact.title}</div>}
                {contact.email && <div><strong>Email:</strong> {contact.email}</div>}
                
                {/* Enhanced phone number display */}
                {contact.phone && (
                  <div>
                    <strong>Phone Numbers:</strong>
                    <div className="ml-4 mt-1">
                      {parsePhoneNumbers(contact).map((phone, index) => (
                        <div key={index} className="text-xs">
                          {phone.label}: {phone.value}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>

            <div className="p-4 bg-white/10 rounded-lg">
              <h4 className="text-white font-semibold mb-3">Design Settings</h4>
              <div className="text-sm text-gray-300 space-y-1">
                <div><strong>Layout:</strong> {selectedLayout.name}</div>
                <div><strong>Background:</strong> {selectedBackground.name}</div>
                <div><strong>Text Color:</strong> {messageColor}</div>
                <div><strong>Font Size:</strong> {messageFont.size}px</div>
                <div><strong>Show Name:</strong> {showNameOnCard ? 'Yes' : 'No'}</div>
                {customMessage && <div><strong>Message:</strong> "{customMessage}"</div>}
              </div>
            </div>

            <div className="p-3 bg-yellow-500/20 rounded-lg">
              <p className="text-yellow-300 text-sm">
                <strong>Privacy Note:</strong> Contact details are embedded in the QR code. Only your custom message {showNameOnCard ? 'and name ' : ''}will appear on the card.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const renderPreviewStep = () => (
    <div>
      <div className="mb-8 text-center">
        <h2 className="text-2xl font-bold text-white mb-2">Step 4: Preview & Download</h2>
        <p className="text-gray-300">Your business card QR code is ready!</p>
      </div>

      <div className="grid lg:grid-cols-2 gap-8">
        <div className="text-center">
          <div className="bg-black rounded-lg p-4 mb-6">
            <div className="relative mx-auto w-[270px] h-[480px]">
              {generatedData && (
                <img 
                  src={generatedData.embeddedCardUrl}
                  alt="Generated Business Card"
                  className="w-full h-full object-cover rounded-lg shadow-lg"
                />
              )}
              <div className="absolute inset-0 rounded-lg border-4 border-gray-800 pointer-events-none"></div>
            </div>
          </div>
          
          <p className="text-gray-300 text-sm">1080x1920 Phone Wallpaper Format</p>
        </div>

        <div className="space-y-6">
          <div className="space-y-3">
            <button
              onClick={handleDownloadCard}
              className="w-full flex items-center justify-center gap-2 py-3 px-4 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
            >
              <Download className="w-4 h-4" />
              Download Business Card (.png)
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
              className="w-full flex items-center justify-center gap-2 py-3 px-4 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <Download className="w-4 h-4" />
              Download Both Files
            </button>
          </div>

          <div className="flex gap-3">
            <button
              onClick={() => setStep('customize')}
              className="flex-1 flex items-center justify-center gap-2 py-3 px-4 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
            >
              <Edit className="w-4 h-4" />
              Edit Design
            </button>
            
            <button
              onClick={resetForm}
              className="flex-1 flex items-center justify-center gap-2 py-3 px-4 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
            >
              <Scan className="w-4 h-4" />
              Scan New Card
            </button>
          </div>

          <div className="bg-white/10 rounded-lg p-4">
            <h4 className="text-white font-semibold mb-3">Generated Files</h4>
            <div className="text-sm text-gray-300 space-y-2">
              <div className="flex items-center justify-between">
                <span>Business Card Image:</span>
                <span className="text-green-400">✓ Ready</span>
              </div>
              <div className="flex items-center justify-between">
                <span>vCard Contact File:</span>
                <span className="text-green-400">✓ Ready</span>
              </div>
              <div className="flex items-center justify-between">
                <span>Format:</span>
                <span>1080x1920 PNG</span>
              </div>
              <div className="flex items-center justify-between">
                <span>QR Position:</span>
                <span>{selectedLayout.name}</span>
              </div>
            </div>
          </div>

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
      </div>
    </div>
  );

  const steps = ['upload', 'edit', 'customize', 'preview'] as const;
  const currentStepIndex = steps.indexOf(step);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      <div className="container mx-auto px-4 py-8">
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
            Business Card to QR
          </h1>
          <p className="text-gray-300">Scan business cards and create professional QR code cards</p>
          
          <div className="flex items-center justify-center gap-2 mt-6">
            {steps.map((stepName, index) => (
              <div key={stepName} className="flex items-center">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold ${
                  currentStepIndex === index 
                    ? 'bg-purple-600 text-white' 
                    : currentStepIndex > index
                    ? 'bg-green-600 text-white'
                    : 'bg-gray-600 text-gray-300'
                }`}>
                  {index + 1}
                </div>
                {index < steps.length - 1 && (
                  <div className={`w-8 h-1 mx-1 ${
                    currentStepIndex > index ? 'bg-green-600' : 'bg-gray-600'
                  }`} />
                )}
              </div>
            ))}
          </div>
        </div>

        <div className="max-w-6xl mx-auto">
          {step === 'upload' && renderUploadStep()}
          {step === 'edit' && renderEditStep()}
          {step === 'customize' && renderCustomizeStep()}
          {step === 'preview' && renderPreviewStep()}
        </div>

        <div className="max-w-4xl mx-auto mt-12">
          <div className="bg-gradient-to-r from-blue-500/20 to-purple-500/20 rounded-xl p-6 border border-blue-500/30">
            <h4 className="text-white font-semibold mb-3">Advanced OCR Technology</h4>
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <h5 className="text-purple-300 font-medium mb-2">🔍 Multi-Pass Processing</h5>
                <ul className="text-sm text-gray-300 space-y-1">
                  <li>• Dual-pass OCR with confidence optimization</li>
                  <li>• Quality-based parameter adjustment</li>
                  <li>• Advanced image enhancement with metrics</li>
                  <li>• Intelligent text cleaning and error correction</li>
                </ul>
              </div>
              <div>
                <h5 className="text-blue-300 font-medium mb-2">🌐 Smart Field Detection</h5>
                <ul className="text-sm text-gray-300 space-y-1">
                  <li>• Enhanced email extraction with OCR error correction</li>
                  <li>• T/F/E/A prefix handling for contact details</li>
                  <li>• Duplicate prevention and normalization</li>
                  <li>• Context-aware organization and title extraction</li>
                </ul>
              </div>
              <div>
                <h5 className="text-green-300 font-medium mb-2">🎯 Performance Optimization</h5>
                <ul className="text-sm text-gray-300 space-y-1">
                  <li>• Real-time processing metrics and timing</li>
                  <li>• Optimized patterns for better accuracy</li>
                  <li>• Reduced duplicate processing and cleanup</li>
                  <li>• Enhanced confidence scoring system</li>
                </ul>
              </div>
              <div>
                <h5 className="text-yellow-300 font-medium mb-2">📊 Quality Assurance</h5>
                <ul className="text-sm text-gray-300 space-y-1">
                  <li>• Image quality assessment before processing</li>
                  <li>• Automatic fallback mechanisms</li>
                  <li>• Logo color extraction for QR theming</li>
                  <li>• Professional business card output</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OCRToQRGenerator;