import QRCode from 'qrcode';
import { Contact, QRCodeStyle } from '../types';

export interface EmbeddedQRSettings {
  contact: Contact;
  qrStyle: QRCodeStyle;
  backgroundImage?: string;
  messages: {
    message1?: string;
    message2?: string;
  };
  layout?: 'qr-bottom' | 'qr-middle' | 'qr-top' | 'qr-both-bottom';
  textColor?: string;
  font?: string;
  fontSize?: number;
  // Enhanced styling options
  textShadow?: boolean;
  textOutline?: boolean;
  qrBorderRadius?: number;
  qrShadow?: boolean;
  spacing?: {
    margin: number;
    padding: number;
    elementGap: number;
  };
  typography?: {
    messageWeight: 'normal' | 'bold' | 'light';
    nameWeight: 'normal' | 'bold' | 'light';
    letterSpacing: number;
    lineHeight: number;
  };
}

export const generateEmbeddedQRCard = async (settings: EmbeddedQRSettings): Promise<string> => {
  try {
    // Generate QR code first
    const vcard = generateVCard(settings.contact);
    const qrCodeDataUrl = await generateQRCode(vcard, settings.qrStyle);
    
    // Create canvas with phone wallpaper dimensions (1080x1920)
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    
    if (!ctx) {
      throw new Error('Canvas context not available');
    }
    
    // Set canvas dimensions for phone wallpaper
    canvas.width = 1080;
    canvas.height = 1920;
    
    // Fill with clean solid background - NO GRADIENTS
    if (!settings.backgroundImage) {
      ctx.fillStyle = '#ffffff'; // Clean white background
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      
      // Add the QR code and text
      await addQRCodeAndText(ctx, qrCodeDataUrl, settings, canvas.width, canvas.height);
      
      // Convert to blob and resolve
      return new Promise((resolve, reject) => {
        canvas.toBlob((blob) => {
          if (blob) {
            const url = URL.createObjectURL(blob);
            resolve(url);
          } else {
            reject(new Error('Failed to generate embedded QR card'));
          }
        }, 'image/png', 1.0);
      });
      
    } else {
      // Load and process background image
      return new Promise((resolve, reject) => {
        const bgImg = new Image();
        bgImg.crossOrigin = 'anonymous';
        
        bgImg.onload = async () => {
          try {
            // Process and draw background image to fit phone dimensions
            await drawBackgroundImage(ctx, bgImg, canvas.width, canvas.height);
            
            // Add the QR code and text
            await addQRCodeAndText(ctx, qrCodeDataUrl, settings, canvas.width, canvas.height);
            
            // Convert to blob and resolve
            canvas.toBlob((blob) => {
              if (blob) {
                const url = URL.createObjectURL(blob);
                resolve(url);
              } else {
                reject(new Error('Failed to generate embedded QR card'));
              }
            }, 'image/png', 1.0);
            
          } catch (error) {
            reject(error);
          }
        };
        
        bgImg.onerror = () => reject(new Error('Failed to load background image'));
        bgImg.src = settings.backgroundImage!;
      });
    }
    
  } catch (error) {
    console.error('Failed to generate embedded QR card:', error);
    throw new Error('Failed to generate embedded QR card');
  }
};

const drawBackgroundImage = async (
  ctx: CanvasRenderingContext2D, 
  img: HTMLImageElement, 
  canvasWidth: number, 
  canvasHeight: number
): Promise<void> => {
  // Calculate scaling to cover the entire canvas while maintaining aspect ratio
  const scale = Math.max(canvasWidth / img.width, canvasHeight / img.height);
  const scaledWidth = img.width * scale;
  const scaledHeight = img.height * scale;
  
  // Center the image
  const x = (canvasWidth - scaledWidth) / 2;
  const y = (canvasHeight - scaledHeight) / 2;
  
  // Draw the background image
  ctx.drawImage(img, x, y, scaledWidth, scaledHeight);
  
  // Add semi-transparent overlay for better text readability
  ctx.fillStyle = 'rgba(0, 0, 0, 0.3)';
  ctx.fillRect(0, 0, canvasWidth, canvasHeight);
};

