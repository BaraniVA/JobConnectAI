import './cryptoPolyfill';
import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, TextInput, ScrollView, SafeAreaView, ActivityIndicator } from 'react-native';
import { Stack, useRouter } from 'expo-router';
import { ArrowLeft, Mic, MapPin } from 'lucide-react-native';
import * as Speech from 'expo-speech';
import Translate from '../../components/Translate';
import { useLanguage } from '../../contexts/LanguageContext';
import * as FileSystem from 'expo-file-system';
import { Audio } from 'expo-av';
import Constants from 'expo-constants';
import { GooglePlacesAutocomplete } from 'react-native-google-places-autocomplete';
import { addDoc, collection } from 'firebase/firestore';
import { db } from '@/lib/firebase'; 
import * as Location from 'expo-location';
import { Platform, Alert, Linking } from 'react-native';
import { styles } from '../styles/employerStyles';
import useLocationSearch from '../../hooks/useLocationSearch';
import AsyncTranslate, { useAsyncTranslate } from '../../components/AsyncTranslate';


const placesApiKey = Constants.expoConfig?.extra?.GOOGLE_MAPS_API_KEY;

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
  const [coordinates, setCoordinates] = useState<{ latitude: number; longitude: number } | null>(null);
  const [loadingLocation, setLoadingLocation] = useState(false);
  const [sessionToken, setSessionToken] = useState(() => String(Date.now()));
  const [showLocationModal, setShowLocationModal] = useState(false); // Moved inside component

  const { 
    searchText,
    setSearchText,
    searchResults,
    selectedLocation,
    isLoading: locationSearchLoading,
    error: locationSearchError,
    selectLocation,
    getCurrentLocation,
  } = useLocationSearch({ 
    language: language // Use your current language state
  });
  
  // When location is selected, update formData
  useEffect(() => {
    if (selectedLocation) {
      setFormData(prev => ({ ...prev, location: selectedLocation.address }));
      if (selectedLocation.coordinates) {
        setCoordinates(selectedLocation.coordinates);
      }
    }
  }, [selectedLocation]);

  // Define handleLocationSelect inside the component
  const handleLocationSelect = (location: string, lat?: number, lng?: number) => {
    setFormData(prev => ({ ...prev, location }));
    if (lat && lng) {
      setCoordinates({ latitude: lat, longitude: lng });
    }
    setShowLocationModal(false);
  };

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
          // Use functional update to ensure latest state
          setFormData(prev => ({ ...prev, [field]: transcript }));
          
          if (field === 'location' && placesApiKey) {
            setStatusMessage('Getting coordinates for location...');
            speakFeedback('Finding this location on the map');
            try {
              // Improved geocoding with more parameters for better results
              const geocodeResponse = await fetch(
                `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(transcript)}&key=${placesApiKey}&language=${languageCode.split('-')[0]}&region=${languageCode.split('-')[1] || ''}`
              );
              const geocodeData = await geocodeResponse.json();
              
              if (geocodeData.results?.length > 0) {
                const { lat, lng } = geocodeData.results[0].geometry.location;
                setCoordinates({ latitude: lat, longitude: lng });
                
                // Show user-friendly location name from Google's response
                const formattedAddress = geocodeData.results[0].formatted_address;
                setFormData(prev => ({ ...prev, location: formattedAddress }));
                
                setStatusMessage(`Location set: ${formattedAddress}`);
                speakFeedback(`Location found: ${formattedAddress}`);
              } else {
                // If no coordinates found, still set the location text
                setStatusMessage('Location not found. Please try a more specific location name or use current location.');
                speakFeedback('Location not found. Please try a more specific location name or use current location.');
                setCoordinates(null); // Clear any previous coordinates
              }
            } catch (error) {
              console.error('Geocoding error:', error);
              setStatusMessage('Could not find this location. Try using current location or a landmark nearby.');
              speakFeedback('Could not find this location. Try using current location or a landmark nearby.');
              setCoordinates(null);
            }
          } else {
            setStatusMessage(`Added text to ${field}`);
            speakFeedback(`Added text to ${field}`);
          }
        } else {
          setStatusMessage('No speech detected. Please try again.');
          speakFeedback('No speech detected. Please try again.');
        }
      } catch (err) {
        console.error('Error processing speech', err);
        setStatusMessage('Failed to process speech');
        speakFeedback('Failed to process speech');
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

  const verifyJobListing = async (jobData: any) => {
    // Basic field validation
    if (!jobData.title || !jobData.company || !jobData.location) {
      setStatusMessage('Missing required fields');
      console.log('Verification failed: Missing required fields');
      return false;
    }
    
    // Check for minimum content length
    if (jobData.title.length < 3) {
      setStatusMessage('Job title is too short');
      console.log('Verification failed: Job title too short');
      return false;
    }
    
    if (jobData.company.length < 2) {
      setStatusMessage('Company name is too short');
      console.log('Verification failed: Company name too short');
      return false;
    }
    
    // Check for suspicious content (basic profanity filter)
    const suspiciousWords = ['scam', 'fraud', 'fake', 'illegal', 'xxx'];
    const contentToCheck = (jobData.title + ' ' + jobData.description).toLowerCase();
    
    let containsSuspiciousWord = false;
    for (const word of suspiciousWords) {
      // Use word boundary check to avoid false positives
      const regex = new RegExp(`\\b${word}\\b`, 'i');
      if (regex.test(contentToCheck)) {
        setStatusMessage('Job listing contains inappropriate content');
        console.log(`Verification failed: Contains suspicious word: ${word}`);
        containsSuspiciousWord = true;
        return false;
      }
    }
    
    // Verify pay information is reasonable
    if (jobData.pay) {
      const payString = jobData.pay.toLowerCase();
      
      // Check for unrealistic pay claims
      if (
        payString.includes('unlimited') || 
        payString.includes('millionaire') ||
        payString.includes('get rich')
      ) {
        setStatusMessage('Pay information appears unrealistic');
        console.log('Verification failed: Unrealistic pay claims');
        return false;
      }
      
      // Extract numbers from pay string to check for reasonable ranges
      const numbers = payString.match(/\d+/g);
      if (numbers && numbers.length > 0) {
        const highestNumber = Math.max(...numbers.map((n: string) => parseInt(n)));
        
        // Flag extremely high salaries (adjust threshold as needed)
        if (highestNumber > 1000000) {
          setStatusMessage('Pay amount appears unrealistic');
          console.log('Verification failed: Extremely high salary specified');
          return false;
        }
      }
    }
    
    // Location verification - make this less strict
    if (jobData.location) {
      // Check for valid location format
      if (jobData.location.length < 3) {
        setStatusMessage('Location information is too vague');
        console.log('Verification failed: Location too vague');
        return false;
      }
    }
    
    // Add a simulated verification delay to make it feel more thorough
    setStatusMessage('Verifying job details...');
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    // All checks passed
    console.log('Job verification passed successfully');
    setStatusMessage('Job verified successfully');
    return true;
  };

  const submitJob = async () => {
    // Validate form - remove coordinate requirement
    if (!formData.title || !formData.company || !formData.location || !formData.pay) {
      setStatusMessage('Please fill all required fields');
      speakFeedback('Please fill all required fields');
      return;
    }

    try {
      setIsProcessing(true);
      setStatusMessage('Verifying job details...');
      speakFeedback('Verifying job details');

      // Run verification checks
      const isVerified = await verifyJobListing(formData);

      if (!isVerified) {
        // verifyJobListing already sets a specific status message
        speakFeedback('Job verification failed. Please check your details');
        setIsProcessing(false);
        return;
      }

      // Modified coordinate handling
      if (!coordinates) {
        const proceed = await new Promise(resolve => {
          Alert.alert(
            'Location Accuracy',
            'No coordinates found. This job won\'t appear in proximity searches. Continue?',
            [
              { text: 'Cancel', onPress: () => resolve(false) },
              { text: 'Post Anyway', onPress: () => resolve(true) }
            ]
          );
        });
        
        if (!proceed) {
          setIsProcessing(false);
          return;
        }
      }

      setStatusMessage('Posting verified job...');
      speakFeedback('Posting verified job');
      
      // Calculate a safety score based on verification results
      const safetyScore = calculateSafetyScore(formData);
      
      await addDoc(collection(db, 'jobs'), {
        title: formData.title,
        company: formData.company,
        location: formData.location,
        pay: formData.pay,
        description: formData.description,
        coordinates: coordinates ? {
          latitude: coordinates.latitude,
          longitude: coordinates.longitude
        } : null,
        safetyScore: safetyScore,
        verified: true,
        createdAt: new Date().toISOString(),
      });
      
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
      setCoordinates(null);
      
      // Navigate back after success
      setTimeout(() => {
        router.back();
      }, 2000);
    } catch (error) {
      console.error('Error posting job:', error);
      setStatusMessage('Failed to post job. Please try again.');
      speakFeedback('Failed to post job. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  };

  // Calculate a safety score for the job listing
// Calculate a safety score for the job listing
const calculateSafetyScore = (jobData: any) => {
  let score = 0;
  
  // Add points for completeness
  if (jobData.title && jobData.title.length > 5) score += 1;
  if (jobData.company && jobData.company.length > 3) score += 1;
  if (jobData.location && jobData.location.length > 5) score += 1;
  if (jobData.pay) score += 1;
  if (jobData.description && jobData.description.length > 20) score += 1;
  
  // Add points for having coordinates (location verification)
  if (coordinates) score += 2;
  
  // Determine risk level based on score
  if (score >= 6) return 'Low Risk';
  if (score >= 4) return 'Medium Risk';
  return 'High Risk';
  };

// Improved current location function with better error handling and feedback
const useCurrentLocation = async () => {
  setLoadingLocation(true);
  setStatusMessage('Getting your current location...');
  speakFeedback('Getting your current location');
  
  const success = await getCurrentLocation();
  
  if (!success) {
    setStatusMessage('Failed to get current location');
    speakFeedback('Failed to get current location');
  }
  
  setLoadingLocation(false);
};

  // Add these hooks for translating placeholders and other text props
  const locationPlaceholder = useAsyncTranslate("Enter or speak a location name", "Enter location");
  const useCurrentLocationText = useAsyncTranslate("Use Current Location", "Use Current Location");

  return (
    <SafeAreaView style={styles.safeArea}>
      <Stack.Screen options={{ headerShown: false }} />
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <ArrowLeft size={24} color="#007AFF" />
        </TouchableOpacity>
        <Translate text="Employer Portal" style={styles.headerTitle} />
      </View>
      
      <ScrollView 
            style={styles.container}
            keyboardShouldPersistTaps="handled" // Add this to handle taps properly
            nestedScrollEnabled={true} // Enable nested scrolling
          >
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
        
        {/* Location field with Google Places */}
        <View style={styles.formGroup}>
          <Translate text="Location" style={styles.label} />
          <View>
            <View style={styles.locationHelpText}>
              <Translate text="You can:" style={styles.helpTextTitle} />
              <Text style={styles.helpTextItem}>• Speak the location using the microphone</Text>
              <Text style={styles.helpTextItem}>• Type a location and select from suggestions</Text>
              <Text style={styles.helpTextItem}>• Use your current location</Text>
            </View>
            
            {/* Universal location input - works with or without API key */}
            <View style={styles.inputContainer}>
              <TextInput
                style={styles.input}
                value={formData.location}
                onChangeText={(text) => {
                  handleTextChange('location', text);
                  setSearchText(text);
                }}
                placeholder={locationPlaceholder} // Use the pre-translated text
              />
              <TouchableOpacity 
                style={[styles.voiceButton, isRecording && activeField === 'location' ? styles.activeVoice : null]} 
                onPress={() => isRecording ? stopRecording() : startRecording('location')}
                disabled={isProcessing || locationSearchLoading}
              >
                <Mic size={20} color={isRecording && activeField === 'location' ? '#FFFFFF' : '#007AFF'} />
              </TouchableOpacity>
            </View>
            
            {/* Google Places search results */}
            {placesApiKey && formData.location?.length > 2 && (
              <View style={styles.placesOuterContainer}>
                {locationSearchLoading ? (
                  <View style={styles.placesLoadingContainer}>
                    <ActivityIndicator size="small" color="#007AFF" />
                    <Text style={styles.placesLoadingText}>Searching locations...</Text>
                  </View>
                ) : searchResults.length > 0 ? (
                  <View style={styles.placesContainer}>
                    <Text style={styles.placesResultsHeader}>Select a location:</Text>
                    <ScrollView 
                      keyboardShouldPersistTaps="handled"
                      style={styles.placesScrollView}
                      nestedScrollEnabled={true}
                    >
                      {searchResults.map((place) => (
                        <TouchableOpacity
                          key={place.id}
                          style={styles.placeItem}
                          onPress={() => {
                            selectLocation(place.id, place.description);
                            setStatusMessage(`Location selected: ${place.description}`);
                          }}
                        >
                          <MapPin size={14} color="#888888" style={styles.placeIcon} />
                          <Text style={styles.placeText}>{place.description}</Text>
                        </TouchableOpacity>
                      ))}
                    </ScrollView>
                  </View>
                ) : formData.location?.length > 2 && !locationSearchLoading && !coordinates && !locationSearchError ? (
                  <View style={styles.noResultsContainer}>
                    <Text style={styles.noResultsText}>No matching locations found. Try a different search term or use current location.</Text>
                  </View>
                ) : null}
                
                {locationSearchError && (
                  <Text style={styles.errorText}>{locationSearchError}</Text>
                )}
              </View>
            )}
            
            {!placesApiKey && (
              <Text style={styles.apiKeyWarning}>Google Places API key not found. Using manual location.</Text>
            )}
            
            {/* Current location button */}
            <TouchableOpacity
              style={styles.currentLocationButton}
              onPress={useCurrentLocation}
              disabled={loadingLocation}
            >
              <MapPin size={16} color="#FFFFFF" />
              <Text style={styles.currentLocationText}>{useCurrentLocationText}</Text>
              {loadingLocation && <ActivityIndicator size="small" color="#FFFFFF" style={{ marginLeft: 5 }} />}
            </TouchableOpacity>
            
            {/* Show coordinates if available */}
            {coordinates && (
              <View style={styles.coordinatesContainer}>
                <View style={styles.coordinatesBadge}>
                  <MapPin size={12} color="#007AFF" />
                  <Text style={styles.coordinatesText}>
                    Location verified with coordinates
                  </Text>
                </View>
              </View>
            )}
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
              style={styles.input}
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

