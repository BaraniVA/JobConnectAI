import React, { useState, useEffect, useRef } from 'react';
import { View, Text, TouchableOpacity, FlatList, StyleSheet, Image, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { Mic, Shield } from 'lucide-react-native';
import * as Speech from 'expo-speech';
import { Audio } from 'expo-av';
import { useJobs } from '@/hooks/useFirestore';
import { processSearchQuery, searchJobs } from '../../utils/geminiService';
import { styles } from '../styles/searchStyles';
import Constants from 'expo-constants';
import useLocation from '../../hooks/useLocation';
import { filterByProximity } from '../../utils/proximitySearch';
import { MapPin } from 'lucide-react-native';

const apiKey = Constants.expoConfig?.extra?.GOOGLE_CLOUD_API_KEY;

export default function SearchScreen() {
  // Keep existing state
  const router = useRouter();
  const [isListening, setIsListening] = useState(false);
  const [searchTerm, setSearchTerm] = useState<string>('');
  const { jobs, loading, error } = useJobs(searchTerm);
  const [searchQuery, setSearchQuery] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [results, setResults] = useState<any[]>([]);
  const [voiceError, setVoiceError] = useState<string>('');
  const [recording, setRecording] = useState<Audio.Recording | null>(null);
  const { location, loading: locationLoading } = useLocation();
  
  // Add countdown timer for better UX
  const [countdown, setCountdown] = useState(5);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // Request permissions for audio recording
  useEffect(() => {
    (async () => {
      const { status } = await Audio.requestPermissionsAsync();
      if (status !== 'granted') {
        setVoiceError('Microphone permission not granted');
      }
    })();
  }, []);

  // Handle countdown timer
  useEffect(() => {
    if (isListening && countdown > 0) {
      timerRef.current = setTimeout(() => {
        setCountdown(prev => prev - 1);
      }, 1000);
    } else if (isListening && countdown === 0) {
      // Automatically stop recording when countdown reaches 0
      stopRecording();
    }

    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
    };
  }, [isListening, countdown]);

  // Start voice recording - improved with reliable auto-stop
  const startRecording = async () => {
    try {
      // Clear previous errors
      setVoiceError('');
      
      // Configure audio session for recording
      await Audio.setAudioModeAsync({
        allowsRecordingIOS: true,
        playsInSilentModeIOS: true,
      });
      
      // Create and start new recording
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
      setIsListening(true);
      setCountdown(5); // Reset countdown to 5 seconds
      
      // Provide feedback that we're listening
      Speech.speak("Listening...", { rate: 0.9, pitch: 1.0 });
      
    } catch (error) {
      console.error('Error starting recording:', error);
      setVoiceError('Could not start recording');
      setIsListening(false);
    }
  };

  // Stop recording and process audio - no changes needed
  const stopRecording = async () => {
    if (!recording) return;
    
    setIsListening(false);
    setCountdown(5); // Reset countdown
    
    // Clear any existing timer
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
    
    try {
      await recording.stopAndUnloadAsync();
      
      // Get recording URI
      const uri = recording.getURI();
      if (!uri) {
        throw new Error('Recording URI not available');
      }
      
      // For demo purposes, we'll simulate speech recognition
      simulateSpeechRecognition(uri);
      
      // Reset recording state
      setRecording(null);
      
      // Reset audio mode
      await Audio.setAudioModeAsync({
        allowsRecordingIOS: false,
      });
      
    } catch (error) {
      console.error('Error stopping recording:', error);
      setVoiceError('Error processing your speech');
      setRecording(null);
    }
  };

  // Enhanced simulation with user feedback - improved
  const simulateSpeechRecognition = async (audioUri: string) => {
    try {
      setIsProcessing(true);
      
      // Get the audio file content
      const response = await fetch(audioUri);
      const blob = await response.blob();
      
      // Convert to base64
      const reader = new FileReader();
      const audioBase64Promise = new Promise<string>((resolve) => {
        reader.onloadend = () => {
          
          const base64 = reader.result?.toString().split(',')[1] || '';
          resolve(base64);
        };
      });
      reader.readAsDataURL(blob);
      const audioBase64 = await audioBase64Promise;
      
      // Access the API key
      if (!apiKey) {
        console.error('Google Cloud API Key not found');
        throw new Error('API Key not configured');
      }
      
      // Call Google Cloud Speech-to-Text API
      const speechResponse = await fetch(
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
              languageCode: 'en-US',
              model: 'default',
              audioChannelCount: 1,
              enableAutomaticPunctuation: true,
              useEnhanced: true,
            },
            audio: {
              content: audioBase64,
            },
          }),
        }
      );
      
      const speechData = await speechResponse.json();
      console.log('Google Speech API response:', speechData);
      
      let transcribedText = '';
      
      if (
        speechData.results && 
        speechData.results.length > 0 && 
        speechData.results[0].alternatives && 
        speechData.results[0].alternatives.length > 0
      ) {
        transcribedText = speechData.results[0].alternatives[0].transcript;
        console.log('Transcription result:', transcribedText);
      } else {
        console.warn('No transcription found in the response');
        transcribedText = "Sorry, I couldn't understand that";
      }
      
      // Process with Gemini
      processVoiceInput(transcribedText);
      
    } catch (error) {
      console.error('Error in speech recognition:', error);
      setVoiceError('Could not recognize speech');
      setIsProcessing(false);
    }
  };

  // Enhanced AI search function with debug
  const handleAISearch = async (query: string) => {
    if (!query.trim()) return;
    
    setIsProcessing(true);
    console.log("🔍 Starting search for:", query);
    
    try {
      const processedQuery = await processSearchQuery(query);
      console.log("📝 Processed query:", processedQuery);
      
      const searchResults = await searchJobs(
        processedQuery.keywords,
        processedQuery.filters
      );
      console.log("📊 Search results:", searchResults);
      
      // Check if we got results
      if (searchResults && searchResults.length > 0) {
        // Apply location filtering if available
        if (location) {
          console.log("📍 User location available, filtering by proximity");
          
          // Convert the coordinates to the format expected by filterByProximity
          const resultsWithCoords = searchResults.map(job => ({
            ...job,
            locationCoords: job.coordinates ? {
              latitude: job.coordinates.latitude,
              longitude: job.coordinates.longitude
            } : undefined
          }));
          
          // Filter jobs by proximity (50km radius)
          const nearbyResults = filterByProximity(resultsWithCoords, location, 50);
          console.log("📍 Found", nearbyResults.length, "nearby jobs out of", searchResults.length);
          
          if (nearbyResults.length > 0) {
            // Option 1: Show only nearby results
            // setResults(nearbyResults);
            
            // Option 2: Show nearby results first, then others
            const otherResults = searchResults.filter(
              job => !nearbyResults.some((nearbyJob: typeof job) => nearbyJob.id === job.id)
            );
            
            // Add distance info to other results
            otherResults.forEach(job => {
              if (job.coordinates) {
                const coords = {
                  latitude: job.coordinates.latitude,
                  longitude: job.coordinates.longitude
                };
                
                // Type assertion for location to ensure coords exist
                if (location && (location as { coords: { latitude: number, longitude: number } }).coords) {
                  const userCoords = (location as { coords: { latitude: number, longitude: number } }).coords;
                  job.distance = Math.round(
                    getDistanceFromLatLonInKm(
                      userCoords.latitude,
                      userCoords.longitude,
                      coords.latitude,
                      coords.longitude
                    ) * 10
                  ) / 10;
                }
              }
            });
            
            setResults([...nearbyResults, ...otherResults]);
            console.log("✅ Results prioritized by distance");
          } else {
            setResults(searchResults);
            console.log("ℹ️ No nearby results found, showing all matches");
          }
        } else {
          setResults(searchResults);
          console.log("ℹ️ Location not available, showing all results");
        }
      } else {
        console.log("⚠️ No search results found");
      }
      
      // Also update searchTerm to trigger useJobs
      setSearchTerm(query);
      
    } catch (error) {
      console.error('Error during AI search:', error);
      setVoiceError('Error searching for jobs');
    } finally {
      setIsProcessing(false);
    }
  };

  // Process voice input after speech recognition
  const processVoiceInput = (text: string) => {
    try {
      // Update the search query display
      setSearchQuery(text);
      
      // If we got a valid transcription
      if (text && text !== "Sorry, I couldn't understand that") {
        // Use our AI-powered search
        handleAISearch(text);
      } else {
        setVoiceError('Could not understand speech clearly. Please try again.');
        setIsProcessing(false);
      }
    } catch (error) {
      console.error('Error processing voice input:', error);
      setVoiceError('Error processing your request');
      setIsProcessing(false);
    }
  };

  // Handle voice search button press
  const handleVoiceSearch = () => {
    if (isListening) {
      // If already listening, stop recording
      stopRecording();
    } else {
      // Start a new recording
      startRecording();
    }
  };

  // Render job item with dynamic safety score colors
  const renderJob = ({ item }: { item: any }) => {
    // Determine safety level based on score value
    let safetyBadgeStyle = styles.safetyBadgeLow;
    let safetyTextStyle = styles.safetyTextLow;
    let safetyColor = "#4CAF50"; // Green (default/safe)
    
    if (item.safetyScore) {
      const score = parseFloat(item.safetyScore);
      
      if (score >= 7) {
        // High risk (red)
        safetyBadgeStyle = styles.safetyBadgeHigh;
        safetyTextStyle = styles.safetyTextHigh;
        safetyColor = "#F44336";
      } else if (score >= 4) {
        // Medium risk (orange)
        safetyBadgeStyle = styles.safetyBadgeMedium;
        safetyTextStyle = styles.safetyTextMedium;
        safetyColor = "#FF9800";
      }
    }

    return (
      <TouchableOpacity
        style={styles.jobCard}
        onPress={() => router.push(`/job/${item.id}`)}
      >
        <View style={styles.jobHeader}>
          <Text style={styles.jobTitle}>{item.title || "Job Position"}</Text>
        </View>
        <Text style={styles.jobLocation}>
          {item.location || "Location"}
          {item.distance && (
            <Text>
              {" • "}
              <Text style={item.distance <= 10 ? styles.nearbyDistance : styles.farDistance}>
                {item.distance}km away
              </Text>
            </Text>
          )}
        </Text>
        <Text style={styles.jobPay}>{item.salary || item.pay || "$15-20/hr"}</Text>
        {item.safetyScore && (
          <View style={[
            styles.safetyBadge, 
            item.safetyScore === 'Low Risk' ? styles.safetyBadgeLow : 
            item.safetyScore === 'Medium Risk' ? styles.safetyBadgeMedium : 
            styles.safetyBadgeHigh
          ]}>
            <Shield 
              size={16} 
              color={
                item.safetyScore === 'Low Risk' ? '#4CAF50' : 
                item.safetyScore === 'Medium Risk' ? '#FF9800' : 
                '#F44336'
              } 
            />
            <Text style={
              item.safetyScore === 'Low Risk' ? styles.safetyTextLow : 
              item.safetyScore === 'Medium Risk' ? styles.safetyTextMedium : 
              styles.safetyTextHigh
            }>
              {item.safetyScore}
            </Text>
          </View>
        )}
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      <Image
        source={{ uri: 'https://images.unsplash.com/photo-1595974482597-4b8dc7ef8c6c?q=80&w=2946&auto=format&fit=crop' }}
        style={styles.backgroundImage}
      />
      <View style={styles.content}>
        {/* Voice Search Button */}
        <TouchableOpacity
          style={[styles.voiceSearchButton, isListening && styles.listening]}
          onPress={handleVoiceSearch}
        >
          <Mic size={32} color="#FFFFFF" />
          <Text style={styles.searchButtonText}>
            {isListening ? `Listening... (${countdown}s)` : 'Speak to Search'}
          </Text>
        </TouchableOpacity>

        {/* Error Message */}
        {voiceError ? (
          <View style={styles.errorContainer}>
            <Text style={styles.errorText}>{voiceError}</Text>
          </View>
        ) : null}

        {/* Search Query Display */}
        {searchQuery ? (
          <View style={styles.queryContainer}>
            <Text style={styles.queryText}>Search: "{searchQuery}"</Text>
          </View>
        ) : null}

        {/* Status Messages */}
        {isProcessing && (
          <View style={styles.statusContainer}>
            <ActivityIndicator size="small" color="#007AFF" />
            <Text style={styles.statusText}>Finding the best matches...</Text>
          </View>
        )}

        {/* Results Section */}
        <View style={styles.resultsContainer}>
          {loading || isProcessing ? (
            <ActivityIndicator size="large" color="#007AFF" style={styles.loader} />
          ) : results.length > 0 || jobs.length > 0 ? (
            <FlatList
              data={results.length > 0 ? results : jobs}
              keyExtractor={(item) => item.id || Math.random().toString()}
              renderItem={renderJob}
              contentContainerStyle={styles.jobsList}
            />
          ) : searchQuery ? (
            <Text style={styles.noResultsText}>No jobs found. Try another search.</Text>
          ) : (
            <View style={styles.instructionsContainer}>
              <Text style={styles.instructionsText}>
                Tap the button above and speak to search for jobs
              </Text>
            </View>
          )}
        </View>
      </View>
    </View>
  );
}

// Import the distance calculation function directly if not using the utility directly
function getDistanceFromLatLonInKm(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371; // Radius of the earth in km
  const dLat = deg2rad(lat2 - lat1);
  const dLon = deg2rad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const d = R * c; // Distance in km
  return d;
}

function deg2rad(deg: number): number {
  return deg * (Math.PI / 180);
}

