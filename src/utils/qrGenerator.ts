import QRCode from 'qrcode';
import { Contact, QRCodeStyle } from '../types';

export const generateVCard = (contact: Contact): string => {
  // Build proper name components for vCard N field: Last;First;Middle;Prefix;Suffix
  const nameComponents = [
    contact.lastName || '',
    contact.firstName || '',
    '', // Middle name (not captured)
    contact.prefix || '',
    contact.suffix || ''
  ];
  
  // Build full formatted name properly without duplication
  let fullName = '';
  if (contact.name && contact.name.trim()) {
    // If we have a complete name, use it as is
    fullName = contact.name.trim();
  } else {
    // Build name from components
    const nameParts = [];
    if (contact.prefix) nameParts.push(contact.prefix);
    if (contact.firstName) nameParts.push(contact.firstName);
    if (contact.lastName) nameParts.push(contact.lastName);
    if (contact.suffix) nameParts.push(contact.suffix);
    fullName = nameParts.join(' ').trim();
  }

  const vcard = [
    'BEGIN:VCARD',
    'VERSION:3.0',
    `FN:${fullName}`,
    `N:${nameComponents.join(';')}`,
    contact.email ? `EMAIL:${contact.email}` : '',
    
    // Phone numbers with proper types
    contact.mobilePhone ? `TEL;TYPE=CELL:${contact.mobilePhone}` : '',
    contact.workPhone ? `TEL;TYPE=WORK:${contact.workPhone}` : '',
    contact.homePhone ? `TEL;TYPE=HOME:${contact.homePhone}` : '',
    contact.faxPhone ? `TEL;TYPE=FAX:${contact.faxPhone}` : '',
    // Fallback main phone if no specific types
    (!contact.mobilePhone && !contact.workPhone && !contact.homePhone && contact.phone) ? `TEL:${contact.phone}` : '',
    
    // Organization and title
    contact.organization ? `ORG:${contact.organization}${contact.department ? ';' + contact.department : ''}` : '',
    contact.title ? `TITLE:${contact.title}` : '',
    
    // Address - proper vCard ADR format: ;;Street;City;State;Postal;Country
    contact.address || (contact.street || contact.city || contact.state || contact.zipcode || contact.country) ? 
      `ADR:;;${contact.street || ''};${contact.city || ''};${contact.state || ''};${contact.zipcode || ''};${contact.country || ''}` : '',
    
    // Web presence
    contact.website ? `URL:${contact.website}` : '',
    
    // Custom messages as notes
    contact.message1 ? `NOTE:${contact.message1}${contact.message2 ? ' | ' + contact.message2 : ''}` : 
      (contact.message2 ? `NOTE:${contact.message2}` : ''),
    
    // Additional notes
    contact.notes ? `NOTE:${contact.notes}` : '',
    
    'END:VCARD'
  ].filter(Boolean).join('\n');

  return vcard;
};

export const generateQRCode = async (
  vcard: string, 
  style: QRCodeStyle,
  size: number = 256, // Default to preview size
  addQuietZone: boolean = true // Add quiet zone for better scanning
): Promise<string> => {
  try {
    // Generate QR code with higher error correction for better scanning
    const qrMatrix = await QRCode.create(vcard, {
      errorCorrectionLevel: 'H' // High error correction for better scanning
    });

    // Create canvas for custom rendering
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    if (!ctx) throw new Error('Canvas not supported');

    const modules = qrMatrix.modules;
    const moduleCount = modules.size;
    
    // Calculate sizes with quiet zone
    const quietZoneSize = addQuietZone ? Math.max(4, Math.floor(moduleCount * 0.1)) : 0;
    const totalModules = moduleCount + (quietZoneSize * 2);
    const moduleSize = size / totalModules;
    const offset = quietZoneSize * moduleSize;

    canvas.width = size;
    canvas.height = size;

    // Clear canvas with background (including quiet zone)
    ctx.fillStyle = style.transparent ? 'transparent' : style.backgroundColor;
    ctx.fillRect(0, 0, size, size);

    // Draw QR modules
    for (let row = 0; row < moduleCount; row++) {
      for (let col = 0; col < moduleCount; col++) {
        if (modules.get(row, col)) {
          const x = offset + (col * moduleSize);
          const y = offset + (row * moduleSize);
          
          if (style.gradient) {
            // Create gradient for each module
            const gradient = ctx.createLinearGradient(x, y, x + moduleSize, y + moduleSize);
            gradient.addColorStop(0, style.foregroundColor);
            gradient.addColorStop(1, style.gradientColor);
            ctx.fillStyle = gradient;
          } else {
            ctx.fillStyle = style.foregroundColor;
          }
          
          // Draw module - avoid border radius on individual modules for better scanning
          ctx.fillRect(x, y, moduleSize, moduleSize);
        }
      }
    }

    // Apply overall border radius only to the background, not affecting QR scanning
    if (style.borderRadius > 0) {
      const finalCanvas = document.createElement('canvas');
      const finalCtx = finalCanvas.getContext('2d');
      if (!finalCtx) throw new Error('Canvas not supported');

      finalCanvas.width = size;
      finalCanvas.height = size;

      // Fill background with rounded corners
      finalCtx.fillStyle = style.transparent ? 'transparent' : style.backgroundColor;
      finalCtx.beginPath();
      finalCtx.roundRect(0, 0, size, size, style.borderRadius);
      finalCtx.fill();

      // Draw QR code on top (without clipping to preserve scanning)
      finalCtx.drawImage(canvas, 0, 0);

      return finalCanvas.toDataURL('image/png');
    }

    return canvas.toDataURL('image/png');
  } catch (error) {
    console.error('QR Code generation failed:', error);
    throw new Error('Failed to generate QR code');
  }
};

export const createVCardBlob = (vcard: string): Blob => {
  return new Blob([vcard], { type: 'text/vcard;charset=utf-8' });
};

export const sanitizeFilename = (name: string): string => {
  return name
    .replace(/[^a-zA-Z0-9\s-]/g, '')
    .replace(/\s+/g, '_')
    .trim();
};

export const validateContact = (contact: Contact): string[] => {
  const errors: string[] = [];
  
  if (!contact.name.trim()) {
    errors.push('Name is required');
  }
  
  if (!contact.email.trim() && !contact.phone.trim()) {
    errors.push('Either email or phone is required');
  }
  
  if (contact.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(contact.email)) {
    errors.push('Invalid email format');
  }
  
  if (contact.message1 && contact.message1.length > 100) {
    errors.push('Message 1 must be under 100 characters');
  }
  
  if (contact.message2 && contact.message2.length > 100) {
    errors.push('Message 2 must be under 100 characters');
  }
  
  return errors;
};

export const checkColorContrast = (foreground: string, background: string): number => {
  const getLuminance = (color: string) => {
    const rgb = parseInt(color.slice(1), 16);
    const r = (rgb >> 16) & 0xff;
    const g = (rgb >> 8) & 0xff;
    const b = (rgb >> 0) & 0xff;
    
    const [rs, gs, bs] = [r, g, b].map(c => {
      c = c / 255;
      return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
    });
    
    return 0.2126 * rs + 0.7152 * gs + 0.0722 * bs;
  };
  
  const l1 = getLuminance(foreground);
  const l2 = getLuminance(background);
  
  return (Math.max(l1, l2) + 0.05) / (Math.min(l1, l2) + 0.05);
};