const addQRCodeAndText = async (
  ctx: CanvasRenderingContext2D,
  qrCodeDataUrl: string,
  settings: EmbeddedQRSettings,
  canvasWidth: number,
  canvasHeight: number
): Promise<void> => {
  return new Promise((resolve, reject) => {
    const qrImg = new Image();
    qrImg.crossOrigin = 'anonymous';
    
    qrImg.onload = () => {
      try {
        const layout = settings.layout || 'qr-bottom';
        const textColor = settings.textColor || '#ffffff';
        const font = settings.font || 'Inter, system-ui, sans-serif';
        const fontSize = settings.fontSize || 28;
        
        // Enhanced spacing and typography settings with better proportions
        const spacing = settings.spacing || {
          margin: 100,
          padding: 80,
          elementGap: 140
        };
        
        const typography = settings.typography || {
          messageWeight: 'normal',
          nameWeight: 'bold',
          letterSpacing: 1.0,
          lineHeight: 1.5
        };
        
        // Enhanced text properties with professional styling
        ctx.fillStyle = textColor;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        
        // Enhanced shadow and outline effects
        if (settings.textShadow !== false) {
          ctx.shadowColor = 'rgba(0, 0, 0, 0.7)';
          ctx.shadowBlur = 8;
          ctx.shadowOffsetX = 3;
          ctx.shadowOffsetY = 3;
        }
        
        const centerX = canvasWidth / 2;
        
        // Professional spacing with proper margins
        const safeAreaTop = spacing.margin;
        const safeAreaBottom = canvasHeight - spacing.margin;
        const usableHeight = safeAreaBottom - safeAreaTop;
        
        // Define phone screen areas with better spacing
        const topThirdCenter = safeAreaTop + (usableHeight * 0.25);
        const middleThirdCenter = safeAreaTop + (usableHeight * 0.5);
        const bottomThirdCenter = safeAreaTop + (usableHeight * 0.75);
        
        // Professional QR code sizing with better proportions
        const maxQRSize = Math.min(
          canvasWidth * 0.35,  // Reduced to 35% of width for better balance
          usableHeight * 0.25, // Reduced to 25% of usable height
          280  // Smaller absolute maximum for better proportions
        );
        const qrSize = Math.max(maxQRSize, 200); // Minimum size for scannability
        
        switch (layout) {
          case 'qr-top':
            // QR code in top third with enhanced styling
            drawEnhancedQRCode(ctx, qrImg, centerX, topThirdCenter, qrSize, settings);
            
            // Message in middle area with proper spacing
            if (settings.messages.message1) {
              drawEnhancedMessage(
                ctx, 
                settings.messages.message1, 
                centerX, 
                middleThirdCenter, 
                font, 
                fontSize, 
                typography.messageWeight,
                typography.letterSpacing,
                typography.lineHeight,
                settings
              );
            }
            
            // Name with enhanced typography (if enabled)
            if (settings.messages.message2) {
              drawEnhancedName(
                ctx,
                settings.messages.message2,
                centerX,
                bottomThirdCenter,
                font,
                Math.round(fontSize * 0.85),
                typography.nameWeight,
                typography.letterSpacing,
                settings
              );
            }
            break;
            
          case 'qr-middle':
            // Message at top with proper spacing
            if (settings.messages.message1) {
              drawEnhancedMessage(
                ctx, 
                settings.messages.message1, 
                centerX, 
                topThirdCenter, 
                font, 
                fontSize, 
                typography.messageWeight,
                typography.letterSpacing,
                typography.lineHeight,
                settings
              );
            }
            
            // QR code in middle third with enhanced styling
            drawEnhancedQRCode(ctx, qrImg, centerX, middleThirdCenter, qrSize, settings);
            
            // Name at bottom with enhanced typography
            if (settings.messages.message2) {
              drawEnhancedName(
                ctx,
                settings.messages.message2,
                centerX,
                bottomThirdCenter,
                font,
                Math.round(fontSize * 0.85),
                typography.nameWeight,
                typography.letterSpacing,
                settings
              );
            }
            break;
            
          case 'qr-both-bottom': {
            // Both message and QR in bottom area with professional spacing
            const bottomAreaTop = bottomThirdCenter - spacing.elementGap;
            
            if (settings.messages.message1) {
              drawEnhancedMessage(
                ctx, 
                settings.messages.message1, 
                centerX, 
                bottomAreaTop, 
                font, 
                fontSize, 
                typography.messageWeight,
                typography.letterSpacing,
                typography.lineHeight,
                settings
              );
            }
            
            drawEnhancedQRCode(ctx, qrImg, centerX, bottomThirdCenter, qrSize, settings);
            
            // Name below QR with proper spacing
            if (settings.messages.message2) {
              drawEnhancedName(
                ctx,
                settings.messages.message2,
                centerX,
                bottomThirdCenter + spacing.elementGap / 2,
                font,
                Math.round(fontSize * 0.75),
                typography.nameWeight,
                typography.letterSpacing,
                settings
              );
            }
            break;
          }
            
          case 'qr-bottom':
          default:
            // Message at top with professional spacing
            if (settings.messages.message1) {
              drawEnhancedMessage(
                ctx, 
                settings.messages.message1, 
                centerX, 
                topThirdCenter, 
                font, 
                fontSize, 
                typography.messageWeight,
                typography.letterSpacing,
                typography.lineHeight,
                settings
              );
            }
            
            // Name in middle with enhanced typography
            if (settings.messages.message2) {
              drawEnhancedName(
                ctx,
                settings.messages.message2,
                centerX,
                middleThirdCenter,
                font,
                Math.round(fontSize * 1.1),
                typography.nameWeight,
                typography.letterSpacing,
                settings
              );
            }
            
            // QR code in bottom third with enhanced styling
            drawEnhancedQRCode(ctx, qrImg, centerX, bottomThirdCenter, qrSize, settings);
            break;
        }
        
        resolve();
      } catch (error) {
        reject(error);
      }
    };
    
    qrImg.onerror = () => reject(new Error('Failed to load QR code image'));
    qrImg.src = qrCodeDataUrl;
  });
};

