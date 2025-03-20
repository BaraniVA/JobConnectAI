import React from 'react';
import { Platform, StyleSheet, View } from 'react-native';
import { WebView } from 'react-native-webview';
import Constants from 'expo-constants';

// Web map component using Google Maps iframe
const WebMap = ({ coordinates, title, style }) => {
  const apiKey = Constants.expoConfig?.extra?.GOOGLE_MAPS_API_KEY || '';
  const mapUrl = `https://www.google.com/maps/embed/v1/place?key=${apiKey}&q=${coordinates.latitude},${coordinates.longitude}&zoom=15`;

  return Platform.OS === 'web' ? (
    <iframe
      src={mapUrl}
      style={{
        border: 0,
        borderRadius: 10,
        width: '100%',
        height: '100%',
      }}
      allowFullScreen
      loading="lazy"
      referrerPolicy="no-referrer-when-downgrade"
      title={title}
    />
  ) : (
    <WebView
      style={[styles.map, style]}
      source={{ uri: mapUrl }}
      scrollEnabled={false}
    />
  );
};

// Lazy load react-native-maps for native platforms
const NativeMap = Platform.select({
  native: () => {
    const { default: MapView, Marker } = require('react-native-maps');
    return ({ coordinates, title, style }) => (
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
  },
  default: () => null,
})();

export interface MapProps {
  coordinates: {
    latitude: number;
    longitude: number;
  };
  title: string;
  style?: any;
}

export default function Map({ coordinates, title, style }: MapProps) {
  // Use WebMap for web platform
  if (Platform.OS === 'web') {
    return (
      <View style={[styles.container, style]}>
        <WebMap coordinates={coordinates} title={title} style={style} />
      </View>
    );
  }

  // Use NativeMap for native platforms
  return <NativeMap coordinates={coordinates} title={title} style={style} />;
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