import React, { useEffect, useState } from 'react';
import { Text, TextProps } from 'react-native';
import { useLanguage } from '../contexts/LanguageContext';

interface TranslatedTextProps extends TextProps {
  text: string;
}

const TranslatedText: React.FC<TranslatedTextProps> = ({ text, ...props }) => {
  const { translate } = useLanguage();
  const [translatedText, setTranslatedText] = useState(text);

  useEffect(() => {
    const performTranslation = async () => {
      const result = await translate(text);
      setTranslatedText(result);
    };
    
    performTranslation();
  }, [text, translate]);

  return <Text {...props}>{translatedText}</Text>;
};

export default TranslatedText;