import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Modal, FlatList } from 'react-native';
import { useLanguage, Language } from '../contexts/LanguageContext';
import { ChevronDown } from 'lucide-react-native'; // If you have lucide icons

interface LanguageOption {
  value: Language;
  label: string;
  flag: string;
}

const languages: LanguageOption[] = [
  { value: 'english', label: 'English', flag: '🇬🇧' },
  { value: 'tamil', label: 'தமிழ்', flag: '🇮🇳' },
  { value: 'swahili', label: 'Kiswahili', flag: '🇰🇪' },
  { value: 'telugu', label: 'తెలుగు', flag: '🇮🇳' },
  { value: 'malayalam', label: 'മലയാളം', flag: '🇮🇳' },
];

const LanguageSwitcher: React.FC = () => {
  const { language, setLanguage } = useLanguage();
  const [dropdownVisible, setDropdownVisible] = useState(false);
  
  // Find the current language details
  const currentLanguage = languages.find(lang => lang.value === language) || languages[0];

  // Handle language selection and close dropdown
  const handleSelectLanguage = (selectedLang: Language) => {
    setLanguage(selectedLang);
    setDropdownVisible(false);
  };

  const renderLanguageItem = ({ item }: { item: LanguageOption }) => {
    const isActive = language === item.value;
    return (
      <TouchableOpacity
        style={[styles.dropdownItem, isActive && styles.activeItem]}
        onPress={() => handleSelectLanguage(item.value)}
      >
        <Text style={styles.flag}>{item.flag}</Text>
        <Text style={[styles.itemLabel, isActive && styles.activeText]}>
          {item.label}
        </Text>
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity 
        style={styles.dropdownButton}
        onPress={() => setDropdownVisible(true)}
      >
        <Text style={styles.flag}>{currentLanguage.flag}</Text>
        <Text style={styles.selectedText}>{currentLanguage.label}</Text>
        <ChevronDown size={16} color="#333" />
      </TouchableOpacity>

      <Modal
        visible={dropdownVisible}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setDropdownVisible(false)}
      >
        <TouchableOpacity 
          style={styles.overlay}
          activeOpacity={1}
          onPress={() => setDropdownVisible(false)}
        >
          <View style={styles.dropdownContainer}>
            <FlatList
              data={languages}
              renderItem={renderLanguageItem}
              keyExtractor={(item) => item.value}
              style={styles.dropdownList}
            />
          </View>
        </TouchableOpacity>
      </Modal>
    </View>
  );
};

export default LanguageSwitcher;

const styles = StyleSheet.create({
  container: {
    position: 'relative',
    zIndex: 100,
  },
  dropdownButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#ddd',
  },
  selectedText: {
    marginLeft: 8,
    marginRight: 8,
    fontSize: 16,
    color: '#333',
  },
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  dropdownContainer: {
    width: '80%',
    maxHeight: 300,
    backgroundColor: 'white',
    borderRadius: 8,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  dropdownList: {
    width: '100%',
  },
  dropdownItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  activeItem: {
    backgroundColor: '#e6f7ff',
  },
  flag: {
    fontSize: 18,
    marginRight: 8,
  },
  itemLabel: {
    fontSize: 16,
    color: '#333',
  },
  activeText: {
    fontWeight: 'bold',
    color: '#007bff',
  },
});