export const mapOptions = {
  disableDefaultUI: false,
  zoomControl: true,
  streetViewControl: false,
  mapTypeControl: false,
  fullscreenControl: true,
  styles: [
    {
      featureType: 'poi',
      elementType: 'labels',
      stylers: [{ visibility: 'off' }]
    }
  ]
};

export const markerIcons = {
  online: 'http://maps.google.com/mapfiles/ms/icons/green-dot.png',
  offline: 'http://maps.google.com/mapfiles/ms/icons/grey-dot.png',
  sos: 'http://maps.google.com/mapfiles/ms/icons/red-dot.png',
  geofence_breach: 'http://maps.google.com/mapfiles/ms/icons/orange-dot.png'
};