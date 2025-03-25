// Calculate distance between two coordinates in kilometers
export function getDistanceFromLatLonInKm(lat1, lon1, lat2, lon2) {
  const R = 6371; // Radius of the earth in km
  const dLat = deg2rad(lat2 - lat1);
  const dLon = deg2rad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const d = R * c; // Distance in km
  return d;
}

function deg2rad(deg) {
  return deg * (Math.PI / 180);
}

// Filter items by proximity
export function filterByProximity(jobs, userLocation, maxDistance = 50) {
  if (!userLocation || !jobs || jobs.length === 0) return [];
  
  const { latitude, longitude } = userLocation.coords;
  
  return jobs.filter(job => {
    // Skip jobs without location data
    if (!job.locationCoords) return false;
    
    const distance = getDistanceFromLatLonInKm(
      latitude,
      longitude,
      job.locationCoords.latitude,
      job.locationCoords.longitude
    );
    
    // Add the distance to the job
    job.distance = Math.round(distance * 10) / 10;
    
    return distance <= maxDistance;
  }).sort((a, b) => a.distance - b.distance); // Sort by closest first
}