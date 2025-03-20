import React from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet, Image, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { Shield } from 'lucide-react-native';
import * as Speech from 'expo-speech';
import { useJobs } from '@/hooks/useFirestore';

export default function JobsScreen() {
  const router = useRouter();
  const { jobs, loading, error } = useJobs();

  React.useEffect(() => {
    Speech.speak('Here are all available jobs in your area', {
      language: 'en',
      rate: 0.8,
    });
  }, []);

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#007AFF" />
        <Text style={styles.loadingText}>Loading jobs...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>{error}</Text>
        <TouchableOpacity
          style={styles.retryButton}
          onPress={() => window.location.reload()}>
          <Text style={styles.retryButtonText}>Retry</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const renderJob = ({ item }) => (
    <TouchableOpacity
      style={styles.jobCard}
      onPress={() => router.push(`/job/${item.id}`)}>
      <View style={styles.jobHeader}>
        <Text style={styles.jobTitle}>{item.title}</Text>
        {item.verified && (
          <Shield size={20} color="#34C759" />
        )}
      </View>
      <Text style={styles.jobLocation}>{item.location}</Text>
      <View style={styles.jobFooter}>
        <Text style={styles.jobPay}>{item.pay}</Text>
        <Text style={[
          styles.safetyScore,
          { 
            color: item.safetyScore === 'Low Risk' 
              ? '#34C759' 
              : item.safetyScore === 'Medium Risk'
              ? '#FF9500'
              : '#FF3B30'
          }
        ]}>
          {item.safetyScore}
        </Text>
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <Image
        source={{ uri: 'https://images.unsplash.com/photo-1625246333195-78d9c38ad449?q=80&w=2940&auto=format&fit=crop' }}
        style={styles.backgroundImage}
      />
      <View style={styles.content}>
        <Text style={styles.title}>Available Jobs</Text>
        <FlatList
          data={jobs}
          renderItem={renderJob}
          keyExtractor={item => item.id}
          contentContainerStyle={styles.listContent}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: '#666666',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    padding: 20,
  },
  errorText: {
    fontSize: 16,
    color: '#FF3B30',
    textAlign: 'center',
    marginBottom: 20,
  },
  retryButton: {
    backgroundColor: '#007AFF',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
  },
  retryButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
  },
  backgroundImage: {
    width: '100%',
    height: 200,
    position: 'absolute',
    top: 0,
  },
  content: {
    flex: 1,
    paddingTop: 160,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 20,
    paddingHorizontal: 20,
    textShadowColor: 'rgba(0, 0, 0, 0.75)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 3,
  },
  listContent: {
    padding: 20,
  },
  jobCard: {
    backgroundColor: '#FFFFFF',
    padding: 15,
    borderRadius: 10,
    marginBottom: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
    elevation: 3,
  },
  jobHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 5,
  },
  jobTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#000000',
  },
  jobLocation: {
    fontSize: 16,
    color: '#666666',
    marginBottom: 10,
  },
  jobFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  jobPay: {
    fontSize: 16,
    color: '#007AFF',
    fontWeight: 'bold',
  },
  safetyScore: {
    fontSize: 14,
  },
});