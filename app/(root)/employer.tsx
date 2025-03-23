import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, TextInput, ScrollView, SafeAreaView, ActivityIndicator } from 'react-native';
import { Stack, useRouter } from 'expo-router';
import { ArrowLeft, Mic } from 'lucide-react-native';
import * as Speech from 'expo-speech';
import Translate from '../../components/Translate';
import { useLanguage } from '../../contexts/LanguageContext';
import * as FileSystem from 'expo-file-system';
import { Audio } from 'expo-av';
import Constants from 'expo-constants';

export default function EmployerPortal() {
  const router = useRouter();
  const { language, translate } = useLanguage();
  
  const [isRecording, setIsRecording] = useState(false);
  const [activeField, setActiveField] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    title: '',
    company: '',
    location: '',
    pay: '',
    description: '',
  });
  const [statusMessage, setStatusMessage] = useState('');
  const [recording, setRecording] = useState<Audio.Recording | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  useEffect(() => {
    // Request permissions
    Audio.requestPermissionsAsync();
    
    return () => {
      if (recording) {
        stopRecording();
      }
    };
  }, []);

  const startRecording = async (field: string) => {
    try {
      setStatusMessage(`Listening for ${field}...`);
      setActiveField(field);
      setIsRecording(true);
      
      await Audio.setAudioModeAsync({
        allowsRecordingIOS: true,
        playsInSilentModeIOS: true,
      });
      
      const { recording } = await Audio.Recording.createAsync({
        android: {
          extension: '.wav',
          outputFormat: Audio.AndroidOutputFormat.MPEG_4,
          audioEncoder: Audio.AndroidAudioEncoder.AAC,
          sampleRate: 48000,
          numberOfChannels: 1,
          bitRate: 128000,
        },
        ios: {
          extension: '.wav',
          outputFormat: Audio.IOSOutputFormat.LINEARPCM,
          audioQuality: Audio.IOSAudioQuality.HIGH,
          sampleRate: 48000,
          numberOfChannels: 1,
          bitRate: 128000,
          linearPCMBitDepth: 16,
          linearPCMIsBigEndian: false,
          linearPCMIsFloat: false,
        },
        web: {
          mimeType: 'audio/webm',
          bitsPerSecond: 128000,
        },
      });
      
      setRecording(recording);
    } catch (err) {
      console.error('Failed to start recording', err);
      setStatusMessage('Failed to start recording');
      setIsRecording(false);
    }
  };

  const stopRecording = async () => {
    if (!recording) {
      return;
    }
    
    setIsRecording(false);
    setStatusMessage('Processing audio...');
    setIsProcessing(true);
    
    try {
      await recording.stopAndUnloadAsync();
      const uri = recording.getURI();
      setRecording(null);
      
      if (uri && activeField) {
        await processAudioWithGoogleSpeechAPI(uri, activeField);
      }
    } catch (err) {
      console.error('Failed to stop recording', err);
      setStatusMessage('Error processing recording');
      setIsProcessing(false);
    }
  };

  const processAudioWithGoogleSpeechAPI = async (uri: string, field: string) => {
    try {
      // Read audio file
      const fileBase64 = await FileSystem.readAsStringAsync(uri, {
        encoding: FileSystem.EncodingType.Base64,
      });
      
      // Prepare Google Speech-to-Text request
      const languageCode = language === 'tamil' ? 'ta-IN' : 
                          language === 'swahili' ? 'sw' : 
                          language === 'telugu' ? 'te-IN' : 
                          language === 'malayalam' ? 'ml-IN' : 'en-US';
      
      // Replace with your Google Cloud API key or use your existing key used in job search
      const apiKey = Constants.expoConfig?.extra?.GOOGLE_CLOUD_API_KEY;
      
      const response = await fetch(
        `https://speech.googleapis.com/v1/speech:recognize?key=${apiKey}`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            config: {
              encoding: 'WEBM_OPUS',
              sampleRateHertz: 48000,
              languageCode: languageCode,
              enableAutomaticPunctuation: true,
              useEnhanced: true,
            },
            audio: {
              content: fileBase64,
            },
          }),
        }
      );
      
      const data = await response.json();
      
      if (data.results && data.results.length > 0) {
        const transcript = data.results[0].alternatives[0].transcript;
        setFormData({ ...formData, [field]: transcript });
        setStatusMessage(`Added text to ${field}`);
        speakFeedback(`Added text to ${field}`);
      } else {
        setStatusMessage('No speech detected. Please try again.');
      }
    } catch (err) {
      console.error('Error processing speech', err);
      setStatusMessage('Failed to process speech');
    } finally {
      setIsProcessing(false);
    }
  };

  const speakFeedback = (message: string) => {
    Speech.speak(message, {
      language: language === 'tamil' ? 'ta-IN' : language === 'swahili' ? 'sw' : 'en',
      rate: 0.8,
    });
  };

  const handleTextChange = (field: string, value: string) => {
    setFormData({ ...formData, [field]: value });
  };

  const submitJob = async () => {
    // Validate form
    if (!formData.title || !formData.company || !formData.location || !formData.pay) {
      setStatusMessage('Please fill all required fields');
      speakFeedback('Please fill all required fields');
      return;
    }

    // Here you would typically send data to an API
    setStatusMessage('Job posted successfully!');
    speakFeedback('Job posted successfully!');
    
    // Reset form
    setFormData({
      title: '',
      company: '',
      location: '',
      pay: '',
      description: '',
    });
    
    // Simulate API call delay then navigate back
    setTimeout(() => {
      router.back();
    }, 2000);
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <Stack.Screen options={{ headerShown: false }} />
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <ArrowLeft size={24} color="#007AFF" />
        </TouchableOpacity>
        <Translate text="Employer Portal" style={styles.headerTitle} />
      </View>
      
      <ScrollView style={styles.container}>
        <Translate text="Add a New Job" style={styles.title} />
        <Translate text="Use voice input to create a job listing" style={styles.subtitle} />
        
        {statusMessage ? (
          <View style={styles.statusContainer}>
            <Text style={styles.statusText}>{statusMessage}</Text>
            {isProcessing && <ActivityIndicator style={{marginTop: 5}} color="#007AFF" />}
          </View>
        ) : null}
        
        <View style={styles.formGroup}>
          <Translate text="Job Title" style={styles.label} />
          <View style={styles.inputContainer}>
            <TextInput
              style={styles.input}
              value={formData.title}
              onChangeText={(text) => handleTextChange('title', text)}
              placeholder="Job Title"
            />
            <TouchableOpacity 
              style={[styles.voiceButton, isRecording && activeField === 'title' ? styles.activeVoice : null]} 
              onPress={() => isRecording ? stopRecording() : startRecording('title')}
              disabled={isProcessing}
            >
              <Mic size={20} color={isRecording && activeField === 'title' ? '#FFFFFF' : '#007AFF'} />
            </TouchableOpacity>
          </View>
        </View>
        
        <View style={styles.formGroup}>
          <Translate text="Company" style={styles.label} />
          <View style={styles.inputContainer}>
            <TextInput
              style={styles.input}
              value={formData.company}
              onChangeText={(text) => handleTextChange('company', text)}
              placeholder="Company Name"
            />
            <TouchableOpacity 
              style={[styles.voiceButton, isRecording && activeField === 'company' ? styles.activeVoice : null]} 
              onPress={() => isRecording ? stopRecording() : startRecording('company')}
              disabled={isProcessing}
            >
              <Mic size={20} color={isRecording && activeField === 'company' ? '#FFFFFF' : '#007AFF'} />
            </TouchableOpacity>
          </View>
        </View>
        
        <View style={styles.formGroup}>
          <Translate text="Location" style={styles.label} />
          <View style={styles.inputContainer}>
            <TextInput
              style={styles.input}
              value={formData.location}
              onChangeText={(text) => handleTextChange('location', text)}
              placeholder="Job Location"
            />
            <TouchableOpacity 
              style={[styles.voiceButton, isRecording && activeField === 'location' ? styles.activeVoice : null]} 
              onPress={() => isRecording ? stopRecording() : startRecording('location')}
              disabled={isProcessing}
            >
              <Mic size={20} color={isRecording && activeField === 'location' ? '#FFFFFF' : '#007AFF'} />
            </TouchableOpacity>
          </View>
        </View>
        
        <View style={styles.formGroup}>
          <Translate text="Pay" style={styles.label} />
          <View style={styles.inputContainer}>
            <TextInput
              style={styles.input}
              value={formData.pay}
              onChangeText={(text) => handleTextChange('pay', text)}
              placeholder="Pay/Salary"
            />
            <TouchableOpacity 
              style={[styles.voiceButton, isRecording && activeField === 'pay' ? styles.activeVoice : null]} 
              onPress={() => isRecording ? stopRecording() : startRecording('pay')}
              disabled={isProcessing}
            >
              <Mic size={20} color={isRecording && activeField === 'pay' ? '#FFFFFF' : '#007AFF'} />
            </TouchableOpacity>
          </View>
        </View>
        
        <View style={styles.formGroup}>
          <Translate text="Description" style={styles.label} />
          <View style={styles.inputContainer}>
            <TextInput
              style={[styles.input, styles.textArea]}
              value={formData.description}
              onChangeText={(text) => handleTextChange('description', text)}
              placeholder="Job Description"
              multiline
              numberOfLines={4}
            />
            <TouchableOpacity 
              style={[styles.voiceButton, isRecording && activeField === 'description' ? styles.activeVoice : null]} 
              onPress={() => isRecording ? stopRecording() : startRecording('description')}
              disabled={isProcessing}
            >
              <Mic size={20} color={isRecording && activeField === 'description' ? '#FFFFFF' : '#007AFF'} />
            </TouchableOpacity>
          </View>
        </View>
        
        <TouchableOpacity 
          style={styles.submitButton} 
          onPress={submitJob}
          disabled={isRecording || isProcessing}
        >
          <Translate text="Post Job" style={styles.submitButtonText} />
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 15,
    paddingTop: 50,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E5E5',
  },
  backButton: {
    padding: 5,
  },
  headerTitle: {
    fontFamily: 'Roboto-Bold',
    fontSize: 18,
    marginLeft: 15,
  },
  container: {
    flex: 1,
    padding: 20,
  },
  title: {
    fontFamily: 'Roboto-Bold',
    fontSize: 24,
    marginBottom: 10,
    color: '#000000',
  },
  subtitle: {
    fontFamily: 'Roboto-Regular',
    fontSize: 16,
    color: '#6B7280',
    marginBottom: 20,
  },
  statusContainer: {
    backgroundColor: '#F0F9FF',
    padding: 10,
    borderRadius: 8,
    marginBottom: 20,
    alignItems: 'center',
  },
  statusText: {
    fontFamily: 'Roboto-Regular',
    color: '#007AFF',
    textAlign: 'center',
  },
  formGroup: {
    marginBottom: 20,
  },
  label: {
    fontFamily: 'Roboto-Medium',
    fontSize: 16,
    marginBottom: 8,
    color: '#000000',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  input: {
    flex: 1,
    fontFamily: 'Roboto-Regular',
    backgroundColor: '#F5F5F7',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
  },
  textArea: {
    height: 100,
    textAlignVertical: 'top',
  },
  voiceButton: {
    padding: 10,
    borderRadius: 25,
    backgroundColor: '#F5F5F7',
    marginLeft: 10,
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  activeVoice: {
    backgroundColor: '#007AFF',
  },
  submitButton: {
    backgroundColor: '#4CAF50',
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
    marginVertical: 20,
  },
  submitButtonText: {
    fontFamily: 'Roboto-Bold',
    fontSize: 18,
    color: '#FFFFFF',
  },
});