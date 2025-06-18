export interface Contact {
  // Name components
  name: string;
  firstName?: string;
  lastName?: string;
  prefix?: string; // Mr, Mrs, Dr, etc.
  suffix?: string; // Jr, Sr, III, etc.
  
  // Contact information
  email: string;
  phone: string;
  
  // Detailed phone numbers
  mobilePhone?: string;
  workPhone?: string;
  homePhone?: string;
  faxPhone?: string;
  
  // Organization details
  organization: string;
  title: string;
  department?: string;
  
  // Address components
  address: string;
  street?: string;
  city?: string;
  state?: string;
  zipcode?: string;
  country?: string;
  
  // Web presence
  website: string;
  
  // Additional info
  message1?: string;
  message2?: string;
  notes?: string;
}

export interface QRCodeStyle {
  foregroundColor: string;
  backgroundColor: string;
  transparent: boolean;
  gradient: boolean;
  gradientColor: string;
  borderRadius: number;
}

export interface TemplateStyle {
  id: number;
  name: string;
  description: string;
  layout: 'qr-bottom' | 'qr-middle' | 'qr-top' | 'qr-both-bottom' | 'qr-compact' | 'qr-side-by-side' | 
          'qr-center-balanced' | 'qr-top-executive' | 'qr-bottom-corporate' | 'qr-mobile-portrait' | 
          'qr-landscape-pro' | 'qr-minimal-elite';
  preview: string;
}

export interface CardSettings {
  template: TemplateStyle;
  backgroundImage: string;
  backgroundColor?: string;
  font: string;
  textColor: string;
  qrStyle: QRCodeStyle;
  messages: {
    enabled: boolean;
    position: 'top' | 'bottom' | 'both';
    text1: string;
    text2: string;
  };
  layout: {
    qrPosition: 'top' | 'middle' | 'bottom';
    textSpacing: number; // spacing in pixels (5, 10, 15, 20, 25)
    qrSize: number; // QR code size as percentage (20-50)
    layout?: string; // Additional layout identifier for template processor
  };
}

export interface EmbeddedQRSettings {
  contact: Contact;
  qrStyle: QRCodeStyle;
  backgroundImage?: string;
  messages: {
    message1?: string;
    message2?: string;
  };
  layout?: 'qr-bottom' | 'qr-middle' | 'qr-top' | 'qr-both-bottom' | 'qr-compact' | 'qr-side-by-side' |
           'qr-center-balanced' | 'qr-top-executive' | 'qr-bottom-corporate' | 'qr-mobile-portrait' | 
           'qr-landscape-pro' | 'qr-minimal-elite';
  textColor?: string;
  font?: string;
}

export interface ProcessingResult {
  contact: Contact;
  success: boolean;
  error?: string;
  embeddedCardUrl?: string;
  vCardBlob?: Blob;
  filename?: string;
}

export interface BulkGenerationSettings {
  contacts: Contact[];
  qrStyle: QRCodeStyle;
  template?: TemplateStyle;
  backgroundImage?: string;
  textColor?: string;
  font?: string;
}

export interface BackgroundOption {
  id: string;
  name: string;
  url: string | null;
  thumbnail?: string;
}

export interface LayoutOption {
  id: string;
  name: string;
  description: string;
  layout: 'qr-bottom' | 'qr-middle' | 'qr-top' | 'qr-both-bottom' | 'qr-compact' | 'qr-side-by-side' |
          'qr-center-balanced' | 'qr-top-executive' | 'qr-bottom-corporate' | 'qr-mobile-portrait' | 
          'qr-landscape-pro' | 'qr-minimal-elite';
}

export interface GenerationProgress {
  current: number;
  total: number;
  percentage: number;
  currentContact?: string;
  status: 'idle' | 'processing' | 'completed' | 'error';
}

export interface OCRScanResult {
  contact: Contact;
  confidence: number;
  rawText: string;
  extractedFields: {
    [key: string]: {
      value: string;
      confidence: number;
      boundingBox?: {
        x: number;
        y: number;
        width: number;
        height: number;
      };
    };
  };
}

export interface GenerationResult {
  contact: Contact;
  qrCodeUrl: string;
  vCardUrl: string;
  cardImageUrl?: string;
  filename: string;
}

export interface BulkContact extends Contact {
  firstName?: string;
  lastName?: string;
  Firstname?: string;
  Lastname?: string;
  workPhone?: string;
  privatePhone?: string;
  mobilePhone?: string;
  workFax?: string;
  privateFax?: string;
  street?: string;
  zipcode?: string;
  city?: string;
  state?: string;
  country?: string;
  position?: string;
  Position?: string;
  Email?: string;
  Organization?: string;
  Website?: string;
  Street?: string;
  Zipcode?: string;
  City?: string;
  State?: string;
  Country?: string;
  'Phone (Work)'?: string;
  'Phone (Private)'?: string;
  'Phone (Mobile)'?: string;
  'Fax (Work)'?: string;
  'Fax (Private)'?: string;
  [key: string]: string | undefined;
}