// Enhanced QR code drawing with professional styling
const drawEnhancedQRCode = (
  ctx: CanvasRenderingContext2D,
  qrImg: HTMLImageElement,
  x: number,
  y: number,
  size: number,
  settings: EmbeddedQRSettings
): void => {
  const qrX = x - size / 2;
  const qrY = y - size / 2;
  
  // Add shadow effect if enabled
  if (settings.qrShadow !== false) {
    ctx.save();
    ctx.shadowColor = 'rgba(0, 0, 0, 0.3)';
    ctx.shadowBlur = 20;
    ctx.shadowOffsetX = 0;
    ctx.shadowOffsetY = 8;
    
    // Draw shadow background
    ctx.fillStyle = 'rgba(0, 0, 0, 0.1)';
    if (settings.qrBorderRadius && settings.qrBorderRadius > 0) {
      drawRoundedRect(ctx, qrX, qrY, size, size, settings.qrBorderRadius);
      ctx.fill();
    } else {
      ctx.fillRect(qrX, qrY, size, size);
    }
    
    ctx.restore();
  }
  
  // Draw QR code with optional border radius
  if (settings.qrBorderRadius && settings.qrBorderRadius > 0) {
    ctx.save();
    drawRoundedRect(ctx, qrX, qrY, size, size, settings.qrBorderRadius);
    ctx.clip();
  }
  
  // Draw the QR code image
  ctx.drawImage(qrImg, qrX, qrY, size, size);
  
  if (settings.qrBorderRadius && settings.qrBorderRadius > 0) {
    ctx.restore();
  }
};

