import React, { createContext, useContext, useState, ReactNode } from 'react';

export type Language = 'english' | 'tamil' | 'swahili' | 'telugu' | 'malayalam';

interface LanguageContextType {
  language: Language;
  setLanguage: (language: Language) => void;
  translate: (text: string) => Promise<string>;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};

interface LanguageProviderProps {
  children: ReactNode;
}

export const LanguageProvider: React.FC<LanguageProviderProps> = ({ children }) => {
  const [language, setLanguage] = useState<Language>('english');

  const translate = async (text: string): Promise<string> => {
    if (language === 'english') return text;
    
    try {
      // For mobile apps, we'll rely on predefined translations
      // This avoids issues with API routes in React Native
      const quickTranslations: Record<string, Record<string, string>> = {
        'tamil': {
          'JobConnect AI': 'JobConnect AI தமிழில்',
          'Find a Job': 'வேலை தேட',
          'Browse Jobs': 'வேலைகளை பார்வையிட',
          'Welcome to JobConnect AI. Press Find a Job to search or Browse Jobs to see all jobs': 
            'Job connect AI க்கு உங்களை வரவேற்கிறோம். வேலை தேடுவதற்கு வேலை தேட என்பதை அழுத்தவும் அல்லது என்னென்ன வேலைகள் உள்ளது என்பதை அறிய வேலைகளை பார்வையிட என்பதை அழுத்தவும்'
        },
        'swahili': {
          'JobConnect AI': 'JobConnect AI kwa Kiswahili',
          'Find a Job': 'Tafuta Kazi',
          'Browse Jobs': 'Angalia Kazi',
          'Welcome to JobConnect AI. Press Find a Job to search or Browse Jobs to see all jobs': 
            'Karibu kwenye JobConnect AI. Bonyeza Tafuta Kazi kutafuta au Angalia Kazi kuona kazi zote'
        },
        'telugu': {
          'JobConnect AI': 'JobConnect AIకి స్వాగతం',
          'Find a Job': 'ఉద్యోగం వెతకండి',
          'Browse Jobs': 'ఉద్యోగాల కోసం చూడండి',
          'Welcome to JobConnect AI. Press Find a Job to search or Browse Jobs to see all jobs': 
            'Job connect AIకి స్వాగతం. ఉద్యోగం కోసం శోధించడానికి "ఉద్యోగాల కోసం వెతకండి" పై క్లిక్ చేయండి లేదా అన్ని ఉద్యోగాలను వీక్షించడానికి "ఉద్యోగాలను చూడండి" పై క్లిక్ చేయండి'
        },
        'malayalam': {
          'JobConnect AI': 'job connect AI-ലേക്ക് സ്വാഗതം.',
          'Find a Job': 'തൊഴിലുകൾ തിരയുക',
          'Browse Jobs': 'തൊഴിലുകൾ കാണുക',
          'Welcome to JobConnect AI. Press Find a Job to search or Browse Jobs to see all jobs': 
            'Job connect AI-ലേക്ക് സ്വാഗതം. ഒരു തൊഴിൽ തിരയാൻ "തൊഴിലുകൾ തിരയുക" ക്ലിക്ക് ചെയ്യുക അല്ലെങ്കിൽ എല്ലാ തൊഴിലുകളും കാണാൻ "തൊഴിലുകൾ കാണുക" ക്ലിക്ക് ചെയ്യുക'
        }
      };
      
      // Check if we have a quick translation available
      if (quickTranslations[language]?.[text]) {
        return quickTranslations[language][text];
      }
      
      // For texts not in our predefined list, just return the original
      console.log(`No translation found for: "${text}" in ${language}`);
      return text;
      
      // NOTE: The API approach below won't work in React Native without a proper backend
      // You would need to set up a real backend server and use its full URL
      /*
      const response = await fetch('https://your-actual-backend-url.com/api/translate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          text,
          targetLanguage: language,
        }),
      });
      
      const data = await response.json();
      return data.translatedText;
      */
    } catch (error) {
      console.error('Translation error:', error);
      return text; // Return original text if translation fails
    }
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, translate }}>
      {children}
    </LanguageContext.Provider>
  );
};