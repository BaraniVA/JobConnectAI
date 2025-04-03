import Constants from 'expo-constants';
import * as Location from 'expo-location';
import { Platform, Alert, Linking } from 'react-native';

// Access the Places API key
const placesApiKey = Constants.expoConfig?.extra?.GOOGLE_MAPS_API_KEY;

export interface Coordinates {
  latitude: number;
  longitude: number;
}

class LocationService {
  // Search for places based on text input
  async searchPlaces(
    searchText: string, 
    language: string = 'en'
  ): Promise<{ results: any[], error: string | null }> {
    try {
      if (!placesApiKey) {
        return { 
          results: [], 
          error: "Google Places API key not configured" 
        };
      }

      if (!searchText || searchText.length < 3) {
        return { results: [], error: null }; // Not enough text to search
      }

      console.log(`Searching for: "${searchText}" in language: ${language}`);

      // Get language code for API
      const languageCode = this.getLanguageCode(language);
      
      // Use Places Autocomplete API
      const response = await fetch(
        `https://maps.googleapis.com/maps/api/place/autocomplete/json?input=${encodeURIComponent(searchText)}&key=${placesApiKey}&language=${languageCode}&types=geocode`
      );

      const data = await response.json();
      console.log('Places API response status:', data.status);

      if (data.status !== 'OK') {
        console.error('Places API error:', data.status, data.error_message);
        return { 
          results: [], 
          error: data.error_message || `Search failed: ${data.status}` 
        };
      }

      return { 
        results: data.predictions.map((place: any) => ({
          id: place.place_id,
          description: place.description,
          // Add more fields as needed
        })), 
        error: null 
      };
    } catch (error) {
      console.error('Error searching places:', error);
      return { 
        results: [], 
        error: "Network error while searching places" 
      };
    }
  }

  // Get details for a specific place by ID
  async getPlaceDetails(
    placeId: string, 
    language: string = 'en'
  ): Promise<{ details: any | null, error: string | null }> {
    try {
      if (!placesApiKey) {
        return { 
          details: null, 
          error: "Google Places API key not configured" 
        };
      }

      const languageCode = this.getLanguageCode(language);
      
      const response = await fetch(
        `https://maps.googleapis.com/maps/api/place/details/json?place_id=${placeId}&key=${placesApiKey}&language=${languageCode}&fields=formatted_address,geometry`
      );

      const data = await response.json();
      
      if (data.status !== 'OK') {
        return { 
          details: null, 
          error: data.error_message || `Details lookup failed: ${data.status}` 
        };
      }

      return { 
        details: {
          address: data.result.formatted_address,
          coordinates: {
            latitude: data.result.geometry.location.lat,
            longitude: data.result.geometry.location.lng
          }
        }, 
        error: null 
      };
    } catch (error) {
      console.error('Error getting place details:', error);
      return { 
        details: null, 
        error: "Network error while retrieving place details" 
      };
    }
  }

  // Get current location with proper error handling
  async getCurrentLocation(): Promise<{ 
    location: Coordinates | null, 
    address: string | null, 
    error: string | null 
  }> {
    try {
      // Get permission
      const { status } = await Location.requestForegroundPermissionsAsync();
      
      if (status !== 'granted') {
        return {
          location: null,
          address: null,
          error: 'Location permission denied'
        };
      }

      // Get current position
      const position = await Location.getCurrentPositionAsync({});
      
      const coordinates = {
        latitude: position.coords.latitude,
        longitude: position.coords.longitude
      };
      
      // Try to get address
      if (placesApiKey) {
        const address = await this.getAddressFromCoordinates(coordinates);
        return {
          location: coordinates,
          address,
          error: null
        };
      }
      
      return {
        location: coordinates,
        address: `${coordinates.latitude.toFixed(4)}, ${coordinates.longitude.toFixed(4)}`,
        error: null
      };
    } catch (error) {
      console.error('Error getting current location:', error);
      return {
        location: null,
        address: null,
        error: 'Failed to get current location'
      };
    }
  }

  // Reverse geocoding - get address from coordinates
  async getAddressFromCoordinates(coordinates: Coordinates): Promise<string | null> {
    try {
      if (!placesApiKey) return null;

      const response = await fetch(
        `https://maps.googleapis.com/maps/api/geocode/json?latlng=${coordinates.latitude},${coordinates.longitude}&key=${placesApiKey}`
      );
      
      const data = await response.json();
      
      if (data.results && data.results.length > 0) {
        return data.results[0].formatted_address;
      }
      
      return null;
    } catch (error) {
      console.error('Reverse geocoding error:', error);
      return null;
    }
  }
  
  // Convert language name to code
  private getLanguageCode(language: string): string {
    switch (language.toLowerCase()) {
      case 'tamil': return 'ta';
      case 'swahili': return 'sw';
      case 'telugu': return 'te';
      case 'malayalam': return 'ml';
      default: return 'en';
    }
  }
}

export default new LocationService();