// Enhanced message drawing with professional typography
const drawEnhancedMessage = (
  ctx: CanvasRenderingContext2D,
  message: string,
  x: number,
  y: number,
  font: string,
  fontSize: number,
  fontWeight: string,
  letterSpacing: number,
  lineHeight: number,
  settings: EmbeddedQRSettings
): void => {
  // Set enhanced typography
  ctx.font = `${fontWeight} ${fontSize}px ${font}`;
  
  // Apply letter spacing (approximate with manual character spacing)
  const maxWidth = Math.min(800, x * 1.6); // Responsive width based on canvas size
  const words = message.split(' ');
  let line = '';
  let currentY = y;
  const lineSpacing = fontSize * lineHeight;
  
  // Add text outline effect if enabled
  if (settings.textOutline) {
    ctx.save();
    ctx.strokeStyle = 'rgba(0, 0, 0, 0.8)';
    ctx.lineWidth = 3;
    ctx.lineJoin = 'round';
    ctx.miterLimit = 2;
  }
  
  for (const word of words) {
    const testLine = line + word + ' ';
    const metrics = ctx.measureText(testLine);
    
    if (metrics.width > maxWidth && line !== '') {
      // Draw the line with enhanced styling
      if (settings.textOutline) {
        ctx.strokeText(line.trim(), x, currentY);
      }
      ctx.fillText(line.trim(), x, currentY);
      
      line = word + ' ';
      currentY += lineSpacing;
    } else {
      line = testLine;
    }
  }
  
  if (line.trim()) {
    if (settings.textOutline) {
      ctx.strokeText(line.trim(), x, currentY);
    }
    ctx.fillText(line.trim(), x, currentY);
  }
  
  if (settings.textOutline) {
    ctx.restore();
  }
};

// Enhanced name drawing with professional styling
const drawEnhancedName = (
  ctx: CanvasRenderingContext2D,
  name: string,
  x: number,
  y: number,
  font: string,
  fontSize: number,
  fontWeight: string,
  letterSpacing: number,
  settings: EmbeddedQRSettings
): void => {
  ctx.save();
  
  // Set enhanced typography for names
  ctx.font = `${fontWeight} ${fontSize}px ${font}`;
  
  // Add text outline effect if enabled
  if (settings.textOutline) {
    ctx.strokeStyle = 'rgba(0, 0, 0, 0.8)';
    ctx.lineWidth = 2;
    ctx.lineJoin = 'round';
    ctx.miterLimit = 2;
    ctx.strokeText(name, x, y);
  }
  
  // Draw the name
  ctx.fillText(name, x, y);
  
  ctx.restore();
};

// Helper function to draw rounded rectangles
const drawRoundedRect = (
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  width: number,
  height: number,
  radius: number
): void => {
  ctx.beginPath();
  ctx.moveTo(x + radius, y);
  ctx.lineTo(x + width - radius, y);
  ctx.quadraticCurveTo(x + width, y, x + width, y + radius);
  ctx.lineTo(x + width, y + height - radius);
  ctx.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
  ctx.lineTo(x + radius, y + height);
  ctx.quadraticCurveTo(x, y + height, x, y + height - radius);
  ctx.lineTo(x, y + radius);
  ctx.quadraticCurveTo(x, y, x + radius, y);
  ctx.closePath();
};

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

const generateQRCode = async (vcard: string, style: QRCodeStyle): Promise<string> => {
  const options = {
    width: 512,
    margin: 2,
    color: {
      dark: style.foregroundColor,
      light: style.transparent ? '#ffffff00' : style.backgroundColor,
    },
    errorCorrectionLevel: 'M' as const,
  };

  try {
    return await QRCode.toDataURL(vcard, options);
  } catch (error) {
    console.error('QR Code generation failed:', error);
    throw new Error('Failed to generate QR code');
  }
};

export const processBackgroundImage = async (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    // Support up to 4000x6000 images as requested
    const maxFileSize = 50 * 1024 * 1024; // 50MB max file size
    
    if (file.size > maxFileSize) {
      reject(new Error('Image file size must be less than 50MB'));
      return;
    }
    
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const img = new Image();

    img.onload = () => {
      // Support up to 4000x6000 as requested, but resize if larger
      const maxWidth = 4000;
      const maxHeight = 6000;
      let { width, height } = img;

      if (width > maxWidth || height > maxHeight) {
        const ratio = Math.min(maxWidth / width, maxHeight / height);
        width *= ratio;
        height *= ratio;
      }

      canvas.width = width;
      canvas.height = height;

      if (ctx) {
        // Fill with white background first
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        // Draw the processed image
        ctx.drawImage(img, 0, 0, width, height);
      }

      canvas.toBlob((blob) => {
        if (blob) {
          const url = URL.createObjectURL(blob);
          resolve(url);
        } else {
          reject(new Error('Failed to process background image'));
        }
      }, 'image/jpeg', 0.95);
    };

    img.onerror = () => reject(new Error('Failed to load image'));
    img.src = URL.createObjectURL(file);
  });
}; 