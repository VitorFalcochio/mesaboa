import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  Alert,
  Animated,
  Image,
  KeyboardAvoidingView,
  Linking,
  Modal,
  Platform,
  Pressable,
  SafeAreaView,
  ScrollView,
  Share,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  useWindowDimensions,
  View
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { useFonts } from 'expo-font';
import { Baloo2_800ExtraBold } from '@expo-google-fonts/baloo-2/800ExtraBold';
import { Nunito_400Regular } from '@expo-google-fonts/nunito/400Regular';
import { Nunito_700Bold } from '@expo-google-fonts/nunito/700Bold';
import { Nunito_800ExtraBold } from '@expo-google-fonts/nunito/800ExtraBold';
import { StatusBar as ExpoStatusBar } from 'expo-status-bar';
import * as Location from 'expo-location';
import {
  fetchFavoritesFromDb,
  fetchOwnerRestaurantsFromDb,
  fetchPendingRestaurantsFromDb,
  fetchReviewsFromDb,
  fetchRestaurantsFromDb,
  firebaseReady,
  claimRestaurantInDb,
  createRestaurantInDb,
  recordRestaurantMetricInDb,
  saveFavoritesToDb,
  saveReviewToDb,
  saveUserProfileToDb,
  seedRestaurantsIfEmpty,
  updateRestaurantInDb,
  updateRestaurantStatusInDb,
  updateReviewInDb
} from './firebaseConfig';
import {
  areaOptions,
  achievementRules,
  categories,
  collections,
  defaultImage,
  dineRanks,
  fallbackPartnerCoordinates,
  pointRewards,
  radiusOptions,
  rioPretoRegion,
  seedRestaurants,
  tabs
} from './src/data/appData';

const colors = {
  bg: '#FFF6EA',
  surface: '#FFFDF7',
  cream: '#FFF6EA',
  red: '#E76F51',
  redDark: '#C84625',
  ochre: '#E4A042',
  olive: '#5E8B5A',
  teal: '#2A5C7D',
  ink: '#28282B',
  text: '#28282B',
  muted: '#6D6760',
  card: '#FFFDF7',
  line: 'rgba(40, 40, 43, 0.12)',
  softLine: 'rgba(40, 40, 43, 0.07)',
  green: '#5E8B5A',
  greenSoft: '#EEF4E7',
  gold: '#E4A042',
  orange: '#E76F51',
  navy: '#28282B',
  bordeaux: '#C84625',
  mustard: '#E4A042',
  pistachio: '#5E8B5A',
  lavender: '#2A5C7D',
  coral: '#E76F51'
};

const titleFont = Platform.select({ ios: 'Georgia', android: 'serif', default: 'serif' });
const bodyFont = 'Nunito_700Bold';

const dineLogo = require('./Designer/Logos/2.png');
const NativeMaps = Platform.OS !== 'web' ? require('react-native-maps') : null;
const MapView = NativeMaps?.default;
const Marker = NativeMaps?.Marker;
const storageKeys = {
  restaurants: 'mesaBoaRestaurantsRN',
  favorites: 'mesaBoaFavoritesRN',
  users: 'mesaBoaUsersRN',
  currentUser: 'mesaBoaCurrentUserRN'
};

function normalize(value) {
  return String(value || '').normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();
}

function scoreValue(item) {
  return Number(item.rating || 0);
}

function defaultGamification() {
  return {
    points: 0,
    metrics: { favorites: 0, maps: 0, reviews: 0, known: 0, likesGiven: 0, commentLikes: 0, invites: 0, collections: 0 },
    awarded: { favorites: [], maps: [], reviews: [], known: [], likes: [], collections: [], invites: [] },
    achievements: []
  };
}

function mergeGamification(value) {
  const base = defaultGamification();
  return {
    ...base,
    ...(value || {}),
    metrics: { ...base.metrics, ...(value?.metrics || {}) },
    awarded: { ...base.awarded, ...(value?.awarded || {}) },
    achievements: value?.achievements || []
  };
}

function rankForPoints(points) {
  const current = [...dineRanks].reverse().find((rank) => points >= rank.minPoints) || dineRanks[0];
  const next = dineRanks.find((rank) => rank.minPoints > points) || null;
  const previousMin = current.minPoints;
  const nextMin = next?.minPoints ?? current.minPoints;
  const progress = next ? Math.min(1, Math.max(0, (points - previousMin) / (nextMin - previousMin))) : 1;
  return { current, next, progress };
}

function earnedAchievements(gamification) {
  return achievementRules.filter((rule) => (gamification.metrics?.[rule.metric] || 0) >= rule.goal);
}

const gamificationEvents = {
  favorite: { awarded: 'favorites', metric: 'favorites' },
  map: { awarded: 'maps', metric: 'maps' },
  review: { awarded: 'reviews', metric: 'reviews' },
  known: { awarded: 'known', metric: 'known' },
  like: { awarded: 'likes', metric: 'likesGiven' },
  collection: { awarded: 'collections', metric: 'collections' },
  invite: { awarded: 'invites', metric: 'invites' }
};

function AppButton({ children, kind = 'primary', onPress, style }) {
  return (
    <Pressable accessibilityRole="button" hitSlop={6} onPress={onPress} style={({ pressed }) => [styles.button, styles[`${kind}Button`], pressed && styles.pressed, style]}>
      <Text style={[styles.buttonText, styles[`${kind}ButtonText`]]}>{children}</Text>
    </Pressable>
  );
}

function RestaurantCard({ item, favorite, onOpen, onFavorite }) {
  return (
    <Pressable accessibilityRole="button" accessibilityLabel={`Abrir restaurante ${item.name}`} onPress={() => onOpen(item)} style={({ pressed }) => [styles.restaurantCard, pressed && styles.pressed]}>
      <View style={styles.imageWrap}>
        <Image source={{ uri: item.image || defaultImage }} style={styles.restaurantImage} />
        <View style={styles.imageScrim} />
        <View style={[styles.openBadge, item.open && styles.openBadgeActive]}>
          <Text style={styles.openBadgeText}>{item.open ? 'Novidade' : 'Fechado'}</Text>
        </View>
        <Pressable accessibilityRole="button" accessibilityLabel={favorite ? `Remover ${item.name} dos favoritos` : `Salvar ${item.name} nos favoritos`} hitSlop={8} onPress={() => onFavorite(item.name)} style={({ pressed }) => [styles.heartButton, pressed && styles.activePress]}>
          <Ionicons name={favorite ? 'heart' : 'heart-outline'} size={22} color={colors.card} />
        </Pressable>
        <View style={styles.cardOverlay}>
          <Text style={styles.cardTitle}>{item.name}</Text>
          <Text style={styles.cardMeta}>{item.type} • {item.district}</Text>
          <View style={styles.cardScoreLine}>
            <Ionicons name="star" size={12} color="#fffaf1" />
            <Text style={styles.scoreText}>{scoreValue(item).toFixed(1)}</Text>
          </View>
        </View>
      </View>
    </Pressable>
  );
}

function MiniRestaurant({ item, onPress }) {
  return (
    <Pressable accessibilityRole="button" accessibilityLabel={`Abrir restaurante ${item.name}`} onPress={() => onPress(item)} style={({ pressed }) => [styles.miniItem, pressed && styles.pressed]}>
      <Image source={{ uri: item.image || defaultImage }} style={styles.miniImage} />
      <View style={styles.miniText}>
        <Text style={styles.miniTag}>Mais reservado</Text>
        <Text style={styles.miniTitle}>{item.name}</Text>
        <Text style={styles.meta}>{item.type}</Text>
        <Text style={styles.meta}>{item.district}</Text>
      </View>
      <View style={styles.miniScoreWrap}>
        <Ionicons name="star" size={14} color={colors.redDark} />
        <Text style={styles.miniScore}>{scoreValue(item).toFixed(1)}</Text>
      </View>
    </Pressable>
  );
}

function coordinateForRestaurant(item, index = 0) {
  const latitude = Number(item.latitude ?? item.lat);
  const longitude = Number(item.longitude ?? item.lng);
  if (Number.isFinite(latitude) && Number.isFinite(longitude)) return { latitude, longitude };
  return fallbackPartnerCoordinates[index % fallbackPartnerCoordinates.length];
}

function parseOptionalCoordinate(value) {
  const coordinate = Number(String(value || '').replace(',', '.'));
  return Number.isFinite(coordinate) ? coordinate : undefined;
}

function parseList(value) {
  return String(value || '')
    .split(/\n|,/)
    .map((item) => item.trim())
    .filter(Boolean);
}

function parsePhotos(value, coverPhoto) {
  const photos = parseList(value).map((url, index) => ({ id: `${index + 1}`, url, isCover: url === coverPhoto }));
  if (coverPhoto && !photos.some((photo) => photo.url === coverPhoto)) photos.unshift({ id: 'cover', url: coverPhoto, isCover: true });
  return photos.map((photo, index) => ({ ...photo, id: String(index + 1), isCover: photo.url === coverPhoto || (!coverPhoto && index === 0) }));
}

function parseMenuItems(value) {
  return String(value || '')
    .split('\n')
    .map((line) => line.trim())
    .filter(Boolean)
    .map((line, index) => {
      const [namePart, pricePart = ''] = line.split('|').map((part) => part.trim());
      return {
        id: `${Date.now()}-${index}`,
        name: namePart,
        price: Number(pricePart.replace(',', '.')) || 0
      };
    })
    .filter((item) => item.name);
}

function parseOpeningHours(value) {
  const base = {
    monday: '',
    tuesday: '',
    wednesday: '',
    thursday: '',
    friday: '',
    saturday: '',
    sunday: ''
  };
  String(value || '')
    .split('\n')
    .map((line) => line.trim())
    .filter(Boolean)
    .forEach((line) => {
      const separator = line.indexOf(':');
      const day = (separator >= 0 ? line.slice(0, separator) : line).trim();
      const hours = (separator >= 0 ? line.slice(separator + 1) : '').trim();
      const key = normalize(day);
      if (['segunda', 'monday'].includes(key)) base.monday = hours;
      if (['terca', 'terça', 'tuesday'].includes(key)) base.tuesday = hours;
      if (['quarta', 'wednesday'].includes(key)) base.wednesday = hours;
      if (['quinta', 'thursday'].includes(key)) base.thursday = hours;
      if (['sexta', 'friday'].includes(key)) base.friday = hours;
      if (['sabado', 'sábado', 'saturday'].includes(key)) base.saturday = hours;
      if (['domingo', 'sunday'].includes(key)) base.sunday = hours;
    });
  return base;
}

function restaurantToForm(item = {}) {
  return {
    ...item,
    photosText: (item.photos || []).map((photo) => photo.url).join('\n'),
    coverPhoto: item.coverPhoto || item.image || '',
    menuText: (item.menuItems || []).map((dish) => `${dish.name} | ${dish.price || ''}`).join('\n'),
    openingHoursText: item.openingHours
      ? Object.entries(item.openingHours).map(([day, hours]) => `${day}: ${hours}`).join('\n')
      : '',
    tagsText: (item.tags || []).join(', '),
    highlightsText: (item.highlights || []).join(', ')
  };
}

function distanceKm(from, to) {
  if (!from || !to) return null;
  const toRad = (value) => (value * Math.PI) / 180;
  const earthRadiusKm = 6371;
  const dLat = toRad(to.latitude - from.latitude);
  const dLon = toRad(to.longitude - from.longitude);
  const lat1 = toRad(from.latitude);
  const lat2 = toRad(to.latitude);
  const a = Math.sin(dLat / 2) ** 2 + Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLon / 2) ** 2;
  return earthRadiusKm * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

function formatDistance(value) {
  if (!Number.isFinite(value)) return 'Distância indisponível';
  if (value < 1) return `${Math.round(value * 1000)} m`;
  return `${value.toFixed(value < 10 ? 1 : 0)} km`;
}

function matchesQuickFilter(item, filter) {
  if (!filter) return true;
  if (filter === 'Aberto agora') return Boolean(item.open);
  if (filter === '4,5+') return scoreValue(item) >= 4.5;
  if (filter === 'Até R$80') return ['$', '$$'].includes(item.price);
  if (filter === 'Ao ar livre') return normalize(`${item.description} ${item.tags || ''}`).includes('ar livre');
  if (filter === 'Reserva') return Boolean(item.phone);
  return normalize(`${item.name} ${item.type} ${item.district}`).includes(normalize(filter));
}

function PartnerMap({ restaurants, onSelect, region, onRegionChange, userLocation, locationGranted }) {
  if (MapView && Marker) {
    return (
      <View style={styles.realMapCard}>
        <MapView
          style={styles.realMap}
          region={region}
          onRegionChangeComplete={onRegionChange}
          showsUserLocation={locationGranted}
          showsMyLocationButton={locationGranted}
          showsCompass
        >
          {userLocation ? (
            <Marker
              coordinate={userLocation}
              title="Você está aqui"
              description="Localização usada para calcular proximidade"
              pinColor="#2C97DE"
            />
          ) : null}
          {restaurants.map((item, index) => (
            <Marker
              key={item.id}
              coordinate={item.coordinate || coordinateForRestaurant(item, index)}
              title={item.name}
              description={`${item.type} - ${item.district}${Number.isFinite(item.distanceKm) ? ` • ${formatDistance(item.distanceKm)}` : ''}`}
              pinColor={index === 2 ? colors.olive : colors.redDark}
              onPress={() => onSelect(item)}
            />
          ))}
        </MapView>
      </View>
    );
  }

  return (
    <View style={styles.mapCard}>
      <View style={[styles.mapZone, styles.mapZoneNorth]} />
      <View style={[styles.mapZone, styles.mapZonePark]} />
      <View style={[styles.mapZone, styles.mapZoneCenter]} />
      <View style={[styles.mapRoad, styles.mapRoadMain]} />
      <View style={[styles.mapRoad, styles.mapRoadMainAlt]} />
      <View style={[styles.mapRoad, styles.mapRoadVertical]} />
      <View style={[styles.mapRoad, styles.mapRoadDiagonal]} />
      <View style={[styles.mapRoadThin, styles.mapRoadThinOne]} />
      <View style={[styles.mapRoadThin, styles.mapRoadThinTwo]} />
      <View style={[styles.mapRoadThin, styles.mapRoadThinThree]} />
      <View style={[styles.mapRoadThin, styles.mapRoadThinFour]} />
      <Text style={[styles.mapLabel, styles.mapLabelNorth]}>Vila Redentora</Text>
      <Text style={[styles.mapLabel, styles.mapLabelCenter]}>Centro</Text>
      <Text style={[styles.mapLabel, styles.mapLabelSouth]}>Boa Vista</Text>
      <View style={styles.mapCompass}>
        <Ionicons name="navigate" size={16} color={colors.redDark} />
        <Text style={styles.mapCompassText}>Dine</Text>
      </View>
      {restaurants.slice(0, 5).map((item, index) => (
        <Pressable key={item.id} onPress={() => onSelect(item)} style={[styles.mapPin, styles[`pin${index}`]]}>
          <View style={[styles.mapPinBubble, index === 2 && styles.mapPinBubbleAlt]}>
            <MaterialCommunityIcons name="silverware-fork-knife" size={16} color={colors.card} />
          </View>
          <View style={[styles.mapPinTip, index === 2 && styles.mapPinTipAlt]} />
          <View style={styles.mapPinLabel}>
            <Text numberOfLines={1} style={styles.mapPinName}>{item.name}</Text>
            <Text numberOfLines={1} style={styles.mapPinMeta}>{Number.isFinite(item.distanceKm) ? formatDistance(item.distanceKm) : item.type}</Text>
          </View>
        </Pressable>
      ))}
      <View style={styles.userDot} />
    </View>
  );
}

