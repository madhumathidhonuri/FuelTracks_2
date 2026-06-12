const calculateDistance = (lat1, lon1, lat2, lon2) => {
  if (!lat1 || !lon1 || !lat2 || !lon2) return 0;
  const R = 6371;
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
};

const toRad = (deg) => deg * (Math.PI / 180);

const calculateSpeed = (lat1, lon1, time1, lat2, lon2, time2) => {
  const distance = calculateDistance(lat1, lon1, lat2, lon2);
  const timeHours = (new Date(time2) - new Date(time1)) / 3600000;
  if (timeHours <= 0) return 0;
  return Math.round((distance / timeHours) * 100) / 100;
};

const isWithinGeofence = (pointLat, pointLon, centerLat, centerLon, radiusMeters) => {
  const distance = calculateDistance(pointLat, pointLon, centerLat, centerLon) * 1000;
  return distance <= radiusMeters;
};

const getHeadingDirection = (degrees) => {
  const directions = ['N', 'NE', 'E', 'SE', 'S', 'SW', 'W', 'NW'];
  const index = Math.round(degrees / 45) % 8;
  return directions[index];
};

const formatCoordinate = (lat, lon) => {
  const latDir = lat >= 0 ? 'N' : 'S';
  const lonDir = lon >= 0 ? 'E' : 'W';
  return `${Math.abs(lat).toFixed(6)}°${latDir}, ${Math.abs(lon).toFixed(6)}°${lonDir}`;
};

const interpolateLocation = (point1, point2, fraction) => {
  return {
    lat: point1.lat + (point2.lat - point1.lat) * fraction,
    lon: point1.lon + (point2.lon - point1.lon) * fraction,
  };
};

const getBoundingBox = (points) => {
  if (!points || points.length === 0) return null;
  let minLat = Infinity, maxLat = -Infinity;
  let minLon = Infinity, maxLon = -Infinity;
  points.forEach(p => {
    if (p.lat < minLat) minLat = p.lat;
    if (p.lat > maxLat) maxLat = p.lat;
    if (p.lon < minLon) minLon = p.lon;
    if (p.lon > maxLon) maxLon = p.lon;
  });
  return {
    sw: { lat: minLat, lon: minLon },
    ne: { lat: maxLat, lon: maxLon },
    center: { lat: (minLat + maxLat) / 2, lon: (minLon + maxLon) / 2 },
  };
};

module.exports = {
  calculateDistance,
  calculateSpeed,
  isWithinGeofence,
  getHeadingDirection,
  formatCoordinate,
  interpolateLocation,
  getBoundingBox,
};