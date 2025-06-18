import React, { useState, useCallback, useRef } from 'react';
import { ArrowLeft, Upload, Download, Loader2, AlertCircle, CheckCircle, Eye, Scan, Settings } from 'lucide-react';
import JSZip from 'jszip';
import { saveAs } from 'file-saver';
import { Contact, QRCodeStyle } from '../types';
import { QRStyleForm } from './QRFormUtils';
import FontSelector from './FontSelector';
import { generateEmbeddedQRCard, EmbeddedQRSettings } from '../utils/embeddedQRGenerator';
import { createVCardBlob, sanitizeFilename } from '../utils/qrGenerator';
import { parseBulkCSV, validateBulkContacts } from '../utils/bulkProcessor';

interface TemplateBulkGeneratorProps {
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

interface ProcessingResult {
  contact: Contact;
  success: boolean;
  error?: string;
  embeddedCardUrl?: string;
  vCardBlob?: Blob;
  filename?: string;
}

const TEMPLATES: TemplateOption[] = [
  {
    id: 'qr-center-balanced',
    name: 'Professional Center',
    description: 'QR centered with mathematically balanced text distribution',
    layout: 'qr-bottom'
  },
  {
    id: 'qr-mobile-portrait',
    name: 'Mobile Optimized',
    description: 'Thumb-friendly QR placement optimized for mobile wallpapers',
    layout: 'qr-middle'
  },
  {
    id: 'qr-top-executive',
    name: 'Executive Top',
    description: 'Golden ratio positioning with premium text hierarchy',
    layout: 'qr-top'
  },
  {
    id: 'qr-landscape-pro',
    name: 'Landscape Pro',
    description: 'Professional side-by-side layout for wide-screen sharing',
    layout: 'qr-both-bottom'
  }
];

const DEFAULT_BACKGROUNDS: BackgroundOption[] = [
  { id: 'template1', name: 'Professional 01', url: '/src/assets/01.png' },
  { id: 'template2', name: 'Professional 02', url: '/src/assets/02.png' },
  { id: 'template3', name: 'Professional 03', url: '/src/assets/03.png' },
  { id: 'template4', name: 'Professional 04', url: '/src/assets/04.png' },
  { id: 'template5', name: 'Professional 05', url: '/src/assets/05.png' },
  { id: 'template6', name: 'Professional 06', url: '/src/assets/06.png' },
  { id: 'template7', name: 'Professional 07', url: '/src/assets/07.png' },
  { id: 'template8', name: 'Professional 08', url: '/src/assets/08.png' },
  { id: 'template9', name: 'Professional 09', url: '/src/assets/09.png' },
  { id: 'template10', name: 'Professional 10', url: '/src/assets/10.png' }
];

const TemplateBulkGenerator: React.FC<TemplateBulkGeneratorProps> = ({ onBack }) => {
  const [step, setStep] = useState<'upload' | 'customize' | 'generate' | 'results'>('upload');
  
  const [contacts, setContacts] = useState<Contact[]>([]);
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
  
  // Message functionality for bulk generation
  const [bulkMessages, setBulkMessages] = useState({
    useCommonMessages: false,
    commonMessage1: '',
    commonMessage2: '',
    useExcelMessages: true
  });

  const [isUploading, setIsUploading] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [progress, setProgress] = useState(0);
  const [results, setResults] = useState<ProcessingResult[]>([]);
  const [showPreview, setShowPreview] = useState(false);
  const [uploadErrors, setUploadErrors] = useState<string[]>([]);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const downloadSampleCSV = useCallback(() => {
    // Import the professional template function
    import('../utils/bulkProcessor').then(({ downloadProfessionalExcelTemplate }) => {
      downloadProfessionalExcelTemplate();
    });
  }, []);

  const parseCSV = useCallback(async (file: File): Promise<Contact[]> => {
    try {
      const parsedContacts = await parseBulkCSV(file);
      return parsedContacts.filter(contact => contact.name.trim());
    } catch (error) {
      throw new Error(error instanceof Error ? error.message : 'Failed to parse CSV data');
    }
  }, []);

  const handleFileUpload = useCallback(async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!file.name.toLowerCase().endsWith('.csv')) {
      setUploadErrors(['Please select a CSV file']);
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setUploadErrors(['File size must be less than 5MB']);
      return;
    }

    setIsUploading(true);
    setUploadErrors([]);

          try {
        const parsedContacts = await parseCSV(file);
        const { valid: validContacts, errors: validationErrors } = validateBulkContacts(parsedContacts);
        
        if (validationErrors.length > 0) {
          setUploadErrors(validationErrors.slice(0, 10)); // Show first 10 errors
        }
        
        if (validContacts.length === 0) {
          setUploadErrors(prev => [...prev, 'No valid contacts found in the CSV file']);
          return;
        }

        setContacts(validContacts);
        setStep('customize');
    } catch (error) {
      setUploadErrors([error instanceof Error ? error.message : 'Failed to process file']);
    } finally {
      setIsUploading(false);
    }
  }, [parseCSV]);

  const generateBulkCards = useCallback(async () => {
    if (contacts.length === 0) return;

    setIsGenerating(true);
    setProgress(0);
    setResults([]);
    setStep('generate');

    const newResults: ProcessingResult[] = [];

    for (let i = 0; i < contacts.length; i++) {
      const contact = contacts[i];
      
      try {

        const vcard = [
          'BEGIN:VCARD',
          'VERSION:3.0',
          `FN:${contact.name}`,
          `N:${contact.name.split(' ').reverse().join(';')}`,
          contact.email ? `EMAIL:${contact.email}` : '',
          contact.phone ? `TEL:${contact.phone}` : '',
          contact.organization ? `ORG:${contact.organization}` : '',
          contact.title ? `TITLE:${contact.title}` : '',
          contact.address ? `ADR:;;${contact.address};;;;` : '',
          contact.website ? `URL:${contact.website}` : '',
          'END:VCARD'
        ].filter(Boolean).join('\n');

        // Determine messages based on user preference
        let finalMessage1 = '';
        let finalMessage2 = '';
        
        if (bulkMessages.useCommonMessages) {
          // Use common messages for all contacts
          finalMessage1 = bulkMessages.commonMessage1;
          finalMessage2 = bulkMessages.commonMessage2;
        } else if (bulkMessages.useExcelMessages) {
          // Use messages from Excel/CSV file
          finalMessage1 = contact.message1 || '';
          finalMessage2 = contact.message2 || '';
        }

        const settings: EmbeddedQRSettings = {
          contact,
          qrStyle,
          backgroundImage: selectedBackground.url || undefined,
          messages: {
            message1: finalMessage1,
            message2: finalMessage2
          },
          layout: selectedTemplate.layout,
          textColor,
          font: selectedFont.family
        };

        const embeddedCardUrl = await generateEmbeddedQRCard(settings);
        const vCardBlob = createVCardBlob(vcard);
        const filename = sanitizeFilename(contact.name);

        newResults.push({
          contact,
          success: true,
          embeddedCardUrl,
          vCardBlob,
          filename
        });

      } catch (err) {
        newResults.push({
          contact,
          success: false,
          error: err instanceof Error ? err.message : 'Generation failed'
        });
      }

      setProgress(Math.round(((i + 1) / contacts.length) * 100));
      setResults([...newResults]);
    }

    setIsGenerating(false);
    setStep('results');
  }, [contacts, qrStyle, selectedBackground, selectedTemplate, textColor, selectedFont]);

  const downloadAll = useCallback(async () => {
    const successfulResults = results.filter(r => r.success);
    if (successfulResults.length === 0) return;

    const zip = new JSZip();
    const cardsFolder = zip.folder('Business_Cards');
    const vcardsFolder = zip.folder('vCards');

    for (const result of successfulResults) {
      if (result.embeddedCardUrl && result.vCardBlob && result.filename) {
        // Add business card image
        const cardResponse = await fetch(result.embeddedCardUrl);
        const cardBlob = await cardResponse.blob();
        cardsFolder?.file(`${result.filename}_Card.png`, cardBlob);

        // Add vCard
        vcardsFolder?.file(`${result.filename}.vcf`, result.vCardBlob);
      }
    }

    const zipBlob = await zip.generateAsync({ type: 'blob' });
    saveAs(zipBlob, 'Template_Business_Cards.zip');
  }, [results]);

  const downloadIndividual = useCallback((result: ProcessingResult, type: 'card' | 'vcard') => {
    if (!result.success || !result.filename) return;

    if (type === 'card' && result.embeddedCardUrl) {
      const link = document.createElement('a');
      link.href = result.embeddedCardUrl;
      link.download = `${result.filename}_Card.png`;
      link.click();
    } else if (type === 'vcard' && result.vCardBlob) {
      const url = URL.createObjectURL(result.vCardBlob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `${result.filename}.vcf`;
      link.click();
      URL.revokeObjectURL(url);
    }
  }, []);

  const resetAll = () => {
    setStep('upload');
    setContacts([]);
    setResults([]);
    setUploadErrors([]);
    setProgress(0);
    setShowPreview(false);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const renderUploadStep = () => (
    <div className="space-y-8">
      <div className="text-center">
        <h2 className="text-2xl font-bold text-white mb-2">Step 1: Upload Contact Data</h2>
        <p className="text-gray-300">Upload a CSV file with your contact information</p>
      </div>

      <div className="grid lg:grid-cols-2 gap-8">
        <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6">
          <h3 className="text-xl font-semibold text-white mb-4">Upload CSV File</h3>
          
          <div
            className={`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-colors ${
              isUploading ? 'border-purple-500 bg-purple-500/10' : 'border-gray-600 hover:border-purple-500'
            }`}
            onClick={() => !isUploading && fileInputRef.current?.click()}
          >
            {isUploading ? (
              <div className="space-y-4">
                <Loader2 className="w-12 h-12 text-purple-400 mx-auto animate-spin" />
                <p className="text-white">Processing file...</p>
              </div>
            ) : (
              <div className="space-y-4">
                <Upload className="w-12 h-12 text-gray-400 mx-auto" />
                <div>
                  <p className="text-white font-medium">Upload CSV File</p>
                  <p className="text-gray-400 text-sm">Drag and drop or click to select</p>
                  <p className="text-gray-500 text-xs mt-2">Max 5MB, CSV format only</p>
                </div>
              </div>
            )}
          </div>

          <input
            ref={fileInputRef}
            type="file"
            accept=".csv"
            onChange={handleFileUpload}
            className="hidden"
            disabled={isUploading}
            aria-label="Upload CSV file with contact data"
          />

          {uploadErrors.length > 0 && (
            <div className="mt-4 p-3 bg-red-500/20 border border-red-500/50 rounded-lg">
              <div className="flex items-center gap-2 text-red-300 text-sm">
                <AlertCircle className="w-4 h-4" />
                <div>
                  {uploadErrors.map((error, index) => (
                    <div key={index}>{error}</div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {contacts.length > 0 && (
            <div className="mt-4 p-3 bg-green-500/20 border border-green-500/50 rounded-lg">
              <div className="flex items-center gap-2 text-green-300 text-sm">
                <CheckCircle className="w-4 h-4" />
                <span>Successfully loaded {contacts.length} contacts</span>
              </div>
            </div>
          )}
        </div>

        <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6">
          <h3 className="text-xl font-semibold text-white mb-4">Sample CSV Format</h3>
          
          <div className="space-y-4">
            <button
              onClick={downloadSampleCSV}
              className="w-full flex items-center justify-center gap-2 py-3 px-4 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
            >
              <Download className="w-4 h-4" />
              Download Professional Template
            </button>

            <div className="text-sm text-gray-300">
              <p className="font-medium mb-2">Professional Template Features:</p>
              <ul className="space-y-1 text-xs">
                <li>• <span className="text-purple-300">Complete name fields</span> (Prefix, First Name, Last Name, Suffix)</li>
                <li>• <span className="text-purple-300">Multiple phone types</span> (Mobile, Work, Home, Fax)</li>
                <li>• <span className="text-purple-300">Full address components</span> (Street, City, State, Zip, Country)</li>
                <li>• <span className="text-purple-300">Organization details</span> (Company, Department, Job Title)</li>
                <li>• <span className="text-purple-300">Custom messages & notes</span> for personalized cards</li>
              </ul>
            </div>

            <div className="p-3 bg-blue-500/20 rounded-lg">
              <p className="text-blue-300 text-sm">
                <strong>Ready to Use:</strong> Includes sample data from your business cards (Johnny Jabbour, Ashwin Ajith) plus 20 empty rows for your contacts.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const renderCustomizeStep = () => (
    <div className="space-y-8">
      <div className="text-center">
        <h2 className="text-2xl font-bold text-white mb-2">Step 2: Customize Design</h2>
        <p className="text-gray-300">Choose layout, background, and styling options</p>
      </div>

      <div className="grid lg:grid-cols-2 gap-8">
        <div className="space-y-6">
          {/* Template Selection */}
          <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6">
            <h3 className="text-xl font-semibold text-white mb-4">Phone Screen Layout</h3>
            <p className="text-gray-300 text-sm mb-6">Choose QR code position for optimal phone lockscreen use</p>
            
            <div className="grid grid-cols-2 gap-3">
              {TEMPLATES.map((template) => (
                <div
                  key={template.id}
                  className={`p-4 rounded-lg border-2 cursor-pointer transition-all duration-300 ${
                    selectedTemplate.id === template.id
                      ? 'border-purple-500 bg-purple-500/20'
                      : 'border-gray-600 bg-white/5 hover:border-purple-400'
                  }`}
                  onClick={() => setSelectedTemplate(template)}
                >
                  <h4 className="font-semibold text-white text-sm">{template.name}</h4>
                  <p className="text-gray-300 text-xs mt-1">{template.description}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Background Templates - All 10 */}
          <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6">
            <h3 className="text-xl font-semibold text-white mb-4">Professional Backgrounds (No Gradients)</h3>
            
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
                  <div className="hidden w-full h-full bg-white flex items-center justify-center">
                    <span className="text-gray-800 text-xs font-medium text-center p-1">{bg.name}</span>
                  </div>
                  {selectedBackground.id === bg.id && (
                    <div className="absolute inset-0 bg-purple-500/30 flex items-center justify-center">
                      <CheckCircle className="w-6 h-6 text-white" />
                    </div>
                  )}
                  <div className="absolute bottom-0 left-0 right-0 bg-black/50 text-white text-xs p-1 text-center">
                    {bg.name}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Font & Color */}
          <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6">
            <h3 className="text-xl font-semibold text-white mb-4">Text Customization</h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Text Color
                </label>
                <div className="flex items-center gap-3">
                  <input
                    type="color"
                    value={textColor}
                    onChange={(e) => setTextColor(e.target.value)}
                    className="w-16 h-12 rounded-lg border-2 border-gray-600 bg-transparent cursor-pointer"
                    aria-label="Select text color"
                  />
                  <input
                    type="text"
                    value={textColor}
                    onChange={(e) => setTextColor(e.target.value)}
                    className="flex-1 px-3 py-2 bg-white/10 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:border-purple-500 focus:ring-1 focus:ring-purple-500 text-sm"
                    placeholder="Enter hex color"
                  />
                </div>
              </div>

              <FontSelector
                onFontSelect={(font) => setSelectedFont(font)}
                selectedFont={selectedFont}
              />
            </div>
          </div>

          {/* QR Style */}
          <QRStyleForm
            style={qrStyle}
            onChange={setQrStyle}
          />

          {/* Message Configuration */}
          <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6">
            <h3 className="text-xl font-semibold text-white mb-4">Message Configuration</h3>
            <p className="text-gray-300 text-sm mb-6">Choose how to handle messages for all business cards</p>
            
            <div className="space-y-4">
              {/* Message Source Options */}
              <div className="space-y-3">
                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="radio"
                    name="messageSource"
                    checked={bulkMessages.useExcelMessages}
                    onChange={() => setBulkMessages(prev => ({ 
                      ...prev, 
                      useExcelMessages: true, 
                      useCommonMessages: false 
                    }))}
                    className="w-4 h-4 text-purple-600 bg-white/10 border-gray-600 focus:ring-purple-500"
                  />
                  <div>
                    <span className="text-white font-medium">Use Excel/CSV Messages</span>
                    <p className="text-gray-400 text-sm">Use message1 and message2 columns from your file</p>
                  </div>
                </label>

                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="radio"
                    name="messageSource"
                    checked={bulkMessages.useCommonMessages}
                    onChange={() => setBulkMessages(prev => ({ 
                      ...prev, 
                      useCommonMessages: true, 
                      useExcelMessages: false 
                    }))}
                    className="w-4 h-4 text-purple-600 bg-white/10 border-gray-600 focus:ring-purple-500"
                  />
                  <div>
                    <span className="text-white font-medium">Use Common Messages</span>
                    <p className="text-gray-400 text-sm">Apply the same messages to all business cards</p>
                  </div>
                </label>
              </div>

              {/* Common Message Inputs */}
              {bulkMessages.useCommonMessages && (
                <div className="space-y-3 mt-4 p-4 bg-white/5 rounded-lg border border-purple-500/30">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Primary Message (30 chars max)
                    </label>
                    <input
                      type="text"
                      placeholder="Enter primary message for all cards"
                      value={bulkMessages.commonMessage1}
                      onChange={(e) => setBulkMessages(prev => ({ 
                        ...prev, 
                        commonMessage1: e.target.value 
                      }))}
                      maxLength={30}
                      className="w-full px-3 py-2 bg-white/10 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:border-purple-500 focus:ring-1 focus:ring-purple-500"
                    />
                    <div className="text-xs text-gray-400 mt-1">
                      {bulkMessages.commonMessage1.length}/30 characters
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Secondary Message (30 chars max)
                    </label>
                    <input
                      type="text"
                      placeholder="Enter secondary message (optional)"
                      value={bulkMessages.commonMessage2}
                      onChange={(e) => setBulkMessages(prev => ({ 
                        ...prev, 
                        commonMessage2: e.target.value 
                      }))}
                      maxLength={30}
                      className="w-full px-3 py-2 bg-white/10 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:border-purple-500 focus:ring-1 focus:ring-purple-500"
                    />
                    <div className="text-xs text-gray-400 mt-1">
                      {bulkMessages.commonMessage2.length}/30 characters
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="space-y-6">
          {/* Contact Summary */}
          <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6">
            <h3 className="text-xl font-semibold text-white mb-4">Contact Summary</h3>
            
            <div className="space-y-3">
              <div className="p-3 bg-white/10 rounded-lg">
                <div className="flex items-center justify-between p-3 bg-green-500/20 rounded-lg">
                  <div className="flex items-center gap-2">
                    <CheckCircle className="w-5 h-5 text-green-400" />
                    <span className="text-green-300">Successful</span>
                  </div>
                  <span className="text-white font-medium">{contacts.length}</span>
                </div>
              </div>

              <div className="p-3 bg-white/10 rounded-lg">
                <div className="text-sm text-gray-300 space-y-1">
                  <div><strong>Layout:</strong> {selectedTemplate.name}</div>
                  <div><strong>Background:</strong> {selectedBackground.name}</div>
                  <div><strong>Font:</strong> {selectedFont.name}</div>
                  <div><strong>Text Color:</strong> {textColor}</div>
                </div>
              </div>

              {/* Show first few contacts */}
              <div className="p-3 bg-white/10 rounded-lg">
                <p className="text-white font-medium text-sm mb-2">Sample Contacts:</p>
                <div className="space-y-1 text-xs text-gray-300">
                  {contacts.slice(0, 3).map((contact, index) => (
                    <div key={index}>
                      <strong>{contact.name}</strong>
                      {contact.organization && ` - ${contact.organization}`}
                    </div>
                  ))}
                  {contacts.length > 3 && (
                    <div className="text-purple-300">...and {contacts.length - 3} more</div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="space-y-4">
            <button
              onClick={() => setStep('upload')}
              className="w-full flex items-center justify-center gap-2 py-3 px-4 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to Upload
            </button>

            <button
              onClick={generateBulkCards}
              disabled={contacts.length === 0 || isGenerating}
              className="w-full flex items-center justify-center gap-2 py-3 px-4 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors disabled:opacity-50"
            >
              {isGenerating ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Generating...
                </>
              ) : (
                <>
                  <Scan className="w-4 h-4" />
                  Generate All Cards ({contacts.length})
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  const renderGenerateStep = () => (
    <div className="space-y-8">
      <div className="text-center">
        <h2 className="text-2xl font-bold text-white mb-2">Step 3: Generating Cards</h2>
        <p className="text-gray-300">Please wait while we create your business cards...</p>
      </div>

      <div className="max-w-2xl mx-auto">
        <div className="bg-white/10 backdrop-blur-sm rounded-xl p-8">
          <div className="space-y-6">
            <div className="text-center">
              <Loader2 className="w-16 h-16 text-purple-400 mx-auto animate-spin mb-4" />
              <p className="text-white text-lg">Processing {contacts.length} contacts...</p>
            </div>

            <div className="space-y-2">
              <div className="flex justify-between text-sm text-gray-300">
                <span>Progress</span>
                <span>{progress}%</span>
              </div>
              <div className="w-full bg-gray-700 rounded-full h-2">
                <div 
                  className="bg-purple-600 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${progress}%` }}
                ></div>
              </div>
            </div>

            <div className="text-center text-sm text-gray-400">
              Generating QR codes and template cards...
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const renderResultsStep = () => {
    const successfulResults = results.filter(r => r.success);
    const failedResults = results.filter(r => !r.success);

    return (
      <div className="space-y-8">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-white mb-2">Step 4: Results & Download</h2>
          <p className="text-gray-300">Your business cards are ready!</p>
        </div>

        <div className="grid lg:grid-cols-2 gap-8">
          <div className="space-y-6">
            {/* Summary */}
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6">
              <h3 className="text-xl font-semibold text-white mb-4">Generation Summary</h3>
              
              <div className="space-y-3">
                <div className="flex items-center justify-between p-3 bg-green-500/20 rounded-lg">
                  <div className="flex items-center gap-2">
                    <CheckCircle className="w-5 h-5 text-green-400" />
                    <span className="text-green-300">Successful</span>
                  </div>
                  <span className="text-white font-medium">{successfulResults.length}</span>
                </div>

                {failedResults.length > 0 && (
                  <div className="flex items-center justify-between p-3 bg-red-500/20 rounded-lg">
                    <div className="flex items-center gap-2">
                      <AlertCircle className="w-5 h-5 text-red-400" />
                      <span className="text-red-300">Failed</span>
                    </div>
                    <span className="text-white font-medium">{failedResults.length}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Actions */}
            <div className="space-y-4">
              <button
                onClick={downloadAll}
                disabled={successfulResults.length === 0}
                className="w-full flex items-center justify-center gap-2 py-3 px-4 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors disabled:opacity-50"
              >
                <Download className="w-4 h-4" />
                Download All ({successfulResults.length} files)
              </button>

              <button
                onClick={() => setShowPreview(!showPreview)}
                disabled={successfulResults.length === 0}
                className="w-full flex items-center justify-center gap-2 py-3 px-4 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
              >
                <Eye className="w-4 h-4" />
                {showPreview ? 'Hide' : 'Show'} Preview ({Math.min(5, successfulResults.length)} cards)
              </button>

              <div className="flex gap-3">
                <button
                  onClick={() => setStep('customize')}
                  className="flex-1 flex items-center justify-center gap-2 py-3 px-4 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
                >
                  <Settings className="w-4 h-4" />
                  Edit Design
                </button>

                <button
                  onClick={resetAll}
                  className="flex-1 flex items-center justify-center gap-2 py-3 px-4 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
                >
                  <Upload className="w-4 h-4" />
                  New Upload
                </button>
              </div>
            </div>
          </div>

          <div className="space-y-6">
            {/* Preview Cards */}
            {showPreview && successfulResults.length > 0 && (
              <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6">
                <h3 className="text-xl font-semibold text-white mb-4">Preview Cards</h3>
                
                <div className="grid grid-cols-2 gap-4">
                  {successfulResults.slice(0, 5).map((result, index) => (
                    <div key={index} className="space-y-2">
                      <div className="aspect-[9/16] rounded-lg overflow-hidden bg-black">
                        {result.embeddedCardUrl && (
                          <img
                            src={result.embeddedCardUrl}
                            alt={`Card for ${result.contact.name}`}
                            className="w-full h-full object-cover"
                          />
                        )}
                      </div>
                      <div className="text-center">
                        <p className="text-white text-xs font-medium">{result.contact.name}</p>
                        <div className="flex gap-1 mt-1">
                          <button
                            onClick={() => downloadIndividual(result, 'card')}
                            className="flex-1 text-xs py-1 px-2 bg-purple-600 text-white rounded hover:bg-purple-700 transition-colors"
                          >
                            <Download className="w-3 h-3 inline mr-1" />
                            Card
                          </button>
                          <button
                            onClick={() => downloadIndividual(result, 'vcard')}
                            className="flex-1 text-xs py-1 px-2 bg-green-600 text-white rounded hover:bg-green-700 transition-colors"
                          >
                            <Download className="w-3 h-3 inline mr-1" />
                            vCard
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Failed Results */}
            {failedResults.length > 0 && (
              <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6">
                <h3 className="text-xl font-semibold text-white mb-4">Failed Contacts</h3>
                
                <div className="space-y-2 max-h-64 overflow-y-auto">
                  {failedResults.map((result, index) => (
                    <div key={index} className="p-3 bg-red-500/20 rounded-lg">
                      <div className="flex items-center justify-between">
                        <span className="text-red-300 text-sm font-medium">
                          {result.contact.name || 'Unknown'}
                        </span>
                        <AlertCircle className="w-4 h-4 text-red-400" />
                      </div>
                      <p className="text-red-200 text-xs mt-1">{result.error}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  };

  const steps = ['upload', 'customize', 'generate', 'results'] as const;
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
            Template Bulk Generator
          </h1>
          <p className="text-gray-300">Create professional business cards in bulk with custom templates</p>
          
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
          {step === 'customize' && renderCustomizeStep()}
          {step === 'generate' && renderGenerateStep()}
          {step === 'results' && renderResultsStep()}
        </div>

        <div className="max-w-4xl mx-auto mt-12">
          <div className="bg-gradient-to-r from-blue-500/20 to-purple-500/20 rounded-xl p-6 border border-blue-500/30">
            <h4 className="text-white font-semibold mb-3">Template Bulk Features</h4>
            <ul className="text-sm text-gray-300 space-y-2">
              <li>• Step-by-step process for easy bulk generation</li>
              <li>• All 10 professional background templates included</li>
              <li>• Proper phone screen positioning (top/middle/bottom thirds)</li>
              <li>• Enhanced QR code styling with gradients and border radius</li>
              <li>• International sample data with multilingual support</li>
              <li>• Individual and bulk download options</li>
              <li>• Preview functionality with 5-card display</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TemplateBulkGenerator;