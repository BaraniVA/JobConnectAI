import React, { useEffect, useRef } from 'react';
import { View, StyleSheet } from 'react-native';
import Constants from 'expo-constants';

interface WebMapSecureProps {
  coordinates: {
    latitude: number;
    longitude: number;
  };
  title: string;
  style?: any;
}

export default function WebMapSecure({ coordinates, title, style }: WebMapSecureProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const apiKey = Constants.expoConfig?.extra?.GOOGLE_MAPS_API_KEY || '';
  
  useEffect(() => {
    // Only load Google Maps script once
    if (!document.getElementById('google-maps-script') && apiKey) {
      const script = document.createElement('script');
      script.id = 'google-maps-script';
      script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&callback=initMap`;
      script.async = true;
      script.defer = true;
      
      // Define the callback function
      window.initMap = () => {
        if (mapRef.current && window.google) {
          const map = new window.google.maps.Map(mapRef.current, {
            center: { 
              lat: coordinates.latitude, 
              lng: coordinates.longitude 
            },
            zoom: 15,
          });
          
          new window.google.maps.Marker({
            position: { 
              lat: coordinates.latitude, 
              lng: coordinates.longitude 
            },
            map,
            title: title,
          });
        }
      };
      
      document.head.appendChild(script);
    } else if (window.google && mapRef.current) {
      // If Google Maps is already loaded, initialize map directly
      const map = new window.google.maps.Map(mapRef.current, {
        center: { 
          lat: coordinates.latitude, 
          lng: coordinates.longitude 
        },
        zoom: 15,
      });
      
      new window.google.maps.Marker({
        position: { 
          lat: coordinates.latitude, 
          lng: coordinates.longitude 
        },
        map,
        title: title,
      });
    }
  }, [coordinates, title, apiKey]);
  
  return (
    <View style={[styles.container, style]}>
      <div 
        ref={mapRef} 
        style={{ width: '100%', height: '100%', borderRadius: '10px' }}
        title={title}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    overflow: 'hidden',
    borderRadius: 10,
    width: '100%',
    height: '100%',
  },
});

// Add TypeScript definition for global window object
declare global {
  interface Window {
    google: any;
    initMap: () => void;
  }
}