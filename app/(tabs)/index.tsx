import { View, Text, TouchableOpacity, StyleSheet, SafeAreaView, FlatList, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { Megaphone, List as ListIcon, CircleHelp as HelpCircle, Briefcase } from 'lucide-react-native';
import * as Speech from 'expo-speech';
import { useEffect, useState, useRef } from 'react';
import LanguageSwitcher from '../../components/LanguageSwitcher';
import { useLanguage } from '../../contexts/LanguageContext';
import Translate from '../../components/Translate';

// Job type definition
interface Job {
  id: string;
  title: string;
  location: string;
  pay: string;
  verified?: boolean;
}

const getSpeechLanguageCode = (lang: string): string => {
  switch (lang) {
    case 'tamil':
      return 'ta-IN';
    case 'swahili':
      return 'sw';
    case 'telugu':
      return 'te-IN';
    case 'malayalam':
      return 'ml-IN';
    case 'en':
    case 'english':
      return 'en';
    default:
      return 'en';
  }
};


export default function HomeScreen() {
  const router = useRouter();

  const { language, translate } = useLanguage();
  
  const [isLoading, setIsLoading] = useState(false);
  const [loadingJobs, setLoadingJobs] = useState(false);

  useEffect(() => {
    const speakWelcomeMessage = async () => {
      setIsLoading(true);
      try {
        const originalMessage = 'Welcome to JobConnect AI. Press Find a Job to search or Browse Jobs to see all jobs';
        // Translate the message first
        const translatedMessage = await translate(originalMessage);
        
        // Then speak the translated text
        Speech.speak(translatedMessage, {
          language: language === 'tamil' ? 'ta-IN' : language === 'swahili' ? 'sw' : 'en',
          rate: 0.8,
        });
      } catch (error) {
        console.error('Error speaking welcome message:', error);
      } finally {
        setIsLoading(false);
      }
    };
    
    speakWelcomeMessage();
  }, [language, translate]);
  
  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.languageSwitcherContainer}>
        <LanguageSwitcher />
      </View>
      
      <View style={styles.container}>
        <Translate text="JobConnect AI" style={styles.title} />
        
        <TouchableOpacity
          style={styles.button}
          onPress={() => router.push('/search')}>
          <Megaphone size={24} color="#FFFFFF" />
          <Translate text="Find a Job" style={styles.buttonText} />
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.button}
          onPress={() => router.push('/jobs')}>
          <ListIcon size={24} color="#FFFFFF" />
          <Translate text="Browse Jobs" style={styles.buttonText} />
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.button, styles.employerButton]}
          onPress={() => router.push('../employer')}>
          <Briefcase size={24} color="#FFFFFF" />
          <Translate text="Employer Portal" style={styles.buttonText} />
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.helpButton}
          onPress={() => router.push('/safety')}>
          <HelpCircle size={24} color="#007AFF" />
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  languageSwitcherContainer: {
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 5,
    alignItems: 'center',
    flexDirection: 'column',
  },
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    padding: 20,
  },
  title: {
    fontFamily: 'Roboto-Bold',
    fontSize: 24,
    marginBottom: 20,
    color: '#000000',
  },
  sectionTitle: {
    fontFamily: 'Roboto-Bold',
    fontSize: 18,
    marginBottom: 15,
    color: '#000000',
  },
  jobList: {
    marginBottom: 10,
  },
  jobCard: {
    width: 250,
    backgroundColor: '#F5F5F7',
    borderRadius: 10,
    padding: 15,
    marginRight: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  jobHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 5,
  },
  jobTitle: {
    fontFamily: 'Roboto-Bold',
    fontSize: 16,
    color: '#000000',
    flex: 1,
  },
  jobLocation: {
    fontFamily: 'Roboto-Regular',
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 8,
  },
  jobPay: {
    fontFamily: 'Roboto-Medium',
    fontSize: 14,
    color: '#10B981',
  },
  emptyText: {
    fontFamily: 'Roboto-Regular',
    fontSize: 14,
    color: '#6B7280',
    textAlign: 'center',
    marginVertical: 15,
  },
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#007AFF',
    padding: 20,
    borderRadius: 10,
    width: '100%',
    marginBottom: 20,
  },
  buttonText: {
    color: '#FFFFFF',
    fontFamily: 'Roboto-Bold',
    fontSize: 18,
    marginLeft: 10,
  },
  helpButton: {
    position: 'absolute',
    bottom: 20,
    right: 20,
    backgroundColor: '#FFFFFF',
    padding: 10,
    borderRadius: 30,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  employerButton: {
    backgroundColor: '#4CAF50',
  },
});