export default function App() {
  const { width } = useWindowDimensions();
  const compact = width < 380;
  const screenFade = useRef(new Animated.Value(1)).current;
  const [fontsLoaded] = useFonts({
    Baloo2_800ExtraBold,
    Nunito_400Regular,
    Nunito_700Bold,
    Nunito_800ExtraBold
  });
  const [tab, setTab] = useState('Explorar');
  const [restaurants, setRestaurants] = useState(seedRestaurants);
  const [favorites, setFavorites] = useState([]);
  const [users, setUsers] = useState([]);
  const [currentUser, setCurrentUser] = useState(null);
  const [query, setQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedRestaurant, setSelectedRestaurant] = useState(null);
  const [authMode, setAuthMode] = useState(null);
  const [pendingAction, setPendingAction] = useState(null);
  const [form, setForm] = useState({});
  const [hydrated, setHydrated] = useState(false);
  const [favoriteSegment, setFavoriteSegment] = useState('Salvos');
  const [selectedCollection, setSelectedCollection] = useState('Todas');
  const [collectionQuery, setCollectionQuery] = useState('');
  const [activeScreen, setActiveScreen] = useState(null);
  const [searchSort, setSearchSort] = useState('Proximidade');
  const [selectedArea, setSelectedArea] = useState(areaOptions[0].name);
  const [mapRegion, setMapRegion] = useState(rioPretoRegion);
  const [radiusKm, setRadiusKm] = useState(5);
  const [userLocation, setUserLocation] = useState(null);
  const [locationStatus, setLocationStatus] = useState('idle');
  const [locationMessage, setLocationMessage] = useState('Use sua localização para ordenar por distância real.');
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [ownerRestaurants, setOwnerRestaurants] = useState([]);
  const [pendingRestaurants, setPendingRestaurants] = useState([]);
  const [editingRestaurant, setEditingRestaurant] = useState(null);
  const isAdmin = Boolean(currentUser?.email && process.env.EXPO_PUBLIC_ADMIN_EMAIL && normalize(currentUser.email) === normalize(process.env.EXPO_PUBLIC_ADMIN_EMAIL));
  const [reviewsByRestaurant, setReviewsByRestaurant] = useState({});
  const [reviewDraft, setReviewDraft] = useState({ rating: '5', comment: '' });

  useEffect(() => {
    screenFade.setValue(0);
    Animated.timing(screenFade, {
      toValue: 1,
      duration: 180,
      useNativeDriver: true
    }).start();
  }, [tab, activeScreen?.name, screenFade]);

  useEffect(() => {
    async function load() {
      try {
        const [storedRestaurants, storedFavorites, storedUsers, storedCurrentUser] = await Promise.all([
          AsyncStorage.getItem(storageKeys.restaurants),
          AsyncStorage.getItem(storageKeys.favorites),
          AsyncStorage.getItem(storageKeys.users),
          AsyncStorage.getItem(storageKeys.currentUser)
        ]);
        const localUser = storedCurrentUser ? JSON.parse(storedCurrentUser) : null;

        if (storedRestaurants) setRestaurants(JSON.parse(storedRestaurants));
        if (storedFavorites) setFavorites(JSON.parse(storedFavorites));
        if (storedUsers) setUsers(JSON.parse(storedUsers).map((user) => ({ ...user, gamification: mergeGamification(user.gamification) })));
        if (localUser) setCurrentUser({ ...localUser, gamification: mergeGamification(localUser.gamification) });

        if (firebaseReady) {
          await seedRestaurantsIfEmpty(seedRestaurants);
          const remoteRestaurants = await fetchRestaurantsFromDb();
          if (remoteRestaurants?.length) setRestaurants(remoteRestaurants);
          if (localUser) {
            const remoteFavorites = await fetchFavoritesFromDb(localUser.id);
            if (remoteFavorites) setFavorites(remoteFavorites);
          }
        }
      } catch (error) {
        Alert.alert('Firebase', 'Não foi possível sincronizar agora. O app vai continuar usando os dados locais.');
      } finally {
        setHydrated(true);
      }
    }
    load();
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    AsyncStorage.setItem(storageKeys.restaurants, JSON.stringify(restaurants));
  }, [hydrated, restaurants]);

  useEffect(() => {
    if (!hydrated) return;
    AsyncStorage.setItem(storageKeys.favorites, JSON.stringify(favorites));
    if (currentUser) saveFavoritesToDb(currentUser.id, favorites).catch(() => {});
  }, [currentUser, favorites, hydrated]);

  useEffect(() => {
    if (!hydrated) return;
    AsyncStorage.setItem(storageKeys.users, JSON.stringify(users));
  }, [hydrated, users]);

  useEffect(() => {
    if (!hydrated || !currentUser) return;
    fetchFavoritesFromDb(currentUser.id)
      .then((remoteFavorites) => {
        if (remoteFavorites) setFavorites(remoteFavorites);
      })
      .catch(() => {});
  }, [currentUser, hydrated]);

  useEffect(() => {
    if (!hydrated || !currentUser) {
      setOwnerRestaurants([]);
      setPendingRestaurants([]);
      return;
    }
    fetchOwnerRestaurantsFromDb(currentUser.id)
      .then((items) => {
        if (items) setOwnerRestaurants(items);
      })
      .catch(() => {});
    if (isAdmin) {
      fetchPendingRestaurantsFromDb()
        .then((items) => {
          if (items) setPendingRestaurants(items);
        })
        .catch(() => {});
    }
  }, [currentUser, hydrated, isAdmin, restaurants]);

  useEffect(() => {
    if (!selectedRestaurant?.id) return;
    fetchReviewsFromDb(selectedRestaurant.id)
      .then((items) => {
        if (items) setReviewsByRestaurant((current) => ({ ...current, [selectedRestaurant.id]: items }));
      })
      .catch(() => {});
  }, [selectedRestaurant?.id]);

  const searchCenter = useMemo(() => ({
    latitude: mapRegion.latitude,
    longitude: mapRegion.longitude
  }), [mapRegion]);
  const publicRestaurants = useMemo(() => restaurants.filter((item) => !item.status || item.status === 'published'), [restaurants]);

  const nearbyRestaurants = useMemo(() => {
    const needle = normalize(query);
    return publicRestaurants
      .map((item, index) => {
        const coordinate = coordinateForRestaurant(item, index);
        const distanceFromUser = distanceKm(userLocation, coordinate);
        const distanceFromArea = distanceKm(searchCenter, coordinate);
        return {
          ...item,
          coordinate,
          distanceKm: distanceFromUser ?? distanceFromArea,
          distanceFromAreaKm: distanceFromArea
        };
      })
      .filter((item) => !needle || normalize(`${item.name} ${item.type} ${item.district} ${item.address}`).includes(needle))
      .filter((item) => matchesQuickFilter(item, selectedCategory))
      .filter((item) => !Number.isFinite(item.distanceFromAreaKm) || item.distanceFromAreaKm <= radiusKm)
      .sort((a, b) => {
        const distanceA = Number.isFinite(a.distanceKm) ? a.distanceKm : Number.POSITIVE_INFINITY;
        const distanceB = Number.isFinite(b.distanceKm) ? b.distanceKm : Number.POSITIVE_INFINITY;
        if (distanceA !== distanceB) return distanceA - distanceB;
        return scoreValue(b) - scoreValue(a);
      });
  }, [query, selectedCategory, publicRestaurants, radiusKm, searchCenter, userLocation]);

  const filteredRestaurants = nearbyRestaurants;
  const topRestaurants = useMemo(() => {
    if (userLocation) return nearbyRestaurants;
    return [...publicRestaurants].sort((a, b) => scoreValue(b) - scoreValue(a));
  }, [nearbyRestaurants, publicRestaurants, userLocation]);
  const favoriteRestaurants = restaurants.filter((item) => favorites.includes(item.name));

  function requireLogin(action) {
    if (currentUser) return true;
    setPendingAction(action);
    setAuthMode('login');
    return false;
  }

  function completePendingAction(user) {
    const action = pendingAction;
    setPendingAction(null);
    if (action?.type === 'tab') {
      setActiveScreen(null);
      setTab(action.target);
    }
    if (action?.type === 'favorite') toggleFavorite(action.name, user);
    if (action?.type === 'restaurant-register') navigateTo('restaurantRegister');
  }

  function toggleFavorite(name, user = currentUser) {
    if (!user && !requireLogin({ type: 'favorite', name })) return;
    setFavorites((items) => {
      const exists = items.includes(name);
      if (!exists) awardPoints('favorite', name);
      return exists ? items.filter((item) => item !== name) : [name, ...items];
    });
  }

  function handleTab(nextTab) {
    if (nextTab === 'Favoritos' && !requireLogin({ type: 'tab', target: nextTab })) return;
    setActiveScreen(null);
    setTab(nextTab);
  }

  function navigateTo(name, params = {}) {
    setActiveScreen({ name, params });
  }

  function goBack() {
    setActiveScreen(null);
  }

  function selectArea(area) {
    setSelectedArea(area.name);
    setMapRegion(area.region);
  }

  function clearMapFilters() {
    setSelectedCategory('');
    setRadiusKm(5);
    selectArea(areaOptions[0]);
  }

  function handleMapRegionChange(region) {
    setMapRegion(region);
    const matchedArea = areaOptions.find((area) => distanceKm(area.region, region) < 0.8);
    setSelectedArea(matchedArea?.name || 'Área do mapa');
  }

  async function requestUserLocation() {
    if (Platform.OS === 'web') {
      setLocationStatus('unavailable');
      setLocationMessage('No navegador, use cidade ou bairro para buscar por área.');
      return;
    }
    try {
      setLocationStatus('requesting');
      setLocationMessage('Pedindo permissão de localização...');
      const permission = await Location.requestForegroundPermissionsAsync();
      if (permission.status !== 'granted') {
        setLocationStatus('denied');
        setLocationMessage('Localização não autorizada. Você ainda pode buscar por cidade, bairro e raio.');
        return;
      }
      const position = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Balanced });
      const nextLocation = {
        latitude: position.coords.latitude,
        longitude: position.coords.longitude
      };
      setUserLocation(nextLocation);
      setLocationStatus('granted');
      setLocationMessage('Ordenando restaurantes pela sua distância real.');
      setSelectedArea('Perto de mim');
      setMapRegion({
        ...nextLocation,
        latitudeDelta: 0.035,
        longitudeDelta: 0.03
      });
    } catch (error) {
      setLocationStatus('unavailable');
      setLocationMessage('Não conseguimos acessar sua localização agora. Use cidade ou bairro como fallback.');
    }
  }

  function openNotifications() {
    navigateTo('notifications');
  }

  function openLocationPicker() {
    navigateTo('city');
  }

  async function saveCurrentUser(user) {
    const normalizedUser = { ...user, gamification: mergeGamification(user.gamification) };
    setCurrentUser(normalizedUser);
    await AsyncStorage.setItem(storageKeys.currentUser, JSON.stringify(normalizedUser));
    saveUserProfileToDb(normalizedUser).catch(() => {});
  }

  function awardPoints(type, targetId, amount = pointRewards[type] || 0) {
    if (!currentUser || !amount) return false;
    const event = gamificationEvents[type];
    if (!event) return false;
    const gamification = mergeGamification(currentUser.gamification);
    const awardedKey = event.awarded;
    const awardedList = gamification.awarded[awardedKey] || [];
    if (targetId && awardedList.includes(String(targetId))) return false;

    const nextGamification = {
      ...gamification,
      points: gamification.points + amount,
      metrics: {
        ...gamification.metrics,
        [event.metric]: (gamification.metrics[event.metric] || 0) + 1
      },
      awarded: {
        ...gamification.awarded,
        [awardedKey]: targetId ? [String(targetId), ...awardedList] : awardedList
      }
    };
    const achievements = earnedAchievements(nextGamification).map((item) => item.id);
    nextGamification.achievements = [...new Set([...(nextGamification.achievements || []), ...achievements])];

    const nextUser = { ...currentUser, gamification: nextGamification };
    setCurrentUser(nextUser);
    setUsers((items) => items.map((user) => (user.id === nextUser.id ? { ...user, gamification: nextGamification } : user)));
    AsyncStorage.setItem(storageKeys.currentUser, JSON.stringify(nextUser)).catch(() => {});
    saveUserProfileToDb(nextUser).catch(() => {});
    return true;
  }

  async function logout() {
    setCurrentUser(null);
    await AsyncStorage.removeItem(storageKeys.currentUser);
  }

  function submitAuth() {
    const email = normalize(form.email).trim();
    const password = String(form.password || '');
    if (!email || !password) {
      Alert.alert('Campos obrigatórios', 'Informe e-mail e senha para continuar.');
      return;
    }
    if (authMode === 'signup') {
      if (!form.name || password.length < 6) {
        Alert.alert('Cadastro', 'Informe seu nome e uma senha com pelo menos 6 caracteres.');
        return;
      }
      if (users.some((user) => normalize(user.email) === email)) {
        Alert.alert('Cadastro', 'Este e-mail já está cadastrado.');
        return;
      }
      const user = { id: String(Date.now()), name: form.name.trim(), email, gamification: defaultGamification() };
      setUsers((items) => [...items, { ...user, password }]);
      saveCurrentUser(user);
      setAuthMode(null);
      setForm({});
      completePendingAction(user);
      return;
    }
    const found = users.find((user) => normalize(user.email) === email && user.password === password);
    if (!found) {
      Alert.alert('Entrar', 'E-mail ou senha inválidos.');
      return;
    }
    const user = { id: found.id, name: found.name, email: found.email, gamification: mergeGamification(found.gamification) };
    saveCurrentUser(user);
    setAuthMode(null);
    setForm({});
    completePendingAction(user);
  }

  function submitRestaurant() {
    if (!form.name || !form.type || !form.district) {
      Alert.alert('Restaurante', 'Nome, tipo de comida e bairro são obrigatórios.');
      return;
    }
    const coverPhoto = form.coverPhoto || form.image || defaultImage;
    const photos = parsePhotos(form.photosText || form.image, coverPhoto);
    const item = {
      id: form.id || String(Date.now()),
      name: form.name.trim(),
      type: form.type.trim(),
      district: form.district.trim(),
      price: form.price || '$$',
      rating: Number(form.rating || 0) || 0,
      reviews: Number(form.reviews || 0) || 0,
      open: form.status !== 'paused' && form.status !== 'archived',
      status: form.status || 'pending',
      ownerId: currentUser?.id || form.ownerId || 'local',
      ownerName: currentUser?.name || form.ownerName || '',
      ownerEmail: currentUser?.email || form.ownerEmail || '',
      phone: form.phone || '',
      whatsapp: form.whatsapp || form.phone || '',
      instagram: form.instagram || '',
      reservationUrl: form.reservationUrl || '',
      address: form.address || '',
      latitude: parseOptionalCoordinate(form.latitude),
      longitude: parseOptionalCoordinate(form.longitude),
      geocodedAddress: {
        label: form.address || '',
        latitude: parseOptionalCoordinate(form.latitude),
        longitude: parseOptionalCoordinate(form.longitude)
      },
      image: coverPhoto,
      coverPhoto,
      photos,
      menuItems: parseMenuItems(form.menuText),
      openingHours: parseOpeningHours(form.openingHoursText),
      tags: parseList(form.tagsText),
      highlights: parseList(form.highlightsText),
      metrics: form.metrics || { views: 0, mapsClicks: 0, whatsappClicks: 0, reservationClicks: 0 },
      description: form.description || 'Restaurante cadastrado pelo app Dine.',
      approval: {
        status: form.status || 'pending',
        note: form.approvalNote || ''
      }
    };
    const nextRestaurants = restaurants.some((restaurant) => restaurant.id === item.id)
      ? restaurants.map((restaurant) => (restaurant.id === item.id ? item : restaurant))
      : [item, ...restaurants];
    setRestaurants(nextRestaurants);
    setOwnerRestaurants((items) => (items.some((restaurant) => restaurant.id === item.id)
      ? items.map((restaurant) => (restaurant.id === item.id ? item : restaurant))
      : [item, ...items]));
    const saveAction = form.id ? updateRestaurantInDb(item.id, item) : createRestaurantInDb(item);
    saveAction.catch(() => {
      Alert.alert('Firebase', 'O restaurante ficou salvo no aparelho, mas não sincronizou com o banco agora.');
    });
    setEditingRestaurant(null);
    setForm({});
    setActiveScreen(null);
    setTab('Perfil');
    Alert.alert('Restaurante salvo', `${item.name} foi enviado para aprovação.`);
  }

  function openMaps(item) {
    awardPoints('map', item.id);
    recordRestaurantMetricInDb(item.id, 'mapsClicks').catch(() => {});
    Linking.openURL(`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${item.name} ${item.address} São José do Rio Preto SP`)}`);
  }

  function openWhatsApp(item, reserve = false) {
    recordRestaurantMetricInDb(item.id, reserve ? 'reservationClicks' : 'whatsappClicks').catch(() => {});
    const message = reserve ? `Olá, quero reservar uma mesa no ${item.name}.` : `Olá, encontrei vocês pelo Dine.`;
    Linking.openURL(`https://wa.me/${item.whatsapp || item.phone || '5517999999999'}?text=${encodeURIComponent(message)}`);
  }

  function editRestaurant(item) {
    setEditingRestaurant(item);
    setForm(restaurantToForm(item));
    navigateTo('restaurantRegister');
  }

  function changeRestaurantStatus(item, status) {
    const updated = { ...item, status, open: status === 'published' };
    setRestaurants((items) => {
      const exists = items.some((restaurant) => restaurant.id === item.id);
      if (!exists && status === 'published') return [updated, ...items];
      return items.map((restaurant) => (restaurant.id === item.id ? updated : restaurant));
    });
    setOwnerRestaurants((items) => items.map((restaurant) => (restaurant.id === item.id ? updated : restaurant)));
    setPendingRestaurants((items) => items.filter((restaurant) => restaurant.id !== item.id));
    updateRestaurantStatusInDb(item.id, status, currentUser?.id).catch(() => {
      Alert.alert('Firebase', 'Não foi possível atualizar o status agora.');
    });
  }

  function claimRestaurant(item) {
    if (!currentUser && !requireLogin({ type: 'tab', target: 'Perfil' })) return;
    claimRestaurantInDb(item.id, currentUser).then(() => {
      Alert.alert('Reivindicação enviada', 'Um admin poderá aprovar sua solicitação.');
    }).catch(() => Alert.alert('Firebase', 'Não foi possível enviar a reivindicação agora.'));
  }

  function sortedReviews(restaurantId) {
    return [...(reviewsByRestaurant[restaurantId] || [])].sort((a, b) => Number(b.pinned || false) - Number(a.pinned || false) || Number(b.createdAtMs || 0) - Number(a.createdAtMs || 0));
  }

  function submitReview(item) {
    if (!currentUser && !requireLogin({ type: 'tab', target: 'Perfil' })) return;
    const comment = String(reviewDraft.comment || '').trim();
    const rating = Math.max(1, Math.min(5, Number(reviewDraft.rating || 5)));
    if (!comment) {
      Alert.alert('Comentário', 'Escreva um comentário para publicar.');
      return;
    }
    const review = {
      id: `${item.id}-${Date.now()}`,
      restaurantId: item.id,
      restaurantName: item.name,
      userId: currentUser.id,
      userName: currentUser.name,
      rating,
      comment,
      likes: 0,
      likedBy: [],
      pinned: false,
      createdAtMs: Date.now()
    };
    const existingReviews = reviewsByRestaurant[item.id] || [];
    const nextReviews = [review, ...existingReviews];
    const nextRating = nextReviews.reduce((sum, current) => sum + Number(current.rating || 0), 0) / nextReviews.length;
    setReviewsByRestaurant((current) => ({ ...current, [item.id]: nextReviews }));
    setRestaurants((items) => items.map((restaurant) => (
      restaurant.id === item.id ? { ...restaurant, rating: Number(nextRating.toFixed(1)), reviews: nextReviews.length } : restaurant
    )));
    awardPoints('review', item.id);
    setReviewDraft({ rating: '5', comment: '' });
    saveReviewToDb(review).catch(() => Alert.alert('Firebase', 'Comentário salvo localmente, mas não sincronizou agora.'));
    updateRestaurantInDb(item.id, { rating: Number(nextRating.toFixed(1)), reviews: nextReviews.length }).catch(() => {});
  }

  function toggleReviewLike(review) {
    if (!currentUser && !requireLogin({ type: 'tab', target: 'Perfil' })) return;
    const likedBy = review.likedBy || [];
    const liked = likedBy.includes(currentUser.id);
    if (!liked) awardPoints('like', review.id);
    const updated = {
      ...review,
      likedBy: liked ? likedBy.filter((id) => id !== currentUser.id) : [currentUser.id, ...likedBy],
      likes: Math.max(0, (review.likes || 0) + (liked ? -1 : 1))
    };
    setReviewsByRestaurant((current) => ({
      ...current,
      [review.restaurantId]: (current[review.restaurantId] || []).map((item) => (item.id === review.id ? updated : item))
    }));
    updateReviewInDb(review.id, { likedBy: updated.likedBy, likes: updated.likes }).catch(() => {});
  }

  function toggleReviewPin(review) {
    if (!isAdmin) return;
    const updated = { ...review, pinned: !review.pinned };
    setReviewsByRestaurant((current) => ({
      ...current,
      [review.restaurantId]: (current[review.restaurantId] || []).map((item) => (item.id === review.id ? updated : item))
    }));
    updateReviewInDb(review.id, { pinned: updated.pinned }).catch(() => {});
  }

  function markRestaurantKnown(item) {
    if (!currentUser && !requireLogin({ type: 'tab', target: 'Perfil' })) return;
    const awarded = awardPoints('known', item.id);
    Alert.alert(awarded ? 'Boa!' : 'Já estava no seu roteiro', awarded ? `Você ganhou ${pointRewards.known} pontos por conhecer ${item.name}.` : 'Esse restaurante já contou pontos para seu perfil.');
  }

  function renderHome() {
    return (
      <>
        <View style={styles.header}>
          <View style={styles.topRow}>
            <View style={styles.brandLockup}>
              <BrandLogo />
            </View>
            <Pressable accessibilityRole="button" accessibilityLabel="Abrir notificações" hitSlop={8} onPress={openNotifications} style={({ pressed }) => [styles.iconButton, pressed && styles.activePress]}>
              <Ionicons name="notifications-outline" size={23} color={colors.ink} />
            </Pressable>
          </View>
          <Pressable accessibilityRole="button" accessibilityLabel="Selecionar cidade ou região" hitSlop={6} onPress={openLocationPicker} style={({ pressed }) => [styles.locationRow, pressed && styles.activePress]}>
            <Ionicons name="location" size={18} color={colors.redDark} />
            <Text style={styles.locationText}>São José do Rio Preto</Text>
            <Ionicons name="chevron-down" size={16} color={colors.ink} />
          </Pressable>
        </View>

        <View style={styles.searchBar}>
          <Ionicons name="search-outline" size={25} color={colors.ink} />
          <TextInput
            value={query}
            onChangeText={setQuery}
            onSubmitEditing={() => navigateTo('results')}
            placeholder="Buscar restaurantes, cafés, bares..."
            placeholderTextColor="#918d86"
            style={styles.searchInput}
          />
          <Pressable accessibilityRole="button" accessibilityLabel="Abrir resultados de busca" hitSlop={6} onPress={() => navigateTo('results')} style={({ pressed }) => [styles.searchAction, pressed && styles.activePress]}>
            <Ionicons name="options-outline" size={21} color={colors.ink} />
          </Pressable>
        </View>

        <View style={styles.homeGuide}>
          <View style={styles.homeGuideCopy}>
            <Text style={styles.homeGuideTitle}>Encontre seu próximo lugar</Text>
            <Text style={styles.homeGuideText}>Comece pelo mapa para ver parceiros próximos ou escolha uma curadoria pronta.</Text>
          </View>
          <View style={styles.homeGuideActions}>
            <Pressable accessibilityRole="button" onPress={() => setTab('Mapa')} style={({ pressed }) => [styles.homeGuideButton, pressed && styles.pressed]}>
              <Ionicons name="map-outline" size={20} color={colors.card} />
              <Text style={styles.homeGuideButtonText}>Mapa</Text>
            </Pressable>
            <Pressable accessibilityRole="button" onPress={() => setTab('Coleções')} style={({ pressed }) => [styles.homeGuideButtonSecondary, pressed && styles.pressed]}>
              <Ionicons name="bookmark-outline" size={20} color={colors.redDark} />
              <Text style={styles.homeGuideButtonSecondaryText}>Coleções</Text>
            </Pressable>
          </View>
        </View>

        <SectionTitle title="Em alta agora" action="Ver todas" onPress={() => navigateTo('results', { title: 'Em alta agora' })} />
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.cardTrack}>
          {topRestaurants.slice(0, 6).map((item) => (
            <View key={item.id} style={[styles.trackCard, compact && styles.trackCardCompact]}>
              <RestaurantCard item={item} favorite={favorites.includes(item.name)} onOpen={setSelectedRestaurant} onFavorite={toggleFavorite} />
            </View>
          ))}
        </ScrollView>

        <SectionTitle title="Vale salvar" />
        <View style={styles.listStack}>
          {topRestaurants.slice(0, 4).map((item) => <MiniRestaurant key={item.id} item={item} onPress={setSelectedRestaurant} />)}
        </View>
      </>
    );
  }

  function renderSearch() {
    return (
      <View>
        <View style={styles.header}>
          <View style={styles.topRow}>
            <View style={styles.brandLockup}><BrandLogo /></View>
            <Pressable onPress={openNotifications} style={styles.iconButton}>
              <Ionicons name="notifications-outline" size={23} color={colors.ink} />
            </Pressable>
          </View>
        </View>
        <View style={styles.searchPageField}>
          <Ionicons name="search-outline" size={24} color={colors.ink} />
          <TextInput value={query} onChangeText={setQuery} placeholder="Buscar por bairro, cozinha ou nome" placeholderTextColor="#8A8179" style={styles.pageInput} />
          <Pressable accessibilityRole="button" accessibilityState={{ expanded: filtersOpen }} accessibilityLabel="Abrir filtros de busca" hitSlop={6} onPress={() => setFiltersOpen((value) => !value)} style={[styles.searchFilterButton, filtersOpen && styles.searchFilterButtonActive]}>
            <Ionicons name="options-outline" size={22} color={filtersOpen ? colors.card : colors.ink} />
          </Pressable>
        </View>
        <View style={styles.filterSummary}>
          <Ionicons name="location-outline" size={16} color={colors.redDark} />
          <Text numberOfLines={1} style={styles.filterSummaryText}>{selectedArea} • raio de {radiusKm} km{selectedCategory ? ` • ${selectedCategory}` : ''}</Text>
        </View>
        {filtersOpen ? (
          <View style={styles.filterDrawer}>
            <View style={styles.locationPanel}>
              <View style={styles.locationPanelCopy}>
                <Text style={styles.locationPanelTitle}>{selectedArea}</Text>
                <Text style={styles.locationPanelText}>{locationMessage}</Text>
              </View>
              <Pressable onPress={requestUserLocation} disabled={locationStatus === 'requesting'} style={styles.locateButton}>
                <Ionicons name="locate" size={18} color={colors.card} />
                <Text style={styles.locateButtonText}>{locationStatus === 'requesting' ? 'Buscando' : 'Usar localização'}</Text>
              </Pressable>
            </View>
            <Text style={styles.filterGroupTitle}>Cidade ou bairro</Text>
            <View style={styles.filterWrap}>
              {areaOptions.map((area) => (
                <Pressable
                  key={area.name}
                  onPress={() => selectArea(area)}
                  style={[styles.filterChip, selectedArea === area.name && styles.filterChipActive]}
                >
                  <Text style={[styles.filterChipText, selectedArea === area.name && styles.filterChipTextActive]}>{area.name}</Text>
                </Pressable>
              ))}
            </View>
            <Text style={styles.filterGroupTitle}>Raio</Text>
            <View style={styles.filterWrap}>
              {radiusOptions.map((value) => (
                <Pressable
                  key={value}
                  onPress={() => setRadiusKm(value)}
                  style={[styles.radiusChip, radiusKm === value && styles.radiusChipActive]}
                >
                  <Text style={[styles.radiusChipText, radiusKm === value && styles.radiusChipTextActive]}>{value} km</Text>
                </Pressable>
              ))}
            </View>
            <Text style={styles.filterGroupTitle}>Filtros</Text>
            <View style={styles.filterWrap}>
              {['Aberto agora', 'Até R$80', '4,5+', 'Ao ar livre', 'Reserva'].map((name) => (
                <Pressable
                  key={name}
                  onPress={() => setSelectedCategory(selectedCategory === name ? '' : name)}
                  style={[styles.filterChip, selectedCategory === name && styles.filterChipActive]}
                >
                  <Text style={[styles.filterChipText, selectedCategory === name && styles.filterChipTextActive]}>{name}</Text>
                </Pressable>
              ))}
            </View>
            <View style={styles.filterActions}>
              <Pressable onPress={clearMapFilters} style={styles.clearFiltersButton}>
                <Text style={styles.clearFiltersText}>Limpar filtros</Text>
              </Pressable>
              <Pressable onPress={() => setFiltersOpen(false)} style={styles.applyFiltersButton}>
                <Text style={styles.applyFiltersText}>Aplicar</Text>
              </Pressable>
            </View>
          </View>
        ) : null}
        <PartnerMap
          restaurants={filteredRestaurants.slice(0, 12)}
          onSelect={setSelectedRestaurant}
          region={mapRegion}
          onRegionChange={handleMapRegionChange}
          userLocation={userLocation}
          locationGranted={locationStatus === 'granted'}
        />
        <View style={styles.mapSheet}>
          <View style={styles.sheetHandle} />
          <SectionTitle title={`${filteredRestaurants.length} parceiros no raio`} action="Ver lista" onPress={() => navigateTo('results', { title: 'Parceiros nesta área' })} />
          {filteredRestaurants.length ? (
            <View style={styles.mapList}>
              {filteredRestaurants.slice(0, 8).map((item) => (
                <Pressable key={item.id} onPress={() => setSelectedRestaurant(item)} style={styles.mapListItem}>
                  <View style={styles.mapListPin}>
                    <MaterialCommunityIcons name="silverware-fork-knife" size={18} color={colors.card} />
                  </View>
                  <View style={styles.mapListText}>
                    <Text style={styles.mapListTitle}>{item.name}</Text>
                    <Text style={styles.mapListMeta}>{item.type} • {item.district}</Text>
                  </View>
                  <Text style={styles.mapListDistance}>{formatDistance(item.distanceKm)}</Text>
                </Pressable>
              ))}
            </View>
          ) : (
            <View style={styles.emptyState}>
              <Text style={styles.emptyTitle}>Nada nesse raio</Text>
              <Text style={styles.emptyText}>Aumente o raio ou escolha outro bairro para ver parceiros do Dine.</Text>
            </View>
          )}
          <View style={[styles.nearGrid, compact && styles.nearGridCompact]}>
            {filteredRestaurants.slice(0, 2).map((item) => (
              <View key={item.id} style={styles.nearCard}>
                <RestaurantCard item={item} favorite={favorites.includes(item.name)} onOpen={setSelectedRestaurant} onFavorite={toggleFavorite} />
              </View>
            ))}
          </View>
          <AppButton onPress={() => navigateTo('results', { title: 'Explorar nesta área' })}>Explorar nesta área</AppButton>
        </View>
      </View>
    );
  }

  function renderRankings() {
    const collectionFilters = ['Todas', 'Jantar', 'Cafés', 'Vista', 'Novos', 'Negócios'];
    const visibleCollections = collections.filter(([title, subtitle]) => {
      const haystack = normalize(`${title} ${subtitle}`);
      const matchesSearch = !collectionQuery || haystack.includes(normalize(collectionQuery));
      const matchesFilter = selectedCollection === 'Todas'
        || haystack.includes(normalize(selectedCollection))
        || (selectedCollection === 'Vista' && haystack.includes('rooftop'))
        || (selectedCollection === 'Novos' && haystack.includes('acabaram'))
        || (selectedCollection === 'Negócios' && haystack.includes('reunioes'));
      return matchesSearch && matchesFilter;
    });

    return (
      <View>
        <View style={styles.header}>
          <View style={styles.topRow}>
            <View style={styles.brandLockup}><BrandLogo /></View>
            <Pressable onPress={openNotifications} style={styles.iconButton}>
              <Ionicons name="notifications-outline" size={23} color={colors.ink} />
            </Pressable>
          </View>
          <Pressable onPress={openLocationPicker} style={styles.locationRow}>
            <Ionicons name="location" size={18} color={colors.redDark} />
            <Text style={styles.locationText}>São José do Rio Preto</Text>
            <Ionicons name="chevron-down" size={16} color={colors.ink} />
          </Pressable>
        </View>
        <PageTitle title="Coleções" subtitle={`${visibleCollections.length} listas filtradas para o momento que você quer viver.`} />
        <View style={styles.collectionSearch}>
          <Ionicons name="search-outline" size={22} color={colors.ink} />
          <TextInput
            value={collectionQuery}
            onChangeText={setCollectionQuery}
            placeholder="Buscar coleções"
            placeholderTextColor="#8A8179"
            style={styles.collectionSearchInput}
          />
        </View>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.chipRow}>
          {collectionFilters.map((name) => (
            <Pressable key={name} onPress={() => setSelectedCollection(name)} style={[styles.filterChip, selectedCollection === name && styles.filterChipActive]}>
              <Text style={[styles.filterChipText, selectedCollection === name && styles.filterChipTextActive]}>{name}</Text>
            </Pressable>
          ))}
        </ScrollView>
        <View style={styles.collectionGrid}>
          {visibleCollections.map(([title, subtitle, image]) => (
            <Pressable key={title} onPress={() => navigateTo('collectionDetail', { title, subtitle, image })} style={({ pressed }) => [styles.collectionCard, pressed && styles.pressed]}>
              <Image source={{ uri: image }} style={styles.collectionImage} />
              <View style={styles.collectionOverlay} />
              <Text style={styles.collectionTitle}>{title}</Text>
              <Text style={styles.collectionSubtitle}>{subtitle}</Text>
            </Pressable>
          ))}
          {!visibleCollections.length ? (
            <View style={styles.emptyState}>
              <Text style={styles.emptyTitle}>Nenhuma coleção encontrada</Text>
              <Text style={styles.emptyText}>Tente buscar por outro momento ou limpar os filtros.</Text>
            </View>
          ) : null}
        </View>
      </View>
    );
  }

  function renderFavorites() {
    return (
      <View>
        <View style={styles.header}>
          <View style={styles.topRow}>
            <View style={styles.brandLockup}><BrandLogo /></View>
            <Pressable onPress={openNotifications} style={styles.iconButton}>
              <Ionicons name="notifications-outline" size={23} color={colors.ink} />
            </Pressable>
          </View>
        </View>
        <PageTitle title="Favoritos" subtitle="Todos os lugares que você salvou para viver experiências incríveis." />
        <View style={styles.segmented}>
          {['Salvos', 'Quero conhecer', 'Já fui'].map((item) => (
            <Pressable key={item} onPress={() => setFavoriteSegment(item)} style={[styles.segment, favoriteSegment === item && styles.segmentActive]}>
              <Text style={[styles.segmentText, favoriteSegment === item && styles.segmentTextActive]}>{item}</Text>
            </Pressable>
          ))}
        </View>        <View style={styles.favoriteList}>
          {(favoriteRestaurants.length ? favoriteRestaurants : topRestaurants.slice(0, 4)).map((item) => <MiniRestaurant key={item.id} item={item} onPress={setSelectedRestaurant} />)}
        </View>
        <View style={styles.promoCard}>
          <View style={styles.promoCopy}>
            <Text style={styles.promoTitle}>Date night perfeito</Text>
            <Text style={styles.promoText}>Ambientes especiais para momentos inesquecíveis.</Text>
          </View>
          <Pressable onPress={() => setTab('Coleções')} style={styles.promoButton}>
            <Text style={styles.promoButtonText}>Ver lista completa</Text>
          </Pressable>
        </View>
      </View>
    );
  }

  function renderProfile() {
    const gamification = mergeGamification(currentUser?.gamification);
    const rank = rankForPoints(gamification.points);
    const achievements = earnedAchievements(gamification);
    return (
      <View>
        <View style={styles.profileTop}>
          <PageTitle title="Perfil" />
          <Pressable onPress={openNotifications} style={styles.iconButton}>
            <Ionicons name="notifications-outline" size={23} color={colors.ink} />
          </Pressable>
        </View>
        <View style={styles.profileHeader}>
          <View style={styles.profileAvatar}>
            <Text style={styles.profileAvatarText}>{currentUser ? currentUser.name.slice(0, 1).toUpperCase() : 'V'}</Text>
            <View style={styles.avatarEdit}><Ionicons name="pencil" size={14} color={colors.ink} /></View>
          </View>
          <View style={styles.profileNameWrap}>
            <Text style={styles.profileName}>{currentUser ? currentUser.name : 'Vitor'}</Text>
            <Text style={styles.profileBio}>{rank.current.name} • {rank.current.description}</Text>
          </View>
        </View>
        <View style={styles.rankCard}>
          <View style={styles.rankTopRow}>
            <View>
              <Text style={styles.rankLabel}>Seu rank</Text>
              <Text style={styles.rankName}>{rank.current.name}</Text>
            </View>
            <Text style={styles.rankPoints}>{gamification.points} pts</Text>
          </View>
          <View style={styles.rankProgressTrack}>
            <View style={[styles.rankProgressFill, { width: `${Math.round(rank.progress * 100)}%` }]} />
          </View>
          <Text style={styles.rankNextText}>
            {rank.next ? `Faltam ${rank.next.minPoints - gamification.points} pontos para ${rank.next.name}` : 'Você chegou ao topo do Dine.'}
          </Text>
        </View>
        <View style={styles.profileStats}>
          {[
            ['bookmark-outline', String(favorites.length), 'Lugares salvos'],
            ['star-outline', String(gamification.metrics.reviews || 0), 'Avaliações'],
            ['location-outline', String(gamification.metrics.known || 0), 'Conhecidos']
          ].map(([icon, value, label]) => (
            <View key={label} style={styles.profileStat}>
              <Ionicons name={icon} size={31} color={colors.redDark} />
              <Text style={styles.statValue}>{value}</Text>
              <Text style={styles.statLabel}>{label}</Text>
            </View>
          ))}
        </View>
        <View style={styles.curatorCard}>
          <View style={styles.curatorSeal}><Ionicons name="star" size={26} color={colors.olive} /></View>
          <View style={styles.curatorCopy}>
            <Text style={styles.panelTitle}>Curador por Local</Text>
            <Text style={styles.panelText}>Você está entre os exploradores que mais apoiam lugares incríveis.</Text>
          </View>
          <Text style={styles.levelPill}>Nível 2</Text>
        </View>
        <SectionTitle title="Conquistas" />
        <View style={styles.achievementGrid}>
          {achievementRules.map((rule) => {
            const achieved = achievements.some((item) => item.id === rule.id);
            const current = gamification.metrics[rule.metric] || 0;
            return (
              <View key={rule.id} style={[styles.achievementCard, achieved && styles.achievementCardActive]}>
                <Ionicons name={achieved ? 'ribbon' : 'ribbon-outline'} size={24} color={achieved ? colors.card : colors.redDark} />
                <Text style={[styles.achievementTitle, achieved && styles.achievementTitleActive]}>{rule.name}</Text>
                <Text style={[styles.achievementText, achieved && styles.achievementTextActive]}>{achieved ? rule.description : `${Math.min(current, rule.goal)}/${rule.goal}`}</Text>
              </View>
            );
          })}
        </View>
        <View style={styles.profileMenu}>
          {[
            ['heart-outline', 'Minhas preferências', 'Cozinhas, ambientes e mais', 'preferences'],
            ['time-outline', 'Histórico', 'Lugares que você visitou', 'history'],
            ['notifications-outline', 'Notificações', 'Novidades e atualizações', 'notifications'],
            ['people-outline', 'Convide amigos', 'Compartilhe o Dine e ganhe benefícios', 'invites'],
            ['settings-outline', 'Configurações', 'Conta, privacidade e mais', 'settings']
          ].map(([icon, title, subtitle, screen]) => (
            <Pressable key={title} onPress={() => navigateTo(screen)} style={styles.profileMenuItem}>
              <Ionicons name={icon} size={30} color={colors.redDark} />
              <View style={styles.profileMenuText}>
                <Text style={styles.profileMenuTitle}>{title}</Text>
                <Text style={styles.profileMenuSubtitle}>{subtitle}</Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color={colors.muted} />
            </Pressable>
          ))}
        </View>
        <View style={styles.promoCard}>
          <View style={styles.promoIcon}>
            <Ionicons name="star" size={24} color={colors.redDark} />
          </View>
          <View style={styles.promoCopy}>
            <Text style={styles.promoTitle}>Dine+</Text>
            <Text style={styles.promoText}>Mais benefícios, experiências e conteúdos exclusivos.</Text>
          </View>
          <Pressable onPress={() => navigateTo('dinePlus')} style={styles.promoButton}>
            <Text style={styles.promoButtonText}>Saiba mais</Text>
          </Pressable>
        </View>
        <View style={styles.pagePanel}>
          {currentUser ? (
            <View style={styles.actionGrid}>
              <AppButton kind="secondary" onPress={logout}>Sair</AppButton>
            </View>
          ) : (
            <>
              <Text style={styles.panelTitle}>Acesso do usuário</Text>
              <View style={styles.actionGrid}>
                <AppButton kind="secondary" onPress={() => { setAuthMode('login'); setForm({}); }}>Entrar</AppButton>
                <AppButton kind="secondary" onPress={() => { setAuthMode('signup'); setForm({}); }}>Criar conta</AppButton>
              </View>
            </>
          )}
          <AppButton onPress={() => currentUser ? (setForm({}), navigateTo('restaurantRegister')) : requireLogin({ type: 'restaurant-register' })}>Cadastrar restaurante</AppButton>
          {currentUser ? <AppButton kind="secondary" onPress={() => navigateTo('restaurantPanel')}>Painel do restaurante</AppButton> : null}
          {isAdmin ? <AppButton kind="secondary" onPress={() => navigateTo('adminApprovals')}>Aprovações admin</AppButton> : null}
        </View>
      </View>
    );
  }

  function renderScreenHeader(title, subtitle) {
    return (
      <View style={styles.subscreenHeader}>
        <Pressable onPress={goBack} style={styles.backButton}>
          <Ionicons name="chevron-back" size={24} color={colors.ink} />
        </Pressable>
        <View style={styles.subscreenTitleWrap}>
          <Text style={styles.subscreenTitle}>{title}</Text>
          {subtitle ? <Text style={styles.subscreenSubtitle}>{subtitle}</Text> : null}
        </View>
      </View>
    );
  }

  function renderResultControls() {
    return (
      <View style={styles.resultControls}>
        {['Proximidade', 'Nota', 'Nome'].map((item) => (
          <Pressable key={item} onPress={() => setSearchSort(item)} style={[styles.resultSortButton, searchSort === item && styles.resultSortButtonActive]}>
            <Text style={[styles.resultSortText, searchSort === item && styles.resultSortTextActive]}>{item}</Text>
          </Pressable>
        ))}
      </View>
    );
  }

  function renderSearchFilterDrawer() {
    if (!filtersOpen) return null;
    return (
      <View style={styles.filterDrawer}>
        <View style={styles.locationPanel}>
          <View style={styles.locationPanelCopy}>
            <Text style={styles.locationPanelTitle}>{selectedArea}</Text>
            <Text style={styles.locationPanelText}>{locationMessage}</Text>
          </View>
          <Pressable onPress={requestUserLocation} disabled={locationStatus === 'requesting'} style={styles.locateButton}>
            <Ionicons name="locate" size={18} color={colors.card} />
            <Text style={styles.locateButtonText}>{locationStatus === 'requesting' ? 'Buscando' : 'Usar localização'}</Text>
          </Pressable>
        </View>
        <Text style={styles.filterGroupTitle}>Cidade ou bairro</Text>
        <View style={styles.filterWrap}>
          {areaOptions.map((area) => (
            <Pressable key={area.name} onPress={() => selectArea(area)} style={[styles.filterChip, selectedArea === area.name && styles.filterChipActive]}>
              <Text style={[styles.filterChipText, selectedArea === area.name && styles.filterChipTextActive]}>{area.name}</Text>
            </Pressable>
          ))}
        </View>
        <Text style={styles.filterGroupTitle}>Raio</Text>
        <View style={styles.filterWrap}>
          {radiusOptions.map((value) => (
            <Pressable key={value} onPress={() => setRadiusKm(value)} style={[styles.radiusChip, radiusKm === value && styles.radiusChipActive]}>
              <Text style={[styles.radiusChipText, radiusKm === value && styles.radiusChipTextActive]}>{value} km</Text>
            </Pressable>
          ))}
        </View>
        <Text style={styles.filterGroupTitle}>Filtros</Text>
        <View style={styles.filterWrap}>
          {['Aberto agora', 'Até R$80', '4,5+', 'Ao ar livre', 'Reserva'].map((name) => (
            <Pressable key={name} onPress={() => setSelectedCategory(selectedCategory === name ? '' : name)} style={[styles.filterChip, selectedCategory === name && styles.filterChipActive]}>
              <Text style={[styles.filterChipText, selectedCategory === name && styles.filterChipTextActive]}>{name}</Text>
            </Pressable>
          ))}
        </View>
        <View style={styles.filterActions}>
          <Pressable onPress={clearMapFilters} style={styles.clearFiltersButton}>
            <Text style={styles.clearFiltersText}>Limpar filtros</Text>
          </Pressable>
          <Pressable onPress={() => setFiltersOpen(false)} style={styles.applyFiltersButton}>
            <Text style={styles.applyFiltersText}>Aplicar</Text>
          </Pressable>
        </View>
      </View>
    );
  }

  function sortedSearchResults() {
    return [...filteredRestaurants].sort((a, b) => {
      if (searchSort === 'Nota') return scoreValue(b) - scoreValue(a);
      if (searchSort === 'Nome') return a.name.localeCompare(b.name);
      return (a.distanceKm ?? 999) - (b.distanceKm ?? 999);
    });
  }

  function renderResultsScreen() {
    const results = sortedSearchResults();
    return (
      <View>
        {renderScreenHeader(activeScreen?.params?.title || 'Resultados', `${results.length} restaurantes encontrados`)}
        <View style={styles.searchPageField}>
          <Ionicons name="search-outline" size={24} color={colors.ink} />
          <TextInput value={query} onChangeText={setQuery} placeholder="Buscar por nome, bairro ou cozinha" placeholderTextColor="#8A8179" style={styles.pageInput} />
          <Pressable accessibilityRole="button" accessibilityState={{ expanded: filtersOpen }} accessibilityLabel="Abrir filtros de busca" hitSlop={6} onPress={() => setFiltersOpen((value) => !value)} style={[styles.searchFilterButton, filtersOpen && styles.searchFilterButtonActive]}>
            <Ionicons name="options-outline" size={22} color={filtersOpen ? colors.card : colors.ink} />
          </Pressable>
        </View>
        {renderSearchFilterDrawer()}
        {renderResultControls()}
        <View style={styles.listStack}>
          {results.map((item) => <MiniRestaurant key={item.id} item={item} onPress={setSelectedRestaurant} />)}
        </View>
        {!results.length ? <View style={styles.emptyState}><Text style={styles.emptyTitle}>Sem resultados</Text><Text style={styles.emptyText}>Ajuste busca, raio ou bairro para encontrar parceiros.</Text></View> : null}
      </View>
    );
  }

  function renderCollectionDetail() {
    const params = activeScreen?.params || {};
    const items = topRestaurants.slice(0, 6);
    return (
      <View>
        {renderScreenHeader(params.title || 'Coleção', params.subtitle)}
        {params.image ? <Image source={{ uri: params.image }} style={styles.collectionHero} /> : null}
        <View style={styles.listStack}>
          {items.map((item) => <MiniRestaurant key={item.id} item={item} onPress={setSelectedRestaurant} />)}
        </View>
        <AppButton onPress={() => navigateTo('results', { title: params.title || 'Resultados da coleção' })}>Ver todos desta coleção</AppButton>
      </View>
    );
  }

  function renderCityScreen() {
    return (
      <View>
        {renderScreenHeader('Cidade e região', 'Escolha onde o Dine deve buscar parceiros.')}
        <View style={styles.filterWrap}>
          {areaOptions.map((area) => (
            <Pressable key={area.name} onPress={() => { selectArea(area); setTab('Mapa'); goBack(); }} style={[styles.largeOption, selectedArea === area.name && styles.largeOptionActive]}>
              <Ionicons name="location-outline" size={22} color={selectedArea === area.name ? colors.card : colors.redDark} />
              <Text style={[styles.largeOptionText, selectedArea === area.name && styles.largeOptionTextActive]}>{area.name}</Text>
            </Pressable>
          ))}
        </View>
        <AppButton onPress={requestUserLocation}>Usar minha localização atual</AppButton>
      </View>
    );
  }

  function renderNotificationsScreen() {
    const items = ['Novos restaurantes entraram em curadoria hoje.', 'Sua lista de favoritos recebeu sugestões parecidas.', 'Restaurantes com reserva aberta para o fim de semana.'];
    return (
      <View>
        {renderScreenHeader('Notificações', 'Novidades e atualizações importantes.')}
        {items.map((item) => <View key={item} style={styles.infoRow}><Ionicons name="notifications-outline" size={22} color={colors.redDark} /><Text style={styles.infoRowText}>{item}</Text></View>)}
      </View>
    );
  }

  function renderPreferencesScreen() {
    return (
      <View>
        {renderScreenHeader('Preferências', 'Personalize cozinhas, momentos e ambiente.')}
        <View style={styles.filterWrap}>
          {[...categories.map(([name]) => name), 'Reserva', 'Ao ar livre', 'Pet friendly'].map((item) => (
            <Pressable key={item} style={styles.filterChip}><Text style={styles.filterChipText}>{item}</Text></Pressable>
          ))}
        </View>
      </View>
    );
  }

  function renderHistoryScreen() {
    return (
      <View>
        {renderScreenHeader('Histórico', 'Lugares vistos, salvos e visitados recentemente.')}
        <View style={styles.listStack}>
          {topRestaurants.slice(0, 5).map((item) => <MiniRestaurant key={item.id} item={item} onPress={setSelectedRestaurant} />)}
        </View>
      </View>
    );
  }

  function renderSettingsScreen() {
    return (
      <View>
        {renderScreenHeader('Configurações', 'Conta, privacidade e preferências do app.')}
        {['Dados da conta', 'Privacidade e localização', 'Notificações', 'Ajuda e suporte'].map((item) => (
          <View key={item} style={styles.infoRow}><Ionicons name="settings-outline" size={22} color={colors.redDark} /><Text style={styles.infoRowText}>{item}</Text></View>
        ))}
      </View>
    );
  }

  function renderInvitesScreen() {
    return (
      <View>
        {renderScreenHeader('Convites', 'Compartilhe o Dine e ganhe benefícios.')}
        <View style={styles.promoCard}><View style={styles.promoCopy}><Text style={styles.promoTitle}>Convide amigos</Text><Text style={styles.promoText}>Quando um amigo reservar por convite, você desbloqueia benefícios em parceiros.</Text></View></View>
        <AppButton onPress={() => Share.share({ message: 'Conheça o Dine e descubra restaurantes parceiros perto de você.' })}>Compartilhar convite</AppButton>
      </View>
    );
  }

  function renderDinePlusScreen() {
    return (
      <View>
        {renderScreenHeader('Dine+', 'Benefícios, experiências e curadorias exclusivas.')}
        {['Listas exclusivas de curadoria', 'Benefícios em restaurantes parceiros', 'Convites para experiências gastronômicas'].map((item) => (
          <View key={item} style={styles.infoRow}><Ionicons name="star-outline" size={22} color={colors.redDark} /><Text style={styles.infoRowText}>{item}</Text></View>
        ))}
        <AppButton onPress={() => navigateTo('results', { title: 'Parceiros Dine+' })}>Ver parceiros participantes</AppButton>
      </View>
    );
  }

  function renderRestaurantStatusPill(status) {
    const label = {
      pending: 'Pendente',
      published: 'Publicado',
      paused: 'Pausado',
      archived: 'Arquivado',
      rejected: 'Rejeitado'
    }[status || 'published'] || status;
    return <Text style={styles.statusPill}>{label}</Text>;
  }

  function renderRestaurantPanelScreen() {
    const items = ownerRestaurants.length ? ownerRestaurants : restaurants.filter((item) => item.ownerId === currentUser?.id);
    return (
      <View>
        {renderScreenHeader('Painel do restaurante', 'Edite dados, acompanhe métricas e gerencie publicação.')}
        {items.length ? items.map((item) => (
          <View key={item.id} style={styles.ownerCard}>
            <View style={styles.ownerCardHeader}>
              <View style={styles.ownerCardTitleWrap}>
                <Text style={styles.ownerCardTitle}>{item.name}</Text>
                <Text style={styles.ownerCardMeta}>{item.type} • {item.district}</Text>
              </View>
              {renderRestaurantStatusPill(item.status)}
            </View>
            <View style={styles.metricGrid}>
              {[
                ['Visualizações', item.metrics?.views || 0],
                ['Maps', item.metrics?.mapsClicks || 0],
                ['WhatsApp', item.metrics?.whatsappClicks || 0],
                ['Reservas', item.metrics?.reservationClicks || 0]
              ].map(([label, value]) => (
                <View key={label} style={styles.metricBox}>
                  <Text style={styles.metricValue}>{value}</Text>
                  <Text style={styles.metricLabel}>{label}</Text>
                </View>
              ))}
            </View>
            <View style={styles.ownerActions}>
              <AppButton kind="secondary" onPress={() => editRestaurant(item)}>Editar</AppButton>
              <AppButton kind="secondary" onPress={() => changeRestaurantStatus(item, item.status === 'paused' ? 'pending' : 'paused')}>{item.status === 'paused' ? 'Reativar' : 'Pausar'}</AppButton>
            </View>
            <AppButton kind="secondary" onPress={() => changeRestaurantStatus(item, 'archived')}>Arquivar</AppButton>
          </View>
        )) : (
          <View style={styles.emptyState}>
            <Text style={styles.emptyTitle}>Nenhum restaurante cadastrado</Text>
            <Text style={styles.emptyText}>Cadastre um restaurante para acompanhar aprovação, métricas e edição.</Text>
          </View>
        )}
        <AppButton onPress={() => { setEditingRestaurant(null); setForm({ status: 'pending' }); navigateTo('restaurantRegister'); }}>Cadastrar novo restaurante</AppButton>
      </View>
    );
  }

  function renderAdminApprovalsScreen() {
    return (
      <View>
        {renderScreenHeader('Aprovações admin', 'Revise restaurantes pendentes antes de publicar.')}
        {pendingRestaurants.length ? pendingRestaurants.map((item) => (
          <View key={item.id} style={styles.ownerCard}>
            <View style={styles.ownerCardHeader}>
              <View style={styles.ownerCardTitleWrap}>
                <Text style={styles.ownerCardTitle}>{item.name}</Text>
                <Text style={styles.ownerCardMeta}>{item.ownerEmail || 'Sem proprietário'} • {item.address}</Text>
              </View>
              {renderRestaurantStatusPill(item.status)}
            </View>
            <Text style={styles.panelText}>{item.description}</Text>
            <View style={styles.ownerActions}>
              <AppButton onPress={() => changeRestaurantStatus(item, 'published')}>Publicar</AppButton>
              <AppButton kind="secondary" onPress={() => changeRestaurantStatus(item, 'rejected')}>Rejeitar</AppButton>
            </View>
            <AppButton kind="secondary" onPress={() => editRestaurant(item)}>Editar antes de publicar</AppButton>
          </View>
        )) : (
          <View style={styles.emptyState}>
            <Text style={styles.emptyTitle}>Fila vazia</Text>
            <Text style={styles.emptyText}>Novos cadastros pendentes aparecerão aqui.</Text>
          </View>
        )}
      </View>
    );
  }

  function renderRestaurantRegisterScreen() {
    return (
      <View>
        {renderScreenHeader(editingRestaurant ? 'Editar restaurante' : 'Cadastrar restaurante', 'Dados completos para mapa, busca, aprovação e reservas.')}
        <View style={styles.pagePanel}>
          <Field label="Nome" value={form.name} onChangeText={(value) => setForm({ ...form, name: value })} />
          <Field label="Tipo de comida" value={form.type} onChangeText={(value) => setForm({ ...form, type: value })} />
          <Field label="Bairro" value={form.district} onChangeText={(value) => setForm({ ...form, district: value })} />
          <Field label="Faixa de preço" value={form.price} onChangeText={(value) => setForm({ ...form, price: value })} placeholder="$$" />
          <Field label="Endereço" value={form.address} onChangeText={(value) => setForm({ ...form, address: value })} />
          <Field label="Latitude" value={form.latitude} onChangeText={(value) => setForm({ ...form, latitude: value })} placeholder="-20.8126" keyboardType="numeric" />
          <Field label="Longitude" value={form.longitude} onChangeText={(value) => setForm({ ...form, longitude: value })} placeholder="-49.3768" keyboardType="numeric" />
          <Field label="Telefone" value={form.phone} onChangeText={(value) => setForm({ ...form, phone: value })} keyboardType="phone-pad" />
          <Field label="WhatsApp" value={form.whatsapp} onChangeText={(value) => setForm({ ...form, whatsapp: value })} keyboardType="phone-pad" />
          <Field label="Instagram" value={form.instagram} onChangeText={(value) => setForm({ ...form, instagram: value })} placeholder="https://instagram.com/..." />
          <Field label="Link de reserva" value={form.reservationUrl} onChangeText={(value) => setForm({ ...form, reservationUrl: value })} placeholder="https://..." />
          <Field label="Foto de capa" value={form.coverPhoto || form.image} onChangeText={(value) => setForm({ ...form, coverPhoto: value, image: value })} placeholder="https://..." />
          <Field label="Fotos extras" value={form.photosText} onChangeText={(value) => setForm({ ...form, photosText: value })} placeholder="Uma URL por linha" multiline />
          <Field label="Cardápio" value={form.menuText} onChangeText={(value) => setForm({ ...form, menuText: value })} placeholder="Prato | 49.90" multiline />
          <Field label="Horários" value={form.openingHoursText} onChangeText={(value) => setForm({ ...form, openingHoursText: value })} placeholder="segunda: 18:00-23:00" multiline />
          <Field label="Tags" value={form.tagsText} onChangeText={(value) => setForm({ ...form, tagsText: value })} placeholder="romântico, pet friendly" />
          <Field label="Destaques" value={form.highlightsText} onChangeText={(value) => setForm({ ...form, highlightsText: value })} placeholder="Carta de vinhos, varanda" />
          <Field label="Descrição" value={form.description} onChangeText={(value) => setForm({ ...form, description: value })} multiline />
          <AppButton onPress={submitRestaurant}>{editingRestaurant ? 'Salvar alterações' : 'Enviar para aprovação'}</AppButton>
        </View>
      </View>
    );
  }

  function renderAuxiliaryScreen() {
    const screens = {
      notifications: renderNotificationsScreen,
      city: renderCityScreen,
      preferences: renderPreferencesScreen,
      history: renderHistoryScreen,
      settings: renderSettingsScreen,
      invites: renderInvitesScreen,
      dinePlus: renderDinePlusScreen,
      results: renderResultsScreen,
      collectionDetail: renderCollectionDetail,
      restaurantRegister: renderRestaurantRegisterScreen,
      restaurantPanel: renderRestaurantPanelScreen,
      adminApprovals: renderAdminApprovalsScreen
    };
    return (screens[activeScreen?.name] || renderResultsScreen)();
  }

  const mainContent = {
    Explorar: renderHome,
    Coleções: renderRankings,
    Favoritos: renderFavorites,
    Mapa: renderSearch,
    Perfil: renderProfile
  }[tab]();
  const content = activeScreen ? renderAuxiliaryScreen() : mainContent;

  if (!fontsLoaded) return <SafeAreaView style={styles.safe} />;

  return (
    <SafeAreaView style={styles.safe}>
      <ExpoStatusBar style="dark" />
      <StatusBar barStyle="dark-content" />
      <ScrollView
        style={styles.screen}
        contentContainerStyle={[styles.screenContent, activeScreen && styles.screenContentSubscreen, compact && styles.screenContentCompact]}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <Animated.View style={{ opacity: screenFade, transform: [{ translateY: screenFade.interpolate({ inputRange: [0, 1], outputRange: [10, 0] }) }] }}>
          {content}
        </Animated.View>
      </ScrollView>
      {!activeScreen ? <View style={styles.bottomNav}>
        {tabs.map(([label, icon]) => (
          <Pressable key={label} accessibilityRole="tab" accessibilityState={{ selected: tab === label }} accessibilityLabel={`Ir para ${label}`} onPress={() => handleTab(label)} style={({ pressed }) => [styles.navButton, tab === label && styles.navButtonActive, pressed && styles.activePress]}>
            <Ionicons name={icon} size={22} color={tab === label ? colors.redDark : '#4E4B48'} />
            <Text style={[styles.navText, tab === label && styles.navTextActive]}>{label}</Text>
          </Pressable>
        ))}
      </View> : null}
      <RestaurantModal
        item={selectedRestaurant}
        onClose={() => setSelectedRestaurant(null)}
        onMaps={openMaps}
        onWhatsApp={openWhatsApp}
        onClaim={claimRestaurant}
        reviews={selectedRestaurant ? sortedReviews(selectedRestaurant.id) : []}
        reviewDraft={reviewDraft}
        setReviewDraft={setReviewDraft}
        onSubmitReview={submitReview}
        onLikeReview={toggleReviewLike}
        onPinReview={toggleReviewPin}
        onKnown={markRestaurantKnown}
        currentUser={currentUser}
        isAdmin={isAdmin}
        favorite={selectedRestaurant && favorites.includes(selectedRestaurant.name)}
        onFavorite={toggleFavorite}
      />
      <AuthModal
        mode={authMode}
        form={form}
        setForm={setForm}
        setMode={setAuthMode}
        onSubmitAuth={submitAuth}
      />
    </SafeAreaView>
  );
}

