import {StyleSheet } from 'react-native';

export const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: '#f5f5f5',
    },
    backgroundImage: {
      position: 'absolute',
      width: '100%',
      height: '100%',
      opacity: 0.15,
    },
    content: {
      flex: 1,
      padding: 16,
    },
    voiceSearchButton: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: '#007AFF',
      padding: 16,
      borderRadius: 10,
      marginTop: 150,
      marginVertical: 20,
      elevation: 3,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 4,
    },
    listening: {
      backgroundColor: '#FF3B30',
    },
    searchButtonText: {
      fontSize: 18,
      color: 'white',
      fontWeight: '600',
      marginLeft: 8,
    },
    resultsContainer: {
      flex: 1,
      marginTop: 16,
    },
    jobsList: {
      paddingBottom: 20,
    },
    jobCard: {
      backgroundColor: 'white',
      borderRadius: 12,
      padding: 16,
      marginBottom: 12,
      elevation: 2,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.1,
      shadowRadius: 2,
    },
    jobHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'flex-start',
      marginBottom: 8,
    },
    jobTitle: {
      fontSize: 18,
      fontWeight: 'bold',
      flex: 1,
    },
    jobLocation: {
      fontSize: 15,
      color: '#666',
      marginBottom: 8,
    },
    jobPay: {
      fontSize: 16,
      fontWeight: '600',
      color: '#007AFF',
      marginBottom: 8,
    },
    safetyBadge: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingHorizontal: 8,
      paddingVertical: 4,
      borderRadius: 8,
      alignSelf: 'flex-start',
    },
    safetyBadgeLow: {
      backgroundColor: 'rgba(76, 175, 80, 0.1)',
    },
    safetyTextLow: {
      color: '#4CAF50',
      fontSize: 14,
      marginLeft: 4,
    },
    safetyBadgeMedium: {
      backgroundColor: 'rgba(255, 152, 0, 0.1)',
    },
    safetyTextMedium: {
      color: '#FF9800',
      fontSize: 14,
      marginLeft: 4,
    },
    safetyBadgeHigh: {
      backgroundColor: 'rgba(244, 67, 54, 0.1)',
    },
    safetyTextHigh: {
      color: '#F44336',
      fontSize: 14,
      marginLeft: 4,
    },
    safetyText: {
      color: '#4CAF50',
      fontSize: 14,
      marginLeft: 4,
    },
    errorContainer: {
      backgroundColor: 'rgba(255, 59, 48, 0.1)',
      padding: 10,
      borderRadius: 8,
      marginBottom: 15,
    },
    errorText: {
      color: '#FF3B30',
      fontSize: 14,
    },
    queryContainer: {
      backgroundColor: 'rgba(0, 122, 255, 0.1)',
      padding: 10,
      borderRadius: 8,
      marginBottom: 15,
    },
    queryText: {
      color: '#007AFF',
      fontSize: 16,
    },
    statusContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: 15,
    },
    statusText: {
      marginLeft: 8,
      fontSize: 16,
      color: '#666',
    },
    loader: {
      marginTop: 40,
    },
    noResultsText: {
      textAlign: 'center',
      marginTop: 40,
      fontSize: 16,
      color: '#666',
    },
    instructionsContainer: {
      alignItems: 'center',
      justifyContent: 'center',
      marginTop: 40,
    },
    instructionsText: {
      fontSize: 16,
      color: '#666',
      textAlign: 'center',
      marginBottom: 20,
    },
  });