import React, { useState, useEffect, useRef } from 'react';
import { View, Text, TouchableOpacity, FlatList, StyleSheet, Image, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { Mic, Shield } from 'lucide-react-native';
import * as Speech from 'expo-speech';
import { Audio } from 'expo-av';
import { useJobs } from '@/hooks/useFirestore';
import { enhanceVoiceSearch, processSearchQuery, searchJobs } from '../../utils/geminiService';

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
      const { recording } = await Audio.Recording.createAsync(
        Audio.RecordingOptionsPresets.HIGH_QUALITY
      );
      
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
      
      // Simulate a short delay for "processing"
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Demo phrases - in a real app, this would be the result from the speech recognition service
      const demoQueries = [
        "Farming",
        "Picking",
        "Constuctions"
      ];
      
      // Pick a random phrase for demonstration
      const transcribedText = demoQueries[Math.floor(Math.random() * demoQueries.length)];
      console.log('Simulated transcription:', transcribedText);
      
      // Process with Gemini
      processVoiceInput(transcribedText);
      
    } catch (error) {
      console.error('Error in speech recognition:', error);
      setVoiceError('Could not recognize speech');
      setIsProcessing(false);
    }
  };

  // Voice search handler (toggle recording)
  const handleVoiceSearch = async () => {
    if (isListening) {
      await stopRecording();
    } else {
      await startRecording();
    }
  };

  // Process voice input with Gemini (keep your existing function)
  const processVoiceInput = async (transcribedText: string) => {
    try {
      setIsProcessing(true);
      
      // Process with Gemini for better understanding
      const enhancedText = await enhanceVoiceSearch(transcribedText);
      setSearchQuery(enhancedText);
      
      // Provide audio feedback
      Speech.speak('Searching for ' + enhancedText, { rate: 0.9 });
      
      // Perform the search with enhanced text
      await handleAISearch(enhancedText);
    } catch (error) {
      console.error('Error processing voice input:', error);
      Speech.speak('Sorry, I had trouble processing your search', { rate: 0.9 });
    } finally {
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
        setResults(searchResults);
        console.log("✅ Results set with", searchResults.length, "jobs");
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

  // Render job item - complete implementation
  const renderJob = ({ item }: { item: any }) => (
    <TouchableOpacity
      style={styles.jobCard}
      onPress={() => router.push(`/job/${item.id}`)}
    >
      <View style={styles.jobHeader}>
        <Text style={styles.jobTitle}>{item.title || "Job Position"}</Text>
        <Text style={styles.jobCompany}>{item.company || "Company Name"}</Text>
      </View>
      <Text style={styles.jobLocation}>{item.location || "Location"}</Text>
      <Text style={styles.jobPay}>{item.salary || item.pay || "$15-20/hr"}</Text>
      {item.safetyScore && (
        <View style={styles.safetyBadge}>
          <Shield size={16} color="#4CAF50" />
          <Text style={styles.safetyText}>Safety Score: {item.safetyScore}</Text>
        </View>
      )}
    </TouchableOpacity>
  );

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

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  backgroundImage: {
    position: 'absolute',
    width: '100%',
    height: '100%',
    opacity: 0.15,
  },
  content: {
    flex: 1,
    padding: 16,
  },
  voiceSearchButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#007AFF',
    padding: 16,
    borderRadius: 10,
    marginTop: 150,
    marginVertical: 20,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  listening: {
    backgroundColor: '#FF3B30',
  },
  searchButtonText: {
    fontSize: 18,
    color: 'white',
    fontWeight: '600',
    marginLeft: 8,
  },
  resultsContainer: {
    flex: 1,
    marginTop: 16,
  },
  jobsList: {
    paddingBottom: 20,
  },
  jobCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  jobHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  jobTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    flex: 1,
  },
  jobCompany: {
    fontSize: 16,
    color: '#666',
  },
  jobLocation: {
    fontSize: 15,
    color: '#666',
    marginBottom: 8,
  },
  jobPay: {
    fontSize: 16,
    fontWeight: '600',
    color: '#007AFF',
    marginBottom: 8,
  },
  safetyBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(76, 175, 80, 0.1)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    alignSelf: 'flex-start',
  },
  safetyText: {
    color: '#4CAF50',
    fontSize: 14,
    marginLeft: 4,
  },
  errorContainer: {
    backgroundColor: 'rgba(255, 59, 48, 0.1)',
    padding: 10,
    borderRadius: 8,
    marginBottom: 15,
  },
  errorText: {
    color: '#FF3B30',
    fontSize: 14,
  },
  queryContainer: {
    backgroundColor: 'rgba(0, 122, 255, 0.1)',
    padding: 10,
    borderRadius: 8,
    marginBottom: 15,
  },
  queryText: {
    color: '#007AFF',
    fontSize: 16,
  },
  statusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
  },
  statusText: {
    marginLeft: 8,
    fontSize: 16,
    color: '#666',
  },
  loader: {
    marginTop: 40,
  },
  noResultsText: {
    textAlign: 'center',
    marginTop: 40,
    fontSize: 16,
    color: '#666',
  },
  instructionsContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 40,
  },
  instructionsText: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginBottom: 20,
  },
});