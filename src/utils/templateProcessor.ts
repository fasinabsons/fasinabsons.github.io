import { Contact, TemplateStyle, CardSettings } from '../types';

export const TEMPLATE_STYLES: TemplateStyle[] = [
  {
    id: 1,
    name: 'Center Balance',
    description: 'QR code positioned in the center of screen with text above and below',
    layout: 'qr-center-balanced',
    preview: 'Perfect for wallpapers - QR in middle, messages balanced around it'
  },
  {
    id: 2,
    name: 'Top Placement',
    description: 'QR code placed at the top third with messages flowing below',
    layout: 'qr-top-executive',
    preview: 'Great for quick scanning - QR at top, text content below'
  },
  {
    id: 3,
    name: 'Bottom Placement',
    description: 'QR code positioned at bottom third with messages above',
    layout: 'qr-bottom-corporate',
    preview: 'Message-first design - text at top, QR at bottom for easy access'
  },
  {
    id: 4,
    name: 'Mobile Optimized',
    description: 'QR code placed in thumb-reach zone (lower center) for mobile use',
    layout: 'qr-mobile-portrait',
    preview: 'Perfect for phone wallpapers - QR where your thumb naturally reaches'
  },
  {
    id: 5,
    name: 'Side by Side',
    description: 'QR code on left side with text content arranged on the right',
    layout: 'qr-landscape-pro',
    preview: 'Horizontal layout - QR left, text right, ideal for landscape viewing'
  },
  {
    id: 6,
    name: 'Compact Top',
    description: 'Small QR code at top with compact text layout below',
    layout: 'qr-minimal-elite',
    preview: 'Space-efficient - small QR at top, minimal text below'
  }
];

export const DEFAULT_FONTS = [
  'Inter',
  'SF Pro Display',
  'Helvetica Neue',
  'Roboto',
  'Open Sans',
  'Lato',
  'Montserrat',
  'Poppins',
  'Source Sans Pro',
  'Nunito'
];

// Professional image processing without gradients
export const processBackgroundImage = async (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const img = new Image();

    img.onload = () => {
      // Professional mobile wallpaper resolution (optimized for modern devices)
      canvas.width = 1440;
      canvas.height = 3200;

      if (ctx) {
        // Clear canvas with transparent background - NO GRADIENTS
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        // Professional scaling algorithm for optimal image quality
        const scaleX = canvas.width / img.width;
        const scaleY = canvas.height / img.height;
        const scale = Math.max(scaleX, scaleY); // Cover entire canvas

        const scaledWidth = img.width * scale;
        const scaledHeight = img.height * scale;

        // Perfect centering with mathematical precision
        const offsetX = (canvas.width - scaledWidth) / 2;
        const offsetY = (canvas.height - scaledHeight) / 2;

        // High-quality image rendering
        ctx.imageSmoothingEnabled = true;
        ctx.imageSmoothingQuality = 'high';
        ctx.drawImage(img, offsetX, offsetY, scaledWidth, scaledHeight);
      }

      // Export with maximum quality
      canvas.toBlob((blob) => {
        if (blob) {
          resolve(URL.createObjectURL(blob));
        } else {
          reject(new Error('Failed to process background image'));
        }
      }, 'image/png', 1.0);
    };

    img.onerror = () => reject(new Error('Failed to load background image'));
    img.src = URL.createObjectURL(file);
  });
};

// Expert-level template card generation with 30 years of professional experience
export const generateTemplateCard = async (
  _contact: Contact,
  qrCodeUrl: string,
  settings: CardSettings
): Promise<string> => {
  return new Promise((resolve, reject) => {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    
    // Professional mobile wallpaper dimensions
    canvas.width = 1440;
    canvas.height = 3200;

    if (!ctx) {
      reject(new Error('Canvas context unavailable'));
      return;
    }

    const qrImg = new Image();
    qrImg.crossOrigin = 'anonymous';
    
    qrImg.onload = async () => {
      try {
        // Step 1: Render clean background (NO GRADIENTS)
        await renderCleanBackground(ctx, settings);
        
        // Step 2: Calculate professional layout with mathematical precision
        const layout = calculateProfessionalLayout(settings, canvas.width, canvas.height);
        
        // Step 3: Render QR code with professional styling
        renderProfessionalQRCode(ctx, qrImg, layout.qr);
        
        // Step 4: Render text with expert typography and spacing
        renderExpertText(ctx, settings, layout.text);
        
        // Step 5: Export with maximum quality
        setTimeout(() => {
          canvas.toBlob((blob) => {
            if (blob) {
              resolve(URL.createObjectURL(blob));
            } else {
              reject(new Error('Failed to generate template card'));
            }
          }, 'image/png', 1.0);
        }, 100);
        
      } catch (error) {
        reject(error);
      }
    };

    qrImg.onerror = () => reject(new Error('Failed to load QR code'));
    qrImg.src = qrCodeUrl;
  });
};

