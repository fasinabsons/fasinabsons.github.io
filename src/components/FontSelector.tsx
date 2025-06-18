import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Search, Upload, Type, Check, Wifi, WifiOff, Loader2 } from 'lucide-react';

// Font interface
interface Font {
  id: string;
  name: string;
  family: string;
  category: string;
  weight: string;
  style: string;
  isCustom?: boolean;
  isLoaded?: boolean;
  url?: string;
  data?: ArrayBuffer;
}

interface FontSelectorProps {
  onFontSelect?: (font: Font) => void;
  selectedFont?: Font;
}

// Professional font collections with CDN URLs for caching
const webFonts = [
  { id: 'inter', name: 'Inter', family: 'Inter, -apple-system, BlinkMacSystemFont, sans-serif', category: 'sans-serif', weight: '400', style: 'normal', url: 'https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap' },
  { id: 'roboto', name: 'Roboto', family: 'Roboto, sans-serif', category: 'sans-serif', weight: '400', style: 'normal', url: 'https://fonts.googleapis.com/css2?family=Roboto:wght@300;400;500;700&display=swap' },
  { id: 'open-sans', name: 'Open Sans', family: '"Open Sans", sans-serif', category: 'sans-serif', weight: '400', style: 'normal', url: 'https://fonts.googleapis.com/css2?family=Open+Sans:wght@300;400;500;600;700&display=swap' },
  { id: 'lato', name: 'Lato', family: 'Lato, sans-serif', category: 'sans-serif', weight: '400', style: 'normal', url: 'https://fonts.googleapis.com/css2?family=Lato:wght@300;400;700&display=swap' },
  { id: 'montserrat', name: 'Montserrat', family: 'Montserrat, sans-serif', category: 'sans-serif', weight: '400', style: 'normal', url: 'https://fonts.googleapis.com/css2?family=Montserrat:wght@300;400;500;600;700&display=swap' },
  { id: 'poppins', name: 'Poppins', family: 'Poppins, sans-serif', category: 'sans-serif', weight: '400', style: 'normal', url: 'https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;500;600;700&display=swap' },
  
  { id: 'playfair', name: 'Playfair Display', family: '"Playfair Display", serif', category: 'serif', weight: '400', style: 'normal', url: 'https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;500;600;700&display=swap' },
  { id: 'merriweather', name: 'Merriweather', family: 'Merriweather, serif', category: 'serif', weight: '400', style: 'normal', url: 'https://fonts.googleapis.com/css2?family=Merriweather:wght@300;400;700&display=swap' },
  { id: 'crimson-text', name: 'Crimson Text', family: '"Crimson Text", serif', category: 'serif', weight: '400', style: 'normal', url: 'https://fonts.googleapis.com/css2?family=Crimson+Text:wght@400;600;700&display=swap' },
  
  { id: 'fira-code', name: 'Fira Code', family: '"Fira Code", monospace', category: 'monospace', weight: '400', style: 'normal', url: 'https://fonts.googleapis.com/css2?family=Fira+Code:wght@300;400;500;600&display=swap' },
  { id: 'source-code-pro', name: 'Source Code Pro', family: '"Source Code Pro", monospace', category: 'monospace', weight: '400', style: 'normal', url: 'https://fonts.googleapis.com/css2?family=Source+Code+Pro:wght@300;400;500;600&display=swap' },
];

// System fonts (always available offline)
const systemFonts = [
  { id: 'system-ui', name: 'System UI', family: 'system-ui, -apple-system, BlinkMacSystemFont, sans-serif', category: 'system', weight: '400', style: 'normal', isLoaded: true },
  { id: 'arial', name: 'Arial', family: 'Arial, sans-serif', category: 'system', weight: '400', style: 'normal', isLoaded: true },
  { id: 'helvetica', name: 'Helvetica', family: 'Helvetica, sans-serif', category: 'system', weight: '400', style: 'normal', isLoaded: true },
  { id: 'georgia-sys', name: 'Georgia', family: 'Georgia, serif', category: 'system', weight: '400', style: 'normal', isLoaded: true },
  { id: 'times-sys', name: 'Times New Roman', family: '"Times New Roman", serif', category: 'system', weight: '400', style: 'normal', isLoaded: true },
  { id: 'courier-sys', name: 'Courier New', family: '"Courier New", monospace', category: 'system', weight: '400', style: 'normal', isLoaded: true },
];

const categories = [
  { id: 'all', name: 'All Fonts' },
  { id: 'system', name: 'System' },
  { id: 'sans-serif', name: 'Sans Serif' },
  { id: 'serif', name: 'Serif' },
  { id: 'monospace', name: 'Monospace' },
  { id: 'custom', name: 'Custom' },
];

