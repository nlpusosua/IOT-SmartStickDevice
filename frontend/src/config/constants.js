export const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'http://35.186.145.70:8080/api';
export const WS_URL = process.env.REACT_APP_WS_URL || 'ws://35.186.145.70:8080/ws';
export const GOOGLE_MAPS_API_KEY = process.env.REACT_APP_GOOGLE_MAPS_API_KEY;

export const GEOFENCE_RADIUS = 500; // meters
export const MAP_DEFAULT_CENTER = { lat: 21.028511, lng: 105.804817 };
export const MAP_DEFAULT_ZOOM = 14;
export const LOCATION_UPDATE_INTERVAL = 10000; // 10 seconds

// export const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'http://localhost:8080/api';
// export const WS_URL = process.env.REACT_APP_WS_URL || 'ws://localhost:8080/ws';
// export const GOOGLE_MAPS_API_KEY = process.env.REACT_APP_GOOGLE_MAPS_API_KEY;