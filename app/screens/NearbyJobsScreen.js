import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, ActivityIndicator, StyleSheet } from 'react-native';
import useLocation from '../../hooks/useLocation';
import { filterByProximity } from '../../utils/proximitySearch';

// Example job data (replace with your actual data source)
const DUMMY_JOBS = [
  { 
    id: '1', 
    title: 'Software Engineer', 
    company: 'Tech Co', 
    location: { latitude: 37.7749, longitude: -122.4194 } // San Francisco
  },
  // Add more job listings with location data
];

export default function NearbyJobsScreen() {
  const { location, errorMsg, loading: locationLoading } = useLocation();
  const [nearbyJobs, setNearbyJobs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (location) {
      // In a real app, you might fetch jobs from an API here
      // For this example, we'll filter the dummy data
      const jobsNearby = filterByProximity(DUMMY_JOBS, location, 100); // 100km radius
      setNearbyJobs(jobsNearby);
      setLoading(false);
    } else if (!locationLoading && errorMsg) {
      setLoading(false);
    }
  }, [location, locationLoading, errorMsg]);

  if (loading || locationLoading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#0000ff" />
        <Text>Finding jobs near you...</Text>
      </View>
    );
  }

  if (errorMsg) {
    return (
      <View style={styles.centered}>
        <Text>Error: {errorMsg}</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Jobs Near You</Text>
      {nearbyJobs.length > 0 ? (
        <FlatList
          data={nearbyJobs}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <View style={styles.jobCard}>
              <Text style={styles.jobTitle}>{item.title}</Text>
              <Text>{item.company}</Text>
              <Text>{item.distance} km away</Text>
            </View>
          )}
        />
      ) : (
        <Text style={styles.noJobs}>No jobs found nearby</Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  jobCard: {
    padding: 16,
    marginBottom: 8,
    backgroundColor: '#f9f9f9',
    borderRadius: 8,
  },
  jobTitle: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  noJobs: {
    textAlign: 'center',
    marginTop: 20,
    fontSize: 16,
  },
});