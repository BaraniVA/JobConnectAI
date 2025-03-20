import React, { useState } from 'react';
import { View, Text, TouchableOpacity, FlatList, StyleSheet, Image, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { Mic, Shield } from 'lucide-react-native';
import * as Speech from 'expo-speech';
import { useJobs } from '@/hooks/useFirestore';
import { enhanceVoiceSearch, processSearchQuery, searchJobs } from '../../utils/geminiService';

export default function SearchScreen() {
  const router = useRouter();
  const [isListening, setIsListening] = useState(false);
  const [searchTerm, setSearchTerm] = useState<string>('');
  const { jobs, loading, error } = useJobs(searchTerm);
  const [searchQuery, setSearchQuery] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [results, setResults] = useState<any[]>([]);

  // AI search function - used by voice search
  const handleAISearch = async (query: string) => {
    if (!query.trim()) return;
    
    setIsProcessing(true);
    
    try {
      const processedQuery = await processSearchQuery(query);
      const searchResults = await searchJobs(
        processedQuery.keywords,
        processedQuery.filters
      );
      
      setResults(searchResults);
      // Also update searchTerm to trigger useJobs
      setSearchTerm(query);
    } catch (error) {
      console.error('Error during AI search:', error);
    } finally {
      setIsProcessing(false);
    }
  };

  // Simulated voice search for now
  // In a real app, you would use Speech Recognition API
  const handleVoiceSearch = async (transcribedText: string = '') => {
    // Toggle listening state for UI feedback
    setIsListening(true);
    
    // Simulate recording delay (1.5 seconds)
    setTimeout(async () => {
      try {
        // Use sample text for demo or the provided text
        const textToProcess = transcribedText || 'farming jobs near me';
        
        // Simulate speech-to-text completion
        console.log('Voice detected:', textToProcess);
        
        // Process with Gemini for better understanding
        const enhancedText = await enhanceVoiceSearch(textToProcess);
        setSearchQuery(enhancedText);
        
        // Perform the search with enhanced text
        await handleAISearch(enhancedText);
        
        // Provide audio feedback
        Speech.speak('Searching for ' + enhancedText, {
          rate: 0.9,
        });
      } catch (error) {
        console.error('Error during voice search:', error);
        Speech.speak('Sorry, I had trouble with that search', {
          rate: 0.9,
        });
      } finally {
        setIsListening(false);
      }
    }, 1500);
  };

  // Render job item
  const renderJob = ({ item }: { item: any }) => (
    <TouchableOpacity
      style={styles.jobCard}
      onPress={() => router.push(`/job/${item.id}`)}
    >
      <View style={styles.jobHeader}>
        <Text style={styles.jobTitle}>{item.title}</Text>
        {item.verified && (
          <Shield size={20} color="#34C759" />
        )}
      </View>
      <Text style={styles.jobLocation}>{item.location}</Text>
      <Text style={styles.jobPay}>{item.pay}</Text>
      {item.safetyScore && (
        <View style={styles.safetyBadge}>
          <Text style={styles.safetyText}>Safety: {item.safetyScore}/10</Text>
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
        {/* Voice Search Button - Centered and Prominent */}
        <TouchableOpacity
          style={[styles.voiceSearchButton, isListening && styles.listening]}
          onPress={() => handleVoiceSearch()}
        >
          <Mic size={32} color="#FFFFFF" />
          <Text style={styles.searchButtonText}>
            {isListening ? 'Listening...' : 'Speak to Search'}
          </Text>
        </TouchableOpacity>

        {/* Search Query Display */}
        {searchQuery ? (
          <View style={styles.queryContainer}>
            <Text style={styles.queryText}>
              Search: "{searchQuery}"
            </Text>
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
              keyExtractor={(item) => item.id}
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
              <Text style={styles.examplesTitle}>Try saying:</Text>
              <Text style={styles.exampleText}>"Find construction jobs"</Text>
              <Text style={styles.exampleText}>"Jobs near me"</Text>
              <Text style={styles.exampleText}>"Safe jobs with good pay"</Text>
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
    backgroundColor: '#FFFFFF',
  },
  backgroundImage: {
    position: 'absolute',
    width: '100%',
    height: '30%',
    opacity: 0.7,
  },
  content: {
    flex: 1,
    paddingTop: 100,
    paddingHorizontal: 20,
  },
  voiceSearchButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#007AFF',
    paddingVertical: 15,
    paddingHorizontal: 25,
    borderRadius: 10,
    marginTop: 50,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
    alignSelf: 'center',
    width: '100%',
  },
  listening: {
    backgroundColor: '#34C759',
    transform: [{ scale: 1.05 }],
  },
  searchButtonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: 'bold',
    marginLeft: 12,
  },
  queryContainer: {
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    padding: 10,
    borderRadius: 8,
    marginBottom: 15,
  },
  queryText: {
    fontSize: 16,
    fontWeight: '500',
  },
  statusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 15,
  },
  statusText: {
    marginLeft: 8,
    fontSize: 14,
    color: '#333',
  },
  resultsContainer: {
    flex: 1,
  },
  jobsList: {
    paddingBottom: 20,
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
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  instructionsText: {
    textAlign: 'center',
    fontSize: 18,
    color: '#333',
    marginBottom: 30,
  },
  examplesTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  exampleText: {
    fontSize: 16,
    color: '#007AFF',
    marginBottom: 8,
  },
  jobCard: {
    backgroundColor: 'white',
    borderRadius: 10,
    padding: 15,
    marginBottom: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  jobHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  jobTitle: {
    fontSize: 17,
    fontWeight: 'bold',
    flex: 1,
  },
  jobLocation: {
    fontSize: 15,
    color: '#666',
    marginBottom: 5,
  },
  jobPay: {
    fontSize: 15,
    color: '#34C759',
    fontWeight: '500',
  },
  safetyBadge: {
    backgroundColor: '#F2F2F7',
    borderRadius: 15,
    paddingHorizontal: 10,
    paddingVertical: 5,
    alignSelf: 'flex-start',
    marginTop: 8,
  },
  safetyText: {
    fontSize: 12,
    color: '#333',
  },
});