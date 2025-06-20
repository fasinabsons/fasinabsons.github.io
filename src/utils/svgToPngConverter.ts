// SVG to PNG Converter Utility
// This utility converts lightweight SVG templates to PNG format when needed

export interface SVGTemplate {
  id: string;
  name: string;
  svgContent: string;
  category: 'gradient' | 'pattern' | 'minimal' | 'textured';
}

// Lightweight SVG templates (much smaller than PNG files)
export const svgTemplates: SVGTemplate[] = [
  {
    id: '01',
    name: 'Ocean Gradient',
    category: 'gradient',
    svgContent: `
      <svg viewBox="0 0 1440 2560" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <linearGradient id="oceanGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" style="stop-color:#1e3c72;stop-opacity:1" />
            <stop offset="50%" style="stop-color:#2a5298;stop-opacity:1" />
            <stop offset="100%" style="stop-color:#3b82f6;stop-opacity:1" />
          </linearGradient>
          <pattern id="waves" x="0" y="0" width="100" height="50" patternUnits="userSpaceOnUse">
            <path d="M0,25 Q25,0 50,25 T100,25" stroke="rgba(255,255,255,0.1)" stroke-width="2" fill="none"/>
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#oceanGrad)"/>
        <rect width="100%" height="100%" fill="url(#waves)"/>
      </svg>
    `
  },
  {
    id: '02',
    name: 'Sunset Vibes',
    category: 'gradient',
    svgContent: `
      <svg viewBox="0 0 1440 2560" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <linearGradient id="sunsetGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" style="stop-color:#ff7e5f;stop-opacity:1" />
            <stop offset="50%" style="stop-color:#feb47b;stop-opacity:1" />
            <stop offset="100%" style="stop-color:#ff6b6b;stop-opacity:1" />
          </linearGradient>
          <circle cx="1200" cy="400" r="150" fill="rgba(255,255,255,0.2)"/>
          <circle cx="1180" cy="380" r="120" fill="rgba(255,255,255,0.1)"/>
        </defs>
        <rect width="100%" height="100%" fill="url(#sunsetGrad)"/>
      </svg>
    `
  },
  {
    id: '03',
    name: 'Forest Green',
    category: 'gradient',
    svgContent: `
      <svg viewBox="0 0 1440 2560" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <linearGradient id="forestGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" style="stop-color:#134e5e;stop-opacity:1" />
            <stop offset="50%" style="stop-color:#71b280;stop-opacity:1" />
            <stop offset="100%" style="stop-color:#2dd4bf;stop-opacity:1" />
          </linearGradient>
          <pattern id="leaves" x="0" y="0" width="80" height="80" patternUnits="userSpaceOnUse">
            <ellipse cx="40" cy="40" rx="15" ry="8" fill="rgba(255,255,255,0.1)" transform="rotate(45 40 40)"/>
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#forestGrad)"/>
        <rect width="100%" height="100%" fill="url(#leaves)"/>
      </svg>
    `
  },
  {
    id: '04',
    name: 'Purple Dream',
    category: 'gradient',
    svgContent: `
      <svg viewBox="0 0 1440 2560" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <linearGradient id="purpleGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" style="stop-color:#667eea;stop-opacity:1" />
            <stop offset="50%" style="stop-color:#764ba2;stop-opacity:1" />
            <stop offset="100%" style="stop-color:#8b5cf6;stop-opacity:1" />
          </linearGradient>
          <pattern id="stars" x="0" y="0" width="100" height="100" patternUnits="userSpaceOnUse">
            <polygon points="50,10 55,35 80,35 60,50 70,75 50,60 30,75 40,50 20,35 45,35" fill="rgba(255,255,255,0.1)"/>
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#purpleGrad)"/>
        <rect width="100%" height="100%" fill="url(#stars)"/>
      </svg>
    `
  },
  {
    id: '05',
    name: 'Coral Reef',
    category: 'gradient',
    svgContent: `
      <svg viewBox="0 0 1440 2560" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <linearGradient id="coralGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" style="stop-color:#ff9a9e;stop-opacity:1" />
            <stop offset="50%" style="stop-color:#fecfef;stop-opacity:1" />
            <stop offset="100%" style="stop-color:#ffecd2;stop-opacity:1" />
          </linearGradient>
          <pattern id="coral" x="0" y="0" width="120" height="120" patternUnits="userSpaceOnUse">
            <path d="M60,20 Q80,40 60,60 Q40,40 60,20" fill="rgba(255,255,255,0.15)"/>
            <path d="M20,80 Q40,100 20,120 Q0,100 20,80" fill="rgba(255,255,255,0.1)"/>
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#coralGrad)"/>
        <rect width="100%" height="100%" fill="url(#coral)"/>
      </svg>
    `
  },
  {
    id: '06',
    name: 'Midnight Blue',
    category: 'gradient',
    svgContent: `
      <svg viewBox="0 0 1440 2560" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <linearGradient id="midnightGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" style="stop-color:#2c3e50;stop-opacity:1" />
            <stop offset="50%" style="stop-color:#34495e;stop-opacity:1" />
            <stop offset="100%" style="stop-color:#1e3c72;stop-opacity:1" />
          </linearGradient>
          <pattern id="dots" x="0" y="0" width="60" height="60" patternUnits="userSpaceOnUse">
            <circle cx="30" cy="30" r="3" fill="rgba(255,255,255,0.2)"/>
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#midnightGrad)"/>
        <rect width="100%" height="100%" fill="url(#dots)"/>
      </svg>
    `
  },
  {
    id: '07',
    name: 'Golden Hour',
    category: 'gradient',
    svgContent: `
      <svg viewBox="0 0 1440 2560" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <linearGradient id="goldenGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" style="stop-color:#f7971e;stop-opacity:1" />
            <stop offset="50%" style="stop-color:#ffd200;stop-opacity:1" />
            <stop offset="100%" style="stop-color:#ffb347;stop-opacity:1" />
          </linearGradient>
          <pattern id="rays" x="0" y="0" width="200" height="200" patternUnits="userSpaceOnUse">
            <path d="M100,0 L105,100 L100,200 L95,100 Z" fill="rgba(255,255,255,0.1)"/>
            <path d="M0,100 L100,105 L200,100 L100,95 Z" fill="rgba(255,255,255,0.1)"/>
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#goldenGrad)"/>
        <rect width="100%" height="100%" fill="url(#rays)"/>
      </svg>
    `
  },
  {
    id: '08',
    name: 'Mint Fresh',
    category: 'gradient',
    svgContent: `
      <svg viewBox="0 0 1440 2560" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <linearGradient id="mintGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" style="stop-color:#00b4db;stop-opacity:1" />
            <stop offset="50%" style="stop-color:#0083b0;stop-opacity:1" />
            <stop offset="100%" style="stop-color:#00d2ff;stop-opacity:1" />
          </linearGradient>
          <pattern id="bubbles" x="0" y="0" width="150" height="150" patternUnits="userSpaceOnUse">
            <circle cx="75" cy="75" r="20" fill="rgba(255,255,255,0.15)" opacity="0.8"/>
            <circle cx="30" cy="30" r="10" fill="rgba(255,255,255,0.1)" opacity="0.6"/>
            <circle cx="120" cy="40" r="15" fill="rgba(255,255,255,0.12)" opacity="0.7"/>
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#mintGrad)"/>
        <rect width="100%" height="100%" fill="url(#bubbles)"/>
      </svg>
    `
  },
  {
    id: '09',
    name: 'Rose Gold',
    category: 'gradient',
    svgContent: `
      <svg viewBox="0 0 1440 2560" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <linearGradient id="roseGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" style="stop-color:#ed4264;stop-opacity:1" />
            <stop offset="50%" style="stop-color:#ffedbc;stop-opacity:1" />
            <stop offset="100%" style="stop-color:#ff9a9e;stop-opacity:1" />
          </linearGradient>
          <pattern id="petals" x="0" y="0" width="100" height="100" patternUnits="userSpaceOnUse">
            <ellipse cx="50" cy="30" rx="20" ry="10" fill="rgba(255,255,255,0.1)" transform="rotate(30 50 30)"/>
            <ellipse cx="30" cy="70" rx="15" ry="8" fill="rgba(255,255,255,0.08)" transform="rotate(-30 30 70)"/>
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#roseGrad)"/>
        <rect width="100%" height="100%" fill="url(#petals)"/>
      </svg>
    `
  },
  {
    id: '10',
    name: 'Electric Blue',
    category: 'gradient',
    svgContent: `
      <svg viewBox="0 0 1440 2560" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <linearGradient id="electricGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" style="stop-color:#4facfe;stop-opacity:1" />
            <stop offset="50%" style="stop-color:#00f2fe;stop-opacity:1" />
            <stop offset="100%" style="stop-color:#43e97b;stop-opacity:1" />
          </linearGradient>
          <pattern id="lightning" x="0" y="0" width="80" height="120" patternUnits="userSpaceOnUse">
            <path d="M40,10 L30,50 L45,50 L35,110 L50,70 L40,70 Z" fill="rgba(255,255,255,0.1)"/>
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#electricGrad)"/>
        <rect width="100%" height="100%" fill="url(#lightning)"/>
      </svg>
    `
  },
  {
    id: '11',
    name: 'Lavender Fields',
    category: 'gradient',
    svgContent: `
      <svg viewBox="0 0 1440 2560" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <linearGradient id="lavenderGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" style="stop-color:#a8edea;stop-opacity:1" />
            <stop offset="50%" style="stop-color:#fed6e3;stop-opacity:1" />
            <stop offset="100%" style="stop-color:#d299c2;stop-opacity:1" />
          </linearGradient>
          <pattern id="flowers" x="0" y="0" width="90" height="90" patternUnits="userSpaceOnUse">
            <circle cx="45" cy="45" r="8" fill="rgba(255,255,255,0.15)"/>
            <circle cx="45" cy="45" r="4" fill="rgba(255,255,255,0.1)"/>
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#lavenderGrad)"/>
        <rect width="100%" height="100%" fill="url(#flowers)"/>
      </svg>
    `
  },
  {
    id: '12',
    name: 'Cosmic Purple',
    category: 'gradient',
    svgContent: `
      <svg viewBox="0 0 1440 2560" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <linearGradient id="cosmicGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" style="stop-color:#667eea;stop-opacity:1" />
            <stop offset="50%" style="stop-color:#764ba2;stop-opacity:1" />
            <stop offset="100%" style="stop-color:#667eea;stop-opacity:1" />
          </linearGradient>
          <pattern id="cosmos" x="0" y="0" width="200" height="200" patternUnits="userSpaceOnUse">
            <circle cx="50" cy="50" r="2" fill="rgba(255,255,255,0.8)"/>
            <circle cx="150" cy="100" r="1.5" fill="rgba(255,255,255,0.6)"/>
            <circle cx="100" cy="150" r="1" fill="rgba(255,255,255,0.7)"/>
            <circle cx="180" cy="30" r="2.5" fill="rgba(255,255,255,0.5)"/>
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#cosmicGrad)"/>
        <rect width="100%" height="100%" fill="url(#cosmos)"/>
      </svg>
    `
  }
];

