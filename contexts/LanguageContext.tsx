import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import Constants from 'expo-constants';
import AsyncStorage from '@react-native-async-storage/async-storage';

export type Language = 'english' | 'tamil' | 'swahili' | 'telugu' | 'malayalam';

const languageCodes: Record<Language, string> = {
  english: 'en',
  tamil: 'ta',
  swahili: 'sw',
  telugu: 'te',
  malayalam: 'ml'
};

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

const translationCache: Record<string, Record<string, string>> = {
  tamil: {},
  swahili: {},
  telugu: {},
  malayalam: {}
};

export const LanguageProvider: React.FC<LanguageProviderProps> = ({ children }) => {
  const [language, setLanguage] = useState<Language>('english');

  useEffect(() => {
    const loadSavedLanguage = async () => {
      try {
        const savedLanguage = await AsyncStorage.getItem('userLanguage');
        if (savedLanguage && isValidLanguage(savedLanguage)) {
          setLanguage(savedLanguage as Language);
        }
      } catch (error) {
        console.error('Failed to load language preference:', error);
      }
    };
    
    loadSavedLanguage();
  }, []);

  useEffect(() => {
    const saveLanguage = async () => {
      try {
        await AsyncStorage.setItem('userLanguage', language);
      } catch (error) {
        console.error('Failed to save language preference:', error);
      }
    };
    
    saveLanguage();
  }, [language]);
  
  // Helper to validate language type
  function isValidLanguage(lang: string): boolean {
    return ['english', 'tamil', 'swahili', 'telugu', 'malayalam'].includes(lang);
  }


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
      
      if (quickTranslations[language]?.[text]) {
        return quickTranslations[language][text];
      }
      
      // Then check cache
      if (translationCache[language]?.[text]) {
        return translationCache[language][text];
      }
      
      // Get API key from Expo Constants (add this to app.json or app.config.js)
      const TRANSLATE_API_KEY = Constants.expoConfig?.extra?.translateApiKey;
      
      if (!TRANSLATE_API_KEY) {
        console.warn('Translation API key not found');
        return text;
      }
      
      // Call translation API
      const targetLang = languageCodes[language];
      const response = await fetch(
        `https://translation.googleapis.com/language/translate/v2?key=${TRANSLATE_API_KEY}`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            q: text,
            source: 'en',
            target: targetLang,
            format: 'text'
          }),
        }
      );
      
      const data = await response.json();
      
      if (data.data && data.data.translations && data.data.translations.length > 0) {
        const translatedText = data.data.translations[0].translatedText;
        
        // Save to cache
        if (!translationCache[language]) {
          translationCache[language] = {};
        }
        translationCache[language][text] = translatedText;
        
        return translatedText;
      }
      
      return text; // Fallback to original
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