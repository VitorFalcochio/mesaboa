import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  Alert,
  Animated,
  Easing,
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
  useColorScheme,
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
import * as ImagePicker from 'expo-image-picker';
import * as Location from 'expo-location';
import * as Notifications from 'expo-notifications';
import {
  fetchFavoritesFromDb,
  fetchAllRestaurantsFromDb,
  fetchOwnerRestaurantsFromDb,
  fetchPendingRestaurantsFromDb,
  fetchReviewsFromDb,
  fetchRestaurantsFromDb,
  supabaseReady,
  addFeedCommentToDb,
  blockAccountInDb,
  claimRestaurantInDb,
  createInviteLinkInDb,
  createFeedPostInDb,
  createRestaurantInDb,
  reportContentInDb,
  recordRestaurantMetricInDb,
  registerPushTokenInDb,
  saveFavoritesToDb,
  saveReviewToDb,
  saveRestaurantToDb,
  saveUserProfileToDb,
  seedRestaurantsIfEmpty,
  uploadFeedPhoto,
  uploadRestaurantAsset,
  uploadUserProfilePhoto,
  updateRestaurantInDb,
  updateRestaurantStatusInDb,
  updateReviewInDb,
  setFeedReactionInDb
} from './supabaseConfig';
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
  seedRestaurantLegacyNames,
  seedRestaurants,
  seedUsers,
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

const appearancePalettes = {
  light: {
    bg: '#FFF6EA',
    surface: '#FFFDF7',
    nav: 'rgba(255,253,247,0.98)',
    ink: '#28282B',
    muted: '#6D6760',
    line: 'rgba(40, 40, 43, 0.12)',
    statusBar: 'dark'
  },
  dark: {
    bg: '#171412',
    surface: '#221D19',
    nav: 'rgba(34,29,25,0.98)',
    ink: '#FFF8EF',
    muted: '#C9BCAE',
    line: 'rgba(255, 248, 239, 0.16)',
    statusBar: 'light'
  },
  system: {
    bg: '#F7F0E6',
    surface: '#FFFDF7',
    nav: 'rgba(255,253,247,0.98)',
    ink: '#28282B',
    muted: '#6D6760',
    line: 'rgba(40, 40, 43, 0.12)',
    statusBar: 'dark'
  }
};

const accentPalettes = {
  dine: '#C84625',
  olive: '#5E8B5A',
  ocean: '#2A5C7D',
  gold: '#B7791F',
  wine: '#8F2D56'
};

function resolveAppearance(settings = {}, systemColorScheme = 'light') {
  const theme = settings.theme || 'light';
  const accentKey = settings.accent || 'dine';
  const resolvedTheme = theme === 'system' ? (systemColorScheme === 'dark' ? 'dark' : 'light') : theme;
  const palette = appearancePalettes[resolvedTheme] || appearancePalettes.light;
  return {
    ...palette,
    theme,
    resolvedTheme,
    accentKey,
    accent: accentPalettes[accentKey] || accentPalettes.dine
  };
}

const settingsCopy = {
  'pt-BR': {
    settingsTitle: 'Configurações',
    settingsSubtitle: 'Conta, privacidade e preferências do app.',
    account: 'Conta',
    editProfile: 'Editar perfil',
    editProfileSub: 'Nome, foto, bio, cidade e Instagram',
    preferences: 'Preferências gastronômicas',
    preferencesSub: 'Tipos de comida que aparecem para você',
    restaurants: 'Restaurantes',
    restaurantPanel: 'Painel do restaurante',
    restaurantPanelSub: 'Gerencie seus estabelecimentos, métricas e cardápio',
    registerRestaurant: 'Cadastrar restaurante',
    registerRestaurantSub: 'Envie seu estabelecimento para aprovação',
    admin: 'Central admin',
    adminSub: 'Aprovar, pausar e revisar restaurantes',
    privacySecurity: 'Privacidade e segurança',
    privacy: 'Privacidade do perfil',
    privacySub: 'Controle quem vê suas publicações e avaliações',
    location: 'Localização',
    security: 'Segurança da conta',
    securitySub: 'Senha, sessões conectadas e dispositivos',
    blocked: 'Contas bloqueadas',
    blockedSub: 'Gerencie pessoas e lugares ocultos',
    experience: 'Experiência',
    notifications: 'Notificações',
    notificationsSub: 'Curtidas, comentários, convites e novidades',
    invites: 'Convide amigos',
    invitesSub: 'Compartilhe o Dine com seus contatos',
    language: 'Idioma',
    appearance: 'Aparência',
    support: 'Suporte',
    help: 'Central de ajuda',
    helpSub: 'Dúvidas frequentes e primeiros passos',
    contactSupport: 'Falar com suporte',
    contactSupportSub: 'Envie uma mensagem para o time Dine',
    whatsapp: 'Suporte no WhatsApp',
    terms: 'Termos e privacidade',
    about: 'Sobre o Dine'
  },
  'en-US': {
    settingsTitle: 'Settings',
    settingsSubtitle: 'Account, privacy and app preferences.',
    account: 'Account',
    editProfile: 'Edit profile',
    editProfileSub: 'Name, photo, bio, city and Instagram',
    preferences: 'Food preferences',
    preferencesSub: 'Food types shown to you',
    restaurants: 'Restaurants',
    restaurantPanel: 'Restaurant panel',
    restaurantPanelSub: 'Manage places, metrics and menus',
    registerRestaurant: 'Register restaurant',
    registerRestaurantSub: 'Send your place for approval',
    admin: 'Admin center',
    adminSub: 'Approve, pause and review restaurants',
    privacySecurity: 'Privacy and security',
    privacy: 'Profile privacy',
    privacySub: 'Control who sees your posts and reviews',
    location: 'Location',
    security: 'Account security',
    securitySub: 'Password, sessions and devices',
    blocked: 'Blocked accounts',
    blockedSub: 'Manage hidden people and places',
    experience: 'Experience',
    notifications: 'Notifications',
    notificationsSub: 'Likes, comments, invites and news',
    invites: 'Invite friends',
    invitesSub: 'Share Dine with your contacts',
    language: 'Language',
    appearance: 'Appearance',
    support: 'Support',
    help: 'Help center',
    helpSub: 'FAQ and first steps',
    contactSupport: 'Contact support',
    contactSupportSub: 'Send a message to the Dine team',
    whatsapp: 'WhatsApp support',
    terms: 'Terms and privacy',
    about: 'About Dine'
  },
  'es-ES': {
    settingsTitle: 'Configuración',
    settingsSubtitle: 'Cuenta, privacidad y preferencias de la app.',
    account: 'Cuenta',
    editProfile: 'Editar perfil',
    editProfileSub: 'Nombre, foto, bio, ciudad e Instagram',
    preferences: 'Preferencias gastronómicas',
    preferencesSub: 'Tipos de comida que aparecen para ti',
    restaurants: 'Restaurantes',
    restaurantPanel: 'Panel del restaurante',
    restaurantPanelSub: 'Gestiona locales, métricas y menú',
    registerRestaurant: 'Registrar restaurante',
    registerRestaurantSub: 'Envía tu local para aprobación',
    admin: 'Central admin',
    adminSub: 'Aprobar, pausar y revisar restaurantes',
    privacySecurity: 'Privacidad y seguridad',
    privacy: 'Privacidad del perfil',
    privacySub: 'Controla quién ve tus publicaciones y reseñas',
    location: 'Ubicación',
    security: 'Seguridad de la cuenta',
    securitySub: 'Contraseña, sesiones y dispositivos',
    blocked: 'Cuentas bloqueadas',
    blockedSub: 'Gestiona personas y lugares ocultos',
    experience: 'Experiencia',
    notifications: 'Notificaciones',
    notificationsSub: 'Me gusta, comentarios, invitaciones y novedades',
    invites: 'Invitar amigos',
    invitesSub: 'Comparte Dine con tus contactos',
    language: 'Idioma',
    appearance: 'Apariencia',
    support: 'Soporte',
    help: 'Centro de ayuda',
    helpSub: 'Preguntas frecuentes y primeros pasos',
    contactSupport: 'Contactar soporte',
    contactSupportSub: 'Envía un mensaje al equipo Dine',
    whatsapp: 'Soporte por WhatsApp',
    terms: 'Términos y privacidad',
    about: 'Sobre Dine'
  }
};

const titleFont = Platform.select({ ios: 'Georgia', android: 'serif', default: 'serif' });
const bodyFont = 'Nunito_700Bold';

const dineLogo = require('./Designer/Logos/2.png');
const onboardingSlides = [
  {
    title: 'Descubra lugares perto de voce',
    text: 'Encontre restaurantes, lanches e experiencias que combinam com seu momento.',
    image: require('./assets/onboarding/order-food.svg')
  },
  {
    title: 'Escolha sem complicacao',
    text: 'Veja detalhes, salve favoritos e abra caminhos rapidos para pedir ou visitar.',
    image: require('./assets/onboarding/hamburger.svg')
  },
  {
    title: 'Gerencie tudo em um perfil',
    text: 'Entre para cuidar dos seus favoritos, avaliacoes e restaurantes cadastrados.',
    image: require('./assets/onboarding/eating-together.svg')
  }
];
function imageSource(value, fallback = defaultImage) {
  return typeof value === 'string' ? { uri: value || fallback } : value || { uri: fallback };
}

const NativeMaps = Platform.OS !== 'web' ? require('react-native-maps') : null;
const MapView = NativeMaps?.default;
const Marker = NativeMaps?.Marker;
const storageKeys = {
  restaurants: 'mesaBoaRestaurantsRN',
  favorites: 'mesaBoaFavoritesRN',
  users: 'mesaBoaUsersRN',
  currentUser: 'mesaBoaCurrentUserRN',
  restaurantCoordinates: 'mesaBoaRestaurantCoordinatesRN',
  onboardingSeen: 'dineOnboardingSeenRN'
};
const homeRestaurantSectionLimit = 15;
const demoDataEnabled = process.env.EXPO_PUBLIC_ENABLE_DEMO_DATA === 'true';
const demoAccountEmail = 'vitorfalcochio@gmail.com';
const builtInAdminEmails = demoDataEnabled ? [demoAccountEmail] : [];
const demoAccountId = 'vitor-demo';
const demoAccountName = 'Vitor';
const demoRestaurantId = 'vitor-falcochio-teste';
const collectionCurations = [
  {
    title: 'Jantar especial',
    subtitle: 'Lugares para noites inesquecíveis',
    image: 'https://images.unsplash.com/photo-1552566626-52f8b828add9?auto=format&fit=crop&w=900&q=86',
    include: ['restaurante', 'pizzaria', 'churrascaria', 'sushi', 'bistro', 'bistrô', 'italiana', 'frutos do mar', 'jantar'],
    exclude: ['hamburgueria', 'burger', 'fast food', 'acai', 'açai', 'suco', 'cafeteria', 'café', 'sorvete'],
    featuredIds: ['jangada-rio-preto', 'coco-bambu-rio-preto', 'tassinari', 'bella-capri-redentora', 'losteria-rio-preto', 'farrougrill-rio-preto', 'don-leon-rio-preto', 'paprika-restaurante']
  },
  {
    title: 'Cafés para sua tarde',
    subtitle: 'Selecionados para momentos leves',
    image: 'https://images.unsplash.com/photo-1509042239860-f550ce710b93?auto=format&fit=crop&w=900&q=86',
    include: ['café', 'coffee', 'cafeteria', 'padaria', 'brunch'],
    exclude: ['hamburgueria', 'burger', 'churrascaria', 'pizza', 'sushi'],
    featuredIds: ['rei-do-pao-de-queijo', 'la-frutta-acai']
  },
  {
    title: 'Rooftops com vista',
    subtitle: 'Altura, clima e bons drinks',
    image: 'https://images.unsplash.com/photo-1514933651103-005eec06c04b?auto=format&fit=crop&w=900&q=86',
    include: ['rooftop', 'vista', 'terraço', 'terraço', 'sky', 'lounge', 'bar'],
    exclude: ['hamburgueria', 'burger', 'fast food'],
    featuredIds: ['bartolomeu-jk', 'blue-jasmim']
  },
  {
    title: 'Novos na cidade',
    subtitle: 'Descubra lugares que acabaram de chegar',
    image: 'https://images.unsplash.com/photo-1559339352-11d035aa65de?auto=format&fit=crop&w=900&q=86',
    include: ['novo', 'novidade', 'inaugurado', 'recentemente', 'aberto'],
    exclude: [],
    featuredIds: ['vitor-falcochio-teste']
  },
  {
    title: 'Almoço de negócios',
    subtitle: 'Ambientes ideais para reuniões',
    image: 'https://images.unsplash.com/photo-1540189549336-e6e99c3679fe?auto=format&fit=crop&w=900&q=86',
    include: ['executivo', 'restaurante', 'bistro', 'bistrô', 'italiana', 'frutos do mar', 'churrascaria', 'pizzaria'],
    exclude: ['hamburgueria', 'burger', 'fast food', 'acai', 'açai'],
    featuredIds: ['jangada-rio-preto', 'coco-bambu-rio-preto', 'tassinari', 'losteria-rio-preto']
  },
  {
    title: 'Lugares instagramáveis',
    subtitle: 'Cenários que merecem ser compartilhados',
    image: 'https://images.unsplash.com/photo-1523906834658-6e24ef2386f9?auto=format&fit=crop&w=900&q=86',
    include: ['instagramável', 'instagramaveis', 'vista', 'decoracao', 'decoração', 'ambiente', 'lounge', 'rooftop'],
    exclude: ['hamburgueria', 'burger', 'fast food'],
    featuredIds: ['bartolomeu-jk', 'blue-jasmim', 'losteria-rio-preto']
  }
];

function normalize(value) {
  return String(value || '').normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();
}

function buildCollectionText(item) {
  return normalize([item?.name, item?.type, item?.district, item?.description, (item?.tags || []).join(' '), (item?.highlights || []).join(' ')].filter(Boolean).join(' '));
}

function matchesCollection(item, collection) {
  if (!item || !collection) return false;
  const text = buildCollectionText(item);
  if (collection.featuredIds?.includes(item.id)) return true;
  if (collection.exclude?.some((term) => text.includes(normalize(term)))) return false;
  if (collection.include?.some((term) => text.includes(normalize(term)))) return true;
  return text.includes(normalize(collection.title));
}

function scoreCollectionItem(item, collection) {
  const text = buildCollectionText(item);
  let score = scoreValue(item);
  if (collection.featuredIds?.includes(item.id)) score += 10;
  if (collection.include?.some((term) => text.includes(normalize(term)))) score += 4;
  if (collection.title === 'Jantar especial' && ['restaurante', 'pizzaria', 'churrascaria', 'sushi', 'bistro', 'bistrô', 'italiana', 'frutos do mar'].some((term) => text.includes(normalize(term)))) score += 3;
  if (collection.title === 'Cafés para sua tarde' && text.includes('café')) score += 3;
  return score;
}

function getCollectionRestaurants(restaurants, collection) {
  return restaurants
    .filter((item) => matchesCollection(item, collection))
    .sort((a, b) => scoreCollectionItem(b, collection) - scoreCollectionItem(a, collection));
}

function shouldRefreshLegacySeedRestaurants(items) {
  if (!Array.isArray(items) || !items.length) return false;
  const legacyNames = new Set(seedRestaurantLegacyNames.map(normalize));
  return items.every((item) => legacyNames.has(normalize(item?.name)));
}

function mergeSeedRestaurantMenus(items) {
  if (!Array.isArray(items)) return seedRestaurants;
  const seedsById = new Map(seedRestaurants.map((item) => [item.id, item]));
  return items.map((item) => {
    const seed = seedsById.get(item?.id);
    if (!seed) return item;
    const forceSeedBranding = seed.id === 'bb-onca-burguers';
    return {
      ...item,
      image: forceSeedBranding ? seed.image : item.image,
      logo: seed.logo || item.logo,
      coverPhoto: forceSeedBranding ? seed.coverPhoto : (item.coverPhoto || seed.coverPhoto),
      menu: item.menu?.length ? item.menu : seed.menu,
      menuItems: item.menuItems?.length ? item.menuItems : seed.menuItems
    };
  });
}

