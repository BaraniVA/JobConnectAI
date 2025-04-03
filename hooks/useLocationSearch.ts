import { useState, useEffect, useCallback } from 'react';
import LocationService, { Coordinates } from '../services/LocationService';
import { debounce } from 'lodash'; 

interface UseLocationSearchProps {
  language?: string;
}

const useLocationSearch = ({ language = 'en' }: UseLocationSearchProps = {}) => {
  const [searchText, setSearchText] = useState('');
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [selectedLocation, setSelectedLocation] = useState<{
    address: string;
    coordinates: Coordinates | null;
  } | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Debounced search function
  const debouncedSearch = useCallback(
    debounce(async (text: string) => {
      if (text.length < 3) {
        setSearchResults([]);
        setError(null);
        return;
      }

      setIsLoading(true);
      setError(null);

      try {
        const { results, error } = await LocationService.searchPlaces(text, language);
        
        if (error) {
          console.log('Search error:', error);
          setError(error);
          setSearchResults([]);
        } else {
          setSearchResults(results);
        }
      } catch (e) {
        setError('Failed to search locations');
        setSearchResults([]);
      } finally {
        setIsLoading(false);
      }
    }, 500),
    [language]
  );

  // Update search when text changes
  useEffect(() => {
    debouncedSearch(searchText);
    
    return () => {
      debouncedSearch.cancel();
    };
  }, [searchText, debouncedSearch]);

  // Handle location selection
  const selectLocation = async (placeId: string, description: string) => {
    setIsLoading(true);
    setError(null);

    try {
      const { details, error } = await LocationService.getPlaceDetails(placeId, language);
      
      if (error || !details) {
        setError(error || 'Failed to get location details');
        return false;
      }

      setSelectedLocation({
        address: details.address || description,
        coordinates: details.coordinates
      });
      
      return true;
    } catch (e) {
      setError('Failed to select location');
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  // Get current location
  const getCurrentLocation = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const { location, address, error } = await LocationService.getCurrentLocation();
      
      if (error || !location) {
        setError(error || 'Failed to get current location');
        return false;
      }

      setSelectedLocation({
        address: address || `${location.latitude.toFixed(4)}, ${location.longitude.toFixed(4)}`,
        coordinates: location
      });
      
      return true;
    } catch (e) {
      setError('Failed to get current location');
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  return {
    searchText,
    setSearchText,
    searchResults,
    selectedLocation,
    isLoading,
    error,
    selectLocation,
    getCurrentLocation,
    resetLocation: () => setSelectedLocation(null)
  };
};

export default useLocationSearch;