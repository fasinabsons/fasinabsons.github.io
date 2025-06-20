import { Contact } from '../types';

// Enhanced interfaces for better data handling

interface ColorInfo {
  hex: string;
  rgb: string;
  frequency: number;
  prominence: number;
}

interface ProcessedOCRData extends Contact {
  confidence: number;
  logoColors?: ColorInfo[];
  rawData: unknown;
  fieldConfidences: Record<string, number>;
  alternativeValues: Record<string, string[]>;
}

// Optimized field detection patterns with improved accuracy
const FIELD_PATTERNS = {
  email: [
    // Most accurate email pattern first
    /\b[a-zA-Z0-9](?:[a-zA-Z0-9._-]*[a-zA-Z0-9])?@[a-zA-Z0-9](?:[a-zA-Z0-9.-]*[a-zA-Z0-9])?\.[a-zA-Z]{2,}\b/gi,
    // Pattern for emails with prefixes (E: email@domain.com)
    /(?:E[:\s]+|Email[:\s]+|Mail[:\s]+)([a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,})/gi,
    // Fallback pattern for malformed emails
    /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/gi
  ],
  phone: [
    // UAE mobile formats (most common first)
    /(?:\+971|971)[-.\s]?(?:50|55|56|58)[-.\s]?\d{3}[-.\s]?\d{4}/g,
    // UAE landline formats
    /(?:\+971|971)[-.\s]?[2-4679][-.\s]?\d{3}[-.\s]?\d{4}/g,
    // Phone with prefixes (T:, Tel:, Phone:)
    /(?:T[:\s]+|Tel[:\s]+|Phone[:\s]+|P[:\s]+)(\+?971[-.\s]?\d{1,2}[-.\s]?\d{3,4}[-.\s]?\d{4})/gi,
    // Fax with prefixes
    /(?:F[:\s]+|Fax[:\s]+)(\+?971[-.\s]?\d{1,2}[-.\s]?\d{3,4}[-.\s]?\d{4})/gi,
    // International formats
    /\+\d{1,3}[-.\s]?\d{1,4}[-.\s]?\d{3,4}[-.\s]?\d{3,4}/g,
    // General formats
    /\b\d{3}[-.\s]?\d{3}[-.\s]?\d{4}\b/g
  ],
  website: [
    // Full URLs first
    /https?:\/\/(?:www\.)?[-a-zA-Z0-9@:%._+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b(?:[-a-zA-Z0-9()@:%_+.~#?&=]*)/gi,
    // Domain names with common extensions
    /\b(?:www\.)?[a-zA-Z0-9](?:[a-zA-Z0-9-]*[a-zA-Z0-9])?\.(com|org|net|edu|gov|ae|co\.ae|io|tech|biz|info|co\.uk|co|me)\b/gi,
    // Email domains as potential websites
    /@([a-zA-Z0-9.-]+\.[a-zA-Z]{2,})/gi
  ],
  name: [
    // Full names with proper capitalization
    /^[A-Z][a-z]+(?:\s+[A-Z][a-z]*\.?)*\s+[A-Z][a-z]+$/m,
    // Names with middle initials
    /^[A-Z][a-z]+\s+[A-Z]\.\s+[A-Z][a-z]+$/m,
    // Single word names (first or last only)
    /^[A-Z][a-z]{2,}$/m
  ],
  title: [
    // Executive titles
    /\b(?:Chief|Senior|Executive|Vice\s+President|President|Director|Manager|Head\s+of)\b[^.]*?(?:Officer|Manager|Director|Engineer|Analyst|Consultant)/gi,
    // Engineering titles
    /\b(?:Senior|Lead|Principal|Chief)?\s*(?:Software|Hardware|Mechanical|Electrical|Civil|Chemical|Systems|Network|DevOps|Full[- ]?Stack)?\s*(?:Engineer|Developer|Architect|Analyst|Specialist)/gi,
    // Business titles
    /\b(?:Business\s+Development|Sales|Marketing|Operations|Project|Product|Program)\s+(?:Manager|Director|Coordinator|Specialist|Lead)/gi,
    // Professional titles
    /\b(?:Consultant|Analyst|Specialist|Coordinator|Administrator|Executive|Associate|Assistant|Representative)/gi
  ],
  company: [
    // Company with legal suffixes
    /\b[A-Z][A-Za-z\s&]+(?:LLC|Inc\.?|Corp\.?|Ltd\.?|Limited|Company|Co\.?|Group|Solutions|Services|Technologies|Systems|International|Global|Holdings|Partners|Associates|Enterprises|Industries|Trading|Consulting)\b/gi,
    // Technical company names
    /\b[A-Z][A-Za-z\s]*(?:Electromechanical|Engineering|Contracting|Construction|Manufacturing|Technology|Software|Hardware|Systems|Solutions|Services)\b/gi,
    // Well-known company patterns
    /\b(?:ARCO|Sicuro|ADNOC|Emirates|Etisalat|Du|Mashreq|FAB|ENOC|DEWA|SEWA|FEWA)\b[A-Za-z\s]*/gi
  ],
  address: [
    // P.O. Box addresses
    /(?:A[:\s]+)?(?:P\.?O\.?\s*Box|PO\s*Box)[:\s]*\d+(?:[,\s]*[A-Za-z\s]+)*(?:[,\s]*(?:UAE|United\s+Arab\s+Emirates))?/gi,
    // Street addresses
    /\b\d+[A-Za-z]?\s+[A-Z][A-Za-z\s,]+(Street|St|Avenue|Ave|Road|Rd|Drive|Dr|Boulevard|Blvd|Lane|Ln)/gi,
    // Cities and countries with comprehensive support
    /\b(?:Abu\s+Dhabi|Dubai|Sharjah|Ajman|Ras\s+Al\s+Khaimah|Fujairah|Umm\s+Al\s+Quwain|Al\s+Ain|Riyadh|Jeddah|Mecca|Medina|Muscat|Mumbai|Delhi|Karachi|Lahore|Doha|Dhaka|Manila|London|Toronto|Sydney|Tokyo|Seoul|Beijing|New\s+York|Stockholm|Tehran|Khartoum)\b/gi,
    // Countries
    /\b(?:UAE|United\s+Arab\s+Emirates|Saudi\s+Arabia|KSA|Oman|India|Pakistan|Qatar|Bangladesh|Philippines|UK|United\s+Kingdom|Canada|Australia|Japan|Korea|China|USA|United\s+States|Sweden|Iran|Sudan)\b/gi
  ]
};

class OCRDataProcessor {
  private emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  processOCRData(rawText: string, confidence: number, structuredData?: unknown): ProcessedOCRData {
    const fieldConfidences: Record<string, number> = {};
    const alternativeValues: Record<string, string[]> = {};
    
    // Clean and process text
    const { cleanedText, qualityScore } = this.cleanOCRText(rawText, confidence);
    
    // Extract fields with enhanced patterns
    const emails = this.extractBestEmail(cleanedText, fieldConfidences);
    const phones = this.extractBestPhone(cleanedText, fieldConfidences);
    const websites = this.extractBestWebsite(cleanedText, fieldConfidences);
    
    // Process clean lines for name/org/title extraction
    const cleanLines = this.getCleanLines(cleanedText, emails, phones, websites);
    
    // Extract contextual information
    const name = this.extractBestName(cleanLines, fieldConfidences);
    const organization = this.extractBestOrganization(cleanLines, emails, fieldConfidences);
    const title = this.extractBestTitle(cleanLines, fieldConfidences);
    const address = this.extractBestAddress(cleanedText, fieldConfidences);
    
    // Build contact with enhanced data
    const processedContact: Contact = {
      name,
      firstName: '',
      lastName: '',
      prefix: '',
      suffix: '',
      email: emails[0] || '',
      phone: phones.slice(0, 3).join(' | '),
      mobilePhone: this.extractPhoneByType(phones, 'mobile'),
      workPhone: this.extractPhoneByType(phones, 'work'),
      homePhone: this.extractPhoneByType(phones, 'home'),
      faxPhone: this.extractPhoneByType(phones, 'fax'),
      organization,
      title,
      department: '',
      address,
      street: '',
      city: '',
      state: '',
      zipcode: '',
      country: '',
      website: websites[0] || this.generateWebsiteFromEmail(emails[0]),
      message1: '',
      message2: '',
      notes: ''
    };

    // Split name into components
    this.parseNameComponents(processedContact);
    
    // Parse address into components
    this.parseAddressComponents(processedContact);

    return {
      ...processedContact,
      confidence: Math.min(confidence, qualityScore),
      rawData: { text: rawText, structuredData },
      fieldConfidences,
      alternativeValues
    };
  }

  private cleanOCRText(text: string, confidence: number): { cleanedText: string; qualityScore: number } {
    const lines = text.split('\n').map(line => line.trim()).filter(line => line.length > 0);
    const cleanedLines: string[] = [];
    let qualityScore = confidence;
    
    for (const line of lines) {
      // Skip obvious OCR garbage
      if (this.isOCRGarbage(line)) {
        qualityScore -= 2;
        continue;
      }
      
      // Preserve contact information lines as-is
      if (this.isContactInfo(line)) {
        cleanedLines.push(line);
        continue;
      }
      
      // Clean and validate text lines
      const cleaned = this.cleanTextLine(line);
      if (cleaned && this.isValidTextLine(cleaned)) {
        cleanedLines.push(cleaned);
      } else {
        qualityScore -= 1;
      }
    }
    
    // Bonus for having expected business card elements
    if (this.hasExpectedElements(cleanedLines)) {
      qualityScore += 10;
    }
    
    return {
      cleanedText: cleanedLines.join('\n'),
      qualityScore: Math.max(0, Math.min(100, qualityScore))
    };
  }

  private isOCRGarbage(line: string): boolean {
    // Check for common OCR garbage patterns
    if (line.length <= 1) return true;
    if (/^[^a-zA-Z0-9@+.]*$/.test(line)) return true; // Only special characters
    if (/^[A-Z]{1,2}$/.test(line) && !/^(IT|AI|HR|PR|QR|US|UK|UAE)$/.test(line)) return true;
    if (line.split('').every(char => char === char.toUpperCase()) && line.length > 10 && !/[@+\d]/.test(line)) return true;
    
    // Gibberish detection
    const consonantClusters = (line.match(/[bcdfghjklmnpqrstvwxyzBCDFGHJKLMNPQRSTVWXYZ]{4,}/g) || []).length;
    if (consonantClusters > 2) return true;
    
    return false;
  }

  private isContactInfo(line: string): boolean {
    return /[@+]/.test(line) || 
           /^[TFE]\s+/.test(line) || 
           /\b\d{3,}/.test(line) ||
           /www\./i.test(line) ||
           /\.(com|org|net|ae|co)/.test(line);
  }

  private cleanTextLine(line: string): string {
    let cleaned = line.trim();
    
    // Fix common OCR character substitutions
    const substitutions: { [key: string]: string } = {
      'SICUIO)': 'Sicuro',
      'SICURO)': 'Sicuro',
      'sicuro)': 'Sicuro'
    };
    
    // Apply specific corrections
    if (substitutions[cleaned]) {
      cleaned = substitutions[cleaned];
    }
    
    // Remove extra whitespace
    cleaned = cleaned.replace(/\s+/g, ' ').trim();
    
    return cleaned;
  }

  private isValidTextLine(line: string): boolean {
    if (line.length < 2) return false;
    if (!/[a-zA-Z]/.test(line)) return false;
    
    const letterCount = (line.match(/[a-zA-Z]/g) || []).length;
    const numberCount = (line.match(/\d/g) || []).length;
    if (numberCount > letterCount && !/(?:box|street|st|avenue|ave|road|rd)/i.test(line)) return false;
    
    return true;
  }

  private hasExpectedElements(lines: string[]): boolean {
    const hasEmail = lines.some(line => /@/.test(line));
    const hasPhone = lines.some(line => /\+?\d{3,}/.test(line));
    const hasName = lines.some(line => /^[A-Z][a-z]+\s+[A-Z][a-z]+/.test(line));
    
    return (hasEmail || hasPhone) && hasName;
  }

  private extractBestEmail(text: string, confidences: Record<string, number>): string[] {
    const emails = new Set<string>();
    const lines = text.split('\n').map(line => line.trim());
    
    // Enhanced email extraction with OCR error correction
    lines.forEach(line => {
      // Handle emails with spaces (Johnny@sicurouae ae -> johnny@sicuro.ae)
      const spaceEmailPattern = /([a-zA-Z0-9._%+-]+)\s*@\s*([a-zA-Z0-9]+)\s+([a-zA-Z]{2,3})\b/g;
      let match;
      while ((match = spaceEmailPattern.exec(line)) !== null) {
        const correctedEmail = `${match[1]}@${match[2]}.${match[3]}`;
        if (this.validateEmail(correctedEmail)) {
          emails.add(correctedEmail.toLowerCase());
        }
      }
      
      // Standard email patterns
      FIELD_PATTERNS.email.forEach(pattern => {
        const matches = line.match(pattern) || [];
        matches.forEach(match => {
          if (match.startsWith('E ')) {
            const emailPart = match.substring(2).trim();
            if (this.validateEmail(emailPart)) {
              emails.add(emailPart.toLowerCase());
            }
          } else if (this.validateEmail(match)) {
            emails.add(match.toLowerCase());
          }
        });
      });
    });
    
    const emailArray = Array.from(emails);
    confidences.email = emailArray.length > 0 ? 85 : 0;
    
    return emailArray;
  }

  private extractBestPhone(text: string, confidences: Record<string, number>): string[] {
    const phones = new Set<string>();
    
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
        
        const normalizedPhone = this.normalizePhoneNumber(cleanPhone);
        if (this.validatePhone(normalizedPhone)) {
          const displayPhone = phoneType === 'fax' ? `F ${normalizedPhone}` : 
                             phoneType === 'tel' ? `T ${normalizedPhone}` : normalizedPhone;
          phones.add(displayPhone);
        }
      });
    });
    
    const phoneArray = Array.from(phones);
    confidences.phone = phoneArray.length > 0 ? 80 : 0;
    
    return phoneArray;
  }

  private extractBestWebsite(text: string, confidences: Record<string, number>): string[] {
    const websites = new Set<string>();
    
    FIELD_PATTERNS.website.forEach(pattern => {
      const matches = text.match(pattern) || [];
      matches.forEach(match => {
        const cleaned = this.normalizeUrl(match);
        if (cleaned && this.validateWebsite(cleaned)) {
          websites.add(cleaned);
        }
      });
    });
    
    const websiteArray = Array.from(websites);
    confidences.website = websiteArray.length > 0 ? 75 : 0;
    
    return websiteArray;
  }

  private getCleanLines(text: string, emails: string[], phones: string[], websites: string[]): string[] {
    const lines = text.split('\n').map(line => line.trim()).filter(line => line.length > 0);
    
    return lines.filter(line => {
      const lowerLine = line.toLowerCase();
      
      // Filter out contact information
      const hasEmail = emails.some(email => lowerLine.includes(email.toLowerCase()));
      const hasPhone = phones.some(phone => {
        const phoneDigits = phone.replace(/\D/g, '');
        const lineDigits = line.replace(/\D/g, '');
        return phoneDigits.length >= 7 && lineDigits.includes(phoneDigits.slice(-7));
      });
      const hasWebsite = websites.some(website => lowerLine.includes(website.toLowerCase()));
      const isContactDetail = /^[TFEA]\s+/.test(line) || line.includes('@') || /\+?[\d\s\-()]{7,}/.test(line);
      
      return !hasEmail && !hasPhone && !hasWebsite && !isContactDetail;
    });
  }

  private extractBestName(lines: string[], confidences: Record<string, number>): string {
    if (lines.length === 0) return '';
    
    const nameScores = lines.map((line, index) => {
      let score = 0;
      const cleanLine = line.trim();
      
      if (!cleanLine || cleanLine.length < 2) return { line: cleanLine, score: -100, index };
      
      const words = cleanLine.split(/\s+/).filter(w => w.length > 1);
      
      // Word count scoring
      if (words.length === 2) score += 80;
      else if (words.length === 3) score += 75;
      else if (words.length === 1) score += 40;
      
      // Capitalization scoring
      const properCapitalization = words.every(word => /^[A-Z][a-z]+$/.test(word));
      if (properCapitalization) score += 70;
      
      // Position scoring
      if (index <= 2) score += 60;
      else if (index <= 4) score += 40;
      
      return { line: cleanLine, score, index };
    });
    
    nameScores.sort((a, b) => b.score - a.score);
    
    const bestCandidate = nameScores.find(candidate => candidate.score > 40);
    if (bestCandidate) {
      confidences.name = Math.min(95, bestCandidate.score);
      return bestCandidate.line;
    }
    
    return '';
  }

  private extractBestOrganization(lines: string[], emails: string[], confidences: Record<string, number>): string {
    // Extract from email domain
    let domainOrg = '';
    if (emails.length > 0) {
      const domain = emails[0].split('@')[1];
      if (domain) {
        const domainName = domain.split('.')[0];
        domainOrg = domainName.charAt(0).toUpperCase() + domainName.slice(1);
      }
    }
    
    // Look for company type words
    const companyTypes = ['electromechanical', 'mechanical', 'electrical', 'engineering'];
    const companyTypeLine = lines.find(line => 
      companyTypes.some(type => line.toLowerCase().includes(type))
    );
    
    let organization = '';
    if (domainOrg && companyTypeLine) {
      organization = `${domainOrg} ${companyTypeLine}`;
    } else if (domainOrg) {
      organization = domainOrg;
    } else if (companyTypeLine) {
      organization = companyTypeLine;
    }
    
    confidences.organization = organization ? 75 : 0;
    return organization;
  }

  private extractBestTitle(lines: string[], confidences: Record<string, number>): string {
    const titleKeywords = ['manager', 'director', 'engineer', 'developer', 'analyst', 'consultant'];
    
    const titleLine = lines.find(line => {
      const lowerLine = line.toLowerCase();
      return titleKeywords.some(keyword => lowerLine.includes(keyword)) &&
             !/^[A-Z]{2,}\s+(electromechanical|mechanical)/i.test(line);
    });
    
    confidences.title = titleLine ? 70 : 0;
    return titleLine || '';
  }

  private extractBestAddress(text: string, confidences: Record<string, number>): string {
    const lines = text.split('\n').map(line => line.trim()).filter(line => line.length > 0);
    
    const addressLines = lines.filter(line => {
      return /^A\s+P\.O\.?\s*Box/i.test(line) ||
             /P\.O\.?\s*Box/i.test(line) ||
             /(UAE|United Arab Emirates|Abu Dhabi|Dubai)/i.test(line);
    });
    
    const address = addressLines.join(', ');
    confidences.address = address ? 70 : 0;
    
    return address;
  }

  private extractPhoneByType(phones: string[], type: 'mobile' | 'work' | 'home' | 'fax'): string {
    for (const phone of phones) {
      const text = phone.toLowerCase();
      
      switch (type) {
        case 'mobile':
          if (!text.includes('t ') && !text.includes('f ')) {
            return phone.replace(/^[TFH]\s+/, '');
          }
          break;
        case 'work':
          if (text.includes('t ')) {
            return phone.replace(/^T\s+/, '');
          }
          break;
        case 'fax':
          if (text.includes('f ')) {
            return phone.replace(/^F\s+/, '');
          }
          break;
      }
    }
    
    return '';
  }

  private normalizePhoneNumber(phone: string): string {
    let cleaned = phone.replace(/[^\d+]/g, '');
    
    if (cleaned.length === 9 && /^[23456789]/.test(cleaned)) {
      cleaned = '+971' + cleaned;
    }
    
    if (cleaned.startsWith('+971') || cleaned.startsWith('971')) {
      const number = cleaned.replace(/^\+?971/, '');
      return `+971 ${number.substring(0, 1)} ${number.substring(1, 4)} ${number.substring(4)}`;
    }
    
    return cleaned;
  }

  private normalizeUrl(url: string): string {
    let cleaned = url.trim().replace(/^(website|url|web):\s*/i, '');
    
    if (!/^https?:\/\//.test(cleaned) && /^www\.|^[a-zA-Z0-9-]+\.[a-zA-Z]{2,}/.test(cleaned)) {
      cleaned = 'https://' + cleaned;
    }
    
    return cleaned;
  }

  private generateWebsiteFromEmail(email: string): string {
    if (!email) return '';
    
    const domain = email.split('@')[1];
    return domain ? `https://${domain}` : '';
  }

  private parseNameComponents(contact: Contact): void {
    if (!contact.name) return;
    
    const nameParts = contact.name.trim().split(/\s+/);
    if (nameParts.length >= 2) {
      contact.firstName = nameParts[0];
      contact.lastName = nameParts.slice(1).join(' ');
    } else if (nameParts.length === 1) {
      contact.firstName = nameParts[0];
      contact.lastName = '';
    }
  }

  private parseAddressComponents(contact: Contact): void {
    if (!contact.address) return;
    
    const parts = contact.address.split(',').map(part => part.trim()).filter(part => part.length > 0);
    
    if (parts.length >= 2) {
      // Last part is usually country
      contact.country = parts[parts.length - 1];
      
      // Second to last is usually city
      if (parts.length >= 2) {
        contact.city = parts[parts.length - 2];
      }
      
      // First part might be street or P.O Box
      if (parts.length >= 3) {
        contact.street = parts[0];
      }
    }
  }

  private validateEmail(email: string): boolean {
    return this.emailRegex.test(email) && !email.includes(' ');
  }

  private validatePhone(phone: string): boolean {
    const digits = phone.replace(/\D/g, '');
    return digits.length >= 7 && digits.length <= 15;
  }

  private validateWebsite(website: string): boolean {
    return !website.includes('@') && website.includes('.') && website.length > 5;
  }
}

export default OCRDataProcessor; 