// Convert SVG to PNG with specified dimensions
export const svgToPng = async (
  svgContent: string, 
  width: number = 1440, 
  height: number = 2560,
  quality: number = 0.9
): Promise<string> => {
  return new Promise((resolve, reject) => {
    try {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      
      if (!ctx) {
        reject(new Error('Canvas context not available'));
        return;
      }

      canvas.width = width;
      canvas.height = height;

      const img = new Image();
      const svgBlob = new Blob([svgContent], { type: 'image/svg+xml' });
      const url = URL.createObjectURL(svgBlob);

      img.onload = () => {
        try {
          ctx.imageSmoothingEnabled = true;
          ctx.imageSmoothingQuality = 'high';
          ctx.drawImage(img, 0, 0, width, height);
          
          const pngDataUrl = canvas.toDataURL('image/png', quality);
          URL.revokeObjectURL(url);
          resolve(pngDataUrl);
        } catch (error) {
          URL.revokeObjectURL(url);
          reject(error);
        }
      };

      img.onerror = () => {
        URL.revokeObjectURL(url);
        reject(new Error('Failed to load SVG image'));
      };

      img.src = url;
    } catch (error) {
      reject(error);
    }
  });
};

// Get SVG template by ID
export const getSvgTemplate = (id: string): SVGTemplate | undefined => {
  return svgTemplates.find(template => template.id === id);
};

