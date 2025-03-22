import React from 'react';
import { View, Text, StyleSheet, Linking } from 'react-native';

interface WebMapSimpleProps {
  coordinates: {
    latitude: number;
    longitude: number;
  };
  title: string;
  style?: any;
}

export default function WebMapSimple({ coordinates, title, style }: WebMapSimpleProps) {
  const { latitude, longitude } = coordinates;
  
  const openInGoogleMaps = () => {
    const url = `https://www.google.com/maps?q=${latitude},${longitude}`;
    Linking.openURL(url);
  };
  
  return (
    <View style={[styles.container, style]}>
      <View style={styles.infoContainer}>
        <Text style={styles.title}>{title}</Text>
        <Text style={styles.coordinates}>
          {latitude.toFixed(4)}, {longitude.toFixed(4)}
        </Text>
        <Text style={styles.linkText} onPress={openInGoogleMaps}>
          View on Google Maps
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    overflow: 'hidden',
    borderRadius: 10,
    backgroundColor: '#f0f0f0',
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  infoContainer: {
    padding: 16,
    alignItems: 'center',
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  coordinates: {
    fontSize: 14,
    color: '#666',
    marginBottom: 12,
  },
  linkText: {
    color: '#007bff',
    textDecorationLine: 'underline',
    marginTop: 8,
  }
});