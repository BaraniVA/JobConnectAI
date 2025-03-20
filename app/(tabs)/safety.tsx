import React, { useState } from 'react';
import { View, Text, TouchableOpacity, FlatList, StyleSheet, Image, ActivityIndicator } from 'react-native';
import * as Speech from 'expo-speech';
import { useSafetyTips, useRights } from '@/hooks/useFirestore';

export default function SafetyScreen() {
  const [activeTab, setActiveTab] = useState('safety');
  const { tips, loading: tipsLoading, error: tipsError } = useSafetyTips();
  const { rights, loading: rightsLoading, error: rightsError } = useRights();

  const loading = activeTab === 'safety' ? tipsLoading : rightsLoading;
  const error = activeTab === 'safety' ? tipsError : rightsError;
  const data = activeTab === 'safety' ? tips : rights;

  React.useEffect(() => {
    Speech.speak(
      activeTab === 'safety' 
        ? 'Here are important safety tips for your protection'
        : 'Know your rights as a worker',
      { language: 'en', rate: 0.8 }
    );
  }, [activeTab]);

  const speakText = (text) => {
    // Stop any current speech before starting new one
    Speech.stop();
    Speech.speak(text, { language: 'en', rate: 0.8 });
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#007AFF" />
        <Text style={styles.loadingText}>Loading {activeTab === 'safety' ? 'safety tips' : 'rights'}...</Text>
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

  const renderItem = ({ item }) => (
    <TouchableOpacity 
      style={styles.card}
      onPress={() => speakText(item.text)}
    >
      <Text style={styles.cardText}>{item.text}</Text>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <Image
        source={{ uri: 'https://images.unsplash.com/photo-1507537297725-24a1c029d3ca?q=80&w=2940&auto=format&fit=crop' }}
        style={styles.backgroundImage}
      />
      <View style={styles.content}>
        <View style={styles.tabContainer}>
          <TouchableOpacity
            style={[styles.tab, activeTab === 'safety' && styles.activeTab]}
            onPress={() => setActiveTab('safety')}>
            <Text style={[styles.tabText, activeTab === 'safety' && styles.activeTabText]}>
              Safety Tips
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.tab, activeTab === 'rights' && styles.activeTab]}
            onPress={() => setActiveTab('rights')}>
            <Text style={[styles.tabText, activeTab === 'rights' && styles.activeTabText]}>
              Know Your Rights
            </Text>
          </TouchableOpacity>
        </View>

        <FlatList
          data={data}
          renderItem={renderItem}
          keyExtractor={item => item.id}
          contentContainerStyle={styles.list}
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
  tabContainer: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  tab: {
    flex: 1,
    paddingVertical: 15,
    alignItems: 'center',
    backgroundColor: '#F5F5F5',
    borderRadius: 10,
    marginHorizontal: 5,
  },
  activeTab: {
    backgroundColor: '#007AFF',
  },
  tabText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#666666',
  },
  activeTabText: {
    color: '#FFFFFF',
  },
  list: {
    padding: 20,
  },
  card: {
    backgroundColor: '#FFFFFF',
    padding: 20,
    borderRadius: 10,
    marginBottom: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
    elevation: 3,
  },
  cardText: {
    fontSize: 16,
    color: '#333333',
    lineHeight: 24,
  },
});