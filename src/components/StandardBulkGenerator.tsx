import React, { useState, useCallback, useRef } from 'react';
import { ArrowLeft, Upload, Download, Loader2, FileText, AlertCircle, CheckCircle, Eye, Scan } from 'lucide-react';
import JSZip from 'jszip';
import { saveAs } from 'file-saver';
import { Contact, QRCodeStyle } from '../types';
import { QRStyleForm } from './QRFormUtils';
import { generateQRCode } from '../utils/qrGenerator';
import { createVCardBlob, sanitizeFilename } from '../utils/qrGenerator';
import { parseBulkCSV, validateBulkContacts } from '../utils/bulkProcessor';

interface StandardBulkGeneratorProps {
  onBack: () => void;
}

interface ProcessingResult {
  contact: Contact;
  success: boolean;
  error?: string;
  qrCodeUrl?: string;
  vCardBlob?: Blob;
  filename?: string;
}

const StandardBulkGenerator: React.FC<StandardBulkGeneratorProps> = ({ onBack }) => {
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [qrStyle, setQrStyle] = useState<QRCodeStyle>({
    foregroundColor: '#000000',
    backgroundColor: '#ffffff',
    transparent: false,
    gradient: false,
    gradientColor: '#8b5cf6',
    borderRadius: 0
  });

  const [isUploading, setIsUploading] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [progress, setProgress] = useState(0);
  const [results, setResults] = useState<ProcessingResult[]>([]);
  const [uploadErrors, setUploadErrors] = useState<string[]>([]);
  const [showPreview, setShowPreview] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const downloadSampleCSV = useCallback(() => {
    // Import the professional template function
    import('../utils/bulkProcessor').then(({ downloadProfessionalExcelTemplate }) => {
      downloadProfessionalExcelTemplate();
    });
  }, []);

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

  const handleFileUpload = useCallback(async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Accept both CSV and Excel files
    const acceptedTypes = [
      'text/csv',
      'application/vnd.ms-excel',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    ];

    if (!acceptedTypes.includes(file.type) && !file.name.match(/\.(csv|xls|xlsx)$/i)) {
      setUploadErrors(['Please select a CSV or Excel file (.csv, .xls, .xlsx)']);
      return;
    }

    setIsUploading(true);
    setUploadErrors([]);

    try {
      const parsedContacts = await parseBulkCSV(file);
      const { valid: validContacts, errors: validationErrors } = validateBulkContacts(parsedContacts);

      if (validationErrors.length > 0) {
        setUploadErrors(validationErrors.slice(0, 10)); // Show first 10 errors
      }

      if (validContacts.length === 0) {
        setUploadErrors(prev => [...prev, 'No valid contacts found in the file']);
        return;
      }

      setContacts(validContacts);
      setShowPreview(false); // Reset preview when new file is uploaded
      
      if (validationErrors.length === 0) {
        setUploadErrors([]);
      }
    } catch (error) {
      console.error('Parsing error:', error);
      setUploadErrors([error instanceof Error ? error.message : 'Failed to parse the CSV file']);
    } finally {
      setIsUploading(false);
    }
  }, []);

  const generateBulkQRCards = useCallback(async () => {
    if (contacts.length === 0) return;

    setIsGenerating(true);
    setProgress(0);
    setResults([]);

    const processingResults: ProcessingResult[] = [];

    for (let i = 0; i < contacts.length; i++) {
      const contact = contacts[i];
      
      try {
        // Update progress
        setProgress(Math.round(((i + 1) / contacts.length) * 100));

        // Generate vCard data
        const vCardData = generateVCard(contact);
        
        // Generate high-quality QR code with quiet zone for better scanning
        const qrCodeUrl = await generateQRCode(vCardData, qrStyle, 512, true);
        
        // Create vCard blob
        const vCardBlob = createVCardBlob(vCardData);
        const filename = sanitizeFilename(contact.name);

        processingResults.push({
          contact,
          success: true,
          qrCodeUrl,
          vCardBlob,
          filename
        });

      } catch (err) {
        console.error(`Failed to generate QR code for ${contact.name}:`, err);
        processingResults.push({
          contact,
          success: false,
          error: err instanceof Error ? err.message : 'Unknown error'
        });
      }
    }

    setResults(processingResults);
    setIsGenerating(false);
    setShowPreview(true);
  }, [contacts, qrStyle]);

  const downloadResults = useCallback(async () => {
    if (results.length === 0) return;

    const zip = new JSZip();
    const successfulResults = results.filter(result => result.success);

    // Create folders
    const qrCodesFolder = zip.folder('QR_Codes');
    const vCardsFolder = zip.folder('vCards');

    if (!qrCodesFolder || !vCardsFolder) {
      console.error('Failed to create ZIP folders');
      return;
    }

    // Add QR codes and vCards to ZIP
    for (const result of successfulResults) {
      if (result.qrCodeUrl && result.vCardBlob && result.filename) {
        try {
          // Convert QR code data URL to blob
          const qrResponse = await fetch(result.qrCodeUrl);
          const qrBlob = await qrResponse.blob();
          
          // Add files to ZIP
          qrCodesFolder.file(`${result.filename}_QR.png`, qrBlob);
          vCardsFolder.file(`${result.filename}.vcf`, result.vCardBlob);
        } catch (error) {
          console.error(`Failed to add ${result.filename} to ZIP:`, error);
        }
      }
    }

    // Generate and download ZIP
    try {
      const zipBlob = await zip.generateAsync({ type: 'blob' });
      saveAs(zipBlob, `Standard_QR_Bulk_${new Date().toISOString().split('T')[0]}.zip`);
    } catch (error) {
      console.error('Failed to generate ZIP file:', error);
    }
  }, [results]);

  const downloadIndividual = useCallback(async (result: ProcessingResult, type: 'qr' | 'vcard') => {
    if (!result.success || !result.filename) return;

    try {
      if (type === 'qr' && result.qrCodeUrl) {
        const response = await fetch(result.qrCodeUrl);
        const blob = await response.blob();
        saveAs(blob, `${result.filename}_QR.png`);
      } else if (type === 'vcard' && result.vCardBlob) {
        saveAs(result.vCardBlob, `${result.filename}.vcf`);
      }
    } catch (error) {
      console.error(`Failed to download ${type} for ${result.filename}:`, error);
    }
  }, []);

  const resetAll = () => {
    setContacts([]);
    setResults([]);
    setUploadErrors([]);
    setProgress(0);
    setShowPreview(false);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const successfulResults = results.filter(r => r.success);
  const failedResults = results.filter(r => !r.success);
  const previewResults = showPreview ? successfulResults.slice(0, 5) : [];

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
            Standard Bulk Generator
          </h1>
          <p className="text-gray-300">Generate QR codes and vCards for multiple contacts with Excel/CSV support</p>
        </div>

        <div className="max-w-6xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-8">
            {/* Left Column - Configuration */}
            <div className="space-y-6">
              {/* File Upload Section */}
              <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6">
                <h3 className="text-xl font-semibold text-white mb-6">Upload Contacts</h3>
                
                {/* Sample Download */}
                <div className="mb-6">
                  <div className="flex items-center justify-between mb-3">
                    <label className="text-sm font-medium text-gray-300">
                      Sample Data Template
                    </label>
                    <button
                      onClick={downloadSampleCSV}
                      className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm"
                    >
                      <Download className="w-4 h-4" />
                      Download Professional Template
                    </button>
                  </div>
                  <div className="text-xs text-gray-400 bg-blue-500/20 rounded-lg p-3">
                    <p className="mb-2"><strong>Professional Template includes:</strong></p>
                    <p>• Complete name fields (Prefix, First Name, Last Name, Suffix)</p>
                    <p>• Multiple phone types (Mobile, Work, Home, Fax)</p>
                    <p>• Full address components (Street, City, State, Zip, Country)</p>
                    <p>• Organization details (Company, Department, Job Title)</p>
                    <p>• Custom messages and notes</p>
                    <p className="mt-2 text-green-300"><strong>✓ Sample data + 20 empty rows ready to fill</strong></p>
                  </div>
                </div>

                {/* File Input */}
                <div className="space-y-4">
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept=".csv,.xls,.xlsx"
                    onChange={handleFileUpload}
                    className="hidden"
                    aria-label="Upload CSV or Excel file with contacts"
                  />
                  
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    disabled={isUploading}
                    className="w-full flex items-center justify-center gap-3 py-4 px-6 bg-purple-600 text-white rounded-xl hover:bg-purple-700 transition-colors disabled:opacity-50"
                  >
                    {isUploading ? (
                      <>
                        <Loader2 className="w-5 h-5 animate-spin" />
                        Processing File...
                      </>
                    ) : (
                      <>
                        <Upload className="w-5 h-5" />
                        Upload CSV/Excel File
                      </>
                    )}
                  </button>

                  {contacts.length > 0 && (
                    <div className="flex items-center gap-2 text-green-400 text-sm">
                      <CheckCircle className="w-4 h-4" />
                      {contacts.length} contacts loaded successfully
                    </div>
                  )}

                  {uploadErrors.length > 0 && (
                    <div className="space-y-2">
                      {uploadErrors.map((error, index) => (
                        <div key={index} className="flex items-start gap-2 text-red-300 text-sm">
                          <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
                          {error}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* QR Code Styling */}
              <QRStyleForm
                style={qrStyle}
                onChange={setQrStyle}
              />

              {/* Action Buttons */}
              <div className="space-y-4">
                <button
                  onClick={generateBulkQRCards}
                  disabled={contacts.length === 0 || isGenerating}
                  className="w-full bg-gradient-to-r from-purple-600 to-pink-600 text-white py-4 px-6 rounded-xl font-semibold hover:from-purple-700 hover:to-pink-700 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {isGenerating ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      Generating... ({progress}%)
                    </>
                  ) : (
                    <>
                      <Scan className="w-5 h-5" />
                      Generate All QR Codes ({contacts.length})
                    </>
                  )}
                </button>

                {results.length > 0 && (
                  <div className="flex gap-3">
                    <button
                      onClick={() => setShowPreview(!showPreview)}
                      className="flex-1 flex items-center justify-center gap-2 py-3 px-4 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                    >
                      <Eye className="w-4 h-4" />
                      {showPreview ? 'Hide' : 'Show'} Preview
                    </button>
                    
                    <button
                      onClick={downloadResults}
                      disabled={successfulResults.length === 0}
                      className="flex-1 flex items-center justify-center gap-2 py-3 px-4 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50"
                    >
                      <Download className="w-4 h-4" />
                      Download All ({successfulResults.length})
                    </button>
                  </div>
                )}

                {contacts.length > 0 && (
                  <button
                    onClick={resetAll}
                    className="w-full py-2 px-4 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
                  >
                    Reset All
                  </button>
                )}
              </div>
            </div>

            {/* Right Column - Preview & Results */}
            <div className="space-y-6">
              {/* Results Summary */}
              {results.length > 0 && (
                <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6">
                  <h3 className="text-xl font-semibold text-white mb-4">Generation Results</h3>
                  
                  <div className="grid grid-cols-2 gap-4 mb-4">
                    <div className="text-center p-3 bg-green-500/20 rounded-lg">
                      <div className="text-2xl font-bold text-green-400">{successfulResults.length}</div>
                      <div className="text-sm text-gray-300">Successful</div>
                    </div>
                    <div className="text-center p-3 bg-red-500/20 rounded-lg">
                      <div className="text-2xl font-bold text-red-400">{failedResults.length}</div>
                      <div className="text-sm text-gray-300">Failed</div>
                    </div>
                  </div>

                  {failedResults.length > 0 && (
                    <div className="text-red-300 text-sm">
                      <p className="font-semibold mb-2">Failed contacts:</p>
                      <ul className="space-y-1">
                        {failedResults.slice(0, 3).map((result, index) => (
                          <li key={index} className="text-xs">
                            • {result.contact.name}: {result.error}
                          </li>
                        ))}
                        {failedResults.length > 3 && (
                          <li className="text-xs">... and {failedResults.length - 3} more</li>
                        )}
                      </ul>
                    </div>
                  )}
                </div>
              )}

              {/* Preview Section */}
              {showPreview && previewResults.length > 0 && (
                <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6">
                  <h3 className="text-xl font-semibold text-white mb-6">Preview (First 5 Results)</h3>
                  
                  <div className="space-y-4 max-h-96 overflow-y-auto">
                    {previewResults.map((result, index) => (
                      <div key={index} className="bg-white/10 rounded-lg p-4">
                        <div className="flex items-start gap-4">
                          {/* QR Code */}
                          <div className="flex-shrink-0">
                            {result.qrCodeUrl && (
                              <img
                                src={result.qrCodeUrl}
                                alt={`QR Code for ${result.contact.name}`}
                                className="w-20 h-20 bg-white rounded-lg p-1"
                              />
                            )}
                          </div>
                          
                          {/* Contact Info */}
                          <div className="flex-1 min-w-0">
                            <h4 className="font-semibold text-white text-sm mb-2">{result.contact.name}</h4>
                            <div className="text-xs text-gray-300 space-y-1">
                              {result.contact.organization && (
                                <div className="truncate">{result.contact.organization}</div>
                              )}
                              {result.contact.title && (
                                <div className="truncate">{result.contact.title}</div>
                              )}
                              {result.contact.email && (
                                <div className="truncate">{result.contact.email}</div>
                              )}
                              {result.contact.phone && (
                                <div>{result.contact.phone}</div>
                              )}
                            </div>
                          </div>

                          {/* Download Buttons */}
                          <div className="flex flex-col gap-1">
                            <button
                              onClick={() => downloadIndividual(result, 'qr')}
                              className="p-1 bg-purple-600 text-white rounded hover:bg-purple-700 transition-colors"
                              title="Download QR Code"
                            >
                              <Download className="w-3 h-3" />
                            </button>
                            <button
                              onClick={() => downloadIndividual(result, 'vcard')}
                              className="p-1 bg-green-600 text-white rounded hover:bg-green-700 transition-colors"
                              title="Download vCard"
                            >
                              <FileText className="w-3 h-3" />
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>

                  {successfulResults.length > 5 && (
                    <div className="mt-4 text-center text-gray-400 text-sm">
                      Showing 5 of {successfulResults.length} successful results
                    </div>
                  )}
                </div>
              )}

              {/* Instructions */}
              {contacts.length === 0 && (
                <div className="bg-gradient-to-r from-blue-500/20 to-purple-500/20 rounded-xl p-6 border border-blue-500/30">
                  <h4 className="text-white font-semibold mb-3">How to Use</h4>
                  <ol className="text-sm text-gray-300 space-y-2">
                    <li>1. Download the sample CSV template</li>
                    <li>2. Fill in your contact details (name + at least one contact method required)</li>
                    <li>3. Upload your CSV/Excel file</li>
                    <li>4. Customize QR code styling if needed</li>
                    <li>5. Generate QR codes and vCards for all contacts</li>
                    <li>6. Preview results and download individually or as ZIP</li>
                  </ol>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
  };

export default StandardBulkGenerator;