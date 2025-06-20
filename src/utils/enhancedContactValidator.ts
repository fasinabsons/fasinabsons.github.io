import { Contact } from '../types';

// Enhanced contact validation that considers OCR confidence levels
interface ValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
  suggestions: string[];
  fieldReliability: Record<string, 'high' | 'medium' | 'low'>;
}

interface OCRContactData extends Contact {
  confidence: number;
  fieldConfidences: Record<string, number>;
  alternativeValues: Record<string, string[]>;
}

class EnhancedContactValidator {
  private emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  private urlRegex = /^https?:\/\/[^\s/$.?#].[^\s]*$/i;

  validateOCRContact(contact: OCRContactData): ValidationResult {
    const errors: string[] = [];
    const warnings: string[] = [];
    const suggestions: string[] = [];
    const fieldReliability: Record<string, 'high' | 'medium' | 'low'> = {};

    // Check overall OCR confidence
    if (contact.confidence < 50) {
      warnings.push(`Low OCR confidence (${contact.confidence}%). Please review all fields carefully.`);
    }

    // Validate and assess each field
    this.validateName(contact, errors, warnings, suggestions, fieldReliability);
    this.validateEmail(contact, errors, warnings, suggestions, fieldReliability);
    this.validatePhone(contact, errors, warnings, suggestions, fieldReliability);
    this.validateWebsite(contact, errors, warnings, suggestions, fieldReliability);
    this.validateOrganizationAndTitle(contact, errors, warnings, suggestions, fieldReliability);

    // Cross-field validation
    this.performCrossFieldValidation(contact, warnings, suggestions);

    // Suggest improvements based on alternatives
    this.suggestAlternatives(contact, suggestions);

    return {
      isValid: errors.length === 0,
      errors,
      warnings,
      suggestions,
      fieldReliability
    };
  }

  private validateName(
    contact: OCRContactData, 
    errors: string[], 
    warnings: string[], 
    suggestions: string[],
    reliability: Record<string, 'high' | 'medium' | 'low'>
  ) {
    const nameConfidence = contact.fieldConfidences.name || 0;
    
    if (!contact.name && !contact.firstName && !contact.lastName) {
      errors.push('Name is required');
      return;
    }

    // Assess name reliability
    if (nameConfidence > 80) {
      reliability.name = 'high';
    } else if (nameConfidence > 60) {
      reliability.name = 'medium';
      warnings.push(`Name field has moderate confidence (${nameConfidence}%). Please verify spelling.`);
    } else {
      reliability.name = 'low';
      warnings.push(`Name field has low confidence (${nameConfidence}%). Please check for accuracy.`);
    }

    // Check for common OCR errors in names
    const fullName = contact.name || `${contact.firstName} ${contact.lastName}`.trim();
    if (this.hasCommonOCRErrors(fullName)) {
      warnings.push('Name may contain OCR recognition errors (unusual characters or spacing)');
      suggestions.push('Check for incorrect characters like "0" instead of "O" or "1" instead of "l"');
    }

    // Check name format
    if (fullName.length < 2) {
      warnings.push('Name seems unusually short');
    }
    
    if (fullName.length > 50) {
      warnings.push('Name seems unusually long - may include title or organization');
    }
  }

  private validateEmail(
    contact: OCRContactData,
    errors: string[],
    warnings: string[],
    suggestions: string[],
    reliability: Record<string, 'high' | 'medium' | 'low'>
  ) {
    if (!contact.email) {
      warnings.push('Email address not found - this will limit contact sharing options');
      return;
    }

    const emailConfidence = contact.fieldConfidences.email || 0;

    // Basic email validation
    if (!this.emailRegex.test(contact.email)) {
      errors.push('Email address format is invalid');
      reliability.email = 'low';
      return;
    }

    // Assess email reliability based on OCR confidence
    if (emailConfidence > 85) {
      reliability.email = 'high';
    } else if (emailConfidence > 70) {
      reliability.email = 'medium';
      warnings.push(`Email field has moderate confidence (${emailConfidence}%). Please verify spelling.`);
    } else {
      reliability.email = 'low';
      warnings.push(`Email field has low confidence (${emailConfidence}%). Please double-check accuracy.`);
    }

    // Check for common OCR email errors
    if (this.hasCommonEmailOCRErrors(contact.email)) {
      warnings.push('Email may contain OCR errors (check @ symbol and domain)');
      suggestions.push('Common OCR email errors: "rn" → "m", "cl" → "d", "0" → "o"');
    }

    // Validate domain
    const domain = contact.email.split('@')[1];
    if (domain && !this.isValidDomain(domain)) {
      warnings.push('Email domain appears unusual - please verify');
    }
  }

  private validatePhone(
    contact: OCRContactData,
    errors: string[],
    warnings: string[],
    suggestions: string[],
    reliability: Record<string, 'high' | 'medium' | 'low'>
  ) {
    const phoneNumbers = [
      contact.phone,
      contact.mobilePhone,
      contact.workPhone,
      contact.homePhone,
      contact.faxPhone
    ].filter(Boolean);

    if (phoneNumbers.length === 0) {
      warnings.push('No phone numbers found - this will limit contact options');
      return;
    }

    const phoneConfidence = contact.fieldConfidences.phone || 0;

    // Validate each phone number
    let hasValidPhone = false;
    phoneNumbers.forEach((phone, index) => {
      if (phone) {
        const cleanPhone = phone.replace(/[^\d+]/g, '');
        
        if (cleanPhone.length < 7) {
          warnings.push(`Phone number ${index + 1} seems too short`);
        } else if (cleanPhone.length > 15) {
          warnings.push(`Phone number ${index + 1} seems too long`);
        } else {
          hasValidPhone = true;
        }
      }

      // Check for common OCR phone errors
      if (phone && this.hasCommonPhoneOCRErrors(phone)) {
        warnings.push(`Phone number ${index + 1} may contain OCR errors`);
        suggestions.push('Common phone OCR errors: "S" → "5", "O" → "0", "I" → "1"');
      }
    });

    // Assess phone reliability
    if (phoneConfidence > 80 && hasValidPhone) {
      reliability.phone = 'high';
    } else if (phoneConfidence > 60 && hasValidPhone) {
      reliability.phone = 'medium';
      warnings.push(`Phone field has moderate confidence (${phoneConfidence}%). Please verify numbers.`);
    } else {
      reliability.phone = 'low';
      warnings.push(`Phone field has low confidence (${phoneConfidence}%). Please check all digits.`);
    }

    if (!hasValidPhone) {
      errors.push('At least one valid phone number is required');
    }
  }

  private validateWebsite(
    contact: OCRContactData,
    errors: string[],
    warnings: string[],
    suggestions: string[],
    reliability: Record<string, 'high' | 'medium' | 'low'>
  ) {
    if (!contact.website) return;

    const websiteConfidence = contact.fieldConfidences.website || 0;

    // Basic URL validation
    if (!this.urlRegex.test(contact.website) && !this.isValidDomain(contact.website)) {
      warnings.push('Website URL format may be incorrect');
      reliability.website = 'low';
    } else {
      // Assess website reliability
      if (websiteConfidence > 80) {
        reliability.website = 'high';
      } else if (websiteConfidence > 60) {
        reliability.website = 'medium';
        warnings.push(`Website field has moderate confidence (${websiteConfidence}%). Please verify URL.`);
      } else {
        reliability.website = 'low';
        warnings.push(`Website field has low confidence (${websiteConfidence}%). Please check spelling.`);
      }
    }

    // Check for common website OCR errors
    if (this.hasCommonWebsiteOCRErrors(contact.website)) {
      warnings.push('Website URL may contain OCR errors');
      suggestions.push('Common website OCR errors: "rn" → "m", "." → ",", "0" → "o"');
    }
  }

  private validateOrganizationAndTitle(
    contact: OCRContactData,
    errors: string[],
    warnings: string[],
    suggestions: string[],
    reliability: Record<string, 'high' | 'medium' | 'low'>
  ) {
    // Validate organization
    if (contact.organization) {
      const orgConfidence = contact.fieldConfidences.organization || 0;
      
      if (orgConfidence > 75) {
        reliability.organization = 'high';
      } else if (orgConfidence > 50) {
        reliability.organization = 'medium';
        warnings.push(`Organization field has moderate confidence (${orgConfidence}%).`);
      } else {
        reliability.organization = 'low';
        warnings.push(`Organization field has low confidence (${orgConfidence}%).`);
      }
    }

    // Validate title
    if (contact.title) {
      const titleConfidence = contact.fieldConfidences.title || 0;
      
      if (titleConfidence > 75) {
        reliability.title = 'high';
      } else if (titleConfidence > 50) {
        reliability.title = 'medium';
        warnings.push(`Title field has moderate confidence (${titleConfidence}%).`);
      } else {
        reliability.title = 'low';
        warnings.push(`Title field has low confidence (${titleConfidence}%).`);
      }
    }
  }

  private performCrossFieldValidation(
    contact: OCRContactData,
    warnings: string[],
    suggestions: string[]
  ) {
    // Check if email domain matches organization
    if (contact.email && contact.organization) {
      const emailDomain = contact.email.split('@')[1]?.toLowerCase();
      const orgName = contact.organization.toLowerCase().replace(/[^a-z0-9]/g, '');
      
      if (emailDomain && !emailDomain.includes(orgName.substring(0, 6))) {
        suggestions.push('Email domain doesn\'t match organization - verify both are correct');
      }
    }

    // Check name consistency
    if (contact.name && contact.firstName && contact.lastName) {
      const fullNameFromParts = `${contact.firstName} ${contact.lastName}`.trim();
      if (contact.name.toLowerCase() !== fullNameFromParts.toLowerCase()) {
        warnings.push('Name field inconsistent with first/last name fields');
        suggestions.push('Choose either full name OR first/last name fields, not both');
      }
    }
  }

  private suggestAlternatives(contact: OCRContactData, suggestions: string[]) {
    if (contact.alternativeValues) {
      Object.entries(contact.alternativeValues).forEach(([field, alternatives]) => {
        if (alternatives.length > 0) {
          suggestions.push(`Alternative ${field} values found: ${alternatives.join(', ')}`);
        }
      });
    }
  }

  // Helper methods for OCR error detection
  private hasCommonOCRErrors(text: string): boolean {
    const suspiciousPatterns = [
      /[0O]{2,}/, // Multiple zeros/Os together
      /[1Il]{2,}/, // Multiple 1/I/l together
      /[rn]/g, // rn that might be m
      /\s{2,}/, // Multiple spaces
      /[^\w\s\-.']/g // Unusual characters for names
    ];
    
    return suspiciousPatterns.some(pattern => pattern.test(text));
  }

  private hasCommonEmailOCRErrors(email: string): boolean {
    return /[rn]n|[cl]d|[0O][a-z]|[@]{2,}|[.]{2,}/.test(email);
  }

  private hasCommonPhoneOCRErrors(phone: string): boolean {
    return /[OS][0-9]|[I1][0-9]|[rn][0-9]/.test(phone);
  }

  private hasCommonWebsiteOCRErrors(website: string): boolean {
    return /[rn]n|[cl]om|[0O][a-z]|[.]{2,}|[,]/.test(website);
  }

  private isValidDomain(domain: string): boolean {
    return /^[a-zA-Z0-9][a-zA-Z0-9-]{1,61}[a-zA-Z0-9]\.[a-zA-Z]{2,}$/.test(domain);
  }
}

export default EnhancedContactValidator; 