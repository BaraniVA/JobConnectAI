import React from 'react';
import { Platform, StyleSheet, View } from 'react-native';
import { WebView } from 'react-native-webview';
import Constants from 'expo-constants';

// Import your secure web map component
let WebMapSecure: React.FC<MapProps> | null = null;
if (Platform.OS === 'web') {
  WebMapSecure = require('./WebMapSecure').default;
}

// WebView fallback for non-web platforms (if needed)
const WebViewMap = ({ coordinates, title, style }: MapProps) => {
  const apiKey = Constants.expoConfig?.extra?.GOOGLE_MAPS_API_KEY || '';
  const mapUrl = `https://www.google.com/maps/embed/v1/place?key=${apiKey}&q=${coordinates.latitude},${coordinates.longitude}&zoom=15`;

  return (
    <WebView
      style={[styles.map, style]}
      source={{ uri: mapUrl }}
      scrollEnabled={false}
    />
  );
};

// Lazy load react-native-maps for native platforms
let NativeMap: React.FC<MapProps> | null = null;
if (Platform.OS !== 'web') {
  const { default: MapView, Marker } = require('react-native-maps');
  NativeMap = ({ coordinates, title, style }: MapProps) => (
    <MapView
      style={[styles.map, style]}
      initialRegion={{
        ...coordinates,
        latitudeDelta: 0.0922,
        longitudeDelta: 0.0421,
      }}>
      <Marker coordinate={coordinates} title={title} />
    </MapView>
  );
}

export interface MapProps {
  coordinates: {
    latitude: number;
    longitude: number;
  };
  title: string;
  style?: any;
}

export default function Map({ coordinates, title, style }: MapProps) {
  // Use WebMapSecure for web platform
  if (Platform.OS === 'web' && WebMapSecure) {
    return <WebMapSecure coordinates={coordinates} title={title} style={style} />;
  }

  // Use NativeMap for native platforms
  if (NativeMap) {
    return <NativeMap coordinates={coordinates} title={title} style={style} />;
  }

  // Fallback to WebView
  return (
    <View style={[styles.container, style]}>
      <WebViewMap coordinates={coordinates} title={title} style={style} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    overflow: 'hidden',
    borderRadius: 10,
  },
  map: {
    width: '100%',
    height: '100%',
  },
});