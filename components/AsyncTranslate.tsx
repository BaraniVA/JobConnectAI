import React, { useEffect, useState } from 'react';
import { Text, TextProps } from 'react-native';
import { useLanguage } from '../contexts/LanguageContext';

interface AsyncTranslateProps extends TextProps {
  text: string;
  fallback?: string;
}

const AsyncTranslate: React.FC<AsyncTranslateProps> = ({ text, fallback = '', style, ...props }) => {
  const { translate } = useLanguage();
  const [translatedText, setTranslatedText] = useState(fallback || text);

  useEffect(() => {
    let isMounted = true;
    
    const translateText = async () => {
      try {
        const result = await translate(text);
        if (isMounted) {
          setTranslatedText(result);
        }
      } catch (error) {
        console.error('Translation error:', error);
        if (isMounted) {
          setTranslatedText(fallback || text);
        }
      }
    };

    translateText();
    
    return () => {
      isMounted = false;
    };
  }, [text, translate, fallback]);

  return <Text style={style} {...props}>{translatedText}</Text>;
};

export default AsyncTranslate;

// Also create a hook for using async translations for attributes like placeholder
export const useAsyncTranslate = (text: string, fallback?: string) => {
  const { translate } = useLanguage();
  const [translatedText, setTranslatedText] = useState(fallback || text);

  useEffect(() => {
    let isMounted = true;
    
    const translateText = async () => {
      try {
        const result = await translate(text);
        if (isMounted) {
          setTranslatedText(result);
        }
      } catch (error) {
        if (isMounted) {
          setTranslatedText(fallback || text);
        }
      }
    };

    translateText();
    
    return () => {
      isMounted = false;
    };
  }, [text, translate, fallback]);

  return translatedText;
};