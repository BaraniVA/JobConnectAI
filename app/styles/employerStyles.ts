import {StyleSheet } from 'react-native';


export const styles = StyleSheet.create({
    safeArea: {
      flex: 1,
      backgroundColor: '#FFFFFF',
    },
    header: {
      flexDirection: 'row',
      alignItems: 'center',
      padding: 15,
      paddingTop: 50,
      borderBottomWidth: 1,
      borderBottomColor: '#E5E5E5',
    },
    backButton: {
      padding: 5,
    },
    headerTitle: {
      fontFamily: 'Roboto-Bold',
      fontSize: 18,
      marginLeft: 15,
    },
    container: {
      flex: 1,
      padding: 20,
    },
    title: {
      fontFamily: 'Roboto-Bold',
      fontSize: 24,
      marginBottom: 10,
      color: '#000000',
    },
    subtitle: {
      fontFamily: 'Roboto-Regular',
      fontSize: 16,
      color: '#6B7280',
      marginBottom: 20,
    },
    statusContainer: {
      backgroundColor: '#F0F9FF',
      padding: 10,
      borderRadius: 8,
      marginBottom: 20,
      alignItems: 'center',
    },
    statusText: {
      fontFamily: 'Roboto-Regular',
      color: '#007AFF',
      textAlign: 'center',
    },
    formGroup: {
      marginBottom: 20,
    },
    label: {
      fontFamily: 'Roboto-Medium',
      fontSize: 16,
      marginBottom: 8,
      color: '#000000',
    },
    inputContainer: {
      flexDirection: 'row',
      alignItems: 'center',
    },
    input: {
      flex: 1,
      fontFamily: 'Roboto-Regular',
      backgroundColor: '#F5F5F7',
      borderRadius: 8,
      padding: 12,
      fontSize: 16,
    },
    textArea: {
      height: 100,
      textAlignVertical: 'top',
    },
    voiceButton: {
      padding: 10,
      borderRadius: 25,
      backgroundColor: '#F5F5F7',
      marginLeft: 10,
      width: 40,
      height: 40,
      justifyContent: 'center',
      alignItems: 'center',
      alignSelf: 'center',
    },
    activeVoice: {
      backgroundColor: '#007AFF',
    },
    submitButton: {
      backgroundColor: '#4CAF50',
      padding: 15,
      borderRadius: 8,
      alignItems: 'center',
      marginVertical: 20,
    },
    submitButtonText: {
      fontFamily: 'Roboto-Bold',
      fontSize: 18,
      color: '#FFFFFF',
    },
    apiKeyWarning: {
      fontFamily: 'Roboto-Regular',
      fontSize: 14,
      color: '#FF0000',
      marginTop: 5,
    },
    // Add the missing styles
    locationHelpText: {
      backgroundColor: '#F0F9FF',
      padding: 10,
      borderRadius: 8,
      marginBottom: 10,
    },
    helpTextTitle: {
      fontFamily: 'Roboto-Medium',
      fontSize: 16,
      marginBottom: 5,
    },
    helpTextItem: {
      fontFamily: 'Roboto-Regular',
      fontSize: 14,
      color: '#4B5563',
      marginBottom: 3,
    },
    placesContainer: {
      marginTop: 5,
      marginBottom: 10,
      zIndex: 100,
    },
    currentLocationButton: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: '#007AFF',
      padding: 10,
      borderRadius: 8,
      marginTop: 10,
      justifyContent: 'center',
    },
    currentLocationText: {
      fontFamily: 'Roboto-Regular',
      fontSize: 16,
      color: '#FFFFFF',
      marginLeft: 5,
    },
    coordinatesContainer: {
      marginTop: 10,
    },
    coordinatesText: {
      fontFamily: 'Roboto-Regular',
      fontSize: 14,
      color: '#000000',
    },
    placeItem: {
      padding: 12,
      borderBottomWidth: 1,
      borderBottomColor: '#e0e0e0',
    },
    placeText: {
      fontSize: 14,
    },
    errorText: {
      color: 'red',
      marginTop: 4,
      fontSize: 12,
    },
    // Location search styles

    placesOuterContainer: {
      marginTop: 5,
      borderWidth: 1,
      borderColor: '#e0e0e0',
      borderRadius: 8,
      overflow: 'hidden',
    },
    placesResultsHeader: {
      padding: 8,
      backgroundColor: '#f8f8f8',
      fontSize: 12,
      fontWeight: 'bold',
      color: '#555',
      borderBottomWidth: 1,
      borderBottomColor: '#e0e0e0',
    },
    placesScrollView: {
      maxHeight: 172, // Allow space for the header
    },
    placesLoadingContainer: {
      padding: 15,
      flexDirection: 'row',
      justifyContent: 'center',
      alignItems: 'center',
      backgroundColor: '#f9f9f9',
    },
    placesLoadingText: {
      marginLeft: 8,
      color: '#666',
      fontSize: 14,
    },
    placeIcon: {
      marginRight: 8,
    },
    noResultsContainer: {
      padding: 15,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: '#f9f9f9',
    },
    noResultsText: {
      color: '#666',
      fontSize: 13,
      textAlign: 'center',
    },
    coordinatesBadge: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: '#e6f7ff',
      borderRadius: 15,
      paddingVertical: 4,
      paddingHorizontal: 10,
      alignSelf: 'flex-start',
      marginTop: 8,
    },
    
  });

export default styles;