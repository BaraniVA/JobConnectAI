import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, ActivityIndicator, Share as RNShare, Platform } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Share2, Flag, Info, ArrowLeft } from 'lucide-react-native';
import * as Speech from 'expo-speech';
import { collection, doc, getDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { reportJob } from '@/hooks/useFirestore';
import Map from '@/components/Map';
import type { Job } from '@/types/firebase';
import { analyzeJobSafety } from '../../utils/geminiService';

export default function JobDetailsScreen() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const [job, setJob] = useState<Job | null>(null);
  const [loading, setLoading] = useState(true);
  const [safetyAnalysis, setSafetyAnalysis] = useState<{ safetyScore: number; safetyNotes: string[] } | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchJob() {
      try {
        const jobRef = doc(collection(db, 'jobs'), id as string);
        const jobDoc = await getDoc(jobRef);
        
        if (jobDoc.exists()) {
          const jobData = { id: jobDoc.id, ...jobDoc.data() } as Job;
          setJob(jobData);
          Speech.speak(
            `This job is ${jobData.title} in ${jobData.location}, paying ${jobData.pay}. It is ${jobData.safetyScore}.`,
            { language: 'en', rate: 0.8 }
          );

          // Analyze job safety using Gemini API
          if (jobData?.description) {
            const safety = await analyzeJobSafety(jobData.description);
            setSafetyAnalysis(safety);
          }
        } else {
          setError('Job not found');
        }
      } catch (err) {
        setError('Failed to load job details');
      } finally {
        setLoading(false);
      }
    }

    fetchJob();
  }, [id]);

  const handleShare = async () => {
    if (!job) return;
    
    try {
      const shareText = `Job Opportunity: ${job.title} in ${job.location}\nPay: ${job.pay}\nSafety Score: ${job.safetyScore}\n\n${job.description}`;
      
      if (Platform.OS === 'web') {
        if (navigator.share) {
          await navigator.share({
            title: 'Job Opportunity',
            text: shareText,
          });
        } else {
          // Fallback for browsers that don't support Web Share API
          await navigator.clipboard.writeText(shareText);
          alert('Job details copied to clipboard!');
        }
      } else {
        await RNShare.share({
          message: shareText,
        });
      }
    } catch (error) {
      console.error('Error sharing:', error);
    }
  };

  const handleReport = async () => {
    if (!job) return;
    
    try {
      await reportJob(job.id, 'Suspicious job posting');
      Speech.speak('Thank you for reporting this job. We will investigate.', {
        language: 'en',
        rate: 0.8,
      });
    } catch (error) {
      console.error('Error reporting job:', error);
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#007AFF" />
        <Text style={styles.loadingText}>Loading job details...</Text>
      </View>
    );
  }

  if (error || !job) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>{error || 'Job not found'}</Text>
        <TouchableOpacity
          style={styles.retryButton}
          onPress={() => router.back()}>
          <Text style={styles.retryButtonText}>Go Back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const renderSafetyInfo = () => {
    if (!safetyAnalysis) return null;
    
    return (
      <View style={styles.safetyContainer}>
        <Text style={styles.safetyTitle}>Safety Score: {safetyAnalysis.safetyScore}/10</Text>
        <Text style={styles.safetySubtitle}>Safety Notes:</Text>
        {safetyAnalysis.safetyNotes.map((note, index) => (
          <Text key={index} style={styles.safetyNote}>• {note}</Text>
        ))}
      </View>
    );
  };

  return (
    <ScrollView style={styles.container}>
      <TouchableOpacity
        style={styles.backButton}
        onPress={() => router.back()}>
        <ArrowLeft size={24} color="#007AFF" />
      </TouchableOpacity>

      <View style={styles.header}>
        <Text style={styles.title}>{job.title}</Text>
        <Text style={styles.location}>{job.location}</Text>
        <Text style={styles.pay}>{job.pay}</Text>
        <Text style={[
          styles.safetyScore,
          { color: job.safetyScore === 'Low Risk' ? '#34C759' : '#FF9500' }
        ]}>
          {job.safetyScore}
        </Text>
      </View>

      <Text style={styles.description}>{job.description}</Text>

      <View style={styles.mapContainer}>
        <Map
          coordinates={job.coordinates}
          title={job.title}
          style={styles.map}
        />
      </View>

      {renderSafetyInfo()}

      <View style={styles.buttonContainer}>
        <TouchableOpacity style={styles.button} onPress={handleShare}>
          <Share2 size={24} color="#FFFFFF" />
          <Text style={styles.buttonText}>Share Job</Text>
        </TouchableOpacity>

        <TouchableOpacity style={[styles.button, styles.reportButton]} onPress={handleReport}>
          <Flag size={24} color="#FFFFFF" />
          <Text style={styles.buttonText}>Report Job</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.button, styles.safetyButton]}
          onPress={() => router.push('/safety')}>
          <Info size={24} color="#FFFFFF" />
          <Text style={styles.buttonText}>Safety Tips</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
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
    fontSize: 18,
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
  backButton: {
    padding: 20,
  },
  header: {
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#000000',
    marginBottom: 10,
  },
  location: {
    fontSize: 18,
    color: '#666666',
    marginBottom: 10,
  },
  pay: {
    fontSize: 20,
    color: '#007AFF',
    marginBottom: 10,
    fontWeight: 'bold',
  },
  safetyScore: {
    fontSize: 16,
    marginBottom: 20,
  },
  description: {
    fontSize: 16,
    color: '#333333',
    lineHeight: 24,
    padding: 20,
  },
  mapContainer: {
    height: 200,
    marginHorizontal: 20,
    marginBottom: 20,
    borderRadius: 10,
    overflow: 'hidden',
  },
  map: {
    flex: 1,
  },
  buttonContainer: {
    padding: 20,
    gap: 15,
  },
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#007AFF',
    padding: 15,
    borderRadius: 10,
  },
  reportButton: {
    backgroundColor: '#FF3B30',
  },
  safetyButton: {
    backgroundColor: '#34C759',
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 16,
    marginLeft: 10,
    fontWeight: 'bold',
  },
  safetyContainer: {
    marginTop: 20,
    padding: 15,
    backgroundColor: '#ffffff',
    borderRadius: 8,
  },
  safetyTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  safetySubtitle: {
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 5,
  },
  safetyNote: {
    fontSize: 14,
    marginBottom: 3,
    lineHeight: 20,
  },
});