function SectionTitle({ title, action, onPress }) {
  return (
    <View style={styles.sectionTitle}>
      <Text style={styles.sectionTitleText}>{title}</Text>
      {action ? <Pressable onPress={onPress}><Text style={styles.sectionAction}>{action}</Text></Pressable> : null}
    </View>
  );
}

function BrandLogo() {
  return (
    <View style={styles.logoWrap}>
      <Image source={dineLogo} style={styles.logoImage} resizeMode="contain" />
    </View>
  );
}

function PageTitle({ kicker, title, subtitle }) {
  return (
    <View style={styles.pageTitle}>
      {kicker ? <Text style={styles.kicker}>{kicker}</Text> : null}
      <Text style={styles.pageTitleText}>{title}</Text>
      {subtitle ? <Text style={styles.pageSubtitle}>{subtitle}</Text> : null}
    </View>
  );
}

function RestaurantModal({
  item,
  onClose,
  onMaps,
  onWhatsApp,
  onClaim,
  reviews,
  reviewDraft,
  setReviewDraft,
  onSubmitReview,
  onLikeReview,
  onPinReview,
  onKnown,
  currentUser,
  isAdmin,
  favorite,
  onFavorite
}) {
  const [activeDetailTab, setActiveDetailTab] = useState('Sobre');
  useEffect(() => {
    if (item?.id) recordRestaurantMetricInDb(item.id, 'views').catch(() => {});
  }, [item?.id]);
  if (!item) return null;
  const tabContent = {
    Sobre: item.description,
    Menu: 'Pratos recomendados: prato assinatura, entrada especial e sobremesa da casa.',
    Fotos: 'Galeria com ambiente, pratos e momentos selecionados pela curadoria.',
    Avaliações: `${item.reviews || 0} avaliações de visitantes. Nota média ${scoreValue(item).toFixed(1)}.`
  }[activeDetailTab];
  return (
    <Modal visible transparent animationType="slide" onRequestClose={onClose}>
      <View style={styles.detailBackdrop}>
        <View style={styles.detailSheet}>
          <Image source={{ uri: item.image || defaultImage }} style={styles.detailImage} />
          <View style={styles.detailTopActions}>
            <Pressable onPress={onClose} style={styles.floatButton}>
              <Ionicons name="arrow-back" size={25} color={colors.ink} />
            </Pressable>
            <View style={styles.detailRightActions}>
              <Pressable onPress={() => Share.share({ message: `Conheça ${item.name} no Dine.` })} style={styles.floatButton}>
                <Ionicons name="share-outline" size={24} color={colors.ink} />
              </Pressable>
              <Pressable onPress={() => onFavorite(item.name)} style={styles.floatButton}>
                <Ionicons name={favorite ? 'heart' : 'heart-outline'} size={25} color={colors.redDark} />
              </Pressable>
            </View>
          </View>
          <ScrollView style={styles.detailBody} contentContainerStyle={styles.detailBodyContent} showsVerticalScrollIndicator={false}>
            <Text style={styles.detailTitle}>{item.name}</Text>
            <Text style={styles.detailSub}>{item.type} • {item.district}</Text>
            <View style={styles.detailMetaLine}>
              <Ionicons name="star" size={19} color={colors.redDark} />
              <Text style={styles.detailMetaText}>{scoreValue(item).toFixed(1)} ({item.reviews || 0})</Text>
              <Text style={styles.detailDot}>•</Text>
              <Text style={styles.detailMetaText}>{item.price}</Text>
              <Text style={styles.detailDot}>•</Text>
              <Text style={styles.detailMetaText}>1,2 km</Text>
            </View>
            <View style={styles.amenityRow}>
              {[
                ['calendar-outline', 'Reservas'],
                ['car-outline', 'Estacionamento'],
                ['leaf-outline', 'Pet friendly'],
                ['time-outline', 'Aberto até 23:00']
              ].map(([icon, label]) => (
                <View key={label} style={styles.amenityItem}>
                  <Ionicons name={icon} size={26} color={colors.olive} />
                  <Text style={styles.amenityText}>{label}</Text>
                </View>
              ))}
            </View>
            <View style={styles.detailTabs}>
              {['Sobre', 'Menu', 'Fotos', 'Avaliações'].map((label) => (
                <Pressable key={label} onPress={() => setActiveDetailTab(label)}>
                  <Text style={[styles.detailTab, activeDetailTab === label && styles.detailTabActive]}>{label}</Text>
                </Pressable>
              ))}
            </View>
            {activeDetailTab === 'Avaliações' ? (
              <View style={styles.reviewSection}>
                <View style={styles.reviewComposer}>
                  <Text style={styles.reviewComposerTitle}>Comente como {currentUser?.name || 'visitante'}</Text>
                  <View style={styles.reviewRatingRow}>
                    {[1, 2, 3, 4, 5].map((value) => (
                      <Pressable key={value} onPress={() => setReviewDraft({ ...reviewDraft, rating: String(value) })} hitSlop={8}>
                        <Ionicons name={Number(reviewDraft.rating || 5) >= value ? 'star' : 'star-outline'} size={25} color={colors.redDark} />
                      </Pressable>
                    ))}
                  </View>
                  <TextInput
                    value={reviewDraft.comment}
                    onChangeText={(value) => setReviewDraft({ ...reviewDraft, comment: value })}
                    placeholder="Conte como foi sua experiência..."
                    placeholderTextColor="#8A8179"
                    multiline
                    style={styles.reviewInput}
                  />
                  <AppButton onPress={() => onSubmitReview(item)}>Publicar avaliação</AppButton>
                </View>
                {reviews.length ? reviews.map((review) => {
                  const liked = currentUser && (review.likedBy || []).includes(currentUser.id);
                  return (
                    <View key={review.id} style={[styles.reviewCard, review.pinned && styles.reviewCardPinned]}>
                      <View style={styles.reviewHeader}>
                        <View style={styles.reviewAvatar}><Text style={styles.reviewAvatarText}>{String(review.userName || 'D').slice(0, 1).toUpperCase()}</Text></View>
                        <View style={styles.reviewHeaderText}>
                          <Text style={styles.reviewAuthor}>{review.userName || 'Visitante'}</Text>
                          <Text style={styles.reviewMeta}>{review.rating} estrelas{review.pinned ? ' • fixado' : ''}</Text>
                        </View>
                      </View>
                      <Text style={styles.reviewComment}>{review.comment}</Text>
                      <View style={styles.reviewActions}>
                        <Pressable onPress={() => onLikeReview(review)} style={styles.reviewActionButton}>
                          <Ionicons name={liked ? 'heart' : 'heart-outline'} size={20} color={liked ? colors.redDark : colors.ink} />
                          <Text style={styles.reviewActionText}>{review.likes || 0}</Text>
                        </Pressable>
                        {isAdmin ? (
                          <Pressable onPress={() => onPinReview(review)} style={styles.reviewActionButton}>
                            <Ionicons name={review.pinned ? 'pin' : 'pin-outline'} size={20} color={colors.ink} />
                            <Text style={styles.reviewActionText}>{review.pinned ? 'Desfixar' : 'Fixar'}</Text>
                          </Pressable>
                        ) : null}
                      </View>
                    </View>
                  );
                }) : <Text style={styles.detailText}>Ainda não há comentários. Seja a primeira pessoa a avaliar.</Text>}
              </View>
            ) : (
              <>
                <Text style={styles.detailText}>{tabContent}</Text>
                <View style={styles.tagPills}>
                  {['Cozinha autoral', 'Ingredientes sazonais', 'Carta de vinhos exclusiva'].map((tag) => (
                    <View key={tag} style={styles.detailTag}><Text style={styles.detailTagText}>{tag}</Text></View>
                  ))}
                </View>
              </>
            )}
            <Text style={styles.detailAddress}>{item.address}</Text>
            <AppButton kind="secondary" onPress={() => onKnown(item)}>Conheci este lugar</AppButton>
            <AppButton onPress={() => item.reservationUrl ? Linking.openURL(item.reservationUrl) : onWhatsApp(item, true)} style={styles.reserveButton}>Reservar</AppButton>
            <AppButton kind="secondary" onPress={() => onClaim(item)}>Reivindicar restaurante</AppButton>
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}

function AuthModal({ mode, form, setForm, setMode, onSubmitAuth }) {
  if (!mode) return null;
  const title = mode === 'login' ? 'Acesse sua conta' : mode === 'signup' ? 'Comece no Dine' : 'Cadastrar restaurante';
  return (
    <Modal visible transparent animationType="slide" onRequestClose={() => setMode(null)}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={styles.modalBackdrop}>
        <ScrollView contentContainerStyle={styles.authSheet}>
          <Pressable onPress={() => setMode(null)} style={styles.closeButton}>
            <Ionicons name="close" size={22} color={colors.green} />
          </Pressable>
          <Text style={styles.kicker}>{mode === 'login' ? 'Entrar' : 'Criar conta'}</Text>
          <Text style={styles.pageTitleText}>{title}</Text>
          {mode === 'signup' ? <Field label="Nome" value={form.name} onChangeText={(value) => setForm({ ...form, name: value })} /> : null}
          <Field label="E-mail" value={form.email} onChangeText={(value) => setForm({ ...form, email: value })} keyboardType="email-address" autoCapitalize="none" />
          <Field label="Senha" value={form.password} onChangeText={(value) => setForm({ ...form, password: value })} secureTextEntry />
          <AppButton onPress={onSubmitAuth}>{mode === 'login' ? 'Entrar' : 'Criar conta'}</AppButton>
          <AppButton kind="secondary" onPress={() => setMode(mode === 'login' ? 'signup' : 'login')}>
            {mode === 'login' ? 'Criar nova conta' : 'Já tenho conta'}
          </AppButton>
        </ScrollView>
      </KeyboardAvoidingView>
    </Modal>
  );
}

function Field({ label, ...props }) {
  return (
    <View style={styles.field}>
      <Text style={styles.fieldLabel}>{label}</Text>
      <TextInput placeholderTextColor="#a19a90" style={[styles.fieldInput, props.multiline && styles.fieldTextarea]} {...props} />
    </View>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.bg },
  screen: { flex: 1, backgroundColor: colors.bg },
  screenContent: { paddingHorizontal: 18, paddingBottom: 112 },
  header: { paddingTop: 4, paddingBottom: 12, backgroundColor: 'rgba(248,247,243,0.96)' },
  statusRow: { height: 24, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 8 },
  statusTime: { color: colors.text, fontSize: 13, fontWeight: '800' },
  statusDots: { flexDirection: 'row', gap: 4, alignItems: 'center' },
  dot: { width: 5, height: 5, borderRadius: 99, backgroundColor: colors.text },
  longDot: { width: 16 },
  topRow: { minHeight: 56, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 8 },
  locationPill: { maxWidth: 128, height: 36, paddingHorizontal: 11, borderRadius: 999, flexDirection: 'row', alignItems: 'center', gap: 5, backgroundColor: colors.card },
  locationText: { color: colors.green, fontSize: 12, fontWeight: '800' },
  brandLockup: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  brandIcon: { width: 38, height: 38, borderRadius: 99, borderWidth: 1, borderColor: 'rgba(15,61,46,0.28)', alignItems: 'center', justifyContent: 'center' },
  brandIconText: { color: colors.green, fontWeight: '900', fontSize: 12 },
  brandTitle: { color: colors.green, fontSize: 24, fontWeight: '900', lineHeight: 25 },
  brandSub: { color: colors.gold, fontSize: 9, fontWeight: '900', letterSpacing: 2 },
  iconButton: { width: 42, height: 42, borderRadius: 99, backgroundColor: colors.card, alignItems: 'center', justifyContent: 'center' },
  searchBar: { height: 58, borderRadius: 24, backgroundColor: colors.card, flexDirection: 'row', alignItems: 'center', gap: 10, paddingLeft: 18, paddingRight: 8, shadowColor: '#141414', shadowOpacity: 0.08, shadowRadius: 20, elevation: 4 },
  searchInput: { flex: 1, minWidth: 0, color: colors.text, fontSize: 14, fontWeight: '600' },
  searchAction: { width: 40, height: 40, borderRadius: 16, backgroundColor: colors.greenSoft, alignItems: 'center', justifyContent: 'center' },
  hero: { flexDirection: 'row', gap: 12, marginTop: 22, alignItems: 'stretch' },
  heroCopy: { flex: 1 },
  heroTitle: { color: colors.text, fontSize: 29, lineHeight: 31, fontWeight: '900' },
  heroText: { marginTop: 12, color: colors.muted, fontSize: 13, lineHeight: 20, fontWeight: '500' },
  heroCard: { width: 132, minHeight: 206, overflow: 'hidden', borderRadius: 28, backgroundColor: colors.green },
  heroImage: { width: '100%', height: '100%' },
  heroOverlay: { position: 'absolute', left: 10, right: 10, bottom: 10, borderRadius: 18, backgroundColor: 'rgba(15,61,46,0.88)', padding: 10, flexDirection: 'row', alignItems: 'center', gap: 6 },
  heroOverlayText: { color: colors.card, fontSize: 12, fontWeight: '800' },
  categoryScroll: { marginTop: 27, marginHorizontal: -18 },
  categoryContent: { paddingHorizontal: 18, gap: 10 },
  categoryButton: { width: 64, alignItems: 'center' },
  categoryIcon: { width: 54, height: 54, borderRadius: 99, backgroundColor: colors.card, alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: colors.line },
  categoryLabel: { marginTop: 8, color: '#3b3934', fontSize: 10.5, lineHeight: 12, textAlign: 'center', fontWeight: '800' },
  sectionTitle: { marginTop: 28, marginBottom: 14, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  sectionTitleText: { color: colors.text, fontSize: 20, fontWeight: '900' },
  sectionAction: { color: colors.gold, fontSize: 13, fontWeight: '900' },
  cardTrack: { gap: 14, paddingBottom: 8 },
  trackCard: { width: 280 },
  restaurantCard: { overflow: 'hidden', borderRadius: 24, backgroundColor: colors.card, borderWidth: 1, borderColor: colors.line, shadowColor: '#141414', shadowOpacity: 0.08, shadowRadius: 18, elevation: 4 },
  imageWrap: { height: 156, overflow: 'hidden', borderTopLeftRadius: 24, borderTopRightRadius: 24 },
  restaurantImage: { width: '100%', height: '100%' },
  openBadge: { position: 'absolute', left: 12, top: 12, minHeight: 30, paddingHorizontal: 10, borderRadius: 999, justifyContent: 'center', backgroundColor: 'rgba(20,20,20,0.55)' },
  openBadgeActive: { backgroundColor: colors.green },
  openBadgeText: { color: colors.card, fontSize: 12, fontWeight: '900' },
  heartButton: { position: 'absolute', right: 12, top: 12, width: 34, height: 34, borderRadius: 99, backgroundColor: 'rgba(255,255,255,0.32)', alignItems: 'center', justifyContent: 'center' },
  cardBody: { padding: 15 },
  cardTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', gap: 10 },
  cardTitleWrap: { flex: 1, minWidth: 0 },
  cardTitle: { color: colors.text, fontSize: 17, lineHeight: 20, fontWeight: '900' },
  meta: { color: colors.muted, fontSize: 13, lineHeight: 19, fontWeight: '600' },
  scoreBadge: { minHeight: 32, paddingHorizontal: 9, borderRadius: 999, backgroundColor: colors.green, flexDirection: 'row', alignItems: 'center', gap: 4 },
  scoreText: { color: colors.card, fontWeight: '900', fontSize: 12 },
  listStack: { gap: 12 },
  miniItem: { minHeight: 76, borderRadius: 22, backgroundColor: colors.card, borderWidth: 1, borderColor: colors.line, padding: 8, flexDirection: 'row', alignItems: 'center', gap: 12 },
  miniImage: { width: 60, height: 60, borderRadius: 16 },
  miniText: { flex: 1, minWidth: 0 },
  miniTitle: { color: colors.text, fontSize: 15, fontWeight: '900' },
  miniScore: { color: colors.green, fontWeight: '900' },
  pageTitle: { marginTop: 18, marginBottom: 18 },
  kicker: { color: colors.gold, fontSize: 11, fontWeight: '900', letterSpacing: 1.5, textTransform: 'uppercase' },
  pageTitleText: { color: colors.text, fontSize: 29, lineHeight: 33, fontWeight: '900' },
  searchPageField: { minHeight: 58, borderRadius: 22, backgroundColor: colors.card, borderWidth: 1, borderColor: colors.line, flexDirection: 'row', alignItems: 'center', gap: 10, paddingHorizontal: 16 },
  pageInput: { flex: 1, color: colors.text, fontWeight: '700' },
  chipRow: { gap: 10, paddingVertical: 14 },
  filterChip: { minHeight: 42, paddingHorizontal: 15, borderRadius: 999, borderWidth: 1, borderColor: colors.line, justifyContent: 'center', backgroundColor: 'rgba(255,255,255,0.68)' },
  filterChipActive: { backgroundColor: colors.green },
  filterChipText: { color: colors.green, fontWeight: '900' },
  filterChipTextActive: { color: colors.card },
  resultText: { color: colors.muted, fontSize: 13, fontWeight: '700', marginBottom: 12 },
  pagePanel: { gap: 12, borderRadius: 24, backgroundColor: colors.card, borderWidth: 1, borderColor: colors.line, padding: 16, marginBottom: 14 },
  panelTitle: { color: colors.text, fontSize: 18, fontWeight: '900' },
  panelText: { color: colors.muted, fontSize: 13, lineHeight: 19, fontWeight: '600' },
  rankItem: { minHeight: 62, flexDirection: 'row', alignItems: 'center', gap: 12 },
  rankNumber: { width: 42, height: 42, borderRadius: 14, backgroundColor: colors.greenSoft, color: colors.green, textAlign: 'center', textAlignVertical: 'center', fontWeight: '900' },
  rankImage: { width: 52, height: 52, borderRadius: 14 },
  rankText: { flex: 1, minWidth: 0 },
  profileHero: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  avatar: { width: 58, height: 58, borderRadius: 22, backgroundColor: colors.green, alignItems: 'center', justifyContent: 'center' },
  avatarText: { color: colors.gold, fontWeight: '900', fontSize: 18 },
  actionGrid: { flexDirection: 'row', gap: 10 },
  button: { minHeight: 48, borderRadius: 18, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 16 },
  primaryButton: { backgroundColor: colors.green },
  secondaryButton: { backgroundColor: colors.greenSoft },
  buttonText: { fontWeight: '900' },
  primaryButtonText: { color: colors.card },
  secondaryButtonText: { color: colors.green },
  pressed: { opacity: 0.74, transform: [{ scale: 0.99 }] },
  bottomNav: { position: 'absolute', left: 13, right: 13, bottom: Platform.OS === 'ios' ? 10 : 12, height: 78, borderRadius: 28, backgroundColor: 'rgba(255,255,255,0.96)', borderWidth: 1, borderColor: colors.line, flexDirection: 'row', alignItems: 'center', padding: 8, gap: 2, shadowColor: '#141414', shadowOpacity: 0.14, shadowRadius: 20, elevation: 8 },
  navButton: { flex: 1, minWidth: 0, height: 60, borderRadius: 20, alignItems: 'center', justifyContent: 'center', gap: 4 },
  navButtonActive: { backgroundColor: colors.greenSoft },
  navText: { color: '#77736d', fontSize: 10, fontWeight: '900' },
  navTextActive: { color: colors.green },
  modalBackdrop: { flex: 1, backgroundColor: 'rgba(0,0,0,0.32)', justifyContent: 'flex-end' },
  detailSheet: { maxHeight: '88%', overflow: 'hidden', borderTopLeftRadius: 28, borderTopRightRadius: 28, backgroundColor: colors.bg },
  detailImage: { width: '100%', height: 240 },
  closeButton: { position: 'absolute', top: 14, right: 14, zIndex: 2, width: 42, height: 42, borderRadius: 99, backgroundColor: colors.card, alignItems: 'center', justifyContent: 'center' },
  detailBody: { padding: 18, gap: 14 },
  detailTitle: { color: colors.text, fontSize: 25, lineHeight: 29, fontWeight: '900' },
  detailText: { color: colors.muted, fontSize: 14, lineHeight: 21 },
  detailAddress: { color: colors.green, fontSize: 13, fontWeight: '800' },
  detailActions: { gap: 10 },
  authSheet: { marginTop: 'auto', borderTopLeftRadius: 28, borderTopRightRadius: 28, backgroundColor: colors.bg, padding: 18, paddingTop: 28, gap: 12 },
  field: { gap: 7 },
  fieldLabel: { color: colors.muted, fontSize: 12, fontWeight: '900' },
  fieldInput: { minHeight: 46, borderRadius: 16, borderWidth: 1, borderColor: colors.line, backgroundColor: colors.card, paddingHorizontal: 13, color: colors.text, fontWeight: '700' },
  fieldTextarea: { minHeight: 90, paddingTop: 12, textAlignVertical: 'top' },
  logoWrap: { alignItems: 'center', justifyContent: 'center', minWidth: 152 },
  logoLetters: { flexDirection: 'row', alignItems: 'center' },
  logoLetter: { fontFamily: 'Baloo2_800ExtraBold', fontSize: 30, lineHeight: 34, marginHorizontal: -1 },
  logoSprinkles: { position: 'absolute', right: -8, top: 2, gap: 3 },
  sprinkle: { width: 14, height: 5, borderRadius: 999 },
  homeHeadline: { marginTop: 18, marginBottom: -2 },
  homeHeadlineTitle: { color: colors.text, fontFamily: 'Baloo2_800ExtraBold', fontSize: 28, lineHeight: 31 },
  underline: { width: 88, height: 5, borderRadius: 999, backgroundColor: colors.coral, marginTop: 2, transform: [{ rotate: '-3deg' }] }
});

Object.assign(styles, {
  header: { paddingTop: 4, paddingBottom: 12, backgroundColor: colors.bg },
  locationPill: { maxWidth: 128, height: 36, paddingHorizontal: 11, borderRadius: 999, flexDirection: 'row', alignItems: 'center', gap: 5, backgroundColor: '#FFFFFF', borderWidth: 1, borderColor: colors.line },
  locationText: { color: colors.navy, fontFamily: 'Nunito_800ExtraBold', fontSize: 12 },
  brandLockup: { flex: 1, alignItems: 'center' },
  iconButton: { width: 42, height: 42, borderRadius: 18, backgroundColor: '#FFFFFF', alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: colors.line },
  searchBar: { height: 58, borderRadius: 18, backgroundColor: colors.card, flexDirection: 'row', alignItems: 'center', gap: 10, paddingLeft: 18, paddingRight: 8, shadowColor: colors.bordeaux, shadowOpacity: 0.08, shadowRadius: 18, elevation: 4, borderWidth: 1, borderColor: colors.line },
  searchInput: { flex: 1, minWidth: 0, color: colors.text, fontSize: 14, fontFamily: 'Nunito_700Bold' },
  searchAction: { width: 40, height: 40, borderRadius: 14, backgroundColor: colors.greenSoft, alignItems: 'center', justifyContent: 'center' },
  categoryIcon: { width: 54, height: 54, borderRadius: 22, backgroundColor: colors.card, alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: colors.line, shadowColor: colors.lavender, shadowOpacity: 0.12, shadowRadius: 10, elevation: 2 },
  categoryLabel: { marginTop: 8, color: colors.navy, fontSize: 10.5, lineHeight: 12, textAlign: 'center', fontFamily: 'Nunito_800ExtraBold' },
  sectionTitleText: { color: colors.text, fontSize: 22, fontFamily: 'Baloo2_800ExtraBold', lineHeight: 26 },
  sectionAction: { color: colors.orange, fontSize: 13, fontFamily: 'Nunito_800ExtraBold' },
  restaurantCard: { overflow: 'hidden', borderRadius: 26, backgroundColor: colors.card, borderWidth: 1, borderColor: colors.line, shadowColor: colors.bordeaux, shadowOpacity: 0.11, shadowRadius: 18, elevation: 4 },
  imageWrap: { height: 156, overflow: 'hidden', borderTopLeftRadius: 26, borderTopRightRadius: 26 },
  openBadge: { position: 'absolute', left: 12, top: 12, minHeight: 30, paddingHorizontal: 10, borderRadius: 999, justifyContent: 'center', backgroundColor: colors.bordeaux },
  openBadgeActive: { backgroundColor: colors.pistachio },
  openBadgeText: { color: colors.card, fontSize: 12, fontFamily: 'Nunito_800ExtraBold' },
  heartButton: { position: 'absolute', right: 12, top: 12, width: 34, height: 34, borderRadius: 14, backgroundColor: colors.coral, alignItems: 'center', justifyContent: 'center' },
  cardTitle: { color: colors.text, fontSize: 18, lineHeight: 21, fontFamily: 'Baloo2_800ExtraBold' },
  meta: { color: colors.muted, fontSize: 13, lineHeight: 19, fontFamily: 'Nunito_700Bold' },
  scoreBadge: { minHeight: 32, paddingHorizontal: 9, borderRadius: 999, backgroundColor: colors.mustard, flexDirection: 'row', alignItems: 'center', gap: 4 },
  scoreText: { color: colors.navy, fontFamily: 'Nunito_800ExtraBold', fontSize: 12 },
  miniItem: { minHeight: 76, borderRadius: 24, backgroundColor: colors.card, borderWidth: 1, borderColor: colors.line, padding: 8, flexDirection: 'row', alignItems: 'center', gap: 12 },
  miniImage: { width: 60, height: 60, borderRadius: 18 },
  miniTitle: { color: colors.text, fontSize: 15, fontFamily: 'Baloo2_800ExtraBold' },
  miniScore: { color: colors.bordeaux, fontFamily: 'Nunito_800ExtraBold' },
  kicker: { color: colors.orange, fontSize: 11, fontFamily: 'Nunito_800ExtraBold', letterSpacing: 1.5, textTransform: 'uppercase' },
  pageTitleText: { color: colors.text, fontSize: 31, lineHeight: 34, fontFamily: 'Baloo2_800ExtraBold' },
  filterChipActive: { backgroundColor: colors.lavender },
  filterChipText: { color: colors.navy, fontFamily: 'Nunito_800ExtraBold' },
  resultText: { color: colors.muted, fontSize: 13, fontFamily: 'Nunito_700Bold', marginBottom: 12 },
  pagePanel: { gap: 12, borderRadius: 26, backgroundColor: colors.card, borderWidth: 1, borderColor: colors.line, padding: 16, marginBottom: 14 },
  panelTitle: { color: colors.text, fontSize: 20, fontFamily: 'Baloo2_800ExtraBold' },
  panelText: { color: colors.muted, fontSize: 13, lineHeight: 19, fontFamily: 'Nunito_700Bold' },
  avatar: { width: 58, height: 58, borderRadius: 22, backgroundColor: colors.bordeaux, alignItems: 'center', justifyContent: 'center' },
  avatarText: { color: colors.mustard, fontFamily: 'Baloo2_800ExtraBold', fontSize: 18 },
  primaryButton: { backgroundColor: colors.orange },
  secondaryButtonText: { color: colors.navy },
  buttonText: { fontFamily: 'Nunito_800ExtraBold' },
  bottomNav: { position: 'absolute', left: 13, right: 13, bottom: Platform.OS === 'ios' ? 10 : 12, height: 78, borderRadius: 28, backgroundColor: 'rgba(255,255,255,0.97)', borderWidth: 1, borderColor: colors.line, flexDirection: 'row', alignItems: 'center', padding: 8, gap: 2, shadowColor: colors.bordeaux, shadowOpacity: 0.14, shadowRadius: 20, elevation: 8 },
  navButtonActive: { backgroundColor: colors.bordeaux },
  navText: { color: '#77736d', fontSize: 10, fontFamily: 'Nunito_800ExtraBold' },
  navTextActive: { color: colors.card },
  detailTitle: { color: colors.text, fontSize: 27, lineHeight: 30, fontFamily: 'Baloo2_800ExtraBold' },
  detailText: { color: colors.muted, fontSize: 14, lineHeight: 21, fontFamily: 'Nunito_400Regular' },
  detailAddress: { color: colors.bordeaux, fontSize: 13, fontFamily: 'Nunito_800ExtraBold' },
  fieldLabel: { color: colors.muted, fontSize: 12, fontFamily: 'Nunito_800ExtraBold' },
  fieldInput: { minHeight: 46, borderRadius: 16, borderWidth: 1, borderColor: colors.line, backgroundColor: colors.card, paddingHorizontal: 13, color: colors.text, fontFamily: 'Nunito_700Bold' }
});

Object.assign(styles, {
  safe: { flex: 1, backgroundColor: colors.bg },
  screen: { flex: 1, backgroundColor: colors.bg },
  screenContent: { paddingHorizontal: 22, paddingBottom: 164 },
  screenContentSubscreen: { paddingBottom: 52 },
  screenContentCompact: { paddingHorizontal: 16 },
  header: { paddingTop: 12, paddingBottom: 14, backgroundColor: colors.bg },
  topRow: { minHeight: 78, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  brandLockup: { flex: 1, alignItems: 'flex-start', justifyContent: 'center' },
  logoWrap: { alignSelf: 'flex-start', width: 220, height: 96, justifyContent: 'center', marginLeft: -58 },
  logoImage: { width: 220, height: 96 },
  iconButton: { width: 48, height: 48, borderRadius: 24, backgroundColor: 'transparent', alignItems: 'center', justifyContent: 'center' },
  locationRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 5 },
  locationText: { color: colors.ink, fontFamily: bodyFont, fontSize: 15 },
  searchBar: { height: 58, borderRadius: 29, backgroundColor: 'rgba(255,253,247,0.72)', flexDirection: 'row', alignItems: 'center', gap: 12, paddingLeft: 18, paddingRight: 8, borderWidth: 1, borderColor: colors.line },
  searchInput: { flex: 1, minWidth: 0, color: colors.ink, fontFamily: bodyFont, fontSize: 16 },
  searchAction: { width: 46, height: 46, borderRadius: 23, backgroundColor: 'rgba(255,253,247,0.88)', borderWidth: 1, borderColor: colors.line, alignItems: 'center', justifyContent: 'center' },
  homeGuide: { marginTop: 16, borderRadius: 18, backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.line, padding: 16, gap: 14 },
  homeGuideCopy: { gap: 4 },
  homeGuideTitle: { color: colors.ink, fontFamily: titleFont, fontWeight: '900', fontSize: 27, lineHeight: 32 },
  homeGuideText: { color: colors.muted, fontFamily: 'Nunito_400Regular', fontSize: 15, lineHeight: 21 },
  homeGuideActions: { flexDirection: 'row', gap: 10 },
  homeGuideButton: { flex: 1, minHeight: 50, borderRadius: 25, backgroundColor: colors.redDark, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8 },
  homeGuideButtonSecondary: { flex: 1, minHeight: 50, borderRadius: 25, backgroundColor: colors.card, borderWidth: 1, borderColor: colors.line, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8 },
  homeGuideButtonText: { color: colors.card, fontFamily: bodyFont, fontSize: 15 },
  homeGuideButtonSecondaryText: { color: colors.redDark, fontFamily: bodyFont, fontSize: 15 },
  homeHeadline: { marginTop: 30, marginBottom: 24 },
  homeHeadlineTitle: { color: colors.ink, fontFamily: titleFont, fontSize: 47, lineHeight: 55, fontWeight: '900', maxWidth: 330 },
  homeHeadlineAccent: { color: colors.redDark },
  homeHeadlineRow: { minHeight: 92, marginTop: 16 },
  homeHeadlineText: { color: colors.muted, fontFamily: 'Nunito_400Regular', fontSize: 17, lineHeight: 25, maxWidth: 175, marginTop: 20 },
  underline: { width: 56, height: 4, borderRadius: 99, backgroundColor: colors.redDark },
  curatorBadge: { position: 'absolute', right: 6, top: -4, width: 96, height: 96, borderRadius: 48, backgroundColor: colors.olive, alignItems: 'center', justifyContent: 'center', shadowColor: colors.ink, shadowOpacity: 0.16, shadowRadius: 14, elevation: 4 },
  curatorText: { color: colors.card, width: 70, marginTop: 5, textAlign: 'center', textTransform: 'uppercase', fontFamily: 'Nunito_800ExtraBold', fontSize: 10, letterSpacing: 1.4 },
  sectionTitle: { marginTop: 24, marginBottom: 12, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 12 },
  sectionTitleText: { color: colors.ink, fontFamily: titleFont, fontWeight: '900', fontSize: 24, lineHeight: 30 },
  sectionAction: { color: colors.redDark, fontFamily: bodyFont, fontSize: 15 },
  cardTrack: { gap: 14, paddingBottom: 12, paddingRight: 22 },
  trackCard: { width: 254 },
  trackCardCompact: { width: 226 },
  restaurantCard: { overflow: 'hidden', borderRadius: 16, backgroundColor: colors.ink, borderWidth: 0, shadowColor: colors.ink, shadowOpacity: 0.12, shadowRadius: 16, elevation: 4 },
  imageWrap: { height: 276, overflow: 'hidden', borderRadius: 16 },
  restaurantImage: { width: '100%', height: '100%' },
  imageScrim: { position: 'absolute', left: 0, right: 0, top: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.36)' },
  cardOverlay: { position: 'absolute', left: 16, right: 16, bottom: 16 },
  cardTitle: { color: colors.card, fontFamily: titleFont, fontWeight: '900', fontSize: 24, lineHeight: 28, textShadowColor: 'rgba(0,0,0,0.28)', textShadowRadius: 8 },
  cardMeta: { color: 'rgba(255,255,255,0.94)', fontFamily: 'Nunito_400Regular', fontSize: 14, marginTop: 5, textShadowColor: 'rgba(0,0,0,0.24)', textShadowRadius: 6 },
  cardScoreLine: { flexDirection: 'row', alignItems: 'center', gap: 5, marginTop: 10 },
  scoreText: { color: colors.card, fontFamily: 'Nunito_800ExtraBold', fontSize: 14 },
  openBadge: { position: 'absolute', left: 12, top: 12, minHeight: 32, paddingHorizontal: 12, borderRadius: 8, justifyContent: 'center', backgroundColor: colors.redDark },
  openBadgeActive: { backgroundColor: colors.olive },
  openBadgeText: { color: colors.card, fontFamily: bodyFont, fontSize: 13 },
  heartButton: { position: 'absolute', right: 12, top: 12, width: 44, height: 44, borderRadius: 22, backgroundColor: 'rgba(0,0,0,0.22)', borderWidth: 1, borderColor: 'rgba(255,255,255,0.62)', alignItems: 'center', justifyContent: 'center' },
  promoCard: { minHeight: 118, marginTop: 14, marginBottom: 22, borderRadius: 18, backgroundColor: colors.redDark, padding: 20, flexDirection: 'row', alignItems: 'center', gap: 14, overflow: 'hidden' },
  promoIcon: { width: 50, height: 50, borderRadius: 25, backgroundColor: colors.card, alignItems: 'center', justifyContent: 'center' },
  promoCopy: { flex: 1, minWidth: 0 },
  promoTitle: { color: colors.card, fontFamily: titleFont, fontWeight: '900', fontSize: 25, lineHeight: 29 },
  promoText: { color: colors.card, fontFamily: 'Nunito_400Regular', fontSize: 14, lineHeight: 20, marginTop: 4 },
  promoButton: { minHeight: 44, paddingHorizontal: 15, borderRadius: 22, backgroundColor: colors.card, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 5 },
  promoButtonText: { color: colors.ink, fontFamily: bodyFont, fontSize: 13 },
  listStack: { gap: 12 },
  miniItem: { minHeight: 104, borderRadius: 0, backgroundColor: 'transparent', borderWidth: 0, borderBottomWidth: 1, borderBottomColor: colors.line, paddingVertical: 10, paddingHorizontal: 0, flexDirection: 'row', alignItems: 'center', gap: 14 },
  miniImage: { width: 126, height: 84, borderRadius: 12 },
  miniText: { flex: 1, minWidth: 0 },
  miniTag: { alignSelf: 'flex-start', overflow: 'hidden', color: colors.olive, backgroundColor: colors.greenSoft, borderRadius: 7, paddingHorizontal: 8, paddingVertical: 3, fontFamily: bodyFont, fontSize: 12, marginBottom: 8 },
  miniTitle: { color: colors.ink, fontFamily: titleFont, fontWeight: '900', fontSize: 22, lineHeight: 27 },
  meta: { color: colors.muted, fontFamily: 'Nunito_400Regular', fontSize: 14, lineHeight: 20 },
  miniScoreWrap: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  miniScore: { color: colors.redDark, fontFamily: bodyFont, fontSize: 15 },
  pageTitle: { marginTop: 12, marginBottom: 16 },
  pageTitleText: { color: colors.ink, fontFamily: titleFont, fontWeight: '900', fontSize: 46, lineHeight: 52 },
  pageSubtitle: { color: colors.muted, fontFamily: 'Nunito_400Regular', fontSize: 17, lineHeight: 24, marginTop: 5, maxWidth: 315 },
  subscreenHeader: { minHeight: 76, flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 12 },
  backButton: { width: 46, height: 46, borderRadius: 23, backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.line, alignItems: 'center', justifyContent: 'center' },
  subscreenTitleWrap: { flex: 1, minWidth: 0 },
  subscreenTitle: { color: colors.ink, fontFamily: titleFont, fontWeight: '900', fontSize: 34, lineHeight: 39 },
  subscreenSubtitle: { color: colors.muted, fontFamily: 'Nunito_400Regular', fontSize: 15, lineHeight: 21, marginTop: 3 },
  resultControls: { flexDirection: 'row', gap: 8, marginVertical: 14 },
  resultSortButton: { flex: 1, minHeight: 42, borderRadius: 21, borderWidth: 1, borderColor: colors.line, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.surface },
  resultSortButtonActive: { backgroundColor: colors.redDark, borderColor: colors.redDark },
  resultSortText: { color: colors.ink, fontFamily: bodyFont, fontSize: 13 },
  resultSortTextActive: { color: colors.card },
  searchPageField: { minHeight: 58, borderRadius: 29, backgroundColor: 'rgba(255,253,247,0.74)', borderWidth: 1, borderColor: colors.line, flexDirection: 'row', alignItems: 'center', gap: 12, paddingHorizontal: 18 },
  pageInput: { flex: 1, color: colors.ink, fontFamily: bodyFont, fontSize: 16 },
  searchFilterButton: { width: 46, height: 46, borderRadius: 23, alignItems: 'center', justifyContent: 'center', backgroundColor: 'rgba(255,253,247,0.9)', borderWidth: 1, borderColor: colors.line },
  searchFilterButtonActive: { backgroundColor: colors.redDark, borderColor: colors.redDark },
  filterSummary: { minHeight: 38, flexDirection: 'row', alignItems: 'center', gap: 7, paddingHorizontal: 4, marginTop: 8, marginBottom: 4 },
  filterSummaryText: { flex: 1, minWidth: 0, color: colors.muted, fontFamily: bodyFont, fontSize: 13 },
  filterDrawer: { borderRadius: 18, backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.line, padding: 14, marginTop: 8, marginBottom: 12 },
  filterGroupTitle: { color: colors.ink, fontFamily: bodyFont, fontSize: 14, marginTop: 14, marginBottom: 9 },
  filterWrap: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  filterActions: { flexDirection: 'row', gap: 10, marginTop: 16 },
  clearFiltersButton: { flex: 1, minHeight: 46, borderRadius: 23, borderWidth: 1, borderColor: colors.line, alignItems: 'center', justifyContent: 'center' },
  clearFiltersText: { color: colors.ink, fontFamily: bodyFont, fontSize: 14 },
  applyFiltersButton: { flex: 1, minHeight: 46, borderRadius: 23, backgroundColor: colors.redDark, alignItems: 'center', justifyContent: 'center' },
  applyFiltersText: { color: colors.card, fontFamily: bodyFont, fontSize: 14 },
  chipRow: { gap: 10, paddingVertical: 14, paddingRight: 22 },
  filterChip: { minHeight: 46, paddingHorizontal: 18, borderRadius: 23, borderWidth: 1, borderColor: colors.line, justifyContent: 'center', backgroundColor: 'transparent' },
  filterChipActive: { backgroundColor: colors.redDark, borderColor: colors.redDark },
  filterChipText: { color: colors.ink, fontFamily: bodyFont, fontSize: 15 },
  filterChipTextActive: { color: colors.card },
  locationPanel: { minHeight: 92, borderRadius: 18, backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.line, padding: 14, marginTop: 12, flexDirection: 'row', alignItems: 'center', gap: 12 },
  locationPanelCopy: { flex: 1, minWidth: 0 },
  locationPanelTitle: { color: colors.ink, fontFamily: titleFont, fontWeight: '900', fontSize: 24, lineHeight: 29 },
  locationPanelText: { color: colors.muted, fontFamily: 'Nunito_400Regular', fontSize: 14, lineHeight: 19, marginTop: 3 },
  locateButton: { minHeight: 46, borderRadius: 23, paddingHorizontal: 14, backgroundColor: colors.redDark, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 7 },
  locateButtonText: { color: colors.card, fontFamily: bodyFont, fontSize: 13 },
  radiusRow: { gap: 8, paddingBottom: 12, paddingRight: 22 },
  radiusChip: { minHeight: 38, minWidth: 76, paddingHorizontal: 14, borderRadius: 19, borderWidth: 1, borderColor: colors.line, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.surface },
  radiusChipActive: { backgroundColor: colors.olive, borderColor: colors.olive },
  radiusChipText: { color: colors.ink, fontFamily: bodyFont, fontSize: 14 },
  radiusChipTextActive: { color: colors.card },
  collectionSearch: { minHeight: 56, borderRadius: 28, backgroundColor: 'rgba(255,253,247,0.74)', borderWidth: 1, borderColor: colors.line, flexDirection: 'row', alignItems: 'center', gap: 10, paddingHorizontal: 16, marginBottom: 4 },
  collectionSearchInput: { flex: 1, color: colors.ink, fontFamily: bodyFont, fontSize: 16 },
  collectionGrid: { gap: 16, paddingBottom: 20 },
  collectionHero: { width: '100%', height: 220, borderRadius: 18, marginBottom: 18 },
  collectionCard: { width: '100%', height: 198, overflow: 'hidden', borderRadius: 16, backgroundColor: colors.ink },
  collectionImage: { width: '100%', height: '100%' },
  collectionOverlay: { position: 'absolute', left: 0, right: 0, top: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.48)' },
  collectionTitle: { position: 'absolute', left: 18, right: 18, bottom: 58, color: colors.card, fontFamily: titleFont, fontWeight: '900', fontSize: 31, lineHeight: 34 },
  collectionSubtitle: { position: 'absolute', left: 18, right: 18, bottom: 22, color: colors.card, fontFamily: 'Nunito_400Regular', fontSize: 16, lineHeight: 21 },
  emptyState: { minHeight: 140, borderRadius: 18, borderWidth: 1, borderColor: colors.line, backgroundColor: colors.surface, alignItems: 'center', justifyContent: 'center', padding: 20 },
  emptyTitle: { color: colors.ink, fontFamily: titleFont, fontWeight: '900', fontSize: 24, textAlign: 'center' },
  emptyText: { color: colors.muted, fontFamily: 'Nunito_400Regular', fontSize: 15, lineHeight: 21, textAlign: 'center', marginTop: 6 },
  largeOption: { minHeight: 58, borderRadius: 18, borderWidth: 1, borderColor: colors.line, backgroundColor: colors.surface, paddingHorizontal: 14, flexDirection: 'row', alignItems: 'center', gap: 10 },
  largeOptionActive: { backgroundColor: colors.redDark, borderColor: colors.redDark },
  largeOptionText: { color: colors.ink, fontFamily: bodyFont, fontSize: 15 },
  largeOptionTextActive: { color: colors.card },
  ownerCard: { borderRadius: 18, backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.line, padding: 16, marginBottom: 14, gap: 12 },
  ownerCardHeader: { flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'space-between', gap: 12 },
  ownerCardTitleWrap: { flex: 1, minWidth: 0 },
  ownerCardTitle: { color: colors.ink, fontFamily: titleFont, fontWeight: '900', fontSize: 25, lineHeight: 30 },
  ownerCardMeta: { color: colors.muted, fontFamily: 'Nunito_400Regular', fontSize: 14, lineHeight: 20, marginTop: 2 },
  statusPill: { overflow: 'hidden', borderRadius: 12, backgroundColor: colors.greenSoft, color: colors.olive, fontFamily: bodyFont, fontSize: 12, paddingHorizontal: 10, paddingVertical: 5 },
  metricGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  metricBox: { width: '48%', minHeight: 66, borderRadius: 14, backgroundColor: colors.card, borderWidth: 1, borderColor: colors.line, padding: 10, justifyContent: 'center' },
  metricValue: { color: colors.ink, fontFamily: bodyFont, fontSize: 22 },
  metricLabel: { color: colors.muted, fontFamily: 'Nunito_400Regular', fontSize: 12, marginTop: 2 },
  ownerActions: { flexDirection: 'row', gap: 10 },
  realMapCard: { height: 420, marginHorizontal: -22, backgroundColor: '#EAF0E1', overflow: 'hidden' },
  realMap: { flex: 1 },
  mapCard: { height: 420, marginHorizontal: -22, backgroundColor: '#EAF0E1', overflow: 'hidden' },
  mapZone: { position: 'absolute', borderWidth: 1, borderColor: 'rgba(40, 40, 43, 0.07)' },
  mapZoneNorth: { left: -26, top: -30, width: 210, height: 168, borderRadius: 36, backgroundColor: '#F4E6CF', transform: [{ rotate: '-12deg' }] },
  mapZonePark: { right: -36, top: 28, width: 190, height: 205, borderRadius: 46, backgroundColor: '#D9E7CB', transform: [{ rotate: '13deg' }] },
  mapZoneCenter: { left: 72, bottom: 18, width: 240, height: 160, borderRadius: 38, backgroundColor: '#F7EEDB', transform: [{ rotate: '8deg' }] },
  mapRoad: { position: 'absolute', height: 42, borderRadius: 999, backgroundColor: '#FFFDF7', borderWidth: 1, borderColor: 'rgba(40, 40, 43, 0.08)', shadowColor: colors.ink, shadowOpacity: 0.05, shadowRadius: 7, elevation: 2 },
  mapRoadMain: { left: -44, right: -32, top: 174, transform: [{ rotate: '-9deg' }] },
  mapRoadMainAlt: { left: -18, right: -74, top: 278, transform: [{ rotate: '12deg' }] },
  mapRoadVertical: { left: 154, top: -38, width: 44, height: 482, transform: [{ rotate: '5deg' }] },
  mapRoadDiagonal: { left: -64, top: 68, width: 530, transform: [{ rotate: '38deg' }] },
  mapRoadThin: { position: 'absolute', height: 18, borderRadius: 999, backgroundColor: 'rgba(255, 253, 247, 0.78)', borderWidth: 1, borderColor: 'rgba(40, 40, 43, 0.05)' },
  mapRoadThinOne: { left: -24, right: 36, top: 96, transform: [{ rotate: '7deg' }] },
  mapRoadThinTwo: { left: 44, right: -34, top: 236, transform: [{ rotate: '-17deg' }] },
  mapRoadThinThree: { left: 30, right: 74, bottom: 68, transform: [{ rotate: '3deg' }] },
  mapRoadThinFour: { left: 260, top: 0, width: 18, height: 430, transform: [{ rotate: '-12deg' }] },
  mapLabel: { position: 'absolute', color: 'rgba(40, 40, 43, 0.45)', fontFamily: bodyFont, fontSize: 13, letterSpacing: 0.2, textTransform: 'uppercase' },
  mapLabelNorth: { left: 25, top: 48 },
  mapLabelCenter: { left: 134, top: 202 },
  mapLabelSouth: { right: 36, bottom: 100 },
  mapCompass: { position: 'absolute', left: 22, top: 22, minHeight: 34, borderRadius: 18, paddingHorizontal: 12, gap: 6, flexDirection: 'row', alignItems: 'center', backgroundColor: 'rgba(255, 253, 247, 0.92)', borderWidth: 1, borderColor: colors.line },
  mapCompassText: { color: colors.ink, fontFamily: bodyFont, fontSize: 13 },
  mapPin: { position: 'absolute', minWidth: 118, minHeight: 74 },
  mapPinBubble: { width: 42, height: 42, borderRadius: 21, backgroundColor: colors.redDark, alignItems: 'center', justifyContent: 'center', borderWidth: 4, borderColor: colors.card, shadowColor: colors.ink, shadowOpacity: 0.18, shadowRadius: 8, elevation: 5 },
  mapPinBubbleAlt: { backgroundColor: colors.olive },
  mapPinTip: { marginLeft: 15, marginTop: -5, width: 0, height: 0, borderLeftWidth: 6, borderRightWidth: 6, borderTopWidth: 10, borderLeftColor: 'transparent', borderRightColor: 'transparent', borderTopColor: colors.redDark },
  mapPinTipAlt: { borderTopColor: colors.olive },
  mapPinLabel: { position: 'absolute', left: 38, top: 5, maxWidth: 112, borderRadius: 13, backgroundColor: 'rgba(255, 253, 247, 0.96)', paddingVertical: 6, paddingHorizontal: 9, borderWidth: 1, borderColor: colors.line },
  mapPinName: { color: colors.ink, fontFamily: bodyFont, fontSize: 12, lineHeight: 15 },
  mapPinMeta: { color: colors.muted, fontFamily: 'Nunito_400Regular', fontSize: 11, lineHeight: 13 },
  pin0: { left: 34, top: 124 },
  pin1: { left: 162, top: 58 },
  pin2: { right: 72, top: 136 },
  pin3: { left: 126, top: 262 },
  pin4: { right: 58, bottom: 42 },
  userDot: { position: 'absolute', left: '50%', top: 222, width: 24, height: 24, borderRadius: 12, backgroundColor: '#2C97DE', borderWidth: 4, borderColor: colors.card, shadowColor: '#2C97DE', shadowOpacity: 0.32, shadowRadius: 10, elevation: 6 },
  mapSheet: { marginHorizontal: -22, marginTop: -24, borderTopLeftRadius: 28, borderTopRightRadius: 28, backgroundColor: colors.bg, paddingHorizontal: 22, paddingTop: 12, paddingBottom: 24 },
  sheetHandle: { width: 54, height: 5, borderRadius: 99, alignSelf: 'center', backgroundColor: colors.line, marginBottom: 8 },
  mapList: { gap: 0, marginBottom: 16, borderTopWidth: 1, borderTopColor: colors.line },
  mapListItem: { minHeight: 72, borderBottomWidth: 1, borderBottomColor: colors.line, flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 10 },
  mapListPin: { width: 38, height: 38, borderRadius: 19, backgroundColor: colors.redDark, alignItems: 'center', justifyContent: 'center' },
  mapListText: { flex: 1, minWidth: 0 },
  mapListTitle: { color: colors.ink, fontFamily: bodyFont, fontSize: 17, lineHeight: 21 },
  mapListMeta: { color: colors.muted, fontFamily: 'Nunito_400Regular', fontSize: 13, lineHeight: 18, marginTop: 2 },
  mapListDistance: { color: colors.redDark, fontFamily: bodyFont, fontSize: 14 },
  nearGrid: { flexDirection: 'row', gap: 12, marginBottom: 16 },
  nearGridCompact: { flexDirection: 'column' },
  nearCard: { flex: 1 },
  segmented: { height: 54, borderRadius: 27, borderWidth: 1, borderColor: colors.line, flexDirection: 'row', padding: 3, marginBottom: 18 },
  segment: { flex: 1, borderRadius: 24, alignItems: 'center', justifyContent: 'center' },
  segmentActive: { backgroundColor: colors.redDark },
  segmentText: { color: colors.ink, fontFamily: bodyFont, fontSize: 14 },
  segmentTextActive: { color: colors.card },
  favoriteList: { gap: 0, marginBottom: 16 },
  profileTop: { flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'space-between' },
  profileHeader: { flexDirection: 'row', alignItems: 'center', gap: 24, marginBottom: 34 },
  profileAvatar: { width: 112, height: 112, borderRadius: 56, backgroundColor: colors.olive, alignItems: 'center', justifyContent: 'center' },
  profileAvatarText: { color: colors.card, fontFamily: titleFont, fontWeight: '900', fontSize: 54 },
  avatarEdit: { position: 'absolute', right: -2, bottom: 4, width: 40, height: 40, borderRadius: 20, backgroundColor: colors.card, borderWidth: 1, borderColor: colors.line, alignItems: 'center', justifyContent: 'center' },
  profileNameWrap: { flex: 1 },
  profileName: { color: colors.ink, fontFamily: titleFont, fontWeight: '900', fontSize: 46, lineHeight: 52 },
  profileBio: { color: colors.muted, fontFamily: 'Nunito_400Regular', fontSize: 17, lineHeight: 24 },
  rankCard: { borderRadius: 18, backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.line, padding: 16, marginBottom: 24 },
  rankTopRow: { flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'space-between', gap: 12 },
  rankLabel: { color: colors.muted, fontFamily: bodyFont, fontSize: 12, textTransform: 'uppercase', letterSpacing: 1 },
  rankName: { color: colors.ink, fontFamily: titleFont, fontWeight: '900', fontSize: 30, lineHeight: 34, marginTop: 2 },
  rankPoints: { color: colors.redDark, fontFamily: bodyFont, fontSize: 18 },
  rankProgressTrack: { height: 10, borderRadius: 99, backgroundColor: colors.line, overflow: 'hidden', marginTop: 14 },
  rankProgressFill: { height: '100%', borderRadius: 99, backgroundColor: colors.redDark },
  rankNextText: { color: colors.muted, fontFamily: 'Nunito_400Regular', fontSize: 14, lineHeight: 20, marginTop: 10 },
  profileStats: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 28 },
  profileStat: { width: '32%', alignItems: 'center', gap: 4 },
  statValue: { color: colors.ink, fontFamily: bodyFont, fontSize: 29 },
  statLabel: { color: colors.ink, fontFamily: 'Nunito_400Regular', textAlign: 'center', fontSize: 13 },
  curatorCard: { minHeight: 118, borderRadius: 18, borderWidth: 1, borderColor: colors.line, padding: 16, flexDirection: 'row', alignItems: 'center', gap: 14, marginBottom: 22 },
  curatorSeal: { width: 76, height: 76, borderRadius: 38, backgroundColor: colors.olive, alignItems: 'center', justifyContent: 'center' },
  curatorCopy: { flex: 1 },
  levelPill: { overflow: 'hidden', alignSelf: 'flex-start', borderRadius: 12, backgroundColor: colors.greenSoft, paddingHorizontal: 10, paddingVertical: 5, color: colors.olive, fontFamily: bodyFont, fontSize: 12 },
  achievementGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginBottom: 22 },
  achievementCard: { width: '48%', minHeight: 118, borderRadius: 18, borderWidth: 1, borderColor: colors.line, backgroundColor: colors.surface, padding: 13, gap: 7 },
  achievementCardActive: { backgroundColor: colors.redDark, borderColor: colors.redDark },
  achievementTitle: { color: colors.ink, fontFamily: bodyFont, fontSize: 15, lineHeight: 19 },
  achievementTitleActive: { color: colors.card },
  achievementText: { color: colors.muted, fontFamily: 'Nunito_400Regular', fontSize: 12, lineHeight: 16 },
  achievementTextActive: { color: 'rgba(255,255,255,0.86)' },
  profileMenu: { borderRadius: 18, borderWidth: 1, borderColor: colors.line, marginBottom: 22 },
  profileMenuItem: { minHeight: 76, flexDirection: 'row', alignItems: 'center', gap: 16, paddingHorizontal: 18, borderBottomWidth: 1, borderBottomColor: colors.line },
  profileMenuText: { flex: 1 },
  profileMenuTitle: { color: colors.ink, fontFamily: bodyFont, fontSize: 19 },
  profileMenuSubtitle: { color: colors.muted, fontFamily: 'Nunito_400Regular', fontSize: 14, marginTop: 2 },
  pagePanel: { gap: 12, borderRadius: 18, backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.line, padding: 16, marginBottom: 14 },
  panelTitle: { color: colors.ink, fontFamily: titleFont, fontWeight: '900', fontSize: 22 },
  panelText: { color: colors.muted, fontFamily: 'Nunito_400Regular', fontSize: 14, lineHeight: 20 },
  actionGrid: { flexDirection: 'row', gap: 10 },
  button: { width: '100%', minHeight: 60, borderRadius: 30, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 20, flexDirection: 'row', alignSelf: 'stretch' },
  primaryButton: { backgroundColor: colors.redDark },
  secondaryButton: { backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.line },
  buttonText: { fontFamily: bodyFont, fontSize: 16 },
  primaryButtonText: { color: colors.card },
  secondaryButtonText: { color: colors.ink },
  bottomNav: { position: 'absolute', left: 0, right: 0, bottom: 0, height: Platform.OS === 'ios' ? 94 : 88, borderRadius: 0, backgroundColor: 'rgba(255,253,247,0.98)', borderTopWidth: 1, borderColor: colors.line, flexDirection: 'row', alignItems: 'center', paddingHorizontal: 12, paddingTop: 8, paddingBottom: Platform.OS === 'ios' ? 20 : 12, gap: 2 },
  navButton: { flex: 1, minWidth: 0, minHeight: 58, borderRadius: 18, alignItems: 'center', justifyContent: 'center', gap: 4 },
  navButtonActive: { backgroundColor: 'transparent' },
  navText: { color: '#4E4B48', fontSize: 11, fontFamily: bodyFont },
  navTextActive: { color: colors.redDark },
  activePress: { opacity: 0.78, transform: [{ scale: 0.98 }] },
  detailBackdrop: { flex: 1, backgroundColor: colors.bg, justifyContent: 'flex-end' },
  detailSheet: { flex: 1, overflow: 'hidden', backgroundColor: colors.bg },
  detailImage: { width: '100%', height: 340 },
  detailTopActions: { position: 'absolute', top: Platform.OS === 'ios' ? 56 : 28, left: 22, right: 22, zIndex: 4, flexDirection: 'row', justifyContent: 'space-between' },
  detailRightActions: { flexDirection: 'row', gap: 12 },
  floatButton: { width: 56, height: 56, borderRadius: 28, backgroundColor: colors.card, alignItems: 'center', justifyContent: 'center' },
  detailBody: { flex: 1, marginTop: -34, borderTopLeftRadius: 34, borderTopRightRadius: 34, backgroundColor: colors.bg },
  detailBodyContent: { padding: 22, paddingBottom: 56, gap: 14 },
  detailTitle: { color: colors.ink, fontFamily: titleFont, fontWeight: '900', fontSize: 45, lineHeight: 52 },
  detailSub: { color: colors.ink, fontFamily: 'Nunito_400Regular', fontSize: 20 },
  detailMetaLine: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  detailMetaText: { color: colors.ink, fontFamily: 'Nunito_400Regular', fontSize: 18 },
  detailDot: { color: colors.muted, fontSize: 18 },
  amenityRow: { flexDirection: 'row', justifyContent: 'space-between', marginVertical: 18 },
  amenityItem: { width: '24%', alignItems: 'center', gap: 8 },
  amenityText: { color: colors.ink, fontFamily: 'Nunito_400Regular', fontSize: 12, textAlign: 'center' },
  detailTabs: { flexDirection: 'row', justifyContent: 'space-between', borderBottomWidth: 1, borderBottomColor: colors.line, marginBottom: 4 },
  detailTab: { color: colors.muted, fontFamily: bodyFont, fontSize: 19, paddingBottom: 13 },
  detailTabActive: { color: colors.redDark, borderBottomWidth: 2, borderBottomColor: colors.redDark },
  detailText: { color: colors.ink, fontFamily: 'Nunito_400Regular', fontSize: 18, lineHeight: 29 },
  tagPills: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  detailTag: { borderRadius: 10, backgroundColor: 'rgba(40,40,43,0.06)', paddingHorizontal: 13, paddingVertical: 10 },
  detailTagText: { color: colors.ink, fontFamily: 'Nunito_400Regular', fontSize: 14 },
  reviewSection: { gap: 12 },
  reviewComposer: { gap: 10, borderRadius: 18, backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.line, padding: 14 },
  reviewComposerTitle: { color: colors.ink, fontFamily: bodyFont, fontSize: 16 },
  reviewRatingRow: { flexDirection: 'row', gap: 5 },
  reviewInput: { minHeight: 90, borderRadius: 16, borderWidth: 1, borderColor: colors.line, backgroundColor: colors.card, padding: 12, color: colors.ink, fontFamily: 'Nunito_400Regular', textAlignVertical: 'top' },
  reviewCard: { gap: 10, borderRadius: 18, backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.line, padding: 14 },
  reviewCardPinned: { borderColor: colors.redDark, backgroundColor: '#FFF1E8' },
  reviewHeader: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  reviewAvatar: { width: 40, height: 40, borderRadius: 20, backgroundColor: colors.olive, alignItems: 'center', justifyContent: 'center' },
  reviewAvatarText: { color: colors.card, fontFamily: bodyFont, fontSize: 16 },
  reviewHeaderText: { flex: 1, minWidth: 0 },
  reviewAuthor: { color: colors.ink, fontFamily: bodyFont, fontSize: 16 },
  reviewMeta: { color: colors.muted, fontFamily: 'Nunito_400Regular', fontSize: 13, marginTop: 2 },
  reviewComment: { color: colors.ink, fontFamily: 'Nunito_400Regular', fontSize: 16, lineHeight: 23 },
  reviewActions: { flexDirection: 'row', gap: 10 },
  reviewActionButton: { minHeight: 40, borderRadius: 20, borderWidth: 1, borderColor: colors.line, paddingHorizontal: 12, flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: colors.card },
  reviewActionText: { color: colors.ink, fontFamily: bodyFont, fontSize: 13 },
  detailAddress: { color: colors.muted, fontFamily: bodyFont, fontSize: 13 },
  reserveButton: { marginTop: 8, marginBottom: 8 },
  authSheet: { marginTop: 'auto', borderTopLeftRadius: 28, borderTopRightRadius: 28, backgroundColor: colors.bg, padding: 18, paddingTop: 28, gap: 12 },
  fieldLabel: { color: colors.muted, fontSize: 12, fontFamily: bodyFont },
  fieldInput: { minHeight: 48, borderRadius: 16, borderWidth: 1, borderColor: colors.line, backgroundColor: colors.surface, paddingHorizontal: 13, color: colors.ink, fontFamily: bodyFont },
  infoSheet: { marginTop: 'auto', borderTopLeftRadius: 28, borderTopRightRadius: 28, backgroundColor: colors.bg, padding: 22, paddingTop: 30, gap: 14 },
  infoCloseButton: { position: 'absolute', top: 14, right: 14, zIndex: 2, width: 42, height: 42, borderRadius: 21, backgroundColor: colors.surface, alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: colors.line },
  infoTitle: { color: colors.ink, fontFamily: titleFont, fontWeight: '900', fontSize: 34, lineHeight: 38, paddingRight: 46 },
  infoSubtitle: { color: colors.muted, fontFamily: 'Nunito_400Regular', fontSize: 16, lineHeight: 23, paddingRight: 18 },
  infoList: { gap: 10, marginTop: 8 },
  infoRow: { minHeight: 56, borderRadius: 16, backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.line, flexDirection: 'row', alignItems: 'center', gap: 10, paddingHorizontal: 14, marginBottom: 10 },
  infoRowText: { flex: 1, color: colors.ink, fontFamily: bodyFont, fontSize: 14, lineHeight: 19 }
});