// Clean background rendering - NO GRADIENTS EVER
const renderCleanBackground = async (
  ctx: CanvasRenderingContext2D, 
  settings: CardSettings
): Promise<void> => {
  const canvas = ctx.canvas;
  
  if (settings.backgroundImage) {
    try {
      const bgImg = new Image();
      bgImg.crossOrigin = 'anonymous';
      
              await new Promise<void>((resolve) => {
          bgImg.onload = () => {
            // Professional image rendering with high quality
            ctx.imageSmoothingEnabled = true;
            ctx.imageSmoothingQuality = 'high';
            ctx.drawImage(bgImg, 0, 0, canvas.width, canvas.height);
            resolve();
          };
          bgImg.onerror = () => {
            // Fallback to solid color - NO GRADIENT
            renderSolidBackground(ctx, settings.backgroundColor || '#ffffff');
            resolve();
          };
          bgImg.src = settings.backgroundImage;
        });
    } catch {
      renderSolidBackground(ctx, settings.backgroundColor || '#ffffff');
    }
  } else {
    renderSolidBackground(ctx, settings.backgroundColor || '#ffffff');
  }
};

// Solid background only - professional and clean
const renderSolidBackground = (ctx: CanvasRenderingContext2D, color: string): void => {
  ctx.fillStyle = color;
  ctx.fillRect(0, 0, ctx.canvas.width, ctx.canvas.height);
};

