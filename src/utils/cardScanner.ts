import { createWorker, PSM } from 'tesseract.js';
import { Contact } from '../types';

// Enhanced interfaces for better data handling
interface ExtractedData {
  emails: string[];
  phones: string[];
  websites: string[];
  cleanLines: string[];
  rawText: string;
  confidence: number;
}

interface ColorInfo {
  hex: string;
  rgb: string;
  frequency: number;
}

interface EnhancedContact extends Contact {
  confidence?: number;
  logoColors?: ColorInfo[];
  extractedPhones?: string[];
  extractedEmails?: string[];
}

// Enhanced field detection patterns for complex business cards
const FIELD_PATTERNS = {
  email: [
    /([a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,})/gi,
    /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/gi,
    // Pattern for emails with 'E' prefix (E ashwin@arco.ae)
    /E\s+([a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,})/gi
  ],
  phone: [
    // UAE mobile formats with +971 50, 55, 56, etc.
    /\+?971[-.\s]?[5][0-9][-.\s]?\d{3}[-.\s]?\d{4}/g,
    // UAE landline formats with +971 2, 3, 4, 6, 7, 9
    /\+?971[-.\s]?[2-4679][-.\s]?\d{3}[-.\s]?\d{4}/g,
    // Phone with T prefix (T +971 2 4450707)
    /T\s+\+?971[-.\s]?\d{1,2}[-.\s]?\d{3,4}[-.\s]?\d{4}/g,
    // Fax with F prefix (F +971 2 4455052)
    /F\s+\+?971[-.\s]?\d{1,2}[-.\s]?\d{3,4}[-.\s]?\d{4}/g,
    // General UAE patterns
    /(\+?971[-.\s]?)?\(?([0-9]{1,2})\)?[-.\s]?([0-9]{3,4})[-.\s]?([0-9]{4})/g,
    // International formats
    /(\+\d{1,3}[-.\s]?)?\(?([0-9]{2,4})\)?[-.\s]?([0-9]{3,4})[-.\s]?([0-9]{3,4})/g,
    // General patterns
    /\b\d{3}[-.\s]?\d{3}[-.\s]?\d{4}\b/g,
    /\b\(\d{3}\)[-.\s]?\d{3}[-.\s]?\d{4}\b/g
  ],
  website: [
    /(https?:\/\/)?(www\.)?[-a-zA-Z0-9@:%._+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_+.~#?&//=]*)/gi,
    /\b(?:www\.)?[a-zA-Z0-9-]+\.(com|org|net|edu|gov|ae|co\.ae|io|tech|biz|info|co\.uk|co|me|tv|cc)\b/gi
  ],
  // Enhanced name patterns for complex layouts
  name: [
    /^[A-Z][a-z]+\s+[A-Z][a-z]+(\s+[A-Z][a-z]+)*$/m,
    /\b[A-Z][a-z]+\s+[A-Z][a-z]+\b/g,
    /^[\u0600-\u06FF\s]+$/m, // Arabic names
    // Pattern for names that might be on separate lines
    /^[A-Z][a-z]{2,}$/m, // Single name parts
    /^[A-Z][a-z]+\s+[A-Z]\.\s+[A-Z][a-z]+$/m // Name with middle initial
  ],
  // Enhanced title patterns
  title: [
    /\b(CEO|CTO|CFO|Manager|Director|Engineer|Developer|Designer|Analyst|Consultant|Specialist|Coordinator|Assistant|Executive|President|Vice President|Senior|Junior|Lead|Principal|Chief)\b/gi,
    /\b(Business Development|Project Manager|Sales Manager|Marketing Manager|General Manager|Operations Manager|Technical Manager|Regional Manager|Estimation Engineer)\b/gi,
    // Specific patterns for complex titles
    /Business\s+Development\s+Manager/gi,
    /Estimation\s+Engineer[-\s]?Mechanical/gi,
    /\b(Mechanical|Electrical|Civil|Chemical|Software|Hardware)\s+(Engineer|Manager|Director)\b/gi,
    // Complex engineering titles
    /Estimation\s+Engineer[-\s]+(Mechanical|Electrical|Civil|Chemical)/gi,
    /\b(Senior|Junior|Lead|Principal)\s+(Engineer|Manager|Developer|Analyst)/gi
  ],
  // Enhanced company patterns
  company: [
    /\b(LLC|Inc|Corp|Ltd|Company|Group|Solutions|Services|Technologies|Systems|Consulting|International|Global|Holdings|Partners|Associates|Enterprises|Industries|Trading|Electromechanical)\b/gi,
    // Specific company names and patterns
    /\b(ARCO|Sicuro|ADNOC|Emirates|Etisalat|Du|Mashreq|FAB|ENOC|DEWA|SEWA|FEWA)\b/gi,
    // Company type indicators
    /\b(electromechanical|contracting|establishment|est\.?|fze|fzco|fzllc|mechanical|electrical|engineering)\b/gi,
    // Combined company name patterns (like "ARCO electromechanical")
    /\b[A-Z]{2,}\s+(electromechanical|mechanical|electrical|engineering|systems|solutions|services|trading|contracting)\b/gi
  ],
  // Address patterns with comprehensive country detection
  address: [
    /A\s+P\.O\.?\s*Box[:\s]*\d+[,\s]*[A-Za-z\s,]+/gi,
    /P\.O\.?\s*Box[:\s]*\d+/gi,
    // Comprehensive country patterns
    /\b(UAE|United Arab Emirates|Saudi Arabia|KSA|Oman|India|Pakistan|Qatar|Bangladesh|Philippines|UK|United Kingdom|Canada|Australia|Japan|Korea|China|USA|United States|Sweden|Iran|Sudan)\b/gi,
    // City patterns with countries
    /\b(Abu Dhabi|Dubai|Sharjah|Ajman|Riyadh|Jeddah|Muscat|Mumbai|Delhi|Karachi|Lahore|Doha|Dhaka|Manila|London|Toronto|Sydney|Tokyo|Seoul|Beijing|New York|Stockholm|Tehran|Khartoum)\b/gi,
    // Postal code patterns
    /\b\d{5,6}\b/gi,
    // General address patterns
    /\b[A-Z][a-z]+(?:\s+[A-Z][a-z]+)*,?\s*[A-Z]{2,4}\b/gi
  ]
};

// OCR text cleaning function to fix common errors and filter non-English text
const cleanOCRText = (text: string): string => {
  // Apply corrections line by line to preserve structure
  const lines = text.split('\n');
  const cleanedLines = lines.map(line => {
    let cleanLine = line.trim();
    
    // Skip lines that look like phone numbers or emails - don't modify them
    if (/[@+]/.test(cleanLine) || /^\+?\d/.test(cleanLine) || /^[TFE]\s+/.test(cleanLine)) {
      return cleanLine;
    }
    
    // Filter out Arabic text and non-English characters (except for contact info)
    // Keep only English letters, numbers, spaces, and common punctuation
    const englishOnly = cleanLine.replace(/[^\w\s@+.-]/g, '').trim();
    if (englishOnly.length < cleanLine.length * 0.5 && !/@|\+|\d{3,}/.test(cleanLine)) {
      console.log(`Removing non-English line: "${cleanLine}"`);
      return '';
    }
    cleanLine = englishOnly;
    
    // Fix specific known OCR errors for company names
    if (cleanLine === 'SICUIO)' || cleanLine === 'SICURO)' || cleanLine === 'sicuro)') {
      cleanLine = 'Sicuro';
      console.log(`OCR correction: "${line}" -> "Sicuro"`);
    }
    
    // Remove obvious garbage lines (very short, mostly special characters, or gibberish)
    if (cleanLine.length <= 2 || /^[^a-zA-Z]*$/.test(cleanLine)) {
      console.log(`Removing garbage line: "${cleanLine}"`);
      return '';
    }
    
    // Remove lines that look like OCR garbage (random letters)
    if (/^[A-Z]{1,3}\s+[A-Z][a-z]{1,3}$/.test(cleanLine) && !/(Mr|Ms|Dr)/.test(cleanLine)) {
      console.log(`Removing potential OCR garbage: "${cleanLine}"`);
      return '';
    }
    
    // Fix obvious character substitutions in names/companies only
    if (/^[A-Z]/.test(cleanLine) && cleanLine.length <= 20) {
      // Only apply to lines that look like names/companies
      cleanLine = cleanLine.replace(/0/g, 'O').replace(/1/g, 'I');
    }
    
    return cleanLine;
  }).filter(line => line.length > 0); // Remove empty lines
  
  return cleanedLines.join('\n');
};

// Enhanced OCR with English-only support and advanced preprocessing
export const scanBusinessCard = async (imageFile: File): Promise<Contact> => {
  let processedImage = imageFile;
  
  try {
    // Step 1: Advanced image preprocessing
    processedImage = await enhanceImageForOCR(imageFile);
    
    // Step 2: Extract logo colors for QR styling
    const logoColors = await extractLogoColors(processedImage);
    
    // Step 3: English-only OCR with optimized parameters
    const worker = await createWorker('eng', 1, {
      logger: m => console.log('OCR Progress:', m)
    });
    
    // Set parameters during initialization to avoid the error
    await worker.setParameters({
      // English-only character whitelist with business card symbols
      tessedit_char_whitelist: 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789@.+-()[]{}/:;,!?&%# \n\r\t',
      tessedit_pageseg_mode: PSM.AUTO_OSD,
      preserve_interword_spaces: '1',
      // Advanced OCR parameters for better accuracy
      classify_enable_learning: '0',
      classify_enable_adaptive_matcher: '1',
      textord_noise_area_ratio: '0.7',
      textord_heavy_nr: '1',
      language_model_penalty_non_freq_dict_word: '0.1',
      language_model_penalty_non_dict_word: '0.15',
      // Improve text detection
      textord_min_xheight: '10',
      textord_really_old_xheight: '1'
    });
    
    const { data: { text, confidence } } = await worker.recognize(processedImage);
    await worker.terminate();
    
    // Debug logging - show raw OCR results
    console.log('=== RAW OCR RESULTS ===');
    console.log('Raw text:', text);
    console.log('OCR confidence:', confidence);
    console.log('Text lines:', text.split('\n').map(line => line.trim()).filter(line => line.length > 0));
    console.log('========================');
    
    // Clean OCR text to fix common errors
    const cleanedText = cleanOCRText(text);
    console.log('=== CLEANED OCR TEXT ===');
    console.log('Cleaned text:', cleanedText);
    console.log('===========================');
    
    // Step 4: Advanced text parsing with confidence scoring using cleaned text
    const extractedData = extractAdvancedFields(cleanedText, confidence);
    const contact = buildEnhancedContact(extractedData, logoColors);
    
    // Debug logging - show extracted data
    console.log('=== EXTRACTED DATA ===');
    console.log('Emails:', extractedData.emails);
    console.log('Phones:', extractedData.phones);
    console.log('Websites:', extractedData.websites);
    console.log('Clean lines for name/org/title:', extractedData.cleanLines);
    console.log('Final contact:', contact);
    console.log('======================');
    
    return contact;
    
  } catch (error) {
    console.error('Enhanced OCR processing failed:', error);
    
    // Fallback to basic OCR if advanced processing fails
    try {
      return await basicOCRFallback(processedImage);
    } catch (fallbackError) {
      console.error('Fallback OCR also failed:', fallbackError);
      throw new Error('Failed to scan business card with English-only OCR');
    }
  }
};

// Advanced image enhancement for optimal OCR
const enhanceImageForOCR = async (file: File): Promise<File> => {
  return new Promise((resolve, reject) => {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    if (!ctx) {
      reject(new Error('Canvas not supported'));
      return;
    }

    const img = new Image();
    img.onload = () => {
      try {
        // Calculate optimal size (maintain aspect ratio, max 2000px for performance)
        const maxSize = 2000;
        let { width, height } = img;
        
        if (width > maxSize || height > maxSize) {
          const ratio = Math.min(maxSize / width, maxSize / height);
          width = Math.floor(width * ratio);
          height = Math.floor(height * ratio);
        }

        canvas.width = width;
        canvas.height = height;

        // Initial draw
        ctx.drawImage(img, 0, 0, width, height);
        
        const imageData = ctx.getImageData(0, 0, width, height);
        const data = imageData.data;

        // Multi-step enhancement process
        for (let i = 0; i < data.length; i += 4) {
          const r = data[i];
          const g = data[i + 1];
          const b = data[i + 2];

          // Step 1: Convert to grayscale with weighted average for better text detection
          const gray = 0.299 * r + 0.587 * g + 0.114 * b;
          
          // Step 2: Apply gamma correction for better contrast
          const gamma = 1.2;
          const corrected = 255 * Math.pow(gray / 255, 1 / gamma);
          
          // Step 3: Enhanced contrast with sigmoid function
          const contrast = 1.8;
          const enhanced = 255 / (1 + Math.exp(-contrast * (corrected - 128) / 128));
          
          // Step 4: Adaptive sharpening
          const sharpened = Math.min(255, Math.max(0, enhanced + (enhanced - gray) * 0.3));
          
          // Step 5: Final thresholding with noise reduction
          const threshold = 140;
          let final = sharpened;
          
          if (sharpened > threshold) {
            final = Math.min(255, sharpened * 1.1); // Brighten text
          } else {
            final = Math.max(0, sharpened * 0.7); // Darken background
          }

          data[i] = final;     // Red
          data[i + 1] = final; // Green  
          data[i + 2] = final; // Blue
          // Alpha remains unchanged
        }

        ctx.putImageData(imageData, 0, 0);

        // Convert to high-quality blob
        canvas.toBlob((blob) => {
          if (blob) {
            resolve(new File([blob], file.name, { type: file.type }));
          } else {
            reject(new Error('Failed to enhance image'));
          }
        }, file.type, 0.98);
      } catch (error) {
        reject(error);
      }
    };

    img.onerror = () => reject(new Error('Failed to load image'));
    img.src = URL.createObjectURL(file);
  });
};

// Extract logo colors for QR code styling
const extractLogoColors = async (imageFile: File): Promise<ColorInfo[]> => {
  return new Promise((resolve) => {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    if (!ctx) {
      resolve([]);
      return;
    }

    const img = new Image();
    img.onload = () => {
      try {
        canvas.width = img.width;
        canvas.height = img.height;
        ctx.drawImage(img, 0, 0);

        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const colors = extractDominantColors(imageData);
        
        resolve(colors);
      } catch (error) {
        console.error('Color extraction failed:', error);
        resolve([]);
      }
    };

    img.onerror = () => resolve([]);
    img.src = URL.createObjectURL(imageFile);
  });
};

// Advanced color extraction with intelligent clustering
const extractDominantColors = (imageData: ImageData): ColorInfo[] => {
  const data = imageData.data;
  const colorMap = new Map<string, number>();
  const totalPixels = data.length / 4;

  // Intelligent sampling - focus on top areas where logos typically appear
  const centerX = imageData.width / 2;
  const centerY = imageData.height / 4; // Focus on top quarter where logos usually are
  const sampleRadius = Math.min(imageData.width, imageData.height) / 2;

  for (let y = 0; y < imageData.height; y += 4) {
    for (let x = 0; x < imageData.width; x += 4) {
      const i = (y * imageData.width + x) * 4;
      const r = data[i];
      const g = data[i + 1];
      const b = data[i + 2];
      const a = data[i + 3];

      // Skip transparent, very light, or very dark pixels
      if (a < 128 || (r + g + b) < 100 || (r + g + b) > 600) continue;

      // Weight colors closer to center more heavily
      const distanceFromCenter = Math.sqrt(Math.pow(x - centerX, 2) + Math.pow(y - centerY, 2));
      const weight = distanceFromCenter < sampleRadius ? 2 : 1;

      // Quantize colors to reduce noise
      const qR = Math.round(r / 24) * 24;
      const qG = Math.round(g / 24) * 24;
      const qB = Math.round(b / 24) * 24;
      
      const key = `${qR},${qG},${qB}`;
      colorMap.set(key, (colorMap.get(key) || 0) + weight);
    }
  }

  // Get top colors and convert to ColorInfo
  const sortedColors = Array.from(colorMap.entries())
    .sort(([,a], [,b]) => b - a)
    .slice(0, 5)
    .map(([color, frequency]) => {
      const [r, g, b] = color.split(',').map(Number);
      const hex = `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`;
      const rgb = `rgb(${r}, ${g}, ${b})`;
      
      return {
        hex,
        rgb,
        frequency: frequency / totalPixels
      };
    });

  return sortedColors;
};

// Enhanced field extraction for complex business card layouts
const extractAdvancedFields = (text: string, ocrConfidence: number): ExtractedData => {
  const lines = text.split('\n')
    .map(line => line.trim())
    .filter(line => line.length > 0);
  
  console.log('Processing lines:', lines);
  
  // Extract structured data with enhanced patterns
  const emails = extractEmailsAdvanced(text);
  const phones = extractPhonesAdvanced(text);
  const websites = extractFieldWithPatterns(text, FIELD_PATTERNS.website, validateWebsite);
  
  console.log('Extracted emails:', emails);
  console.log('Extracted phones:', phones);
  console.log('Extracted websites:', websites);
  
  // Create clean lines without extracted contact information
  const cleanLines = lines.filter(line => {
    const lowerLine = line.toLowerCase();
    
    // Check if line contains email
    const hasEmail = emails.some(email => lowerLine.includes(email.toLowerCase()));
    
    // Check if line contains phone number (more robust checking)
    const hasPhone = phones.some(phone => {
      const phoneDigits = phone.replace(/\D/g, '');
      const lineDigits = line.replace(/\D/g, '');
      // Check if line contains significant portion of phone number
      return phoneDigits.length >= 7 && lineDigits.includes(phoneDigits.slice(-7));
    });
    
    // Check if line contains website
    const hasWebsite = websites.some(website => 
      lowerLine.includes(website.toLowerCase().replace(/https?:\/\//, ''))
    );
    
    // Check if line is clearly a contact detail (starts with T, F, E, A)
    const isContactDetail = /^[TFEA]\s+/.test(line);
    
    // Check if line contains @ symbol (email indicator)
    const hasAtSymbol = line.includes('@');
    
    // Check if line has phone-like patterns
    const hasPhonePattern = /\+?[\d\s\-()]{7,}/.test(line);
    
    console.log(`Line: "${line}" - hasEmail: ${hasEmail}, hasPhone: ${hasPhone}, hasWebsite: ${hasWebsite}, isContactDetail: ${isContactDetail}, hasAtSymbol: ${hasAtSymbol}, hasPhonePattern: ${hasPhonePattern}`);
    
    return !hasEmail && !hasPhone && !hasWebsite && !isContactDetail && !hasAtSymbol && !hasPhonePattern;
  });

  console.log('Clean lines for name extraction:', cleanLines);

  return {
    emails: emails.slice(0, 3), // Max 3 emails
    phones: phones.slice(0, 5), // Max 5 phones
    websites: websites.slice(0, 2), // Max 2 websites
    cleanLines,
    rawText: text,
    confidence: ocrConfidence
  };
};

// Enhanced email extraction with prefix handling and OCR error correction
const extractEmailsAdvanced = (text: string): string[] => {
  const emails = new Set<string>();
  
  // Split text into lines for better email detection
  const lines = text.split('\n').map(line => line.trim());
  
  FIELD_PATTERNS.email.forEach(pattern => {
    const matches = text.match(pattern) || [];
    matches.forEach(match => {
      // Handle 'E email@domain.com' format
      if (match.startsWith('E ')) {
        const emailPart = match.substring(2).trim();
        if (validateEmail(emailPart)) {
          emails.add(emailPart.toLowerCase());
          console.log(`Found email with E prefix: ${emailPart}`);
        }
      } else if (validateEmail(match)) {
        emails.add(match.toLowerCase());
        console.log(`Found email: ${match}`);
      }
    });
  });
  
  // Enhanced line-by-line email detection for OCR errors and spaces
  lines.forEach(line => {
    // Look for emails that might be split or have spaces (like "Johnny@sicurouae ae")
    const emailPattern1 = /([a-zA-Z0-9._%+-]+)\s*@\s*([a-zA-Z0-9.-]+\s+[a-zA-Z]{2,})/g;
    const emailPattern2 = /([a-zA-Z0-9._%+-]+)\s*@\s*([a-zA-Z0-9.-]+\.[a-zA-Z]{2,})/g;
    
    // Pattern 1: Handle emails with spaces in domain (Johnny@sicurouae ae)
    let match;
    while ((match = emailPattern1.exec(line)) !== null) {
      const domain = match[2].replace(/\s+/g, ''); // Remove spaces from domain
      const email = match[1] + '@' + domain;
      if (validateEmail(email)) {
        emails.add(email.toLowerCase());
        console.log(`Found email with space correction: ${email} (from "${line}")`);
      }
    }
    
    // Pattern 2: Standard email detection
    while ((match = emailPattern2.exec(line)) !== null) {
      const email = match[1] + '@' + match[2];
      if (validateEmail(email)) {
        emails.add(email.toLowerCase());
        console.log(`Found email in line: ${email}`);
      }
    }
    
    // Pattern 3: Look for potential email patterns with common OCR errors
    // Handle cases like "johnny@sicurouae ae" -> "johnny@sicurouae.ae"
    const ocrEmailPattern = /([a-zA-Z0-9._%+-]+)@([a-zA-Z0-9]+)\s+([a-zA-Z]{2,3})\b/g;
    while ((match = ocrEmailPattern.exec(line)) !== null) {
      const correctedEmail = `${match[1]}@${match[2]}.${match[3]}`;
      if (validateEmail(correctedEmail)) {
        emails.add(correctedEmail.toLowerCase());
        console.log(`Found email with OCR correction: ${correctedEmail} (from "${line}")`);
      }
    }
  });
  
  console.log('All extracted emails:', Array.from(emails));
  return Array.from(emails);
};

// Enhanced phone extraction with T/F prefix handling
const extractPhonesAdvanced = (text: string): string[] => {
  const phones = new Set<string>();
  const phoneMap = new Map<string, string>(); // To track phone types
  
  FIELD_PATTERNS.phone.forEach(pattern => {
    const matches = text.match(pattern) || [];
    matches.forEach(match => {
      let cleanPhone = match.trim();
      let phoneType = 'phone';
      
      // Handle T/F prefixes
      if (match.startsWith('T ')) {
        phoneType = 'tel';
        cleanPhone = match.substring(2).trim();
      } else if (match.startsWith('F ')) {
        phoneType = 'fax';
        cleanPhone = match.substring(2).trim();
      }
      
      // Clean and validate phone
      const normalizedPhone = normalizePhoneNumber(cleanPhone);
      if (validatePhone(normalizedPhone)) {
        // Add type prefix for display
        const displayPhone = phoneType === 'fax' ? `F ${normalizedPhone}` : 
                           phoneType === 'tel' ? `T ${normalizedPhone}` : normalizedPhone;
        phones.add(displayPhone);
        phoneMap.set(normalizedPhone, phoneType);
      }
    });
  });
  
  return Array.from(phones);
};

// Normalize phone numbers for consistent formatting
const normalizePhoneNumber = (phone: string): string => {
  // Remove all non-digit characters except +
  let cleaned = phone.replace(/[^\d+]/g, '');
  
  // Add +971 if it's a UAE number without country code
  if (cleaned.length === 9 && (cleaned.startsWith('5') || cleaned.startsWith('2') || cleaned.startsWith('3') || cleaned.startsWith('4') || cleaned.startsWith('6') || cleaned.startsWith('7') || cleaned.startsWith('9'))) {
    cleaned = '+971' + cleaned;
  }
  
  // Format UAE numbers consistently
  if (cleaned.startsWith('+971') || cleaned.startsWith('971')) {
    const number = cleaned.replace(/^\+?971/, '');
    return `+971 ${number.substring(0, 1)} ${number.substring(1, 4)} ${number.substring(4)}`;
  }
  
  return cleaned;
};

// Generic field extraction with pattern matching and validation
const extractFieldWithPatterns = (text: string, patterns: RegExp[], validator: (value: string) => boolean): string[] => {
  const results = new Set<string>();
  
  patterns.forEach(pattern => {
    const matches = text.match(pattern) || [];
    matches.forEach(match => {
      const cleaned = match.trim();
      if (validator(cleaned)) {
        results.add(cleaned);
      }
    });
  });
  
  return Array.from(results);
};

// Validation functions
const validateEmail = (email: string): boolean => {
  const cleanEmail = email.toLowerCase().replace(/[^\w@.-]/g, '');
  const parts = cleanEmail.split('@');
  return parts.length === 2 && parts[0].length > 0 && parts[1].includes('.') && parts[1].length > 3;
};

const validatePhone = (phone: string): boolean => {
  const digits = phone.replace(/\D/g, '');
  return digits.length >= 7 && digits.length <= 15;
};

const validateWebsite = (website: string): boolean => {
  const cleaned = website.toLowerCase().trim();
  // Must not contain @ (to avoid emails being treated as websites)
  if (cleaned.includes('@')) return false;
  // Must have a valid domain extension
  return cleaned.includes('.') && cleaned.length > 5 && 
         /\.(com|org|net|edu|gov|ae|co\.ae|io|tech|biz|info|co\.uk|co|me|tv|cc)/.test(cleaned) &&
         // Should not start with common email patterns
         !/^[a-z0-9._%+-]+@/.test(cleaned);
};

// Build enhanced contact with intelligent field assignment
const buildEnhancedContact = (extractedData: ExtractedData, logoColors: ColorInfo[]): Contact => {
  const contact: EnhancedContact = {
    name: '',
    email: '',
    phone: '',
    organization: '',
    title: '',
    address: '',
    website: '',
    message1: '',
    message2: '',
    confidence: extractedData.confidence,
    logoColors,
    extractedPhones: extractedData.phones,
    extractedEmails: extractedData.emails
  };
  
  // Assign structured data
  contact.email = extractedData.emails[0] || '';
  contact.phone = extractedData.phones.slice(0, 3).join(' | ');
  
  // Smart website detection - use detected website or derive from email domain
  if (extractedData.websites.length > 0) {
    contact.website = extractedData.websites[0];
  } else if (extractedData.emails.length > 0) {
    // Extract domain from email and create website
    const emailDomain = extractedData.emails[0].split('@')[1];
    if (emailDomain) {
      contact.website = `https://${emailDomain}`;
      console.log(`Generated website from email domain: ${contact.website}`);
    }
  } else {
    contact.website = '';
  }
  
  // Extract contextual information from cleaned lines
  const usedLines = new Set<number>();
  const cleanLines = extractedData.cleanLines;
  
  // Try to extract name from clean lines first
  contact.name = extractNameAdvanced(cleanLines, usedLines);
  
  // If no name found in clean lines, try all lines (fallback)
  if (!contact.name) {
    console.log('No name found in clean lines, trying all lines as fallback');
    const allLines = extractedData.rawText.split('\n').map(line => line.trim()).filter(line => line.length > 0);
    const fallbackUsedLines = new Set<number>();
    contact.name = extractNameAdvanced(allLines, fallbackUsedLines);
  }
  
  // Extract organization and title with better logic
  const orgAndTitle = extractOrganizationAndTitle(cleanLines, usedLines, contact.name, extractedData.emails);
  contact.organization = orgAndTitle.organization;
  contact.title = orgAndTitle.title;
  
  // Extract address from all lines (not just clean lines) since it might contain contact info
  const allLines = extractedData.rawText.split('\n').map(line => line.trim()).filter(line => line.length > 0);
  contact.address = extractAddressAdvanced(allLines, usedLines, extractedData.emails, extractedData.phones);
  
  console.log(`Extracted address: "${contact.address}"`);
  
  // Parse name into components
  parseNameComponents(contact);
  
  // Parse phone numbers into specific types
  parsePhoneComponents(contact, extractedData.phones);
  
  // Parse address into components
  parseAddressComponents(contact);
  
  return contact;
};

// Parse full name into first/last name components
const parseNameComponents = (contact: Contact): void => {
  if (!contact.name) return;
  
  // Handle prefixes
  const prefixMatch = contact.name.match(/^(Mr|Mrs|Ms|Dr|Prof|Sir|Dame)\.?\s+(.+)/i);
  if (prefixMatch) {
    contact.prefix = prefixMatch[1];
    contact.name = prefixMatch[2].trim();
  }
  
  // Handle suffixes
  const suffixMatch = contact.name.match(/^(.+)\s+(Jr|Sr|III|IV|V|PhD|MD|Esq)\.?$/i);
  if (suffixMatch) {
    contact.name = suffixMatch[1].trim();
    contact.suffix = suffixMatch[2];
  }
  
  // Split into first/last name
  const nameParts = contact.name.trim().split(/\s+/);
  if (nameParts.length >= 2) {
    contact.firstName = nameParts[0];
    contact.lastName = nameParts.slice(1).join(' ');
  } else if (nameParts.length === 1) {
    contact.firstName = nameParts[0];
    contact.lastName = '';
  }
};

// Parse phone numbers into specific types based on T/F prefixes
const parsePhoneComponents = (contact: Contact, phones: string[]): void => {
  const usedNumbers = new Set<string>();
  
  phones.forEach((phone, index) => {
    const cleanPhone = phone.replace(/^[TFH]\s+/, '').trim();
    
    // Skip if we've already used this number
    if (usedNumbers.has(cleanPhone)) return;
    usedNumbers.add(cleanPhone);
    
    if (phone.startsWith('T ')) {
      // T prefix = work/office phone
      if (!contact.workPhone) {
        contact.workPhone = cleanPhone;
      }
    } else if (phone.startsWith('F ')) {
      // F prefix = fax
      if (!contact.faxPhone) {
        contact.faxPhone = cleanPhone;
      }
    } else if (phone.startsWith('H ')) {
      // H prefix = home phone
      if (!contact.homePhone) {
        contact.homePhone = cleanPhone;
      }
    } else if (index === 0) {
      // First phone without prefix = mobile
      if (!contact.mobilePhone) {
        contact.mobilePhone = cleanPhone;
      }
    } else {
      // Additional phones fill empty slots
      if (!contact.workPhone) {
        contact.workPhone = cleanPhone;
      } else if (!contact.homePhone) {
        contact.homePhone = cleanPhone;
      }
    }
  });
};

// Parse address into individual components for form fields
const parseAddressComponents = (contact: Contact): void => {
  if (!contact.address) return;
  
  const address = contact.address.trim();
  console.log(`Parsing address: "${address}"`);
  
  // Handle "A P.O Box: 25475, Abu Dhabi, UAE" format
  if (/^A\s+P\.O\.?\s*Box/i.test(address)) {
    const cleanAddress = address.replace(/^A\s+/i, '').trim();
    parseAddressParts(contact, cleanAddress);
  } else {
    parseAddressParts(contact, address);
  }
};

// Helper function to parse address parts
const parseAddressParts = (contact: Contact, address: string): void => {
  // Split by comma and clean parts
  const parts = address.split(',').map(part => part.trim()).filter(part => part.length > 0);
  
  if (parts.length === 0) return;
  
  // Initialize components
  let street = '';
  let city = '';
  let state = '';
  let country = '';
  let zipcode = '';
  
  // Pattern matching for different address formats
  if (parts.length >= 3) {
    // Format: "P.O Box: 25475, Abu Dhabi, UAE"
    // P.O Box is not a street address, it's a postal address
    const firstPart = parts[0];
    if (/P\.O\.?\s*Box/i.test(firstPart)) {
      // Don't put P.O Box in street field, leave it empty or put in a separate field
      street = ''; // P.O Box is not a street address
    } else {
      street = firstPart;
    }
    
    // Last part is usually country
    const lastPart = parts[parts.length - 1];
    if (/^(UAE|United Arab Emirates|Saudi Arabia|KSA|Oman|India|Pakistan|Qatar|Bangladesh|Philippines|UK|United Kingdom|Canada|Australia|Japan|Korea|China|USA|United States|Sweden|Iran|Sudan)$/i.test(lastPart)) {
      country = lastPart;
      
      // Second to last is usually city
      if (parts.length >= 2) {
        city = parts[parts.length - 2];
      }
      
      // Any middle parts could be state/province
      if (parts.length >= 4) {
        state = parts.slice(1, -2).join(', ');
      }
    } else {
      // No clear country, treat as city, state
      city = parts[1];
      if (parts.length >= 3) {
        state = parts.slice(2).join(', ');
      }
    }
  } else if (parts.length === 2) {
    // Format: "Street, City" or "City, Country"
    street = parts[0];
    city = parts[1];
  } else if (parts.length === 1) {
    // Single part - could be street or city
    if (/P\.O\.?\s*Box/i.test(parts[0])) {
      street = parts[0];
    } else {
      city = parts[0];
    }
  }
  
  // Extract ZIP code from any part
  parts.forEach(part => {
    const zipMatch = part.match(/\b(\d{4,6})\b/);
    if (zipMatch && !zipcode) {
      zipcode = zipMatch[1];
      // Remove ZIP from the part it was found in
      if (street.includes(zipcode)) {
        street = street.replace(zipcode, '').replace(/[:\s]+$/, '').trim();
      }
    }
  });
  
  // Assign to contact
  contact.street = street;
  contact.city = city;
  contact.state = state;
  contact.country = country;
  contact.zipcode = zipcode;
  
  console.log(`Parsed address components:`, {
    street: contact.street,
    city: contact.city,
    state: contact.state,
    country: contact.country,
    zipcode: contact.zipcode
  });
};

// Enhanced name extraction for complex business card layouts
const extractNameAdvanced = (lines: string[], usedLines: Set<number>): string => {
  if (lines.length === 0) {
    console.log('No clean lines available for name extraction');
    return '';
  }
  
  const nameScores = lines.map((line, index) => {
    let score = 0;
    const cleanLine = line.trim();
    
    // Skip empty lines or lines with company indicators
    if (!cleanLine || hasCompanyIndicators(cleanLine)) {
      return { line: cleanLine, score: -100, index };
    }
    
    // Skip lines that are clearly not names
    if (cleanLine.length < 2) {
      return { line: cleanLine, score: -100, index };
    }
    
    // Clean the line and check for valid name characters (English only, no Arabic)
    const nameOnlyChars = cleanLine.replace(/[^a-zA-Z\s.-]/g, '').trim();
    if (nameOnlyChars.length < 2) {
      return { line: cleanLine, score: -100, index };
    }
    
    // Split into words and filter meaningful ones
    const words = nameOnlyChars.split(/\s+/).filter(w => w.length > 1);
    
    // Enhanced word count scoring for names with spaces
    if (words.length === 2) score += 80; // First Name Last Name (most common)
    else if (words.length === 3) score += 75; // First Middle Last 
    else if (words.length === 1 && nameOnlyChars.length >= 3) score += 40; // Single names
    else if (words.length === 4) score += 45; // Full names with titles
    else if (words.length >= 5) score -= 40; // Too many words, likely not a name
    
    // Enhanced capitalization scoring for names with spaces
    const properCapitalization = words.every(word => {
      // Check for proper English capitalization
      if (/^[A-Z][a-z]+$/.test(word)) return true;
      // Check for initials (single capital letters)
      if (/^[A-Z]\.?$/.test(word)) return true;
      // Check for hyphenated names
      if (/^[A-Z][a-z]+-[A-Z][a-z]+$/.test(word)) return true;
      // Check for common name patterns like O'Connor, D'Angelo
      if (/^[A-Z]'[A-Z][a-z]+$/.test(word)) return true;
      return false;
    });
    
    if (properCapitalization) score += 70;
    
    // Position scoring - names are typically in the first few lines after company name
    if (index === 0) score += 60; // First line could be company or name
    else if (index === 1) score += 80; // Second line very likely to be name
    else if (index === 2) score += 70; // Third line also likely
    else if (index <= 4) score += 40; // Top area of business card
    else if (index <= 7) score += 20; // Middle area
    else score -= 20; // Lower area less likely for names
    
    // Length scoring - names should be reasonable length
    if (cleanLine.length >= 3 && cleanLine.length <= 50) score += 35;
    if (cleanLine.length >= 5 && cleanLine.length <= 30) score += 25; // Sweet spot
    
    // Avoid all caps (usually company names or titles)
    if (cleanLine === cleanLine.toUpperCase() && cleanLine.length > 8) {
      score -= 70;
    }
    
    // Bonus for common name prefixes
    if (/^(Mr|Mrs|Ms|Dr|Prof|Sir|Dame)\.?\s+/i.test(cleanLine)) {
      score += 30;
      // Remove the prefix for cleaner name
      const nameWithoutPrefix = cleanLine.replace(/^(Mr|Mrs|Ms|Dr|Prof|Sir|Dame)\.?\s+/i, '').trim();
      return { line: nameWithoutPrefix, score, index };
    }
    
    // Penalty for numbers (names shouldn't have numbers)
    if (/\d/.test(cleanLine)) score -= 60;
    
    // Penalty for email-like patterns
    if (/@/.test(cleanLine)) score -= 150;
    
    // Penalty for phone-like patterns
    if (/\+?\d{3,}/.test(cleanLine)) score -= 80;
    
    // Penalty for website-like patterns
    if (/\.(com|org|net|ae|co)/.test(cleanLine.toLowerCase())) score -= 150;
    
    // Penalty for address patterns
    if (/P\.O\.?\s*Box|Abu Dhabi|Dubai|UAE/i.test(cleanLine)) score -= 100;
    
    // Bonus for common name patterns
    if (/^[A-Z][a-z]+\s+[A-Z][a-z]+$/.test(cleanLine)) score += 50; // John Smith
    if (/^[A-Z][a-z]+\s+[A-Z]\.\s+[A-Z][a-z]+$/.test(cleanLine)) score += 45; // John A. Smith
    if (/^[A-Z][a-z]+\s+[A-Z][a-z]+\s+[A-Z][a-z]+$/.test(cleanLine)) score += 40; // John Michael Smith
    
    // Special case: if line contains only name-like words and proper capitalization
    if (words.length >= 2 && properCapitalization && !/[0-9@+.]/.test(cleanLine)) {
      score += 60;
    }
    
    console.log(`Name scoring for "${cleanLine}": ${score} (words: ${words.length}, properCap: ${properCapitalization})`);
    
    return { line: cleanLine, score, index };
  });
  
  // Sort by score and find the best candidate
  nameScores.sort((a, b) => b.score - a.score);
  
  // Debug logging for name detection
  console.log('Name detection scores:', nameScores.slice(0, 5));
  
  // Look for the best name candidate with a reasonable score
  for (const candidate of nameScores) {
    if (candidate.score > 40) {
      usedLines.add(candidate.index);
      console.log(`Selected name: "${candidate.line}" with score ${candidate.score}`);
      return candidate.line.trim();
    }
  }
  
  console.log('No suitable name candidate found');
  return '';
};

// Combined organization and title extraction with better logic
const extractOrganizationAndTitle = (lines: string[], usedLines: Set<number>, name: string, emails: string[] = []): { organization: string; title: string } => {
  // First, try to get organization from email domain
  const emailDomains = emails.map(email => {
    const domain = email.split('@')[1];
    if (domain) {
      return domain.split('.')[0].toLowerCase(); // Get main domain part (e.g., 'arco' from 'arco.ae')
    }
    return '';
  }).filter(domain => domain.length > 0);
  
  console.log('Email domains for organization extraction:', emailDomains);
  
  // Look for company type words that can combine with email domain
  const companyTypes = ['electromechanical', 'mechanical', 'electrical', 'engineering', 'systems', 'solutions', 'services', 'trading', 'contracting'];
  let organizationFromDomain = '';
  let companyTypeLine = '';
  
  // Find company type line
  for (let i = 0; i < lines.length; i++) {
    if (usedLines.has(i) || lines[i] === name) continue;
    
    const line = lines[i].toLowerCase().trim();
    if (companyTypes.some(type => line === type || line.includes(type))) {
      companyTypeLine = lines[i].trim();
      usedLines.add(i);
      break;
    }
  }
  
  // Look for company logo/brand names in the lines first
  let logoCompanyName = '';
  for (let i = 0; i < lines.length; i++) {
    if (usedLines.has(i) || lines[i] === name) continue;
    
    const line = lines[i].trim();
    const lowerLine = line.toLowerCase();
    
    // Check for known company names or if it matches email domain
    const matchesEmailDomain = emailDomains.some(domain => lowerLine.includes(domain));
    const isKnownCompany = /^(sicuro|arco|adnoc|emirates|etisalat|du|mashreq)$/i.test(line);
    
    if (matchesEmailDomain || isKnownCompany) {
      logoCompanyName = line;
      usedLines.add(i);
      console.log(`Found logo/company name: "${logoCompanyName}"`);
      break;
    }
  }
  
  // Create organization from logo name + company type, or email domain + company type
  if (logoCompanyName && companyTypeLine) {
    organizationFromDomain = `${logoCompanyName} ${companyTypeLine}`;
    console.log(`Created organization from logo + type: "${organizationFromDomain}"`);
  } else if (emailDomains.length > 0 && companyTypeLine) {
    const domain = emailDomains[0];
    const domainName = domain.charAt(0).toUpperCase() + domain.slice(1); // Capitalize first letter
    organizationFromDomain = `${domainName} ${companyTypeLine}`;
    console.log(`Created organization from domain + type: "${organizationFromDomain}"`);
  } else if (logoCompanyName) {
    // Just use logo company name
    organizationFromDomain = logoCompanyName;
    console.log(`Created organization from logo only: "${organizationFromDomain}"`);
  } else if (emailDomains.length > 0) {
    // Just use domain name if no company type found
    const domain = emailDomains[0];
    organizationFromDomain = domain.charAt(0).toUpperCase() + domain.slice(1);
    console.log(`Created organization from domain only: "${organizationFromDomain}"`);
  }
  
  // Now extract title (job titles, not organizations)
  let title = '';
  const titleKeywords = [
    'manager', 'director', 'engineer', 'developer', 'designer', 'analyst', 'consultant', 'specialist',
    'coordinator', 'administrator', 'assistant', 'officer', 'estimation', 'business development',
    'sales', 'marketing', 'finance', 'operations', 'project', 'technical', 'general', 'regional'
  ];
  
  for (let i = 0; i < lines.length; i++) {
    if (usedLines.has(i) || lines[i] === name) continue;
    
    const line = lines[i].trim();
    const lowerLine = line.toLowerCase();
    
    // Check if this line contains job title keywords
    const hasJobTitleKeywords = titleKeywords.some(keyword => lowerLine.includes(keyword));
    
    // Specific patterns for job titles
    const isJobTitle = 
      /^(Estimation Engineer|Business Development Manager|Project Manager|Sales Manager|Technical Manager)/i.test(line) ||
      /estimation\s+engineer[-\s]?mechanical/i.test(line) ||
      (hasJobTitleKeywords && !/^[A-Z]{2,}\s+(electromechanical|mechanical)/i.test(line)); // Not company patterns
    
    if (isJobTitle) {
      title = line;
      usedLines.add(i);
      console.log(`Found job title: "${title}"`);
      break;
    }
  }
  
  return {
    organization: organizationFromDomain,
    title: title
  };
};

// Enhanced address extraction for complex business cards
const extractAddressAdvanced = (lines: string[], usedLines: Set<number>, emails: string[] = [], phones: string[] = []): string => {
  const addressKeywords = [
    // Street types
    'street', 'st', 'avenue', 'ave', 'road', 'rd', 'boulevard', 'blvd',
    'lane', 'ln', 'drive', 'dr', 'court', 'ct', 'place', 'pl',
    // Building types
    'suite', 'apt', 'apartment', 'building', 'floor', 'office', 'unit',
    // Postal
    'po box', 'p.o', 'box',
    // UAE locations
    'dubai', 'abu dhabi', 'sharjah', 'ajman', 'uae', 'emirates',
    'city', 'tower', 'center', 'centre', 'mall', 'plaza'
  ];
  
  const addressLines = lines
    .map((line, index) => ({ line, index, score: 0 }))
    .filter(item => !usedLines.has(item.index))
    .map(item => {
      const lowerLine = item.line.toLowerCase();
      let score = 0;
      
      // Skip lines that are clearly emails or phones
      const isEmail = emails.some(email => lowerLine.includes(email.toLowerCase()));
      const isPhone = phones.some(phone => {
        const phoneDigits = phone.replace(/\D/g, '');
        const lineDigits = item.line.replace(/\D/g, '');
        return phoneDigits.length >= 7 && lineDigits.includes(phoneDigits.slice(-7));
      });
      
      if (isEmail || isPhone) {
        return { ...item, score: -100 };
      }
      
      // Skip lines with @ symbol (emails)
      if (item.line.includes('@')) {
        return { ...item, score: -100 };
      }
      
      // Skip lines that start with T, F, E prefixes (contact details)
      if (/^[TFE]\s+/.test(item.line)) {
        return { ...item, score: -100 };
      }
      
      // Special handling for "A P.O Box" pattern and regular P.O Box
      if (/^A\s+P\.O\.?\s*Box/i.test(item.line)) score += 80;
      if (/P\.O\.?\s*Box/i.test(item.line)) score += 70;
      
      // Keyword matching
      const keywordMatches = addressKeywords.filter(keyword => lowerLine.includes(keyword));
      score += keywordMatches.length * 40;
      
      // Contains numbers (common in addresses)
      if (/\d+/.test(item.line)) score += 30;
      
      // Contains postal code patterns
      if (/\b\d{5}\b/.test(item.line)) score += 35; // 5-digit postal
      if (/\b\d{4}\b/.test(item.line)) score += 25; // 4-digit postal
      
      // Comprehensive country and city detection
      if (/(UAE|United Arab Emirates|Saudi Arabia|KSA|Oman|India|Pakistan|Qatar|Bangladesh|Philippines|UK|United Kingdom|Canada|Australia|Japan|Korea|China|USA|United States|Sweden|Iran|Sudan)/i.test(item.line)) score += 60;
      if (/(Abu Dhabi|Dubai|Sharjah|Ajman|Riyadh|Jeddah|Muscat|Mumbai|Delhi|Karachi|Lahore|Doha|Dhaka|Manila|London|Toronto|Sydney|Tokyo|Seoul|Beijing|New York|Stockholm|Tehran|Khartoum)/i.test(item.line)) score += 50;
      if (/(city|town|state|country|province|region|emirate)/i.test(item.line)) score += 30;
      
      // Length scoring
      if (item.line.length >= 10 && item.line.length <= 120) score += 20;
      
      // Position scoring - addresses are usually towards the bottom
      if (item.index >= lines.length - 5) score += 30;
      else if (item.index >= lines.length - 8) score += 20;
      
      return { ...item, score };
    })
    .filter(item => item.score > 15)
    .sort((a, b) => b.score - a.score);
  
  console.log('Address detection scores:', addressLines.slice(0, 3));
  
  // Combine multiple address lines intelligently
  const selectedAddresses = addressLines.slice(0, 3).map(item => item.line);
  
  // If we have P.O Box and country/city, combine them properly
  const poBoxLine = selectedAddresses.find(addr => /P\.O\.?\s*Box/i.test(addr));
  const countryLine = selectedAddresses.find(addr => 
    /(UAE|United Arab Emirates|Abu Dhabi|Dubai|India|Pakistan|Qatar|Bangladesh|Philippines|UK|Canada|Australia|Japan|Korea|China|USA|Sweden|Iran|Sudan)/i.test(addr)
  );
  
  if (poBoxLine && countryLine && poBoxLine !== countryLine) {
    console.log(`Combining P.O Box "${poBoxLine}" with country "${countryLine}"`);
    return `${poBoxLine}, ${countryLine}`;
  }
  
  return selectedAddresses.join(', ');
};

// Check for company indicators
const hasCompanyIndicators = (line: string): boolean => {
  const indicators = [
    'llc', 'inc', 'corp', 'ltd', 'company', 'co.', '&', 'and', 'group',
    'fze', 'fzco', 'establishment', 'est', 'trading', 'contracting'
  ];
  const lowerLine = line.toLowerCase();
  return indicators.some(indicator => lowerLine.includes(indicator));
};

// Fallback OCR for when advanced processing fails
const basicOCRFallback = async (imageFile: File): Promise<Contact> => {
  const worker = await createWorker('eng');
  
  try {
    await worker.setParameters({
      tessedit_char_whitelist: 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789@.+-()[]{}/:;, \n\r\t',
      tessedit_pageseg_mode: PSM.AUTO_OSD
    });
    
    const { data: { text } } = await worker.recognize(imageFile);
    await worker.terminate();
    
    console.log('=== FALLBACK OCR RESULTS ===');
    console.log('Fallback text:', text);
    console.log('============================');
    
    // Basic parsing as fallback
    return parseBasicText(text);
  } catch (error) {
    await worker.terminate();
    throw error;
  }
};

// Basic text parsing for fallback
const parseBasicText = (text: string): Contact => {
  const lines = text.split('\n').map(line => line.trim()).filter(line => line.length > 0);
  
  const contact: Contact = {
    name: lines[0] || '',
    email: extractEmails(text)[0] || '',
    phone: extractPhoneNumbers(text)[0] || '',
    organization: lines[1] || '',
    title: '',
    address: '',
    website: extractWebsites(text)[0] || '',
    message1: '',
    message2: ''
  };
  
  return contact;
};

// Legacy extraction functions for fallback compatibility
const extractEmails = (text: string): string[] => {
  const emailRegex = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g;
  return (text.match(emailRegex) || []).slice(0, 2);
};

const extractPhoneNumbers = (text: string): string[] => {
  const phoneRegex = /(\+?971[-.\s]?)?[0-9][-.\s]?[0-9]{3}[-.\s]?[0-9]{4}/g;
  return (text.match(phoneRegex) || []).slice(0, 3);
};

const extractWebsites = (text: string): string[] => {
  const websiteRegex = /[a-zA-Z0-9-]+\.(com|org|net|ae|co\.ae)/gi;
  return (text.match(websiteRegex) || []).slice(0, 2);
};

// Export preprocessImage for backward compatibility
export const preprocessImage = enhanceImageForOCR;