const FontSelector: React.FC<FontSelectorProps> = ({ onFontSelect, selectedFont: propSelectedFont }) => {
  const [fonts, setFonts] = useState<Font[]>([...systemFonts]);
  const [selectedFont, setSelectedFont] = useState<Font>(propSelectedFont || systemFonts[0]);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');

  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [loadingFonts, setLoadingFonts] = useState<Set<string>>(new Set());
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const fontCacheRef = useRef<Map<string, ArrayBuffer>>(new Map());
  const loadedLinksRef = useRef<Set<string>>(new Set());

  // Update selected font when prop changes
  useEffect(() => {
    if (propSelectedFont) {
      setSelectedFont(propSelectedFont);
    }
  }, [propSelectedFont]);

  // Monitor online status
  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);
    
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // Load and cache web fonts with duplicate prevention
  const loadWebFont = useCallback(async (font: Font) => {
    if (!font.url || font.isLoaded || !isOnline) return false;
    
    // Check if font is already loaded using document.fonts.check
    if (document.fonts.check(`1em ${font.family}`)) {
      setFonts(prev => prev.map(f => f.id === font.id ? { ...f, isLoaded: true } : f));
      return true;
    }
    
    // Prevent duplicate link insertion
    if (loadedLinksRef.current.has(font.url)) {
      return false;
    }
    
    setLoadingFonts(prev => new Set(prev).add(font.id));
    
    try {
      // Check if link already exists in document
      if (!document.querySelector(`link[href="${font.url}"]`)) {
        const link = document.createElement('link');
        link.href = font.url;
        link.rel = 'stylesheet';
        link.crossOrigin = 'anonymous';
        link.id = `font-${font.id}`;
        
        // Promise to wait for font load
        const fontLoadPromise = new Promise<boolean>((resolve) => {
          link.onload = () => {
            setTimeout(() => {
              document.fonts.ready.then(() => {
                resolve(true);
              });
            }, 100);
          };
          link.onerror = () => resolve(false);
        });
        
        document.head.appendChild(link);
        loadedLinksRef.current.add(font.url);
        
        const success = await fontLoadPromise;
        
        if (success) {
          setFonts(prevFonts => 
            prevFonts.map(f => 
              f.id === font.id ? { ...f, isLoaded: true } : f
            )
          );
          return true;
        }
      }
    } catch (error) {
      console.error('Failed to load font:', font.name, error);
    } finally {
      setLoadingFonts(prev => {
        const newSet = new Set(prev);
        newSet.delete(font.id);
        return newSet;
      });
    }
    
    return false;
  }, [isOnline]);

  // Initialize web fonts on mount (only load if not already cached)
  useEffect(() => {
    const initializeFonts = async () => {
      const allFonts = [...systemFonts, ...webFonts.map(f => ({ ...f, isLoaded: false }))];
      setFonts(allFonts);
      
      // Only load fonts if online and not already loaded
      if (isOnline) {
        for (const font of webFonts) {
          // Skip if already loaded
          if (!document.fonts.check(`1em ${font.family}`)) {
            loadWebFont(font);
          }
        }
      }
    };
    
    initializeFonts();
  }, [isOnline, loadWebFont]);

  // Handle custom font upload with better validation and uniqueness
  const handleCustomFontUpload = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files?.[0]) return;
    
    const file = e.target.files[0];
    
    // Better file type validation using file.type when available
    const validTypes = ['font/ttf', 'font/otf', 'font/woff', 'font/woff2'];
    const isValidType = validTypes.includes(file.type) || file.name.match(/\.(ttf|otf|woff|woff2)$/i);
    
    if (!isValidType) {
      alert('Please select a valid font file (.ttf, .otf, .woff, or .woff2)');
      return;
    }
    
    if (file.size > 5 * 1024 * 1024) {
      alert('Font file must be less than 5MB');
      return;
    }
    
    setIsUploading(true);
    
    try {
      const arrayBuffer = await file.arrayBuffer();
      
      // Create unique font name to prevent collisions
      const baseName = file.name.replace(/\.[^/.]+$/, '');
      const fontName = `${baseName}-Custom-${Date.now()}`;
      const fontId = `custom-${Date.now()}`;
      
      fontCacheRef.current.set(fontId, arrayBuffer);
      
      // Create font face
      const fontFace = new FontFace(fontName, arrayBuffer);
      
      // Load and add to document
      await fontFace.load();
      document.fonts.add(fontFace);
      
      // Create font object
      const newFont: Font = {
        id: fontId,
        name: baseName, // Display original name
        family: `"${fontName}", sans-serif`, // Use unique name internally
        category: 'custom',
        weight: '400',
        style: 'normal',
        isCustom: true,
        isLoaded: true,
        data: arrayBuffer
      };
      
      // Add to fonts list
      setFonts(prev => [...prev, newFont]);
      
      // Auto-select the uploaded font
      setSelectedFont(newFont);
      onFontSelect?.(newFont);
      
      // Clear file input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
      
    } catch (error) {
      console.error('Failed to load custom font:', error);
      alert('Failed to load font. Please try a different file.');
    } finally {
      setIsUploading(false);
    }
  }, [onFontSelect]);

  // Handle font selection with loading
  const handleFontSelect = async (font: Font) => {
    // If it's a web font and not loaded, try to load it first
    if (font.url && !font.isLoaded && isOnline) {
      const loaded = await loadWebFont(font);
      if (!loaded) {
        alert(`Failed to load ${font.name}. Please check your internet connection.`);
        return;
      }
    }
    
    setSelectedFont(font);
    onFontSelect?.(font);
  };

  // Filter fonts based on category and search
  const filteredFonts = fonts.filter(font => {
    const matchesCategory = selectedCategory === 'all' || font.category === selectedCategory;
    const matchesSearch = font.name.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2">
          <Type className="w-5 h-5 text-white" />
          <h3 className="text-lg font-semibold text-white">Font Selection</h3>
        </div>
        <div className="flex items-center gap-2">
          {isOnline ? (
            <Wifi className="w-4 h-4 text-green-400" />
          ) : (
            <WifiOff className="w-4 h-4 text-red-400" />
          )}
        </div>
      </div>
      
      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
        <input
          type="text"
          placeholder="Search fonts..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full pl-10 pr-4 py-2 bg-white/10 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:border-purple-500 focus:outline-none"
        />
      </div>

{/* Categories */}
<div className="flex flex-wrap gap-2">
  {categories.map(category => {
    const pressed = selectedCategory === category.id;
    return (
      <button
        key={category.id}
        onClick={() => setSelectedCategory(category.id)}
        className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${
          pressed 
            ? 'bg-purple-600 text-white' 
            : 'bg-white/10 text-gray-300 hover:bg-white/20'
        }`}
        aria-pressed={pressed}
      >
        {category.name}
      </button>
    );
  })}
</div>


      {/* Custom Font Upload */}
      <div className="space-y-2">
        <input
          ref={fileInputRef}
          type="file"
          accept=".ttf,.otf,.woff,.woff2"
          onChange={handleCustomFontUpload}
          className="hidden"
          aria-label="Upload custom font file"
        />
        <button
          onClick={() => fileInputRef.current?.click()}
          disabled={isUploading}
          className="w-full flex items-center justify-center gap-2 py-2 px-4 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
          aria-label="Upload custom font"
        >
          {isUploading ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <Upload className="w-4 h-4" />
          )}
          {isUploading ? 'Uploading...' : 'Upload Font'}
        </button>
      </div>

      {/* Font Grid */}
      <div className="grid grid-cols-1 gap-3 max-h-60 overflow-y-auto">
        {filteredFonts.map(font => (
          <button
            key={font.id}
            onClick={() => handleFontSelect(font)}
            className={`p-3 rounded-lg border text-left transition-all ${
              selectedFont.id === font.id 
                ? 'border-purple-500 bg-purple-500/20' 
                : 'border-gray-600 bg-white/5 hover:bg-white/10'
            } ${!font.isLoaded && font.url ? 'opacity-70' : ''}`}
            style={{ 
              fontFamily: font.family,
              fontWeight: font.weight,
              fontStyle: font.style
            }}
            disabled={loadingFonts.has(font.id)}
          >
            <div className="flex items-center justify-between">
              <div>
                <div className="text-white font-medium">{font.name}</div>
                <div className="text-xs text-gray-400 capitalize">{font.category}</div>
                <div className="text-sm text-gray-300 mt-1">
                  The quick brown fox jumps over the lazy dog
                </div>
              </div>
              
              <div className="flex items-center gap-2">
                {selectedFont.id === font.id && (
                  <Check className="w-4 h-4 text-purple-400" />
                )}
                
                {loadingFonts.has(font.id) && (
                  <Loader2 className="w-4 h-4 animate-spin text-purple-400" />
                )}
                
                {!font.isLoaded && font.url && !isOnline && (
                  <WifiOff className="w-4 h-4 text-red-400" />
                )}
              </div>
            </div>
          </button>
        ))}
      </div>

      {filteredFonts.length === 0 && (
        <div className="text-center py-8">
          <Type className="w-12 h-12 text-gray-600 mx-auto mb-3" />
          <p className="text-gray-400">No fonts found matching your criteria</p>
        </div>
      )}
    </div>
  );
};

export default FontSelector; 