function normalizeDemoAccount(user) {
  if (!demoDataEnabled) return user;
  if (!user || normalize(user.email) !== normalize(demoAccountEmail)) return user;
  const demoSeed = seedUsers.find((item) => normalize(item.email) === normalize(demoAccountEmail));
  return {
    ...(demoSeed || {}),
    ...user,
    id: demoAccountId,
    name: demoAccountName,
    email: demoAccountEmail,
    gamification: mergeGamification(user.gamification || demoSeed?.gamification)
  };
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

function isAdminEmail(email) {
  const configured = [
    ...builtInAdminEmails,
    process.env.EXPO_PUBLIC_ADMIN_EMAIL,
    process.env.EXPO_PUBLIC_ADMIN_EMAILS
  ].filter(Boolean).join(',');
  return configured
    .split(',')
    .map((item) => normalize(item).trim())
    .filter(Boolean)
    .includes(normalize(email).trim());
}

function ownerIdFromEmail(email) {
  const normalized = normalize(email).trim();
  if (!normalized) return '';
  return `owner-${normalized.replace(/[^a-z0-9]+/g, '-')}`;
}

const weekDayKeys = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
const weekDayLabels = {
  sunday: 'domingo',
  monday: 'segunda',
  tuesday: 'terça',
  wednesday: 'quarta',
  thursday: 'quinta',
  friday: 'sexta',
  saturday: 'sábado'
};
const fixedBrazilHolidays = {
  '01-01': 'Confraternização Universal',
  '04-21': 'Tiradentes',
  '05-01': 'Dia do Trabalho',
  '09-07': 'Independência do Brasil',
  '10-12': 'Nossa Senhora Aparecida',
  '11-02': 'Finados',
  '11-15': 'Proclamação da República',
  '12-25': 'Natal'
};

function dateKey(date = new Date()) {
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${date.getFullYear()}-${month}-${day}`;
}

function fixedHolidayKey(date = new Date()) {
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${month}-${day}`;
}

function parseTimeToMinutes(value) {
  const match = String(value || '').match(/(\d{1,2})[:h]?(\d{2})?/i);
  if (!match) return null;
  const hours = Number(match[1]);
  const minutes = Number(match[2] || 0);
  if (hours < 0 || hours > 24 || minutes < 0 || minutes > 59) return null;
  return Math.min(24 * 60, hours * 60 + minutes);
}

function parseHoursRanges(value) {
  const text = String(value || '').trim();
  if (!text || /fechado|closed/i.test(text)) return [];
  return text
    .split(/[,;]/)
    .map((part) => {
      const [startText, endText] = part.split(/\s*(?:-|às|as|a)\s*/i);
      const start = parseTimeToMinutes(startText);
      const end = parseTimeToMinutes(endText);
      return Number.isFinite(start) && Number.isFinite(end) ? { start, end } : null;
    })
    .filter(Boolean);
}

function parseHolidayClosures(value) {
  return parseList(value).map((line) => {
    const [datePart, labelPart = 'Feriado'] = line.split('|').map((part) => part.trim());
    return { date: datePart, label: labelPart || 'Feriado' };
  }).filter((item) => /^\d{4}-\d{2}-\d{2}$/.test(item.date));
}

function getRestaurantOpenStatus(item, now = new Date()) {
  if (!item) return { open: false, label: 'Fechado', detail: '' };
  if (['paused', 'archived', 'rejected'].includes(item.status)) {
    return { open: false, label: 'Fechado', detail: 'Perfil pausado' };
  }

  const todayKey = dateKey(now);
  const customHoliday = (item.holidayClosures || []).find((holiday) => holiday?.date === todayKey);
  const fixedHoliday = fixedBrazilHolidays[fixedHolidayKey(now)];
  if (customHoliday || fixedHoliday) {
    return { open: false, label: 'Fechado', detail: customHoliday?.label || fixedHoliday };
  }

  const dayKey = weekDayKeys[now.getDay()];
  const ranges = parseHoursRanges(item.openingHours?.[dayKey]);
  if (!ranges.length) {
    return item.open
      ? { open: true, label: 'Aberto', detail: 'Horário não informado' }
      : { open: false, label: 'Fechado', detail: weekDayLabels[dayKey] };
  }

  const minutesNow = now.getHours() * 60 + now.getMinutes();
  const activeRange = ranges.find(({ start, end }) => (
    end >= start ? minutesNow >= start && minutesNow < end : minutesNow >= start || minutesNow < end
  ));
  if (activeRange) {
    const closesAt = `${String(Math.floor(activeRange.end / 60) % 24).padStart(2, '0')}:${String(activeRange.end % 60).padStart(2, '0')}`;
    return { open: true, label: 'Aberto', detail: `Fecha ${closesAt}` };
  }

  const nextRange = ranges.find(({ start }) => start > minutesNow) || ranges[0];
  const opensAt = `${String(Math.floor(nextRange.start / 60)).padStart(2, '0')}:${String(nextRange.start % 60).padStart(2, '0')}`;
  return { open: false, label: 'Fechado', detail: `Abre ${opensAt}` };
}

function RestaurantCard({ item, favorite, onOpen, onFavorite }) {
  const openStatus = getRestaurantOpenStatus(item);
  const hasLogo = Boolean(item.logo);
  return (
    <Pressable accessibilityRole="button" accessibilityLabel={`Abrir restaurante ${item.name}`} onPress={() => onOpen(item)} style={({ pressed }) => [styles.restaurantCard, pressed && styles.pressed]}>
      <View style={[styles.imageWrap, hasLogo && styles.logoImageWrap]}>
        {hasLogo ? (
          <View style={styles.logoImageStage}>
            <Image source={imageSource(item.logo)} style={styles.restaurantLogoImage} />
          </View>
        ) : (
          <>
            <Image source={imageSource(item.image)} style={styles.restaurantImage} />
            <View style={styles.imageScrim} />
          </>
        )}
        <View style={[styles.openBadge, openStatus.open && styles.openBadgeActive]}>
          <Text style={styles.openBadgeText}>{openStatus.label}</Text>
        </View>
        <Pressable accessibilityRole="button" accessibilityLabel={favorite ? `Remover ${item.name} dos favoritos` : `Salvar ${item.name} nos favoritos`} hitSlop={8} onPress={() => onFavorite(item.name)} style={({ pressed }) => [styles.heartButton, pressed && styles.activePress]}>
          <Ionicons name={favorite ? 'heart' : 'heart-outline'} size={22} color={colors.card} />
        </Pressable>
        <View style={[styles.cardOverlay, hasLogo && styles.logoCardOverlay]}>
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
  const openStatus = getRestaurantOpenStatus(item);
  return (
    <Pressable accessibilityRole="button" accessibilityLabel={`Abrir restaurante ${item.name}`} onPress={() => onPress(item)} style={({ pressed }) => [styles.miniItem, pressed && styles.pressed]}>
      <Image source={imageSource(item.logo || item.image)} style={[styles.miniImage, item.logo && styles.miniLogoImage]} />
      <View style={styles.miniText}>
        <Text style={styles.miniTag}>{openStatus.open ? 'Aberto agora' : openStatus.detail || 'Fechado'}</Text>
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

function buildRestaurantGeocodeQuery(item) {
  const parts = [item?.name, item?.address, item?.district, 'São José do Rio Preto', 'SP', 'Brasil']
    .map((value) => String(value || '').trim())
    .filter(Boolean);
  return parts.join(', ');
}

async function geocodeRestaurantCoordinate(item) {
  const query = buildRestaurantGeocodeQuery(item);
  if (!query) return null;

  if (typeof Location?.geocodeAsync === 'function') {
    try {
      const results = await Location.geocodeAsync(query);
      const first = results?.[0];
      if (Number.isFinite(first?.latitude) && Number.isFinite(first?.longitude)) {
        return { latitude: first.latitude, longitude: first.longitude };
      }
    } catch (error) {
      // Fallback below.
    }
  }

  try {
    const response = await fetch(`https://nominatim.openstreetmap.org/search?format=jsonv2&limit=1&countrycodes=br&q=${encodeURIComponent(query)}`, {
      headers: {
        Accept: 'application/json',
        'User-Agent': 'MesaBoa/1.0'
      }
    });
    if (!response.ok) return null;
    const results = await response.json();
    const first = Array.isArray(results) ? results[0] : null;
    const latitude = Number(first?.lat);
    const longitude = Number(first?.lon);
    if (Number.isFinite(latitude) && Number.isFinite(longitude)) {
      return { latitude, longitude };
    }
  } catch (error) {
    // Keep the seeded coordinate fallback.
  }

  return null;
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
    menuPhoto: item.menuPhoto || '',
    menuText: (item.menuItems || []).map((dish) => `${dish.name} | ${dish.price || ''}`).join('\n'),
    openingHoursText: item.openingHours
      ? Object.entries(item.openingHours).map(([day, hours]) => `${day}: ${hours}`).join('\n')
      : '',
    holidayClosuresText: (item.holidayClosures || []).map((holiday) => `${holiday.date} | ${holiday.label || 'Feriado'}`).join('\n'),
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

function formatCompactCount(value) {
  if (!Number.isFinite(value)) return '0';
  if (value >= 1000000) return `${(value / 1000000).toFixed(value >= 10000000 ? 0 : 1)} mi`;
  if (value >= 1000) return `${(value / 1000).toFixed(value >= 10000 ? 0 : 1)} mil`;
  return String(Math.round(value));
}

function buildRestaurantFeedItems(item) {
  const photos = (item?.photos || []).filter((photo) => photo?.url);
  const menuItems = (item?.menuItems || []).filter((dish) => dish?.name);
  const highlightItems = (item?.highlights || []).filter(Boolean);
  const feed = [];

  if (item?.menuPhoto) {
    feed.push({
      id: `${item.id}-menu-photo`,
      kind: 'menuPhoto',
      image: item.menuPhoto,
      title: 'Foto do cardápio',
      caption: 'Cardápio fotografado pelo estabelecimento.',
      meta: 'Cardápio'
    });
  }

  photos.forEach((photo, index) => {
    feed.push({
      id: `${item.id}-photo-${index}`,
      kind: 'photo',
      image: photo.url,
      title: photo.isCover ? 'Capa do perfil' : `Foto ${index + 1}`,
      caption: item.description || `${item.name} em destaque.`,
      meta: `${item.name} • ${item.district}`
    });
  });

  menuItems.forEach((dish, index) => {
    feed.push({
      id: `${item.id}-menu-${index}`,
      kind: 'dish',
      image: dish.image || item.image || defaultImage,
      title: dish.name,
      caption: dish.description || `Produto do cardapio - ${dish.priceLabel || (dish.price ? `R$ ${dish.price}` : 'sob consulta')}`,
      meta: dish.category || highlightItems[index % Math.max(1, highlightItems.length)] || item.type
    });
  });

  if (!feed.length) {
    feed.push({
      id: `${item.id}-starter`,
      kind: 'starter',
      image: item.image || defaultImage,
      title: 'Cardápio em breve',
      caption: 'Adicione a foto do cardápio para o cliente decidir sem sair do perfil.',
      meta: 'Cardápio'
    });
  }

  return feed;
}

function buildRestaurantProfileTiles(item, count = 9) {
  const feed = buildRestaurantFeedItems(item);
  const fallbackImage = item?.coverPhoto || item?.image || defaultImage;
  const safeFeed = feed.length ? feed : [{ image: fallbackImage, title: item?.name, caption: item?.description, meta: item?.district }];
  return Array.from({ length: count }, (_, index) => {
    const source = safeFeed[index % safeFeed.length] || {};
    return {
      ...source,
      id: `${item.id}-tile-${index}`,
      image: source.image || fallbackImage,
      title: source.title || item?.name,
      caption: source.caption || item?.description || `${item?.name} em destaque.`,
      meta: source.meta || item?.district,
      likes: Number(source.likes || Math.max(6, Math.round((item?.metrics?.views || 0) / 14) + index * 3))
    };
  });
}

function postKey(restaurantId, postId) {
  return `${restaurantId}:${postId}`;
}

function matchesQuickFilter(item, filter) {
  if (!filter) return true;
  if (filter === 'Aberto agora') return getRestaurantOpenStatus(item).open;
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
  const systemColorScheme = useColorScheme();
  const compact = width < 380;
  const homeDiscoveryCardWidth = Math.max(280, width - 36);
  const screenFade = useRef(new Animated.Value(1)).current;
  const startupSplashOpacity = useRef(new Animated.Value(1)).current;
  const startupLogoScale = useRef(new Animated.Value(0.82)).current;
  const startupLogoLift = useRef(new Animated.Value(18)).current;
  const startupPulse = useRef(new Animated.Value(0)).current;
  const homeDiscoveryAnim = useRef(new Animated.Value(1)).current;
  const homeDiscoverySheen = useRef(new Animated.Value(0)).current;
  const homeDiscoveryScrollRef = useRef(null);
  const demoRestaurantSeededRef = useRef(false);
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
  const [restaurantCoordinates, setRestaurantCoordinates] = useState({});
  const [locationStatus, setLocationStatus] = useState('idle');
  const [locationMessage, setLocationMessage] = useState('Use sua localização para ordenar por distância real.');
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [ownerRestaurants, setOwnerRestaurants] = useState([]);
  const [pendingRestaurants, setPendingRestaurants] = useState([]);
  const [editingRestaurant, setEditingRestaurant] = useState(null);
  const [selectedPanelPost, setSelectedPanelPost] = useState(null);
  const [panelPostLikes, setPanelPostLikes] = useState({});
  const isAdmin = Boolean(currentUser?.email && isAdminEmail(currentUser.email));
  const appAppearance = useMemo(() => resolveAppearance(currentUser?.settings, systemColorScheme), [currentUser?.settings, systemColorScheme]);
  const copy = settingsCopy[currentUser?.settings?.language || 'pt-BR'] || settingsCopy['pt-BR'];
  const [clockTick, setClockTick] = useState(Date.now());
  const [reviewsByRestaurant, setReviewsByRestaurant] = useState({});
  const [reviewDraft, setReviewDraft] = useState({ rating: '5', comment: '' });
  const [feedReactions, setFeedReactions] = useState({});
  const [feedCommentDrafts, setFeedCommentDrafts] = useState({});
  const [feedPhotoIndexes, setFeedPhotoIndexes] = useState({});
  const [customFeedPosts, setCustomFeedPosts] = useState([]);
  const [selectedFeedProfile, setSelectedFeedProfile] = useState(null);
  const [feedComposerOpen, setFeedComposerOpen] = useState(false);
  const [feedDraft, setFeedDraft] = useState({ caption: '', restaurantId: '', restaurantName: '', photos: [] });
  const [profileInstagramDraft, setProfileInstagramDraft] = useState('');
  const [profileDraft, setProfileDraft] = useState({ name: '', bio: '', location: '', preferences: '' });
  const [homeDiscoveryIndex, setHomeDiscoveryIndex] = useState(0);
  const [showStartupSplash, setShowStartupSplash] = useState(true);
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [onboardingIndex, setOnboardingIndex] = useState(0);

  useEffect(() => {
    screenFade.setValue(0);
    Animated.timing(screenFade, {
      toValue: 1,
      duration: 180,
      useNativeDriver: true
    }).start();
  }, [tab, activeScreen?.name, screenFade]);

  useEffect(() => {
    if (!fontsLoaded) return undefined;
    startupSplashOpacity.setValue(1);
    startupLogoScale.setValue(0.82);
    startupLogoLift.setValue(18);
    startupPulse.setValue(0);

    const animation = Animated.sequence([
      Animated.parallel([
        Animated.spring(startupLogoScale, {
          toValue: 1,
          friction: 7,
          tension: 72,
          useNativeDriver: true
        }),
        Animated.spring(startupLogoLift, {
          toValue: 0,
          friction: 8,
          tension: 68,
          useNativeDriver: true
        }),
        Animated.timing(startupPulse, {
          toValue: 1,
          duration: 760,
          useNativeDriver: true
        })
      ]),
      Animated.delay(420),
      Animated.timing(startupSplashOpacity, {
        toValue: 0,
        duration: 360,
        useNativeDriver: true
      })
    ]);

    animation.start(({ finished }) => {
      if (finished) setShowStartupSplash(false);
    });
    return () => animation.stop();
  }, [fontsLoaded, startupLogoLift, startupLogoScale, startupPulse, startupSplashOpacity]);

  useEffect(() => {
    const timer = setInterval(() => setClockTick(Date.now()), 60000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    const timer = setInterval(() => {
      setHomeDiscoveryIndex((index) => index + 1);
    }, 4000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    setProfileInstagramDraft(currentUser?.instagram || '');
    setProfileDraft({
      name: currentUser?.name || '',
      bio: currentUser?.bio || '',
      location: currentUser?.location || '',
      preferences: (currentUser?.preferences || []).join(', ')
    });
  }, [currentUser?.id, currentUser?.name, currentUser?.instagram, currentUser?.bio, currentUser?.location, currentUser?.preferences]);

  useEffect(() => {
    async function load() {
      try {
        const [storedRestaurants, storedFavorites, storedUsers, storedCurrentUser, storedOnboardingSeen] = await Promise.all([
          AsyncStorage.getItem(storageKeys.restaurants),
          AsyncStorage.getItem(storageKeys.favorites),
          AsyncStorage.getItem(storageKeys.users),
          AsyncStorage.getItem(storageKeys.currentUser),
          AsyncStorage.getItem(storageKeys.onboardingSeen)
        ]);
        const storedRestaurantCoordinates = await AsyncStorage.getItem(storageKeys.restaurantCoordinates);
        const localUser = storedCurrentUser ? normalizeDemoAccount(JSON.parse(storedCurrentUser)) : null;

        if (storedRestaurants) {
          const parsedRestaurants = JSON.parse(storedRestaurants);
          setRestaurants(shouldRefreshLegacySeedRestaurants(parsedRestaurants) ? seedRestaurants : mergeSeedRestaurantMenus(parsedRestaurants));
        }
        if (storedFavorites) setFavorites(JSON.parse(storedFavorites));
        if (storedRestaurantCoordinates) {
          setRestaurantCoordinates(JSON.parse(storedRestaurantCoordinates));
        }
        const mergedUsers = [
          ...seedUsers,
          ...(storedUsers ? JSON.parse(storedUsers) : [])
        ].reduce((list, user) => {
          const exists = list.some((item) => normalize(item.email) === normalize(user.email));
          const mergedUser = normalizeDemoAccount(user);
          if (exists) return list.map((item) => (normalize(item.email) === normalize(user.email) ? { ...item, ...mergedUser, gamification: mergeGamification(mergedUser.gamification) } : item));
          return [...list, { ...mergedUser, gamification: mergeGamification(mergedUser.gamification) }];
        }, []);
        setUsers(mergedUsers);
        if (localUser) {
          setCurrentUser(normalizeDemoAccount({ ...localUser, gamification: mergeGamification(localUser.gamification) }));
        } else if (storedOnboardingSeen) {
          setAuthMode('login');
          setForm({});
        } else {
          setShowOnboarding(true);
          setAuthMode(null);
          setForm({});
        }

        if (supabaseReady) {
          await seedRestaurantsIfEmpty(seedRestaurants, seedRestaurantLegacyNames);
          const remoteRestaurants = await fetchRestaurantsFromDb();
          if (remoteRestaurants?.length) setRestaurants(mergeSeedRestaurantMenus(remoteRestaurants));
          if (localUser) {
            const remoteFavorites = await fetchFavoritesFromDb(localUser.id);
            if (remoteFavorites) setFavorites(remoteFavorites);
          }
        }
      } catch (error) {
        Alert.alert('Supabase', 'Não foi possível sincronizar agora. O app vai continuar usando os dados locais.');
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
    if (!hydrated) return;
    AsyncStorage.setItem(storageKeys.restaurantCoordinates, JSON.stringify(restaurantCoordinates));
  }, [hydrated, restaurantCoordinates]);

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
    if (isAdmin) {
      fetchAllRestaurantsFromDb()
        .then((items) => {
          if (items) setOwnerRestaurants(items);
        })
        .catch(() => {});
      fetchPendingRestaurantsFromDb()
        .then((items) => {
          if (items) setPendingRestaurants(items);
        })
        .catch(() => {});
    } else {
      fetchOwnerRestaurantsFromDb(currentUser.id)
        .then((items) => {
          if (items) setOwnerRestaurants(items);
        })
        .catch(() => {});
    }
  }, [currentUser, hydrated, isAdmin, restaurants]);

  useEffect(() => {
    if (!demoDataEnabled || !hydrated || !currentUser || normalize(currentUser.email) !== normalize(demoAccountEmail)) return;
    if (demoRestaurantSeededRef.current) return;
    const demoRestaurant = seedRestaurants.find((item) => item.id === demoRestaurantId);
    if (!demoRestaurant) return;
    if (!restaurants.some((item) => item.id === demoRestaurant.id)) {
      setRestaurants((items) => [demoRestaurant, ...items]);
    }
    setOwnerRestaurants((items) => {
      const exists = items.some((item) => item.id === demoRestaurant.id || normalize(item.ownerEmail) === normalize(demoAccountEmail));
      return exists ? items : [demoRestaurant, ...items];
    });
    saveRestaurantToDb(demoRestaurant).catch(() => {});
    demoRestaurantSeededRef.current = true;
  }, [currentUser, hydrated, restaurants]);

  useEffect(() => {
    if (!selectedRestaurant?.id) return;
    fetchReviewsFromDb(selectedRestaurant.id)
      .then((items) => {
        if (items) setReviewsByRestaurant((current) => ({ ...current, [selectedRestaurant.id]: items }));
      })
      .catch(() => {});
  }, [selectedRestaurant?.id]);

  useEffect(() => {
    if (!hydrated || !restaurants.length) return;
    let cancelled = false;

    async function resolveCoordinates() {
      const updates = {};
      for (const item of restaurants) {
        if (!item?.id || restaurantCoordinates[item.id]) continue;
        const seeded = coordinateForRestaurant(item);
        const resolved = await geocodeRestaurantCoordinate(item);
        updates[item.id] = resolved || seeded;
      }
      if (!cancelled && Object.keys(updates).length) {
        setRestaurantCoordinates((current) => ({ ...current, ...updates }));
      }
    }

    resolveCoordinates().catch(() => {});
    return () => {
      cancelled = true;
    };
  }, [hydrated, restaurants, restaurantCoordinates]);

  const searchCenter = useMemo(() => ({
    latitude: mapRegion.latitude,
    longitude: mapRegion.longitude
  }), [mapRegion]);
  const restaurantsWithCoordinates = useMemo(() => restaurants.map((item, index) => ({
    ...item,
    coordinate: restaurantCoordinates[item.id] || coordinateForRestaurant(item, index)
  })), [restaurants, restaurantCoordinates]);
  const publicRestaurants = useMemo(() => restaurantsWithCoordinates.filter((item) => !item.status || item.status === 'published'), [restaurantsWithCoordinates]);

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
  const discoveryRestaurants = useMemo(() => topRestaurants.slice(0, 8), [topRestaurants]);
  const generatedFeedPosts = useMemo(() => topRestaurants.slice(0, 14).map((restaurant, index) => {
    const dishes = (restaurant.menuItems || restaurant.menu || []).filter((dish) => dish?.name);
    const dish = dishes.find((item) => item.image) || dishes[0];
    const image = dish?.image || restaurant.coverPhoto || restaurant.image || defaultImage;
    const authorProfiles = [
      { id: 'dine-curadoria', name: 'Dine Curadoria', handle: '@dine', bio: 'Roteiros, pratos e achados da cidade.', instagram: '@dineapp', followers: 12800, following: 42, avatar: restaurant.logo || restaurant.image },
      { id: 'vitor-feed', name: 'Vitor', handle: '@vitor', bio: 'Compartilhando lugares bons para comer e voltar.', instagram: '@vitor', followers: 842, following: 318, avatar: restaurant.logo || restaurant.image },
      { id: 'mesa-boa', name: 'Mesa Boa', handle: '@mesaboa', bio: 'Momentos de mesa, pratos favoritos e novas descobertas.', instagram: '@mesaboa', followers: 2450, following: 174, avatar: restaurant.logo || restaurant.image }
    ];
    const authorProfile = authorProfiles[index % authorProfiles.length];
    const captions = [
      `Experiência salva em ${restaurant.name}: ${dish?.name || restaurant.highlights?.[0] || restaurant.type}.`,
      `${restaurant.name} entrou no roteiro de hoje. Ambiente, cardápio e vontade de voltar.`,
      `Dica rápida: peça ${dish?.name || restaurant.highlights?.[0] || 'o prato da casa'} no ${restaurant.name}.`
    ];
    return {
      id: `${restaurant.id}-feed-${dish?.id || index}`,
      restaurantId: restaurant.id,
      restaurant,
      authorId: authorProfile.id,
      author: authorProfile.name,
      handle: authorProfile.handle,
      avatar: authorProfile.avatar,
      authorProfile,
      image,
      images: [image],
      title: dish?.name || restaurant.name,
      caption: captions[index % captions.length],
      location: `${restaurant.district} • ${restaurant.type}`,
      likes: 24 + index * 7 + Math.round(scoreValue(restaurant) * 3),
      comments: [
        { id: '1', author: 'Ana', text: 'Esse lugar entrou na minha lista.' },
        { id: '2', author: 'Gui', text: 'Boa dica para o fim de semana.' }
      ].slice(0, 1 + (index % 2)),
      reposts: 2 + (index % 5)
    };
  }), [topRestaurants]);
  const feedPosts = useMemo(() => {
    const blocked = new Set((currentUser?.blockedAccounts || []).map((item) => normalize(item)));
    return [...customFeedPosts, ...generatedFeedPosts].filter((post) => {
      const keys = [post.authorId, post.handle, post.author, post.authorProfile?.id, post.authorProfile?.handle, post.authorProfile?.name]
        .map((item) => normalize(item))
        .filter(Boolean);
      return !keys.some((key) => blocked.has(key));
    });
  }, [customFeedPosts, generatedFeedPosts, currentUser?.blockedAccounts]);
  const trendingLists = useMemo(() => {
    const definitions = [
      { title: 'Melhores hamburguerias', icon: 'fast-food-outline', terms: ['hamburgueria', 'hamburguer', 'burger', 'smash'] },
      { title: 'Melhores churrascarias', icon: 'flame-outline', terms: ['churrascaria', 'churrasco', 'carnes', 'steakhouse'] },
      { title: 'Massas e pizzarias', icon: 'restaurant-outline', terms: ['pizza', 'pizzaria', 'massa', 'italiana', 'osteria'] },
      { title: 'Doces, cafés e sorvetes', icon: 'ice-cream-outline', terms: ['açai', 'acai', 'café', 'cafeteria', 'sorvete', 'sobremesa', 'padaria'] }
    ];
    return definitions.map((group) => ({
      ...group,
      items: topRestaurants
        .filter((restaurant) => {
          const text = normalize(`${restaurant.name} ${restaurant.type} ${restaurant.description} ${(restaurant.tags || []).join(' ')} ${(restaurant.highlights || []).join(' ')}`);
          return group.terms.some((term) => text.includes(normalize(term)));
        })
        .slice(0, 10)
    })).filter((group) => group.items.length);
  }, [topRestaurants]);
  const trendingCategoryTiles = useMemo(() => {
    const definitions = [
      { title: 'Restaurantes', icon: 'restaurant-outline', terms: [], color: '#FFF1E8' },
      { title: 'Hamburguerias', icon: 'fast-food-outline', terms: ['hamburgueria', 'hamburguer', 'burger', 'smash'], color: '#FFF1E8' },
      { title: 'Churrascarias', icon: 'flame-outline', terms: ['churrascaria', 'churrasco', 'carnes', 'steakhouse', 'cupim'], color: '#FFF4DE' },
      { title: 'Japonesa', icon: 'fish-outline', terms: ['japonesa', 'japonês', 'sushi', 'temaki', 'makisu'], color: '#EEF4E7' },
      { title: 'Pizzarias', icon: 'pizza-outline', terms: ['pizza', 'pizzaria', 'italiana', 'massa', 'osteria'], color: '#FFF1E8' },
      { title: 'Cafés e doces', icon: 'cafe-outline', terms: ['café', 'cafeteria', 'padaria', 'doce', 'sobremesa', 'sorvete', 'açai', 'acai'], color: '#F4F0FF' },
      { title: 'Fast food', icon: 'bag-handle-outline', terms: ['fast food', 'shopping', 'mcdonald', 'burger king'], color: '#EEF4FF' },
      { title: 'Ver mais', icon: 'grid-outline', terms: [], color: '#F5F5F2', more: true }
    ];
    const textFor = (restaurant) => normalize(`${restaurant.name} ${restaurant.type} ${restaurant.description} ${(restaurant.tags || []).join(' ')} ${(restaurant.highlights || []).join(' ')}`);
    return definitions.map((item) => {
      const items = item.more || !item.terms.length
        ? topRestaurants
        : topRestaurants.filter((restaurant) => item.terms.some((term) => textFor(restaurant).includes(normalize(term))));
      return {
        ...item,
        count: items.length,
        items: items.slice(0, 10)
      };
    }).filter((item) => item.more || item.count > 0);
  }, [topRestaurants]);
  const favoriteRestaurants = restaurants.filter((item) => favorites.includes(item.name));

  useEffect(() => {
    if (!discoveryRestaurants.length || !homeDiscoveryScrollRef.current) return;
    const index = homeDiscoveryIndex % discoveryRestaurants.length;
    homeDiscoveryScrollRef.current.scrollTo({
      x: index * homeDiscoveryCardWidth,
      animated: true
    });
  }, [discoveryRestaurants.length, homeDiscoveryCardWidth, homeDiscoveryIndex]);

  useEffect(() => {
    homeDiscoveryAnim.setValue(0);
    homeDiscoverySheen.setValue(0);
    Animated.parallel([
      Animated.timing(homeDiscoveryAnim, {
        toValue: 1,
        duration: 520,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true
      }),
      Animated.timing(homeDiscoverySheen, {
        toValue: 1,
        duration: 900,
        easing: Easing.out(Easing.quad),
        useNativeDriver: true
      })
    ]).start();
  }, [homeDiscoveryAnim, homeDiscoveryIndex, homeDiscoverySheen]);

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

  function openPanelPost(restaurant, post) {
    setSelectedPanelPost({ restaurant, post });
  }

  function togglePanelPostLike(restaurant, post) {
    const key = postKey(restaurant.id, post.id);
    setPanelPostLikes((current) => {
      const existing = current[key] || { liked: false, count: Number(post.likes || 0) };
      return {
        ...current,
        [key]: {
          liked: !existing.liked,
          count: Math.max(0, existing.count + (existing.liked ? -1 : 1))
        }
      };
    });
  }

  function feedState(post) {
    return feedReactions[post.id] || {};
  }

  function toggleFeedFlag(postId, field) {
    if (['liked', 'saved', 'reposted'].includes(field) && !currentUser) {
      requireLogin({ type: 'tab', target: 'Perfil' });
      return;
    }
    const active = !feedReactions[postId]?.[field];
    setFeedReactions((current) => ({
      ...current,
      [postId]: {
        ...(current[postId] || {}),
        [field]: !current[postId]?.[field]
      }
    }));
    if (['liked', 'saved', 'reposted'].includes(field)) {
      setFeedReactionInDb(postId, field, active, currentUser).catch(() => {});
    }
  }

  function addFeedComment(post) {
    const text = String(feedCommentDrafts[post.id] || '').trim();
    if (!text) return;
    if (!currentUser && !requireLogin({ type: 'tab', target: 'Perfil' })) return;
    const comment = {
      id: `${post.id}-${Date.now()}`,
      author: currentUser?.name || 'Visitante',
      text
    };
    setFeedReactions((current) => ({
      ...current,
      [post.id]: {
        ...(current[post.id] || {}),
        comments: [...(current[post.id]?.comments || []), comment]
      }
    }));
    setFeedCommentDrafts((current) => ({ ...current, [post.id]: '' }));
    addFeedCommentToDb(post.id, comment, currentUser).catch(() => {});
  }

  function shareFeedPost(post) {
    Share.share({ message: `${post.caption}\n${post.restaurant.name} no Dine.` }).catch(() => {});
  }

  function openFeedProfile(post) {
    const profile = post.authorProfile || {
      id: post.authorId || post.handle || post.author,
      name: post.author,
      handle: post.handle,
      bio: 'Compartilhando momentos e descobertas gastronômicas.',
      instagram: '',
      followers: 0,
      following: 0,
      avatar: post.avatar
    };
    const profileKey = profile.id || profile.handle || profile.name;
    const posts = feedPosts.filter((item) => {
      const itemProfile = item.authorProfile || {};
      return (itemProfile.id || item.authorId || item.handle || item.author) === profileKey;
    });
    setSelectedFeedProfile({
      ...profile,
      posts: posts.length ? posts : [post]
    });
    navigateTo('feedProfile');
  }

  async function toggleFollowProfile(profile) {
    if (!currentUser) {
      requireLogin({ type: 'tab', target: 'Perfil' });
      return;
    }
    const profileId = String(profile?.id || profile?.handle || profile?.name || '').trim();
    if (!profileId) return;
    const following = currentUser.followingProfiles || [];
    const isFollowing = following.some((item) => String(item.id) === profileId);
    const nextFollowing = isFollowing
      ? following.filter((item) => String(item.id) !== profileId)
      : [{ id: profileId, name: profile?.name || 'Perfil', handle: profile?.handle || '', avatar: profile?.avatar || '', followedAt: new Date().toISOString() }, ...following];
    await updateCurrentUserProfile({ followingProfiles: nextFollowing });
  }

  function openFeedComposer() {
    setFeedDraft({
      caption: '',
      restaurantId: '',
      restaurantName: '',
      photos: []
    });
    setFeedComposerOpen(true);
  }

  async function pickFeedPhotos() {
    const selectedPhotos = (feedDraft.photos || []).filter(Boolean).slice(0, 4);
    const remainingSlots = Math.max(0, 4 - selectedPhotos.length);
    if (!remainingSlots) {
      Alert.alert('Fotos', 'Você pode publicar até 4 fotos.');
      return;
    }
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) {
      Alert.alert('Permissão necessária', 'Permita acesso à galeria para escolher fotos.');
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsMultipleSelection: true,
      selectionLimit: remainingSlots,
      quality: 0.86,
      allowsEditing: false
    });
    if (result.canceled) return;
    const pickedPhotos = await Promise.all((result.assets || []).map((asset, index) => (
      withImageUploadFallback(asset.uri, (uri) => uploadFeedPhoto(currentUser || { id: 'visitor-feed' }, uri, selectedPhotos.length + index))
    )));
    const cleanPhotos = pickedPhotos.filter(Boolean);
    if (!cleanPhotos.length) return;
    setFeedDraft((current) => ({
      ...current,
      photos: [...(current.photos || []).filter(Boolean), ...cleanPhotos].slice(0, 4)
    }));
  }

  function removeFeedPhoto(index) {
    setFeedDraft((current) => ({
      ...current,
      photos: (current.photos || []).filter((_, photoIndex) => photoIndex !== index)
    }));
  }

  async function publishFeedPost() {
    const caption = String(feedDraft.caption || '').trim();
    const photos = (feedDraft.photos || []).map((photo) => String(photo || '').trim()).filter(Boolean).slice(0, 4);
    const restaurantName = String(feedDraft.restaurantName || '').trim();
    const selectedRestaurant = publicRestaurants.find((item) => item.id === feedDraft.restaurantId)
      || publicRestaurants.find((item) => normalize(item.name) === normalize(restaurantName));
    const restaurant = selectedRestaurant || {
      id: `custom-restaurant-${normalize(restaurantName || 'restaurante')}-${Date.now()}`,
      name: restaurantName || 'Restaurante não informado',
      type: 'Fora da plataforma',
      district: 'Publicado pela comunidade',
      image: photos[0],
      logo: null
    };
    if (!caption) {
      Alert.alert('Publicação', 'Escreva um texto curto para publicar.');
      return;
    }
    if (!photos.length) {
      Alert.alert('Publicação', 'Selecione pelo menos uma foto da galeria.');
      return;
    }
    if (!restaurantName && !selectedRestaurant) {
      Alert.alert('Publicação', 'Digite o nome do restaurante ou escolha um da busca.');
      return;
    }
    const post = {
      id: `user-feed-${Date.now()}`,
      restaurantId: restaurant.id,
      restaurant,
      authorId: currentUser?.id || 'visitor-feed',
      author: currentUser?.name || 'Você',
      handle: currentUser?.email ? `@${normalize(currentUser.name || 'voce').replace(/\s+/g, '')}` : '@voce',
      avatar: currentUser?.photo || restaurant.logo || restaurant.image,
      authorProfile: {
        id: currentUser?.id || 'visitor-feed',
        name: currentUser?.name || 'Você',
        handle: currentUser?.email ? `@${normalize(currentUser.name || 'voce').replace(/\s+/g, '')}` : '@voce',
        bio: 'Compartilhando momentos e descobertas gastronômicas.',
        instagram: String(currentUser?.instagram || '').trim(),
        followers: currentUser?.followers || 0,
        following: currentUser?.following || 0,
        avatar: currentUser?.photo || restaurant.logo || restaurant.image
      },
      image: photos[0],
      images: photos,
      title: restaurant.name,
      caption,
      location: `${restaurant.district} • ${restaurant.type}`,
      likes: 0,
      comments: [],
      reposts: 0
    };
    setCustomFeedPosts((items) => [post, ...items]);
    setFeedPhotoIndexes((current) => ({ ...current, [post.id]: 0 }));
    setFeedComposerOpen(false);
    setTab('Feed');
    createFeedPostInDb(post, currentUser || { id: 'visitor-feed', name: 'Visitante' }).catch(() => {});
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
    setUsers((items) => {
      const exists = items.some((item) => item.id === normalizedUser.id);
      return exists
        ? items.map((item) => (item.id === normalizedUser.id ? { ...item, ...normalizedUser } : item))
        : [normalizedUser, ...items];
    });
    await AsyncStorage.setItem(storageKeys.currentUser, JSON.stringify(normalizedUser));
    saveUserProfileToDb(normalizedUser).catch(() => {});
  }

  async function updateCurrentUserProfile(patch) {
    if (!currentUser && !requireLogin({ type: 'tab', target: 'Perfil' })) return;
    const nextUser = { ...currentUser, ...patch };
    await saveCurrentUser(nextUser);
  }

  async function updateUserSettings(patch) {
    if (!currentUser && !requireLogin({ type: 'settings' })) return;
    await updateCurrentUserProfile({
      settings: {
        ...(currentUser?.settings || {}),
        ...patch
      }
    });
  }

  async function updateNotificationSettings(patch) {
    const current = currentUser?.settings?.notifications || {};
    await updateUserSettings({
      notifications: {
        ...current,
        ...patch
      }
    });
  }

  async function enablePushNotifications() {
    if (!currentUser) {
      requireLogin({ type: 'settings' });
      return;
    }
    if (Platform.OS === 'web') {
      await updateNotificationSettings({ pushEnabled: false, pushStatus: 'web-unavailable' });
      Alert.alert('Notificações', 'Push real precisa rodar no app iOS ou Android. No navegador, suas preferências ficam salvas.');
      return;
    }
    try {
      const currentPermission = await Notifications.getPermissionsAsync();
      const finalPermission = currentPermission.status === 'granted'
        ? currentPermission
        : await Notifications.requestPermissionsAsync();
      if (finalPermission.status !== 'granted') {
        await updateNotificationSettings({ pushEnabled: false, pushStatus: 'denied' });
        Alert.alert('Notificações', 'Permissão negada. Você pode ativar depois nas configurações do aparelho.');
        return;
      }
      const tokenResult = await Notifications.getExpoPushTokenAsync();
      const token = tokenResult?.data || '';
      if (!token) throw new Error('PUSH_TOKEN_EMPTY');
      await registerPushTokenInDb(currentUser, token, { platform: Platform.OS, name: Platform.OS });
      await updateNotificationSettings({ pushEnabled: true, pushStatus: 'granted', pushToken: token, pushUpdatedAt: new Date().toISOString() });
      Alert.alert('Notificações ativadas', 'Seu aparelho já pode receber alertas do Dine.');
    } catch (error) {
      await updateNotificationSettings({ pushEnabled: false, pushStatus: 'token-error' });
      Alert.alert('Notificações', 'Não conseguimos gerar o token push agora. As preferências foram salvas para tentar de novo depois.');
    }
  }

  async function disablePushNotifications() {
    await updateNotificationSettings({ pushEnabled: false, pushStatus: 'disabled' });
  }

  async function updatePrivacySettings(patch) {
    const current = currentUser?.settings?.privacy || {};
    await updateUserSettings({
      privacy: {
        ...current,
        ...patch
      }
    });
  }

  async function submitModerationReport(target, reason = 'Conteudo inadequado') {
    if (!currentUser) {
      requireLogin({ type: 'settings' });
      return;
    }
    const report = {
      id: `${target.type}-${target.id}-${currentUser.id}-${Date.now()}`,
      targetType: target.type,
      targetId: String(target.id),
      targetLabel: target.label || '',
      reason,
      source: target.source || 'app'
    };
    try {
      await reportContentInDb(report, currentUser);
      const nextReports = [report, ...(currentUser?.moderationReports || [])].slice(0, 50);
      await updateCurrentUserProfile({ moderationReports: nextReports });
      Alert.alert('Denuncia enviada', 'Obrigado. A central admin vai revisar esse conteudo.');
    } catch (error) {
      Alert.alert('Denuncia', 'Nao foi possivel enviar agora. Salvamos a acao no seu perfil local.');
      const nextReports = [report, ...(currentUser?.moderationReports || [])].slice(0, 50);
      await updateCurrentUserProfile({ moderationReports: nextReports });
    }
  }

  function reportContent(target) {
    Alert.alert(
      'Denunciar conteudo',
      `Enviar ${target.label || 'este item'} para revisao da moderacao?`,
      [
        { text: 'Cancelar', style: 'cancel' },
        { text: 'Spam', onPress: () => submitModerationReport(target, 'Spam ou publicidade indevida') },
        { text: 'Inadequado', style: 'destructive', onPress: () => submitModerationReport(target, 'Conteudo inadequado ou falso') }
      ]
    );
  }

  async function blockProfile(profile) {
    if (!currentUser) {
      requireLogin({ type: 'settings' });
      return;
    }
    const blockedId = String(profile?.id || profile?.handle || profile?.name || '').trim();
    if (!blockedId) return;
    const label = profile?.handle || profile?.name || blockedId;
    try {
      await blockAccountInDb(currentUser, blockedId, `Bloqueado pelo perfil ${label}`);
    } catch (error) {}
    const nextBlocked = Array.from(new Set([label, blockedId, ...(currentUser?.blockedAccounts || [])].filter(Boolean)));
    await updateCurrentUserProfile({ blockedAccounts: nextBlocked });
    setSelectedFeedProfile(null);
    if (activeScreen?.name === 'feedProfile') goBack();
    Alert.alert('Perfil bloqueado', `${label} nao vai mais aparecer na sua lista local de bloqueados.`);
  }

  async function changeLocalPassword() {
    if (!currentUser) {
      requireLogin({ type: 'settings' });
      return;
    }
    const currentPassword = String(form.currentPassword || '');
    const nextPassword = String(form.nextPassword || '');
    const confirmPassword = String(form.confirmPassword || '');
    const storedUser = users.find((user) => user.id === currentUser.id || normalize(user.email) === normalize(currentUser.email));
    if (!storedUser?.password) {
      Alert.alert('Senha', 'Esta conta ainda nao tem senha local salva. Ao conectar Supabase Auth, use recuperacao por email.');
      return;
    }
    if (storedUser.password !== currentPassword) {
      Alert.alert('Senha atual', 'A senha atual nao confere.');
      return;
    }
    if (nextPassword.length < 6 || nextPassword !== confirmPassword) {
      Alert.alert('Nova senha', 'Use pelo menos 6 caracteres e confirme a mesma senha.');
      return;
    }
    const updatedAt = new Date().toISOString();
    setUsers((items) => items.map((user) => (
      user.id === storedUser.id || normalize(user.email) === normalize(storedUser.email)
        ? { ...user, password: nextPassword, passwordUpdatedAt: updatedAt }
        : user
    )));
    await updateCurrentUserProfile({ security: { ...(currentUser.security || {}), passwordUpdatedAt: updatedAt } });
    setForm((current) => ({ ...current, currentPassword: '', nextPassword: '', confirmPassword: '' }));
    Alert.alert('Senha alterada', 'Sua senha local foi atualizada.');
  }

  async function shareTrackedInvite() {
    if (!currentUser) {
      requireLogin({ type: 'settings' });
      return;
    }
    const localCode = normalize(`${currentUser.name || 'dine'}-${currentUser.id}`).replace(/[^a-z0-9]/g, '').slice(0, 16) || String(currentUser.id);
    let invite = currentUser.invite || { code: localCode, link: `https://dine.app/invite/${localCode}`, uses: 0 };
    try {
      const remoteInvite = await createInviteLinkInDb(currentUser);
      if (remoteInvite) invite = { ...invite, ...remoteInvite };
    } catch (error) {}
    const gamification = mergeGamification(currentUser.gamification);
    const alreadyAwarded = (gamification.awarded.invites || []).includes(String(invite.code));
    const nextGamification = alreadyAwarded ? gamification : {
      ...gamification,
      points: gamification.points + (pointRewards.invite || 0),
      metrics: {
        ...gamification.metrics,
        invites: (gamification.metrics.invites || 0) + 1
      },
      awarded: {
        ...gamification.awarded,
        invites: [String(invite.code), ...(gamification.awarded.invites || [])]
      }
    };
    if (!alreadyAwarded) {
      const achievements = earnedAchievements(nextGamification).map((item) => item.id);
      nextGamification.achievements = [...new Set([...(nextGamification.achievements || []), ...achievements])];
    }
    await saveCurrentUser({ ...currentUser, invite, gamification: nextGamification });
    Share.share({ message: `Vem descobrir restaurantes comigo no Dine: ${invite.link}` }).catch(() => {});
  }

  function openSupportEmail() {
    const subject = encodeURIComponent('Suporte Dine');
    const body = encodeURIComponent(`Olá, time Dine.\n\nConta: ${currentUser?.email || 'sem login'}\n\nPreciso de ajuda com:`);
    Linking.openURL(`mailto:suporte@dine.app?subject=${subject}&body=${body}`).catch(() => {
      Alert.alert('Suporte', 'Envie sua mensagem para suporte@dine.app.');
    });
  }

  function openSupportWhatsApp() {
    const text = encodeURIComponent(`Olá, preciso de ajuda com minha conta no Dine. Email: ${currentUser?.email || 'sem login'}`);
    Linking.openURL(`https://wa.me/5517999999999?text=${text}`).catch(() => {
      Alert.alert('Suporte', 'Não conseguimos abrir o WhatsApp agora.');
    });
  }

  async function withImageUploadFallback(uri, uploadTask) {
    if (!uri) return '';
    try {
      return await uploadTask(uri);
    } catch (error) {
      return uri;
    }
  }

  async function pickProfilePhoto() {
    if (!currentUser && !requireLogin({ type: 'tab', target: 'Perfil' })) return;
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) {
      Alert.alert('Permissão necessária', 'Permita acesso à galeria para escolher sua foto de perfil.');
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.86
    });
    if (result.canceled) return;
    const localPhoto = result.assets?.[0]?.uri;
    const photo = await withImageUploadFallback(localPhoto, (uri) => uploadUserProfilePhoto(currentUser, uri));
    if (photo) updateCurrentUserProfile({ photo });
  }

  function saveProfileInstagram() {
    const preferences = String(profileDraft.preferences || '')
      .split(',')
      .map((item) => item.trim())
      .filter(Boolean)
      .slice(0, 8);
    updateCurrentUserProfile({
      name: profileDraft.name.trim() || currentUser?.name || 'Usuário Dine',
      bio: profileDraft.bio.trim(),
      location: profileDraft.location.trim(),
      instagram: profileInstagramDraft.trim(),
      preferences
    });
  }

  async function requestGalleryPermission(message = 'Permita acesso à galeria para escolher fotos.') {
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) {
      Alert.alert('Permissão necessária', message);
      return false;
    }
    return true;
  }

  async function pickRestaurantImage(field) {
    const granted = await requestGalleryPermission('Permita acesso à galeria para escolher fotos do restaurante.');
    if (!granted) return;
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      aspect: field === 'logo' ? [1, 1] : [4, 3],
      quality: 0.86
    });
    if (result.canceled) return;
    const localUri = result.assets?.[0]?.uri;
    if (!localUri) return;
    const restaurantAssetId = editingRestaurant?.id || form.id || `draft-${currentUser?.id || 'visitor'}`;
    const uri = await withImageUploadFallback(localUri, (assetUri) => uploadRestaurantAsset(currentUser || { id: 'visitor' }, restaurantAssetId, field, assetUri));
    setForm((current) => {
      if (field === 'coverPhoto') return { ...current, coverPhoto: uri, image: uri };
      return { ...current, [field]: uri };
    });
  }

  async function pickRestaurantExtraPhotos() {
    const granted = await requestGalleryPermission('Permita acesso à galeria para escolher fotos do restaurante.');
    if (!granted) return;
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsMultipleSelection: true,
      selectionLimit: 8,
      quality: 0.86
    });
    if (result.canceled) return;
    const restaurantAssetId = editingRestaurant?.id || form.id || `draft-${currentUser?.id || 'visitor'}`;
    const selected = (await Promise.all((result.assets || []).map((asset, index) => (
      withImageUploadFallback(asset.uri, (uri) => uploadRestaurantAsset(currentUser || { id: 'visitor' }, restaurantAssetId, `extra-${index}`, uri))
    )))).filter(Boolean);
    if (!selected.length) return;
    setForm((current) => {
      const existing = parseList(current.photosText);
      const photos = [...existing, ...selected].slice(0, 12);
      return { ...current, photosText: photos.join('\n') };
    });
  }

  function toggleProfilePreference(preference) {
    const currentPreferences = String(profileDraft.preferences || '')
      .split(',')
      .map((item) => item.trim())
      .filter(Boolean);
    const exists = currentPreferences.some((item) => normalize(item) === normalize(preference));
    const nextPreferences = exists
      ? currentPreferences.filter((item) => normalize(item) !== normalize(preference))
      : [...currentPreferences, preference];
    const uniquePreferences = [...new Map(nextPreferences.map((item) => [normalize(item), item])).values()].slice(0, 12);
    setProfileDraft((current) => ({ ...current, preferences: uniquePreferences.join(', ') }));
    updateCurrentUserProfile({ preferences: uniquePreferences });
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
    setAuthMode('login');
    setForm({});
  }

  async function finishOnboarding() {
    setShowOnboarding(false);
    setOnboardingIndex(0);
    await AsyncStorage.setItem(storageKeys.onboardingSeen, 'true');
    setAuthMode('login');
    setForm({});
  }

  function advanceOnboarding() {
    if (onboardingIndex >= onboardingSlides.length - 1) {
      finishOnboarding();
      return;
    }
    setOnboardingIndex((index) => index + 1);
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
      const now = new Date().toISOString();
      const user = { id: String(Date.now()), name: form.name.trim(), email, instagram: '', photo: '', bio: '', location: '', preferences: [], gamification: defaultGamification(), createdAt: now, security: { lastLoginAt: now, platform: Platform.OS } };
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
    const user = normalizeDemoAccount({
      id: found.id,
      name: found.name,
      email: found.email,
      instagram: found.instagram || '',
      photo: found.photo || '',
      bio: found.bio || '',
      location: found.location || '',
      preferences: found.preferences || [],
      createdAt: found.createdAt || '',
      security: { ...(found.security || {}), lastLoginAt: new Date().toISOString(), platform: Platform.OS },
      gamification: mergeGamification(found.gamification)
    });
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
    const assignedOwnerEmail = String(form.ownerEmail || '').trim();
    const assignedOwnerName = String(form.ownerName || '').trim();
    const adminManaged = Boolean(isAdmin && form.adminManaged !== false);
    const ownerId = isAdmin
      ? (String(form.ownerId || '').trim() || ownerIdFromEmail(assignedOwnerEmail) || currentUser?.id || 'admin-managed')
      : (currentUser?.id || form.ownerId || 'local');
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
      ownerId,
      ownerName: isAdmin ? (assignedOwnerName || assignedOwnerEmail || 'Cliente sem contato') : (currentUser?.name || form.ownerName || ''),
      ownerEmail: isAdmin ? assignedOwnerEmail : (currentUser?.email || form.ownerEmail || ''),
      managedByAdmin: adminManaged,
      managedByAdminId: adminManaged ? currentUser?.id : form.managedByAdminId || '',
      managedByAdminEmail: adminManaged ? currentUser?.email : form.managedByAdminEmail || '',
      ownerSupportNotes: form.ownerSupportNotes || '',
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
      menuPhoto: form.menuPhoto || '',
      photos,
      menuItems: parseMenuItems(form.menuText),
      openingHours: parseOpeningHours(form.openingHoursText),
      holidayClosures: parseHolidayClosures(form.holidayClosuresText),
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
    setOwnerRestaurants((items) => {
      if (items.some((restaurant) => restaurant.id === item.id)) return items.map((restaurant) => (restaurant.id === item.id ? item : restaurant));
      if (isAdmin || item.ownerId === currentUser?.id) return [item, ...items];
      return items;
    });
    setPendingRestaurants((items) => {
      const nextItems = items.filter((restaurant) => restaurant.id !== item.id);
      return item.status === 'pending' ? [item, ...nextItems] : nextItems;
    });
    const saveAction = form.id ? updateRestaurantInDb(item.id, item, currentUser, editingRestaurant || item) : createRestaurantInDb(item, currentUser);
    saveAction.catch(() => {
      Alert.alert('Supabase', 'O restaurante ficou salvo no aparelho, mas não sincronizou com o banco agora.');
    });
    setEditingRestaurant(null);
    setForm({});
    setTab('Perfil');
    setActiveScreen(isAdmin ? { name: 'restaurantPanel', params: {} } : null);
    Alert.alert('Restaurante salvo', isAdmin ? `${item.name} já está no painel para gerenciamento.` : `${item.name} foi enviado para aprovação.`);
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

  function startRestaurantRegistration(defaults = {}) {
    setEditingRestaurant(null);
    setForm({
      status: isAdmin ? 'published' : 'pending',
      adminManaged: Boolean(isAdmin),
      managedByAdminEmail: isAdmin ? currentUser?.email : '',
      ...defaults
    });
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
    updateRestaurantStatusInDb(item.id, status, currentUser?.id, currentUser).catch(() => {
      Alert.alert('Supabase', 'Não foi possível atualizar o status agora.');
    });
  }

  function claimRestaurant(item) {
    if (!currentUser && !requireLogin({ type: 'tab', target: 'Perfil' })) return;
    claimRestaurantInDb(item.id, currentUser).then(() => {
      Alert.alert('Reivindicação enviada', 'Um admin poderá aprovar sua solicitação.');
    }).catch(() => Alert.alert('Supabase', 'Não foi possível enviar a reivindicação agora.'));
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
    saveReviewToDb(review).catch(() => Alert.alert('Supabase', 'Comentário salvo localmente, mas não sincronizou agora.'));
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

function buildRestaurantFeedItems(item) {
  const photos = (item.photos || []).filter((photo) => photo?.url);
  const menuItems = (item.menuItems || []).filter((dish) => dish?.name);
  const highlightItems = (item.highlights || []).filter(Boolean);
  const feed = [];

  if (item.menuPhoto) {
    feed.push({
      id: `${item.id}-menu-photo`,
      kind: 'menuPhoto',
      image: item.menuPhoto,
      title: 'Foto do cardápio',
      caption: 'Cardápio fotografado pelo estabelecimento.',
      meta: 'Cardápio'
    });
  }

  photos.forEach((photo, index) => {
    feed.push({
      id: `${item.id}-photo-${index}`,
      kind: 'photo',
      image: photo.url,
      title: photo.isCover ? 'Capa do perfil' : `Foto ${index + 1}`,
      caption: item.description || `${item.name} em destaque.`,
      meta: `${item.name} • ${item.district}`
    });
  });

  menuItems.forEach((dish, index) => {
    feed.push({
      id: `${item.id}-menu-${index}`,
      kind: 'dish',
      image: dish.image || item.image || defaultImage,
      title: dish.name,
      caption: dish.description || `Produto do cardapio - ${dish.priceLabel || (dish.price ? `R$ ${dish.price}` : 'sob consulta')}`,
      meta: dish.category || highlightItems[index % Math.max(1, highlightItems.length)] || item.type
    });
  });

  if (!feed.length) {
    feed.push({
      id: `${item.id}-starter`,
      kind: 'starter',
      image: item.image || defaultImage,
      title: 'Cardápio em breve',
      caption: 'Adicione a foto do cardápio para o cliente decidir sem sair do perfil.',
      meta: 'Cardápio'
    });
  }

  return feed;
}

function buildRestaurantProfileTiles(item, count = 9) {
  const feed = buildRestaurantFeedItems(item);
  const fallbackImage = item.coverPhoto || item.image || defaultImage;
  const safeFeed = feed.length ? feed : [{ image: fallbackImage, title: item.name, caption: item.description, meta: item.district }];
  return Array.from({ length: count }, (_, index) => {
    const source = safeFeed[index % safeFeed.length] || {};
    return {
      ...source,
      id: `${item.id}-tile-${index}`,
      image: source.image || fallbackImage,
      title: source.title || item.name,
      caption: source.caption || item.description || `${item.name} em destaque.`,
      meta: source.meta || item.district,
      likes: Number(source.likes || Math.max(6, Math.round((item.metrics?.views || 0) / 14) + index * 3))
    };
  });
}

function postKey(restaurantId, postId) {
  return `${restaurantId}:${postId}`;
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

        {discoveryRestaurants.length ? (
          <View style={styles.homeDiscoveryHeroCard}>
            <ScrollView
              ref={homeDiscoveryScrollRef}
              horizontal
              pagingEnabled
              nestedScrollEnabled
              decelerationRate="fast"
              showsHorizontalScrollIndicator={false}
              snapToInterval={homeDiscoveryCardWidth}
              snapToAlignment="start"
              scrollEventThrottle={16}
              onScroll={(event) => {
                const nextIndex = Math.round(event.nativeEvent.contentOffset.x / homeDiscoveryCardWidth);
                setHomeDiscoveryIndex((current) => {
                  const safeIndex = nextIndex % discoveryRestaurants.length;
                  return current % discoveryRestaurants.length === safeIndex ? current : safeIndex;
                });
              }}
              onMomentumScrollEnd={(event) => {
                const nextIndex = Math.round(event.nativeEvent.contentOffset.x / homeDiscoveryCardWidth);
                setHomeDiscoveryIndex(nextIndex % discoveryRestaurants.length);
              }}
              style={styles.homeDiscoveryPager}
            >
              {discoveryRestaurants.map((restaurant) => (
                <Pressable
                  key={restaurant.id}
                  accessibilityRole="button"
                  accessibilityLabel={`Conhecer ${restaurant.name}`}
                  onPress={() => setSelectedRestaurant(restaurant)}
                  style={({ pressed }) => [styles.homeDiscoverySlide, { width: homeDiscoveryCardWidth }, pressed && styles.pressed]}
                >
                  <Animated.View
                    style={[
                      styles.homeDiscoveryAnimatedContent,
                      {
                        opacity: homeDiscoveryAnim.interpolate({ inputRange: [0, 1], outputRange: [0.94, 1] }),
                        transform: [{ scale: homeDiscoveryAnim.interpolate({ inputRange: [0, 1], outputRange: [1.008, 1] }) }]
                      }
                    ]}
                  >
                    <Image source={imageSource(restaurant.coverPhoto || restaurant.image || restaurant.logo)} style={styles.homeDiscoveryImage} />
                    <View style={styles.homeDiscoveryScrim} />
                    <View style={styles.homeDiscoveryLogoWrap}>
                      <Image source={imageSource(restaurant.logo || restaurant.image)} style={styles.homeDiscoveryLogo} />
                    </View>
                    <View style={styles.homeDiscoveryCopy}>
                      <Text style={styles.homeDiscoveryName} numberOfLines={1}>{restaurant.name}</Text>
                      <Text style={styles.homeDiscoveryMeta} numberOfLines={1}>{restaurant.type} • {restaurant.district}</Text>
                    </View>
                  </Animated.View>
                </Pressable>
              ))}
            </ScrollView>
            <Animated.View
              pointerEvents="none"
              style={[
                styles.homeDiscoverySheen,
                {
                  opacity: homeDiscoverySheen.interpolate({ inputRange: [0, 0.25, 0.8, 1], outputRange: [0, 0.22, 0.06, 0] }),
                  transform: [
                    { translateX: homeDiscoverySheen.interpolate({ inputRange: [0, 1], outputRange: [-homeDiscoveryCardWidth * 0.55, homeDiscoveryCardWidth * 0.9] }) },
                    { rotate: '16deg' }
                  ]
                }
              ]}
            />
            <View style={styles.homeDiscoveryDots}>
              {discoveryRestaurants.map((restaurant, index) => (
                <View key={restaurant.id} style={[styles.homeDiscoveryDot, index === (homeDiscoveryIndex % discoveryRestaurants.length) && styles.homeDiscoveryDotActive]} />
              ))}
            </View>
          </View>
        ) : null}

        <SectionTitle title="Explorar" />
        <View style={styles.trendingCategoryGrid}>
          {trendingCategoryTiles.map((group) => (
            <Pressable
              key={group.title}
              onPress={() => navigateTo('results', group.more ? { title: 'Em alta agora' } : { title: group.title, trendTerms: group.terms })}
              style={({ pressed }) => [styles.trendingCategoryTile, pressed && styles.pressed]}
            >
              <View style={styles.trendingCategoryIcon}>
                <Ionicons name={group.icon} size={30} color={group.more ? colors.muted : colors.redDark} />
              </View>
              <Text style={styles.trendingCategoryTitle} numberOfLines={2}>{group.title}</Text>
            </Pressable>
          ))}
        </View>

        <SectionTitle title="Vale salvar" />
        <View style={styles.listStack}>
          {topRestaurants.slice(0, homeRestaurantSectionLimit).map((item) => <MiniRestaurant key={item.id} item={item} onPress={setSelectedRestaurant} />)}
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

  function renderFeedPost(post) {
    const state = feedState(post);
    const comments = [...post.comments, ...(state.comments || [])];
    const likes = post.likes + (state.liked ? 1 : 0);
    const reposts = post.reposts + (state.reposted ? 1 : 0);
    const images = (post.images?.length ? post.images : [post.image]).filter(Boolean).slice(0, 4);
    const imageSize = Math.max(280, width);
    const activePhoto = feedPhotoIndexes[post.id] || 0;
    return (
      <View key={post.id} style={styles.feedPostCard}>
        <View style={styles.feedPostHeader}>
          <Pressable onPress={() => openFeedProfile(post)} style={({ pressed }) => [styles.feedAvatarButton, pressed && styles.activePress]}>
            <Image source={imageSource(post.avatar)} style={styles.feedAvatar} />
          </Pressable>
          <Pressable onPress={() => openFeedProfile(post)} style={({ pressed }) => [styles.feedAuthorCopy, pressed && styles.activePress]}>
            <Text style={styles.feedAuthor}>{post.author}</Text>
            <Text style={styles.feedMeta} numberOfLines={1}>{post.handle} • {post.location}</Text>
          </Pressable>
          <Pressable onPress={() => setSelectedRestaurant(post.restaurant)} style={styles.feedRestaurantPill}>
            <Text style={styles.feedRestaurantPillText} numberOfLines={1}>{post.restaurant.name}</Text>
          </Pressable>
          <Pressable
            onPress={() => reportContent({ type: 'feedPost', id: post.id, label: `publicacao de ${post.author}`, source: 'feed' })}
            style={styles.feedMoreButton}
            hitSlop={8}
          >
            <Ionicons name="flag-outline" size={18} color={colors.muted} />
          </Pressable>
        </View>

        <View style={[styles.feedImageWrap, { height: imageSize }]}>
          <ScrollView
            horizontal
            pagingEnabled
            showsHorizontalScrollIndicator={false}
            onMomentumScrollEnd={(event) => {
              const nextIndex = Math.round(event.nativeEvent.contentOffset.x / imageSize);
              setFeedPhotoIndexes((current) => ({ ...current, [post.id]: nextIndex }));
            }}
          >
            {images.map((photo, index) => (
              <Pressable key={`${post.id}-photo-${index}`} onPress={() => openFeedProfile(post)} style={({ pressed }) => [styles.feedPhotoSlide, { width: imageSize }, pressed && styles.pressed]}>
                <Image source={imageSource(photo)} style={styles.feedImage} />
              </Pressable>
            ))}
          </ScrollView>
          {images.length > 1 ? (
            <View style={styles.feedDots}>
              {images.map((_, index) => (
                <View key={`${post.id}-dot-${index}`} style={[styles.feedDot, activePhoto === index && styles.feedDotActive]} />
              ))}
            </View>
          ) : null}
          {images.length > 1 ? <Text style={styles.feedPhotoCount}>{activePhoto + 1}/{images.length}</Text> : null}
        </View>

        <View style={styles.feedPostBody}>
          <Text style={styles.feedPostTitle}>{post.title}</Text>
          <Text style={styles.feedCaption}>{post.caption}</Text>
          <View style={styles.feedActionsRow}>
            <Pressable onPress={() => toggleFeedFlag(post.id, 'liked')} style={styles.feedActionButton}>
              <Ionicons name={state.liked ? 'heart' : 'heart-outline'} size={22} color={state.liked ? colors.redDark : colors.ink} />
              <Text style={styles.feedActionText}>{likes}</Text>
            </Pressable>
            <Pressable onPress={() => toggleFeedFlag(post.id, 'commenting')} style={styles.feedActionButton}>
              <Ionicons name="chatbubble-outline" size={21} color={colors.ink} />
              <Text style={styles.feedActionText}>{comments.length}</Text>
            </Pressable>
            <Pressable onPress={() => shareFeedPost(post)} style={styles.feedActionButton}>
              <Ionicons name="share-social-outline" size={21} color={colors.ink} />
            </Pressable>
            <Pressable onPress={() => toggleFeedFlag(post.id, 'saved')} style={styles.feedActionButton}>
              <Ionicons name={state.saved ? 'bookmark' : 'bookmark-outline'} size={21} color={state.saved ? colors.redDark : colors.ink} />
            </Pressable>
            <Pressable onPress={() => toggleFeedFlag(post.id, 'reposted')} style={styles.feedActionButton}>
              <Ionicons name="repeat-outline" size={21} color={state.reposted ? colors.redDark : colors.ink} />
              <Text style={styles.feedActionText}>{reposts}</Text>
            </Pressable>
          </View>

          <View style={styles.feedComments}>
            {comments.slice(0, 3).map((comment) => (
              <Text key={comment.id} style={styles.feedCommentText} numberOfLines={2}>
                <Text style={styles.feedCommentAuthor}>{comment.author} </Text>{comment.text}
              </Text>
            ))}
          </View>

          {state.commenting ? (
            <View style={styles.feedCommentComposer}>
              <TextInput
                value={feedCommentDrafts[post.id] || ''}
                onChangeText={(value) => setFeedCommentDrafts((current) => ({ ...current, [post.id]: value }))}
                placeholder="Comentar experiência..."
                placeholderTextColor="#8A8179"
                style={styles.feedCommentInput}
              />
              <Pressable onPress={() => addFeedComment(post)} style={styles.feedCommentSend}>
                <Ionicons name="send" size={18} color={colors.card} />
              </Pressable>
            </View>
          ) : null}
        </View>
      </View>
    );
  }

  function renderFeed() {
    return (
      <View>
        <View style={[styles.header, styles.feedHeaderInset]}>
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
        <View style={styles.feedComposerCard}>
          <View style={styles.feedComposerAvatar}>
            {currentUser?.photo ? (
              <Image source={imageSource(currentUser.photo)} style={styles.feedComposerAvatarImage} />
            ) : (
              <Text style={styles.feedComposerInitial}>{currentUser?.name?.slice(0, 1).toUpperCase() || 'D'}</Text>
            )}
          </View>
          <View style={styles.feedComposerCopy}>
            <Text style={styles.feedComposerTitle}>Compartilhe uma experiência</Text>
            <Text style={styles.feedComposerText}>Poste foto, texto curto e marque um restaurante.</Text>
          </View>
          <Pressable onPress={openFeedComposer} style={styles.feedComposerButton}>
            <Ionicons name="add" size={20} color={colors.card} />
          </Pressable>
        </View>
        <View style={styles.feedList}>
          {feedPosts.map(renderFeedPost)}
        </View>
      </View>
    );
  }

  function renderRankings() {
    const collectionFilters = ['Todas', ...collectionCurations.map((item) => item.title)];
    const visibleCollections = collectionCurations
      .map((collection) => ({
        ...collection,
        restaurants: getCollectionRestaurants(publicRestaurants, collection)
      }))
      .filter((collection) => {
        const haystack = normalize(`${collection.title} ${collection.subtitle}`);
        const matchesSearch = !collectionQuery || haystack.includes(normalize(collectionQuery));
        const matchesFilter = selectedCollection === 'Todas' || selectedCollection === collection.title;
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
          {visibleCollections.map((collection) => (
            <Pressable key={collection.title} onPress={() => navigateTo('collectionDetail', { title: collection.title })} style={({ pressed }) => [styles.collectionCard, pressed && styles.pressed]}>
              <Image source={{ uri: collection.image }} style={styles.collectionImage} />
              <View style={styles.collectionOverlay} />
              <Text style={styles.collectionTitle}>{collection.title}</Text>
              <Text style={styles.collectionSubtitle}>{collection.subtitle}</Text>
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
        <View style={styles.segmented}>
          {['Salvos', 'Quero conhecer', 'Já fui'].map((item) => (
            <Pressable key={item} onPress={() => setFavoriteSegment(item)} style={[styles.segment, favoriteSegment === item && styles.segmentActive]}>
              <Text style={[styles.segmentText, favoriteSegment === item && styles.segmentTextActive]}>{item}</Text>
            </Pressable>
          ))}
        </View>
        <View style={styles.favoriteList}>
          {favoriteRestaurants.length ? (
            favoriteRestaurants.map((item) => <MiniRestaurant key={item.id} item={item} onPress={setSelectedRestaurant} />)
          ) : (
            <View style={styles.emptyState}>
              <Text style={styles.emptyTitle}>Nenhum favorito ainda</Text>
              <Text style={styles.emptyText}>Salve restaurantes para construir sua lista pessoal.</Text>
            </View>
          )}
        </View>
        <View style={styles.promoCard}>
          <View style={styles.promoCopy}>
            <Text style={styles.promoTitle}>Date night perfeito</Text>
            <Text style={styles.promoText}>Ambientes especiais para momentos inesquecíveis.</Text>
          </View>
          <Pressable onPress={() => setTab('Feed')} style={styles.promoButton}>
            <Text style={styles.promoButtonText}>Ver lista completa</Text>
          </Pressable>
        </View>
      </View>
    );
  }

  function renderProfileLegacy() {
    const gamification = mergeGamification(currentUser?.gamification);
    const rank = rankForPoints(gamification.points);
    const achievements = earnedAchievements(gamification);
    const dinePlusMember = Boolean(currentUser?.dinePlusMember);
    return (
      <View>
        <View style={styles.profileTop}>
          <Pressable onPress={openNotifications} style={styles.iconButton}>
            <Ionicons name="notifications-outline" size={23} color={colors.ink} />
          </Pressable>
        </View>
        <View style={styles.profileHeader}>
          <Pressable onPress={pickProfilePhoto} style={({ pressed }) => [styles.profileAvatar, pressed && styles.activePress]}>
            {currentUser?.photo ? (
              <Image source={imageSource(currentUser.photo)} style={styles.profileAvatarImage} />
            ) : (
              <Text style={styles.profileAvatarText}>{currentUser ? currentUser.name.slice(0, 1).toUpperCase() : 'V'}</Text>
            )}
            <View style={styles.avatarEdit}><Ionicons name="camera-outline" size={14} color={colors.ink} /></View>
          </Pressable>
          <View style={styles.profileNameWrap}>
            <Text style={styles.profileName}>{currentUser ? currentUser.name : 'Vitor'}</Text>
            <Text style={styles.profileBio}>{rank.current.name} • {rank.current.description}</Text>
          </View>
        </View>
        <View style={styles.profileSocialCard}>
          <View style={styles.profileSocialLabelRow}>
            <Ionicons name="logo-instagram" size={18} color={colors.redDark} />
            <Text style={styles.profileSocialLabel}>Instagram</Text>
          </View>
          <View style={styles.profileSocialInputRow}>
            <TextInput
              value={profileInstagramDraft}
              onChangeText={setProfileInstagramDraft}
              placeholder="@seuinstagram ou link"
              placeholderTextColor="#8A8179"
              autoCapitalize="none"
              style={styles.profileSocialInput}
            />
            <Pressable onPress={saveProfileInstagram} style={styles.profileSocialSave}>
              <Text style={styles.profileSocialSaveText}>Salvar</Text>
            </Pressable>
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
            <Text style={styles.promoText}>{dinePlusMember ? 'Você já faz parte do clube e pode explorar os benefícios.' : 'Mais benefícios, experiências e conteúdos exclusivos.'}</Text>
          </View>
          <Pressable onPress={() => navigateTo('dinePlus')} style={styles.promoButton}>
            <Text style={styles.promoButtonText}>{dinePlusMember ? 'Abrir clube' : 'Saiba mais'}</Text>
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
          <AppButton onPress={() => currentUser ? startRestaurantRegistration() : requireLogin({ type: 'restaurant-register' })}>Cadastrar restaurante</AppButton>
          {isAdmin ? <AppButton kind="secondary" onPress={() => navigateTo('adminApprovals')}>Central admin</AppButton> : null}
        </View>
      </View>
    );
  }

  function renderProfileMock() {
    const gamification = mergeGamification(currentUser?.gamification);
    const rank = rankForPoints(gamification.points);
    const profileName = currentUser?.name || 'Juliana Martins';
    const instagramValue = profileInstagramDraft || currentUser?.instagram || '@ju.martins';
    const instagramHandle = instagramValue.startsWith('@') ? instagramValue : `@${instagramValue.replace(/^https?:\/\/(www\.)?instagram\.com\//, '').replace('/', '')}`;
    const profilePhoto = currentUser?.photo || 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=500&q=88';
    const profileReviews = topRestaurants.slice(0, 4).map((item, index) => ({
      ...item,
      ratingLabel: (4.6 + (index % 4) / 10).toFixed(1).replace('.', ',')
    }));
    const preferenceChips = [
      ['ðŸ•', 'Italiana'],
      ['ðŸ£', 'Japonesa'],
      ['ðŸŒ¶ï¸', 'Tailandesa'],
      ['ðŸŒ±', 'Vegetariana']
    ];
    const profileBadges = [
      ['camera', 'Primeira\nAvaliação', '#3A251C'],
      ['thumbs-up', 'Avaliador\nDedicado', colors.olive],
      ['location', 'Explorador\nLocal', '#793C58'],
      ['restaurant', 'Amante da\nCulinária', '#B26A16'],
      ['heart', 'Favorito da\nComunidade', colors.redDark]
    ];
    return (
      <View style={styles.dineProfilePage}>
        <View style={styles.dineProfileTopBar}>
          <Text style={styles.dineProfileTopTitle}>Perfil</Text>
          <Text style={styles.dineProfileLogo}>Dine</Text>
          <View style={styles.dineProfileTopActions}>
            <Pressable onPress={openNotifications} style={styles.dineProfileTopButton}>
              <Ionicons name="notifications-outline" size={26} color={colors.ink} />
              <View style={styles.dineProfileBellDot} />
            </Pressable>
            <Pressable onPress={() => navigateTo('settings')} style={styles.dineProfileTopButton}>
              <Ionicons name="settings-outline" size={26} color={colors.ink} />
            </Pressable>
          </View>
        </View>

        <View style={styles.dineProfileHero}>
          <Pressable onPress={pickProfilePhoto} style={({ pressed }) => [styles.dineProfileAvatarWrap, pressed && styles.activePress]}>
            <Image source={imageSource(profilePhoto)} style={styles.dineProfileAvatarImage} />
            <View style={styles.dineProfileAvatarRing} />
            <View style={styles.dineProfileStarBadge}>
              <Ionicons name="star" size={19} color="#FFFFFF" />
            </View>
          </Pressable>
          <View style={styles.dineProfileHeroCopy}>
            <Text style={styles.dineProfileName} numberOfLines={1}>{profileName}</Text>
            <TextInput
              value={profileInstagramDraft}
              onChangeText={setProfileInstagramDraft}
              onEndEditing={saveProfileInstagram}
              placeholder="@seuinstagram"
              placeholderTextColor="#B46B52"
              autoCapitalize="none"
              style={styles.dineProfileHandleInput}
            />
            <Text style={styles.dineProfileBio}>Apaixonada por boa comida e por descobrir novos sabores. âœ¨</Text>
            <View style={styles.dineProfileLocationRow}>
              <Ionicons name="location-outline" size={17} color={colors.redDark} />
              <Text style={styles.dineProfileLocation}>São José do Rio Preto, SP</Text>
            </View>
            <Pressable onPress={saveProfileInstagram} style={styles.dineProfileInstagramPill}>
              <Ionicons name="logo-instagram" size={22} color="#D62976" />
              <Text style={styles.dineProfileInstagramText}>{instagramHandle}</Text>
            </Pressable>
          </View>
        </View>

        <View style={styles.dineProfileStatsCard}>
          {[
            ['star-outline', String(gamification.metrics.reviews || 128), 'Avaliações'],
            ['heart', String(favorites.length || 87), 'Favoritos'],
            ['map-outline', String(gamification.metrics.known || 56), 'Lugares\nconhecidos'],
            ['trophy-outline', formatCompactCount(gamification.points || 2450), 'Pontos']
          ].map(([icon, value, label], index) => (
            <View key={label} style={[styles.dineProfileStatItem, index > 0 && styles.dineProfileStatDivider]}>
              <Ionicons name={icon} size={28} color={index === 1 ? colors.redDark : colors.ochre} />
              <Text style={styles.dineProfileStatValue}>{value}</Text>
              <Text style={styles.dineProfileStatLabel}>{label}</Text>
            </View>
          ))}
        </View>

        <View style={styles.dineProfileLevelCard}>
          <View style={styles.dineProfileMedal}>
            <MaterialCommunityIcons name="silverware-fork-knife" size={42} color="#F8D9AA" />
          </View>
          <View style={styles.dineProfileLevelCopy}>
            <Text style={styles.dineProfileLevelSmall}>Nível 12</Text>
            <View style={styles.dineProfileLevelTitleRow}>
              <Text style={styles.dineProfileLevelTitle}>Exploradora</Text>
              <Ionicons name="chevron-forward" size={22} color={colors.card} />
            </View>
            <View style={styles.dineProfileProgressTrack}>
              <View style={[styles.dineProfileProgressFill, { width: `${Math.max(24, Math.round(rank.progress * 100))}%` }]} />
            </View>
            <Text style={styles.dineProfileLevelMeta}>2.450 / 3.500 pts para o próximo nível</Text>
          </View>
        </View>

        <View style={styles.dineProfileSectionHeader}>
          <View style={styles.dineProfileSectionTitleRow}>
            <Ionicons name="heart-outline" size={24} color={colors.redDark} />
            <Text style={styles.dineProfileSectionTitle}>Preferências gastronômicas</Text>
          </View>
          <Ionicons name="chevron-forward" size={22} color={colors.muted} />
        </View>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.dineProfilePreferenceRow}>
          {preferenceChips.map(([emoji, label]) => (
            <View key={label} style={styles.dineProfilePreferenceChip}>
              <Text style={styles.dineProfilePreferenceEmoji}>{emoji}</Text>
              <Text style={styles.dineProfilePreferenceText}>{label}</Text>
            </View>
          ))}
        </ScrollView>

        <View style={styles.dineProfileSectionHeader}>
          <View style={styles.dineProfileSectionTitleRow}>
            <Ionicons name="time-outline" size={22} color={colors.redDark} />
            <Text style={styles.dineProfileSectionTitle}>Avaliações recentes</Text>
          </View>
          <Pressable onPress={() => navigateTo('history')}>
            <Text style={styles.dineProfileSeeAll}>Ver todas</Text>
          </Pressable>
        </View>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.dineProfileReviewRow}>
          {profileReviews.map((item) => (
            <Pressable key={item.id} onPress={() => setSelectedRestaurant(item)} style={styles.dineProfileReviewCard}>
              <Image source={imageSource(item.coverPhoto || item.image || item.logo)} style={styles.dineProfileReviewImage} />
              <View style={styles.dineProfileReviewBody}>
                <Text style={styles.dineProfileReviewName} numberOfLines={1}>{item.name}</Text>
                <Text style={styles.dineProfileReviewMeta} numberOfLines={1}>{item.district}, SP</Text>
                <View style={styles.dineProfileReviewRating}>
                  <Ionicons name="star" size={13} color={colors.ochre} />
                  <Text style={styles.dineProfileReviewRatingText}>{item.ratingLabel}</Text>
                </View>
              </View>
            </Pressable>
          ))}
        </ScrollView>

        <View style={styles.dineProfileSectionHeader}>
          <View style={styles.dineProfileSectionTitleRow}>
            <Ionicons name="trophy-outline" size={22} color={colors.redDark} />
            <Text style={styles.dineProfileSectionTitle}>Conquistas</Text>
          </View>
          <Text style={styles.dineProfileSeeAll}>Ver todas</Text>
        </View>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.dineProfileBadgeRow}>
          {profileBadges.map(([icon, label, bg]) => (
            <View key={label} style={styles.dineProfileBadgeItem}>
              <View style={[styles.dineProfileBadgeMedal, { backgroundColor: bg }]}>
                <Ionicons name={icon} size={26} color="#FFD79B" />
              </View>
              <Text style={styles.dineProfileBadgeLabel}>{label}</Text>
            </View>
          ))}
        </ScrollView>

        <Pressable onPress={saveProfileInstagram} style={({ pressed }) => [styles.dineProfileEditButton, pressed && styles.activePress]}>
          <Ionicons name="pencil-outline" size={22} color={colors.card} />
          <Text style={styles.dineProfileEditButtonText}>Editar perfil</Text>
        </Pressable>
      </View>
    );
  }

  function renderProfile() {
    const gamification = mergeGamification(currentUser?.gamification);
    const rank = rankForPoints(gamification.points);
    const rankIndex = Math.max(1, dineRanks.findIndex((item) => item.name === rank.current.name) + 1);
    const instagramValue = profileInstagramDraft || currentUser?.instagram || '';
    const instagramHandle = instagramValue
      ? instagramValue.startsWith('@') ? instagramValue : `@${instagramValue.replace(/^https?:\/\/(www\.)?instagram\.com\//, '').replace('/', '')}`
      : '';
    const profileInitial = (profileDraft.name || currentUser?.name || 'D').slice(0, 1).toUpperCase();
    const userReviews = Object.values(reviewsByRestaurant)
      .flat()
      .filter((review) => currentUser?.id && review.userId === currentUser.id)
      .sort((a, b) => Number(b.createdAtMs || 0) - Number(a.createdAtMs || 0));
    const profileReviews = userReviews.slice(0, 6).map((review) => {
      const restaurant = restaurants.find((item) => item.id === review.restaurantId);
      return {
        ...review,
        restaurant,
        image: restaurant?.coverPhoto || restaurant?.image || restaurant?.logo || defaultImage,
        district: restaurant?.district || ''
      };
    });
    const preferenceChips = String(profileDraft.preferences || '')
      .split(',')
      .map((item) => item.trim())
      .filter(Boolean)
      .slice(0, 8);
    const earned = earnedAchievements(gamification);
    const visibleBadges = achievementRules.slice(0, 5);
    const reviewTotal = Math.max(userReviews.length, gamification.metrics.reviews || 0);
    const nextMeta = rank.next
      ? `${formatCompactCount(gamification.points)} / ${formatCompactCount(rank.next.minPoints)} pts para o próximo nível`
      : `${formatCompactCount(gamification.points)} pts no nível máximo`;

    return (
      <View style={styles.dineProfilePage}>
        <View style={styles.dineProfileTopBar}>
          <Text style={styles.dineProfileTopTitle}>Perfil</Text>
          <Text style={styles.dineProfileLogo}>Dine</Text>
          <View style={styles.dineProfileTopActions}>
            <Pressable onPress={openNotifications} style={styles.dineProfileTopButton}>
              <Ionicons name="notifications-outline" size={26} color={colors.ink} />
              <View style={styles.dineProfileBellDot} />
            </Pressable>
            <Pressable onPress={() => navigateTo('settings')} style={styles.dineProfileTopButton}>
              <Ionicons name="settings-outline" size={26} color={colors.ink} />
            </Pressable>
          </View>
        </View>

        <View style={styles.dineProfileHero}>
          <Pressable onPress={pickProfilePhoto} style={({ pressed }) => [styles.dineProfileAvatarWrap, pressed && styles.activePress]}>
            {currentUser?.photo ? (
              <Image source={imageSource(currentUser.photo)} style={styles.dineProfileAvatarImage} />
            ) : (
              <View style={styles.dineProfileAvatarEmpty}>
                <Text style={styles.dineProfileAvatarInitial}>{profileInitial}</Text>
              </View>
            )}
            <View style={styles.dineProfileAvatarRing} />
            <View style={styles.dineProfileStarBadge}>
              <Ionicons name="camera-outline" size={19} color="#FFFFFF" />
            </View>
          </Pressable>
          <View style={styles.dineProfileHeroCopy}>
            <TextInput
              value={profileDraft.name}
              onChangeText={(value) => setProfileDraft((current) => ({ ...current, name: value }))}
              onEndEditing={saveProfileInstagram}
              placeholder="Seu nome"
              placeholderTextColor="#8A8179"
              style={styles.dineProfileNameInput}
            />
            <TextInput
              value={profileInstagramDraft}
              onChangeText={setProfileInstagramDraft}
              onEndEditing={saveProfileInstagram}
              placeholder="@seuinstagram"
              placeholderTextColor="#B46B52"
              autoCapitalize="none"
              style={styles.dineProfileHandleInput}
            />
            <TextInput
              value={profileDraft.bio}
              onChangeText={(value) => setProfileDraft((current) => ({ ...current, bio: value }))}
              onEndEditing={saveProfileInstagram}
              placeholder="Escreva sua bio"
              placeholderTextColor="#8A8179"
              multiline
              style={styles.dineProfileBioInput}
            />
            <View style={styles.dineProfileLocationRow}>
              <Ionicons name="location-outline" size={17} color={colors.redDark} />
              <TextInput
                value={profileDraft.location}
                onChangeText={(value) => setProfileDraft((current) => ({ ...current, location: value }))}
                onEndEditing={saveProfileInstagram}
                placeholder="Sua cidade"
                placeholderTextColor="#8A8179"
                style={styles.dineProfileLocationInput}
              />
            </View>
            <Pressable onPress={saveProfileInstagram} style={styles.dineProfileInstagramPill}>
              <Ionicons name="logo-instagram" size={22} color="#D62976" />
              <Text style={styles.dineProfileInstagramText}>{instagramHandle || 'Adicionar Instagram'}</Text>
            </Pressable>
          </View>
        </View>

        <View style={styles.dineProfileStatsCard}>
          {[
            ['star-outline', String(reviewTotal), 'Avaliações'],
            ['heart', String(favorites.length), 'Favoritos'],
            ['map-outline', String(gamification.metrics.known || 0), 'Lugares\nconhecidos'],
            ['trophy-outline', formatCompactCount(gamification.points), 'Pontos']
          ].map(([icon, value, label], index) => (
            <View key={label} style={[styles.dineProfileStatItem, index > 0 && styles.dineProfileStatDivider]}>
              <Ionicons name={icon} size={28} color={index === 1 ? colors.redDark : colors.ochre} />
              <Text style={styles.dineProfileStatValue}>{value}</Text>
              <Text style={styles.dineProfileStatLabel}>{label}</Text>
            </View>
          ))}
        </View>

        <View style={styles.dineProfileLevelCard}>
          <View style={styles.dineProfileMedal}>
            <MaterialCommunityIcons name="silverware-fork-knife" size={42} color="#F8D9AA" />
          </View>
          <View style={styles.dineProfileLevelCopy}>
            <Text style={styles.dineProfileLevelSmall}>Nível {rankIndex}</Text>
            <View style={styles.dineProfileLevelTitleRow}>
              <Text style={styles.dineProfileLevelTitle}>{rank.current.name}</Text>
              <Ionicons name="chevron-forward" size={22} color={colors.card} />
            </View>
            <View style={styles.dineProfileProgressTrack}>
              <View style={[styles.dineProfileProgressFill, { width: `${Math.max(4, Math.round(rank.progress * 100))}%` }]} />
            </View>
            <Text style={styles.dineProfileLevelMeta}>{nextMeta}</Text>
          </View>
        </View>

        <View style={styles.dineProfileSectionHeader}>
          <View style={styles.dineProfileSectionTitleRow}>
            <Ionicons name="heart-outline" size={24} color={colors.redDark} />
            <Text style={styles.dineProfileSectionTitle}>Preferências gastronômicas</Text>
          </View>
        </View>
        <Pressable onPress={() => navigateTo('preferences')} style={({ pressed }) => [styles.dineProfilePreferenceCard, pressed && styles.activePress]}>
          <View style={styles.dineProfilePreferenceCardIcon}>
            <Ionicons name="restaurant-outline" size={22} color={colors.redDark} />
          </View>
          <View style={styles.dineProfilePreferenceCardCopy}>
            <Text style={styles.dineProfilePreferenceCardTitle}>{preferenceChips.length ? `${preferenceChips.length} tipos selecionados` : 'Escolher tipos de comida'}</Text>
            <Text style={styles.dineProfilePreferenceCardText} numberOfLines={2}>
              {preferenceChips.length ? preferenceChips.join(', ') : 'Toque para selecionar suas cozinhas favoritas.'}
            </Text>
          </View>
          <Ionicons name="chevron-forward" size={22} color={colors.muted} />
        </Pressable>

        <View style={styles.dineProfileSectionHeader}>
          <View style={styles.dineProfileSectionTitleRow}>
            <Ionicons name="time-outline" size={22} color={colors.redDark} />
            <Text style={styles.dineProfileSectionTitle}>Avaliações recentes</Text>
          </View>
          <Pressable onPress={() => navigateTo('history')}>
            <Text style={styles.dineProfileSeeAll}>Ver todas</Text>
          </Pressable>
        </View>
        {profileReviews.length ? (
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.dineProfileReviewRow}>
            {profileReviews.map((review) => (
              <Pressable key={review.id} onPress={() => review.restaurant ? setSelectedRestaurant(review.restaurant) : null} style={styles.dineProfileReviewCard}>
                <Image source={imageSource(review.image)} style={styles.dineProfileReviewImage} />
                <View style={styles.dineProfileReviewBody}>
                  <Text style={styles.dineProfileReviewName} numberOfLines={1}>{review.restaurantName}</Text>
                  <Text style={styles.dineProfileReviewMeta} numberOfLines={1}>{review.district || 'Avaliação'}</Text>
                  <View style={styles.dineProfileReviewRating}>
                    <Ionicons name="star" size={13} color={colors.ochre} />
                    <Text style={styles.dineProfileReviewRatingText}>{Number(review.rating || 0).toFixed(1).replace('.', ',')}</Text>
                  </View>
                </View>
              </Pressable>
            ))}
          </ScrollView>
        ) : (
          <View style={styles.dineProfileEmptyCard}>
            <Text style={styles.dineProfileEmptyText}>Suas avaliações aparecerão aqui.</Text>
          </View>
        )}

        <View style={styles.dineProfileSectionHeader}>
          <View style={styles.dineProfileSectionTitleRow}>
            <Ionicons name="trophy-outline" size={22} color={colors.redDark} />
            <Text style={styles.dineProfileSectionTitle}>Conquistas</Text>
          </View>
          <Text style={styles.dineProfileSeeAll}>Ver todas</Text>
        </View>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.dineProfileBadgeRow}>
          {visibleBadges.map((rule) => {
            const achieved = earned.some((item) => item.id === rule.id);
            return (
              <View key={rule.id} style={styles.dineProfileBadgeItem}>
                <View style={[styles.dineProfileBadgeMedal, !achieved && styles.dineProfileBadgeMedalLocked]}>
                  <Ionicons name={achieved ? 'ribbon' : 'lock-closed-outline'} size={26} color="#FFD79B" />
                </View>
                <Text style={styles.dineProfileBadgeLabel}>{rule.name}</Text>
              </View>
            );
          })}
        </ScrollView>

        <Pressable onPress={saveProfileInstagram} style={({ pressed }) => [styles.dineProfileEditButton, pressed && styles.activePress]}>
          <Ionicons name="checkmark-circle-outline" size={22} color={colors.card} />
          <Text style={styles.dineProfileEditButtonText}>Salvar perfil</Text>
        </Pressable>
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
    const collectionTitle = activeScreen?.params?.collectionTitle;
    const collection = collectionTitle ? collectionCurations.find((item) => item.title === collectionTitle) : null;
    const trendTerms = activeScreen?.params?.trendTerms || [];
    const baseResults = collection ? getCollectionRestaurants(publicRestaurants, collection) : sortedSearchResults();
    const results = trendTerms.length
      ? baseResults.filter((restaurant) => {
        const text = normalize(`${restaurant.name} ${restaurant.type} ${restaurant.description} ${(restaurant.tags || []).join(' ')} ${(restaurant.highlights || []).join(' ')}`);
        return trendTerms.some((term) => text.includes(normalize(term)));
      })
      : baseResults;
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
    const collection = collectionCurations.find((item) => item.title === params.title) || collectionCurations[0];
    const items = getCollectionRestaurants(publicRestaurants, collection);
    return (
      <View>
        {renderScreenHeader(collection.title || 'Coleção', collection.subtitle)}
        {collection.image ? <Image source={{ uri: collection.image }} style={styles.collectionHero} /> : null}
        <View style={styles.listStack}>
          {items.length ? items.map((item) => <MiniRestaurant key={item.id} item={item} onPress={setSelectedRestaurant} />) : (
            <View style={styles.emptyState}>
              <Text style={styles.emptyTitle}>Nada encontrado</Text>
              <Text style={styles.emptyText}>Essa coleção ainda não tem restaurantes compatíveis suficientes.</Text>
            </View>
          )}
        </View>
        <AppButton onPress={() => navigateTo('results', { title: collection.title || 'Resultados da coleção', collectionTitle: collection.title })}>Ver todos desta coleção</AppButton>
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
    const notificationSettings = {
      pushEnabled: false,
      pushStatus: 'not-configured',
      likes: true,
      comments: true,
      restaurants: true,
      invites: true,
      offers: false,
      ...(currentUser?.settings?.notifications || {})
    };
    const items = [
      ['heart-outline', 'Curtidas', 'Quando alguem curtir sua publicacao.', 'likes'],
      ['chatbubble-outline', 'Comentarios', 'Respostas e conversas nas suas publicacoes.', 'comments'],
      ['restaurant-outline', 'Restaurantes', 'Novos lugares, cardapios e atualizacoes.', 'restaurants'],
      ['people-outline', 'Convites', 'Amigos entrando pelo seu link.', 'invites'],
      ['gift-outline', 'Ofertas Dine+', 'Beneficios, eventos e experiencias.', 'offers']
    ];
    return (
      <View>
        {renderScreenHeader('Notificacoes', 'Escolha o que pode chamar sua atencao.')}
        <View style={styles.pagePanel}>
          <Text style={styles.panelTitle}>Push no aparelho</Text>
          <Text style={styles.panelText}>
            {notificationSettings.pushEnabled
              ? 'Token ativo para receber alertas de curtidas, comentarios, convites e novidades.'
              : 'Ative para o app pedir permissao do sistema e registrar este aparelho.'}
          </Text>
          <AppButton onPress={notificationSettings.pushEnabled ? disablePushNotifications : enablePushNotifications}>
            {notificationSettings.pushEnabled ? 'Desativar push' : 'Ativar push'}
          </AppButton>
        </View>
        <View style={styles.settingsList}>
          {items.map(([icon, title, subtitle, key]) => (
            <SettingsToggleRow
              key={key}
              icon={icon}
              title={title}
              subtitle={subtitle}
              active={Boolean(notificationSettings[key])}
              onPress={() => updateNotificationSettings({ [key]: !notificationSettings[key] })}
            />
          ))}
        </View>
      </View>
    );
  }

  function renderPreferencesScreen() {
    const selectedPreferences = String(profileDraft.preferences || '')
      .split(',')
      .map((item) => item.trim())
      .filter(Boolean);
    const foodTypes = [
      'Brasileira',
      'Italiana',
      'Japonesa',
      'Chinesa',
      'Tailandesa',
      'Mexicana',
      'Arabe',
      'Indiana',
      'Francesa',
      'Mediterranea',
      'Vegetariana',
      'Vegana',
      'Hamburguer',
      'Pizza',
      'Churrasco',
      'Sushi',
      'Massas',
      'Frutos do mar',
      'Cafes',
      'Doces',
      'Sorvetes',
      'Acai',
      'Padaria',
      'Comida saudavel'
    ];
    return (
      <View>
        {renderScreenHeader('Preferencias', 'Escolha os tipos de comida que mais combinam com voce.')}
        <View style={styles.preferencePickerPanel}>
          <Text style={styles.preferencePickerTitle}>Tipos de comida</Text>
          <Text style={styles.preferencePickerText}>{selectedPreferences.length ? `${selectedPreferences.length} selecionados` : 'Nenhum tipo selecionado ainda'}</Text>
        </View>
        <View style={styles.preferencePickerGrid}>
          {foodTypes.map((item) => {
            const selected = selectedPreferences.some((preference) => normalize(preference) === normalize(item));
            return (
              <Pressable
                key={item}
                onPress={() => toggleProfilePreference(item)}
                style={[styles.preferencePickerChip, selected && styles.preferencePickerChipActive]}
              >
                <Text style={[styles.preferencePickerChipText, selected && styles.preferencePickerChipTextActive]}>{item}</Text>
                {selected ? <Ionicons name="checkmark-circle" size={17} color={colors.card} /> : null}
              </Pressable>
            );
          })}
        </View>
        <Pressable onPress={goBack} style={styles.preferenceDoneButton}>
          <Text style={styles.preferenceDoneButtonText}>Concluir</Text>
        </Pressable>
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

  function renderPrivacyScreen() {
    const privacy = {
      publicProfile: true,
      showReviews: true,
      allowDiscovery: true,
      showInstagram: true,
      ...(currentUser?.settings?.privacy || {})
    };
    const items = [
      ['person-circle-outline', 'Perfil publico', 'Permite que pessoas encontrem seu perfil pelo feed.', 'publicProfile'],
      ['star-outline', 'Mostrar avaliacoes', 'Exibe suas avaliacoes no perfil publico.', 'showReviews'],
      ['search-outline', 'Aparecer em descobertas', 'Seu perfil pode aparecer para pessoas com gostos parecidos.', 'allowDiscovery'],
      ['logo-instagram', 'Mostrar Instagram', 'Exibe seu @ do Instagram no perfil.', 'showInstagram']
    ];
    return (
      <View>
        {renderScreenHeader('Privacidade', 'Controle como seu perfil aparece para outras pessoas.')}
        <View style={styles.settingsList}>
          {items.map(([icon, title, subtitle, key]) => (
            <SettingsToggleRow
              key={key}
              icon={icon}
              title={title}
              subtitle={subtitle}
              active={Boolean(privacy[key])}
              onPress={() => updatePrivacySettings({ [key]: !privacy[key] })}
            />
          ))}
        </View>
      </View>
    );
  }

  function renderSecurityScreen() {
    const passwordUpdatedAt = currentUser?.security?.passwordUpdatedAt
      ? new Date(currentUser.security.passwordUpdatedAt).toLocaleDateString('pt-BR')
      : 'Ainda nao alterada neste aparelho';
    return (
      <View>
        {renderScreenHeader('Seguranca', 'Dados da sessao e protecao da conta.')}
        <View style={styles.pagePanel}>
          <Text style={styles.panelTitle}>Conta</Text>
          <Text style={styles.panelText}>Email: {currentUser?.email || 'sem login'}</Text>
          <Text style={styles.panelText}>Tipo de acesso: {isAdmin ? 'Administrador' : currentUser ? 'Usuario' : 'Visitante'}</Text>
          <Text style={styles.panelText}>Sincronizacao: {supabaseReady ? 'Supabase ativo' : 'Modo local'}</Text>
          <Text style={styles.panelText}>Senha: {passwordUpdatedAt}</Text>
        </View>
        <View style={styles.pagePanel}>
          <Text style={styles.panelTitle}>Alterar senha</Text>
          <Field label="Senha atual" value={form.currentPassword || ''} onChangeText={(value) => setForm((current) => ({ ...current, currentPassword: value }))} secureTextEntry />
          <Field label="Nova senha" value={form.nextPassword || ''} onChangeText={(value) => setForm((current) => ({ ...current, nextPassword: value }))} secureTextEntry />
          <Field label="Confirmar nova senha" value={form.confirmPassword || ''} onChangeText={(value) => setForm((current) => ({ ...current, confirmPassword: value }))} secureTextEntry />
          <AppButton onPress={changeLocalPassword}>Salvar nova senha</AppButton>
        </View>
        <View style={styles.settingsList}>
          <SettingsActionRow icon="phone-portrait-outline" title="Dispositivos conectados" subtitle="Ver sessao ativa e encerrar acesso local" onPress={() => navigateTo('connectedDevices')} />
          <SettingsActionRow icon="log-out-outline" title="Sair da conta" subtitle="Encerrar a sessao neste aparelho" onPress={logout} />
        </View>
      </View>
    );
  }

  function renderConnectedDevicesScreen() {
    const sessionStarted = currentUser?.security?.lastLoginAt || currentUser?.createdAt || '';
    const sessionLabel = sessionStarted ? new Date(sessionStarted).toLocaleString('pt-BR') : 'Sessao local atual';
    return (
      <View>
        {renderScreenHeader('Dispositivos', 'Acompanhe onde sua conta esta ativa.')}
        <View style={styles.pagePanel}>
          <Text style={styles.panelTitle}>Aparelho atual</Text>
          <Text style={styles.panelText}>Plataforma: {Platform.OS}</Text>
          <Text style={styles.panelText}>Conta: {currentUser?.email || 'sem login'}</Text>
          <Text style={styles.panelText}>Inicio: {sessionLabel}</Text>
          <Text style={styles.panelText}>Tipo: {supabaseReady ? 'Sincronizado com Supabase' : 'Sessao local no aparelho'}</Text>
        </View>
        <View style={styles.settingsList}>
          <SettingsActionRow icon="shield-checkmark-outline" title="Atualizar verificacao" subtitle="Registrar nova checagem de seguranca local" onPress={() => updateCurrentUserProfile({ security: { ...(currentUser?.security || {}), lastSessionCheckAt: new Date().toISOString(), platform: Platform.OS } })} />
          <SettingsActionRow icon="log-out-outline" title="Encerrar neste aparelho" subtitle="Remove a sessao local e volta para visitante" onPress={logout} />
        </View>
      </View>
    );
  }

  function renderBlockedAccountsScreen() {
    const blocked = currentUser?.blockedAccounts || [];
    const draft = form.blockedAccountDraft || '';
    const addBlocked = () => {
      const value = draft.trim();
      if (!value) return;
      const nextBlocked = Array.from(new Set([value, ...blocked]));
      updateCurrentUserProfile({ blockedAccounts: nextBlocked });
      if (currentUser) blockAccountInDb(currentUser, value, 'Bloqueado manualmente nas configuracoes').catch(() => {});
      setForm((current) => ({ ...current, blockedAccountDraft: '' }));
    };
    return (
      <View>
        {renderScreenHeader('Contas bloqueadas', 'Controle perfis que voce nao quer ver no feed.')}
        <View style={styles.pagePanel}>
          <Field label="Usuario, email ou @instagram" value={draft} onChangeText={(value) => setForm((current) => ({ ...current, blockedAccountDraft: value }))} autoCapitalize="none" />
          <AppButton onPress={addBlocked}>Bloquear perfil</AppButton>
        </View>
        {blocked.length ? (
          <View style={styles.settingsList}>
            {blocked.map((item) => (
              <SettingsActionRow
                key={item}
                icon="ban-outline"
                title={item}
                subtitle="Toque para desbloquear"
                onPress={() => updateCurrentUserProfile({ blockedAccounts: blocked.filter((blockedItem) => blockedItem !== item) })}
              />
            ))}
          </View>
        ) : (
          <View style={styles.emptyState}>
            <Text style={styles.emptyTitle}>Nenhum bloqueio</Text>
            <Text style={styles.emptyText}>Perfis bloqueados aparecerao aqui.</Text>
          </View>
        )}
      </View>
    );
  }

  function renderLanguageScreen() {
    const selectedLanguage = currentUser?.settings?.language || 'pt-BR';
    const options = [
      ['pt-BR', 'Portugues do Brasil', 'Idioma principal do aplicativo'],
      ['en-US', 'English', 'Preparado para traducao futura'],
      ['es-ES', 'Espanol', 'Preparado para traducao futura']
    ];
    return (
      <View>
        {renderScreenHeader('Idioma', 'Escolha o idioma preferido da sua conta.')}
        <View style={styles.settingsList}>
          {options.map(([value, title, subtitle]) => (
            <SettingsOptionRow
              key={value}
              title={title}
              subtitle={subtitle}
              selected={selectedLanguage === value}
              accent={appAppearance.accent}
              onPress={() => updateUserSettings({ language: value })}
            />
          ))}
        </View>
      </View>
    );
  }

  function renderAppearanceScreen() {
    const selectedTheme = currentUser?.settings?.theme || 'light';
    const selectedAccent = currentUser?.settings?.accent || 'dine';
    const previewAppearance = resolveAppearance(currentUser?.settings, systemColorScheme);
    const themeOptions = [
      ['light', 'Claro Dine', 'Visual atual com fundo quente e limpo'],
      ['system', 'Automatico', 'Seguir tema do aparelho quando disponivel'],
      ['dark', 'Escuro', 'Interface escura para usar a noite']
    ];
    const accentOptions = [
      ['dine', 'Dine', accentPalettes.dine],
      ['olive', 'Oliva', accentPalettes.olive],
      ['ocean', 'Azul', accentPalettes.ocean],
      ['gold', 'Dourado', accentPalettes.gold],
      ['wine', 'Vinho', accentPalettes.wine]
    ];
    return (
      <View>
        {renderScreenHeader('Aparencia', 'Ajuste como o app deve se apresentar.')}
        <View style={[styles.appearancePreview, { backgroundColor: previewAppearance.surface, borderColor: previewAppearance.line }]}>
          <View style={[styles.appearancePreviewTop, { backgroundColor: previewAppearance.bg }]}>
            <View style={[styles.appearancePreviewLogo, { backgroundColor: previewAppearance.accent }]} />
            <View style={styles.appearancePreviewLines}>
              <View style={[styles.appearancePreviewLine, { backgroundColor: previewAppearance.ink, width: '70%' }]} />
              <View style={[styles.appearancePreviewLine, { backgroundColor: previewAppearance.muted, width: '45%' }]} />
            </View>
          </View>
          <View style={[styles.appearancePreviewButton, { backgroundColor: previewAppearance.accent }]}>
            <Text style={styles.appearancePreviewButtonText}>Previa do tema</Text>
          </View>
        </View>
        <Text style={styles.settingsSectionTitle}>Tema</Text>
        <View style={styles.settingsList}>
          {themeOptions.map(([value, title, subtitle]) => (
            <SettingsOptionRow
              key={value}
              title={title}
              subtitle={subtitle}
              selected={selectedTheme === value}
              accent={previewAppearance.accent}
              onPress={() => updateUserSettings({ theme: value })}
            />
          ))}
        </View>
        <Text style={[styles.settingsSectionTitle, styles.appearanceSectionTitle]}>Cor principal</Text>
        <View style={styles.appearanceAccentGrid}>
          {accentOptions.map(([value, label, color]) => {
            const selected = selectedAccent === value;
            return (
              <Pressable
                key={value}
                onPress={() => updateUserSettings({ accent: value })}
                style={[styles.appearanceAccentButton, selected && { borderColor: color }]}
              >
                <View style={[styles.appearanceAccentSwatch, { backgroundColor: color }]}>
                  {selected ? <Ionicons name="checkmark" size={18} color={colors.card} /> : null}
                </View>
                <Text style={styles.appearanceAccentLabel}>{label}</Text>
              </Pressable>
            );
          })}
        </View>
      </View>
    );
  }

  function renderHelpCenterScreen() {
    const topics = [
      ['restaurant-outline', 'Como cadastrar restaurante', 'Abra Configuracoes > Cadastrar restaurante, preencha dados, logos, capa e envie para aprovacao. O admin revisa antes de publicar.'],
      ['images-outline', 'Como publicar no feed', 'Toque em nova publicacao, escolha ate 4 fotos da galeria, escreva um texto curto e marque um restaurante ou digite um lugar fora da plataforma.'],
      ['shield-checkmark-outline', 'Como funciona a aprovacao', 'Restaurantes entram como pendentes. A Central admin pode publicar, rejeitar, pausar ou arquivar mantendo historico local e tentativa de sincronizacao.'],
      ['notifications-outline', 'Como ativar notificacoes', 'Entre em Notificacoes e toque em Ativar push. No celular, o sistema vai pedir permissao e o Dine registra o token do aparelho.'],
      ['people-outline', 'Como funcionam convites', 'A tela Convites gera um link unico por usuario. Esse codigo pode ser rastreado no backend e contar pontos no perfil.']
    ];
    const selectedTopic = topics.find(([, title]) => title === form.helpArticleTitle);
    return (
      <View>
        {renderScreenHeader('Central de ajuda', 'Respostas rapidas para usar o Dine.')}
        {selectedTopic ? (
          <View style={styles.pagePanel}>
            <View style={styles.helpArticleHeader}>
              <View style={styles.settingsRowIcon}>
                <Ionicons name={selectedTopic[0]} size={21} color={colors.redDark} />
              </View>
              <View style={styles.settingsRowCopy}>
                <Text style={styles.panelTitle}>{selectedTopic[1]}</Text>
                <Text style={styles.panelText}>{selectedTopic[2]}</Text>
              </View>
            </View>
            <AppButton kind="secondary" onPress={() => setForm((current) => ({ ...current, helpArticleTitle: '' }))}>Ver outros artigos</AppButton>
          </View>
        ) : null}
        <View style={styles.settingsList}>
          {topics.map(([icon, title, subtitle]) => <SettingsActionRow key={title} icon={icon} title={title} subtitle={subtitle} onPress={() => setForm((current) => ({ ...current, helpArticleTitle: title }))} />)}
        </View>
      </View>
    );
  }

  function renderTermsScreen() {
    const sections = [
      ['Dados da conta', 'Usamos nome, foto, cidade, preferencias e publicacoes para montar seu perfil e melhorar recomendacoes.'],
      ['Conteudo publicado', 'A pessoa que publica deve ter direito de uso das fotos e respeitar restaurantes e outros usuarios.'],
      ['Restaurantes', 'Cadastros de estabelecimentos passam por revisao antes de aparecerem publicamente.'],
      ['Privacidade', 'Voce pode ajustar visibilidade, notificacoes e bloqueios em configuracoes.']
    ];
    return (
      <View>
        {renderScreenHeader('Termos e privacidade', 'Resumo das regras principais da plataforma.')}
        {sections.map(([title, text]) => (
          <View key={title} style={styles.pagePanel}>
            <Text style={styles.panelTitle}>{title}</Text>
            <Text style={styles.panelText}>{text}</Text>
          </View>
        ))}
      </View>
    );
  }

  function renderAboutScreen() {
    return (
      <View>
        {renderScreenHeader('Sobre o Dine', 'Versao 1.0.0')}
        <View style={styles.pagePanel}>
          <Text style={styles.panelTitle}>Dine</Text>
          <Text style={styles.panelText}>Aplicativo social para descobrir restaurantes, compartilhar momentos e aproximar pessoas de lugares bons.</Text>
          <Text style={styles.panelText}>Conta admin: {isAdmin ? 'ativa' : 'nao ativa'}</Text>
          <Text style={styles.panelText}>Restaurantes carregados: {restaurants.length}</Text>
        </View>
        <View style={styles.settingsList}>
          <SettingsActionRow icon="share-social-outline" title="Compartilhar Dine" subtitle="Enviar convite para outra pessoa" onPress={() => Share.share({ message: 'Conheca o Dine e descubra restaurantes perto de voce.' })} />
        </View>
      </View>
    );
  }

  function renderSettingsScreen() {
    const settingsSections = [
      {
        title: copy.account,
        items: [
          ['person-outline', copy.editProfile, copy.editProfileSub, () => setTab('Perfil')],
          ['restaurant-outline', copy.preferences, copy.preferencesSub, () => navigateTo('preferences')],
          ['diamond-outline', 'Dine+', 'Clube, benefícios e experiências exclusivas', () => navigateTo('dinePlus')]
        ]
      },
      {
        title: copy.restaurants,
        items: [
          ['storefront-outline', copy.restaurantPanel, copy.restaurantPanelSub, () => currentUser ? navigateTo('restaurantPanel') : requireLogin({ type: 'restaurant-register' })],
          ['add-circle-outline', copy.registerRestaurant, copy.registerRestaurantSub, () => currentUser ? startRestaurantRegistration() : requireLogin({ type: 'restaurant-register' })],
          ...(isAdmin ? [['shield-outline', copy.admin, copy.adminSub, () => navigateTo('adminApprovals')]] : [])
        ]
      },
      {
        title: copy.privacySecurity,
        items: [
          ['lock-closed-outline', copy.privacy, copy.privacySub, () => navigateTo('privacy')],
          ['location-outline', copy.location, locationStatus === 'granted' ? 'Localização ativa' : 'Permissão e cidade preferida', () => navigateTo('city')],
          ['shield-checkmark-outline', copy.security, copy.securitySub, () => navigateTo('security')],
          ['eye-off-outline', copy.blocked, copy.blockedSub, () => navigateTo('blockedAccounts')]
        ]
      },
      {
        title: copy.experience,
        items: [
          ['notifications-outline', copy.notifications, copy.notificationsSub, () => navigateTo('notifications')],
          ['people-outline', copy.invites, copy.invitesSub, () => navigateTo('invites')],
          ['language-outline', copy.language, currentUser?.settings?.language === 'en-US' ? 'English' : currentUser?.settings?.language === 'es-ES' ? 'Espanol' : 'Português do Brasil', () => navigateTo('language')],
          ['moon-outline', copy.appearance, currentUser?.settings?.theme === 'dark' ? 'Escuro' : currentUser?.settings?.theme === 'system' ? 'Automático' : 'Tema claro do Dine', () => navigateTo('appearance')]
        ]
      },
      {
        title: copy.support,
        items: [
          ['help-circle-outline', copy.help, copy.helpSub, () => navigateTo('helpCenter')],
          ['chatbubble-ellipses-outline', copy.contactSupport, copy.contactSupportSub, openSupportEmail],
          ['logo-whatsapp', copy.whatsapp, 'Abrir conversa direta com o time Dine', openSupportWhatsApp],
          ['document-text-outline', copy.terms, 'Políticas, dados e condições de uso', () => navigateTo('terms')],
          ['information-circle-outline', copy.about, 'Versão 1.0.0', () => navigateTo('about')]
        ]
      }
    ];
    return (
      <View>
        {renderScreenHeader(copy.settingsTitle, copy.settingsSubtitle)}
        <View style={styles.settingsHero}>
          <View style={styles.settingsAvatar}>
            {currentUser?.photo ? <Image source={imageSource(currentUser.photo)} style={styles.settingsAvatarImage} /> : <Text style={styles.settingsAvatarText}>{(currentUser?.name || 'D').slice(0, 1).toUpperCase()}</Text>}
          </View>
          <View style={styles.settingsHeroCopy}>
            <Text style={styles.settingsHeroName}>{currentUser?.name || 'Perfil Dine'}</Text>
            <Text style={styles.settingsHeroMeta}>{currentUser?.email || 'Entre para sincronizar sua conta'}</Text>
          </View>
        </View>
        {settingsSections.map((section) => (
          <View key={section.title} style={styles.settingsSection}>
            <Text style={styles.settingsSectionTitle}>{section.title}</Text>
            <View style={styles.settingsList}>
              {section.items.map(([icon, title, subtitle, action]) => (
                <Pressable
                  key={title}
                  onPress={action || (() => Alert.alert(title, 'Essa configuração estará disponível em breve.'))}
                  style={({ pressed }) => [styles.settingsRow, pressed && styles.activePress]}
                >
                  <View style={styles.settingsRowIcon}>
                    <Ionicons name={icon} size={21} color={appAppearance.accent} />
                  </View>
                  <View style={styles.settingsRowCopy}>
                    <Text style={styles.settingsRowTitle}>{title}</Text>
                    <Text style={styles.settingsRowSubtitle}>{subtitle}</Text>
                  </View>
                  <Ionicons name="chevron-forward" size={19} color={colors.muted} />
                </Pressable>
              ))}
            </View>
          </View>
        ))}
        <View style={styles.settingsDangerZone}>
          {currentUser ? (
            <Pressable onPress={logout} style={styles.settingsLogoutButton}>
              <Ionicons name="log-out-outline" size={20} color={colors.redDark} />
              <Text style={styles.settingsLogoutText}>Sair da conta</Text>
            </Pressable>
          ) : (
            <Pressable onPress={() => { setAuthMode('login'); setForm({}); }} style={styles.settingsLogoutButton}>
              <Ionicons name="log-in-outline" size={20} color={colors.redDark} />
              <Text style={styles.settingsLogoutText}>Entrar na conta</Text>
            </Pressable>
          )}
        </View>
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

  function renderTrackedInvitesScreen() {
    const invite = currentUser?.invite;
    const inviteUses = Number(invite?.uses || currentUser?.gamification?.metrics?.invites || 0);
    return (
      <View>
        {renderScreenHeader('Convites', 'Compartilhe o Dine e acompanhe seu link.')}
        <View style={styles.promoCard}><View style={styles.promoCopy}><Text style={styles.promoTitle}>Convide amigos</Text><Text style={styles.promoText}>Seu convite tem codigo unico, pode ser rastreado no backend e conta pontos no seu perfil.</Text></View></View>
        <View style={styles.pagePanel}>
          <Text style={styles.panelTitle}>Seu link</Text>
          <Text style={styles.inviteCodeText}>{invite?.code || 'Gere seu primeiro convite'}</Text>
          <Text style={styles.panelText}>{invite?.link || 'Ao compartilhar, o Dine cria um link unico para sua conta.'}</Text>
          <View style={styles.inviteStatsRow}>
            <View style={styles.inviteStatCard}>
              <Text style={styles.inviteStatValue}>{inviteUses}</Text>
              <Text style={styles.inviteStatLabel}>entradas</Text>
            </View>
            <View style={styles.inviteStatCard}>
              <Text style={styles.inviteStatValue}>{currentUser?.gamification?.points || 0}</Text>
              <Text style={styles.inviteStatLabel}>pontos</Text>
            </View>
          </View>
        </View>
        <AppButton onPress={shareTrackedInvite}>{invite?.link ? 'Compartilhar novamente' : 'Gerar e compartilhar convite'}</AppButton>
      </View>
    );
  }

  function renderFeedProfileScreen() {
    const profile = selectedFeedProfile;
    if (!profile) {
      return (
        <View>
          {renderScreenHeader('Perfil', 'Nao encontramos esse perfil.')}
          <AppButton onPress={goBack}>Voltar ao feed</AppButton>
        </View>
      );
    }
    const posts = profile.posts || [];
    const following = currentUser?.followingProfiles || [];
    const profileId = String(profile.id || profile.handle || profile.name || '');
    const isFollowing = following.some((item) => String(item.id) === profileId);
    const totalLikes = posts.reduce((sum, post) => sum + Number(post.likes || 0), 0);
    const followers = Math.max(0, Number(profile.followers || totalLikes + 120) + (isFollowing ? 1 : 0));
    const instagram = String(profile.instagram || '').trim();
    const instagramUrl = instagram
      ? instagram.startsWith('http') ? instagram : `https://instagram.com/${instagram.replace('@', '')}`
      : '';
    const gridGap = 2;
    const tileSize = Math.floor((Math.min(width, 720) - 44 - gridGap * 2) / 3);
    return (
      <View style={styles.feedProfilePage}>
        <View style={styles.feedProfileTopBar}>
          <Pressable onPress={goBack} style={styles.feedProfileIconButton}>
            <Ionicons name="chevron-back" size={24} color={colors.ink} />
          </Pressable>
          <Text style={styles.feedProfileHandle} numberOfLines={1}>{profile.handle || '@perfil'}</Text>
          <Pressable onPress={() => reportContent({ type: 'profile', id: profile.id || profile.handle || profile.name, label: profile.handle || profile.name, source: 'feed-profile' })} style={styles.feedProfileIconButton}>
            <Ionicons name="flag-outline" size={21} color={colors.ink} />
          </Pressable>
        </View>
        <View style={styles.feedProfileHeader}>
          <Image source={imageSource(profile.avatar)} style={styles.feedProfileAvatar} />
          <View style={styles.feedProfileStats}>
            {[
              ['Posts', posts.length],
              ['Seguidores', formatCompactCount(followers)],
              ['Seguindo', formatCompactCount(Number(profile.following || 80))]
            ].map(([label, value]) => (
              <View key={label} style={styles.feedProfileStat}>
                <Text style={styles.feedProfileStatValue}>{value}</Text>
                <Text style={styles.feedProfileStatLabel}>{label}</Text>
              </View>
            ))}
          </View>
        </View>
        <View style={styles.feedProfileBioBlock}>
          <Text style={styles.feedProfileName}>{profile.name || 'Perfil'}</Text>
          <Text style={styles.feedProfileBio}>{profile.bio || 'Compartilhando momentos e descobertas gastronomicas.'}</Text>
          {instagram ? <Text style={styles.feedProfileInstagram}>{instagram.startsWith('@') ? instagram : `@${instagram.replace(/^https?:\/\/(www\.)?instagram\.com\//, '').replace('/', '')}`}</Text> : null}
        </View>
        <View style={styles.feedProfileActions}>
          <Pressable onPress={() => toggleFollowProfile(profile)} style={[styles.feedProfileFollowButton, isFollowing && styles.feedProfileFollowingButton]}>
            <Text style={[styles.feedProfileFollowText, isFollowing && styles.feedProfileFollowingText]}>{isFollowing ? 'Seguindo' : 'Seguir'}</Text>
          </Pressable>
          {instagram ? (
            <Pressable onPress={() => Linking.openURL(instagramUrl).catch(() => {})} style={styles.feedProfileInstagramButton}>
              <Ionicons name="logo-instagram" size={17} color={colors.ink} />
              <Text style={styles.feedProfileInstagramButtonText}>Instagram</Text>
            </Pressable>
          ) : null}
          <Pressable onPress={() => blockProfile(profile)} style={styles.feedProfileBlockButton}>
            <Ionicons name="ban-outline" size={17} color={colors.redDark} />
            <Text style={styles.feedProfileBlockText}>Bloquear</Text>
          </Pressable>
        </View>
        <View style={styles.feedProfileTab}>
          <Ionicons name="grid-outline" size={18} color={colors.ink} />
          <Text style={styles.feedProfileTabText}>Publicacoes</Text>
        </View>
        <View style={styles.feedProfileGrid}>
          {posts.map((post) => {
            const photo = (post.images?.length ? post.images[0] : post.image) || defaultImage;
            return (
              <Pressable
                key={post.id}
                onPress={() => post.restaurant ? setSelectedRestaurant(post.restaurant) : null}
                style={[styles.feedProfileTile, { width: tileSize, height: tileSize }]}
              >
                <Image source={imageSource(photo)} style={styles.feedProfileTileImage} />
                {post.images?.length > 1 ? (
                  <View style={styles.feedProfileTileBadge}>
                    <Ionicons name="albums-outline" size={14} color={colors.card} />
                  </View>
                ) : null}
              </Pressable>
            );
          })}
        </View>
      </View>
    );
  }

  function renderDinePlusScreen() {
    const dinePlusMember = Boolean(currentUser?.dinePlusMember);
    const perks = [
      ['diamond-outline', 'Acesso antecipado a reservas e mesas disputadas.'],
      ['pizza-outline', 'Benefícios em restaurantes parceiros e combos exclusivos.'],
      ['mail-open-outline', 'Convites para experiências, lançamentos e eventos privados.'],
      ['bookmark-outline', 'Lista de lugares premium salva em destaque no seu perfil.']
    ];
    return (
      <View>
        <View style={styles.dinePlusHero}>
          <View style={styles.dinePlusHeroTop}>
            <View style={styles.dinePlusBadge}>
              <Ionicons name="star" size={18} color={colors.card} />
              <Text style={styles.dinePlusBadgeText}>Clube</Text>
            </View>
            <Text style={styles.dinePlusHeroLabel}>{dinePlusMember ? 'Membro ativo' : 'Acesso premium'}</Text>
          </View>
          <Text style={styles.dinePlusTitle}>Dine+</Text>
          <Text style={styles.dinePlusText}>O clube do app para quem quer viver experiências melhores, descobrir lugares antes de todo mundo e aproveitar vantagens em parceiros.</Text>
          <View style={styles.dinePlusHeroActions}>
            <Pressable
              onPress={() => {
                if (!currentUser) {
                  setAuthMode('signup');
                  setForm({});
                  return;
                }
                const nextUser = { ...currentUser, dinePlusMember: !dinePlusMember };
                saveCurrentUser(nextUser);
              }}
              style={styles.dinePlusPrimaryButton}
            >
              <Text style={styles.dinePlusPrimaryButtonText}>{dinePlusMember ? 'Gerenciar clube' : 'Entrar no clube'}</Text>
            </Pressable>
            <Pressable onPress={() => navigateTo('results', { title: 'Parceiros Dine+' })} style={styles.dinePlusSecondaryButton}>
              <Text style={styles.dinePlusSecondaryButtonText}>Ver parceiros</Text>
            </Pressable>
          </View>
        </View>

        <View style={styles.dinePlusStatsRow}>
          {[
            ['Parceiros', String(Math.max(12, topRestaurants.length))],
            ['Experiências', '08'],
            ['Convites', dinePlusMember ? 'Ativo' : 'Liberado']
          ].map(([label, value]) => (
            <View key={label} style={styles.dinePlusStat}>
              <Text style={styles.dinePlusStatValue}>{value}</Text>
              <Text style={styles.dinePlusStatLabel}>{label}</Text>
            </View>
          ))}
        </View>

        <SectionTitle title="Benefícios do clube" />
        <View style={styles.dinePlusPerksList}>
          {perks.map(([icon, text]) => (
            <View key={text} style={styles.dinePlusPerkItem}>
              <View style={styles.dinePlusPerkIcon}>
                <Ionicons name={icon} size={20} color={colors.redDark} />
              </View>
              <Text style={styles.infoRowText}>{text}</Text>
            </View>
          ))}
        </View>

        <SectionTitle title="Acesso rápido" />
        <View style={styles.dinePlusCardsRow}>
          {[
            ['star-outline', 'Selecionados', 'Lugares com curadoria especial e perfil premium.'],
            ['gift-outline', 'Vantagens', 'Ofertas e experiências reservadas para membros.'],
            ['calendar-outline', 'Eventos', 'Jantares, degustações e encontros do clube.']
          ].map(([icon, title, subtitle]) => (
            <View key={title} style={styles.dinePlusCard}>
              <Ionicons name={icon} size={22} color={colors.redDark} />
              <Text style={styles.panelTitle}>{title}</Text>
              <Text style={styles.panelText}>{subtitle}</Text>
            </View>
          ))}
        </View>

        <AppButton onPress={() => navigateTo('results', { title: 'Parceiros Dine+' })}>{dinePlusMember ? 'Explorar benefícios' : 'Quero fazer parte'}</AppButton>
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
    const allManagedRestaurants = [
      ...ownerRestaurants,
      ...restaurants,
      ...pendingRestaurants
    ].reduce((list, item) => (item?.id && !list.some((restaurant) => restaurant.id === item.id) ? [...list, item] : list), []);
    const items = isAdmin
      ? allManagedRestaurants
      : (ownerRestaurants.length ? ownerRestaurants : restaurants.filter((item) => item.ownerId === currentUser?.id));
    const ownerStats = [
      ['Restaurantes', items.length],
      ['Publicados', items.filter((item) => item.status === 'published').length],
      ['Pendentes', items.filter((item) => item.status === 'pending').length],
      ['Pausados', items.filter((item) => item.status === 'paused').length]
    ];
    return (
      <View style={styles.restaurantPanelScreen}>
        <View style={styles.restaurantPanelTopBar}>
          <Pressable onPress={goBack} style={styles.restaurantPanelBackButton} hitSlop={10}>
            <Ionicons name="chevron-back" size={24} color={colors.ink} />
          </Pressable>
        </View>
        <PageTitle title="Painel do restaurante" subtitle={isAdmin ? 'Gerencie os perfis de todos os restaurantes e ajude empresas pelo suporte.' : 'Cadastre, acompanhe aprovação e mantenha seus perfis atualizados.'} />
        {isAdmin ? (
          <View style={styles.pagePanel}>
            <Text style={styles.panelTitle}>Gestão assistida</Text>
            <Text style={styles.panelText}>Cadastre restaurantes em nome de uma empresa, edite perfis existentes e mantenha responsáveis registrados para suporte.</Text>
            <View style={styles.ownerButtonsRow}>
              <AppButton onPress={() => startRestaurantRegistration({ status: 'published', adminManaged: true })}>Cadastrar para empresa</AppButton>
              <AppButton kind="secondary" onPress={() => navigateTo('adminApprovals')}>Central admin</AppButton>
            </View>
          </View>
        ) : null}
        <View style={styles.adminSummaryGrid}>
          {ownerStats.map(([label, value]) => (
            <View key={label} style={styles.adminSummaryCard}>
              <Text style={styles.adminSummaryValue}>{value}</Text>
              <Text style={styles.adminSummaryLabel}>{label}</Text>
            </View>
          ))}
        </View>
        {items.length ? items.map((item) => {
          const feedItems = buildRestaurantFeedItems(item);
          const avatarText = String(item.name || 'R').slice(0, 1).toUpperCase();
          const totalClicks = Number(item.metrics?.mapsClicks || 0) + Number(item.metrics?.whatsappClicks || 0) + Number(item.metrics?.reservationClicks || 0);
          return (
            <View key={item.id} style={styles.ownerCard}>
              <Image source={imageSource(item.coverPhoto || item.image)} style={styles.ownerHeroImage} />
              <View style={styles.ownerProfileRow}>
                <View style={styles.ownerAvatarRing}>
                  <View style={styles.ownerAvatarFrame}>
                    <Image source={imageSource(item.logo || item.image)} style={styles.ownerAvatar} />
                    {!item.logo && !item.image ? <Text style={styles.ownerAvatarFallback}>{avatarText}</Text> : null}
                  </View>
                </View>
                <View style={styles.ownerProfileStats}>
                  {[
                    ['Cardápio', feedItems.length],
                    ['Visitas', item.metrics?.views || 0],
                    ['Cliques', totalClicks],
                    ['Salvos', item.metrics?.favorites || 0]
                  ].map(([label, value]) => (
                    <View key={label} style={styles.ownerStat}>
                      <Text style={styles.ownerStatValue}>{value}</Text>
                      <Text style={styles.ownerStatLabel}>{label}</Text>
                    </View>
                  ))}
                </View>
                {renderRestaurantStatusPill(item.status)}
              </View>

              <View style={styles.ownerProfileBody}>
                <Text style={styles.ownerCardTitle}>{item.name}</Text>
                <Text style={styles.ownerCardMeta}>{item.type} • {item.district}</Text>
                {isAdmin ? <Text style={styles.ownerCardMeta}>Responsável: {item.ownerEmail || item.ownerName || 'gerenciado pelo Dine'}{item.managedByAdmin ? ' • suporte admin' : ''}</Text> : null}
                <Text style={styles.ownerCardBio} numberOfLines={3}>{item.description}</Text>
              </View>

              <View style={styles.metricGrid}>
                {[
                  ['Mapa', item.metrics?.mapsClicks || 0],
                  ['WhatsApp', item.metrics?.whatsappClicks || 0],
                  ['Reservas', item.metrics?.reservationClicks || 0],
                  ['Avaliações', item.reviews || 0]
                ].map(([label, value]) => (
                  <View key={label} style={styles.metricBox}>
                    <Text style={styles.metricValue}>{value}</Text>
                    <Text style={styles.metricLabel}>{label}</Text>
                  </View>
                ))}
              </View>

              <View style={styles.ownerButtonsRow}>
                <AppButton kind="secondary" onPress={() => editRestaurant(item)}>Editar perfil</AppButton>
                <AppButton kind="secondary" onPress={() => Share.share({ message: `${item.name} no Dine` })}>Compartilhar</AppButton>
              </View>

              <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.ownerStoryRow}>
                {(item.highlights || []).slice(0, 6).map((highlight, index) => (
                  <View key={highlight} style={styles.ownerStoryItem}>
                    <View style={styles.ownerStoryRing}>
                      <Ionicons name="restaurant-outline" size={16} color={colors.redDark} />
                    </View>
                    <Text style={styles.ownerStoryChipText} numberOfLines={2}>{highlight}</Text>
                  </View>
                ))}
              </ScrollView>

              <View style={styles.ownerTabRow}>
                <View style={[styles.ownerTab, styles.ownerTabActive]}>
                  <Ionicons name="grid-outline" size={17} color={colors.ink} />
                  <Text style={[styles.ownerTabText, styles.ownerTabTextActive]}>Cardápio</Text>
                </View>
              </View>

              <View style={styles.ownerGrid}>
                {feedItems.slice(0, 9).map((feedItem, index) => (
                  <Pressable key={feedItem.id} style={styles.ownerGridTile} onPress={() => openPanelPost(item, feedItem)}>
                    <Image source={{ uri: feedItem.image }} style={styles.ownerGridImage} />
                    <View style={styles.ownerGridOverlay}>
                      <Ionicons name={feedItem.kind === 'menuPhoto' || feedItem.kind === 'dish' ? 'restaurant' : 'image-outline'} size={12} color={colors.ink} />
                    </View>
                  </Pressable>
                ))}
              </View>

              <View style={styles.ownerActions}>
                <AppButton kind="secondary" onPress={() => changeRestaurantStatus(item, item.status === 'paused' ? 'pending' : 'paused')}>{item.status === 'paused' ? 'Enviar para revisão' : 'Pausar'}</AppButton>
                <AppButton kind="secondary" onPress={() => changeRestaurantStatus(item, 'archived')}>Arquivar</AppButton>
              </View>
            </View>
          );
        }) : (
          <View style={styles.emptyState}>
            <Text style={styles.emptyTitle}>Nenhum restaurante cadastrado</Text>
            <Text style={styles.emptyText}>Cadastre um restaurante para acompanhar aprovação, métricas e edição.</Text>
          </View>
        )}
        <AppButton onPress={() => startRestaurantRegistration()}>{isAdmin ? 'Cadastrar restaurante para empresa' : 'Cadastrar novo restaurante'}</AppButton>
      </View>
    );
  }

  function renderAdminApprovalsScreen() {
    const allRestaurants = [
      ...ownerRestaurants,
      ...pendingRestaurants,
      ...restaurants.filter((restaurant) => !pendingRestaurants.some((item) => item.id === restaurant.id))
    ].reduce((list, item) => (item?.id && !list.some((restaurant) => restaurant.id === item.id) ? [...list, item] : list), []);
    const adminStats = [
      ['Restaurantes', allRestaurants.length],
      ['Pendentes', pendingRestaurants.length],
      ['Usuários', users.length],
      ['Favoritos', favorites.length]
    ];
    return (
      <View>
        {renderScreenHeader('Central admin', 'Controle e visão geral do aplicativo.')}
        <View style={styles.adminSummaryGrid}>
          {adminStats.map(([label, value]) => (
            <View key={label} style={styles.adminSummaryCard}>
              <Text style={styles.adminSummaryValue}>{value}</Text>
              <Text style={styles.adminSummaryLabel}>{label}</Text>
            </View>
          ))}
        </View>
        <SectionTitle title="Fila de aprovação" />
        <View style={styles.ownerButtonsRow}>
          <AppButton onPress={() => startRestaurantRegistration({ status: 'published', adminManaged: true })}>Cadastrar para empresa</AppButton>
          <AppButton kind="secondary" onPress={() => navigateTo('restaurantPanel')}>Gerenciar perfis</AppButton>
        </View>
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
        <SectionTitle title="Restaurantes do app" />
        {allRestaurants.map((item) => {
          const openStatus = getRestaurantOpenStatus(item);
          const totalClicks = Number(item.metrics?.mapsClicks || 0) + Number(item.metrics?.whatsappClicks || 0) + Number(item.metrics?.reservationClicks || 0);
          return (
            <View key={`admin-${item.id}`} style={styles.adminListItem}>
              <View style={styles.adminListTop}>
                <View style={styles.adminListIcon}>
                  <Ionicons name={openStatus.open ? 'checkmark-circle' : 'time-outline'} size={22} color={openStatus.open ? colors.olive : colors.redDark} />
                </View>
                <View style={styles.adminListCopy}>
                  <Text style={styles.adminListTitle}>{item.name}</Text>
                  <Text style={styles.adminListMeta}>{item.ownerEmail || 'Sem dono'} • {openStatus.label}{openStatus.detail ? ` • ${openStatus.detail}` : ''}</Text>
                </View>
                {renderRestaurantStatusPill(item.status)}
              </View>
              <View style={styles.adminMiniMetrics}>
                {[
                  ['Visitas', item.metrics?.views || 0],
                  ['Cliques', totalClicks],
                  ['Salvos', item.metrics?.favorites || 0],
                  ['Avaliações', item.reviews || 0]
                ].map(([label, value]) => (
                  <View key={label} style={styles.adminMiniMetric}>
                    <Text style={styles.adminMiniMetricValue}>{value}</Text>
                    <Text style={styles.adminMiniMetricLabel}>{label}</Text>
                  </View>
                ))}
              </View>
              <View style={styles.ownerActions}>
                <AppButton kind="secondary" onPress={() => editRestaurant(item)}>Editar</AppButton>
                <AppButton kind="secondary" onPress={() => changeRestaurantStatus(item, item.status === 'published' ? 'paused' : 'published')}>{item.status === 'published' ? 'Pausar' : 'Publicar'}</AppButton>
                <AppButton kind="secondary" onPress={() => changeRestaurantStatus(item, 'archived')}>Arquivar</AppButton>
              </View>
            </View>
          );
        })}
      </View>
    );
  }

  function renderRestaurantRegisterScreen() {
    return (
      <View>
        {renderScreenHeader(editingRestaurant ? 'Editar restaurante' : 'Cadastrar restaurante', 'Conte sua proposta em etapas rápidas.')}
        <View style={styles.registerHero}>
          <Ionicons name="restaurant-outline" size={28} color={colors.redDark} />
          <View style={styles.registerHeroCopy}>
            <Text style={styles.panelTitle}>Perfil do estabelecimento</Text>
            <Text style={styles.panelText}>Preencha o essencial primeiro; depois inclua fotos, cardápio e horários para deixar a página viva.</Text>
          </View>
        </View>
        {isAdmin ? (
          <View style={styles.registerSection}>
            <View style={styles.registerSectionHeader}>
              <Ionicons name="briefcase-outline" size={20} color={colors.redDark} />
              <Text style={styles.registerSectionTitle}>Responsável da empresa</Text>
            </View>
            <Field label="Nome do responsável" value={form.ownerName || ''} onChangeText={(value) => setForm({ ...form, ownerName: value })} placeholder="Nome do cliente ou empresa" />
            <Field label="E-mail do responsável" value={form.ownerEmail || ''} onChangeText={(value) => setForm({ ...form, ownerEmail: value, ownerId: ownerIdFromEmail(value) })} placeholder="cliente@empresa.com" keyboardType="email-address" autoCapitalize="none" />
            <Field label="ID interno do responsável" value={form.ownerId || ''} onChangeText={(value) => setForm({ ...form, ownerId: value })} placeholder="Gerado pelo e-mail, se vazio" autoCapitalize="none" />
            <Field label="Status do perfil" value={form.status || 'published'} onChangeText={(value) => setForm({ ...form, status: value })} placeholder="published, pending, paused, archived" autoCapitalize="none" />
            <Field label="Notas de suporte" value={form.ownerSupportNotes || ''} onChangeText={(value) => setForm({ ...form, ownerSupportNotes: value })} placeholder="Ex.: cadastrar por WhatsApp, cliente pediu ajuda com fotos" multiline />
            <Pressable
              onPress={() => setForm((current) => ({ ...current, adminManaged: current.adminManaged === false }))}
              style={({ pressed }) => [styles.settingsRow, pressed && styles.activePress]}
            >
              <View style={[styles.optionRadio, form.adminManaged !== false && styles.optionRadioActive]}>
                {form.adminManaged !== false ? <Ionicons name="checkmark" size={15} color={colors.card} /> : null}
              </View>
              <View style={styles.settingsRowCopy}>
                <Text style={styles.settingsRowTitle}>Gerenciado pelo Dine</Text>
                <Text style={styles.settingsRowSubtitle}>Mantém o admin com permissão operacional para editar e dar suporte.</Text>
              </View>
            </Pressable>
          </View>
        ) : null}
        <View style={styles.registerSection}>
          <View style={styles.registerSectionHeader}>
            <Ionicons name="storefront-outline" size={20} color={colors.redDark} />
            <Text style={styles.registerSectionTitle}>Identidade</Text>
          </View>
          <Field label="Nome" value={form.name} onChangeText={(value) => setForm({ ...form, name: value })} />
          <Field label="Tipo de comida" value={form.type} onChangeText={(value) => setForm({ ...form, type: value })} />
          <Field label="Bairro" value={form.district} onChangeText={(value) => setForm({ ...form, district: value })} />
          <Field label="Faixa de preço" value={form.price} onChangeText={(value) => setForm({ ...form, price: value })} placeholder="$$" />
          <Field label="Descrição" value={form.description} onChangeText={(value) => setForm({ ...form, description: value })} multiline />
        </View>
        <View style={styles.registerSection}>
          <View style={styles.registerSectionHeader}>
            <Ionicons name="location-outline" size={20} color={colors.redDark} />
            <Text style={styles.registerSectionTitle}>Local e contato</Text>
          </View>
          <Field label="Endereço" value={form.address} onChangeText={(value) => setForm({ ...form, address: value })} />
          <Field label="Latitude" value={form.latitude} onChangeText={(value) => setForm({ ...form, latitude: value })} placeholder="-20.8126" keyboardType="numeric" />
          <Field label="Longitude" value={form.longitude} onChangeText={(value) => setForm({ ...form, longitude: value })} placeholder="-49.3768" keyboardType="numeric" />
          <Field label="Telefone" value={form.phone} onChangeText={(value) => setForm({ ...form, phone: value })} keyboardType="phone-pad" />
          <Field label="WhatsApp" value={form.whatsapp} onChangeText={(value) => setForm({ ...form, whatsapp: value })} keyboardType="phone-pad" />
          <Field label="Instagram" value={form.instagram} onChangeText={(value) => setForm({ ...form, instagram: value })} placeholder="https://instagram.com/..." />
          <Field label="Link de reserva" value={form.reservationUrl} onChangeText={(value) => setForm({ ...form, reservationUrl: value })} placeholder="https://..." />
        </View>
        <View style={styles.registerSection}>
          <View style={styles.registerSectionHeader}>
            <Ionicons name="images-outline" size={20} color={colors.redDark} />
            <Text style={styles.registerSectionTitle}>Fotos e cardápio</Text>
          </View>
          <View style={styles.registerPhotoGrid}>
            <Pressable onPress={() => pickRestaurantImage('coverPhoto')} style={({ pressed }) => [styles.registerPhotoCard, pressed && styles.activePress]}>
              {(form.coverPhoto || form.image) ? <Image source={imageSource(form.coverPhoto || form.image)} style={styles.registerPhotoPreview} /> : <Ionicons name="image-outline" size={28} color={colors.redDark} />}
              <Text style={styles.registerPhotoTitle}>Foto de capa</Text>
              <Text style={styles.registerPhotoText}>{(form.coverPhoto || form.image) ? 'Trocar foto' : 'Escolher da galeria'}</Text>
            </Pressable>
            <Pressable onPress={() => pickRestaurantImage('logo')} style={({ pressed }) => [styles.registerPhotoCard, pressed && styles.activePress]}>
              {form.logo ? <Image source={imageSource(form.logo)} style={styles.registerPhotoPreview} /> : <Ionicons name="storefront-outline" size={28} color={colors.redDark} />}
              <Text style={styles.registerPhotoTitle}>Logo</Text>
              <Text style={styles.registerPhotoText}>{form.logo ? 'Trocar logo' : 'Escolher da galeria'}</Text>
            </Pressable>
            <Pressable onPress={() => pickRestaurantImage('menuPhoto')} style={({ pressed }) => [styles.registerPhotoCard, pressed && styles.activePress]}>
              {form.menuPhoto ? <Image source={imageSource(form.menuPhoto)} style={styles.registerPhotoPreview} /> : <Ionicons name="reader-outline" size={28} color={colors.redDark} />}
              <Text style={styles.registerPhotoTitle}>Foto do cardápio</Text>
              <Text style={styles.registerPhotoText}>{form.menuPhoto ? 'Trocar foto' : 'Escolher da galeria'}</Text>
            </Pressable>
            <Pressable onPress={pickRestaurantExtraPhotos} style={({ pressed }) => [styles.registerPhotoCard, pressed && styles.activePress]}>
              <Ionicons name="images-outline" size={28} color={colors.redDark} />
              <Text style={styles.registerPhotoTitle}>Fotos extras</Text>
              <Text style={styles.registerPhotoText}>{parseList(form.photosText).length} selecionadas</Text>
            </Pressable>
          </View>
          {parseList(form.photosText).length ? (
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.registerExtraPhotoRow}>
              {parseList(form.photosText).map((photo, index) => (
                <View key={`${photo}-${index}`} style={styles.registerExtraPhotoWrap}>
                  <Image source={imageSource(photo)} style={styles.registerExtraPhoto} />
                  <Pressable
                    onPress={() => setForm((current) => ({ ...current, photosText: parseList(current.photosText).filter((_, photoIndex) => photoIndex !== index).join('\n') }))}
                    style={styles.registerExtraPhotoRemove}
                  >
                    <Ionicons name="close" size={14} color={colors.card} />
                  </Pressable>
                </View>
              ))}
            </ScrollView>
          ) : null}
          <Field label="Itens do cardápio" value={form.menuText} onChangeText={(value) => setForm({ ...form, menuText: value })} placeholder="Prato | 49.90" multiline />
        </View>
        <View style={styles.registerSection}>
          <View style={styles.registerSectionHeader}>
            <Ionicons name="time-outline" size={20} color={colors.redDark} />
            <Text style={styles.registerSectionTitle}>Funcionamento</Text>
          </View>
          <Field label="Horários" value={form.openingHoursText} onChangeText={(value) => setForm({ ...form, openingHoursText: value })} placeholder="segunda: 18:00-23:00" multiline />
          <Field label="Feriados fechados" value={form.holidayClosuresText} onChangeText={(value) => setForm({ ...form, holidayClosuresText: value })} placeholder="2026-12-25 | Natal" multiline />
          <Field label="Tags" value={form.tagsText} onChangeText={(value) => setForm({ ...form, tagsText: value })} placeholder="romântico, pet friendly" />
          <Field label="Destaques" value={form.highlightsText} onChangeText={(value) => setForm({ ...form, highlightsText: value })} placeholder="Carta de vinhos, varanda" />
        </View>
        <View style={styles.registerSubmit}>
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
      privacy: renderPrivacyScreen,
      security: renderSecurityScreen,
      connectedDevices: renderConnectedDevicesScreen,
      blockedAccounts: renderBlockedAccountsScreen,
      language: renderLanguageScreen,
      appearance: renderAppearanceScreen,
      helpCenter: renderHelpCenterScreen,
      terms: renderTermsScreen,
      about: renderAboutScreen,
      settings: renderSettingsScreen,
      invites: renderTrackedInvitesScreen,
      feedProfile: renderFeedProfileScreen,
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
    Feed: renderFeed,
    Favoritos: renderFavorites,
    Mapa: renderSearch,
    Perfil: renderProfile
  }[tab]();
  const content = activeScreen ? renderAuxiliaryScreen() : mainContent;

  if (!fontsLoaded) return <SafeAreaView style={[styles.safe, { backgroundColor: appAppearance.bg }]} />;

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: appAppearance.bg }]}>
      <ExpoStatusBar style={appAppearance.statusBar} />
      <StatusBar barStyle={appAppearance.statusBar === 'light' ? 'light-content' : 'dark-content'} backgroundColor={appAppearance.bg} />
      <ScrollView
        style={[styles.screen, { backgroundColor: appAppearance.bg }]}
        contentContainerStyle={[
          styles.screenContent,
          { backgroundColor: appAppearance.bg },
          !activeScreen && tab === 'Feed' && styles.screenContentFeed,
          activeScreen?.name === 'restaurantPanel' ? styles.screenContentPanel : activeScreen && styles.screenContentSubscreen,
          compact && activeScreen?.name !== 'restaurantPanel' && styles.screenContentCompact
        ]}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <Animated.View style={{ opacity: screenFade, transform: [{ translateY: screenFade.interpolate({ inputRange: [0, 1], outputRange: [10, 0] }) }] }}>
          {content}
        </Animated.View>
      </ScrollView>
      {!activeScreen ? <View style={[styles.bottomNav, { backgroundColor: appAppearance.nav, borderColor: appAppearance.line }]}>
        {tabs.map(([label, icon]) => (
          <Pressable key={label} accessibilityRole="tab" accessibilityState={{ selected: tab === label }} accessibilityLabel={`Ir para ${label}`} onPress={() => handleTab(label)} style={({ pressed }) => [styles.navButton, tab === label && styles.navButtonActive, pressed && styles.activePress]}>
            <Ionicons name={icon} size={22} color={tab === label ? appAppearance.accent : appAppearance.muted} />
            <Text style={[styles.navText, { color: appAppearance.muted }, tab === label && { color: appAppearance.accent }]}>{label}</Text>
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
        onReportContent={reportContent}
      />
      <PostViewerModal
        visible={Boolean(selectedPanelPost)}
        restaurant={selectedPanelPost?.restaurant}
        post={selectedPanelPost?.post}
        liked={Boolean(panelPostLikes[selectedPanelPost ? postKey(selectedPanelPost.restaurant.id, selectedPanelPost.post.id) : '']?.liked)}
        likesCount={selectedPanelPost ? (panelPostLikes[postKey(selectedPanelPost.restaurant.id, selectedPanelPost.post.id)]?.count ?? Number(selectedPanelPost.post.likes || 0)) : 0}
        onClose={() => setSelectedPanelPost(null)}
        onLike={() => selectedPanelPost ? togglePanelPostLike(selectedPanelPost.restaurant, selectedPanelPost.post) : null}
        onReport={() => selectedPanelPost ? reportContent({ type: 'restaurantPost', id: selectedPanelPost.post.id, label: `post de ${selectedPanelPost.restaurant.name}`, source: 'restaurant-post' }) : null}
      />
      <FeedProfileModal
        visible={false}
        profile={selectedFeedProfile}
        onClose={() => setSelectedFeedProfile(null)}
        onOpenRestaurant={(restaurant) => {
          setSelectedFeedProfile(null);
          setSelectedRestaurant(restaurant);
        }}
        onReportProfile={(profile) => reportContent({ type: 'profile', id: profile.id || profile.handle || profile.name, label: profile.handle || profile.name, source: 'feed-profile' })}
        onBlockProfile={blockProfile}
      />
      <FeedComposerModal
        visible={feedComposerOpen}
        draft={feedDraft}
        setDraft={setFeedDraft}
        restaurants={publicRestaurants}
        onClose={() => setFeedComposerOpen(false)}
        onPublish={publishFeedPost}
        onPickPhotos={pickFeedPhotos}
        onRemovePhoto={removeFeedPhoto}
      />
      <AuthModal
        mode={authMode}
        form={form}
        setForm={setForm}
        setMode={setAuthMode}
        onSubmitAuth={submitAuth}
        required={!currentUser}
      />
      <OnboardingModal
        visible={showOnboarding && !currentUser}
        slides={onboardingSlides}
        index={onboardingIndex}
        onNext={advanceOnboarding}
        onSkip={finishOnboarding}
      />
      <StartupSplash
        visible={showStartupSplash}
        opacity={startupSplashOpacity}
        logoScale={startupLogoScale}
        logoLift={startupLogoLift}
        pulse={startupPulse}
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

function StartupSplash({ visible, opacity, logoScale, logoLift, pulse }) {
  if (!visible) return null;
  return (
    <Animated.View pointerEvents="auto" style={[styles.startupSplash, { opacity }]}>
      <Animated.View
        style={[
          styles.startupPulse,
          {
            opacity: pulse.interpolate({ inputRange: [0, 0.35, 1], outputRange: [0.34, 0.18, 0] }),
            transform: [{ scale: pulse.interpolate({ inputRange: [0, 1], outputRange: [0.7, 1.55] }) }]
          }
        ]}
      />
      <Animated.View
        style={[
          styles.startupLogoCard,
          {
            transform: [
              { translateY: logoLift },
              { scale: logoScale }
            ]
          }
        ]}
      >
        <Image source={dineLogo} style={styles.startupLogoImage} resizeMode="contain" />
      </Animated.View>
      <Animated.Text
        style={[
          styles.startupText,
          {
            opacity: logoScale.interpolate({ inputRange: [0.82, 1], outputRange: [0, 1] }),
            transform: [{ translateY: logoLift.interpolate({ inputRange: [0, 18], outputRange: [0, 8] }) }]
          }
        ]}
      >
        descubra bons lugares
      </Animated.Text>
    </Animated.View>
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

function FeedComposerModal({ visible, draft, setDraft, restaurants, onClose, onPublish, onPickPhotos, onRemovePhoto }) {
  const selectedRestaurant = restaurants.find((item) => item.id === draft.restaurantId);
  const restaurantQuery = String(draft.restaurantName || selectedRestaurant?.name || '');
  const restaurantSearchText = restaurantQuery.trim();
  const normalizedQuery = normalize(restaurantSearchText);
  const restaurantResults = normalizedQuery
    ? restaurants
      .filter((restaurant) => normalize([restaurant.name, restaurant.type, restaurant.district].filter(Boolean).join(' ')).includes(normalizedQuery))
      .slice(0, 7)
    : [];
  const exactRestaurant = restaurants.find((restaurant) => normalize(restaurant.name) === normalizedQuery);
  const canPublishOutsidePlatform = Boolean(restaurantSearchText && !exactRestaurant);
  const previews = (draft.photos || []).map((photo) => String(photo || '').trim()).filter(Boolean).slice(0, 4);
  if (!visible) return null;
  return (
    <Modal visible transparent animationType="slide" onRequestClose={onClose}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={styles.modalBackdrop}>
        <ScrollView contentContainerStyle={styles.feedComposerSheet} keyboardShouldPersistTaps="handled">
          <View style={styles.feedComposerTopBar}>
            <Pressable onPress={onClose} style={styles.feedComposerClose}>
              <Ionicons name="close" size={22} color={colors.ink} />
            </Pressable>
            <View style={styles.feedComposerTitleWrap}>
              <Text style={styles.feedComposerSheetTitle}>Nova publicação</Text>
              <Text style={styles.feedComposerSheetMeta}>Até 4 fotos por publicação</Text>
            </View>
            <Pressable onPress={onPublish} style={styles.feedPublishButton}>
              <Text style={styles.feedPublishButtonText}>Publicar</Text>
            </Pressable>
          </View>

          <Text style={styles.fieldLabel}>Restaurante</Text>
          <View style={styles.feedSearchBox}>
            <Ionicons name="search" size={18} color={colors.muted} />
            <TextInput
              value={restaurantQuery}
              onChangeText={(value) => setDraft((current) => ({ ...current, restaurantName: value, restaurantId: '' }))}
              placeholder="Digite o nome do restaurante"
              placeholderTextColor="#8A8179"
              autoCapitalize="words"
              style={styles.feedSearchInput}
            />
            {restaurantQuery ? (
              <Pressable onPress={() => setDraft((current) => ({ ...current, restaurantName: '', restaurantId: '' }))} style={styles.feedSearchClear}>
                <Ionicons name="close" size={16} color={colors.muted} />
              </Pressable>
            ) : null}
          </View>
          <View style={styles.feedRestaurantResults}>
            {restaurantResults.map((restaurant) => {
              const selected = selectedRestaurant?.id === restaurant.id;
              return (
                <Pressable
                  key={restaurant.id}
                  onPress={() => setDraft((current) => ({ ...current, restaurantId: restaurant.id, restaurantName: restaurant.name }))}
                  style={[styles.feedRestaurantResult, selected && styles.feedRestaurantResultActive]}
                >
                  <Image source={imageSource(restaurant.logo || restaurant.image)} style={styles.feedRestaurantResultImage} />
                  <View style={styles.feedRestaurantResultCopy}>
                    <Text style={[styles.feedRestaurantResultName, selected && styles.feedRestaurantResultNameActive]} numberOfLines={1}>{restaurant.name}</Text>
                    <Text style={styles.feedRestaurantResultMeta} numberOfLines={1}>{restaurant.district} • {restaurant.type}</Text>
                  </View>
                  {selected ? <Ionicons name="checkmark-circle" size={20} color={colors.redDark} /> : null}
                </Pressable>
              );
            })}
            {canPublishOutsidePlatform ? (
              <Pressable onPress={() => setDraft((current) => ({ ...current, restaurantId: '', restaurantName: restaurantSearchText }))} style={styles.feedRestaurantCustomResult}>
                <View style={styles.feedRestaurantCustomIcon}>
                  <Ionicons name="add" size={18} color={colors.redDark} />
                </View>
                <View style={styles.feedRestaurantResultCopy}>
                  <Text style={styles.feedRestaurantResultName} numberOfLines={1}>Publicar em “{restaurantSearchText}”</Text>
                  <Text style={styles.feedRestaurantResultMeta}>Restaurante ainda não cadastrado no Dine</Text>
                </View>
              </Pressable>
            ) : null}
          </View>

          <Text style={styles.fieldLabel}>Texto curto</Text>
          <TextInput
            value={draft.caption}
            onChangeText={(value) => setDraft((current) => ({ ...current, caption: value }))}
            placeholder="Conte sobre o prato, lugar ou experiência..."
            placeholderTextColor="#8A8179"
            multiline
            style={styles.feedComposerTextInput}
          />

          <View style={styles.feedPhotoHeader}>
            <Text style={styles.fieldLabel}>Fotos</Text>
            <Text style={styles.feedPhotoLimit}>{previews.length}/4</Text>
          </View>
          <View style={styles.feedPickedGrid}>
            {previews.map((photo, index) => (
              <View key={`picked-photo-${photo}-${index}`} style={styles.feedPickedPhotoWrap}>
                <Image source={imageSource(photo)} style={styles.feedPickedPhoto} />
                <Pressable onPress={() => onRemovePhoto(index)} style={styles.feedPickedRemove}>
                  <Ionicons name="close" size={17} color={colors.card} />
                </Pressable>
              </View>
            ))}
            {previews.length < 4 ? (
              <Pressable onPress={onPickPhotos} style={styles.feedPickPhotoCard}>
                <Ionicons name="images-outline" size={26} color={colors.redDark} />
                <Text style={styles.feedPickPhotoText}>Galeria</Text>
                <Text style={styles.feedPickPhotoMeta}>Escolha até 4 fotos</Text>
              </Pressable>
            ) : null}
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </Modal>
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
  onFavorite,
  onReportContent
}) {
  const [activeDetailTab, setActiveDetailTab] = useState('Sobre');
  const [expandedMenuItem, setExpandedMenuItem] = useState(null);
  useEffect(() => {
    if (item?.id) recordRestaurantMetricInDb(item.id, 'views').catch(() => {});
  }, [item?.id]);
  if (!item) return null;
  const openStatus = getRestaurantOpenStatus(item);
  const rating = scoreValue(item).toFixed(1);
  const profileStats = [
    ['Nota', rating],
    ['Avaliações', item.reviews || 0],
    ['Salvos', item.metrics?.favorites || 0]
  ];
  const highlights = [
    ...(item.highlights || []).filter(Boolean),
    openStatus.open ? 'Aberto agora' : openStatus.detail || 'Fechado',
    item.phone ? 'Reserva' : 'Sem reserva',
    item.price
  ].filter(Boolean).slice(0, 4);
  const menuItems = (item.menuItems || []).filter((dish) => dish?.name);
  const tabs = ['Sobre', 'Avaliações'];
  const renderActionButton = (icon, label, onPress, active = false) => (
    <Pressable onPress={onPress} style={({ pressed }) => [styles.detailActionButton, active && styles.detailActionButtonActive, pressed && styles.activePress]}>
      <Ionicons name={icon} size={18} color={active ? colors.card : colors.ink} />
      <Text style={[styles.detailActionButtonText, active && styles.detailActionButtonTextActive]} numberOfLines={1}>{label}</Text>
    </Pressable>
  );

  return (
    <Modal visible transparent animationType="slide" onRequestClose={onClose}>
      <View style={styles.detailBackdrop}>
        <ScrollView style={styles.detailSheet} contentContainerStyle={styles.detailSheetContent} showsVerticalScrollIndicator={false}>
          <View style={styles.detailBannerWrap}>
            <Image source={imageSource(item.coverPhoto || item.image)} style={styles.detailBanner} />
            <View style={styles.detailTopActions}>
              <Pressable onPress={onClose} style={styles.floatButton}>
                <Ionicons name="arrow-back" size={24} color={colors.ink} />
              </Pressable>
              <View style={styles.detailRightActions}>
                <Pressable onPress={() => Share.share({ message: `Conheca ${item.name} no Dine.` })} style={styles.floatButton}>
                  <Ionicons name="share-outline" size={22} color={colors.ink} />
                </Pressable>
                <Pressable onPress={() => onReportContent({ type: 'restaurant', id: item.id, label: item.name, source: 'restaurant-detail' })} style={styles.floatButton}>
                  <Ionicons name="flag-outline" size={21} color={colors.ink} />
                </Pressable>
                <Pressable onPress={() => onFavorite(item.name)} style={styles.floatButton}>
                  <Ionicons name={favorite ? 'heart' : 'heart-outline'} size={23} color={favorite ? colors.redDark : colors.ink} />
                </Pressable>
              </View>
            </View>
            <View style={styles.detailAvatarWrap}>
              <View style={styles.detailAvatarRing}>
                <View style={styles.detailAvatarFrame}>
                  <Image source={imageSource(item.logo || item.image)} style={styles.detailAvatarImage} />
                </View>
              </View>
            </View>
          </View>

          <View style={styles.detailProfileSection}>
            <View style={styles.detailProfileHeader}>
              <View style={styles.detailProfileCopy}>
                <Text style={styles.detailTitle} numberOfLines={2}>{item.name}</Text>
                <Text style={styles.detailSub} numberOfLines={1}>{item.type} • {item.district}</Text>
                <Text style={styles.detailBio} numberOfLines={3}>{item.description}</Text>
              </View>
              <View style={styles.detailScoreBadge}>
                <Ionicons name="star" size={16} color={colors.redDark} />
                <Text style={styles.detailScoreValue}>{rating}</Text>
                <Text style={styles.detailScoreCount}>{item.reviews || 0}</Text>
              </View>
            </View>

            <View style={styles.detailStatsRow}>
              {profileStats.map(([label, value]) => (
                <View key={label} style={styles.detailStat}>
                  <Text style={styles.detailStatValue}>{label === 'Nota' ? value : formatCompactCount(value)}</Text>
                  <Text style={styles.detailStatLabel}>{label}</Text>
                </View>
              ))}
            </View>

            <View style={styles.detailActionRow}>
              {renderActionButton('navigate-outline', 'Como chegar', () => onMaps(item))}
              {renderActionButton('chatbubble-ellipses-outline', 'WhatsApp', () => onWhatsApp(item, false))}
              {renderActionButton('bookmark-outline', 'Conheci', () => onKnown(item), true)}
            </View>

            <View style={styles.detailStoryRow}>
              {highlights.map((label) => (
                <View key={label} style={styles.detailStoryItem}>
                  <View style={styles.detailStoryRing}>
                    <Ionicons name="restaurant-outline" size={16} color={colors.redDark} />
                  </View>
                  <Text style={styles.detailStoryText} numberOfLines={2}>{label}</Text>
                </View>
              ))}
            </View>

            <View style={styles.detailTabRow}>
              {tabs.map((label) => (
                <Pressable key={label} onPress={() => setActiveDetailTab(label)} style={styles.detailTabButton}>
                  <Text style={[styles.detailTabText, activeDetailTab === label && styles.detailTabTextActive]}>{label}</Text>
                  <View style={[styles.detailTabUnderline, activeDetailTab === label && styles.detailTabUnderlineActive]} />
                </Pressable>
              ))}
            </View>

            {activeDetailTab === 'Sobre' ? (
              <View style={styles.detailAboutSection}>
                <Text style={styles.detailText}>{item.description}</Text>
                {item.menuPhoto ? (
                  <View style={styles.detailMenuPhotoWrap}>
                    <Image source={{ uri: item.menuPhoto }} style={styles.detailMenuPhoto} />
                  </View>
                ) : null}
                {menuItems.length ? (
                  <View style={styles.detailMenuList}>
                    <View style={styles.detailMenuHeader}>
                      <View>
                        <Text style={styles.detailMenuEyebrow}>Cardapio</Text>
                        <Text style={styles.detailMenuTitle}>{menuItems.length} itens disponiveis</Text>
                      </View>
                      <View style={styles.detailMenuCountPill}>
                        <Ionicons name="restaurant-outline" size={14} color={colors.redDark} />
                        <Text style={styles.detailMenuCountText}>{menuItems.length}</Text>
                      </View>
                    </View>
                    {menuItems.map((dish, index) => {
                      const itemKey = dish.id || `${dish.name}-${index}`;
                      const expanded = expandedMenuItem === itemKey;
                      const price = dish.priceLabel || (dish.price ? `R$ ${dish.price}` : 'Sob consulta');
                      return (
                        <Pressable
                          key={itemKey}
                          accessibilityRole="button"
                          accessibilityLabel={`${expanded ? 'Fechar' : 'Abrir'} item ${dish.name}`}
                          onPress={() => setExpandedMenuItem(expanded ? null : itemKey)}
                          style={({ pressed }) => [styles.detailMenuItem, expanded && styles.detailMenuItemExpanded, pressed && styles.detailMenuItemPressed]}
                        >
                          <View style={styles.detailMenuMainRow}>
                            <View style={styles.detailMenuImageFrame}>
                              {dish.image ? (
                                <Image source={{ uri: dish.image }} style={styles.detailMenuItemImage} />
                              ) : (
                                <Ionicons name="restaurant-outline" size={24} color={colors.redDark} />
                              )}
                            </View>
                            <View style={styles.detailMenuCopy}>
                              <View style={styles.detailMenuTopLine}>
                                {dish.category ? <Text style={styles.detailMenuCategory} numberOfLines={1}>{dish.category}</Text> : <View />}
                                <Ionicons name={expanded ? 'chevron-up' : 'chevron-down'} size={16} color={colors.muted} />
                              </View>
                              <Text style={styles.detailMenuName}>{dish.name}</Text>
                              {dish.description ? <Text style={styles.detailMenuDescription} numberOfLines={expanded ? 5 : 2}>{dish.description}</Text> : null}
                              <View style={styles.detailMenuFooter}>
                                <Text style={styles.detailMenuPrice}>{price}</Text>
                                {dish.code ? <Text style={styles.detailMenuCode}>#{dish.code}</Text> : null}
                              </View>
                            </View>
                          </View>
                          {expanded ? (
                            <View style={styles.detailMenuExpandedArea}>
                              <Text style={styles.detailMenuExpandedText}>{dish.description || 'Detalhes do produto indisponiveis.'}</Text>
                              {dish.url ? (
                                <Pressable onPress={() => Linking.openURL(dish.url)} style={({ pressed }) => [styles.detailMenuProductButton, pressed && styles.activePress]}>
                                  <Ionicons name="open-outline" size={17} color={colors.card} />
                                  <Text style={styles.detailMenuProductButtonText}>Abrir produto</Text>
                                </Pressable>
                              ) : null}
                            </View>
                          ) : null}
                        </Pressable>
                      );
                    })}
                  </View>
                ) : null}
                <View style={styles.tagPills}>
                  {(item.tags || ['Cozinha autoral', 'Ingredientes sazonais', 'Carta de vinhos']).map((tag) => (
                    <View key={tag} style={styles.detailTag}>
                      <Text style={styles.detailTagText}>{tag}</Text>
                    </View>
                  ))}
                </View>
                <View style={styles.amenityRow}>
                  {[
                    ['calendar-outline', 'Reservas'],
                    ['car-outline', 'Estacionamento'],
                    ['leaf-outline', 'Pet friendly'],
                    ['time-outline', openStatus.open ? 'Aberto agora' : openStatus.detail || 'Fechado']
                  ].map(([icon, label]) => (
                    <View key={label} style={styles.amenityItem}>
                      <Ionicons name={icon} size={24} color={colors.olive} />
                      <Text style={styles.amenityText}>{label}</Text>
                    </View>
                  ))}
                </View>
                <Text style={styles.detailAddress}>{item.address}</Text>
                <View style={styles.detailAboutButtons}>
                  <Pressable onPress={() => item.reservationUrl ? Linking.openURL(item.reservationUrl) : onWhatsApp(item, true)} style={styles.detailSecondaryButton}>
                    <Text style={styles.detailSecondaryButtonText}>Reservar</Text>
                  </Pressable>
                  <Pressable onPress={() => onClaim(item)} style={styles.detailSecondaryButton}>
                    <Text style={styles.detailSecondaryButtonText}>Reivindicar restaurante</Text>
                  </Pressable>
                </View>
              </View>
            ) : null}

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
                        <Pressable
                          onPress={() => onReportContent({ type: 'review', id: review.id, label: `avaliacao de ${review.userName || 'visitante'}`, source: 'restaurant-review' })}
                          style={styles.reviewActionButton}
                        >
                          <Ionicons name="flag-outline" size={19} color={colors.ink} />
                          <Text style={styles.reviewActionText}>Denunciar</Text>
                        </Pressable>
                      </View>
                    </View>
                  );
                }) : <Text style={styles.detailText}>Ainda não há comentários. Seja a primeira pessoa a avaliar.</Text>}
              </View>
            ) : null}
          </View>
        </ScrollView>
      </View>
    </Modal>
  );
}

function PostViewerModal({ visible, restaurant, post, liked, likesCount, onClose, onLike, onReport }) {
  if (!visible || !restaurant || !post) return null;
  return (
    <Modal visible transparent animationType="fade" onRequestClose={onClose}>
      <View style={styles.postViewerBackdrop}>
        <View style={styles.postViewerSheet}>
          <Image source={{ uri: post.image || restaurant.coverPhoto || restaurant.image || defaultImage }} style={styles.postViewerImage} />
          <View style={styles.postViewerTopBar}>
            <Pressable onPress={onClose} style={styles.postViewerIconButton} hitSlop={10}>
              <Ionicons name="chevron-back" size={24} color={colors.ink} />
            </Pressable>
            <Pressable onPress={onReport} style={styles.postViewerIconButton} hitSlop={10}>
              <Ionicons name="flag-outline" size={21} color={colors.ink} />
            </Pressable>
          </View>
          <View style={styles.postViewerBody}>
            <View style={styles.postViewerHeader}>
              <View style={styles.postViewerAvatar}>
                <Image source={imageSource(restaurant.logo || restaurant.image)} style={styles.postViewerAvatarImage} />
              </View>
              <View style={styles.postViewerHeaderCopy}>
                <Text style={styles.postViewerTitle} numberOfLines={1}>{restaurant.name}</Text>
                <Text style={styles.postViewerMeta} numberOfLines={1}>{post.meta || post.title}</Text>
              </View>
              <Text style={styles.postViewerLikeCount}>{post.price || 'Cardapio'}</Text>
            </View>
            <Text style={styles.postViewerDishTitle}>{post.title}</Text>
            <Text style={styles.postViewerCaption}>{post.caption || restaurant.description}</Text>
            <View style={styles.postViewerChips}>
              <View style={styles.postViewerChip}><Text style={styles.postViewerChipText}>{restaurant.type}</Text></View>
              <View style={styles.postViewerChip}><Text style={styles.postViewerChipText}>{restaurant.district}</Text></View>
            </View>
          </View>
            {post.url ? (
              <Pressable onPress={() => Linking.openURL(post.url)} style={({ pressed }) => [styles.postViewerAction, pressed && styles.activePress]}>
                <Ionicons name="open-outline" size={18} color={colors.card} />
                <Text style={styles.postViewerActionText}>Abrir produto</Text>
              </Pressable>
            ) : null}
        </View>
      </View>
    </Modal>
  );
}

function FeedProfileModal({ visible, profile, onClose, onOpenRestaurant, onReportProfile, onBlockProfile }) {
  const { width } = useWindowDimensions();
  if (!visible || !profile) return null;
  const posts = profile.posts || [];
  const instagram = String(profile.instagram || '').trim();
  const instagramUrl = instagram
    ? instagram.startsWith('http') ? instagram : `https://instagram.com/${instagram.replace('@', '')}`
    : '';
  const openInstagram = () => {
    if (instagramUrl) Linking.openURL(instagramUrl).catch(() => {});
  };
  const gridGap = 2;
  const tileSize = Math.floor((Math.min(width, 520) - 36 - gridGap * 2) / 3);
  const totalLikes = posts.reduce((sum, post) => sum + Number(post.likes || 0), 0);
  return (
    <Modal visible transparent animationType="slide" onRequestClose={onClose}>
      <View style={styles.feedProfileBackdrop}>
        <View style={styles.feedProfileSheet}>
          <ScrollView contentContainerStyle={styles.feedProfileContent}>
            <View style={styles.feedProfileTopBar}>
              <Pressable onPress={onClose} style={styles.feedProfileIconButton}>
                <Ionicons name="chevron-back" size={24} color={colors.ink} />
              </Pressable>
              <Text style={styles.feedProfileHandle} numberOfLines={1}>{profile.handle || '@perfil'}</Text>
              <Pressable onPress={() => onReportProfile(profile)} style={styles.feedProfileIconButton}>
                <Ionicons name="flag-outline" size={21} color={colors.ink} />
              </Pressable>
            </View>

            <View style={styles.feedProfileHeader}>
              <Image source={imageSource(profile.avatar)} style={styles.feedProfileAvatar} />
              <View style={styles.feedProfileStats}>
                {[
                  ['Posts', posts.length],
                  ['Seguidores', formatCompactCount(Number(profile.followers || totalLikes + 120))],
                  ['Seguindo', formatCompactCount(Number(profile.following || 80))]
                ].map(([label, value]) => (
                  <View key={label} style={styles.feedProfileStat}>
                    <Text style={styles.feedProfileStatValue}>{value}</Text>
                    <Text style={styles.feedProfileStatLabel}>{label}</Text>
                  </View>
                ))}
              </View>
            </View>

            <View style={styles.feedProfileBioBlock}>
              <Text style={styles.feedProfileName}>{profile.name || 'Perfil'}</Text>
              <Text style={styles.feedProfileBio}>{profile.bio || 'Compartilhando momentos e descobertas gastronômicas.'}</Text>
              {instagram ? <Text style={styles.feedProfileInstagram}>{instagram.startsWith('@') ? instagram : `@${instagram.replace(/^https?:\/\/(www\.)?instagram\.com\//, '').replace('/', '')}`}</Text> : null}
            </View>

            <View style={styles.feedProfileActions}>
              <Pressable style={styles.feedProfileFollowButton}>
                <Text style={styles.feedProfileFollowText}>Seguir</Text>
              </Pressable>
              {instagram ? (
                <Pressable onPress={openInstagram} style={styles.feedProfileInstagramButton}>
                  <Ionicons name="logo-instagram" size={17} color={colors.ink} />
                  <Text style={styles.feedProfileInstagramButtonText}>Instagram</Text>
                </Pressable>
              ) : null}
              <Pressable onPress={() => onBlockProfile(profile)} style={styles.feedProfileBlockButton}>
                <Ionicons name="ban-outline" size={17} color={colors.redDark} />
                <Text style={styles.feedProfileBlockText}>Bloquear</Text>
              </Pressable>
            </View>

            <View style={styles.feedProfileTab}>
              <Ionicons name="grid-outline" size={18} color={colors.ink} />
              <Text style={styles.feedProfileTabText}>Publicações</Text>
            </View>

            <View style={styles.feedProfileGrid}>
              {posts.map((post) => {
                const photo = (post.images?.length ? post.images[0] : post.image) || defaultImage;
                return (
                  <Pressable
                    key={post.id}
                    onPress={() => post.restaurant ? onOpenRestaurant(post.restaurant) : null}
                    style={[styles.feedProfileTile, { width: tileSize, height: tileSize }]}
                  >
                    <Image source={imageSource(photo)} style={styles.feedProfileTileImage} />
                    {post.images?.length > 1 ? (
                      <View style={styles.feedProfileTileBadge}>
                        <Ionicons name="albums-outline" size={14} color={colors.card} />
                      </View>
                    ) : null}
                  </Pressable>
                );
              })}
            </View>
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}

function SettingsActionRow({ icon, title, subtitle, onPress }) {
  return (
    <Pressable onPress={onPress} style={({ pressed }) => [styles.settingsRow, pressed && styles.activePress]}>
      <View style={styles.settingsRowIcon}>
        <Ionicons name={icon} size={21} color={colors.redDark} />
      </View>
      <View style={styles.settingsRowCopy}>
        <Text style={styles.settingsRowTitle}>{title}</Text>
        <Text style={styles.settingsRowSubtitle}>{subtitle}</Text>
      </View>
      <Ionicons name="chevron-forward" size={19} color={colors.muted} />
    </Pressable>
  );
}

function SettingsOptionRow({ title, subtitle, selected, accent = colors.redDark, onPress }) {
  return (
    <Pressable onPress={onPress} style={({ pressed }) => [styles.settingsRow, pressed && styles.activePress]}>
      <View style={[styles.optionRadio, selected && [styles.optionRadioActive, { backgroundColor: accent, borderColor: accent }]]}>
        {selected ? <Ionicons name="checkmark" size={15} color={colors.card} /> : null}
      </View>
      <View style={styles.settingsRowCopy}>
        <Text style={styles.settingsRowTitle}>{title}</Text>
        <Text style={styles.settingsRowSubtitle}>{subtitle}</Text>
      </View>
    </Pressable>
  );
}

function SettingsToggleRow({ icon, title, subtitle, active, onPress }) {
  return (
    <Pressable onPress={onPress} style={({ pressed }) => [styles.settingsRow, pressed && styles.activePress]}>
      <View style={styles.settingsRowIcon}>
        <Ionicons name={icon} size={21} color={colors.redDark} />
      </View>
      <View style={styles.settingsRowCopy}>
        <Text style={styles.settingsRowTitle}>{title}</Text>
        <Text style={styles.settingsRowSubtitle}>{subtitle}</Text>
      </View>
      <View style={[styles.settingsToggle, active && styles.settingsToggleActive]}>
        <View style={[styles.settingsToggleThumb, active && styles.settingsToggleThumbActive]} />
      </View>
    </Pressable>
  );
}

function OnboardingModal({ visible, slides, index, onNext, onSkip }) {
  if (!visible) return null;
  const slide = slides[index] || slides[0];
  const last = index >= slides.length - 1;
  return (
    <Modal visible animationType="fade" presentationStyle="fullScreen" onRequestClose={() => null}>
      <SafeAreaView style={styles.onboardingScreen}>
        <View style={styles.onboardingTopBar}>
          <View style={styles.onboardingBrand}>
            <Image source={dineLogo} style={styles.onboardingLogo} resizeMode="contain" />
          </View>
          <Pressable onPress={onSkip} style={styles.onboardingSkip}>
            <Text style={styles.onboardingSkipText}>Pular</Text>
          </Pressable>
        </View>
        <View style={styles.onboardingArtworkWrap}>
          <Image source={slide.image} style={styles.onboardingArtwork} resizeMode="contain" />
        </View>
        <View style={styles.onboardingCopy}>
          <View style={styles.onboardingDots}>
            {slides.map((item, dotIndex) => (
              <View key={item.title} style={[styles.onboardingDot, dotIndex === index && styles.onboardingDotActive]} />
            ))}
          </View>
          <Text style={styles.onboardingTitle}>{slide.title}</Text>
          <Text style={styles.onboardingText}>{slide.text}</Text>
          <AppButton onPress={onNext}>{last ? 'Comecar' : 'Continuar'}</AppButton>
        </View>
      </SafeAreaView>
    </Modal>
  );
}

function AuthModal({ mode, form, setForm, setMode, onSubmitAuth, required = false }) {
  if (!mode) return null;
  const title = mode === 'login' ? 'Acesse sua conta' : mode === 'signup' ? 'Comece no Dine' : 'Cadastrar restaurante';
  if (required) {
    return (
      <Modal visible animationType="fade" presentationStyle="fullScreen" onRequestClose={() => null}>
        <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={styles.authFullBackdrop}>
          <ScrollView contentContainerStyle={styles.authFullScreen} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
            <View style={styles.authFullForm}>
              <Text style={styles.kicker}>{mode === 'login' ? 'Entrar' : 'Criar conta'}</Text>
              <Text style={styles.pageTitleText}>{title}</Text>
              <Text style={styles.panelText}>Entre ou crie uma conta para continuar.</Text>
              {mode === 'signup' ? <Field label="Nome" value={form.name} onChangeText={(value) => setForm({ ...form, name: value })} /> : null}
              <Field label="E-mail" value={form.email} onChangeText={(value) => setForm({ ...form, email: value })} keyboardType="email-address" autoCapitalize="none" />
              <Field label="Senha" value={form.password} onChangeText={(value) => setForm({ ...form, password: value })} secureTextEntry />
              <AppButton onPress={onSubmitAuth}>{mode === 'login' ? 'Entrar' : 'Criar conta'}</AppButton>
              <AppButton kind="secondary" onPress={() => setMode(mode === 'login' ? 'signup' : 'login')}>
                {mode === 'login' ? 'Criar nova conta' : 'Já tenho conta'}
              </AppButton>
            </View>
          </ScrollView>
        </KeyboardAvoidingView>
      </Modal>
    );
  }
  return (
    <Modal visible transparent animationType="slide" onRequestClose={() => required ? null : setMode(null)}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={styles.modalBackdrop}>
        <ScrollView contentContainerStyle={styles.authSheet}>
          {!required ? (
            <Pressable onPress={() => setMode(null)} style={styles.closeButton}>
              <Ionicons name="close" size={22} color={colors.green} />
            </Pressable>
          ) : null}
          <Text style={styles.kicker}>{mode === 'login' ? 'Entrar' : 'Criar conta'}</Text>
          <Text style={styles.pageTitleText}>{title}</Text>
          {required ? <Text style={styles.panelText}>Entre ou crie uma conta para continuar no Dine.</Text> : null}
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
  startupSplash: { ...StyleSheet.absoluteFillObject, zIndex: 9999, backgroundColor: '#FFF6EA', alignItems: 'center', justifyContent: 'center' },
  startupPulse: { position: 'absolute', width: 260, height: 260, borderRadius: 130, backgroundColor: 'rgba(200,70,37,0.18)' },
  startupLogoCard: { width: 228, height: 116, alignItems: 'center', justifyContent: 'center' },
  startupLogoImage: { width: 228, height: 116 },
  startupText: { marginTop: 12, color: colors.redDark, fontFamily: bodyFont, fontSize: 12, textTransform: 'uppercase', letterSpacing: 1.6 },
  onboardingScreen: { flex: 1, backgroundColor: colors.bg, paddingHorizontal: 22, paddingBottom: 28 },
  onboardingTopBar: { minHeight: 64, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingTop: 8 },
  onboardingBrand: { width: 78, height: 40, alignItems: 'flex-start', justifyContent: 'center' },
  onboardingLogo: { width: 72, height: 38 },
  onboardingSkip: { minHeight: 38, paddingHorizontal: 14, borderRadius: 18, alignItems: 'center', justifyContent: 'center' },
  onboardingSkipText: { color: colors.muted, fontFamily: bodyFont, fontSize: 14 },
  onboardingArtworkWrap: { flex: 1, minHeight: 250, alignItems: 'center', justifyContent: 'center', paddingVertical: 14 },
  onboardingArtwork: { width: '100%', height: '100%', maxWidth: 360, maxHeight: 330 },
  onboardingCopy: { width: '100%', maxWidth: 360, alignSelf: 'center', alignItems: 'center', paddingBottom: 4, gap: 16 },
  onboardingDots: { height: 12, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8 },
  onboardingDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: 'rgba(40,40,43,0.18)' },
  onboardingDotActive: { width: 24, backgroundColor: colors.redDark },
  onboardingTitle: { width: '100%', color: colors.ink, fontFamily: titleFont, fontWeight: '900', fontSize: 29, lineHeight: 34, textAlign: 'center' },
  onboardingText: { width: '100%', color: colors.muted, fontFamily: 'Nunito_400Regular', fontSize: 15, lineHeight: 22, textAlign: 'center', marginBottom: 2 },
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
  detailBackdrop: { flex: 1, backgroundColor: colors.bg },
  detailSheet: { flex: 1, backgroundColor: colors.bg },
  detailSheetContent: { paddingBottom: 34 },
  detailBannerWrap: { position: 'relative' },
  detailBanner: { width: '100%', aspectRatio: 1.4, backgroundColor: colors.surface },
  detailTopActions: { position: 'absolute', top: Platform.OS === 'ios' ? 54 : 28, left: 18, right: 18, zIndex: 4, flexDirection: 'row', justifyContent: 'space-between' },
  detailRightActions: { flexDirection: 'row', gap: 10 },
  floatButton: { width: 50, height: 50, borderRadius: 25, backgroundColor: 'rgba(255,253,247,0.96)', alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: colors.line },
  detailAvatarWrap: { position: 'absolute', left: 20, bottom: -42 },
  detailAvatarRing: { width: 92, height: 92, borderRadius: 46, borderWidth: 2, borderColor: colors.redDark, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.bg },
  detailAvatarFrame: { width: 80, height: 80, borderRadius: 40, overflow: 'hidden', backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.line, alignItems: 'center', justifyContent: 'center' },
  detailAvatarImage: { width: '100%', height: '100%' },
  detailProfileSection: { paddingHorizontal: 18, paddingTop: 56, gap: 18 },
  detailProfileHeader: { flexDirection: 'row', alignItems: 'flex-start', gap: 12 },
  detailProfileCopy: { flex: 1, minWidth: 0, gap: 4 },
  detailTitle: { color: colors.ink, fontFamily: titleFont, fontWeight: '900', fontSize: 28, lineHeight: 31 },
  detailSub: { color: colors.muted, fontFamily: 'Nunito_700Bold', fontSize: 14, lineHeight: 18 },
  detailBio: { color: colors.ink, fontFamily: 'Nunito_400Regular', fontSize: 14, lineHeight: 20 },
  detailScoreBadge: { minWidth: 66, minHeight: 66, borderRadius: 18, backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.line, alignItems: 'center', justifyContent: 'center', gap: 2, paddingHorizontal: 8 },
  detailScoreValue: { color: colors.ink, fontFamily: bodyFont, fontSize: 18, lineHeight: 20 },
  detailScoreCount: { color: colors.muted, fontFamily: 'Nunito_400Regular', fontSize: 11 },
  detailStatsRow: { flexDirection: 'row', gap: 10 },
  detailStat: { flex: 1, minWidth: 0, borderRadius: 16, backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.line, paddingVertical: 12, alignItems: 'center', justifyContent: 'center' },
  detailStatValue: { color: colors.ink, fontFamily: bodyFont, fontSize: 20, lineHeight: 22 },
  detailStatLabel: { color: colors.muted, fontFamily: 'Nunito_400Regular', fontSize: 11, marginTop: 2 },
  detailActionRow: { flexDirection: 'row', gap: 8, flexWrap: 'wrap' },
  detailActionButton: { minHeight: 44, flexGrow: 1, flexBasis: '30%', borderRadius: 14, borderWidth: 1, borderColor: colors.line, backgroundColor: colors.card, paddingHorizontal: 12, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8 },
  detailActionButtonActive: { backgroundColor: colors.redDark, borderColor: colors.redDark },
  detailActionButtonText: { color: colors.ink, fontFamily: bodyFont, fontSize: 13 },
  detailActionButtonTextActive: { color: colors.card },
  detailStoryRow: { flexDirection: 'row', gap: 10 },
  detailStoryItem: { width: 72, alignItems: 'center', gap: 6 },
  detailStoryRing: { width: 58, height: 58, borderRadius: 29, borderWidth: 2, borderColor: colors.line, backgroundColor: colors.surface, alignItems: 'center', justifyContent: 'center' },
  detailStoryText: { color: colors.muted, fontFamily: 'Nunito_400Regular', fontSize: 11, lineHeight: 14, textAlign: 'center' },
  detailTabRow: { flexDirection: 'row', borderTopWidth: 1, borderTopColor: colors.line, borderBottomWidth: 1, borderBottomColor: colors.line },
  detailTabButton: { flex: 1, minHeight: 48, alignItems: 'center', justifyContent: 'center' },
  detailTabText: { color: colors.muted, fontFamily: bodyFont, fontSize: 13 },
  detailTabTextActive: { color: colors.ink },
  detailTabUnderline: { width: '100%', height: 2, marginTop: 8, backgroundColor: 'transparent' },
  detailTabUnderlineActive: { backgroundColor: colors.ink },
  detailGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 0, backgroundColor: colors.line },
  detailGridTile: { flexBasis: '33.3333%', maxWidth: '33.3333%', flexGrow: 0, flexShrink: 0, aspectRatio: 1, backgroundColor: colors.surface, position: 'relative', overflow: 'hidden' },
  detailGridImage: { width: '100%', height: '100%' },
  detailGridOverlay: { position: 'absolute', right: 8, top: 8, width: 22, height: 22, borderRadius: 11, backgroundColor: 'rgba(0,0,0,0.48)', alignItems: 'center', justifyContent: 'center' },
  detailGridFooter: { position: 'absolute', left: 0, right: 0, bottom: 0, paddingHorizontal: 8, paddingVertical: 7, backgroundColor: 'rgba(0,0,0,0.38)', flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 6 },
  detailGridTitle: { flex: 1, minWidth: 0, color: colors.card, fontFamily: bodyFont, fontSize: 11 },
  detailGridMeta: { color: 'rgba(255,255,255,0.82)', fontFamily: 'Nunito_400Regular', fontSize: 10 },
  detailAboutSection: { gap: 14 },
  detailMenuPhotoWrap: { overflow: 'hidden', borderRadius: 16, backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.line },
  detailMenuPhoto: { width: '100%', aspectRatio: 1.35, backgroundColor: colors.surface },
  detailMenuList: { gap: 12 },
  detailMenuHeader: { minHeight: 62, borderRadius: 18, backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.line, paddingHorizontal: 14, paddingVertical: 12, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 12 },
  detailMenuEyebrow: { color: colors.redDark, fontFamily: 'Nunito_700Bold', fontSize: 11, textTransform: 'uppercase' },
  detailMenuTitle: { color: colors.ink, fontFamily: bodyFont, fontSize: 18, lineHeight: 22, marginTop: 2 },
  detailMenuCountPill: { minHeight: 34, borderRadius: 17, backgroundColor: colors.card, borderWidth: 1, borderColor: colors.line, paddingHorizontal: 11, flexDirection: 'row', alignItems: 'center', gap: 6 },
  detailMenuCountText: { color: colors.redDark, fontFamily: bodyFont, fontSize: 13 },
  detailMenuItem: { borderRadius: 18, backgroundColor: colors.card, borderWidth: 1, borderColor: colors.line, padding: 10, gap: 10, shadowColor: '#1f1b18', shadowOpacity: 0.08, shadowRadius: 14, elevation: 2 },
  detailMenuItemExpanded: { borderColor: colors.redDark, backgroundColor: '#FFFDF7' },
  detailMenuItemPressed: { opacity: 0.9, transform: [{ scale: 0.99 }], backgroundColor: colors.surface },
  detailMenuMainRow: { minHeight: 112, flexDirection: 'row', alignItems: 'stretch', gap: 12 },
  detailMenuImageFrame: { width: 98, height: 104, borderRadius: 14, overflow: 'hidden', backgroundColor: colors.surface, alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: colors.line },
  detailMenuItemImage: { width: '100%', height: '100%' },
  detailMenuCopy: { flex: 1, minWidth: 0, justifyContent: 'space-between', gap: 6, paddingVertical: 2 },
  detailMenuTopLine: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 8 },
  detailMenuCategory: { flex: 1, minWidth: 0, color: colors.redDark, fontFamily: 'Nunito_700Bold', fontSize: 10, textTransform: 'uppercase' },
  detailMenuName: { color: colors.ink, fontFamily: bodyFont, fontSize: 16, lineHeight: 20 },
  detailMenuDescription: { color: colors.muted, fontFamily: 'Nunito_400Regular', fontSize: 12, lineHeight: 17 },
  detailMenuFooter: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 8 },
  detailMenuPrice: { color: colors.redDark, fontFamily: bodyFont, fontSize: 15, lineHeight: 18 },
  detailMenuCode: { color: colors.muted, fontFamily: 'Nunito_700Bold', fontSize: 11 },
  detailMenuExpandedArea: { borderTopWidth: 1, borderTopColor: colors.line, paddingTop: 10, gap: 10 },
  detailMenuExpandedText: { color: colors.ink, fontFamily: 'Nunito_400Regular', fontSize: 13, lineHeight: 19 },
  detailMenuProductButton: { alignSelf: 'flex-start', minHeight: 40, borderRadius: 14, backgroundColor: colors.redDark, paddingHorizontal: 13, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 7 },
  detailMenuProductButtonText: { color: colors.card, fontFamily: bodyFont, fontSize: 13 },
  trendingListGrid: { gap: 10, marginBottom: 12 },
  trendingListCard: { minHeight: 74, borderRadius: 18, backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.line, padding: 12, flexDirection: 'row', alignItems: 'center', gap: 12 },
  trendingListIcon: { width: 42, height: 42, borderRadius: 21, backgroundColor: colors.card, borderWidth: 1, borderColor: colors.line, alignItems: 'center', justifyContent: 'center' },
  trendingListCopy: { flex: 1, minWidth: 0 },
  trendingListTitle: { color: colors.ink, fontFamily: bodyFont, fontSize: 16, lineHeight: 19 },
  trendingListMeta: { color: colors.muted, fontFamily: 'Nunito_400Regular', fontSize: 12, lineHeight: 16, marginTop: 3 },
  trendingListCount: { color: colors.redDark, fontFamily: bodyFont, fontSize: 12 },
  trendingCategoryGrid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between', rowGap: 18, marginBottom: 14 },
  trendingCategoryTile: { width: '23%', minWidth: 74, alignItems: 'center', gap: 6 },
  trendingCategoryIcon: { width: 68, height: 68, borderRadius: 22, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.surface, borderWidth: 1.5, borderStyle: 'dashed', borderColor: colors.redDark },
  trendingCategoryTitle: { minHeight: 30, color: colors.ink, fontFamily: bodyFont, fontSize: 12, lineHeight: 15, textAlign: 'center' },
  feedHeaderInset: { paddingHorizontal: 16 },
  feedComposerCard: { minHeight: 76, borderRadius: 18, backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.line, padding: 12, flexDirection: 'row', alignItems: 'center', gap: 12, marginHorizontal: 16, marginBottom: 14 },
  feedComposerAvatar: { width: 46, height: 46, borderRadius: 23, overflow: 'hidden', backgroundColor: colors.redDark, alignItems: 'center', justifyContent: 'center' },
  feedComposerAvatarImage: { width: '100%', height: '100%' },
  feedComposerInitial: { color: colors.card, fontFamily: bodyFont, fontSize: 18 },
  feedComposerCopy: { flex: 1, minWidth: 0 },
  feedComposerTitle: { color: colors.ink, fontFamily: bodyFont, fontSize: 15 },
  feedComposerText: { color: colors.muted, fontFamily: 'Nunito_400Regular', fontSize: 12, lineHeight: 17, marginTop: 2 },
  feedComposerButton: { width: 42, height: 42, borderRadius: 21, backgroundColor: colors.redDark, alignItems: 'center', justifyContent: 'center' },
  feedList: { paddingBottom: 20 },
  feedPostCard: { overflow: 'hidden', borderRadius: 0, backgroundColor: colors.bg, borderBottomWidth: 1, borderBottomColor: colors.line },
  feedPostHeader: { minHeight: 64, paddingHorizontal: 14, paddingVertical: 10, flexDirection: 'row', alignItems: 'center', gap: 10 },
  feedAvatarButton: { width: 42, height: 42, borderRadius: 21 },
  feedAvatar: { width: 42, height: 42, borderRadius: 21, backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.line },
  feedAuthorCopy: { flex: 1, minWidth: 0 },
  feedAuthor: { color: colors.ink, fontFamily: bodyFont, fontSize: 14 },
  feedMeta: { color: colors.muted, fontFamily: 'Nunito_400Regular', fontSize: 12, marginTop: 2 },
  feedRestaurantPill: { maxWidth: 116, minHeight: 30, borderRadius: 15, backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.line, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 9 },
  feedRestaurantPillText: { color: colors.redDark, fontFamily: bodyFont, fontSize: 11 },
  feedImageWrap: { width: '100%', backgroundColor: colors.surface, position: 'relative' },
  feedPhotoSlide: { height: '100%', backgroundColor: colors.surface },
  feedImage: { width: '100%', height: '100%' },
  feedDots: { position: 'absolute', left: 0, right: 0, bottom: 12, flexDirection: 'row', justifyContent: 'center', gap: 6 },
  feedDot: { width: 6, height: 6, borderRadius: 3, backgroundColor: 'rgba(255,255,255,0.55)' },
  feedDotActive: { width: 17, backgroundColor: colors.card },
  feedPhotoCount: { position: 'absolute', right: 12, top: 12, overflow: 'hidden', borderRadius: 12, backgroundColor: 'rgba(0,0,0,0.48)', paddingHorizontal: 9, paddingVertical: 4, color: colors.card, fontFamily: bodyFont, fontSize: 12 },
  feedPostBody: { paddingHorizontal: 14, paddingTop: 12, paddingBottom: 16, gap: 9 },
  feedPostTitle: { color: colors.ink, fontFamily: titleFont, fontWeight: '900', fontSize: 22, lineHeight: 26 },
  feedCaption: { color: colors.ink, fontFamily: 'Nunito_400Regular', fontSize: 14, lineHeight: 20 },
  feedActionsRow: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingTop: 2 },
  feedActionButton: { minHeight: 34, flexDirection: 'row', alignItems: 'center', gap: 5 },
  feedMoreButton: { width: 34, height: 34, borderRadius: 17, alignItems: 'center', justifyContent: 'center', backgroundColor: 'rgba(40,40,43,0.05)' },
  feedActionText: { color: colors.ink, fontFamily: bodyFont, fontSize: 12 },
  feedComments: { gap: 4 },
  feedCommentText: { color: colors.ink, fontFamily: 'Nunito_400Regular', fontSize: 13, lineHeight: 18 },
  feedCommentAuthor: { fontFamily: bodyFont },
  feedCommentComposer: { minHeight: 44, borderRadius: 16, backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.line, paddingLeft: 12, paddingRight: 4, flexDirection: 'row', alignItems: 'center', gap: 8 },
  feedCommentInput: { flex: 1, minWidth: 0, color: colors.ink, fontFamily: 'Nunito_400Regular', fontSize: 13 },
  feedCommentSend: { width: 36, height: 36, borderRadius: 18, backgroundColor: colors.redDark, alignItems: 'center', justifyContent: 'center' },
  feedComposerSheet: { marginTop: 'auto', borderTopLeftRadius: 28, borderTopRightRadius: 28, backgroundColor: colors.bg, padding: 18, paddingTop: 16, gap: 12 },
  feedComposerTopBar: { minHeight: 48, flexDirection: 'row', alignItems: 'center', gap: 10 },
  feedComposerClose: { width: 42, height: 42, borderRadius: 21, backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.line, alignItems: 'center', justifyContent: 'center' },
  feedComposerTitleWrap: { flex: 1, minWidth: 0 },
  feedComposerSheetTitle: { color: colors.ink, fontFamily: titleFont, fontWeight: '900', fontSize: 24, lineHeight: 28 },
  feedComposerSheetMeta: { color: colors.muted, fontFamily: 'Nunito_400Regular', fontSize: 12 },
  feedPublishButton: { minHeight: 40, borderRadius: 20, backgroundColor: colors.redDark, paddingHorizontal: 14, alignItems: 'center', justifyContent: 'center' },
  feedPublishButtonText: { color: colors.card, fontFamily: bodyFont, fontSize: 13 },
  feedSearchBox: { minHeight: 50, borderRadius: 16, borderWidth: 1, borderColor: colors.line, backgroundColor: colors.card, paddingHorizontal: 12, flexDirection: 'row', alignItems: 'center', gap: 9 },
  feedSearchInput: { flex: 1, minWidth: 0, color: colors.ink, fontFamily: 'Nunito_400Regular', fontSize: 14 },
  feedSearchClear: { width: 30, height: 30, borderRadius: 15, backgroundColor: colors.surface, alignItems: 'center', justifyContent: 'center' },
  feedRestaurantResults: { gap: 8 },
  feedRestaurantResult: { minHeight: 62, borderRadius: 16, borderWidth: 1, borderColor: colors.line, backgroundColor: colors.surface, padding: 8, flexDirection: 'row', alignItems: 'center', gap: 10 },
  feedRestaurantResultActive: { borderColor: colors.redDark, backgroundColor: '#FFF1E8' },
  feedRestaurantResultImage: { width: 42, height: 42, borderRadius: 21, backgroundColor: colors.card },
  feedRestaurantResultCopy: { flex: 1, minWidth: 0 },
  feedRestaurantResultName: { color: colors.ink, fontFamily: bodyFont, fontSize: 14 },
  feedRestaurantResultNameActive: { color: colors.redDark },
  feedRestaurantResultMeta: { color: colors.muted, fontFamily: 'Nunito_400Regular', fontSize: 12, marginTop: 2 },
  feedRestaurantCustomResult: { minHeight: 62, borderRadius: 16, borderWidth: 1, borderStyle: 'dashed', borderColor: 'rgba(200,70,37,0.42)', backgroundColor: '#FFF7F1', padding: 8, flexDirection: 'row', alignItems: 'center', gap: 10 },
  feedRestaurantCustomIcon: { width: 42, height: 42, borderRadius: 21, backgroundColor: '#FFF1E8', alignItems: 'center', justifyContent: 'center' },
  feedRestaurantPicker: { gap: 8, paddingVertical: 2 },
  feedRestaurantChip: { width: 106, minHeight: 82, borderRadius: 16, backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.line, padding: 8, alignItems: 'center', justifyContent: 'center', gap: 6 },
  feedRestaurantChipActive: { borderColor: colors.redDark, backgroundColor: '#FFF1E8' },
  feedRestaurantChipImage: { width: 38, height: 38, borderRadius: 19, backgroundColor: colors.card },
  feedRestaurantChipText: { color: colors.ink, fontFamily: bodyFont, fontSize: 11, textAlign: 'center' },
  feedRestaurantChipTextActive: { color: colors.redDark },
  feedComposerTextInput: { minHeight: 92, borderRadius: 16, borderWidth: 1, borderColor: colors.line, backgroundColor: colors.card, padding: 12, color: colors.ink, fontFamily: 'Nunito_400Regular', fontSize: 14, textAlignVertical: 'top' },
  feedProfileInput: { minHeight: 48, borderRadius: 16, borderWidth: 1, borderColor: colors.line, backgroundColor: colors.card, paddingHorizontal: 12, color: colors.ink, fontFamily: 'Nunito_400Regular', fontSize: 14 },
  feedPhotoHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  feedPhotoLimit: { color: colors.muted, fontFamily: bodyFont, fontSize: 12 },
  feedPickedGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  feedPickedPhotoWrap: { width: '48%', aspectRatio: 1, overflow: 'hidden', borderRadius: 18, backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.line },
  feedPickedPhoto: { width: '100%', height: '100%' },
  feedPickedRemove: { position: 'absolute', top: 8, right: 8, width: 30, height: 30, borderRadius: 15, backgroundColor: 'rgba(40,40,43,0.72)', alignItems: 'center', justifyContent: 'center' },
  feedPickPhotoCard: { width: '48%', aspectRatio: 1, borderRadius: 18, borderWidth: 1, borderStyle: 'dashed', borderColor: 'rgba(200,70,37,0.42)', backgroundColor: '#FFF1E8', alignItems: 'center', justifyContent: 'center', gap: 5, padding: 10 },
  feedPickPhotoText: { color: colors.redDark, fontFamily: bodyFont, fontSize: 14 },
  feedPickPhotoMeta: { color: colors.muted, fontFamily: 'Nunito_400Regular', fontSize: 11, textAlign: 'center' },
  feedProfileBackdrop: { flex: 1, backgroundColor: 'rgba(14,14,16,0.58)', justifyContent: 'flex-end' },
  feedProfileSheet: { maxHeight: '94%', borderTopLeftRadius: 28, borderTopRightRadius: 28, backgroundColor: colors.bg, overflow: 'hidden' },
  feedProfileContent: { padding: 18, paddingBottom: 34, gap: 16 },
  feedProfileTopBar: { minHeight: 46, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 12 },
  feedProfileIconButton: { width: 40, height: 40, borderRadius: 20, backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.line, alignItems: 'center', justifyContent: 'center' },
  feedProfileHandle: { flex: 1, textAlign: 'center', color: colors.ink, fontFamily: bodyFont, fontSize: 15 },
  feedProfileHeader: { flexDirection: 'row', alignItems: 'center', gap: 18 },
  feedProfileAvatar: { width: 92, height: 92, borderRadius: 46, backgroundColor: colors.surface, borderWidth: 2, borderColor: colors.card },
  feedProfileStats: { flex: 1, minWidth: 0, flexDirection: 'row', justifyContent: 'space-between', gap: 8 },
  feedProfileStat: { flex: 1, alignItems: 'center', gap: 3 },
  feedProfileStatValue: { color: colors.ink, fontFamily: bodyFont, fontSize: 17 },
  feedProfileStatLabel: { color: colors.muted, fontFamily: 'Nunito_400Regular', fontSize: 11 },
  feedProfileBioBlock: { gap: 4 },
  feedProfileName: { color: colors.ink, fontFamily: bodyFont, fontSize: 16 },
  feedProfileBio: { color: colors.ink, fontFamily: 'Nunito_400Regular', fontSize: 14, lineHeight: 20 },
  feedProfileInstagram: { color: colors.redDark, fontFamily: bodyFont, fontSize: 13 },
  feedProfileActions: { flexDirection: 'row', gap: 10 },
  feedProfileFollowButton: { flex: 1, minHeight: 42, borderRadius: 14, backgroundColor: colors.redDark, alignItems: 'center', justifyContent: 'center' },
  feedProfileFollowText: { color: colors.card, fontFamily: bodyFont, fontSize: 14 },
  feedProfileInstagramButton: { flex: 1, minHeight: 42, borderRadius: 14, borderWidth: 1, borderColor: colors.line, backgroundColor: colors.surface, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 7 },
  feedProfileInstagramButtonText: { color: colors.ink, fontFamily: bodyFont, fontSize: 14 },
  feedProfileBlockButton: { minHeight: 42, borderRadius: 14, borderWidth: 1, borderColor: 'rgba(200,70,37,0.24)', backgroundColor: colors.surface, paddingHorizontal: 12, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6 },
  feedProfileBlockText: { color: colors.redDark, fontFamily: bodyFont, fontSize: 13 },
  feedProfilePage: { gap: 16, paddingBottom: 24 },
  feedProfileFollowingButton: { backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.line },
  feedProfileFollowingText: { color: colors.ink },
  feedProfileTab: { minHeight: 42, borderTopWidth: 1, borderBottomWidth: 1, borderColor: colors.line, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8 },
  feedProfileTabText: { color: colors.ink, fontFamily: bodyFont, fontSize: 13 },
  feedProfileGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 2 },
  feedProfileTile: { overflow: 'hidden', backgroundColor: colors.surface, position: 'relative' },
  feedProfileTileImage: { width: '100%', height: '100%' },
  feedProfileTileBadge: { position: 'absolute', top: 7, right: 7, width: 24, height: 24, borderRadius: 12, backgroundColor: 'rgba(0,0,0,0.45)', alignItems: 'center', justifyContent: 'center' },
  detailAboutButtons: { flexDirection: 'row', gap: 10, flexWrap: 'wrap' },
  detailSecondaryButton: { minHeight: 44, borderRadius: 14, borderWidth: 1, borderColor: colors.line, backgroundColor: colors.surface, paddingHorizontal: 14, alignItems: 'center', justifyContent: 'center' },
  detailSecondaryButtonText: { color: colors.ink, fontFamily: bodyFont, fontSize: 13 },
  detailText: { color: colors.ink, fontFamily: 'Nunito_400Regular', fontSize: 16, lineHeight: 24 },
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
  detailAddress: { color: colors.muted, fontFamily: bodyFont, fontSize: 13 },  authSheet: { marginTop: 'auto', borderTopLeftRadius: 28, borderTopRightRadius: 28, backgroundColor: colors.bg, padding: 18, paddingTop: 28, gap: 12 },
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
  adminSummaryGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginBottom: 8 },
  adminSummaryCard: { width: '48%', minHeight: 82, borderRadius: 16, backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.line, padding: 14, justifyContent: 'center' },
  adminSummaryValue: { color: colors.ink, fontFamily: titleFont, fontWeight: '900', fontSize: 30, lineHeight: 34 },
  adminSummaryLabel: { color: colors.muted, fontFamily: 'Nunito_700Bold', fontSize: 12, marginTop: 3 },
  adminListItem: { minHeight: 72, borderRadius: 16, backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.line, padding: 12, marginBottom: 10, gap: 10 },
  adminListTop: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  adminListIcon: { width: 42, height: 42, borderRadius: 21, backgroundColor: colors.card, borderWidth: 1, borderColor: colors.line, alignItems: 'center', justifyContent: 'center' },
  adminListCopy: { flex: 1, minWidth: 0 },
  adminListTitle: { color: colors.ink, fontFamily: bodyFont, fontSize: 15 },
  adminListMeta: { color: colors.muted, fontFamily: 'Nunito_400Regular', fontSize: 12, lineHeight: 17, marginTop: 2 },
  adminMiniMetrics: { flexDirection: 'row', gap: 8, flexWrap: 'wrap' },
  adminMiniMetric: { flex: 1, minWidth: 72, borderRadius: 12, backgroundColor: colors.card, borderWidth: 1, borderColor: colors.line, padding: 8, alignItems: 'center' },
  adminMiniMetricValue: { color: colors.ink, fontFamily: bodyFont, fontSize: 16 },
  adminMiniMetricLabel: { color: colors.muted, fontFamily: 'Nunito_400Regular', fontSize: 11, marginTop: 2 },
  registerHero: { flexDirection: 'row', alignItems: 'center', gap: 12, borderRadius: 18, backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.line, padding: 16, marginBottom: 14 },
  registerHeroCopy: { flex: 1, minWidth: 0, gap: 4 },
  registerSection: { gap: 12, borderRadius: 18, backgroundColor: colors.card, borderWidth: 1, borderColor: colors.line, padding: 16, marginBottom: 14 },
  registerSectionHeader: { flexDirection: 'row', alignItems: 'center', gap: 8, paddingBottom: 2 },
  registerSectionTitle: { color: colors.ink, fontFamily: titleFont, fontWeight: '900', fontSize: 22, lineHeight: 26 },
  registerPhotoGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  registerPhotoCard: { width: '48%', minHeight: 138, borderRadius: 16, borderWidth: 1, borderStyle: 'dashed', borderColor: 'rgba(200,70,37,0.42)', backgroundColor: '#FFF7F1', alignItems: 'center', justifyContent: 'center', gap: 5, padding: 10, overflow: 'hidden' },
  registerPhotoPreview: { position: 'absolute', width: '100%', height: '100%', opacity: 0.82 },
  registerPhotoTitle: { color: colors.ink, fontFamily: bodyFont, fontSize: 14, textAlign: 'center' },
  registerPhotoText: { color: colors.redDark, fontFamily: 'Nunito_700Bold', fontSize: 11, textAlign: 'center' },
  registerExtraPhotoRow: { gap: 10, paddingVertical: 2 },
  registerExtraPhotoWrap: { width: 76, height: 76, borderRadius: 14, overflow: 'hidden', backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.line },
  registerExtraPhoto: { width: '100%', height: '100%' },
  registerExtraPhotoRemove: { position: 'absolute', top: 5, right: 5, width: 22, height: 22, borderRadius: 11, backgroundColor: 'rgba(40,40,43,0.68)', alignItems: 'center', justifyContent: 'center' },
  registerSubmit: { marginBottom: 18 },
  screen: { flex: 1, backgroundColor: colors.bg },
  screenContent: { paddingHorizontal: 22, paddingBottom: 164 },
  screenContentFeed: { paddingHorizontal: 0 },
  screenContentSubscreen: { paddingBottom: 52 },
  screenContentPanel: { paddingHorizontal: 0, paddingBottom: 0 },
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
  homeDiscoveryHeroCard: { height: 188, marginTop: 16, borderRadius: 22, overflow: 'hidden', backgroundColor: colors.ink, shadowColor: colors.ink, shadowOpacity: 0.12, shadowRadius: 18, elevation: 4 },
  homeDiscoveryPager: { width: '100%', height: '100%' },
  homeDiscoverySlide: { height: 188, overflow: 'hidden', backgroundColor: colors.ink },
  homeDiscoveryAnimatedContent: { width: '100%', height: '100%' },
  homeDiscoveryImage: { width: '100%', height: '100%' },
  homeDiscoveryScrim: { position: 'absolute', left: 0, right: 0, top: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.24)' },
  homeDiscoverySheen: { position: 'absolute', top: -30, bottom: -30, width: 72, backgroundColor: 'rgba(255,255,255,0.16)' },
  homeDiscoveryLogoWrap: { position: 'absolute', top: 10, left: 10, width: 42, height: 42, borderRadius: 21, overflow: 'hidden', backgroundColor: colors.card, borderWidth: 2, borderColor: 'rgba(255,255,255,0.92)' },
  homeDiscoveryLogo: { width: '100%', height: '100%' },
  homeDiscoveryCopy: { position: 'absolute', left: 10, right: 10, bottom: 10, gap: 2 },
  homeDiscoveryName: { color: colors.card, fontFamily: bodyFont, fontSize: 15, lineHeight: 18 },
  homeDiscoveryMeta: { color: 'rgba(255,255,255,0.82)', fontFamily: 'Nunito_400Regular', fontSize: 11, lineHeight: 14 },
  homeDiscoveryDots: { position: 'absolute', right: 12, top: 14, flexDirection: 'row', gap: 5 },
  homeDiscoveryDot: { width: 5, height: 5, borderRadius: 99, backgroundColor: 'rgba(255,255,255,0.42)' },
  homeDiscoveryDotActive: { width: 15, backgroundColor: colors.card },
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
  logoImageWrap: { backgroundColor: '#FFF4DE', alignItems: 'center', justifyContent: 'center' },
  logoImageStage: { width: 128, height: 128, borderRadius: 64, backgroundColor: colors.card, borderWidth: 4, borderColor: 'rgba(255,255,255,0.92)', alignItems: 'center', justifyContent: 'center', overflow: 'hidden', shadowColor: colors.ink, shadowOpacity: 0.14, shadowRadius: 16, elevation: 5 },
  restaurantLogoImage: { width: '100%', height: '100%' },
  imageScrim: { position: 'absolute', left: 0, right: 0, top: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.36)' },
  cardOverlay: { position: 'absolute', left: 16, right: 16, bottom: 16 },
  logoCardOverlay: { borderRadius: 14, backgroundColor: 'rgba(26,18,12,0.72)', paddingHorizontal: 12, paddingVertical: 10 },
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
  miniLogoImage: { width: 64, height: 64, borderRadius: 32, backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.line },
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
  restaurantPanelScreen: { minHeight: '100%', paddingTop: 54, paddingBottom: 18 },
  restaurantPanelTopBar: { position: 'absolute', top: Platform.OS === 'ios' ? 14 : 8, left: 14, zIndex: 6 },
  restaurantPanelBackButton: { width: 38, height: 38, borderRadius: 19, backgroundColor: 'rgba(255,253,247,0.94)', borderWidth: 1, borderColor: colors.line, alignItems: 'center', justifyContent: 'center' },
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
  dineProfilePage: { paddingTop: 8, paddingBottom: 22 },
  dineProfileTopBar: { minHeight: 62, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 18 },
  dineProfileTopTitle: { color: colors.ink, fontFamily: bodyFont, fontSize: 25, lineHeight: 28 },
  dineProfileLogo: { position: 'absolute', left: 0, right: 0, textAlign: 'center', color: colors.redDark, fontFamily: titleFont, fontWeight: '900', fontSize: 41, lineHeight: 48 },
  dineProfileTopActions: { flexDirection: 'row', alignItems: 'center', gap: 16 },
  dineProfileTopButton: { width: 36, height: 36, borderRadius: 18, alignItems: 'center', justifyContent: 'center', position: 'relative' },
  dineProfileBellDot: { position: 'absolute', right: 5, top: 5, width: 8, height: 8, borderRadius: 4, backgroundColor: colors.redDark },
  dineProfileHero: { flexDirection: 'row', alignItems: 'center', gap: 18, marginBottom: 24 },
  dineProfileAvatarWrap: { width: 134, height: 134, borderRadius: 67, position: 'relative', alignItems: 'center', justifyContent: 'center' },
  dineProfileAvatarImage: { width: 128, height: 128, borderRadius: 64 },
  dineProfileAvatarEmpty: { width: 128, height: 128, borderRadius: 64, backgroundColor: colors.olive, alignItems: 'center', justifyContent: 'center' },
  dineProfileAvatarInitial: { color: colors.card, fontFamily: titleFont, fontWeight: '900', fontSize: 54 },
  dineProfileAvatarRing: { position: 'absolute', width: 134, height: 134, borderRadius: 67, borderWidth: 2, borderColor: '#B96A32' },
  dineProfileStarBadge: { position: 'absolute', right: 0, bottom: 8, width: 42, height: 42, borderRadius: 21, backgroundColor: colors.ochre, borderWidth: 3, borderColor: colors.card, alignItems: 'center', justifyContent: 'center' },
  dineProfileHeroCopy: { flex: 1, minWidth: 0, gap: 5 },
  dineProfileName: { color: colors.ink, fontFamily: bodyFont, fontSize: 31, lineHeight: 36 },
  dineProfileNameInput: { minHeight: 38, padding: 0, color: colors.ink, fontFamily: bodyFont, fontSize: 31, lineHeight: 36 },
  dineProfileHandleInput: { minHeight: 26, padding: 0, color: colors.redDark, fontFamily: bodyFont, fontSize: 18 },
  dineProfileBio: { color: colors.muted, fontFamily: 'Nunito_400Regular', fontSize: 14, lineHeight: 19, maxWidth: 250 },
  dineProfileBioInput: { minHeight: 44, padding: 0, color: colors.muted, fontFamily: 'Nunito_400Regular', fontSize: 14, lineHeight: 19, maxWidth: 250, textAlignVertical: 'top' },
  dineProfileLocationRow: { flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 4 },
  dineProfileLocation: { color: colors.muted, fontFamily: 'Nunito_700Bold', fontSize: 13 },
  dineProfileLocationInput: { flex: 1, minWidth: 0, minHeight: 26, padding: 0, color: colors.muted, fontFamily: 'Nunito_700Bold', fontSize: 13 },
  dineProfileInstagramPill: { alignSelf: 'flex-start', minHeight: 34, borderRadius: 17, borderWidth: 1, borderColor: 'rgba(214,41,118,0.26)', paddingHorizontal: 10, marginTop: 8, flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: 'rgba(255,253,247,0.72)' },
  dineProfileInstagramText: { color: colors.redDark, fontFamily: bodyFont, fontSize: 13 },
  dineProfileStatsCard: { minHeight: 116, borderRadius: 18, backgroundColor: 'rgba(255,253,247,0.84)', borderWidth: 1, borderColor: 'rgba(40,40,43,0.10)', flexDirection: 'row', alignItems: 'center', marginBottom: 18, shadowColor: colors.ink, shadowOpacity: 0.08, shadowRadius: 16, elevation: 3 },
  dineProfileStatItem: { flex: 1, minHeight: 82, alignItems: 'center', justifyContent: 'center', gap: 4 },
  dineProfileStatDivider: { borderLeftWidth: 1, borderLeftColor: colors.line },
  dineProfileStatValue: { color: colors.ink, fontFamily: bodyFont, fontSize: 24, lineHeight: 27 },
  dineProfileStatLabel: { color: colors.muted, fontFamily: 'Nunito_400Regular', fontSize: 13, lineHeight: 16, textAlign: 'center' },
  dineProfileLevelCard: { minHeight: 146, borderRadius: 18, backgroundColor: '#321D12', padding: 18, flexDirection: 'row', alignItems: 'center', gap: 18, marginBottom: 22, overflow: 'hidden' },
  dineProfileMedal: { width: 96, height: 96, borderRadius: 24, backgroundColor: '#9A4E28', borderWidth: 3, borderColor: '#D98A4C', alignItems: 'center', justifyContent: 'center' },
  dineProfileLevelCopy: { flex: 1, minWidth: 0 },
  dineProfileLevelSmall: { color: colors.card, fontFamily: bodyFont, fontSize: 15, marginBottom: 6 },
  dineProfileLevelTitleRow: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  dineProfileLevelTitle: { color: colors.card, fontFamily: bodyFont, fontSize: 27, lineHeight: 32 },
  dineProfileProgressTrack: { height: 9, borderRadius: 999, backgroundColor: 'rgba(255,255,255,0.18)', overflow: 'hidden', marginTop: 13 },
  dineProfileProgressFill: { height: '100%', borderRadius: 999, backgroundColor: '#F16D2B' },
  dineProfileLevelMeta: { color: 'rgba(255,255,255,0.88)', fontFamily: 'Nunito_400Regular', fontSize: 13, marginTop: 9 },
  dineProfileSectionHeader: { minHeight: 36, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: 8, marginBottom: 10 },
  dineProfileSectionTitleRow: { flexDirection: 'row', alignItems: 'center', gap: 9 },
  dineProfileSectionTitle: { color: colors.ink, fontFamily: bodyFont, fontSize: 17 },
  dineProfileSeeAll: { color: colors.redDark, fontFamily: bodyFont, fontSize: 14 },
  dineProfilePreferenceRow: { gap: 12, paddingBottom: 12 },
  dineProfilePreferencesInput: { minHeight: 46, borderRadius: 21, borderWidth: 1, borderColor: colors.line, backgroundColor: 'rgba(255,253,247,0.78)', paddingHorizontal: 14, color: colors.ink, fontFamily: 'Nunito_400Regular', fontSize: 14, marginBottom: 10 },
  dineProfilePreferenceCard: { minHeight: 82, borderRadius: 18, borderWidth: 1, borderStyle: 'dashed', borderColor: 'rgba(200,70,37,0.48)', backgroundColor: 'rgba(255,253,247,0.58)', padding: 13, flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 14 },
  dineProfilePreferenceCardIcon: { width: 44, height: 44, borderRadius: 22, backgroundColor: '#FFF1E8', alignItems: 'center', justifyContent: 'center' },
  dineProfilePreferenceCardCopy: { flex: 1, minWidth: 0, gap: 3 },
  dineProfilePreferenceCardTitle: { color: colors.ink, fontFamily: bodyFont, fontSize: 15 },
  dineProfilePreferenceCardText: { color: colors.muted, fontFamily: 'Nunito_400Regular', fontSize: 13, lineHeight: 17 },
  dineProfilePreferenceChip: { minHeight: 42, borderRadius: 21, borderWidth: 1, borderColor: colors.line, backgroundColor: 'rgba(255,253,247,0.78)', paddingHorizontal: 14, flexDirection: 'row', alignItems: 'center', gap: 8 },
  dineProfilePreferenceEmoji: { fontSize: 18 },
  dineProfilePreferenceText: { color: colors.ink, fontFamily: 'Nunito_700Bold', fontSize: 14 },
  dineProfileReviewRow: { gap: 12, paddingBottom: 12 },
  dineProfileReviewCard: { width: 132, overflow: 'hidden', borderRadius: 12, backgroundColor: colors.card, borderWidth: 1, borderColor: colors.line },
  dineProfileReviewImage: { width: '100%', height: 82, backgroundColor: colors.surface },
  dineProfileReviewBody: { padding: 8, gap: 2 },
  dineProfileReviewName: { color: colors.ink, fontFamily: bodyFont, fontSize: 13 },
  dineProfileReviewMeta: { color: colors.muted, fontFamily: 'Nunito_400Regular', fontSize: 12 },
  dineProfileReviewRating: { flexDirection: 'row', alignItems: 'center', gap: 3, marginTop: 2 },
  dineProfileReviewRatingText: { color: colors.ink, fontFamily: 'Nunito_700Bold', fontSize: 12 },
  dineProfileEmptyCard: { minHeight: 74, borderRadius: 14, borderWidth: 1, borderColor: colors.line, backgroundColor: 'rgba(255,253,247,0.78)', alignItems: 'center', justifyContent: 'center', padding: 14, marginBottom: 10 },
  dineProfileEmptyText: { color: colors.muted, fontFamily: 'Nunito_400Regular', fontSize: 14, textAlign: 'center' },
  dineProfileBadgeRow: { gap: 15, paddingBottom: 14 },
  dineProfileBadgeItem: { width: 84, alignItems: 'center', gap: 8 },
  dineProfileBadgeMedal: { width: 64, height: 64, borderRadius: 32, borderWidth: 3, borderColor: '#D68A31', alignItems: 'center', justifyContent: 'center' },
  dineProfileBadgeMedalLocked: { backgroundColor: colors.muted, borderColor: colors.line, opacity: 0.62 },
  dineProfileBadgeLabel: { color: colors.ink, fontFamily: 'Nunito_400Regular', fontSize: 12, lineHeight: 15, textAlign: 'center' },
  dineProfileEditButton: { minHeight: 58, borderRadius: 13, backgroundColor: colors.redDark, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 10, marginTop: 16 },
  dineProfileEditButtonText: { color: colors.card, fontFamily: bodyFont, fontSize: 22 },
  profileTop: { flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'flex-end' },
  profileHeader: { flexDirection: 'row', alignItems: 'center', gap: 24, marginBottom: 18 },
  profileAvatar: { width: 112, height: 112, borderRadius: 56, backgroundColor: colors.olive, alignItems: 'center', justifyContent: 'center' },
  profileAvatarImage: { width: 112, height: 112, borderRadius: 56 },
  profileAvatarText: { color: colors.card, fontFamily: titleFont, fontWeight: '900', fontSize: 54 },
  avatarEdit: { position: 'absolute', right: -2, bottom: 4, width: 40, height: 40, borderRadius: 20, backgroundColor: colors.card, borderWidth: 1, borderColor: colors.line, alignItems: 'center', justifyContent: 'center' },
  profileNameWrap: { flex: 1 },
  profileName: { color: colors.ink, fontFamily: titleFont, fontWeight: '900', fontSize: 46, lineHeight: 52 },
  profileBio: { color: colors.muted, fontFamily: 'Nunito_400Regular', fontSize: 17, lineHeight: 24 },
  profileSocialCard: { gap: 10, borderRadius: 18, backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.line, padding: 14, marginBottom: 18 },
  profileSocialLabelRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  profileSocialLabel: { color: colors.ink, fontFamily: bodyFont, fontSize: 15 },
  profileSocialInputRow: { minHeight: 46, borderRadius: 14, backgroundColor: colors.card, borderWidth: 1, borderColor: colors.line, paddingLeft: 12, paddingRight: 4, flexDirection: 'row', alignItems: 'center', gap: 8 },
  profileSocialInput: { flex: 1, minWidth: 0, color: colors.ink, fontFamily: 'Nunito_400Regular', fontSize: 14 },
  profileSocialSave: { minHeight: 38, borderRadius: 12, backgroundColor: colors.redDark, paddingHorizontal: 13, alignItems: 'center', justifyContent: 'center' },
  profileSocialSaveText: { color: colors.card, fontFamily: bodyFont, fontSize: 13 },
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
  dinePlusHero: { gap: 14, padding: 18, borderRadius: 22, backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.line, marginBottom: 18 },
  dinePlusHeroTop: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 10 },
  dinePlusBadge: { minHeight: 32, paddingHorizontal: 12, borderRadius: 16, backgroundColor: colors.redDark, flexDirection: 'row', alignItems: 'center', gap: 6 },
  dinePlusBadgeText: { color: colors.card, fontFamily: bodyFont, fontSize: 12 },
  dinePlusHeroLabel: { color: colors.muted, fontFamily: 'Nunito_700Bold', fontSize: 13 },
  dinePlusTitle: { color: colors.ink, fontFamily: titleFont, fontWeight: '900', fontSize: 36, lineHeight: 40 },
  dinePlusText: { color: colors.muted, fontFamily: 'Nunito_400Regular', fontSize: 15, lineHeight: 22 },
  dinePlusHeroActions: { flexDirection: 'row', gap: 10, flexWrap: 'wrap' },
  dinePlusPrimaryButton: { minHeight: 46, paddingHorizontal: 16, borderRadius: 14, backgroundColor: colors.redDark, alignItems: 'center', justifyContent: 'center', flexDirection: 'row' },
  dinePlusPrimaryButtonText: { color: colors.card, fontFamily: bodyFont, fontSize: 14 },
  dinePlusSecondaryButton: { minHeight: 46, paddingHorizontal: 16, borderRadius: 14, backgroundColor: colors.card, borderWidth: 1, borderColor: colors.line, alignItems: 'center', justifyContent: 'center', flexDirection: 'row' },
  dinePlusSecondaryButtonText: { color: colors.ink, fontFamily: bodyFont, fontSize: 14 },
  dinePlusStatsRow: { flexDirection: 'row', gap: 10, marginBottom: 18 },
  dinePlusStat: { flex: 1, minWidth: 0, borderRadius: 16, backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.line, padding: 12, alignItems: 'center', justifyContent: 'center' },
  dinePlusStatValue: { color: colors.ink, fontFamily: bodyFont, fontSize: 18 },
  dinePlusStatLabel: { color: colors.muted, fontFamily: 'Nunito_400Regular', fontSize: 11, marginTop: 2 },
  dinePlusPerksList: { gap: 10, marginBottom: 18 },
  dinePlusPerkItem: { flexDirection: 'row', alignItems: 'center', gap: 12, padding: 14, borderRadius: 16, backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.line },
  dinePlusPerkIcon: { width: 36, height: 36, borderRadius: 18, backgroundColor: colors.greenSoft, alignItems: 'center', justifyContent: 'center' },
  dinePlusCardsRow: { gap: 10, marginBottom: 18 },
  dinePlusCard: { gap: 8, borderRadius: 18, backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.line, padding: 16 },
  ownerCard: { overflow: 'hidden', borderRadius: 24, backgroundColor: colors.card, borderWidth: 1, borderColor: colors.line, paddingBottom: 16, marginBottom: 16, gap: 14, shadowColor: '#1f1b18', shadowOpacity: 0.08, shadowRadius: 16, elevation: 4 },
  ownerHeroImage: { width: '100%', aspectRatio: 1.85, backgroundColor: colors.surface },
  ownerProfileRow: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingHorizontal: 16 },
  ownerAvatarRing: { width: 88, height: 88, borderRadius: 44, borderWidth: 2, borderColor: colors.redDark, alignItems: 'center', justifyContent: 'center' },
  ownerAvatarFrame: { width: 78, height: 78, borderRadius: 39, overflow: 'hidden', backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.line, alignItems: 'center', justifyContent: 'center' },
  ownerAvatar: { width: '100%', height: '100%' },
  ownerAvatarFallback: { position: 'absolute', color: colors.redDark, fontFamily: bodyFont, fontSize: 30 },
  ownerProfileStats: { flex: 1, minWidth: 0, flexDirection: 'row', justifyContent: 'space-between', gap: 6 },
  ownerStat: { alignItems: 'center', flex: 1, minWidth: 0 },
  ownerStatValue: { color: colors.ink, fontFamily: bodyFont, fontSize: 18, lineHeight: 20 },
  ownerStatLabel: { color: colors.muted, fontFamily: 'Nunito_400Regular', fontSize: 11, marginTop: 2 },
  ownerProfileBody: { gap: 4, paddingHorizontal: 16 },
  ownerCardTitle: { color: colors.ink, fontFamily: titleFont, fontWeight: '900', fontSize: 24, lineHeight: 28 },
  ownerCardMeta: { color: colors.muted, fontFamily: 'Nunito_400Regular', fontSize: 13, lineHeight: 18 },
  ownerCardBio: { color: colors.ink, fontFamily: 'Nunito_400Regular', fontSize: 14, lineHeight: 20 },
  ownerStoryRow: { flexDirection: 'row', gap: 10, paddingHorizontal: 16, paddingVertical: 2 },
  ownerStoryItem: { width: 72, alignItems: 'center', gap: 6 },
  ownerStoryRing: { width: 58, height: 58, borderRadius: 29, borderWidth: 2, borderColor: colors.line, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.surface },
  ownerStoryNumber: { color: colors.ink, fontFamily: bodyFont, fontSize: 12 },
  ownerStoryChipText: { color: colors.muted, fontFamily: 'Nunito_400Regular', fontSize: 11, textAlign: 'center' },
  statusPill: { overflow: 'hidden', borderRadius: 12, backgroundColor: colors.greenSoft, color: colors.olive, fontFamily: bodyFont, fontSize: 12, paddingHorizontal: 10, paddingVertical: 5 },
  ownerButtonsRow: { flexDirection: 'row', gap: 10, paddingHorizontal: 16 },
  metricGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, paddingHorizontal: 16 },
  metricBox: { width: '48%', minHeight: 66, borderRadius: 14, backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.line, padding: 10, justifyContent: 'center', gap: 4 },
  metricValue: { color: colors.ink, fontFamily: bodyFont, fontSize: 22, lineHeight: 24 },
  metricLabel: { color: colors.muted, fontFamily: 'Nunito_400Regular', fontSize: 12 },
  ownerTabRow: { flexDirection: 'row', paddingHorizontal: 16, borderTopWidth: 1, borderTopColor: colors.line, borderBottomWidth: 1, borderBottomColor: colors.line },
  ownerTab: { flex: 1, minHeight: 46, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6 },
  ownerTabActive: { borderBottomWidth: 2, borderBottomColor: colors.ink },
  ownerTabText: { color: colors.muted, fontFamily: bodyFont, fontSize: 13 },
  ownerTabTextActive: { color: colors.ink },
  ownerGrid: { flexDirection: 'row', flexWrap: 'wrap', paddingHorizontal: 16, paddingTop: 12, gap: 0 },
  ownerGridTile: { flexBasis: '33.3333%', maxWidth: '33.3333%', flexGrow: 0, flexShrink: 0, aspectRatio: 1, backgroundColor: colors.surface, overflow: 'hidden', position: 'relative' },
  ownerGridImage: { width: '100%', height: '100%' },
  ownerGridOverlay: { position: 'absolute', right: 8, top: 8, minWidth: 22, height: 22, borderRadius: 11, backgroundColor: 'rgba(255,255,255,0.92)', flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 4, paddingHorizontal: 6 },
  ownerGridCount: { color: colors.ink, fontFamily: bodyFont, fontSize: 11 },
  ownerGridLikedBadge: { position: 'absolute', left: 8, bottom: 8, width: 20, height: 20, borderRadius: 10, backgroundColor: colors.redDark, alignItems: 'center', justifyContent: 'center' },
  postViewerBackdrop: { flex: 1, backgroundColor: 'rgba(14,14,16,0.68)', justifyContent: 'center', padding: 14 },
  postViewerSheet: { borderRadius: 22, overflow: 'hidden', backgroundColor: colors.bg, borderWidth: 1, borderColor: colors.line },
  postViewerImage: { width: '100%', aspectRatio: 1, backgroundColor: colors.surface },
  postViewerTopBar: { position: 'absolute', top: Platform.OS === 'ios' ? 14 : 10, left: 14, right: 14, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  postViewerIconButton: { width: 40, height: 40, borderRadius: 20, backgroundColor: 'rgba(255,253,247,0.92)', borderWidth: 1, borderColor: colors.line, alignItems: 'center', justifyContent: 'center' },
  postViewerBody: { gap: 12, padding: 14 },
  postViewerHeader: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  postViewerAvatar: { width: 42, height: 42, borderRadius: 21, overflow: 'hidden', backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.line },
  postViewerAvatarImage: { width: '100%', height: '100%' },
  postViewerHeaderCopy: { flex: 1, minWidth: 0 },
  postViewerTitle: { color: colors.ink, fontFamily: bodyFont, fontSize: 15 },
  postViewerMeta: { color: colors.muted, fontFamily: 'Nunito_400Regular', fontSize: 12, marginTop: 1 },
  postViewerLikeCount: { color: colors.redDark, fontFamily: bodyFont, fontSize: 14 },
  postViewerDishTitle: { color: colors.ink, fontFamily: titleFont, fontWeight: '900', fontSize: 26, lineHeight: 30 },
  postViewerCaption: { color: colors.ink, fontFamily: 'Nunito_400Regular', fontSize: 14, lineHeight: 20 },
  postViewerChips: { flexDirection: 'row', gap: 8, flexWrap: 'wrap' },
  postViewerChip: { borderRadius: 999, backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.line, paddingHorizontal: 10, paddingVertical: 6 },
  postViewerChipText: { color: colors.ink, fontFamily: 'Nunito_700Bold', fontSize: 12 },
  postViewerAction: { minHeight: 48, marginHorizontal: 14, marginBottom: 14, borderRadius: 14, backgroundColor: colors.redDark, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8 },
  postViewerActionText: { color: colors.card, fontFamily: bodyFont, fontSize: 14 },
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
  detailBackdrop: { flex: 1, backgroundColor: colors.bg },
  detailSheet: { flex: 1, backgroundColor: colors.bg },
  detailSheetContent: { paddingBottom: 34 },
  detailBannerWrap: { position: 'relative' },
  detailBanner: { width: '100%', aspectRatio: 1.4, backgroundColor: colors.surface },
  detailTopActions: { position: 'absolute', top: Platform.OS === 'ios' ? 54 : 28, left: 18, right: 18, zIndex: 4, flexDirection: 'row', justifyContent: 'space-between' },
  detailRightActions: { flexDirection: 'row', gap: 10 },
  floatButton: { width: 50, height: 50, borderRadius: 25, backgroundColor: 'rgba(255,253,247,0.96)', alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: colors.line },
  detailAvatarWrap: { position: 'absolute', left: 20, bottom: -42 },
  detailAvatarRing: { width: 92, height: 92, borderRadius: 46, borderWidth: 2, borderColor: colors.redDark, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.bg },
  detailAvatarFrame: { width: 80, height: 80, borderRadius: 40, overflow: 'hidden', backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.line, alignItems: 'center', justifyContent: 'center' },
  detailAvatarImage: { width: '100%', height: '100%' },
  detailProfileSection: { paddingHorizontal: 18, paddingTop: 56, gap: 18 },
  detailProfileHeader: { flexDirection: 'row', alignItems: 'flex-start', gap: 12 },
  detailProfileCopy: { flex: 1, minWidth: 0, gap: 4 },
  detailTitle: { color: colors.ink, fontFamily: titleFont, fontWeight: '900', fontSize: 28, lineHeight: 31 },
  detailSub: { color: colors.muted, fontFamily: 'Nunito_700Bold', fontSize: 14, lineHeight: 18 },
  detailBio: { color: colors.ink, fontFamily: 'Nunito_400Regular', fontSize: 14, lineHeight: 20 },
  detailScoreBadge: { minWidth: 66, minHeight: 66, borderRadius: 18, backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.line, alignItems: 'center', justifyContent: 'center', gap: 2, paddingHorizontal: 8 },
  detailScoreValue: { color: colors.ink, fontFamily: bodyFont, fontSize: 18, lineHeight: 20 },
  detailScoreCount: { color: colors.muted, fontFamily: 'Nunito_400Regular', fontSize: 11 },
  detailStatsRow: { flexDirection: 'row', gap: 10 },
  detailStat: { flex: 1, minWidth: 0, borderRadius: 16, backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.line, paddingVertical: 12, alignItems: 'center', justifyContent: 'center' },
  detailStatValue: { color: colors.ink, fontFamily: bodyFont, fontSize: 20, lineHeight: 22 },
  detailStatLabel: { color: colors.muted, fontFamily: 'Nunito_400Regular', fontSize: 11, marginTop: 2 },
  detailActionRow: { flexDirection: 'row', gap: 8, flexWrap: 'wrap' },
  detailActionButton: { minHeight: 44, flexGrow: 1, flexBasis: '30%', borderRadius: 14, borderWidth: 1, borderColor: colors.line, backgroundColor: colors.card, paddingHorizontal: 12, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8 },
  detailActionButtonActive: { backgroundColor: colors.redDark, borderColor: colors.redDark },
  detailActionButtonText: { color: colors.ink, fontFamily: bodyFont, fontSize: 13 },
  detailActionButtonTextActive: { color: colors.card },
  detailStoryRow: { flexDirection: 'row', gap: 10 },
  detailStoryItem: { width: 72, alignItems: 'center', gap: 6 },
  detailStoryRing: { width: 58, height: 58, borderRadius: 29, borderWidth: 2, borderColor: colors.line, backgroundColor: colors.surface, alignItems: 'center', justifyContent: 'center' },
  detailStoryText: { color: colors.muted, fontFamily: 'Nunito_400Regular', fontSize: 11, lineHeight: 14, textAlign: 'center' },
  detailTabRow: { flexDirection: 'row', borderTopWidth: 1, borderTopColor: colors.line, borderBottomWidth: 1, borderBottomColor: colors.line },
  detailTabButton: { flex: 1, minHeight: 48, alignItems: 'center', justifyContent: 'center' },
  detailTabText: { color: colors.muted, fontFamily: bodyFont, fontSize: 13 },
  detailTabTextActive: { color: colors.ink },
  detailTabUnderline: { width: '100%', height: 2, marginTop: 8, backgroundColor: 'transparent' },
  detailTabUnderlineActive: { backgroundColor: colors.ink },
  detailGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 0, backgroundColor: colors.line },
  detailGridTile: { flexBasis: '33.3333%', maxWidth: '33.3333%', flexGrow: 0, flexShrink: 0, aspectRatio: 1, backgroundColor: colors.surface, position: 'relative', overflow: 'hidden' },
  detailGridImage: { width: '100%', height: '100%' },
  detailGridOverlay: { position: 'absolute', right: 8, top: 8, width: 22, height: 22, borderRadius: 11, backgroundColor: 'rgba(0,0,0,0.48)', alignItems: 'center', justifyContent: 'center' },
  detailGridFooter: { position: 'absolute', left: 0, right: 0, bottom: 0, paddingHorizontal: 8, paddingVertical: 7, backgroundColor: 'rgba(0,0,0,0.38)', flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 6 },
  detailGridTitle: { flex: 1, minWidth: 0, color: colors.card, fontFamily: bodyFont, fontSize: 11 },
  detailGridMeta: { color: 'rgba(255,255,255,0.82)', fontFamily: 'Nunito_400Regular', fontSize: 10 },
  detailAboutSection: { gap: 14 },
  detailAboutButtons: { flexDirection: 'row', gap: 10, flexWrap: 'wrap' },
  detailSecondaryButton: { minHeight: 44, borderRadius: 14, borderWidth: 1, borderColor: colors.line, backgroundColor: colors.surface, paddingHorizontal: 14, alignItems: 'center', justifyContent: 'center' },
  detailSecondaryButtonText: { color: colors.ink, fontFamily: bodyFont, fontSize: 13 },
  detailText: { color: colors.ink, fontFamily: 'Nunito_400Regular', fontSize: 16, lineHeight: 24 },
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
  detailAddress: { color: colors.muted, fontFamily: bodyFont, fontSize: 13 },  authSheet: { marginTop: 'auto', borderTopLeftRadius: 28, borderTopRightRadius: 28, backgroundColor: colors.bg, padding: 18, paddingTop: 28, gap: 12 },
  fieldLabel: { color: colors.muted, fontSize: 12, fontFamily: bodyFont },
  fieldInput: { minHeight: 48, borderRadius: 16, borderWidth: 1, borderColor: colors.line, backgroundColor: colors.surface, paddingHorizontal: 13, color: colors.ink, fontFamily: bodyFont },
  infoSheet: { marginTop: 'auto', borderTopLeftRadius: 28, borderTopRightRadius: 28, backgroundColor: colors.bg, padding: 22, paddingTop: 30, gap: 14 },
  infoCloseButton: { position: 'absolute', top: 14, right: 14, zIndex: 2, width: 42, height: 42, borderRadius: 21, backgroundColor: colors.surface, alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: colors.line },
  infoTitle: { color: colors.ink, fontFamily: titleFont, fontWeight: '900', fontSize: 34, lineHeight: 38, paddingRight: 46 },
  infoSubtitle: { color: colors.muted, fontFamily: 'Nunito_400Regular', fontSize: 16, lineHeight: 23, paddingRight: 18 },
  infoList: { gap: 10, marginTop: 8 },
  infoRow: { minHeight: 56, borderRadius: 16, backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.line, flexDirection: 'row', alignItems: 'center', gap: 10, paddingHorizontal: 14, marginBottom: 10 },
  infoRowText: { flex: 1, color: colors.ink, fontFamily: bodyFont, fontSize: 14, lineHeight: 19 },
  preferencePickerPanel: { borderRadius: 18, backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.line, padding: 16, marginBottom: 14, gap: 4 },
  preferencePickerTitle: { color: colors.ink, fontFamily: bodyFont, fontSize: 19 },
  preferencePickerText: { color: colors.muted, fontFamily: 'Nunito_400Regular', fontSize: 14 },
  preferencePickerGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  preferencePickerChip: { minHeight: 42, borderRadius: 21, borderWidth: 1, borderColor: colors.line, backgroundColor: colors.surface, paddingHorizontal: 13, flexDirection: 'row', alignItems: 'center', gap: 7 },
  preferencePickerChipActive: { backgroundColor: colors.redDark, borderColor: colors.redDark },
  preferencePickerChipText: { color: colors.ink, fontFamily: bodyFont, fontSize: 14 },
  preferencePickerChipTextActive: { color: colors.card },
  preferenceDoneButton: { minHeight: 50, borderRadius: 16, backgroundColor: colors.redDark, alignItems: 'center', justifyContent: 'center', marginTop: 18 },
  preferenceDoneButtonText: { color: colors.card, fontFamily: bodyFont, fontSize: 15 },
  settingsHero: { minHeight: 78, borderRadius: 18, backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.line, padding: 12, flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 18 },
  settingsAvatar: { width: 54, height: 54, borderRadius: 27, backgroundColor: colors.olive, alignItems: 'center', justifyContent: 'center', overflow: 'hidden' },
  settingsAvatarImage: { width: '100%', height: '100%' },
  settingsAvatarText: { color: colors.card, fontFamily: bodyFont, fontSize: 22 },
  settingsHeroCopy: { flex: 1, minWidth: 0 },
  settingsHeroName: { color: colors.ink, fontFamily: bodyFont, fontSize: 17 },
  settingsHeroMeta: { color: colors.muted, fontFamily: 'Nunito_400Regular', fontSize: 13, marginTop: 2 },
  settingsSection: { marginBottom: 18 },
  settingsSectionTitle: { color: colors.muted, fontFamily: bodyFont, fontSize: 12, textTransform: 'uppercase', marginBottom: 8, paddingHorizontal: 2 },
  settingsList: { overflow: 'hidden', borderRadius: 18, backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.line },
  settingsRow: { minHeight: 68, paddingHorizontal: 13, paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: colors.softLine, flexDirection: 'row', alignItems: 'center', gap: 12 },
  settingsRowIcon: { width: 38, height: 38, borderRadius: 19, backgroundColor: '#FFF1E8', alignItems: 'center', justifyContent: 'center' },
  settingsRowCopy: { flex: 1, minWidth: 0 },
  settingsRowTitle: { color: colors.ink, fontFamily: bodyFont, fontSize: 15 },
  settingsRowSubtitle: { color: colors.muted, fontFamily: 'Nunito_400Regular', fontSize: 12, lineHeight: 16, marginTop: 2 },
  appearancePreview: { borderRadius: 20, borderWidth: 1, padding: 14, gap: 12, marginBottom: 18 },
  appearancePreviewTop: { minHeight: 92, borderRadius: 16, padding: 14, flexDirection: 'row', alignItems: 'center', gap: 12 },
  appearancePreviewLogo: { width: 44, height: 44, borderRadius: 22 },
  appearancePreviewLines: { flex: 1, gap: 8 },
  appearancePreviewLine: { height: 10, borderRadius: 999 },
  appearancePreviewButton: { minHeight: 42, borderRadius: 14, alignItems: 'center', justifyContent: 'center' },
  appearancePreviewButtonText: { color: colors.card, fontFamily: bodyFont, fontSize: 14 },
  appearanceSectionTitle: { marginTop: 18 },
  appearanceAccentGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  appearanceAccentButton: { width: '30%', minWidth: 92, borderRadius: 16, borderWidth: 1, borderColor: colors.line, backgroundColor: colors.surface, padding: 10, alignItems: 'center', gap: 8 },
  appearanceAccentSwatch: { width: 36, height: 36, borderRadius: 18, alignItems: 'center', justifyContent: 'center' },
  appearanceAccentLabel: { color: colors.ink, fontFamily: bodyFont, fontSize: 12 },
  inviteCodeText: { color: colors.ink, fontFamily: bodyFont, fontSize: 18, lineHeight: 22 },
  inviteStatsRow: { flexDirection: 'row', gap: 10 },
  inviteStatCard: { flex: 1, borderRadius: 16, borderWidth: 1, borderColor: colors.line, backgroundColor: colors.card, padding: 12 },
  inviteStatValue: { color: colors.ink, fontFamily: bodyFont, fontSize: 22, lineHeight: 26 },
  inviteStatLabel: { color: colors.muted, fontFamily: 'Nunito_400Regular', fontSize: 12 },
  helpArticleHeader: { flexDirection: 'row', alignItems: 'flex-start', gap: 12 },
  settingsToggle: { width: 48, height: 28, borderRadius: 14, backgroundColor: 'rgba(40,40,43,0.12)', padding: 3, justifyContent: 'center' },
  settingsToggleActive: { backgroundColor: colors.redDark },
  settingsToggleThumb: { width: 22, height: 22, borderRadius: 11, backgroundColor: colors.card },
  settingsToggleThumbActive: { transform: [{ translateX: 20 }] },
  optionRadio: { width: 30, height: 30, borderRadius: 15, borderWidth: 1, borderColor: colors.line, backgroundColor: colors.card, alignItems: 'center', justifyContent: 'center' },
  optionRadioActive: { backgroundColor: colors.redDark, borderColor: colors.redDark },
  authFullBackdrop: { flex: 1, backgroundColor: colors.bg },
  authFullScreen: { minHeight: '100%', paddingHorizontal: 20, paddingTop: Platform.OS === 'ios' ? 68 : 44, paddingBottom: 28, justifyContent: 'center', backgroundColor: colors.bg },
  authFullForm: { width: '100%', gap: 12, paddingBottom: 8 },
  settingsDangerZone: { marginTop: 2, marginBottom: 20 },
  settingsLogoutButton: { minHeight: 50, borderRadius: 16, borderWidth: 1, borderColor: 'rgba(200,70,37,0.28)', backgroundColor: colors.surface, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8 },
  settingsLogoutText: { color: colors.redDark, fontFamily: bodyFont, fontSize: 14 }
});