// Convert SVG template to PNG data URL
export const convertTemplateToPng = async (
  templateId: string,
  width?: number,
  height?: number,
  quality?: number
): Promise<string> => {
  const template = getSvgTemplate(templateId);
  if (!template) {
    throw new Error(`Template with ID ${templateId} not found`);
  }
  
  return svgToPng(template.svgContent, width, height, quality);
};

// Template cache for performance
export class TemplateCache {
  private cache = new Map<string, string>();
  private loading = new Set<string>();

  async getTemplate(templateId: string, width?: number, height?: number): Promise<string> {
    const cacheKey = `${templateId}_${width || 1440}_${height || 2560}`;
    
    if (this.cache.has(cacheKey)) {
      return this.cache.get(cacheKey)!;
    }

    if (this.loading.has(cacheKey)) {
      return new Promise((resolve, reject) => {
        const checkCache = () => {
          if (this.cache.has(cacheKey)) {
            resolve(this.cache.get(cacheKey)!);
          } else if (!this.loading.has(cacheKey)) {
            reject(new Error('Template loading failed'));
          } else {
            setTimeout(checkCache, 100);
          }
        };
        checkCache();
      });
    }

    this.loading.add(cacheKey);
    
    try {
      const pngDataUrl = await convertTemplateToPng(templateId, width, height);
      this.cache.set(cacheKey, pngDataUrl);
      this.loading.delete(cacheKey);
      return pngDataUrl;
    } catch (error) {
      this.loading.delete(cacheKey);
      throw error;
    }
  }

  clearCache(): void {
    this.cache.clear();
  }
}

export const templateCache = new TemplateCache(); 