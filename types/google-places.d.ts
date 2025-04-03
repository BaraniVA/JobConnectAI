import 'react-native-google-places-autocomplete';

declare module 'react-native-google-places-autocomplete' {
  interface GooglePlacesAutocompleteProps {
    sessionToken?: string;
  }
}