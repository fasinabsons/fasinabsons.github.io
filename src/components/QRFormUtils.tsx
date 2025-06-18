import React from 'react';
import { Contact, QRCodeStyle, CardSettings } from '../types';
import { checkColorContrast } from '../utils/qrGenerator';
import { AlertCircle, Sliders, Move, Square } from 'lucide-react';

interface ContactFormProps {
  contact: Contact;
  onChange: (contact: Contact) => void;
  errors?: string[];
}

export const ContactForm: React.FC<ContactFormProps> = ({ contact, onChange, errors = [] }) => {

  const handleChange = (field: keyof Contact, value: string) => {
    const updatedContact = { ...contact, [field]: value };
    onChange(updatedContact);
  };



  const updateAddressField = (field: string, value: string) => {
    // Update the specific address field and the main address field
    const updatedContact = { ...contact, [field]: value };
    
    // Update main address field
    const addressParts = [
      field === 'street' ? value : updatedContact.street,
      field === 'city' ? value : updatedContact.city,
      field === 'state' ? value : updatedContact.state,
      field === 'zipcode' ? value : updatedContact.zipcode,
      field === 'country' ? value : updatedContact.country
    ].filter(part => part && part.trim().length > 0);
    
    updatedContact.address = addressParts.join(', ');
    onChange(updatedContact);
  };

  return (
    <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6">
      <h3 className="text-xl font-semibold text-white mb-6">Contact Information</h3>
      
      {errors.length > 0 && (
        <div className="mb-6 p-4 bg-red-500/20 border border-red-500/50 rounded-lg">
          <div className="flex items-center gap-2 text-red-300 mb-2">
            <AlertCircle className="w-4 h-4" />
            <span className="font-medium">Please fix the following errors:</span>
          </div>
          <ul className="list-disc list-inside text-red-200 text-sm space-y-1">
            {errors.map((error, index) => (
              <li key={index}>{error}</li>
            ))}
          </ul>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Name Components */}
        <div className="md:col-span-2">
          <h4 className="text-lg font-semibold text-white mb-3">Personal Information</h4>
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-1">
            Prefix
          </label>
          <select
            value={contact.prefix || ''}
            onChange={(e) => {
              const updatedContact = { ...contact, prefix: e.target.value };
              // Update full name with all components
              const fullName = [
                e.target.value, 
                updatedContact.firstName, 
                updatedContact.lastName, 
                updatedContact.suffix
              ].filter(Boolean).join(' ');
              updatedContact.name = fullName;
              onChange(updatedContact);
            }}
            className="w-full px-3 py-2 bg-white/10 border border-gray-600 rounded-lg text-white focus:border-purple-500 focus:ring-1 focus:ring-purple-500"
            aria-label="Name prefix"
          >
            <option value="" className="bg-gray-800">None</option>
            <option value="Mr" className="bg-gray-800">Mr</option>
            <option value="Mrs" className="bg-gray-800">Mrs</option>
            <option value="Ms" className="bg-gray-800">Ms</option>
            <option value="Dr" className="bg-gray-800">Dr</option>
            <option value="Prof" className="bg-gray-800">Prof</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-300 mb-1">
            First Name *
          </label>
          <input
            type="text"
            value={contact.firstName || ''}
            onChange={(e) => {
              const updatedContact = { ...contact, firstName: e.target.value };
              // Update full name with all components
              const fullName = [
                updatedContact.prefix, 
                e.target.value, 
                updatedContact.lastName, 
                updatedContact.suffix
              ].filter(Boolean).join(' ');
              updatedContact.name = fullName;
              onChange(updatedContact);
            }}
            className="w-full px-3 py-2 bg-white/10 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:border-purple-500 focus:ring-1 focus:ring-purple-500"
            placeholder="Johnny"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-300 mb-1">
            Last Name *
          </label>
          <input
            type="text"
            value={contact.lastName || ''}
            onChange={(e) => {
              const updatedContact = { ...contact, lastName: e.target.value };
              // Update full name with all components
              const fullName = [
                updatedContact.prefix, 
                updatedContact.firstName, 
                e.target.value, 
                updatedContact.suffix
              ].filter(Boolean).join(' ');
              updatedContact.name = fullName;
              onChange(updatedContact);
            }}
            className="w-full px-3 py-2 bg-white/10 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:border-purple-500 focus:ring-1 focus:ring-purple-500"
            placeholder="Jabbour"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-300 mb-1">
            Suffix
          </label>
          <select
            value={contact.suffix || ''}
            onChange={(e) => {
              const updatedContact = { ...contact, suffix: e.target.value };
              // Update full name with all components
              const fullName = [
                updatedContact.prefix, 
                updatedContact.firstName, 
                updatedContact.lastName, 
                e.target.value
              ].filter(Boolean).join(' ');
              updatedContact.name = fullName;
              onChange(updatedContact);
            }}
            className="w-full px-3 py-2 bg-white/10 border border-gray-600 rounded-lg text-white focus:border-purple-500 focus:ring-1 focus:ring-purple-500"
            aria-label="Name suffix"
          >
            <option value="" className="bg-gray-800">None</option>
            <option value="Jr" className="bg-gray-800">Jr</option>
            <option value="Sr" className="bg-gray-800">Sr</option>
            <option value="III" className="bg-gray-800">III</option>
            <option value="IV" className="bg-gray-800">IV</option>
            <option value="PhD" className="bg-gray-800">PhD</option>
            <option value="MD" className="bg-gray-800">MD</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-300 mb-1">
            Email *
          </label>
          <input
            type="email"
            value={contact.email}
            onChange={(e) => handleChange('email', e.target.value)}
            className="w-full px-3 py-2 bg-white/10 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:border-purple-500 focus:ring-1 focus:ring-purple-500"
            placeholder="john@example.com"
          />
        </div>

        {/* Phone Numbers Section */}
        <div className="md:col-span-2">
          <h4 className="text-lg font-semibold text-white mb-3">Contact Information</h4>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-300 mb-1">
            Mobile Phone *
          </label>
          <input
            type="tel"
            value={contact.mobilePhone || ''}
            onChange={(e) => {
              const updatedContact = { ...contact, mobilePhone: e.target.value };
              // Update main phone field
              const phones = [
                e.target.value,
                updatedContact.workPhone,
                updatedContact.homePhone,
                updatedContact.faxPhone
              ].filter(phone => phone && phone.trim().length > 0);
              updatedContact.phone = phones.join(' | ');
              onChange(updatedContact);
            }}
            className="w-full px-3 py-2 bg-white/10 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:border-purple-500 focus:ring-1 focus:ring-purple-500"
            placeholder="+971 50 219 1969"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-300 mb-1">
            Work Phone
          </label>
          <input
            type="tel"
            value={contact.workPhone || ''}
            onChange={(e) => {
              const updatedContact = { ...contact, workPhone: e.target.value };
              // Update main phone field
              const phones = [
                updatedContact.mobilePhone,
                e.target.value,
                updatedContact.homePhone,
                updatedContact.faxPhone
              ].filter(phone => phone && phone.trim().length > 0);
              updatedContact.phone = phones.join(' | ');
              onChange(updatedContact);
            }}
            className="w-full px-3 py-2 bg-white/10 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:border-purple-500 focus:ring-1 focus:ring-purple-500"
            placeholder="+971 2 441 0590"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-300 mb-1">
            Home Phone
          </label>
          <input
            type="tel"
            value={contact.homePhone || ''}
            onChange={(e) => {
              const updatedContact = { ...contact, homePhone: e.target.value };
              // Update main phone field
              const phones = [
                updatedContact.mobilePhone,
                updatedContact.workPhone,
                e.target.value,
                updatedContact.faxPhone
              ].filter(phone => phone && phone.trim().length > 0);
              updatedContact.phone = phones.join(' | ');
              onChange(updatedContact);
            }}
            className="w-full px-3 py-2 bg-white/10 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:border-purple-500 focus:ring-1 focus:ring-purple-500"
            placeholder="+1 (555) 123-4567"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-300 mb-1">
            Fax Number
          </label>
          <input
            type="tel"
            value={contact.faxPhone || ''}
            onChange={(e) => {
              const updatedContact = { ...contact, faxPhone: e.target.value };
              // Update main phone field
              const phones = [
                updatedContact.mobilePhone,
                updatedContact.workPhone,
                updatedContact.homePhone,
                e.target.value
              ].filter(phone => phone && phone.trim().length > 0);
              updatedContact.phone = phones.join(' | ');
              onChange(updatedContact);
            }}
            className="w-full px-3 py-2 bg-white/10 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:border-purple-500 focus:ring-1 focus:ring-purple-500"
            placeholder="+971 2 441 0591"
          />
        </div>

        {/* Organization Section */}
        <div className="md:col-span-2">
          <h4 className="text-lg font-semibold text-white mb-3">Professional Information</h4>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-300 mb-1">
            Organization *
          </label>
          <input
            type="text"
            value={contact.organization || ''}
            onChange={(e) => handleChange('organization', e.target.value)}
            className="w-full px-3 py-2 bg-white/10 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:border-purple-500 focus:ring-1 focus:ring-purple-500"
            placeholder="Company Name"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-300 mb-1">
            Job Title
          </label>
          <input
            type="text"
            value={contact.title || ''}
            onChange={(e) => handleChange('title', e.target.value)}
            className="w-full px-3 py-2 bg-white/10 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:border-purple-500 focus:ring-1 focus:ring-purple-500"
            placeholder="Business Development Manager"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-300 mb-1">
            Department
          </label>
          <input
            type="text"
            value={contact.department || ''}
            onChange={(e) => handleChange('department', e.target.value)}
            className="w-full px-3 py-2 bg-white/10 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:border-purple-500 focus:ring-1 focus:ring-purple-500"
            placeholder="Sales & Marketing"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-300 mb-1">
            Website
          </label>
          <input
            type="url"
            value={contact.website || ''}
            onChange={(e) => handleChange('website', e.target.value)}
            className="w-full px-3 py-2 bg-white/10 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:border-purple-500 focus:ring-1 focus:ring-purple-500"
            placeholder="https://example.com"
          />
        </div>

        {/* Address Section */}
        <div className="md:col-span-2">
          <h4 className="text-lg font-semibold text-white mb-3">Address Information</h4>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-300 mb-1">
            Street Address
          </label>
          <input
            type="text"
            value={contact.street || ''}
            onChange={(e) => updateAddressField('street', e.target.value)}
            className="w-full px-3 py-2 bg-white/10 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:border-purple-500 focus:ring-1 focus:ring-purple-500"
            placeholder="P.O Box 25475"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-300 mb-1">
            City
          </label>
          <input
            type="text"
            value={contact.city || ''}
            onChange={(e) => updateAddressField('city', e.target.value)}
            className="w-full px-3 py-2 bg-white/10 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:border-purple-500 focus:ring-1 focus:ring-purple-500"
            placeholder="Abu Dhabi"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-300 mb-1">
            State/Province
          </label>
          <input
            type="text"
            value={contact.state || ''}
            onChange={(e) => updateAddressField('state', e.target.value)}
            className="w-full px-3 py-2 bg-white/10 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:border-purple-500 focus:ring-1 focus:ring-purple-500"
            placeholder="Abu Dhabi Emirate"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-300 mb-1">
            ZIP/Postal Code
          </label>
          <input
            type="text"
            value={contact.zipcode || ''}
            onChange={(e) => updateAddressField('zipcode', e.target.value)}
            className="w-full px-3 py-2 bg-white/10 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:border-purple-500 focus:ring-1 focus:ring-purple-500"
            placeholder="25475"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-300 mb-1">
            Country
          </label>
          <input
            type="text"
            value={contact.country || ''}
            onChange={(e) => updateAddressField('country', e.target.value)}
            className="w-full px-3 py-2 bg-white/10 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:border-purple-500 focus:ring-1 focus:ring-purple-500"
            placeholder="UAE"
          />
        </div>


      </div>
    </div>
  );
};

interface QRStyleFormProps {
  style: QRCodeStyle;
  onChange: (style: QRCodeStyle) => void;
}

export const QRStyleForm: React.FC<QRStyleFormProps> = ({ style, onChange }) => {
  const handleChange = (field: keyof QRCodeStyle, value: string | number | boolean) => {
    onChange({ ...style, [field]: value });
  };

  const contrastRatio = checkColorContrast(style.foregroundColor, style.backgroundColor);
  const hasGoodContrast = contrastRatio >= 4.5;

  return (
    <div className="space-y-4">
      {/* Colors Section */}
      <div className="space-y-3">
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Foreground Color
          </label>
          <div className="flex items-center gap-3">
            <input
              type="color"
              value={style.foregroundColor}
              onChange={(e) => handleChange('foregroundColor', e.target.value)}
              className="w-16 h-12 rounded-lg border-2 border-gray-600 bg-transparent cursor-pointer"
              aria-label="Select foreground color"
            />
            <input
              type="text"
              value={style.foregroundColor}
              onChange={(e) => handleChange('foregroundColor', e.target.value)}
              className="flex-1 px-3 py-2 bg-white/10 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:border-purple-500 focus:ring-1 focus:ring-purple-500 text-sm"
              placeholder="Enter hex color"
              aria-label="Foreground color hex code"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Background Color
          </label>
          <div className="flex items-center gap-3">
            <input
              type="color"
              value={style.backgroundColor}
              onChange={(e) => handleChange('backgroundColor', e.target.value)}
              disabled={style.transparent}
              className="w-16 h-12 rounded-lg border-2 border-gray-600 bg-transparent disabled:opacity-50 cursor-pointer"
              aria-label="Select background color"
            />
            <input
              type="text"
              value={style.backgroundColor}
              onChange={(e) => handleChange('backgroundColor', e.target.value)}
              disabled={style.transparent}
              className="flex-1 px-3 py-2 bg-white/10 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:border-purple-500 focus:ring-1 focus:ring-purple-500 disabled:opacity-50 text-sm"
              placeholder="Enter hex color"
              aria-label="Background color hex code"
            />
          </div>
        </div>

        {style.gradient && (
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Gradient Color
            </label>
            <div className="flex items-center gap-3">
              <input
                type="color"
                value={style.gradientColor}
                onChange={(e) => handleChange('gradientColor', e.target.value)}
                className="w-16 h-12 rounded-lg border-2 border-gray-600 bg-transparent cursor-pointer"
                aria-label="Select gradient color"
              />
              <input
                type="text"
                value={style.gradientColor}
                onChange={(e) => handleChange('gradientColor', e.target.value)}
                className="flex-1 px-3 py-2 bg-white/10 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:border-purple-500 focus:ring-1 focus:ring-purple-500 text-sm"
                placeholder="Enter hex color"
                aria-label="Gradient color hex code"
              />
            </div>
          </div>
        )}
      </div>

      {/* Options */}
      <div className="space-y-2">
        <label className="flex items-center gap-2 text-gray-300 text-sm">
          <input
            type="checkbox"
            checked={style.transparent}
            onChange={(e) => handleChange('transparent', e.target.checked)}
            className="w-4 h-4 text-purple-600 bg-white/10 border-gray-600 rounded focus:ring-purple-500"
          />
          Transparent Background
        </label>

        <label className="flex items-center gap-2 text-gray-300 text-sm">
          <input
            type="checkbox"
            checked={style.gradient}
            onChange={(e) => handleChange('gradient', e.target.checked)}
            className="w-4 h-4 text-purple-600 bg-white/10 border-gray-600 rounded focus:ring-purple-500"
          />
          Enable Gradient
        </label>
      </div>

      {/* Border Radius */}
      <div>
        <label className="block text-sm font-medium text-gray-300 mb-2">
          Border Radius: {style.borderRadius}px
        </label>
        <input
          type="range"
          min="0"
          max="20"
          value={style.borderRadius}
          onChange={(e) => handleChange('borderRadius', parseInt(e.target.value))}
          className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer slider"
          aria-label="Border radius slider"
        />
      </div>

      {/* Contrast Warning */}
      {!style.transparent && (
        <div className={`p-2 rounded-lg text-xs ${hasGoodContrast ? 'bg-green-500/20 border-green-500/50 text-green-300' : 'bg-red-500/20 border-red-500/50 text-red-300'} border`}>
          <div className="flex items-center gap-2">
            <AlertCircle className="w-3 h-3" />
            <span>
              Contrast: {contrastRatio.toFixed(1)}:1 
              {hasGoodContrast ? ' ✓' : ' (Need ≥4.5:1)'}
            </span>
          </div>
        </div>
      )}
    </div>
  );
};

interface QRLayoutFormProps {
  settings: CardSettings;
  onChange: (settings: CardSettings) => void;
  onPreviewUpdate?: () => void;
}

export const QRLayoutForm: React.FC<QRLayoutFormProps> = ({ settings, onChange, onPreviewUpdate }) => {
  const handleLayoutChange = (field: keyof CardSettings['layout'], value: string | number) => {
    const updatedSettings = {
      ...settings,
      layout: { ...settings.layout, [field]: value }
    };
    onChange(updatedSettings);
    // Trigger immediate preview update for real-time feedback
    if (onPreviewUpdate) {
      setTimeout(onPreviewUpdate, 50); // Small delay for smooth updates
    }
  };

  const spacingOptions = [5, 10, 15, 20, 25];
  const qrSizeOptions = [20, 25, 30, 35, 40, 45, 50];

  return (
    <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6">
      <h3 className="text-xl font-semibold text-white mb-6 flex items-center gap-2">
        <Sliders className="w-5 h-5" />
        Layout Controls
      </h3>
      
      <div className="space-y-6">
        {/* QR Position */}
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-3 flex items-center gap-2">
            <Move className="w-4 h-4" />
            QR Code Position
          </label>
          <div className="grid grid-cols-3 gap-2">
            {(['top', 'middle', 'bottom'] as const).map((position) => (
              <button
                key={position}
                onClick={() => handleLayoutChange('qrPosition', position)}
                className={`px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                  settings.layout.qrPosition === position
                    ? 'bg-purple-600 text-white'
                    : 'bg-white/10 text-gray-300 hover:bg-white/20'
                }`}
              >
                {position.charAt(0).toUpperCase() + position.slice(1)}
              </button>
            ))}
          </div>
        </div>

        {/* Text Spacing */}
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-3">
            Text Spacing: {settings.layout.textSpacing}px
          </label>
          <div className="space-y-2">
            <input
              type="range"
              min="5"
              max="25"
              step="5"
              value={settings.layout.textSpacing}
              onChange={(e) => handleLayoutChange('textSpacing', parseInt(e.target.value))}
              className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer slider"
              aria-label="Text spacing slider"
            />
            <div className="flex justify-between text-xs text-gray-400">
              {spacingOptions.map((spacing) => (
                <span key={spacing}>{spacing}px</span>
              ))}
            </div>
          </div>
        </div>

        {/* QR Size */}
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-3 flex items-center gap-2">
            <Square className="w-4 h-4" />
            QR Code Size: {settings.layout.qrSize}%
          </label>
          <div className="space-y-2">
            <input
              type="range"
              min="20"
              max="50"
              step="5"
              value={settings.layout.qrSize}
              onChange={(e) => handleLayoutChange('qrSize', parseInt(e.target.value))}
              className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer slider"
              aria-label="QR code size slider"
            />
            <div className="flex justify-between text-xs text-gray-400">
              {qrSizeOptions.map((size) => (
                <span key={size}>{size}%</span>
              ))}
            </div>
          </div>
        </div>

        {/* Messages Section */}
        <div>
          <label className="flex items-center gap-2 text-gray-300 mb-3">
            <input
              type="checkbox"
              checked={settings.messages.enabled}
              onChange={(e) => onChange({
                ...settings,
                messages: { ...settings.messages, enabled: e.target.checked }
              })}
              className="w-4 h-4 text-purple-600 bg-white/10 border-gray-600 rounded focus:ring-purple-500"
            />
            Enable Custom Messages
          </label>
          
          {settings.messages.enabled && (
            <div className="space-y-3">
              <input
                type="text"
                placeholder="Primary message (30 chars max)"
                value={settings.messages.text1}
                onChange={(e) => {
                  const updatedSettings = {
                    ...settings,
                    messages: { ...settings.messages, text1: e.target.value }
                  };
                  onChange(updatedSettings);
                  if (onPreviewUpdate) {
                    setTimeout(onPreviewUpdate, 100);
                  }
                }}
                maxLength={30}
                className="w-full px-3 py-2 bg-white/10 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:border-purple-500 focus:ring-1 focus:ring-purple-500"
              />
              
              <input
                type="text"
                placeholder="Secondary message (30 chars max)"
                value={settings.messages.text2}
                onChange={(e) => {
                  const updatedSettings = {
                    ...settings,
                    messages: { ...settings.messages, text2: e.target.value }
                  };
                  onChange(updatedSettings);
                  if (onPreviewUpdate) {
                    setTimeout(onPreviewUpdate, 100);
                  }
                }}
                maxLength={30}
                className="w-full px-3 py-2 bg-white/10 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:border-purple-500 focus:ring-1 focus:ring-purple-500"
              />
              
              <div className="text-xs text-gray-400">
                Primary: {settings.messages.text1.length}/30 | Secondary: {settings.messages.text2.length}/30
              </div>
            </div>
          )}
        </div>

        {/* Real-time Preview Note */}
        <div className="bg-blue-500/20 border border-blue-500/50 rounded-lg p-3">
          <p className="text-blue-200 text-sm">
            💡 Changes are reflected in real-time. Adjust spacing and size to see immediate updates.
          </p>
        </div>
      </div>
    </div>
  );
};