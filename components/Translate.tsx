import React, { useEffect, useState } from 'react';
import { Text, TextStyle } from 'react-native';
import { useLanguage } from '../contexts/LanguageContext';

interface TranslateProps {
  text: string;
  style?: TextStyle;
  children?: never; // Ensure we're not using children
}

const Translate: React.FC<TranslateProps> = ({ text, style }) => {
  const { translate, language } = useLanguage();
  const [translatedText, setTranslatedText] = useState<string>(text);

  useEffect(() => {
    const translateText = async () => {
      try {
        const result = await translate(text);
        setTranslatedText(result);
      } catch (error) {
        console.error('Translation error:', error);
        // Fallback to original text
        setTranslatedText(text);
      }
    };

    translateText();
  }, [text, language, translate]);

  return <Text style={style}>{translatedText}</Text>;
};

export default Translate;