// Professional layout calculation with 30 years of expertise
const calculateProfessionalLayout = (
  settings: CardSettings, 
  canvasWidth: number, 
  canvasHeight: number
) => {
  const layout = settings.layout?.layout || settings.template?.layout || 'qr-center-balanced';
  
  // Professional spacing constants with closer text positioning for better appearance
  const GOLDEN_RATIO = 1.618;
  const QR_SIZE_BASE = Math.floor(canvasWidth * (settings.layout?.qrSize || 35) / 100);
  const CLOSE_TEXT_SPACING = 24; // 6px scaled for high-res - closer for professional look
  
  // Center coordinates
  const centerX = canvasWidth / 2;
  const centerY = canvasHeight / 2;
  
  let qrLayout: { x: number; y: number; size: number };
  let textLayout: { 
    primary: { x: number; y: number; maxWidth: number };
    secondary: { x: number; y: number; maxWidth: number };
  };

  switch (layout) {
    case 'qr-center-balanced':
      qrLayout = {
        x: centerX,
        y: centerY,
        size: QR_SIZE_BASE
      };
      textLayout = {
        primary: {
          x: centerX,
          y: centerY - QR_SIZE_BASE / 2 - CLOSE_TEXT_SPACING,
          maxWidth: canvasWidth * 0.85
        },
        secondary: {
          x: centerX,
          y: centerY + QR_SIZE_BASE / 2 + CLOSE_TEXT_SPACING,
          maxWidth: canvasWidth * 0.85
        }
      };
      break;

    case 'qr-top-executive': {
      const topY = canvasHeight / GOLDEN_RATIO - canvasHeight * 0.4;
      qrLayout = {
        x: centerX,
        y: topY,
        size: QR_SIZE_BASE
      };
      textLayout = {
        primary: {
          x: centerX,
          y: topY + QR_SIZE_BASE / 2 + CLOSE_TEXT_SPACING,
          maxWidth: canvasWidth * 0.9
        },
        secondary: {
          x: centerX,
          y: topY + QR_SIZE_BASE / 2 + CLOSE_TEXT_SPACING * 2,
          maxWidth: canvasWidth * 0.85
        }
      };
      break;
    }

    case 'qr-bottom-corporate': {
      const bottomY = canvasHeight - canvasHeight / GOLDEN_RATIO + canvasHeight * 0.1;
      qrLayout = {
        x: centerX,
        y: bottomY,
        size: QR_SIZE_BASE
      };
      textLayout = {
        primary: {
          x: centerX,
          y: bottomY - QR_SIZE_BASE / 2 - CLOSE_TEXT_SPACING * 2,
          maxWidth: canvasWidth * 0.9
        },
        secondary: {
          x: centerX,
          y: bottomY - QR_SIZE_BASE / 2 - CLOSE_TEXT_SPACING,
          maxWidth: canvasWidth * 0.85
        }
      };
      break;
    }

    case 'qr-mobile-portrait': {
      // Optimized for thumb reach on mobile devices
      const mobileY = canvasHeight * 0.65; // Easy thumb access
      qrLayout = {
        x: centerX,
        y: mobileY,
        size: Math.floor(QR_SIZE_BASE * 1.1) // Slightly larger for mobile
      };
      textLayout = {
        primary: {
          x: centerX,
          y: canvasHeight * 0.3,
          maxWidth: canvasWidth * 0.88
        },
        secondary: {
          x: centerX,
          y: canvasHeight * 0.85,
          maxWidth: canvasWidth * 0.82
        }
      };
      break;
    }

    case 'qr-landscape-pro':
      qrLayout = {
        x: canvasWidth * 0.3,
        y: centerY,
        size: Math.floor(QR_SIZE_BASE * 0.85)
      };
      textLayout = {
        primary: {
          x: canvasWidth * 0.65,
          y: centerY - CLOSE_TEXT_SPACING,
          maxWidth: canvasWidth * 0.45
        },
        secondary: {
          x: canvasWidth * 0.65,
          y: centerY + CLOSE_TEXT_SPACING,
          maxWidth: canvasWidth * 0.42
        }
      };
      break;

    case 'qr-minimal-elite':
      qrLayout = {
        x: centerX,
        y: canvasHeight * 0.25,
        size: Math.floor(QR_SIZE_BASE * 0.9)
      };
      textLayout = {
        primary: {
          x: centerX,
          y: canvasHeight * 0.5,
          maxWidth: canvasWidth * 0.8
        },
        secondary: {
          x: centerX,
          y: canvasHeight * 0.65,
          maxWidth: canvasWidth * 0.75
        }
      };
      break;

    default:
      // Fallback to center balanced
      qrLayout = {
        x: centerX,
        y: centerY,
        size: QR_SIZE_BASE
      };
      textLayout = {
        primary: {
          x: centerX,
          y: centerY - QR_SIZE_BASE / 2 - CLOSE_TEXT_SPACING,
          maxWidth: canvasWidth * 0.85
        },
        secondary: {
          x: centerX,
          y: centerY + QR_SIZE_BASE / 2 + CLOSE_TEXT_SPACING,
          maxWidth: canvasWidth * 0.85
        }
      };
  }

  return { qr: qrLayout, text: textLayout };
};

// Professional QR code rendering with expert styling
const renderProfessionalQRCode = (
  ctx: CanvasRenderingContext2D,
  qrImg: HTMLImageElement,
  layout: { x: number; y: number; size: number }
): void => {
  // Professional drop shadow for QR code visibility
  ctx.save();
  ctx.shadowColor = 'rgba(0, 0, 0, 0.15)';
  ctx.shadowBlur = 20;
  ctx.shadowOffsetX = 0;
  ctx.shadowOffsetY = 8;
  
  // White background for QR code with rounded corners
  const padding = 24;
  const bgX = layout.x - layout.size / 2 - padding;
  const bgY = layout.y - layout.size / 2 - padding;
  const bgSize = layout.size + padding * 2;
  
  ctx.fillStyle = 'rgba(255, 255, 255, 0.98)';
  ctx.beginPath();
  ctx.roundRect(bgX, bgY, bgSize, bgSize, 16);
  ctx.fill();
  
  ctx.restore();
  
  // Render QR code with high quality
  ctx.imageSmoothingEnabled = false; // Crisp QR code
  ctx.drawImage(
    qrImg,
    layout.x - layout.size / 2,
    layout.y - layout.size / 2,
    layout.size,
    layout.size
  );
};

