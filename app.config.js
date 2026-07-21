module.exports = ({ config }) => {
  const googleMapsApiKey = process.env.EXPO_PUBLIC_GOOGLE_MAPS_API_KEY;

  return {
    ...config,
    plugins: [
      ...(config.plugins || []),
      [
        'expo-location',
        {
          locationWhenInUsePermission: 'Permita que o Dine use sua localização para mostrar restaurantes próximos.'
        }
      ],
      [
        'expo-image-picker',
        {
          photosPermission: 'Permita que o Dine acesse suas fotos para publicar experiências no feed.'
        }
      ]
    ],
    ios: {
      ...config.ios,
      infoPlist: {
        ...config.ios?.infoPlist,
        NSLocationWhenInUseUsageDescription: 'Permita que o Dine use sua localização para mostrar restaurantes próximos.',
        NSPhotoLibraryUsageDescription: 'Permita que o Dine acesse suas fotos para publicar experiências no feed.'
      }
    },
    android: {
      ...config.android,
      permissions: [
        ...new Set([...(config.android?.permissions || []), 'android.permission.ACCESS_COARSE_LOCATION', 'android.permission.ACCESS_FINE_LOCATION'])
      ],
      config: {
        ...config.android?.config,
        ...(googleMapsApiKey ? { googleMaps: { apiKey: googleMapsApiKey } } : {})
      }
    }
  };
};
