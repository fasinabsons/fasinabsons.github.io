import { useState } from 'react';
import HomePage from './components/HomePage';
import MethodSelector from './components/MethodSelector';
import ModeSelector from './components/ModeSelector';
import StandardGenerator from './components/StandardGenerator';
import StandardBulkGenerator from './components/StandardBulkGenerator';
import TemplateGenerator from './components/TemplateGenerator';
import TemplateBulkGenerator from './components/TemplateBulkGenerator';
import OCRToQRGenerator from './components/OCRToQRGenerator';
import About from './components/About';
import PrivacyPolicy from './components/PrivacyPolicy';
import TermsOfService from './components/TermsOfService';

type Route = 
  | 'home'
  | 'method-select'
  | 'standard-mode'
  | 'template-mode'
  | 'standard-single'
  | 'standard-bulk'
  | 'template-single'
  | 'template-bulk'
  | 'ocr'
  | 'about'
  | 'privacy'
  | 'terms';

function App() {
  const [currentRoute, setCurrentRoute] = useState<Route>('home');
  const [selectedMethod, setSelectedMethod] = useState<'standard' | 'template'>('standard');

  const navigate = (route: Route | string) => {
    setCurrentRoute(route as Route);
  };

  const handleMethodSelect = (method: 'standard' | 'template') => {
    setSelectedMethod(method);
    navigate(method === 'standard' ? 'standard-mode' : 'template-mode');
  };

  const handleModeSelect = (mode: 'single' | 'bulk') => {
    if (selectedMethod === 'standard') {
      navigate(mode === 'single' ? 'standard-single' : 'standard-bulk');
    } else {
      navigate(mode === 'single' ? 'template-single' : 'template-bulk');
    }
  };

  const goBack = () => {
    switch (currentRoute) {
      case 'method-select':
        navigate('home');
        break;
      case 'standard-mode':
      case 'template-mode':
        navigate('method-select');
        break;
      case 'standard-single':
      case 'standard-bulk':
        navigate('standard-mode');
        break;
      case 'template-single':
      case 'template-bulk':
        navigate('template-mode');
        break;
      case 'ocr':
        navigate('home');
        break;
      default:
        navigate('home');
    }
  };

  // Render current route
  switch (currentRoute) {
    case 'home':
      return <HomePage onNavigate={navigate} />;
    
    case 'method-select':
      return <MethodSelector onBack={goBack} onSelect={handleMethodSelect} />;
    
    case 'standard-mode':
      return <ModeSelector method="standard" onBack={goBack} onSelect={handleModeSelect} />;
    
    case 'template-mode':
      return <ModeSelector method="template" onBack={goBack} onSelect={handleModeSelect} />;
    
    case 'standard-single':
      return <StandardGenerator onBack={goBack} />;
    
    case 'standard-bulk':
      return <StandardBulkGenerator onBack={goBack} />;
    
    case 'template-single':
      return <TemplateGenerator onBack={goBack} />;
    
    case 'template-bulk':
      return <TemplateBulkGenerator onBack={goBack} />;
    
    case 'ocr':
      return <OCRToQRGenerator onBack={goBack} />;
    
    case 'about':
      return <About onBack={() => navigate('home')} />;
    
    case 'privacy':
      return <PrivacyPolicy onBack={() => navigate('home')} />;
    
    case 'terms':
      return <TermsOfService onBack={() => navigate('home')} />;
    
    default:
      return <HomePage onNavigate={navigate} />;
  }
}

export default App;