// Expert text rendering with professional typography
const renderExpertText = (
  ctx: CanvasRenderingContext2D,
  settings: CardSettings,
  textLayout: {
    primary: { x: number; y: number; maxWidth: number };
    secondary: { x: number; y: number; maxWidth: number };
  }
): void => {
  if (!settings.messages.enabled) return;
  
  // Professional text rendering setup
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  
  // Text shadow for better readability
  ctx.shadowColor = 'rgba(0, 0, 0, 0.4)';
  ctx.shadowBlur = 8;
  ctx.shadowOffsetX = 2;
  ctx.shadowOffsetY = 2;
  
  // Primary message with expert typography
  if (settings.messages.text1?.trim()) {
    renderProfessionalMessage(
      ctx,
      settings.messages.text1,
      textLayout.primary,
      {
        fontSize: 64,
        fontWeight: 'bold',
        color: settings.textColor || '#000000',
        font: settings.font || 'Inter',
        lineHeight: 1.3
      }
    );
  }
  
  // Secondary message with complementary styling
  if (settings.messages.text2?.trim()) {
    renderProfessionalMessage(
      ctx,
      settings.messages.text2,
      textLayout.secondary,
      {
        fontSize: 52,
        fontWeight: '500',
        color: adjustColorOpacity(settings.textColor || '#000000', 0.85),
        font: settings.font || 'Inter',
        lineHeight: 1.4
      }
    );
  }
  
  // Reset shadow
  ctx.shadowColor = 'transparent';
};

// Professional message rendering with intelligent word wrapping
const renderProfessionalMessage = (
  ctx: CanvasRenderingContext2D,
  message: string,
  layout: { x: number; y: number; maxWidth: number },
  style: {
    fontSize: number;
    fontWeight: string;
    color: string;
    font: string;
    lineHeight: number;
  }
): void => {
  if (!message.trim()) return;
  
  // Set font with professional styling
  ctx.font = `${style.fontWeight} ${style.fontSize}px ${style.font}`;
  ctx.fillStyle = style.color;
  
  // Intelligent word wrapping with optimal line breaks
  const words = message.split(' ');
  const lines: string[] = [];
  let currentLine = '';
  
  for (const word of words) {
    const testLine = currentLine + (currentLine ? ' ' : '') + word;
    const metrics = ctx.measureText(testLine);
    
    if (metrics.width > layout.maxWidth && currentLine) {
      lines.push(currentLine);
      currentLine = word;
    } else {
      currentLine = testLine;
    }
  }
  
  if (currentLine) {
    lines.push(currentLine);
  }
  
  // Professional vertical centering
  const lineHeight = style.fontSize * style.lineHeight;
  const totalHeight = lines.length * lineHeight;
  const startY = layout.y - (totalHeight / 2) + (lineHeight / 2);
  
  // Render each line with perfect spacing
  lines.forEach((line, index) => {
    const y = startY + (index * lineHeight);
    ctx.fillText(line, layout.x, y);
  });
};

// Utility function to adjust color opacity
const adjustColorOpacity = (color: string, opacity: number): string => {
  if (color.startsWith('#')) {
    const alpha = Math.round(opacity * 255).toString(16).padStart(2, '0');
    return color + alpha;
  }
  return color;
};

// Professional font loading
export const loadCustomFont = async (file: File): Promise<string> => {
  try {
    const fontName = `CustomFont_${Date.now()}`;
    const arrayBuffer = await file.arrayBuffer();
    const fontFace = new FontFace(fontName, arrayBuffer);
    
    await fontFace.load();
    document.fonts.add(fontFace);
    await document.fonts.ready;
    
    return fontName;
  } catch (error) {
    console.error('Font loading failed:', error);
    throw new Error('Failed to load font. Please ensure it\'s a valid font format.');
  }
};

// Professional validation
export const validateQRSettings = (settings: CardSettings): string[] => {
  const errors: string[] = [];
  
  if (settings.messages.enabled) {
    if (!settings.messages.text1?.trim() && !settings.messages.text2?.trim()) {
      errors.push('At least one message is required when messages are enabled');
    }
  }
  
  if (!settings.textColor || !isValidColor(settings.textColor)) {
    errors.push('Valid text color is required');
  }
  
  return errors;
};

export const isValidColor = (color: string): boolean => {
  const div = document.createElement('div');
  div.style.color = color;
  return div.style.color !== '';
};

// Mobile wallpaper optimization
export const optimizeForMobileWallpaper = (settings: CardSettings): CardSettings => {
  return {
    ...settings,
    layout: {
      ...settings.layout,
      qrSize: Math.max(settings.layout?.qrSize || 35, 30),
      textSpacing: Math.max(settings.layout?.textSpacing || 15, 12),
    },
    font: settings.font || 'Inter',
  };
};