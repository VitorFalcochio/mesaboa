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
  fetchFeedDataFromDb,
  fetchProfileSocialStatsFromDb,
  fetchRestaurantsFromDb,
  fetchSocialStateFromDb,
  fetchReservationStateFromDb,
  supabaseReady,
  supabaseAuthEnabled,
  getSupabaseCurrentUser,
  signInWithSupabase,
  signOutFromSupabase,
  signUpWithSupabase,
  addFeedCommentToDb,
  blockAccountInDb,
  claimRestaurantInDb,
  createInviteLinkInDb,
  createFeedPostInDb,
  deleteFeedPostInDb,
  createRestaurantInDb,
  deleteUserAccountInDb,
  reportContentInDb,
  createAppNotificationInDb,
  recordRestaurantMetricInDb,
  registerPushTokenInDb,
  saveFavoritesToDb,
  saveReviewToDb,
  saveRestaurantToDb,
  saveReservationToDb,
  saveWaitlistEntryToDb,
  saveUserProfileToDb,
  seedRestaurantsIfEmpty,
  uploadFeedPhoto,
  uploadRestaurantAsset,
  uploadUserProfilePhoto,
  updateRestaurantInDb,
  updateReservationStatusSecureInDb,
  updateRestaurantStatusInDb,
  updateReviewInDb,
  setFeedReactionInDb,
  setProfileFollowInDb,
  markAppNotificationsReadInDb
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
import {
  defaultAddressCity,
  defaultAddressState,
  extractAddressNumber,
  formatAddressLabel,
  formatCep,
  lookupAddressByCep,
  onlyAddressDigits,
  searchAddresses
} from './src/addressLookup';
import {
  nextReservationDates,
  reservationSettingsFor,
  reservationSlotsForDate,
  reservationStatusColor,
  reservationStatusLabel,
  reservationWeekDays,
  waitlistStatusLabel
} from './src/reservations';

const colors = {
  bg: '#FFFDF9',
  surface: '#FFFFFF',
  cream: '#FFF7F1',
  red: '#F24A18',
  redDark: '#F13D0B',
  ochre: '#E99A22',
  olive: '#2E8B57',
  teal: '#267A78',
  ink: '#1B1B1B',
  text: '#1B1B1B',
  muted: '#6F6A66',
  card: '#FFFFFF',
  line: 'rgba(27, 27, 27, 0.12)',
  softLine: 'rgba(27, 27, 27, 0.07)',
  green: '#218A4B',
  greenSoft: '#EAF7EF',
  gold: '#E99A22',
  orange: '#F24A18',
  navy: '#1B1B1B',
  bordeaux: '#B83250',
  mustard: '#DFA528',
  pistachio: '#64A65C',
  lavender: '#6579A8',
  coral: '#F06B4F'
};

const appearancePalettes = {
  light: {
    bg: '#FFFDF9',
    surface: '#FFFFFF',
    nav: 'rgba(255,255,255,0.98)',
    ink: '#1B1B1B',
    muted: '#6F6A66',
    line: 'rgba(27, 27, 27, 0.12)',
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
    bg: '#FFFDF9',
    surface: '#FFFFFF',
    nav: 'rgba(255,255,255,0.98)',
    ink: '#1B1B1B',
    muted: '#6F6A66',
    line: 'rgba(27, 27, 27, 0.12)',
    statusBar: 'dark'
  }
};

const accentPalettes = {
  dine: '#F13D0B',
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

const titleFont = 'Nunito_800ExtraBold';
const bodyFont = 'Nunito_700Bold';

const dineLogo = require('./Designer/Logos/2.png');
const authFoodImage = require('./assets/auth-login-food.jpg');
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

function initialsForName(name, fallback = 'D') {
  const words = String(name || '').trim().split(/\s+/).filter(Boolean);
  if (!words.length) return fallback;
  return words.slice(0, 2).map((word) => word.slice(0, 1).toUpperCase()).join('');
}

function postAuthorAvatar(post, currentUser) {
  const isCurrentUserPost = currentUser?.id && String(post?.authorId) === String(currentUser.id);
  if (isCurrentUserPost) return String(currentUser?.photo || '').trim();
  return String(post?.avatar || post?.authorProfile?.avatar || '').trim();
}

const NativeMaps = Platform.OS !== 'web' ? require('react-native-maps') : null;
const MapView = NativeMaps?.default;
const Marker = NativeMaps?.Marker;
const storageKeys = {
  restaurants: 'dineRestaurantsRN',
  favorites: 'dineFavoritesRN',
  users: 'dineUsersRN',
  currentUser: 'dineCurrentUserRN',
  restaurantCoordinates: 'dineRestaurantCoordinatesRN',
  feedPosts: 'dineFeedPostsRN',
  feedReactions: 'dineFeedReactionsRN',
  onboardingSeen: 'dineOnboardingSeenRN',
  restaurantDraft: 'dineRestaurantDraftRN',
  reservations: 'dineReservationsRN',
  waitlist: 'dineWaitlistRN'
};
const restaurantCategoryOptions = ['Brasileira', 'Hamburgueria', 'Italiana', 'Japonesa', 'Pizzaria', 'Cafeteria', 'Bar', 'Doces'];
const restaurantPriceOptions = ['$', '$$', '$$$', '$$$$'];
const restaurantWeekDays = [
  ['monday', 'Segunda'],
  ['tuesday', 'Terça'],
  ['wednesday', 'Quarta'],
  ['thursday', 'Quinta'],
  ['friday', 'Sexta'],
  ['saturday', 'Sábado'],
  ['sunday', 'Domingo']
];
const homeRestaurantSectionLimit = 15;
const publicAppUrl = String(
  process.env.EXPO_PUBLIC_APP_URL
  || (Platform.OS === 'web' && typeof window !== 'undefined' ? window.location.origin : '')
).replace(/\/+$/, '');
const privacyPolicyUrl = String(process.env.EXPO_PUBLIC_PRIVACY_POLICY_URL || '').trim();
const supportEmail = String(process.env.EXPO_PUBLIC_SUPPORT_EMAIL || '').trim();
const supportWhatsApp = String(process.env.EXPO_PUBLIC_SUPPORT_WHATSAPP || '').replace(/\D/g, '');
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

const blockedContentTerms = [
  'puta',
  'foda-se',
  'caralho',
  'porra',
  'buceta',
  'cacete',
  'merda',
  'viado',
  'bicha',
  'preto imundo',
  'macaco',
  'racista',
  'nazista',
  'hitler',
  'matar',
  'estupro'
];

function moderationIssueForText(text) {
  const normalized = normalize(text);
  const matched = blockedContentTerms.find((term) => normalized.includes(normalize(term)));
  return matched ? 'Revise o texto antes de publicar. O Dine bloqueia ofensas, discurso de odio, ameacas e conteudo sexual explicito.' : '';
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
    const forceSeedBranding = ['bb-onca-burguers', 'losteria-rio-preto'].includes(seed.id);
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

function normalizeAccountType(value) {
  return value === 'restaurant_owner' ? 'restaurant_owner' : 'user';
}

function normalizeDemoAccount(user) {
  if (!user) return user;
  const normalizedUser = { ...user, accountType: normalizeAccountType(user.accountType) };
  if (!demoDataEnabled) return normalizedUser;
  if (normalize(normalizedUser.email) !== normalize(demoAccountEmail)) return normalizedUser;
  const demoSeed = seedUsers.find((item) => normalize(item.email) === normalize(demoAccountEmail));
  return {
    ...(demoSeed || {}),
    ...normalizedUser,
    id: demoAccountId,
    name: demoAccountName,
    email: demoAccountEmail,
    accountType: normalizeAccountType(normalizedUser.accountType || demoSeed?.accountType),
    gamification: mergeGamification(normalizedUser.gamification || demoSeed?.gamification)
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

function AppButton({ children, kind = 'primary', onPress, style, disabled = false }) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ disabled }}
      disabled={disabled}
      hitSlop={6}
      onPress={onPress}
      style={({ pressed }) => [styles.button, styles[`${kind}Button`], disabled && styles.buttonDisabled, pressed && styles.pressed, style]}
    >
      <Text style={[styles.buttonText, styles[`${kind}ButtonText`]]}>{children}</Text>
    </Pressable>
  );
}

function isValidEmail(value) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(value || '').trim());
}

function formatPostDate(value) {
  if (!value) return 'Publicacao recente';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return 'Publicacao recente';
  return date.toLocaleDateString('pt-BR', { day: '2-digit', month: 'short', year: 'numeric' });
}

function commentsForPost(post, reaction = {}) {
  return [...(post?.comments || []), ...(reaction?.comments || [])].reduce((items, comment) => (
    items.some((item) => String(item.id) === String(comment.id)) ? items : [...items, comment]
  ), []);
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
  const street = [item?.addressStreet, item?.addressNumber].filter(Boolean).join(', ')
    || String(item?.address || '').replace(/\s*·\s*/g, ', ');
  const parts = [street, item?.district, item?.city || defaultAddressCity, item?.state || defaultAddressState, item?.cep, 'Brasil']
    .map((value) => String(value || '').trim())
    .filter(Boolean);
  return parts.join(', ');
}

const dineNativeMapStyle = [
  { elementType: 'geometry', stylers: [{ color: '#F4F2ED' }] },
  { elementType: 'labels.text.fill', stylers: [{ color: '#626462' }] },
  { elementType: 'labels.text.stroke', stylers: [{ color: '#FAF9F6' }] },
  { featureType: 'administrative', elementType: 'geometry.stroke', stylers: [{ color: '#C8CECB' }] },
  { featureType: 'landscape.natural', elementType: 'geometry', stylers: [{ color: '#EEF1E8' }] },
  { featureType: 'poi', elementType: 'geometry', stylers: [{ color: '#E8EFE5' }] },
  { featureType: 'poi.business', stylers: [{ visibility: 'off' }] },
  { featureType: 'poi.park', elementType: 'geometry', stylers: [{ color: '#D5E9D3' }] },
  { featureType: 'road', elementType: 'geometry', stylers: [{ color: '#FFFFFF' }] },
  { featureType: 'road', elementType: 'geometry.stroke', stylers: [{ color: '#D8DFE0' }] },
  { featureType: 'road.highway', elementType: 'geometry', stylers: [{ color: '#F3CFC2' }] },
  { featureType: 'road.highway', elementType: 'geometry.stroke', stylers: [{ color: '#E4B3A3' }] },
  { featureType: 'transit', elementType: 'geometry', stylers: [{ color: '#DCE4E4' }] },
  { featureType: 'water', elementType: 'geometry', stylers: [{ color: '#BDDCE2' }] },
  { featureType: 'water', elementType: 'labels.text.fill', stylers: [{ color: '#527B84' }] }
];

const webMapTileSize = 256;

function webMapZoom(region) {
  const delta = Math.max(Number(region?.latitudeDelta || rioPretoRegion.latitudeDelta), Number(region?.longitudeDelta || rioPretoRegion.longitudeDelta));
  if (delta <= 0.025) return 15;
  if (delta <= 0.04) return 14;
  return 13;
}

function longitudeToTileX(longitude, zoom) {
  return ((Number(longitude) + 180) / 360) * (2 ** zoom);
}

function latitudeToTileY(latitude, zoom) {
  const latRad = Number(latitude) * Math.PI / 180;
  return (1 - Math.log(Math.tan(latRad) + (1 / Math.cos(latRad))) / Math.PI) / 2 * (2 ** zoom);
}

function tileXToLongitude(tileX, zoom) {
  return (tileX / (2 ** zoom)) * 360 - 180;
}

function tileYToLatitude(tileY, zoom) {
  const value = Math.PI - (2 * Math.PI * tileY) / (2 ** zoom);
  return (180 / Math.PI) * Math.atan(0.5 * (Math.exp(value) - Math.exp(-value)));
}

function webMapPoint(coordinate, region, width, height = 420) {
  const zoom = webMapZoom(region);
  const centerX = longitudeToTileX(region.longitude, zoom) * webMapTileSize;
  const centerY = latitudeToTileY(region.latitude, zoom) * webMapTileSize;
  const pointX = longitudeToTileX(coordinate.longitude, zoom) * webMapTileSize;
  const pointY = latitudeToTileY(coordinate.latitude, zoom) * webMapTileSize;
  return {
    left: width / 2 + pointX - centerX,
    top: height / 2 + pointY - centerY
  };
}

async function geocodeRestaurantCoordinate(item) {
  const query = buildRestaurantGeocodeQuery(item);
  if (!query) return null;

  if (typeof Location?.geocodeAsync === 'function') {
    try {
      const results = await Location.geocodeAsync(query);
      const first = results?.[0];
      if (Number.isFinite(first?.latitude) && Number.isFinite(first?.longitude)) {
        return { latitude: first.latitude, longitude: first.longitude, source: 'device' };
      }
    } catch (error) {
      // Fallback below.
    }
  }

  try {
    const response = await fetch(`https://photon.komoot.io/api/?q=${encodeURIComponent(query)}&limit=1&lat=${rioPretoRegion.latitude}&lon=${rioPretoRegion.longitude}`, {
      headers: { Accept: 'application/json' }
    });
    if (response.ok) {
      const result = await response.json();
      const coordinates = result?.features?.[0]?.geometry?.coordinates;
      const longitude = Number(coordinates?.[0]);
      const latitude = Number(coordinates?.[1]);
      if (Number.isFinite(latitude) && Number.isFinite(longitude)) {
        return { latitude, longitude, source: 'photon' };
      }
    }
  } catch (error) {
    // Nominatim and CEP coordinate fallbacks below.
  }

  try {
    const street = [item?.addressStreet, item?.addressNumber].filter(Boolean).join(' ');
    const structuredQuery = street
      ? `street=${encodeURIComponent(street)}&city=${encodeURIComponent(item?.city || defaultAddressCity)}&state=${encodeURIComponent(item?.state || defaultAddressState)}&postalcode=${encodeURIComponent(item?.cep || '')}`
      : `q=${encodeURIComponent(query)}`;
    const response = await fetch(`https://nominatim.openstreetmap.org/search?format=jsonv2&limit=1&countrycodes=br&${structuredQuery}`, {
      headers: {
        Accept: 'application/json',
        'User-Agent': 'Dine/1.0'
      }
    });
    if (!response.ok) return null;
    const results = await response.json();
    const first = Array.isArray(results) ? results[0] : null;
    const latitude = Number(first?.lat);
    const longitude = Number(first?.lon);
    if (Number.isFinite(latitude) && Number.isFinite(longitude)) {
      return { latitude, longitude, source: 'nominatim' };
    }
  } catch (error) {
    // CEP coordinate fallback below.
  }

  const cepLatitude = Number(item?.cepLatitude);
  const cepLongitude = Number(item?.cepLongitude);
  if (Number.isFinite(cepLatitude) && Number.isFinite(cepLongitude)) {
    return { latitude: cepLatitude, longitude: cepLongitude, source: 'cep' };
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
    menuMode: item.menuMode || ((item.menuItems || []).length || item.menuPhoto ? 'now' : 'later'),
    photosText: (item.photos || []).map((photo) => photo.url).join('\n'),
    coverPhoto: item.coverPhoto || item.image || '',
    menuPhoto: item.menuPhoto || '',
    menuText: (item.menuItems || []).map((dish) => `${dish.name} | ${dish.price || ''}`).join('\n'),
    menuDraftItems: (item.menuItems || []).map((dish, index) => ({
      id: dish.id || `menu-${index}`,
      name: dish.name || '',
      description: dish.description || '',
      category: dish.category || '',
      price: String(dish.price || '').replace('.', ','),
      image: dish.image || ''
    })),
    openingHoursText: item.openingHours
      ? Object.entries(item.openingHours).map(([day, hours]) => `${day}: ${hours}`).join('\n')
      : '',
    openingHoursDraft: item.openingHours || {},
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

function matchesRestaurantQuery(item, query) {
  const needle = normalize(query);
  if (!needle) return true;
  if (needle.includes('aberto agora') && !getRestaurantOpenStatus(item).open) return false;
  if ((needle.includes('ate 80') || needle.includes('economico') || needle.includes('barato')) && !['$', '$$'].includes(item.price)) return false;
  const searchable = normalize([
    item.name,
    item.type,
    item.district,
    item.address,
    item.description,
    ...(item.tags || []),
    ...(item.highlights || []),
    ...(item.menuItems || []).map((dish) => `${dish.name || ''} ${dish.category || ''} ${dish.description || ''}`)
  ].join(' '));
  const intentions = [
    { terms: ['romantico', 'encontro', 'casal'], matches: ['romantico', 'vinho', 'italiana', 'bistro', 'jantar', 'aconchegante'] },
    { terms: ['crianca', 'criancas', 'familia'], matches: ['familia', 'infantil', 'kids', 'espaco', 'parque'] },
    { terms: ['trabalhar', 'reuniao', 'notebook'], matches: ['cafe', 'cafeteria', 'wifi', 'padaria', 'coworking'] },
    { terms: ['barato', 'economico', 'ate 80'], matches: ['lanche', 'padaria', 'self service', 'comida brasileira'] },
    { terms: ['doce', 'sobremesa'], matches: ['doce', 'sorvete', 'acai', 'cafe', 'confeitaria'] }
  ];
  const intent = intentions.find((group) => group.terms.some((term) => needle.includes(term)));
  const meaningfulWords = needle.split(' ').filter((word) => word.length > 2 && !['perto', 'mim', 'lugar', 'comida', 'restaurante', 'aberto', 'agora'].includes(word));
  if (intent && intent.matches.some((term) => searchable.includes(term))) return true;
  if (!meaningfulWords.length) return true;
  return meaningfulWords.every((word) => searchable.includes(word));
}

function PartnerMap({
  restaurants,
  onSelect,
  onFavorite,
  onDirections,
  onLocate,
  favoriteNames = [],
  postCountsByRestaurant = {},
  onInteractionChange,
  region,
  onRegionChange,
  userLocation,
  locationGranted
}) {
  const { width } = useWindowDimensions();
  const dragStartRef = useRef(null);
  const [webPanOffset, setWebPanOffset] = useState({ x: 0, y: 0 });
  const [selectedMapItem, setSelectedMapItem] = useState(null);
  const webMapWidth = Math.max(320, width);
  const webMapHeight = 510;
  const webMapRegion = region || rioPretoRegion;
  const webMapZoomLevel = webMapZoom(webMapRegion);
  const webMapCenterTileX = longitudeToTileX(webMapRegion.longitude, webMapZoomLevel);
  const webMapCenterTileY = latitudeToTileY(webMapRegion.latitude, webMapZoomLevel);
  const webMapCenterPixelX = webMapCenterTileX * webMapTileSize;
  const webMapCenterPixelY = webMapCenterTileY * webMapTileSize;
  useEffect(() => {
    if (!restaurants.length) {
      setSelectedMapItem(null);
      return;
    }
    if (!selectedMapItem || !restaurants.some((item) => item.id === selectedMapItem.id)) {
      setSelectedMapItem(restaurants[0]);
    }
  }, [restaurants, selectedMapItem]);
  const webTiles = [];
  for (let x = Math.floor(webMapCenterTileX) - 2; x <= Math.floor(webMapCenterTileX) + 2; x += 1) {
    for (let y = Math.floor(webMapCenterTileY) - 2; y <= Math.floor(webMapCenterTileY) + 2; y += 1) {
      webTiles.push({
        key: `${webMapZoomLevel}-${x}-${y}`,
        url: `https://tile.openstreetmap.org/${webMapZoomLevel}/${x}/${y}.png`,
        left: x * webMapTileSize - webMapCenterPixelX + webMapWidth / 2 + webPanOffset.x,
        top: y * webMapTileSize - webMapCenterPixelY + webMapHeight / 2 + webPanOffset.y
      });
    }
  }

  function webPointForItem(item, index) {
    const coordinate = item.coordinate || coordinateForRestaurant(item, index);
    const point = webMapPoint(coordinate, webMapRegion, webMapWidth, webMapHeight);
    return {
      left: point.left + webPanOffset.x,
      top: point.top + webPanOffset.y
    };
  }

  function webMapEventPoint(event) {
    const nativeEvent = event?.nativeEvent || {};
    return {
      x: Number(nativeEvent.pageX ?? nativeEvent.clientX ?? 0),
      y: Number(nativeEvent.pageY ?? nativeEvent.clientY ?? 0)
    };
  }

  function finishWebMapPan() {
    onInteractionChange?.(false);
    if (!dragStartRef.current || (!webPanOffset.x && !webPanOffset.y)) {
      dragStartRef.current = null;
      return;
    }
    const nextCenterX = webMapCenterPixelX - webPanOffset.x;
    const nextCenterY = webMapCenterPixelY - webPanOffset.y;
    onRegionChange?.({
      ...webMapRegion,
      latitude: tileYToLatitude(nextCenterY / webMapTileSize, webMapZoomLevel),
      longitude: tileXToLongitude(nextCenterX / webMapTileSize, webMapZoomLevel)
    });
    dragStartRef.current = null;
    setWebPanOffset({ x: 0, y: 0 });
  }

  function renderSelectedMapCard() {
    if (!selectedMapItem) return null;
    const openStatus = getRestaurantOpenStatus(selectedMapItem);
    const favorite = favoriteNames.includes(selectedMapItem.name);
    return (
      <View style={styles.selectedMapCard}>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={`Abrir restaurante ${selectedMapItem.name}`}
          onPress={() => onSelect(selectedMapItem)}
          style={styles.selectedMapMain}
        >
          <Image source={imageSource(selectedMapItem.coverPhoto || selectedMapItem.image || selectedMapItem.logo)} style={styles.selectedMapImage} />
          <View style={styles.selectedMapCopy}>
            <View style={styles.selectedMapTitleRow}>
              <Text numberOfLines={1} style={styles.selectedMapName}>{selectedMapItem.name}</Text>
              <Pressable
                accessibilityRole="button"
                accessibilityLabel={favorite ? 'Remover dos favoritos' : 'Salvar nos favoritos'}
                hitSlop={8}
                onPress={(event) => {
                  event?.stopPropagation?.();
                  onFavorite?.(selectedMapItem.name);
                }}
                style={styles.selectedMapSave}
              >
                <Ionicons name={favorite ? 'bookmark' : 'bookmark-outline'} size={22} color={colors.redDark} />
              </Pressable>
            </View>
            <Text numberOfLines={1} style={styles.selectedMapMeta}>{selectedMapItem.type}</Text>
            {postCountsByRestaurant[selectedMapItem.id] ? (
              <Text numberOfLines={1} style={styles.selectedMapSocialMeta}>
                {postCountsByRestaurant[selectedMapItem.id]} novidades da comunidade
              </Text>
            ) : null}
            <View style={styles.selectedMapStatusRow}>
              <Ionicons name="star" size={14} color={colors.redDark} />
              <Text style={styles.selectedMapRating}>{scoreValue(selectedMapItem).toFixed(1).replace('.', ',')}</Text>
              <Text style={styles.selectedMapDivider}>•</Text>
              <Text style={styles.selectedMapRating}>{formatDistance(selectedMapItem.distanceKm)}</Text>
              <Text style={styles.selectedMapDivider}>•</Text>
              <Text style={styles.selectedMapRating}>{selectedMapItem.price || '$$'}</Text>
              <Text style={styles.selectedMapDivider}>•</Text>
              <Text style={[styles.selectedMapStatus, openStatus.open && styles.selectedMapStatusOpen]}>{openStatus.label}</Text>
            </View>
          </View>
        </Pressable>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={`Traçar rota para ${selectedMapItem.name}`}
          onPress={() => onDirections?.(selectedMapItem)}
          style={styles.selectedMapRoute}
        >
          <Ionicons name="navigate" size={18} color="#FFFFFF" />
          <Text style={styles.selectedMapRouteText}>Como chegar</Text>
        </Pressable>
      </View>
    );
  }

  if (MapView && Marker) {
    return (
      <View style={styles.realMapCard}>
        <MapView
          style={styles.realMap}
          region={region}
          onRegionChangeComplete={onRegionChange}
          showsUserLocation={locationGranted}
          showsMyLocationButton={false}
          showsCompass
          showsPointsOfInterest={false}
          toolbarEnabled={false}
          customMapStyle={dineNativeMapStyle}
          onTouchStart={() => onInteractionChange?.(true)}
          onTouchEnd={() => onInteractionChange?.(false)}
          onTouchCancel={() => onInteractionChange?.(false)}
        >
          {restaurants.map((item, index) => (
            <Marker
              key={item.id}
              coordinate={item.coordinate || coordinateForRestaurant(item, index)}
              title={item.name}
              description={`${item.type} - ${item.district}${Number.isFinite(item.distanceKm) ? ` • ${formatDistance(item.distanceKm)}` : ''}`}
              onPress={() => setSelectedMapItem(item)}
              anchor={{ x: 0.5, y: 1 }}
            >
              <View style={[styles.nativeMapMarker, selectedMapItem?.id === item.id && styles.nativeMapMarkerSelected]}>
              <View style={styles.nativeMapMarkerPhotoWrap}>
                  <Image source={imageSource(item.logo || item.coverPhoto || item.image)} style={styles.nativeMapMarkerPhoto} />
                </View>
                <View style={styles.nativeMapMarkerTip} />
                {postCountsByRestaurant[item.id] ? (
                  <View style={styles.mapMarkerActivityBadge}>
                    <Text style={styles.mapMarkerActivityText}>{Math.min(9, postCountsByRestaurant[item.id])}</Text>
                  </View>
                ) : null}
              </View>
            </Marker>
          ))}
        </MapView>
        <Pressable accessibilityRole="button" accessibilityLabel="Usar minha localização" onPress={onLocate} style={styles.mapLocateFloat}>
          <Ionicons name="locate" size={23} color={colors.ink} />
        </Pressable>
        {renderSelectedMapCard()}
      </View>
    );
  }

  if (Platform.OS === 'web') {
    return (
      <View style={styles.mapCard}>
        <View
          style={styles.webMapDragLayer}
          onStartShouldSetResponder={() => true}
          onMoveShouldSetResponder={() => true}
          onStartShouldSetResponderCapture={() => true}
          onMoveShouldSetResponderCapture={() => true}
          onResponderGrant={(event) => {
            onInteractionChange?.(true);
            const point = webMapEventPoint(event);
            dragStartRef.current = { ...point, startOffset: webPanOffset };
          }}
          onResponderMove={(event) => {
            if (!dragStartRef.current) return;
            const point = webMapEventPoint(event);
            setWebPanOffset({
              x: dragStartRef.current.startOffset.x + point.x - dragStartRef.current.x,
              y: dragStartRef.current.startOffset.y + point.y - dragStartRef.current.y
            });
          }}
          onResponderRelease={finishWebMapPan}
          onResponderTerminate={finishWebMapPan}
        >
          {webTiles.map((tile) => React.createElement('img', {
            key: tile.key,
            src: tile.url,
            alt: '',
            draggable: false,
            style: {
              position: 'absolute',
              left: tile.left,
              top: tile.top,
              width: webMapTileSize,
              height: webMapTileSize,
              userSelect: 'none',
              filter: 'saturate(0.72) contrast(0.92) brightness(1.06)'
            }
          }))}
          <View pointerEvents="none" style={styles.webMapScrim} />
        </View>
        <View style={styles.mapCompass}>
          <Ionicons name="navigate" size={16} color={colors.redDark} />
          <Text style={styles.mapCompassText}>Dine</Text>
        </View>
        {restaurants.slice(0, 5).map((item, index) => {
          const point = webPointForItem(item, index);
          const visible = point.left > -90 && point.left < webMapWidth + 90 && point.top > -40 && point.top < webMapHeight + 90;
          if (!visible) return null;
          return (
            <Pressable
              key={item.id}
              accessibilityRole="button"
              accessibilityLabel={`Selecionar restaurante ${item.name}`}
              onPress={() => setSelectedMapItem(item)}
              style={[styles.webMapMarker, { left: point.left, top: point.top }]}
            >
              <View style={[styles.webMapMarkerDot, selectedMapItem?.id === item.id && styles.webMapMarkerDotSelected]}>
                <Image source={imageSource(item.logo || item.coverPhoto || item.image)} style={styles.webMapMarkerPhoto} />
              </View>
              <View style={[styles.webMapMarkerTip, selectedMapItem?.id === item.id && styles.webMapMarkerTipSelected]} />
              {postCountsByRestaurant[item.id] ? (
                <View style={styles.mapMarkerActivityBadge}>
                  <Text style={styles.mapMarkerActivityText}>{Math.min(9, postCountsByRestaurant[item.id])}</Text>
                </View>
              ) : null}
            </Pressable>
          );
        })}
        {userLocation ? (
          <View
            style={[
              styles.userDot,
              {
                left: Math.max(12, Math.min(webMapWidth - 28, webMapPoint(userLocation, webMapRegion, webMapWidth, webMapHeight).left + webPanOffset.x - 12)),
                top: Math.max(54, Math.min(webMapHeight - 28, webMapPoint(userLocation, webMapRegion, webMapWidth, webMapHeight).top + webPanOffset.y - 12))
              }
            ]}
          />
        ) : null}
        <Pressable accessibilityRole="button" accessibilityLabel="Usar minha localização" onPress={onLocate} style={styles.mapLocateFloat}>
          <Ionicons name="locate" size={23} color={colors.ink} />
        </Pressable>
        {renderSelectedMapCard()}
        <Text style={styles.webMapAttribution}>© OpenStreetMap</Text>
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
  const mainScrollRef = useRef(null);
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
  const [authError, setAuthError] = useState('');
  const [pendingAction, setPendingAction] = useState(null);
  const [form, setForm] = useState({});
  const [registerStep, setRegisterStep] = useState(0);
  const [registerErrors, setRegisterErrors] = useState({});
  const [registerLocating, setRegisterLocating] = useState(false);
  const [registerAddressSuggestions, setRegisterAddressSuggestions] = useState([]);
  const [registerAddressSearching, setRegisterAddressSearching] = useState(false);
  const [registerAddressFeedback, setRegisterAddressFeedback] = useState('');
  const registerAddressRequestRef = useRef(0);
  const [registerDraftSavedAt, setRegisterDraftSavedAt] = useState(null);
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
  const [mapInteracting, setMapInteracting] = useState(false);
  const [ownerRestaurants, setOwnerRestaurants] = useState([]);
  const [ownerPanelTab, setOwnerPanelTab] = useState('Visão geral');
  const [ownerRestaurantId, setOwnerRestaurantId] = useState('');
  const [pendingRestaurants, setPendingRestaurants] = useState([]);
  const [editingRestaurant, setEditingRestaurant] = useState(null);
  const [selectedPanelPost, setSelectedPanelPost] = useState(null);
  const [panelPostLikes, setPanelPostLikes] = useState({});
  const isAdmin = Boolean(currentUser?.email && isAdminEmail(currentUser.email));
  const isRestaurantOwner = normalizeAccountType(currentUser?.accountType) === 'restaurant_owner';
  const appAppearance = useMemo(() => resolveAppearance(currentUser?.settings, systemColorScheme), [currentUser?.settings, systemColorScheme]);
  const copy = settingsCopy[currentUser?.settings?.language || 'pt-BR'] || settingsCopy['pt-BR'];
  const [clockTick, setClockTick] = useState(Date.now());
  const [reviewsByRestaurant, setReviewsByRestaurant] = useState({});
  const [reviewDraft, setReviewDraft] = useState({ rating: '5', comment: '' });
  const [reservations, setReservations] = useState([]);
  const [waitlistEntries, setWaitlistEntries] = useState([]);
  const [reservationRestaurant, setReservationRestaurant] = useState(null);
  const [feedReactions, setFeedReactions] = useState({});
  const [feedCommentDrafts, setFeedCommentDrafts] = useState({});
  const [feedPhotoIndexes, setFeedPhotoIndexes] = useState({});
  const [feedMode, setFeedMode] = useState('Para você');
  const [customFeedPosts, setCustomFeedPosts] = useState([]);
  const [activityNotifications, setActivityNotifications] = useState([]);
  const [activityFilter, setActivityFilter] = useState('Todas');
  const unreadActivityCount = useMemo(
    () => activityNotifications.filter((item) => item.status === 'unread').length,
    [activityNotifications]
  );
  const [selectedFeedProfile, setSelectedFeedProfile] = useState(null);
  const [selectedFeedPost, setSelectedFeedPost] = useState(null);
  const [feedComposerOpen, setFeedComposerOpen] = useState(false);
  const [feedDraft, setFeedDraft] = useState({ caption: '', restaurantId: '', restaurantName: '', photos: [] });
  const [profileInstagramDraft, setProfileInstagramDraft] = useState('');
  const [profileDraft, setProfileDraft] = useState({ name: '', bio: '', location: '', preferences: '' });
  const [homeDiscoveryIndex, setHomeDiscoveryIndex] = useState(0);
  const [showStartupSplash, setShowStartupSplash] = useState(true);
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [onboardingIndex, setOnboardingIndex] = useState(0);
  const [authSubmitting, setAuthSubmitting] = useState(false);

  useEffect(() => {
    screenFade.setValue(0);
    if (tab !== 'Mapa') setMapInteracting(false);
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
        const [storedRestaurants, storedFavorites, storedUsers, storedCurrentUser, storedOnboardingSeen, storedFeedPosts, storedFeedReactions, storedReservations, storedWaitlist] = await Promise.all([
          AsyncStorage.getItem(storageKeys.restaurants),
          AsyncStorage.getItem(storageKeys.favorites),
          AsyncStorage.getItem(storageKeys.users),
          AsyncStorage.getItem(storageKeys.currentUser),
          AsyncStorage.getItem(storageKeys.onboardingSeen),
          AsyncStorage.getItem(storageKeys.feedPosts),
          AsyncStorage.getItem(storageKeys.feedReactions),
          AsyncStorage.getItem(storageKeys.reservations),
          AsyncStorage.getItem(storageKeys.waitlist)
        ]);
        const storedRestaurantCoordinates = await AsyncStorage.getItem(storageKeys.restaurantCoordinates);
        let localUser = storedCurrentUser ? normalizeDemoAccount(JSON.parse(storedCurrentUser)) : null;
        if (supabaseAuthEnabled) {
          localUser = await getSupabaseCurrentUser();
        }

        if (storedRestaurants) {
          const parsedRestaurants = JSON.parse(storedRestaurants);
          setRestaurants(shouldRefreshLegacySeedRestaurants(parsedRestaurants) ? seedRestaurants : mergeSeedRestaurantMenus(parsedRestaurants));
        }
        if (storedFavorites) setFavorites(JSON.parse(storedFavorites));
        const localFeedPosts = storedFeedPosts ? JSON.parse(storedFeedPosts) : [];
        const localFeedReactions = storedFeedReactions ? JSON.parse(storedFeedReactions) : {};
        if (storedReservations) setReservations(JSON.parse(storedReservations));
        if (storedWaitlist) setWaitlistEntries(JSON.parse(storedWaitlist));
        if (localFeedPosts.length) setCustomFeedPosts(localFeedPosts);
        if (Object.keys(localFeedReactions).length) setFeedReactions(localFeedReactions);
        if (storedRestaurantCoordinates) {
          setRestaurantCoordinates(JSON.parse(storedRestaurantCoordinates));
        }
        const mergedUsers = [
          ...seedUsers,
          ...(!supabaseAuthEnabled && storedUsers ? JSON.parse(storedUsers) : [])
        ].reduce((list, user) => {
          const exists = list.some((item) => normalize(item.email) === normalize(user.email));
          const mergedUser = normalizeDemoAccount(user);
          if (exists) return list.map((item) => (normalize(item.email) === normalize(user.email) ? { ...item, ...mergedUser, gamification: mergeGamification(mergedUser.gamification) } : item));
          return [...list, { ...mergedUser, gamification: mergeGamification(mergedUser.gamification) }];
        }, []);
        setUsers(mergedUsers);
        if (localUser) {
          const normalizedLocalUser = normalizeDemoAccount({ ...localUser, gamification: mergeGamification(localUser.gamification) });
          setCurrentUser(normalizedLocalUser);
          if (normalizeAccountType(normalizedLocalUser.accountType) === 'restaurant_owner') {
            setActiveScreen({ name: 'restaurantPanel', params: {} });
          }
        } else if (storedOnboardingSeen) {
          setAuthMode('login');
          setForm({});
        } else {
          setShowOnboarding(true);
          setAuthMode(null);
          setForm({});
        }

        if (supabaseReady) {
          if (!supabaseAuthEnabled) {
            await seedRestaurantsIfEmpty(seedRestaurants, seedRestaurantLegacyNames);
          }
          const remoteRestaurants = await fetchRestaurantsFromDb();
          if (remoteRestaurants?.length) setRestaurants(mergeSeedRestaurantMenus(remoteRestaurants));
          if (localUser) {
            const remoteFavorites = await fetchFavoritesFromDb(localUser.id);
            if (remoteFavorites) setFavorites(remoteFavorites);
          }
          const remoteFeed = await fetchFeedDataFromDb(localUser?.id);
          if (remoteFeed) {
            setCustomFeedPosts([
              ...remoteFeed.posts,
              ...localFeedPosts.filter((localPost) => !remoteFeed.posts.some((remotePost) => remotePost.id === localPost.id))
            ]);
            setFeedReactions({ ...localFeedReactions, ...remoteFeed.reactions });
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
    if (!hydrated) return;
    AsyncStorage.setItem(storageKeys.feedPosts, JSON.stringify(customFeedPosts));
  }, [customFeedPosts, hydrated]);

  useEffect(() => {
    if (!hydrated) return;
    AsyncStorage.setItem(storageKeys.feedReactions, JSON.stringify(feedReactions));
  }, [feedReactions, hydrated]);

  useEffect(() => {
    if (!hydrated) return;
    AsyncStorage.setItem(storageKeys.reservations, JSON.stringify(reservations));
  }, [hydrated, reservations]);

  useEffect(() => {
    if (!hydrated) return;
    AsyncStorage.setItem(storageKeys.waitlist, JSON.stringify(waitlistEntries));
  }, [hydrated, waitlistEntries]);

  useEffect(() => {
    if (activeScreen?.name !== 'restaurantRegister' || registerStep !== 1 || form.addressLookupReady) {
      setRegisterAddressSuggestions([]);
      setRegisterAddressSearching(false);
      return undefined;
    }
    const queryValue = String(form.addressQuery ?? form.address ?? '').trim();
    const cepDigits = onlyAddressDigits(queryValue);
    const isCepQuery = cepDigits.length === 8 && /^[\d\s-]+$/.test(queryValue);
    if (!isCepQuery && queryValue.length < 3) {
      setRegisterAddressSuggestions([]);
      setRegisterAddressSearching(false);
      return undefined;
    }
    const requestId = registerAddressRequestRef.current + 1;
    registerAddressRequestRef.current = requestId;
    const timeout = setTimeout(async () => {
      setRegisterAddressSearching(true);
      try {
        if (isCepQuery) {
          const result = await lookupAddressByCep(queryValue);
          if (registerAddressRequestRef.current !== requestId) return;
          if (!result) {
            setRegisterAddressSuggestions([]);
            setRegisterAddressFeedback('CEP não encontrado. Confira os oito números.');
            return;
          }
          const address = formatAddressLabel(result);
          setForm((current) => ({
            ...current,
            address,
            addressQuery: address,
            addressLookupReady: true,
            addressStreet: result.street,
            addressComplement: result.complement,
            addressNumber: '',
            cep: result.cep,
            district: result.district || current.district,
            city: result.city,
            state: result.state,
            cepLatitude: result.latitude ?? '',
            cepLongitude: result.longitude ?? '',
            latitude: '',
            longitude: ''
          }));
          setRegisterAddressSuggestions([]);
          setRegisterAddressFeedback('CEP encontrado. Agora informe o número do restaurante.');
          setRegisterErrors((current) => ({ ...current, address: '', addressNumber: '' }));
          return;
        }
        const results = await searchAddresses(queryValue, {
          city: form.city || defaultAddressCity,
          state: form.state || defaultAddressState
        });
        if (registerAddressRequestRef.current !== requestId) return;
        setRegisterAddressSuggestions(results);
        setRegisterAddressFeedback(results.length ? 'Selecione a opção correta para confirmar o endereço.' : 'Nenhuma opção encontrada. Você ainda pode confirmar o texto digitado.');
      } catch (error) {
        if (registerAddressRequestRef.current !== requestId) return;
        setRegisterAddressSuggestions([]);
        setRegisterAddressFeedback('A busca automática está indisponível. Você ainda pode confirmar o endereço digitado.');
      } finally {
        if (registerAddressRequestRef.current === requestId) setRegisterAddressSearching(false);
      }
    }, isCepQuery ? 300 : 500);
    return () => clearTimeout(timeout);
  }, [activeScreen?.name, form.address, form.addressLookupReady, form.addressQuery, form.city, form.state, registerStep]);

  useEffect(() => {
    if (!hydrated || activeScreen?.name !== 'restaurantRegister' || editingRestaurant || !currentUser) return undefined;
    const hasDraftContent = Boolean(form.name || form.address || form.coverPhoto || form.phone || form.whatsapp);
    if (!hasDraftContent) return undefined;
    const timeout = setTimeout(() => {
      AsyncStorage.setItem(storageKeys.restaurantDraft, JSON.stringify({
        userId: currentUser.id,
        form,
        step: registerStep,
        savedAt: new Date().toISOString()
      })).then(() => setRegisterDraftSavedAt(Date.now())).catch(() => {});
    }, 450);
    return () => clearTimeout(timeout);
  }, [activeScreen?.name, currentUser, editingRestaurant, form, hydrated, registerStep]);

  useEffect(() => {
    if (!hydrated || !currentUser) return;
    fetchFavoritesFromDb(currentUser.id)
      .then((remoteFavorites) => {
        if (remoteFavorites) setFavorites(remoteFavorites);
      })
      .catch(() => {});
  }, [currentUser, hydrated]);

  useEffect(() => {
    if (!hydrated || !currentUser?.id) {
      setActivityNotifications([]);
      return;
    }
    fetchSocialStateFromDb(currentUser.id)
      .then((socialState) => {
        if (!socialState) return;
        setActivityNotifications(socialState.notifications || []);
        setCurrentUser((user) => user ? { ...user, followingProfiles: socialState.followingProfiles || user.followingProfiles || [] } : user);
      })
      .catch(() => {});
  }, [currentUser?.id, hydrated]);

  useEffect(() => {
    const frame = requestAnimationFrame(() => {
      mainScrollRef.current?.scrollTo({ y: 0, animated: false });
    });
    return () => cancelAnimationFrame(frame);
  }, [activeScreen?.name, registerStep, tab]);

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
    if (!ownerRestaurantId && ownerRestaurants[0]?.id) setOwnerRestaurantId(ownerRestaurants[0].id);
    if (ownerRestaurantId && ownerRestaurants.length && !ownerRestaurants.some((item) => item.id === ownerRestaurantId)) {
      setOwnerRestaurantId(ownerRestaurants[0].id);
    }
  }, [ownerRestaurantId, ownerRestaurants]);

  useEffect(() => {
    if (!hydrated || !currentUser?.id) return;
    const restaurantIds = isRestaurantOwner || isAdmin ? ownerRestaurants.map((item) => item.id) : [];
    fetchReservationStateFromDb({ userId: currentUser.id, restaurantIds })
      .then((state) => {
        if (!state) return;
        setReservations((localItems) => [...state.reservations, ...localItems.filter((local) => !state.reservations.some((remote) => remote.id === local.id))]);
        setWaitlistEntries((localItems) => [...state.waitlist, ...localItems.filter((local) => !state.waitlist.some((remote) => remote.id === local.id))]);
      })
      .catch(() => {});
  }, [currentUser?.id, hydrated, isAdmin, isRestaurantOwner, ownerRestaurants]);

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
        const coordinate = item.coordinate || coordinateForRestaurant(item, index);
        const distanceFromUser = distanceKm(userLocation, coordinate);
        const distanceFromArea = distanceKm(searchCenter, coordinate);
        return {
          ...item,
          coordinate,
          distanceKm: distanceFromUser ?? distanceFromArea,
          distanceFromAreaKm: distanceFromArea
        };
      })
      .filter((item) => !needle || matchesRestaurantQuery(item, query))
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
      { id: 'dine-comunidade', name: 'Dine Comunidade', handle: '@dine', bio: 'Momentos de mesa, pratos favoritos e novas descobertas.', instagram: '@dineapp', followers: 2450, following: 174, avatar: restaurant.logo || restaurant.image }
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
      createdAt: restaurant.updatedAt || restaurant.createdAt || null,
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
  const postCountsByRestaurant = useMemo(() => feedPosts.reduce((counts, post) => {
    const restaurantId = post.restaurantId || post.restaurant?.id;
    if (!restaurantId) return counts;
    counts[restaurantId] = (counts[restaurantId] || 0) + 1;
    return counts;
  }, {}), [feedPosts]);
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
    if (action?.type === 'restaurant-register') {
      if (normalizeAccountType(user?.accountType) === 'restaurant_owner' || isAdminEmail(user?.email)) {
        startRestaurantRegistration();
      } else {
        Alert.alert('Conta de usuário', 'Para cadastrar um estabelecimento, crie uma conta como dono de restaurante.');
      }
    }
    if (action?.type === 'feed-composer') openFeedComposer(user);
    if (action?.type === 'reservation' && action.restaurant) {
      if (normalizeAccountType(user?.accountType) === 'user') {
        setReservationRestaurant(action.restaurant);
      } else {
        Alert.alert('Conta de restaurante', 'Reservas como cliente estão disponíveis em contas de usuário.');
      }
    }
  }

  function openAccountHome(user, newlyCreated = false) {
    if (normalizeAccountType(user?.accountType) === 'restaurant_owner') {
      if (newlyCreated) {
        startRestaurantRegistration();
      } else {
        navigateTo('restaurantPanel');
      }
      return;
    }
    setActiveScreen(null);
    setTab('Explorar');
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

  function openFeedPost(post) {
    if (!post?.id) return;
    setSelectedFeedPost(post);
  }

  function deleteFeedPost(post) {
    if (!currentUser || String(post?.authorId) !== String(currentUser.id)) return;
    Alert.alert(
      'Excluir publicacao',
      'Essa publicacao sera removida do seu feed.',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Excluir',
          style: 'destructive',
          onPress: () => {
            setCustomFeedPosts((items) => items.filter((item) => item.id !== post.id));
            setSelectedFeedPost(null);
            deleteFeedPostInDb(post.id, currentUser).catch(() => {
              Alert.alert('Publicacao removida', 'Ela saiu deste aparelho, mas a remocao no servidor precisa ser tentada novamente.');
            });
          }
        }
      ]
    );
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
    if (active && ['liked', 'reposted'].includes(field)) {
      const post = feedPosts.find((item) => String(item.id) === String(postId));
      const targetUserId = post?.authorId || post?.authorProfile?.id;
      if (targetUserId && String(targetUserId) !== String(currentUser?.id)) {
        createAppNotificationInDb({
          userId: targetUserId,
          actorId: currentUser.id,
          actorName: currentUser.name || 'Alguém',
          actorAvatar: currentUser.photo || '',
          type: field === 'liked' ? 'like' : 'repost',
          message: field === 'liked' ? 'curtiu sua publicação.' : 'republicou sua descoberta.',
          targetId: postId,
          targetPostId: postId,
          previewImage: post.images?.[0] || post.image || ''
        }).catch(() => {});
      }
    }
  }

  function addFeedComment(post) {
    const text = String(feedCommentDrafts[post.id] || '').trim();
    if (!text) return;
    if (!currentUser && !requireLogin({ type: 'tab', target: 'Perfil' })) return;
    const issue = moderationIssueForText(text);
    if (issue) {
      Alert.alert('Comentario bloqueado', issue);
      return;
    }
    const comment = {
      id: `${post.id}-${Date.now()}`,
      author: currentUser?.name || 'Visitante',
      userId: currentUser?.id,
      text,
      createdAt: new Date().toISOString()
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
    const targetUserId = post.authorId || post.authorProfile?.id;
    if (targetUserId && String(targetUserId) !== String(currentUser?.id)) {
      createAppNotificationInDb({
        userId: targetUserId,
        actorId: currentUser.id,
        actorName: currentUser.name || 'Alguém',
        actorAvatar: currentUser.photo || '',
        type: 'comment',
        message: `comentou: “${text.slice(0, 80)}${text.length > 80 ? '…' : ''}”`,
        targetId: post.id,
        targetPostId: post.id,
        previewImage: post.images?.[0] || post.image || ''
      }).catch(() => {});
    }
  }

  function shareFeedPost(post) {
    const restaurantName = post.restaurant?.name || post.restaurantName || '';
    Share.share({ message: `${post.caption || 'Veja esta publicacao no Dine.'}${restaurantName ? `\nPublicado em ${restaurantName}.` : ''}` }).catch(() => {});
  }

  function openFeedProfile(post) {
    const avatar = postAuthorAvatar(post, currentUser);
    const baseProfile = post.authorProfile || {
      id: post.authorId || post.handle || post.author,
      name: post.author,
      handle: post.handle,
      bio: 'Compartilhando momentos e descobertas gastronômicas.',
      instagram: '',
      followers: 0,
      following: 0,
      avatar
    };
    const profile = { ...baseProfile, avatar };
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
    fetchProfileSocialStatsFromDb(profileKey)
      .then((socialProfile) => {
        if (!socialProfile) return;
        setSelectedFeedProfile((current) => {
          if (!current || String(current.id || current.handle || current.name) !== String(profileKey)) return current;
          return {
            ...current,
            ...(socialProfile.profile || {}),
            followers: socialProfile.followers,
            following: socialProfile.following,
            socialStatsLoaded: true,
            posts: current.posts
          };
        });
      })
      .catch(() => {});
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
    setProfileFollowInDb(currentUser, { ...profile, id: profileId }, !isFollowing).catch(() => {
      Alert.alert('Sincronização', 'A alteração ficou salva neste aparelho e será sincronizada quando o serviço estiver disponível.');
    });
  }

  function openFeedComposer(user = currentUser) {
    if (!user) {
      requireLogin({ type: 'feed-composer' });
      return;
    }
    setFeedDraft({
      caption: '',
      restaurantId: '',
      restaurantName: '',
      photos: [],
      checkIn: false
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
    const issue = moderationIssueForText(caption);
    if (issue) {
      Alert.alert('Publicacao bloqueada', issue);
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
      avatar: currentUser?.photo || '',
      authorProfile: {
        id: currentUser?.id || 'visitor-feed',
        name: currentUser?.name || 'Você',
        handle: currentUser?.email ? `@${normalize(currentUser.name || 'voce').replace(/\s+/g, '')}` : '@voce',
        bio: 'Compartilhando momentos e descobertas gastronômicas.',
        instagram: String(currentUser?.instagram || '').trim(),
        followers: currentUser?.followers || 0,
        following: currentUser?.following || 0,
        avatar: currentUser?.photo || ''
      },
      image: photos[0],
      images: photos,
      title: restaurant.name,
      caption,
      kind: feedDraft.checkIn ? 'checkin' : 'discovery',
      createdAt: new Date().toISOString(),
      location: `${restaurant.district} • ${restaurant.type}`,
      likes: 0,
      comments: [],
      reposts: 0
    };
    setCustomFeedPosts((items) => [post, ...items]);
    setFeedPhotoIndexes((current) => ({ ...current, [post.id]: 0 }));
    setFeedComposerOpen(false);
    setTab('Feed');
    if (feedDraft.checkIn && restaurant.id) awardPoints('known', restaurant.id);
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
    if (activeScreen?.name === 'restaurantRegister' && isRestaurantOwner) {
      navigateTo('restaurantPanel');
      return;
    }
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
      if (typeof navigator === 'undefined' || !navigator.geolocation) {
        setLocationStatus('unavailable');
        setLocationMessage('Seu navegador nao liberou localizacao. Use cidade ou bairro como fallback.');
        return;
      }
      setLocationStatus('requesting');
      setLocationMessage('Pedindo permissao de localizacao...');
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const nextLocation = {
            latitude: position.coords.latitude,
            longitude: position.coords.longitude
          };
          setUserLocation(nextLocation);
          setLocationStatus('granted');
          setLocationMessage('Ordenando restaurantes pela sua distancia real.');
          setSelectedArea('Perto de mim');
          setMapRegion({
            ...nextLocation,
            latitudeDelta: 0.035,
            longitudeDelta: 0.03
          });
        },
        () => {
          setLocationStatus('denied');
          setLocationMessage('Localizacao nao autorizada. Voce ainda pode buscar por cidade, bairro e raio.');
        },
        { enableHighAccuracy: false, timeout: 10000, maximumAge: 60000 }
      );
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

  async function openNotifications() {
    navigateTo('notifications');
    if (!currentUser?.id) return;
    try {
      const socialState = await fetchSocialStateFromDb(currentUser.id);
      const notifications = socialState?.notifications || [];
      setActivityNotifications(notifications);
      const unreadIds = notifications.filter((item) => item.status === 'unread').map((item) => item.id);
      if (unreadIds.length) {
        setTimeout(() => {
          setActivityNotifications((items) => items.map((item) => ({ ...item, status: 'read' })));
          markAppNotificationsReadInDb(currentUser.id, unreadIds).catch(() => {});
        }, 900);
      }
    } catch (error) {
      // Keep the locally available activity if the social tables are offline.
    }
  }

  function openActivityNotification(notification) {
    const targetPostId = notification.targetPostId || (['like', 'comment', 'repost'].includes(notification.type) ? notification.targetId : '');
    if (targetPostId) {
      const post = feedPosts.find((item) => String(item.id) === String(targetPostId));
      if (post) {
        openFeedPost(post);
        return;
      }
    }
    if (notification.targetProfile) {
      setSelectedFeedProfile({ ...notification.targetProfile, posts: [] });
      navigateTo('feedProfile');
    }
  }

  function openLocationPicker() {
    navigateTo('city');
  }

  async function saveCurrentUser(user) {
    const normalizedUser = {
      ...user,
      accountType: normalizeAccountType(user.accountType),
      gamification: mergeGamification(user.gamification)
    };
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

  async function deleteCurrentAccount() {
    if (!currentUser) {
      requireLogin({ type: 'settings' });
      return;
    }
    Alert.alert(
      'Excluir minha conta',
      'Isso remove sua sessao, perfil local, favoritos, bloqueios e solicita exclusao dos seus dados sincronizados. Esta acao nao pode ser desfeita neste aparelho.',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Excluir conta',
          style: 'destructive',
          onPress: async () => {
            const userId = currentUser.id;
            const userEmail = currentUser.email;
            try {
              await deleteUserAccountInDb(currentUser);
            } catch (error) {
              Alert.alert('Exclusao solicitada', 'Nao conseguimos apagar tudo no servidor agora, mas removemos a conta deste aparelho. Fale com suporte para concluir a exclusao remota.');
            }
            const nextUsers = users.filter((user) => user.id !== userId && normalize(user.email) !== normalize(userEmail));
            setUsers(nextUsers);
            setCurrentUser(null);
            setFavorites([]);
            setReservations((items) => items.filter((item) => item.userId !== userId));
            setWaitlistEntries((items) => items.filter((item) => item.userId !== userId));
            setActiveScreen(null);
            setTab('Explorar');
            const nextReservations = reservations.filter((item) => item.userId !== userId);
            const nextWaitlist = waitlistEntries.filter((item) => item.userId !== userId);
            await AsyncStorage.multiSet([
              [storageKeys.users, JSON.stringify(nextUsers)],
              [storageKeys.currentUser, 'null'],
              [storageKeys.favorites, JSON.stringify([])],
              [storageKeys.reservations, JSON.stringify(nextReservations)],
              [storageKeys.waitlist, JSON.stringify(nextWaitlist)]
            ]);
          }
        }
      ]
    );
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
      if (typeof window === 'undefined' || !('Notification' in window)) {
        await updateNotificationSettings({ pushEnabled: false, pushStatus: 'web-unavailable' });
        Alert.alert('Notificacoes', 'Este navegador nao oferece permissoes de notificacao. Suas preferencias ficam salvas.');
        return;
      }
      const permission = window.Notification.permission === 'default'
        ? await window.Notification.requestPermission()
        : window.Notification.permission;
      const granted = permission === 'granted';
      await updateNotificationSettings({ pushEnabled: granted, pushStatus: granted ? 'web-granted' : 'denied' });
      Alert.alert('Notificacoes', granted ? 'Notificacoes do navegador ativadas.' : 'Permissao negada. Voce pode ativar depois nas configuracoes do navegador.');
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
    let invite = currentUser.invite || { code: localCode, link: publicAppUrl ? `${publicAppUrl}/invite/${localCode}` : '', uses: 0 };
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
    if (!invite.link) {
      Alert.alert('Convites', 'Configure EXPO_PUBLIC_APP_URL para compartilhar links de convite no aplicativo nativo.');
      return;
    }
    Share.share({ message: `Vem descobrir restaurantes comigo no Dine: ${invite.link}` }).catch(() => {});
  }

  function openSupportEmail() {
    if (!supportEmail) {
      Alert.alert('Suporte', 'O e-mail de suporte ainda nao foi configurado.');
      return;
    }
    const subject = encodeURIComponent('Suporte Dine');
    const body = encodeURIComponent(`Olá, time Dine.\n\nConta: ${currentUser?.email || 'sem login'}\n\nPreciso de ajuda com:`);
    Linking.openURL(`mailto:${supportEmail}?subject=${subject}&body=${body}`).catch(() => {
      Alert.alert('Suporte', `Envie sua mensagem para ${supportEmail}.`);
    });
  }

  function openSupportWhatsApp() {
    if (!supportWhatsApp) {
      Alert.alert('Suporte', 'O WhatsApp de suporte ainda nao foi configurado.');
      return;
    }
    const text = encodeURIComponent(`Olá, preciso de ajuda com minha conta no Dine. Email: ${currentUser?.email || 'sem login'}`);
    Linking.openURL(`https://wa.me/${supportWhatsApp}?text=${text}`).catch(() => {
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

  async function pickRestaurantMenuItemImage(index) {
    const granted = await requestGalleryPermission('Permita acesso à galeria para escolher a foto do prato.');
    if (!granted) return;
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.84
    });
    if (result.canceled) return;
    const localUri = result.assets?.[0]?.uri;
    if (!localUri) return;
    const restaurantAssetId = editingRestaurant?.id || form.id || `draft-${currentUser?.id || 'visitor'}`;
    const uri = await withImageUploadFallback(localUri, (assetUri) => (
      uploadRestaurantAsset(currentUser || { id: 'visitor' }, restaurantAssetId, `menu-${index}`, assetUri)
    ));
    setForm((current) => ({
      ...current,
      menuDraftItems: (current.menuDraftItems || []).map((item, itemIndex) => (
        itemIndex === index ? { ...item, image: uri } : item
      ))
    }));
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
    try {
      await signOutFromSupabase();
    } catch (error) {
      Alert.alert('Sessão', 'A sessão foi removida deste aparelho, mas não foi possível avisar o servidor agora.');
    }
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

  async function submitAuth() {
    if (authSubmitting) return;
    const email = normalize(form.email).trim();
    const password = String(form.password || '');
    setAuthError('');
    if (!email || !password) {
      setAuthError('Informe seu e-mail e sua senha para continuar.');
      return;
    }
    if (!isValidEmail(email)) {
      setAuthError('Digite um endereço de e-mail válido.');
      return;
    }
    setAuthSubmitting(true);
    try {
    if (supabaseAuthEnabled) {
      if (authMode === 'signup') {
        if (!form.accountType) {
          setAuthError('Escolha se a conta será de usuário ou dono de restaurante.');
          return;
        }
        if (!form.name || password.length < 6) {
          setAuthError('Informe seu nome e use uma senha com pelo menos 6 caracteres.');
          return;
        }
      }
      try {
        const authenticatedUser = authMode === 'signup'
          ? await signUpWithSupabase({
              email,
              password,
              name: form.name,
              accountType: normalizeAccountType(form.accountType)
            })
          : await signInWithSupabase({ email, password });
        const user = normalizeDemoAccount({
          ...authenticatedUser,
          gamification: mergeGamification(authenticatedUser?.gamification),
          security: { lastLoginAt: new Date().toISOString(), platform: Platform.OS }
        });
        await saveCurrentUser(user);
        setAuthMode(null);
        setForm({});
        const hadPendingAction = Boolean(pendingAction);
        completePendingAction(user);
        if (!hadPendingAction) openAccountHome(user, authMode === 'signup');
      } catch (error) {
        if (error?.message === 'EMAIL_CONFIRMATION_REQUIRED') {
          setAuthError('Desative “Confirm email” no Supabase para entrar sem confirmação por e-mail.');
        } else if (/invalid login credentials/i.test(error?.message || '')) {
          setAuthError('E-mail ou senha inválidos.');
        } else if (/already registered|already been registered/i.test(error?.message || '')) {
          setAuthError('Este e-mail já está cadastrado. Entre com sua senha.');
        } else {
          setAuthError('Não foi possível autenticar agora. Tente novamente.');
        }
      }
      return;
    }
    if (authMode === 'signup') {
      if (!form.accountType) {
        setAuthError('Escolha se a conta será de usuário ou dono de restaurante.');
        return;
      }
      if (!form.name || password.length < 6) {
        setAuthError('Informe seu nome e use uma senha com pelo menos 6 caracteres.');
        return;
      }
      if (users.some((user) => normalize(user.email) === email)) {
        setAuthError('Este e-mail já está cadastrado. Entre com sua senha.');
        return;
      }
      const now = new Date().toISOString();
      const user = {
        id: String(Date.now()),
        name: form.name.trim(),
        email,
        accountType: normalizeAccountType(form.accountType),
        instagram: '',
        photo: '',
        bio: '',
        location: '',
        preferences: [],
        gamification: defaultGamification(),
        createdAt: now,
        security: { lastLoginAt: now, platform: Platform.OS }
      };
      setUsers((items) => [...items, { ...user, password }]);
      await saveCurrentUser(user);
      setAuthMode(null);
      setForm({});
      const hadPendingAction = Boolean(pendingAction);
      completePendingAction(user);
      if (!hadPendingAction) openAccountHome(user, true);
      return;
    }
    const found = users.find((user) => normalize(user.email) === email && user.password === password);
    if (!found) {
      setAuthError('E-mail ou senha inválidos.');
      return;
    }
    const user = normalizeDemoAccount({
      id: found.id,
      name: found.name,
      email: found.email,
      accountType: normalizeAccountType(found.accountType),
      instagram: found.instagram || '',
      photo: found.photo || '',
      bio: found.bio || '',
      location: found.location || '',
      preferences: found.preferences || [],
      createdAt: found.createdAt || '',
      security: { ...(found.security || {}), lastLoginAt: new Date().toISOString(), platform: Platform.OS },
      gamification: mergeGamification(found.gamification)
    });
    await saveCurrentUser(user);
    setAuthMode(null);
    setForm({});
    const hadPendingAction = Boolean(pendingAction);
    completePendingAction(user);
    if (!hadPendingAction) openAccountHome(user);
    } finally {
      setAuthSubmitting(false);
    }
  }

  function submitRestaurant() {
    const contact = String(form.whatsapp || form.phone || '').trim();
    const hoursDraft = form.openingHoursDraft || {};
    const hasOpeningHours = Object.values(hoursDraft).some(Boolean) || Boolean(String(form.openingHoursText || '').trim());
    if (!form.name || !form.type || !form.district || !form.description || !form.address || !contact || !(form.coverPhoto || form.image) || !hasOpeningHours || !parseOptionalCoordinate(form.latitude) || !parseOptionalCoordinate(form.longitude)) {
      Alert.alert('Cadastro incompleto', 'Revise identidade, endereço confirmado, contato, foto de capa e horários antes de enviar.');
      return;
    }
    const duplicate = restaurants.find((restaurant) => (
      restaurant.id !== form.id
      && (
        (normalize(restaurant.name) === normalize(form.name) && normalize(restaurant.address) === normalize(form.address))
        || (contact && [restaurant.phone, restaurant.whatsapp].some((value) => String(value || '').replace(/\D/g, '') === contact.replace(/\D/g, '')))
      )
    ));
    if (duplicate) {
      Alert.alert('Possível cadastro duplicado', `${duplicate.name} já possui nome/endereço ou contato semelhante. Procure o perfil existente para reivindicá-lo.`);
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
      cep: form.cep || '',
      addressNumber: form.addressNumber || '',
      city: form.city || defaultAddressCity,
      state: form.state || defaultAddressState,
      latitude: parseOptionalCoordinate(form.latitude),
      longitude: parseOptionalCoordinate(form.longitude),
      geocodedAddress: {
        label: form.address || '',
        latitude: parseOptionalCoordinate(form.latitude),
        longitude: parseOptionalCoordinate(form.longitude)
      },
      image: coverPhoto,
      coverPhoto,
      menuMode: form.menuMode || 'later',
      menuPhoto: form.menuMode === 'now' ? (form.menuPhoto || '') : '',
      photos,
      menuItems: form.menuMode !== 'now'
        ? []
        : (form.menuDraftItems || []).some((dish) => String(dish.name || '').trim())
          ? form.menuDraftItems.filter((dish) => String(dish.name || '').trim()).map((dish, index) => ({
            ...dish,
            id: dish.id || `${Date.now()}-${index}`,
            name: String(dish.name).trim(),
            price: Number(String(dish.price || '').replace(',', '.')) || 0
          }))
          : parseMenuItems(form.menuText),
      openingHours: Object.values(hoursDraft).some(Boolean) ? hoursDraft : parseOpeningHours(form.openingHoursText),
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
    setRegisterStep(0);
    setRegisterErrors({});
    AsyncStorage.removeItem(storageKeys.restaurantDraft).catch(() => {});
    setTab('Perfil');
    setActiveScreen(isAdmin ? { name: 'restaurantPanel', params: {} } : null);
    Alert.alert('Restaurante salvo', isAdmin ? `${item.name} já está no painel para gerenciamento.` : `${item.name} foi enviado para aprovação.`);
  }

  function openMaps(item) {
    awardPoints('map', item.id);
    recordRestaurantMetricInDb(item.id, 'mapsClicks').catch(() => {});
    Linking.openURL(`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${item.name} ${item.address} São José do Rio Preto SP`)}`);
  }

  function showRestaurantOnMap(item) {
    const coordinate = item.coordinate || coordinateForRestaurant(item);
    setQuery('');
    setSelectedCategory('');
    setMapRegion({
      ...coordinate,
      latitudeDelta: 0.025,
      longitudeDelta: 0.022
    });
    setSelectedArea(item.district || 'Área do mapa');
    setActiveScreen(null);
    setTab('Mapa');
  }

  function startRestaurantCheckIn(item) {
    if (!currentUser && !requireLogin({ type: 'feed-composer' })) return;
    setFeedDraft({
      caption: `Check-in no ${item.name}. O que vale a pena pedir por aqui?`,
      restaurantId: item.id,
      restaurantName: item.name,
      photos: [],
      checkIn: true
    });
    setSelectedRestaurant(null);
    setFeedComposerOpen(true);
  }

  function shareCollection(collection, items) {
    const names = items.slice(0, 5).map((item) => item.name).join(', ');
    Share.share({
      message: `${collection.title} no Dine${names ? `: ${names}` : ''}.`
    }).catch(() => {});
  }

  function openCollectionRoute(items) {
    if (!items.length) return;
    const destination = items[items.length - 1];
    const waypoints = items.slice(0, -1).slice(0, 7)
      .map((item) => `${item.name} ${item.address || item.district || ''}`)
      .join('|');
    const params = [
      'api=1',
      `destination=${encodeURIComponent(`${destination.name} ${destination.address || destination.district || ''}`)}`,
      waypoints ? `waypoints=${encodeURIComponent(waypoints)}` : ''
    ].filter(Boolean).join('&');
    Linking.openURL(`https://www.google.com/maps/dir/?${params}`);
  }

  function openWhatsApp(item, reserve = false) {
    recordRestaurantMetricInDb(item.id, reserve ? 'reservationClicks' : 'whatsappClicks').catch(() => {});
    const message = reserve ? `Olá, quero reservar uma mesa no ${item.name}.` : `Olá, encontrei vocês pelo Dine.`;
    Linking.openURL(`https://wa.me/${item.whatsapp || item.phone || '5517999999999'}?text=${encodeURIComponent(message)}`);
  }

  function openNativeReservation(item) {
    if (!currentUser) {
      setSelectedRestaurant(null);
      requireLogin({ type: 'reservation', restaurant: item });
      return;
    }
    if (isRestaurantOwner && !isAdmin) {
      Alert.alert('Conta de restaurante', 'Use uma conta de usuário para fazer reservas como cliente.');
      return;
    }
    setSelectedRestaurant(null);
    setReservationRestaurant(item);
  }

  async function createNativeReservation(item, draft) {
    if (!currentUser?.id || !item?.id) return false;
    const settings = reservationSettingsFor(item);
    const slots = reservationSlotsForDate(item, draft.date, reservations);
    const slot = slots.find((candidate) => candidate.time === draft.time);
    const partySize = Number(draft.partySize || 1);
    if (!slot || slot.remaining < partySize) {
      Alert.alert('Horário indisponível', 'Esse horário acabou de ficar lotado. Você pode entrar na lista de espera.');
      return false;
    }
    const now = new Date().toISOString();
    const reservation = {
      id: `reservation-${currentUser.id}-${Date.now()}`,
      restaurantId: item.id,
      restaurantName: item.name,
      restaurantImage: item.logo || item.image || '',
      userId: currentUser.id,
      userName: currentUser.name,
      userEmail: currentUser.email,
      userPhone: String(draft.phone || '').trim(),
      date: draft.date,
      time: draft.time,
      partySize,
      notes: String(draft.notes || '').trim(),
      status: settings.autoConfirm ? 'confirmed' : 'pending',
      createdAt: now,
      updatedAt: now
    };
    try {
      const savedReservation = await saveReservationToDb(reservation);
      const confirmedReservation = savedReservation || reservation;
      setReservations((items) => [
        confirmedReservation,
        ...items.filter((existing) => existing.id !== confirmedReservation.id)
      ]);
      recordRestaurantMetricInDb(item.id, 'reservationClicks').catch(() => {});
      Alert.alert(
        confirmedReservation.status === 'confirmed' ? 'Reserva confirmada' : 'Reserva solicitada',
        `${item.name} • ${draft.date} às ${draft.time}`
      );
      return true;
    } catch (error) {
      const unavailable = /SLOT_FULL|lotado|capacity/i.test(error?.message || '');
      Alert.alert(
        unavailable ? 'Horário indisponível' : 'Não foi possível reservar',
        unavailable
          ? 'Esse horário acabou de ficar lotado. Você pode entrar na lista de espera.'
          : 'Confira sua conexão e tente novamente.'
      );
      return false;
    }
  }

  function joinRestaurantWaitlist(item, draft) {
    if (!currentUser?.id || !item?.id) return false;
    const duplicate = waitlistEntries.some((entry) => (
      entry.userId === currentUser.id
      && entry.restaurantId === item.id
      && entry.date === draft.date
      && entry.time === draft.time
      && entry.status === 'waiting'
    ));
    if (duplicate) {
      Alert.alert('Você já está na lista', 'Acompanhe a posição em Minhas reservas.');
      return false;
    }
    const now = new Date().toISOString();
    const entry = {
      id: `waitlist-${currentUser.id}-${Date.now()}`,
      restaurantId: item.id,
      restaurantName: item.name,
      restaurantImage: item.logo || item.image || '',
      userId: currentUser.id,
      userName: currentUser.name,
      userEmail: currentUser.email,
      userPhone: String(draft.phone || '').trim(),
      date: draft.date,
      time: draft.time || '',
      partySize: Number(draft.partySize || 1),
      notes: String(draft.notes || '').trim(),
      status: 'waiting',
      createdAt: now,
      updatedAt: now
    };
    setWaitlistEntries((items) => [entry, ...items]);
    saveWaitlistEntryToDb(entry).catch(() => {});
    Alert.alert('Entrada confirmada', 'O restaurante poderá avisar quando surgir uma mesa.');
    return true;
  }

  function updateReservationStatus(reservation, status) {
    const updated = { ...reservation, status, updatedAt: new Date().toISOString() };
    setReservations((items) => items.map((item) => item.id === reservation.id ? updated : item));
    if (supabaseAuthEnabled) {
      updateReservationStatusSecureInDb(reservation.id, status)
        .then((remoteReservation) => {
          if (!remoteReservation) return;
          setReservations((items) => items.map((item) => item.id === reservation.id ? remoteReservation : item));
        })
        .catch(() => {
          setReservations((items) => items.map((item) => item.id === reservation.id ? reservation : item));
          Alert.alert('Reserva', 'Não foi possível atualizar o status agora.');
        });
      return;
    }
    saveReservationToDb(updated).catch(() => {});
  }

  function updateWaitlistStatus(entry, status) {
    const updated = { ...entry, status, updatedAt: new Date().toISOString() };
    setWaitlistEntries((items) => items.map((item) => item.id === entry.id ? updated : item));
    saveWaitlistEntryToDb(updated).catch(() => {});
  }

  function updateRestaurantAvailability(item, nextSettings) {
    const updated = { ...item, reservationSettings: nextSettings };
    setRestaurants((items) => items.map((restaurant) => restaurant.id === item.id ? updated : restaurant));
    setOwnerRestaurants((items) => items.map((restaurant) => restaurant.id === item.id ? updated : restaurant));
    updateRestaurantInDb(item.id, { reservationSettings: nextSettings }, currentUser, item).catch(() => {});
  }

  function editRestaurant(item) {
    setEditingRestaurant(item);
    setForm(restaurantToForm(item));
    setRegisterStep(0);
    setRegisterErrors({});
    setRegisterAddressSuggestions([]);
    setRegisterAddressFeedback('');
    navigateTo('restaurantRegister');
  }

  async function startRestaurantRegistration(defaults = {}) {
    if (currentUser && !isRestaurantOwner && !isAdmin) {
      Alert.alert('Acesso do restaurante', 'Este recurso está disponível para contas de dono de restaurante.');
      return;
    }
    setEditingRestaurant(null);
    let savedDraft = null;
    if (!Object.keys(defaults).length && currentUser) {
      try {
        const storedDraft = JSON.parse(await AsyncStorage.getItem(storageKeys.restaurantDraft) || 'null');
        if (storedDraft?.userId === currentUser.id) savedDraft = storedDraft;
      } catch (error) {
        savedDraft = null;
      }
    }
    setForm({
      status: isAdmin ? 'published' : 'pending',
      adminManaged: Boolean(isAdmin),
      managedByAdminEmail: isAdmin ? currentUser?.email : '',
      price: '$$',
      menuMode: 'later',
      menuDraftItems: [],
      openingHoursDraft: {},
      ...(savedDraft?.form || {}),
      ...defaults
    });
    setRegisterStep(Math.max(0, Math.min(3, Number(savedDraft?.step || 0))));
    setRegisterErrors({});
    setRegisterAddressSuggestions([]);
    setRegisterAddressFeedback('');
    setRegisterDraftSavedAt(savedDraft?.savedAt ? new Date(savedDraft.savedAt).getTime() : null);
    navigateTo('restaurantRegister');
  }

  function validateRestaurantStep(step) {
    const errors = {};
    if (step === 0) {
      if (!String(form.name || '').trim()) errors.name = 'Informe o nome do estabelecimento.';
      if (!String(form.type || '').trim()) errors.type = 'Escolha uma categoria.';
      if (!String(form.district || '').trim()) errors.district = 'Informe o bairro.';
      if (!String(form.description || '').trim()) errors.description = 'Conte brevemente o que torna o lugar especial.';
    }
    if (step === 1) {
      if (!String(form.address || '').trim()) errors.address = 'Informe o endereço completo.';
      if (form.addressLookupReady && !String(form.addressNumber || '').trim()) errors.addressNumber = 'Informe o número do restaurante.';
      if (!String(form.whatsapp || form.phone || '').trim()) errors.contact = 'Informe WhatsApp ou telefone.';
    }
    if (step === 2 && !(form.coverPhoto || form.image)) {
      errors.coverPhoto = 'Adicione uma foto de capa para apresentar o restaurante.';
    }
    if (step === 3) {
      const informedHours = Object.values(form.openingHoursDraft || {}).filter(Boolean);
      if (!informedHours.length && !String(form.openingHoursText || '').trim()) {
        errors.openingHours = 'Informe o funcionamento de pelo menos um dia.';
      } else if (informedHours.some((hours) => !parseHoursRanges(hours).length)) {
        errors.openingHours = 'Use horários no formato 09:00-18:00.';
      }
    }
    setRegisterErrors(errors);
    return !Object.keys(errors).length;
  }

  async function locateRestaurantAddress(showResult = true, addressCandidate = form) {
    if (!String(addressCandidate.address || '').trim()) {
      setRegisterErrors((current) => ({ ...current, address: 'Digite o endereço antes de localizar no mapa.' }));
      return false;
    }
    if (addressCandidate.addressLookupReady && !String(addressCandidate.addressNumber || '').trim()) {
      setRegisterErrors((current) => ({ ...current, addressNumber: 'Informe o número do restaurante.' }));
      return false;
    }
    setRegisterLocating(true);
    const coordinate = await geocodeRestaurantCoordinate(addressCandidate);
    setRegisterLocating(false);
    if (!coordinate) {
      setRegisterErrors((current) => ({ ...current, address: 'Não encontramos esse endereço. Inclua número, bairro e cidade.' }));
      setRegisterAddressFeedback('Não foi possível posicionar o pin. Revise o endereço ou escolha outra opção.');
      if (showResult) Alert.alert('Endereço não encontrado', 'Confira rua, número, bairro e cidade antes de tentar novamente.');
      return false;
    }
    setForm((current) => ({
      ...current,
      latitude: String(coordinate.latitude),
      longitude: String(coordinate.longitude)
    }));
    setRegisterErrors((current) => ({ ...current, address: '', addressNumber: '' }));
    setRegisterAddressFeedback(coordinate.source === 'cep'
      ? 'Endereço confirmado com a posição aproximada do CEP.'
      : 'Endereço e pin confirmados com sucesso.');
    if (showResult) Alert.alert('Localização confirmada', 'O pin do restaurante foi posicionado no mapa.');
    return true;
  }

  async function selectRestaurantAddressSuggestion(suggestion) {
    const number = extractAddressNumber(form.addressQuery || form.address) || String(form.addressNumber || '').trim();
    const address = formatAddressLabel(suggestion, number);
    const nextForm = {
      ...form,
      address,
      addressQuery: address,
      addressLookupReady: true,
      addressStreet: suggestion.street,
      addressComplement: suggestion.complement,
      addressNumber: number,
      cep: suggestion.cep,
      district: suggestion.district || form.district,
      city: suggestion.city,
      state: suggestion.state,
      cepLatitude: suggestion.latitude ?? '',
      cepLongitude: suggestion.longitude ?? '',
      latitude: '',
      longitude: ''
    };
    setForm(nextForm);
    setRegisterAddressSuggestions([]);
    setRegisterErrors((current) => ({ ...current, address: '', addressNumber: '' }));
    if (!number) {
      setRegisterAddressFeedback('Endereço selecionado. Informe o número do restaurante.');
      return;
    }
    setRegisterAddressFeedback('Endereço selecionado. Confirmando o pin no mapa...');
    await locateRestaurantAddress(false, nextForm);
  }

  function updateRestaurantAddressNumber(value) {
    setForm((current) => ({
      ...current,
      addressNumber: value,
      address: formatAddressLabel({
        street: current.addressStreet,
        complement: current.addressComplement,
        district: current.district,
        city: current.city,
        state: current.state,
        cep: current.cep
      }, value),
      addressQuery: formatAddressLabel({
        street: current.addressStreet,
        complement: current.addressComplement,
        district: current.district,
        city: current.city,
        state: current.state,
        cep: current.cep
      }, value),
      latitude: '',
      longitude: ''
    }));
    setRegisterErrors((current) => ({ ...current, address: '', addressNumber: '' }));
    setRegisterAddressFeedback(value.trim() ? 'Número adicionado. Confirme para posicionar o pin.' : 'Informe o número do restaurante.');
  }

  async function advanceRestaurantRegistration() {
    if (!validateRestaurantStep(registerStep)) return;
    if (registerStep === 1 && (!parseOptionalCoordinate(form.latitude) || !parseOptionalCoordinate(form.longitude))) {
      const located = await locateRestaurantAddress(false);
      if (!located) return;
    }
    setRegisterStep((step) => Math.min(3, step + 1));
    setRegisterErrors({});
  }

  async function finishRestaurantRegistration() {
    for (let step = 0; step < 4; step += 1) {
      if (!validateRestaurantStep(step)) {
        setRegisterStep(step);
        return;
      }
    }
    if (!parseOptionalCoordinate(form.latitude) || !parseOptionalCoordinate(form.longitude)) {
      setRegisterStep(1);
      const located = await locateRestaurantAddress(true);
      if (!located) return;
      return;
    }
    submitRestaurant();
  }

  function updateMenuDraftItem(index, field, value) {
    setForm((current) => ({
      ...current,
      menuDraftItems: (current.menuDraftItems || []).map((item, itemIndex) => (
        itemIndex === index ? { ...item, [field]: value } : item
      ))
    }));
  }

  function setRestaurantFormField(field, value, errorField = field) {
    setForm((current) => ({ ...current, [field]: value }));
    setRegisterErrors((current) => ({ ...current, [errorField]: '' }));
  }

  function addMenuDraftItem() {
    setForm((current) => ({
      ...current,
      menuDraftItems: [
        ...(current.menuDraftItems || []),
        { id: `draft-menu-${Date.now()}`, name: '', description: '', category: '', price: '', image: '' }
      ]
    }));
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
    const issue = moderationIssueForText(comment);
    if (issue) {
      Alert.alert('Avaliacao bloqueada', issue);
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

  function removeReview(review) {
    if (!isAdmin) return;
    Alert.alert(
      'Remover avaliacao',
      'Esta avaliacao deixara de aparecer no app e sera marcada como removida para moderacao.',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Remover',
          style: 'destructive',
          onPress: () => {
            setReviewsByRestaurant((current) => ({
              ...current,
              [review.restaurantId]: (current[review.restaurantId] || []).filter((item) => item.id !== review.id)
            }));
            updateReviewInDb(review.id, { status: 'removed', removedBy: currentUser?.id, removedAt: new Date().toISOString() }).catch(() => {});
          }
        }
      ]
    );
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
    const discoveryCategories = [
      ['Sushi', 'sushi', 'https://images.unsplash.com/photo-1579871494447-9811cf80d66c?auto=format&fit=crop&w=400&q=84'],
      ['Pizza', 'pizza', 'https://images.unsplash.com/photo-1574071318508-1cdbab80d002?auto=format&fit=crop&w=400&q=84'],
      ['Hambúrguer', 'hamburg', 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&w=400&q=84'],
      ['Brasileira', 'brasileir', 'https://images.unsplash.com/photo-1547592180-85f173990554?auto=format&fit=crop&w=400&q=84'],
      ['Cafés', 'caf', 'https://images.unsplash.com/photo-1509042239860-f550ce710b93?auto=format&fit=crop&w=400&q=84']
    ];
    const featuredRestaurant = discoveryRestaurants[homeDiscoveryIndex % Math.max(1, discoveryRestaurants.length)] || topRestaurants[0];
    const nearbyRestaurants = topRestaurants.slice(1, 6);
    const newRestaurants = [...publicRestaurants]
      .sort((a, b) => Number(b.createdAtMs || 0) - Number(a.createdAtMs || 0))
      .slice(0, 4);

    return (
      <View style={styles.discoveryPage}>
        <View style={styles.discoveryTopBar}>
          <BrandLogo />
          <View style={styles.discoveryTopActions}>
            <Pressable accessibilityRole="button" accessibilityLabel="Abrir notificações" hitSlop={8} onPress={openNotifications} style={({ pressed }) => [styles.discoveryIconButton, pressed && styles.activePress]}>
              <Ionicons name="notifications-outline" size={24} color={colors.ink} />
              {unreadActivityCount ? <View style={styles.discoveryNotificationDot} /> : null}
            </Pressable>
            <Pressable onPress={() => setTab('Perfil')} style={styles.discoveryAvatar}>
              {currentUser?.photo ? <Image source={imageSource(currentUser.photo)} style={styles.discoveryAvatarImage} /> : <Text style={styles.discoveryAvatarText}>{(currentUser?.name || 'D').slice(0, 1).toUpperCase()}</Text>}
            </Pressable>
          </View>
        </View>

        <View style={styles.discoveryHeadingRow}>
          <Text style={styles.discoveryTitle}>Descobrir</Text>
          <Pressable onPress={openLocationPicker} style={styles.discoveryLocation}>
            <Ionicons name="location" size={15} color={colors.redDark} />
            <Text numberOfLines={1} style={styles.discoveryLocationText}>{selectedArea || 'São José do Rio Preto'}</Text>
            <Ionicons name="chevron-down" size={14} color={colors.muted} />
          </Pressable>
        </View>

        <View style={styles.discoverySearch}>
          <Ionicons name="search-outline" size={21} color={colors.muted} />
          <TextInput
            value={query}
            onChangeText={setQuery}
            onSubmitEditing={() => navigateTo('results')}
            placeholder="O que você quer comer?"
            placeholderTextColor="#918d86"
            style={styles.discoverySearchInput}
          />
          <Pressable accessibilityRole="button" accessibilityLabel="Abrir filtros" hitSlop={6} onPress={() => { setFiltersOpen(true); setTab('Mapa'); }} style={({ pressed }) => [styles.discoveryFilterButton, pressed && styles.activePress]}>
            <Ionicons name="options-outline" size={20} color={colors.ink} />
          </Pressable>
        </View>

        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.discoveryCategoryRow}>
          {discoveryCategories.map(([label, term, fallbackImage]) => {
            const match = publicRestaurants.find((item) => normalize(`${item.name} ${item.type} ${item.tags || ''}`).includes(term));
            return (
            <Pressable
              key={label}
              onPress={() => navigateTo('results', { title: label, trendTerms: [term] })}
              style={({ pressed }) => [styles.discoveryCategory, pressed && styles.pressed]}
            >
              <Image source={{ uri: fallbackImage }} style={styles.discoveryCategoryImage} />
              <Text style={styles.discoveryCategoryLabel}>{label}</Text>
            </Pressable>
            );
          })}
        </ScrollView>

        <SectionTitle title="Perto de você" action="Ver tudo" onPress={() => navigateTo('results', { title: 'Perto de você' })} />
        {featuredRestaurant ? (
          <Pressable accessibilityRole="button" accessibilityLabel={`Abrir restaurante ${featuredRestaurant.name}`} onPress={() => setSelectedRestaurant(featuredRestaurant)} style={({ pressed }) => [styles.discoveryFeatureCard, pressed && styles.pressed]}>
            <Image source={imageSource(featuredRestaurant.coverPhoto || featuredRestaurant.image || featuredRestaurant.logo)} style={styles.discoveryFeatureImage} />
            <View style={styles.discoveryFeatureScrim} />
            <Pressable onPress={(event) => { event?.stopPropagation?.(); toggleFavorite(featuredRestaurant.name); }} style={styles.discoverySaveButton}>
              <Ionicons name={favorites.includes(featuredRestaurant.name) ? 'bookmark' : 'bookmark-outline'} size={22} color="#FFFFFF" />
            </Pressable>
            <View style={styles.discoveryFeatureCopy}>
              <Text numberOfLines={1} style={styles.discoveryFeatureName}>{featuredRestaurant.name}</Text>
              <View style={styles.discoveryFeatureMetaRow}>
                <Text numberOfLines={1} style={styles.discoveryFeatureMeta}>{featuredRestaurant.type} • {formatDistance(featuredRestaurant.distanceKm)}</Text>
                <View style={styles.discoveryFeatureRating}>
                  <Ionicons name="star" size={13} color="#FFC24B" />
                  <Text style={styles.discoveryFeatureRatingText}>{scoreValue(featuredRestaurant).toFixed(1)}</Text>
                </View>
              </View>
            </View>
          </Pressable>
        ) : null}

        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.discoveryNearbyRow}>
          {nearbyRestaurants.map((item) => (
            <Pressable key={item.id} onPress={() => setSelectedRestaurant(item)} style={styles.discoveryNearbyCard}>
              <Image source={imageSource(item.coverPhoto || item.image || item.logo)} style={styles.discoveryNearbyImage} />
              <Text numberOfLines={1} style={styles.discoveryNearbyName}>{item.name}</Text>
              <Text numberOfLines={1} style={styles.discoveryNearbyMeta}>{item.type} • {formatDistance(item.distanceKm)}</Text>
            </Pressable>
          ))}
        </ScrollView>

        <SectionTitle title="Novidades" action="Ver tudo" onPress={() => navigateTo('results', { title: 'Novidades' })} />
        <View style={styles.discoveryNewsGrid}>
          {newRestaurants.map((item) => (
            <Pressable key={item.id} onPress={() => setSelectedRestaurant(item)} style={styles.discoveryNewsCard}>
              <Image source={imageSource(item.coverPhoto || item.image || item.logo)} style={styles.discoveryNewsImage} />
              <Text numberOfLines={1} style={styles.discoveryNewsName}>{item.name}</Text>
              <Text numberOfLines={1} style={styles.discoveryNewsMeta}>{item.district}</Text>
            </Pressable>
          ))}
        </View>
      </View>
    );
  }

  function renderSearch() {
    return (
      <View style={styles.mapPage}>
        <View style={styles.mapSearchHeader}>
          <View style={styles.searchPageField}>
          <Ionicons name="search-outline" size={21} color={colors.muted} />
            <TextInput value={query} onChangeText={setQuery} placeholder="Onde vamos comer?" placeholderTextColor="#8A8179" style={styles.pageInput} />
          </View>
          <Pressable accessibilityRole="button" accessibilityLabel="Abrir meu perfil" onPress={() => setTab('Perfil')} style={styles.mapProfileAvatar}>
            {currentUser?.photo ? (
              <Image source={imageSource(currentUser.photo)} style={styles.mapProfileAvatarImage} />
            ) : (
              <Text style={styles.mapProfileAvatarText}>{initialsForName(currentUser?.name, 'D')}</Text>
            )}
          </Pressable>
        </View>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.mapQuickFilters}>
          {[
            ['Perto de mim', 'navigate', selectedArea === 'Perto de mim' || radiusKm === 1, requestUserLocation],
            ['Aberto agora', 'time-outline', selectedCategory === 'Aberto agora', () => setSelectedCategory(selectedCategory === 'Aberto agora' ? '' : 'Aberto agora')],
            ['Cozinha', 'restaurant-outline', Boolean(selectedCategory && !['Aberto agora', 'Até R$80'].includes(selectedCategory)), () => setFiltersOpen((value) => !value)],
            ['Preço', 'cash-outline', selectedCategory === 'Até R$80', () => setSelectedCategory(selectedCategory === 'Até R$80' ? '' : 'Até R$80')]
          ].map(([label, icon, active, onPress]) => (
            <Pressable
              key={label}
              accessibilityRole="button"
              accessibilityState={{ selected: active }}
              onPress={onPress}
              style={[styles.mapQuickFilter, active && styles.mapQuickFilterActive]}
            >
              <Ionicons name={icon} size={17} color={active ? colors.redDark : colors.ink} />
              <Text style={[styles.mapQuickFilterText, active && styles.mapQuickFilterTextActive]}>{label}</Text>
              {['Cozinha', 'Preço'].includes(label) ? <Ionicons name="chevron-down" size={14} color={active ? colors.redDark : colors.muted} /> : null}
            </Pressable>
          ))}
        </ScrollView>
        {filtersOpen ? (
          <View style={styles.filterDrawer}>
            <View style={styles.filterSummary}>
              <Ionicons name="location-outline" size={16} color={colors.redDark} />
              <Text numberOfLines={1} style={styles.filterSummaryText}>{selectedArea} • raio de {radiusKm} km{selectedCategory ? ` • ${selectedCategory}` : ''}</Text>
            </View>
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
          onFavorite={toggleFavorite}
          onDirections={openMaps}
          onLocate={requestUserLocation}
          favoriteNames={favorites}
          postCountsByRestaurant={postCountsByRestaurant}
          onInteractionChange={setMapInteracting}
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
    const comments = commentsForPost(post, state);
    const likes = Number(post.likes || 0) + (state.liked ? 1 : 0);
    const reposts = Number(post.reposts || 0) + (state.reposted ? 1 : 0);
    const images = (post.images?.length ? post.images : [post.image]).filter(Boolean).slice(0, 4);
    const imageSize = Math.max(280, Math.min(width, 560));
    const activePhoto = feedPhotoIndexes[post.id] || 0;
    const authorAvatar = postAuthorAvatar(post, currentUser);
    const authorInitials = initialsForName(post.author, 'D');
    return (
      <View key={post.id} style={styles.feedPostCard}>
        <View style={styles.feedPostHeader}>
          <Pressable onPress={() => openFeedProfile(post)} style={({ pressed }) => [styles.feedAvatarButton, pressed && styles.activePress]}>
            {authorAvatar ? (
              <Image source={imageSource(authorAvatar)} style={styles.feedAvatar} />
            ) : (
              <View style={styles.feedAvatarFallback}>
                <Text style={styles.feedAvatarInitials}>{authorInitials}</Text>
              </View>
            )}
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
              <Pressable
                key={`${post.id}-photo-${index}`}
                accessibilityRole="button"
                accessibilityLabel={`Abrir publicacao de ${post.author}`}
                onPress={() => openFeedPost(post)}
                style={({ pressed }) => [styles.feedPhotoSlide, { width: imageSize }, pressed && styles.pressed]}
              >
                <Image accessibilityLabel={post.caption || post.title} source={imageSource(photo)} style={styles.feedImage} />
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
          <View style={styles.feedActionsRow}>
            <Pressable onPress={() => toggleFeedFlag(post.id, 'liked')} style={styles.feedActionButton}>
              <Ionicons name={state.liked ? 'heart' : 'heart-outline'} size={22} color={state.liked ? colors.redDark : colors.ink} />
            </Pressable>
            <Pressable onPress={() => toggleFeedFlag(post.id, 'commenting')} style={styles.feedActionButton}>
              <Ionicons name="chatbubble-outline" size={21} color={colors.ink} />
            </Pressable>
            <Pressable onPress={() => shareFeedPost(post)} style={styles.feedActionButton}>
              <Ionicons name="paper-plane-outline" size={21} color={colors.ink} />
            </Pressable>
            <Pressable onPress={() => toggleFeedFlag(post.id, 'reposted')} style={styles.feedActionButton}>
              <Ionicons name="repeat-outline" size={22} color={state.reposted ? colors.redDark : colors.ink} />
            </Pressable>
            <Pressable onPress={() => toggleFeedFlag(post.id, 'saved')} style={[styles.feedActionButton, styles.feedSaveAction]}>
              <Ionicons name={state.saved ? 'bookmark' : 'bookmark-outline'} size={21} color={state.saved ? colors.redDark : colors.ink} />
            </Pressable>
          </View>
          <Text style={styles.feedLikesText}>{likes} curtidas{reposts ? ` • ${reposts} republicações` : ''}</Text>
          <Pressable accessibilityRole="button" accessibilityLabel={`Ver detalhes da publicacao de ${post.author}`} onPress={() => openFeedPost(post)}>
            <Text style={styles.feedCaption}><Text style={styles.feedCaptionAuthor}>{post.author} </Text>{post.caption || post.title}</Text>
          </Pressable>
          {post.restaurant?.id && !String(post.restaurant.id).startsWith('custom-restaurant-') ? (
            <View style={styles.feedPlaceActions}>
              <Pressable onPress={() => showRestaurantOnMap(post.restaurant)} style={styles.feedPlaceAction}>
                <Ionicons name="map-outline" size={16} color={colors.redDark} />
                <Text style={styles.feedPlaceActionText}>Ver no mapa</Text>
              </Pressable>
              <Pressable onPress={() => toggleFavorite(post.restaurant.name)} style={styles.feedPlaceAction}>
                <Ionicons name={favorites.includes(post.restaurant.name) ? 'bookmark' : 'bookmark-outline'} size={16} color={colors.redDark} />
                <Text style={styles.feedPlaceActionText}>{favorites.includes(post.restaurant.name) ? 'Salvo' : 'Salvar lugar'}</Text>
              </Pressable>
              <Pressable onPress={() => openMaps(post.restaurant)} style={styles.feedPlaceAction}>
                <Ionicons name="navigate-outline" size={16} color={colors.redDark} />
                <Text style={styles.feedPlaceActionText}>Como chegar</Text>
              </Pressable>
            </View>
          ) : null}

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
    const followedIds = new Set((currentUser?.followingProfiles || []).map((profile) => String(profile.id)));
    const visibleFeedPosts = feedMode === 'Seguindo'
      ? feedPosts.filter((post) => followedIds.has(String(post.authorId || post.authorProfile?.id)))
      : feedPosts;
    return (
      <View style={styles.socialFeedPage}>
        <View style={styles.socialFeedHeader}>
          <View style={styles.socialFeedTopBar}>
            <BrandLogo />
            <Pressable onPress={openNotifications} style={styles.discoveryIconButton}>
              <Ionicons name="notifications-outline" size={24} color={colors.ink} />
              {unreadActivityCount ? <View style={styles.discoveryNotificationDot} /> : null}
            </Pressable>
          </View>
          <Text style={styles.socialFeedTitle}>Feed</Text>
          <View style={styles.socialFeedTabs}>
            {['Para você', 'Seguindo'].map((mode) => (
              <Pressable key={mode} onPress={() => setFeedMode(mode)} style={feedMode === mode ? styles.socialFeedTabActive : styles.socialFeedTab}>
                <Text style={feedMode === mode ? styles.socialFeedTabActiveText : styles.socialFeedTabText}>{mode}</Text>
              </Pressable>
            ))}
          </View>
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
            <Text style={styles.feedComposerTitle}>Compartilhe uma descoberta</Text>
          </View>
          <Pressable onPress={openFeedComposer} style={styles.feedComposerButton}>
            <Ionicons name="add" size={20} color={colors.card} />
          </Pressable>
        </View>
        <View style={styles.feedList}>
          {visibleFeedPosts.length ? visibleFeedPosts.map(renderFeedPost) : (
            <View style={styles.feedFollowingEmpty}>
              <Ionicons name="people-outline" size={26} color={colors.redDark} />
              <Text style={styles.feedFollowingEmptyTitle}>Seu feed de seguindo está começando</Text>
              <Text style={styles.feedFollowingEmptyText}>Abra um perfil pelo feed e siga pessoas para acompanhar novas descobertas.</Text>
            </View>
          )}
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
      <View style={styles.savedPage}>
        <View style={styles.savedTopBar}>
          <Pressable onPress={goBack} style={styles.savedTopButton}>
            <Ionicons name="chevron-back" size={23} color={colors.ink} />
          </Pressable>
          <Text style={styles.savedTitle}>Salvos</Text>
          <View style={styles.savedTopActions}>
            <Pressable onPress={() => navigateTo('rankings')} style={styles.savedTopButton}>
              <Ionicons name="search-outline" size={22} color={colors.ink} />
            </Pressable>
            <Pressable onPress={() => navigateTo('rankings')} style={styles.savedTopButton}>
              <Ionicons name="options-outline" size={22} color={colors.ink} />
            </Pressable>
          </View>
        </View>

        <SectionTitle title="Minhas coleções" action="Criar coleção" onPress={() => navigateTo('rankings')} />
        <View style={styles.savedCollectionList}>
          {collectionCurations.slice(0, 4).map((collection, index) => (
            <Pressable key={collection.title} onPress={() => navigateTo('collectionDetail', { title: collection.title })} style={styles.savedCollectionCard}>
              <Image source={{ uri: collection.image }} style={styles.savedCollectionImage} />
              <View style={styles.savedCollectionCopy}>
                <Text numberOfLines={1} style={styles.savedCollectionName}>{index === 0 && favorites.length ? 'Favoritos' : collection.title}</Text>
                <Text style={styles.savedCollectionCount}>{index === 0 ? favorites.length : getCollectionRestaurants(publicRestaurants, collection).length} itens</Text>
                <View style={styles.savedCollectionPrivacy}>
                  <Ionicons name={index % 2 ? 'lock-closed-outline' : 'globe-outline'} size={12} color={colors.muted} />
                  <Text style={styles.savedCollectionPrivacyText}>{index % 2 ? 'Privada' : 'Pública'}</Text>
                </View>
              </View>
              <Ionicons name="chevron-forward" size={21} color={colors.muted} />
            </Pressable>
          ))}
        </View>

        <SectionTitle title="Lugares salvos" />
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
          {isRestaurantOwner || isAdmin ? (
            <AppButton onPress={() => currentUser ? startRestaurantRegistration() : requireLogin({ type: 'restaurant-register' })}>Cadastrar restaurante</AppButton>
          ) : null}
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
            <Pressable accessibilityLabel="Abrir salvos" onPress={() => navigateTo('favorites')} style={styles.dineProfileTopButton}>
              <Ionicons name="bookmark-outline" size={25} color={colors.ink} />
            </Pressable>
            <Pressable onPress={openNotifications} style={styles.dineProfileTopButton}>
              <Ionicons name="notifications-outline" size={26} color={colors.ink} />
              <View style={styles.dineProfileBellDot} />
            </Pressable>
            <Pressable accessibilityRole="button" accessibilityLabel="Abrir configurações" onPress={() => navigateTo('settings')} style={styles.dineProfileTopButton}>
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
    const authoredPosts = feedPosts.filter((post) => currentUser?.id && String(post.authorId) === String(currentUser.id));
    const visitedRestaurantIds = new Set(gamification.awarded?.known || []);
    const visitedRestaurants = publicRestaurants.filter((restaurant) => visitedRestaurantIds.has(restaurant.id)).slice(0, 5);
    const profileMedia = [
      ...authoredPosts.map((post) => ({ id: post.id, image: post.images?.[0] || post.image, post })),
      ...profileReviews.map((review) => ({ id: `review-${review.id}`, image: review.image, restaurant: review.restaurant }))
    ].filter((item) => item.image).slice(0, 9);
    const nextMeta = rank.next
      ? `${formatCompactCount(gamification.points)} / ${formatCompactCount(rank.next.minPoints)} pts para o próximo nível`
      : `${formatCompactCount(gamification.points)} pts no nível máximo`;

    return (
      <View style={styles.dineProfilePage}>
        <View style={styles.dineProfileTopBar}>
          <Text style={styles.dineProfileTopTitle}>Perfil</Text>
          <Text style={styles.dineProfileLogo}>Dine</Text>
          <View style={styles.dineProfileTopActions}>
            <Pressable accessibilityLabel="Abrir salvos" onPress={() => navigateTo('favorites')} style={styles.dineProfileTopButton}>
              <Ionicons name="bookmark-outline" size={25} color={colors.ink} />
            </Pressable>
            <Pressable onPress={openNotifications} style={styles.dineProfileTopButton}>
              <Ionicons name="notifications-outline" size={26} color={colors.ink} />
              <View style={styles.dineProfileBellDot} />
            </Pressable>
            <Pressable accessibilityRole="button" accessibilityLabel="Abrir configurações" onPress={() => navigateTo('settings')} style={styles.dineProfileTopButton}>
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
            [String(authoredPosts.length), 'publicações'],
            [String(Math.max(favorites.length, gamification.metrics.known || 0)), 'lugares'],
            [formatCompactCount(Number(currentUser?.followers || 0)), 'seguidores']
          ].map(([value, label], index) => (
            <View key={label} style={[styles.dineProfileStatItem, index > 0 && styles.dineProfileStatDivider]}>
              <Text style={styles.dineProfileStatValue}>{value}</Text>
              <Text style={styles.dineProfileStatLabel}>{label}</Text>
            </View>
          ))}
        </View>

        <View style={styles.profilePrimaryActions}>
          <Pressable onPress={saveProfileInstagram} style={styles.profileEditAction}>
            <Text style={styles.profileEditActionText}>Editar perfil</Text>
          </Pressable>
          <Pressable onPress={() => navigateTo('favorites')} style={styles.profileSavedAction}>
            <Ionicons name="bookmark-outline" size={18} color={colors.ink} />
            <Text style={styles.profileSavedActionText}>Salvos</Text>
          </Pressable>
          {!isRestaurantOwner ? (
            <Pressable accessibilityRole="button" accessibilityLabel="Abrir minhas reservas" onPress={() => navigateTo('myReservations')} style={styles.profileSavedAction}>
              <Ionicons name="calendar-outline" size={18} color={colors.ink} />
              <Text style={styles.profileSavedActionText}>Reservas</Text>
            </Pressable>
          ) : null}
        </View>

        <View style={styles.profileFoodMap}>
          <View style={styles.profileFoodMapHeader}>
            <View style={styles.profileFoodMapIcon}>
              <Ionicons name="map-outline" size={21} color={colors.redDark} />
            </View>
            <View style={styles.profileFoodMapCopy}>
              <Text style={styles.profileFoodMapTitle}>Meu mapa gastronômico</Text>
              <Text style={styles.profileFoodMapText}>{Math.max(visitedRestaurantIds.size, gamification.metrics.known || 0)} lugares visitados</Text>
            </View>
            <Pressable onPress={() => { setActiveScreen(null); setTab('Mapa'); }} style={styles.profileFoodMapButton}>
              <Text style={styles.profileFoodMapButtonText}>Abrir mapa</Text>
            </Pressable>
          </View>
          {visitedRestaurants.length ? (
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.profileFoodMapPlaces}>
              {visitedRestaurants.map((restaurant) => (
                <Pressable key={restaurant.id} onPress={() => showRestaurantOnMap(restaurant)} style={styles.profileFoodMapPlace}>
                  <Image source={imageSource(restaurant.logo || restaurant.image)} style={styles.profileFoodMapPlaceImage} />
                  <Text numberOfLines={1} style={styles.profileFoodMapPlaceName}>{restaurant.name}</Text>
                </Pressable>
              ))}
            </ScrollView>
          ) : null}
        </View>

        <View style={styles.profileContentTabs}>
          <View style={styles.profileContentTabActive}>
            <Ionicons name="grid-outline" size={17} color={colors.redDark} />
            <Text style={styles.profileContentTabActiveText}>Publicações</Text>
          </View>
          <Pressable onPress={() => navigateTo('favorites')} style={styles.profileContentTab}>
            <Ionicons name="location-outline" size={17} color={colors.muted} />
            <Text style={styles.profileContentTabText}>Lugares</Text>
          </Pressable>
        </View>
        {profileMedia.length ? (
          <View style={styles.profileMediaGrid}>
            {profileMedia.map((item) => (
              <Pressable
                key={item.id}
                onPress={() => item.post ? openFeedPost(item.post) : item.restaurant ? setSelectedRestaurant(item.restaurant) : null}
                style={styles.profileMediaTile}
              >
                <Image source={imageSource(item.image)} style={styles.profileMediaImage} />
              </Pressable>
            ))}
          </View>
        ) : (
          <Pressable onPress={openFeedComposer} style={styles.profileEmptyMedia}>
            <Ionicons name="camera-outline" size={25} color={colors.redDark} />
            <Text style={styles.profileEmptyMediaTitle}>Compartilhe sua primeira descoberta</Text>
            <Text style={styles.profileEmptyMediaText}>Suas publicações e avaliações aparecerão aqui.</Text>
          </Pressable>
        )}

        <Text style={styles.profileJourneyTitle}>Sua jornada no Dine</Text>
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
        <View style={styles.collectionDetailActions}>
          <Pressable onPress={() => shareCollection(collection, items)} style={styles.collectionDetailAction}>
            <Ionicons name="share-social-outline" size={19} color={colors.ink} />
            <Text style={styles.collectionDetailActionText}>Compartilhar</Text>
          </Pressable>
          <Pressable onPress={() => openCollectionRoute(items)} style={[styles.collectionDetailAction, styles.collectionDetailActionPrimary]}>
            <Ionicons name="navigate-outline" size={19} color={colors.card} />
            <Text style={[styles.collectionDetailActionText, styles.collectionDetailActionTextPrimary]}>Criar rota</Text>
          </Pressable>
        </View>
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
    const socialTypes = new Set(['follow', 'like', 'comment', 'repost']);
    const placeTypes = new Set(['restaurant', 'restaurant-update', 'offer']);
    const activityItems = activityNotifications.filter((item) => (
      activityFilter === 'Todas'
      || (activityFilter === 'Social' && socialTypes.has(item.type))
      || (activityFilter === 'Lugares' && placeTypes.has(item.type))
    ));
    const notificationIcons = {
      follow: 'person-add-outline',
      like: 'heart',
      comment: 'chatbubble-outline',
      repost: 'repeat',
      restaurant: 'restaurant-outline',
      'restaurant-update': 'sparkles-outline',
      offer: 'gift-outline'
    };
    return (
      <View style={styles.activityPage}>
        {renderScreenHeader('Atividade')}
        <View style={styles.activityTabs}>
          {['Todas', 'Social', 'Lugares'].map((label) => (
            <Pressable
              accessibilityRole="tab"
              accessibilityState={{ selected: activityFilter === label }}
              key={label}
              onPress={() => setActivityFilter(label)}
              style={[styles.activityTab, activityFilter === label && styles.activityTabActive]}
            >
              <Text style={[styles.activityTabText, activityFilter === label && styles.activityTabTextActive]}>{label}</Text>
            </Pressable>
          ))}
        </View>
        <Text style={styles.activityGroupTitle}>Recentes</Text>
        <View style={styles.activityList}>
          {activityItems.length ? activityItems.map((notification) => (
            <Pressable
              accessibilityRole="button"
              accessibilityLabel={`Abrir atividade de ${notification.actorName || 'Dine'}`}
              key={notification.id}
              onPress={() => openActivityNotification(notification)}
              style={styles.activityItem}
            >
              <View style={styles.activityAvatar}>
                {notification.actorAvatar ? (
                  <Image source={imageSource(notification.actorAvatar)} style={styles.activityAvatarImage} />
                ) : (
                  <>
                    <Text style={styles.activityAvatarText}>{String(notification.actorName || 'D').slice(0, 1).toUpperCase()}</Text>
                    <View style={styles.activityTypeBadge}>
                      <Ionicons name={notificationIcons[notification.type] || 'notifications-outline'} size={11} color={colors.card} />
                    </View>
                  </>
                )}
              </View>
              <View style={styles.activityCopy}>
                <Text style={styles.activityText}><Text style={styles.activityAuthor}>{notification.actorName || 'Dine'} </Text>{notification.message || 'enviou uma novidade para você.'}</Text>
                <Text style={styles.activityTime}>{formatPostDate(notification.createdAt)}</Text>
              </View>
              {notification.previewImage ? <Image source={imageSource(notification.previewImage)} style={styles.activityThumb} /> : <Ionicons name="chevron-forward" size={18} color={colors.muted} />}
              {notification.status === 'unread' ? <View style={styles.activityUnread} /> : null}
            </Pressable>
          )) : (
            <View style={styles.activityEmpty}>
              <Ionicons name={activityFilter === 'Lugares' ? 'restaurant-outline' : 'notifications-outline'} size={26} color={colors.redDark} />
              <Text style={styles.activityEmptyText}>
                {activityFilter === 'Todas' ? 'Curtidas, comentários e novos seguidores aparecerão aqui.' : `Nenhuma atividade em ${activityFilter.toLowerCase()} ainda.`}
              </Text>
            </View>
          )}
        </View>

        <SectionTitle title="Preferências de notificações" />
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

  function renderMyReservationsScreen() {
    const userReservations = reservations
      .filter((item) => item.userId === currentUser?.id)
      .sort((a, b) => `${b.date} ${b.time}`.localeCompare(`${a.date} ${a.time}`));
    const userWaitlist = waitlistEntries
      .filter((item) => item.userId === currentUser?.id && item.status !== 'cancelled')
      .sort((a, b) => `${a.date} ${a.time}`.localeCompare(`${b.date} ${b.time}`));
    return (
      <View>
        {renderScreenHeader('Minhas reservas', 'Confirmações, histórico e listas de espera')}
        <View style={styles.bookingSummaryGrid}>
          {[
            ['calendar-outline', userReservations.filter((item) => ['pending', 'confirmed'].includes(item.status)).length, 'Próximas'],
            ['checkmark-circle-outline', userReservations.filter((item) => item.status === 'completed').length, 'Concluídas'],
            ['time-outline', userWaitlist.filter((item) => item.status === 'waiting').length, 'Na espera']
          ].map(([icon, value, label]) => (
            <View key={label} style={styles.bookingSummaryCard}>
              <Ionicons name={icon} size={21} color={colors.redDark} />
              <Text style={styles.bookingSummaryValue}>{value}</Text>
              <Text style={styles.bookingSummaryLabel}>{label}</Text>
            </View>
          ))}
        </View>

        <SectionTitle title="Reservas" />
        <View style={styles.bookingList}>
          {userReservations.length ? userReservations.map((reservation) => (
            <View key={reservation.id} style={styles.bookingCard}>
              <View style={styles.bookingCardHeader}>
                <View style={styles.bookingRestaurantAvatar}>
                  {reservation.restaurantImage ? <Image source={imageSource(reservation.restaurantImage)} style={styles.bookingRestaurantImage} /> : <Ionicons name="restaurant-outline" size={20} color={colors.redDark} />}
                </View>
                <View style={styles.bookingCardCopy}>
                  <Text style={styles.bookingRestaurantName}>{reservation.restaurantName}</Text>
                  <Text style={styles.bookingMeta}>{reservation.date} • {reservation.time} • {reservation.partySize} pessoas</Text>
                </View>
                <View style={[styles.bookingStatusPill, { backgroundColor: `${reservationStatusColor(reservation.status)}18` }]}>
                  <Text style={[styles.bookingStatusText, { color: reservationStatusColor(reservation.status) }]}>{reservationStatusLabel(reservation.status)}</Text>
                </View>
              </View>
              {reservation.notes ? <Text style={styles.bookingNotes}>{reservation.notes}</Text> : null}
              {['pending', 'confirmed'].includes(reservation.status) ? (
                <Pressable onPress={() => updateReservationStatus(reservation, 'cancelled')} style={styles.bookingCancelButton}>
                  <Text style={styles.bookingCancelText}>Cancelar reserva</Text>
                </Pressable>
              ) : null}
            </View>
          )) : (
            <View style={styles.emptyState}>
              <Text style={styles.emptyTitle}>Nenhuma reserva ainda</Text>
              <Text style={styles.emptyText}>Abra um restaurante e escolha um horário disponível.</Text>
            </View>
          )}
        </View>

        <SectionTitle title="Lista de espera" />
        <View style={styles.bookingList}>
          {userWaitlist.length ? userWaitlist.map((entry) => {
            const position = waitlistEntries
              .filter((item) => item.restaurantId === entry.restaurantId && item.date === entry.date && item.time === entry.time && item.status === 'waiting')
              .sort((a, b) => String(a.createdAt).localeCompare(String(b.createdAt)))
              .findIndex((item) => item.id === entry.id) + 1;
            return (
              <View key={entry.id} style={styles.bookingCard}>
                <View style={styles.bookingCardHeader}>
                  <View style={styles.bookingRestaurantAvatar}><Ionicons name="time-outline" size={21} color={colors.redDark} /></View>
                  <View style={styles.bookingCardCopy}>
                    <Text style={styles.bookingRestaurantName}>{entry.restaurantName}</Text>
                    <Text style={styles.bookingMeta}>{entry.date}{entry.time ? ` • ${entry.time}` : ''} • {entry.partySize} pessoas</Text>
                  </View>
                  <View style={styles.bookingWaitPosition}>
                    <Text style={styles.bookingWaitPositionValue}>{position > 0 ? position : '—'}</Text>
                    <Text style={styles.bookingWaitPositionLabel}>posição</Text>
                  </View>
                </View>
                <Text style={styles.bookingNotes}>{waitlistStatusLabel(entry.status)}</Text>
                {entry.status === 'waiting' ? (
                  <Pressable onPress={() => updateWaitlistStatus(entry, 'cancelled')} style={styles.bookingCancelButton}>
                    <Text style={styles.bookingCancelText}>Sair da lista</Text>
                  </Pressable>
                ) : null}
              </View>
            );
          }) : (
            <View style={styles.emptyState}>
              <Text style={styles.emptyTitle}>Nenhuma espera ativa</Text>
              <Text style={styles.emptyText}>Quando um horário estiver lotado, você poderá entrar na fila.</Text>
            </View>
          )}
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
          <Text style={styles.panelText}>Tipo de acesso: {isAdmin ? 'Administrador' : isRestaurantOwner ? 'Dono de restaurante' : currentUser ? 'Usuário' : 'Visitante'}</Text>
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
          <SettingsActionRow icon="trash-outline" title="Excluir minha conta" subtitle="Remover perfil, favoritos e solicitar exclusao dos dados sincronizados" onPress={deleteCurrentAccount} />
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
        <View style={styles.settingsList}>
          <SettingsActionRow
            icon="open-outline"
            title="Politica de privacidade completa"
            subtitle={privacyPolicyUrl || 'URL ainda nao configurada'}
            onPress={() => privacyPolicyUrl
              ? Linking.openURL(privacyPolicyUrl).catch(() => Alert.alert('Privacidade', 'Nao conseguimos abrir a politica agora.'))
              : Alert.alert('Privacidade', 'Configure EXPO_PUBLIC_PRIVACY_POLICY_URL antes da publicacao.')}
          />
          <SettingsActionRow icon="trash-outline" title="Excluir minha conta" subtitle="Disponivel em Perfil > Configuracoes > Seguranca" onPress={() => navigateTo('security')} />
        </View>
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
          <SettingsActionRow icon="share-social-outline" title="Compartilhar Dine" subtitle="Enviar convite para outra pessoa" onPress={() => Share.share({ message: `Conheca o Dine e descubra restaurantes perto de voce.${publicAppUrl ? ` ${publicAppUrl}` : ''}` })} />
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
          ...(!isRestaurantOwner ? [['calendar-outline', 'Minhas reservas', 'Confirmações e listas de espera', () => navigateTo('myReservations')]] : []),
          ['restaurant-outline', copy.preferences, copy.preferencesSub, () => navigateTo('preferences')],
          ['diamond-outline', 'Dine+', 'Clube, benefícios e experiências exclusivas', () => navigateTo('dinePlus')]
        ]
      },
      ...(isRestaurantOwner || isAdmin ? [{
        title: copy.restaurants,
        items: [
          ['storefront-outline', copy.restaurantPanel, copy.restaurantPanelSub, () => currentUser ? navigateTo('restaurantPanel') : requireLogin({ type: 'restaurant-register' })],
          ['add-circle-outline', copy.registerRestaurant, copy.registerRestaurantSub, () => currentUser ? startRestaurantRegistration() : requireLogin({ type: 'restaurant-register' })],
          ...(isAdmin ? [['shield-outline', copy.admin, copy.adminSub, () => navigateTo('adminApprovals')]] : [])
        ]
      }] : []),
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
    const isOwnProfile = Boolean(currentUser?.id && String(currentUser.id) === profileId);
    const totalLikes = posts.reduce((sum, post) => sum + Number(post.likes || 0), 0);
    const followers = profile.socialStatsLoaded
      ? Math.max(0, Number(profile.followers || 0))
      : Math.max(0, Number(profile.followers || totalLikes + 120) + (isFollowing ? 1 : 0));
    const instagram = String(profile.instagram || '').trim();
    const profileAvatar = String(profile.avatar || '').trim();
    const profileInitials = initialsForName(profile.name, 'D');
    const instagramUrl = instagram
      ? instagram.startsWith('http') ? instagram : `https://instagram.com/${instagram.replace('@', '')}`
      : '';
    const gridGap = 2;
    const tileSize = Math.floor((Math.min(width, 720) - 44 - gridGap * 2) / 3);
    return (
      <View style={styles.feedProfilePage}>
        <View style={styles.feedProfileTopBar}>
          <Pressable accessibilityRole="button" accessibilityLabel="Voltar ao feed" onPress={goBack} style={styles.feedProfileIconButton}>
            <Ionicons name="chevron-back" size={24} color={colors.ink} />
          </Pressable>
          <Text style={styles.feedProfileHandle} numberOfLines={1}>{profile.handle || '@perfil'}</Text>
          <Pressable onPress={() => reportContent({ type: 'profile', id: profile.id || profile.handle || profile.name, label: profile.handle || profile.name, source: 'feed-profile' })} style={styles.feedProfileIconButton}>
            <Ionicons name="flag-outline" size={21} color={colors.ink} />
          </Pressable>
        </View>
        <View style={styles.feedProfileHeader}>
          {profileAvatar ? (
            <Image source={imageSource(profileAvatar)} style={styles.feedProfileAvatar} />
          ) : (
            <View style={styles.feedProfileAvatarFallback}>
              <Text style={styles.feedProfileAvatarInitials}>{profileInitials}</Text>
            </View>
          )}
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
          {!isOwnProfile ? (
            <Pressable accessibilityRole="button" accessibilityLabel={isFollowing ? `Deixar de seguir ${profile.name}` : `Seguir ${profile.name}`} onPress={() => toggleFollowProfile(profile)} style={[styles.feedProfileFollowButton, isFollowing && styles.feedProfileFollowingButton]}>
              <Text style={[styles.feedProfileFollowText, isFollowing && styles.feedProfileFollowingText]}>{isFollowing ? 'Seguindo' : 'Seguir'}</Text>
            </Pressable>
          ) : null}
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
                accessibilityRole="button"
                accessibilityLabel={`Abrir publicacao de ${post.author || profile.name}`}
                onPress={() => openFeedPost(post)}
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
    const item = items.find((restaurant) => restaurant.id === ownerRestaurantId) || items[0];
    const itemReservations = reservations
      .filter((reservation) => reservation.restaurantId === item?.id)
      .sort((a, b) => `${a.date} ${a.time}`.localeCompare(`${b.date} ${b.time}`));
    const itemWaitlist = waitlistEntries
      .filter((entry) => entry.restaurantId === item?.id && entry.status !== 'cancelled')
      .sort((a, b) => String(a.createdAt).localeCompare(String(b.createdAt)));
    const today = nextReservationDates(1, 1)[0]?.key;
    const todayReservations = itemReservations.filter((reservation) => reservation.date === today && !['cancelled', 'no_show'].includes(reservation.status));
    const settings = reservationSettingsFor(item || {});
    const futureReservations = itemReservations.filter((reservation) => (
      reservation.date >= today && !['cancelled', 'completed', 'no_show'].includes(reservation.status)
    ));
    const ownerTabs = [
      ['Visão geral', 'grid-outline'],
      ['Reservas', 'calendar-outline'],
      ['Disponibilidade', 'time-outline'],
      ['Perfil', 'storefront-outline']
    ];
    return (
      <View style={styles.restaurantPanelScreen}>
        <View style={styles.ownerWorkspaceHeader}>
          <View style={styles.ownerWorkspaceBrand}>
            <Image source={dineLogo} style={styles.ownerWorkspaceLogo} resizeMode="contain" />
            <View>
              <Text style={styles.ownerWorkspaceEyebrow}>Dine para restaurantes</Text>
              <Text style={styles.ownerWorkspaceTitle}>Painel do parceiro</Text>
            </View>
          </View>
          <Pressable onPress={() => { setActiveScreen(null); setTab('Explorar'); }} style={styles.ownerWorkspaceConsumerButton}>
            <Ionicons name="eye-outline" size={17} color={colors.ink} />
            <Text style={styles.ownerWorkspaceConsumerText}>Ver como cliente</Text>
          </Pressable>
        </View>

        {items.length > 1 ? (
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.ownerRestaurantSwitcher}>
            {items.map((restaurant) => (
              <Pressable
                key={restaurant.id}
                onPress={() => setOwnerRestaurantId(restaurant.id)}
                style={[styles.ownerRestaurantSwitchCard, item?.id === restaurant.id && styles.ownerRestaurantSwitchCardActive]}
              >
                <Image source={imageSource(restaurant.logo || restaurant.image)} style={styles.ownerRestaurantSwitchImage} />
                <View>
                  <Text numberOfLines={1} style={styles.ownerRestaurantSwitchName}>{restaurant.name}</Text>
                  <Text style={styles.ownerRestaurantSwitchMeta}>{restaurant.status === 'published' ? 'Publicado' : 'Em configuração'}</Text>
                </View>
              </Pressable>
            ))}
          </ScrollView>
        ) : null}

        {!item ? (
          <View style={styles.ownerWorkspaceEmpty}>
            <View style={styles.ownerWorkspaceEmptyIcon}><Ionicons name="storefront-outline" size={32} color={colors.redDark} /></View>
            <Text style={styles.emptyTitle}>Configure seu primeiro restaurante</Text>
            <Text style={styles.emptyText}>Depois do cadastro, reservas, disponibilidade e perfil serão gerenciados por aqui.</Text>
            <AppButton onPress={() => startRestaurantRegistration()}>Cadastrar restaurante</AppButton>
          </View>
        ) : (
          <>
            <View style={styles.ownerSelectedRestaurantHeader}>
              <Image source={imageSource(item.logo || item.image)} style={styles.ownerSelectedRestaurantLogo} />
              <View style={styles.ownerSelectedRestaurantCopy}>
                <Text style={styles.ownerSelectedRestaurantName}>{item.name}</Text>
                <Text style={styles.ownerSelectedRestaurantMeta}>{item.type} • {item.district}</Text>
              </View>
              {renderRestaurantStatusPill(item.status)}
            </View>

            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.ownerWorkspaceTabs}>
              {ownerTabs.map(([label, icon]) => (
                <Pressable
                  key={label}
                  accessibilityRole="tab"
                  accessibilityState={{ selected: ownerPanelTab === label }}
                  onPress={() => setOwnerPanelTab(label)}
                  style={[styles.ownerWorkspaceTab, ownerPanelTab === label && styles.ownerWorkspaceTabActive]}
                >
                  <Ionicons name={icon} size={18} color={ownerPanelTab === label ? colors.card : colors.ink} />
                  <Text style={[styles.ownerWorkspaceTabText, ownerPanelTab === label && styles.ownerWorkspaceTabTextActive]}>{label}</Text>
                </Pressable>
              ))}
            </ScrollView>

            {ownerPanelTab === 'Visão geral' ? (
              <View style={styles.ownerWorkspaceSection}>
                <View style={styles.ownerOverviewHero}>
                  <View>
                    <Text style={styles.ownerOverviewEyebrow}>Hoje, {today?.split('-').reverse().join('/')}</Text>
                    <Text style={styles.ownerOverviewTitle}>{todayReservations.length} reservas</Text>
                    <Text style={styles.ownerOverviewText}>{todayReservations.reduce((total, reservation) => total + Number(reservation.partySize || 0), 0)} pessoas esperadas</Text>
                  </View>
                  <View style={styles.ownerOverviewHeroIcon}><Ionicons name="calendar" size={28} color={colors.card} /></View>
                </View>
                <View style={styles.bookingSummaryGrid}>
                  {[
                    ['calendar-outline', futureReservations.length, 'Próximas'],
                    ['hourglass-outline', itemReservations.filter((reservation) => reservation.status === 'pending').length, 'Pendentes'],
                    ['time-outline', itemWaitlist.filter((entry) => entry.status === 'waiting').length, 'Na espera'],
                    ['people-outline', itemReservations.filter((reservation) => reservation.status === 'completed').length, 'Atendidas']
                  ].map(([icon, value, label]) => (
                    <View key={label} style={styles.bookingSummaryCard}>
                      <Ionicons name={icon} size={21} color={colors.redDark} />
                      <Text style={styles.bookingSummaryValue}>{value}</Text>
                      <Text style={styles.bookingSummaryLabel}>{label}</Text>
                    </View>
                  ))}
                </View>
                <View style={styles.ownerQuickActions}>
                  <Pressable onPress={() => setOwnerPanelTab('Reservas')} style={styles.ownerQuickAction}>
                    <Ionicons name="calendar-outline" size={22} color={colors.redDark} />
                    <Text style={styles.ownerQuickActionTitle}>Gerenciar reservas</Text>
                    <Text style={styles.ownerQuickActionText}>Confirmar chegadas e acompanhar a espera.</Text>
                  </Pressable>
                  <Pressable onPress={() => setOwnerPanelTab('Disponibilidade')} style={styles.ownerQuickAction}>
                    <Ionicons name="time-outline" size={22} color={colors.redDark} />
                    <Text style={styles.ownerQuickActionTitle}>Editar horários</Text>
                    <Text style={styles.ownerQuickActionText}>Definir dias, intervalos e capacidade.</Text>
                  </Pressable>
                </View>
                <SectionTitle title="Desempenho do perfil" />
                <View style={styles.metricGrid}>
                  {[
                    ['Visitas', item.metrics?.views || 0],
                    ['Mapa', item.metrics?.mapsClicks || 0],
                    ['WhatsApp', item.metrics?.whatsappClicks || 0],
                    ['Reservas', itemReservations.length]
                  ].map(([label, value]) => (
                    <View key={label} style={styles.metricBox}>
                      <Text style={styles.metricValue}>{value}</Text>
                      <Text style={styles.metricLabel}>{label}</Text>
                    </View>
                  ))}
                </View>
              </View>
            ) : null}

            {ownerPanelTab === 'Reservas' ? (
              <View style={styles.ownerWorkspaceSection}>
                <View style={styles.ownerSectionHeading}>
                  <View>
                    <Text style={styles.ownerSectionTitle}>Agenda de reservas</Text>
                    <Text style={styles.ownerSectionSubtitle}>{futureReservations.length} próximas • {itemWaitlist.filter((entry) => entry.status === 'waiting').length} esperando</Text>
                  </View>
                </View>
                <View style={styles.bookingList}>
                  {itemReservations.length ? itemReservations.map((reservation) => (
                    <View key={reservation.id} style={styles.ownerBookingCard}>
                      <View style={styles.ownerBookingTime}>
                        <Text style={styles.ownerBookingTimeValue}>{reservation.time}</Text>
                        <Text style={styles.ownerBookingDate}>{reservation.date?.split('-').slice(1).reverse().join('/')}</Text>
                      </View>
                      <View style={styles.bookingCardCopy}>
                        <Text style={styles.bookingRestaurantName}>{reservation.userName || 'Cliente Dine'}</Text>
                        <Text style={styles.bookingMeta}>{reservation.partySize} pessoas{reservation.userPhone ? ` • ${reservation.userPhone}` : ''}</Text>
                        <Text style={[styles.bookingStatusInline, { color: reservationStatusColor(reservation.status) }]}>{reservationStatusLabel(reservation.status)}</Text>
                        {reservation.notes ? <Text style={styles.bookingNotes}>{reservation.notes}</Text> : null}
                      </View>
                      <View style={styles.ownerBookingActions}>
                        {reservation.status === 'pending' ? <Pressable accessibilityLabel="Confirmar reserva" onPress={() => updateReservationStatus(reservation, 'confirmed')} style={styles.ownerBookingPrimary}><Ionicons name="checkmark" size={17} color={colors.card} /></Pressable> : null}
                        {reservation.status === 'confirmed' ? <Pressable accessibilityLabel="Registrar chegada" onPress={() => updateReservationStatus(reservation, 'seated')} style={styles.ownerBookingPrimary}><Ionicons name="restaurant" size={16} color={colors.card} /></Pressable> : null}
                        {reservation.status === 'seated' ? <Pressable accessibilityLabel="Concluir reserva" onPress={() => updateReservationStatus(reservation, 'completed')} style={styles.ownerBookingPrimary}><Ionicons name="checkmark-done" size={17} color={colors.card} /></Pressable> : null}
                        {['pending', 'confirmed'].includes(reservation.status) ? <Pressable accessibilityLabel="Cancelar reserva" onPress={() => updateReservationStatus(reservation, 'cancelled')} style={styles.ownerBookingSecondary}><Ionicons name="close" size={17} color={colors.redDark} /></Pressable> : null}
                      </View>
                    </View>
                  )) : (
                    <View style={styles.emptyState}>
                      <Text style={styles.emptyTitle}>Agenda vazia</Text>
                      <Text style={styles.emptyText}>As reservas feitas no Dine aparecerão aqui.</Text>
                    </View>
                  )}
                </View>
                <SectionTitle title="Lista de espera" />
                <View style={styles.bookingList}>
                  {itemWaitlist.length ? itemWaitlist.map((entry, index) => (
                    <View key={entry.id} style={styles.ownerBookingCard}>
                      <View style={styles.ownerWaitPosition}><Text style={styles.ownerWaitPositionText}>{index + 1}</Text></View>
                      <View style={styles.bookingCardCopy}>
                        <Text style={styles.bookingRestaurantName}>{entry.userName || 'Cliente Dine'}</Text>
                        <Text style={styles.bookingMeta}>{entry.date}{entry.time ? ` • ${entry.time}` : ''} • {entry.partySize} pessoas</Text>
                        <Text style={styles.bookingNotes}>{waitlistStatusLabel(entry.status)}</Text>
                      </View>
                      <View style={styles.ownerBookingActions}>
                        {entry.status === 'waiting' ? <Pressable accessibilityLabel="Avisar cliente" onPress={() => updateWaitlistStatus(entry, 'notified')} style={styles.ownerBookingPrimary}><Ionicons name="notifications-outline" size={17} color={colors.card} /></Pressable> : null}
                        {entry.status !== 'cancelled' ? <Pressable accessibilityLabel="Remover da espera" onPress={() => updateWaitlistStatus(entry, 'cancelled')} style={styles.ownerBookingSecondary}><Ionicons name="close" size={17} color={colors.redDark} /></Pressable> : null}
                      </View>
                    </View>
                  )) : <Text style={styles.ownerSectionEmptyText}>Nenhum cliente na lista de espera.</Text>}
                </View>
              </View>
            ) : null}

            {ownerPanelTab === 'Disponibilidade' ? (
              <View style={styles.ownerWorkspaceSection}>
                <View style={styles.availabilitySettingCard}>
                  <View style={styles.availabilitySettingCopy}>
                    <Text style={styles.ownerSectionTitle}>Reservas pelo Dine</Text>
                    <Text style={styles.ownerSectionSubtitle}>Permitir que clientes escolham horários disponíveis.</Text>
                  </View>
                  <Pressable
                    accessibilityRole="switch"
                    accessibilityState={{ checked: settings.enabled }}
                    onPress={() => updateRestaurantAvailability(item, { ...settings, enabled: !settings.enabled })}
                    style={[styles.settingsToggle, settings.enabled && styles.settingsToggleActive]}
                  >
                    <View style={[styles.settingsToggleThumb, settings.enabled && styles.settingsToggleThumbActive]} />
                  </Pressable>
                </View>
                <View style={styles.availabilitySettingCard}>
                  <View style={styles.availabilitySettingCopy}>
                    <Text style={styles.ownerSectionTitle}>Confirmação automática</Text>
                    <Text style={styles.ownerSectionSubtitle}>Reservas dentro da capacidade já entram confirmadas.</Text>
                  </View>
                  <Pressable
                    accessibilityRole="switch"
                    accessibilityState={{ checked: settings.autoConfirm }}
                    onPress={() => updateRestaurantAvailability(item, { ...settings, autoConfirm: !settings.autoConfirm })}
                    style={[styles.settingsToggle, settings.autoConfirm && styles.settingsToggleActive]}
                  >
                    <View style={[styles.settingsToggleThumb, settings.autoConfirm && styles.settingsToggleThumbActive]} />
                  </Pressable>
                </View>

                <Text style={styles.registerFieldLabel}>Intervalo entre horários</Text>
                <View style={styles.registerChoiceRow}>
                  {[30, 60, 90].map((minutes) => (
                    <Pressable key={minutes} onPress={() => updateRestaurantAvailability(item, { ...settings, slotMinutes: minutes })} style={[styles.registerChoice, settings.slotMinutes === minutes && styles.registerChoiceActive]}>
                      <Text style={[styles.registerChoiceText, settings.slotMinutes === minutes && styles.registerChoiceTextActive]}>{minutes} min</Text>
                    </Pressable>
                  ))}
                </View>

                <View style={styles.availabilityNumberGrid}>
                  <View style={styles.availabilityNumberCard}>
                    <Text style={styles.registerFieldLabel}>Pessoas por horário</Text>
                    <View style={styles.availabilityStepper}>
                      <Pressable accessibilityLabel="Diminuir capacidade" onPress={() => updateRestaurantAvailability(item, { ...settings, capacityPerSlot: Math.max(1, settings.capacityPerSlot - 1) })} style={styles.availabilityStepButton}><Ionicons name="remove" size={18} color={colors.ink} /></Pressable>
                      <Text style={styles.availabilityStepValue}>{settings.capacityPerSlot}</Text>
                      <Pressable accessibilityLabel="Aumentar capacidade" onPress={() => updateRestaurantAvailability(item, { ...settings, capacityPerSlot: settings.capacityPerSlot + 1 })} style={styles.availabilityStepButton}><Ionicons name="add" size={18} color={colors.ink} /></Pressable>
                    </View>
                  </View>
                  <View style={styles.availabilityNumberCard}>
                    <Text style={styles.registerFieldLabel}>Máximo por reserva</Text>
                    <View style={styles.availabilityStepper}>
                      <Pressable accessibilityLabel="Diminuir limite do grupo" onPress={() => updateRestaurantAvailability(item, { ...settings, maxPartySize: Math.max(1, settings.maxPartySize - 1) })} style={styles.availabilityStepButton}><Ionicons name="remove" size={18} color={colors.ink} /></Pressable>
                      <Text style={styles.availabilityStepValue}>{settings.maxPartySize}</Text>
                      <Pressable accessibilityLabel="Aumentar limite do grupo" onPress={() => updateRestaurantAvailability(item, { ...settings, maxPartySize: settings.maxPartySize + 1 })} style={styles.availabilityStepButton}><Ionicons name="add" size={18} color={colors.ink} /></Pressable>
                    </View>
                  </View>
                </View>

                <SectionTitle title="Agenda semanal" />
                <View style={styles.availabilityWeekList}>
                  {reservationWeekDays.map(([key, label]) => {
                    const day = settings.weekly[key];
                    return (
                      <View key={key} style={[styles.availabilityDayCard, !day.enabled && styles.availabilityDayCardDisabled]}>
                        <Pressable
                          accessibilityRole="switch"
                          accessibilityState={{ checked: day.enabled }}
                          onPress={() => updateRestaurantAvailability(item, {
                            ...settings,
                            weekly: { ...settings.weekly, [key]: { ...day, enabled: !day.enabled } }
                          })}
                          style={[styles.availabilityDayToggle, day.enabled && styles.availabilityDayToggleActive]}
                        >
                          <Ionicons name={day.enabled ? 'checkmark' : 'close'} size={15} color={day.enabled ? colors.card : colors.muted} />
                        </Pressable>
                        <Text style={styles.availabilityDayLabel}>{label}</Text>
                        <TextInput
                          accessibilityLabel={`Início ${label}`}
                          editable={day.enabled}
                          value={day.start}
                          onChangeText={(value) => updateRestaurantAvailability(item, { ...settings, weekly: { ...settings.weekly, [key]: { ...day, start: value } } })}
                          style={[styles.availabilityTimeInput, !day.enabled && styles.availabilityTimeInputDisabled]}
                        />
                        <Text style={styles.availabilityTimeSeparator}>até</Text>
                        <TextInput
                          accessibilityLabel={`Fim ${label}`}
                          editable={day.enabled}
                          value={day.end}
                          onChangeText={(value) => updateRestaurantAvailability(item, { ...settings, weekly: { ...settings.weekly, [key]: { ...day, end: value } } })}
                          style={[styles.availabilityTimeInput, !day.enabled && styles.availabilityTimeInputDisabled]}
                        />
                      </View>
                    );
                  })}
                </View>
              </View>
            ) : null}

            {ownerPanelTab === 'Perfil' ? (
              <View style={styles.ownerWorkspaceSection}>
                <View style={styles.ownerProfilePreview}>
                  <Image source={imageSource(item.coverPhoto || item.image)} style={styles.ownerProfilePreviewCover} />
                  <View style={styles.ownerProfilePreviewBody}>
                    <Image source={imageSource(item.logo || item.image)} style={styles.ownerProfilePreviewLogo} />
                    <View style={styles.ownerProfilePreviewCopy}>
                      <Text style={styles.ownerCardTitle}>{item.name}</Text>
                      <Text style={styles.ownerCardMeta}>{item.type} • {item.district}</Text>
                      <Text style={styles.ownerCardBio}>{item.description}</Text>
                    </View>
                  </View>
                </View>
                <View style={styles.ownerButtonsRow}>
                  <AppButton kind="secondary" onPress={() => editRestaurant(item)}>Editar perfil</AppButton>
                  <AppButton kind="secondary" onPress={() => Share.share({ message: `${item.name} no Dine` })}>Compartilhar</AppButton>
                </View>
                <View style={styles.ownerActions}>
                  <AppButton kind="secondary" onPress={() => changeRestaurantStatus(item, item.status === 'paused' ? 'pending' : 'paused')}>{item.status === 'paused' ? 'Enviar para revisão' : 'Pausar'}</AppButton>
                  <AppButton kind="secondary" onPress={() => changeRestaurantStatus(item, 'archived')}>Arquivar</AppButton>
                </View>
              </View>
            ) : null}

            <View style={styles.ownerWorkspaceFooterActions}>
              <AppButton kind="secondary" onPress={() => startRestaurantRegistration()}>{isAdmin ? 'Cadastrar para empresa' : 'Adicionar restaurante'}</AppButton>
              {isAdmin ? <AppButton kind="secondary" onPress={() => navigateTo('adminApprovals')}>Central admin</AppButton> : null}
            </View>
          </>
        )}
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
    const localReports = users
      .flatMap((user) => (user.moderationReports || []).map((report) => ({ ...report, reporter: user.email || user.name || user.id })))
      .sort((a, b) => String(b.id || '').localeCompare(String(a.id || '')));
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
        <SectionTitle title="Moderacao de conteudo" />
        {localReports.length ? localReports.slice(0, 12).map((report) => (
          <View key={report.id} style={styles.adminListItem}>
            <View style={styles.adminListTop}>
              <View style={styles.adminListIcon}>
                <Ionicons name="flag-outline" size={22} color={colors.redDark} />
              </View>
              <View style={styles.adminListCopy}>
                <Text style={styles.adminListTitle}>{report.targetLabel || report.targetType}</Text>
                <Text style={styles.adminListMeta}>{report.reason} - {report.reporter}</Text>
              </View>
            </View>
            <View style={styles.ownerActions}>
              <AppButton kind="secondary" onPress={() => Alert.alert('Moderacao', 'Abra o item denunciado, remova o conteudo se violar as regras e registre o retorno ao usuario pelo suporte.')}>Revisar</AppButton>
              <AppButton kind="secondary" onPress={() => {
                const nextUsers = users.map((user) => ({
                  ...user,
                  moderationReports: (user.moderationReports || []).filter((item) => item.id !== report.id)
                }));
                setUsers(nextUsers);
                AsyncStorage.setItem(storageKeys.users, JSON.stringify(nextUsers)).catch(() => {});
              }}>Arquivar</AppButton>
            </View>
          </View>
        )) : (
          <View style={styles.emptyState}>
            <Text style={styles.emptyTitle}>Sem denuncias abertas</Text>
            <Text style={styles.emptyText}>Denuncias de avaliacoes, perfis e publicacoes aparecem aqui para revisao.</Text>
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
    const steps = [
      ['Essencial', 'storefront-outline'],
      ['Localização', 'location-outline'],
      ['Cardápio', 'images-outline'],
      ['Revisão', 'checkmark-circle-outline']
    ];
    const menuDraftItems = form.menuDraftItems || [];
    const openingHoursDraft = form.openingHoursDraft || {};
    const completedDays = Object.values(openingHoursDraft).filter(Boolean).length;
    const draftStatus = registerDraftSavedAt ? 'Rascunho salvo automaticamente' : 'Suas alterações serão salvas neste aparelho';

    return (
      <View style={styles.registerPage}>
        {renderScreenHeader(editingRestaurant ? 'Editar restaurante' : 'Cadastrar restaurante', 'Conte sua proposta em etapas rápidas.')}

        <View style={styles.registerProgress}>
          <View style={styles.registerProgressTop}>
            <Text style={styles.registerProgressTitle}>Etapa {registerStep + 1} de {steps.length}</Text>
            {!editingRestaurant ? (
              <View style={styles.registerDraftStatus}>
                <Ionicons name="cloud-done-outline" size={14} color={colors.green} />
                <Text style={styles.registerDraftStatusText}>{draftStatus}</Text>
              </View>
            ) : null}
          </View>
          <View style={styles.registerProgressTrack}>
            <View style={[styles.registerProgressFill, { width: `${((registerStep + 1) / steps.length) * 100}%` }]} />
          </View>
          <View style={styles.registerStepRow}>
            {steps.map(([label, icon], index) => (
              <View key={label} style={styles.registerStepItem}>
                <View style={[styles.registerStepIcon, index <= registerStep && styles.registerStepIconActive]}>
                  <Ionicons name={index < registerStep ? 'checkmark' : icon} size={16} color={index <= registerStep ? colors.card : colors.muted} />
                </View>
                <Text numberOfLines={1} style={[styles.registerStepLabel, index === registerStep && styles.registerStepLabelActive]}>{label}</Text>
              </View>
            ))}
          </View>
        </View>

        {registerStep === 0 ? (
          <>
            <View style={styles.registerHero}>
              <Ionicons name="storefront-outline" size={26} color={colors.redDark} />
              <View style={styles.registerHeroCopy}>
                <Text style={styles.panelTitle}>Comece pelo essencial</Text>
                <Text style={styles.panelText}>Essas informações aparecem na busca, no mapa e no perfil do restaurante.</Text>
              </View>
            </View>
            {isAdmin ? (
              <View style={styles.registerSection}>
                <View style={styles.registerSectionHeader}>
                  <Ionicons name="briefcase-outline" size={20} color={colors.redDark} />
                  <Text style={styles.registerSectionTitle}>Responsável da empresa</Text>
                </View>
                <Field label="Nome do responsável" value={form.ownerName || ''} onChangeText={(value) => setRestaurantFormField('ownerName', value)} placeholder="Nome do cliente ou empresa" />
                <Field label="E-mail do responsável" value={form.ownerEmail || ''} onChangeText={(value) => setForm((current) => ({ ...current, ownerEmail: value, ownerId: ownerIdFromEmail(value) }))} placeholder="cliente@empresa.com" keyboardType="email-address" autoCapitalize="none" />
                <Text style={styles.registerFieldLabel}>Status inicial</Text>
                <View style={styles.registerChoiceRow}>
                  {['published', 'pending', 'paused'].map((status) => (
                    <Pressable key={status} onPress={() => setRestaurantFormField('status', status)} style={[styles.registerChoice, form.status === status && styles.registerChoiceActive]}>
                      <Text style={[styles.registerChoiceText, form.status === status && styles.registerChoiceTextActive]}>
                        {{ published: 'Publicado', pending: 'Pendente', paused: 'Pausado' }[status]}
                      </Text>
                    </Pressable>
                  ))}
                </View>
                <Field label="Notas de suporte" value={form.ownerSupportNotes || ''} onChangeText={(value) => setRestaurantFormField('ownerSupportNotes', value)} placeholder="Ex.: cliente pediu ajuda com as fotos" multiline />
              </View>
            ) : null}
            <View style={styles.registerSection}>
              <View style={styles.registerSectionHeader}>
                <Ionicons name="restaurant-outline" size={20} color={colors.redDark} />
                <Text style={styles.registerSectionTitle}>Identidade</Text>
              </View>
              <Field label="Nome do estabelecimento" value={form.name || ''} error={registerErrors.name} onChangeText={(value) => setRestaurantFormField('name', value)} placeholder="Ex.: Casa Nostra" />
              <Text style={styles.registerFieldLabel}>Categoria principal</Text>
              <View style={styles.registerChoiceWrap}>
                {restaurantCategoryOptions.map((category) => (
                  <Pressable key={category} onPress={() => setRestaurantFormField('type', category)} style={[styles.registerChoice, form.type === category && styles.registerChoiceActive]}>
                    <Text style={[styles.registerChoiceText, form.type === category && styles.registerChoiceTextActive]}>{category}</Text>
                  </Pressable>
                ))}
              </View>
              {registerErrors.type ? <Text style={styles.fieldErrorText}>{registerErrors.type}</Text> : null}
              <Text style={styles.registerFieldLabel}>Faixa de preço</Text>
              <View style={styles.registerChoiceRow}>
                {restaurantPriceOptions.map((price) => (
                  <Pressable key={price} onPress={() => setRestaurantFormField('price', price)} style={[styles.registerChoice, form.price === price && styles.registerChoiceActive]}>
                    <Text style={[styles.registerChoiceText, form.price === price && styles.registerChoiceTextActive]}>{price}</Text>
                  </Pressable>
                ))}
              </View>
              <Field label="Bairro" value={form.district || ''} error={registerErrors.district} onChangeText={(value) => setRestaurantFormField('district', value)} placeholder="Ex.: Redentora" />
              <Field label="Descrição" value={form.description || ''} error={registerErrors.description} onChangeText={(value) => setRestaurantFormField('description', value)} placeholder="Ambiente, especialidades e proposta do lugar" multiline />
            </View>
          </>
        ) : null}

        {registerStep === 1 ? (
          <>
            <View style={styles.registerHero}>
              <Ionicons name="location-outline" size={26} color={colors.redDark} />
              <View style={styles.registerHeroCopy}>
                <Text style={styles.panelTitle}>Onde fica e como falar</Text>
                <Text style={styles.panelText}>O Dine posiciona o restaurante no mapa automaticamente pelo endereço.</Text>
              </View>
            </View>
            <View style={styles.registerSection}>
              <Field
                label="CEP ou endereço"
                value={form.addressQuery ?? form.address ?? ''}
                error={registerErrors.address}
                onChangeText={(value) => {
                  setForm((current) => ({
                    ...current,
                    address: value,
                    addressQuery: value,
                    addressLookupReady: false,
                    addressStreet: '',
                    addressComplement: '',
                    addressNumber: '',
                    cep: '',
                    cepLatitude: '',
                    cepLongitude: '',
                    latitude: '',
                    longitude: ''
                  }));
                  setRegisterAddressFeedback('');
                  setRegisterErrors((current) => ({ ...current, address: '', addressNumber: '' }));
                }}
                placeholder="Ex.: 15015-110 ou Rua Voluntários, 3745"
                autoCapitalize="words"
              />
              {registerAddressSearching ? (
                <View style={styles.registerAddressSearching}>
                  <Ionicons name="search-outline" size={15} color={colors.redDark} />
                  <Text style={styles.registerAddressSearchingText}>Buscando endereços...</Text>
                </View>
              ) : null}
              {registerAddressSuggestions.length ? (
                <View accessibilityLabel="Opções de endereço" style={styles.registerAddressSuggestions}>
                  {registerAddressSuggestions.map((suggestion) => (
                    <Pressable
                      key={`${suggestion.cep}-${suggestion.street}-${suggestion.district}`}
                      accessibilityRole="button"
                      accessibilityLabel={`Usar endereço ${formatAddressLabel(suggestion, extractAddressNumber(form.addressQuery || form.address))}`}
                      onPress={() => selectRestaurantAddressSuggestion(suggestion)}
                      style={({ pressed }) => [styles.registerAddressSuggestion, pressed && styles.activePress]}
                    >
                      <View style={styles.registerAddressSuggestionIcon}>
                        <Ionicons name="location-outline" size={18} color={colors.redDark} />
                      </View>
                      <View style={styles.registerAddressSuggestionCopy}>
                        <Text style={styles.registerAddressSuggestionTitle}>{suggestion.street}{extractAddressNumber(form.addressQuery || form.address) ? `, ${extractAddressNumber(form.addressQuery || form.address)}` : ''}</Text>
                        <Text style={styles.registerAddressSuggestionText}>{[suggestion.district, `${suggestion.city} - ${suggestion.state}`, suggestion.cep].filter(Boolean).join(' · ')}</Text>
                      </View>
                      <Ionicons name="chevron-forward" size={17} color={colors.muted} />
                    </Pressable>
                  ))}
                </View>
              ) : null}
              {form.addressLookupReady ? (
                <Field
                  label="Número"
                  value={form.addressNumber || ''}
                  error={registerErrors.addressNumber}
                  onChangeText={updateRestaurantAddressNumber}
                  placeholder="Ex.: 3745"
                  keyboardType="numbers-and-punctuation"
                />
              ) : null}
              {registerAddressFeedback ? (
                <Text style={[styles.registerAddressFeedback, parseOptionalCoordinate(form.latitude) && parseOptionalCoordinate(form.longitude) && styles.registerAddressFeedbackSuccess]}>
                  {registerAddressFeedback}
                </Text>
              ) : null}
              <Pressable accessibilityRole="button" accessibilityLabel="Buscar e confirmar endereço" onPress={() => locateRestaurantAddress(true)} disabled={registerLocating || registerAddressSearching} style={[styles.registerLocateButton, (registerLocating || registerAddressSearching) && styles.registerLocateButtonDisabled]}>
                <Ionicons name={registerLocating ? 'hourglass-outline' : 'map-outline'} size={19} color={colors.card} />
                <Text style={styles.registerLocateButtonText}>{registerLocating ? 'Confirmando pin...' : 'Buscar e confirmar endereço'}</Text>
              </Pressable>
              {parseOptionalCoordinate(form.latitude) && parseOptionalCoordinate(form.longitude) ? (
                <View style={styles.registerLocationConfirmed}>
                  <Ionicons name="checkmark-circle" size={21} color={colors.green} />
                  <View style={styles.registerLocationConfirmedCopy}>
                    <Text style={styles.registerLocationConfirmedTitle}>Endereço confirmado</Text>
                    <Text style={styles.registerLocationConfirmedText}>{form.address}</Text>
                    <Text style={styles.registerLocationCoordinates}>{Number(form.latitude).toFixed(5)}, {Number(form.longitude).toFixed(5)}</Text>
                  </View>
                </View>
              ) : null}
              <Field label="WhatsApp" value={form.whatsapp || ''} error={registerErrors.contact} onChangeText={(value) => setRestaurantFormField('whatsapp', value, 'contact')} placeholder="(17) 99999-9999" keyboardType="phone-pad" />
              <Field label="Telefone alternativo" value={form.phone || ''} onChangeText={(value) => setRestaurantFormField('phone', value, 'contact')} placeholder="Opcional" keyboardType="phone-pad" />
              <Field label="Instagram" value={form.instagram || ''} onChangeText={(value) => setRestaurantFormField('instagram', value)} placeholder="@restaurante" autoCapitalize="none" />
              <Field label="Link de reserva" value={form.reservationUrl || ''} onChangeText={(value) => setRestaurantFormField('reservationUrl', value)} placeholder="https://..." autoCapitalize="none" />
            </View>
          </>
        ) : null}

        {registerStep === 2 ? (
          <>
            <View style={styles.registerHero}>
              <Ionicons name="images-outline" size={26} color={colors.redDark} />
              <View style={styles.registerHeroCopy}>
                <Text style={styles.panelTitle}>Fotos e cardápio</Text>
                <Text style={styles.panelText}>A foto de capa é obrigatória. Você decide se quer adicionar o cardápio agora ou depois.</Text>
              </View>
            </View>
            <View style={styles.registerSection}>
              <View style={styles.registerPhotoGrid}>
                <Pressable onPress={() => pickRestaurantImage('coverPhoto')} style={({ pressed }) => [styles.registerPhotoCard, registerErrors.coverPhoto && styles.registerPhotoCardError, pressed && styles.activePress]}>
                  {(form.coverPhoto || form.image) ? <Image source={imageSource(form.coverPhoto || form.image)} style={styles.registerPhotoPreview} /> : <Ionicons name="image-outline" size={28} color={colors.redDark} />}
                  {(form.coverPhoto || form.image) ? <View style={styles.registerPhotoScrim} /> : null}
                  <Text style={styles.registerPhotoTitle}>Foto de capa</Text>
                  <Text style={styles.registerPhotoText}>{(form.coverPhoto || form.image) ? 'Trocar foto' : 'Obrigatória'}</Text>
                </Pressable>
                <Pressable onPress={() => pickRestaurantImage('logo')} style={({ pressed }) => [styles.registerPhotoCard, pressed && styles.activePress]}>
                  {form.logo ? <Image source={imageSource(form.logo)} style={styles.registerPhotoPreview} /> : <Ionicons name="storefront-outline" size={28} color={colors.redDark} />}
                  {form.logo ? <View style={styles.registerPhotoScrim} /> : null}
                  <Text style={styles.registerPhotoTitle}>Logo</Text>
                  <Text style={styles.registerPhotoText}>{form.logo ? 'Trocar logo' : 'Opcional'}</Text>
                </Pressable>
                <Pressable onPress={pickRestaurantExtraPhotos} style={({ pressed }) => [styles.registerPhotoCard, pressed && styles.activePress]}>
                  <Ionicons name="images-outline" size={28} color={colors.redDark} />
                  <Text style={styles.registerPhotoTitle}>Galeria</Text>
                  <Text style={styles.registerPhotoText}>{parseList(form.photosText).length} fotos</Text>
                </Pressable>
              </View>
              {registerErrors.coverPhoto ? <Text style={styles.fieldErrorText}>{registerErrors.coverPhoto}</Text> : null}
              {parseList(form.photosText).length ? (
                <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.registerExtraPhotoRow}>
                  {parseList(form.photosText).map((photo, index) => (
                    <View key={`${photo}-${index}`} style={styles.registerExtraPhotoWrap}>
                      <Image source={imageSource(photo)} style={styles.registerExtraPhoto} />
                      <Pressable onPress={() => setForm((current) => ({ ...current, photosText: parseList(current.photosText).filter((_, photoIndex) => photoIndex !== index).join('\n') }))} style={styles.registerExtraPhotoRemove}>
                        <Ionicons name="close" size={14} color={colors.card} />
                      </Pressable>
                    </View>
                  ))}
                </ScrollView>
              ) : null}
            </View>
            <View style={styles.registerSection}>
              <View style={styles.registerSectionHeader}>
                <Ionicons name="restaurant-outline" size={20} color={colors.redDark} />
                <Text style={styles.registerSectionTitle}>Deseja adicionar o cardápio?</Text>
              </View>
              <Text style={styles.registerMenuChoiceIntro}>Essa escolha não impede o cadastro. Você poderá alterar o cardápio pelo painel do restaurante.</Text>
              <View style={styles.registerMenuChoiceList}>
                {[
                  ['now', 'Adicionar cardápio agora', 'Cadastre pratos, preços, descrições e fotos.'],
                  ['later', 'Adicionar depois', 'Finalize o restaurante agora e complete quando quiser.']
                ].map(([value, title, description]) => {
                  const selected = (form.menuMode || 'later') === value;
                  return (
                    <Pressable
                      key={value}
                      accessibilityRole="radio"
                      accessibilityState={{ checked: selected }}
                      aria-checked={selected}
                      accessibilityLabel={title}
                      onPress={() => setForm((current) => ({ ...current, menuMode: value }))}
                      style={({ pressed }) => [styles.registerMenuChoice, selected && styles.registerMenuChoiceActive, pressed && styles.activePress]}
                    >
                      <View style={[styles.registerMenuChoiceRadio, selected && styles.registerMenuChoiceRadioActive]}>
                        {selected ? <View style={styles.registerMenuChoiceRadioDot} /> : null}
                      </View>
                      <View style={styles.registerMenuChoiceCopy}>
                        <Text style={[styles.registerMenuChoiceTitle, selected && styles.registerMenuChoiceTitleActive]}>{title}</Text>
                        <Text style={styles.registerMenuChoiceText}>{description}</Text>
                      </View>
                      <Ionicons name={value === 'now' ? 'add-circle-outline' : 'time-outline'} size={21} color={selected ? colors.redDark : colors.muted} />
                    </Pressable>
                  );
                })}
              </View>
            </View>
            {form.menuMode === 'now' ? (
              <View style={styles.registerSection}>
                <View style={styles.registerSectionHeaderBetween}>
                  <View style={styles.registerSectionHeader}>
                    <Ionicons name="restaurant-outline" size={20} color={colors.redDark} />
                    <Text style={styles.registerSectionTitle}>Itens do cardápio</Text>
                  </View>
                  <Pressable accessibilityRole="button" accessibilityLabel="Adicionar item ao cardápio" onPress={addMenuDraftItem} style={styles.registerAddButton}>
                    <Ionicons name="add" size={18} color={colors.redDark} />
                    <Text style={styles.registerAddButtonText}>Adicionar</Text>
                  </Pressable>
                </View>
                {menuDraftItems.length ? menuDraftItems.map((dish, index) => (
                  <View key={dish.id || index} style={styles.registerMenuItem}>
                    <Pressable onPress={() => pickRestaurantMenuItemImage(index)} style={styles.registerMenuPhoto}>
                      {dish.image ? <Image source={imageSource(dish.image)} style={styles.registerMenuPhotoImage} /> : <Ionicons name="camera-outline" size={23} color={colors.redDark} />}
                    </Pressable>
                    <View style={styles.registerMenuFields}>
                      <Field label={`Item ${index + 1}`} value={dish.name || ''} onChangeText={(value) => updateMenuDraftItem(index, 'name', value)} placeholder="Nome do prato" />
                      <View style={styles.registerMenuInline}>
                        <View style={styles.registerMenuInlineField}>
                          <Field label="Categoria" value={dish.category || ''} onChangeText={(value) => updateMenuDraftItem(index, 'category', value)} placeholder="Principal" />
                        </View>
                        <View style={styles.registerMenuPriceField}>
                          <Field label="Preço" value={String(dish.price || '')} onChangeText={(value) => updateMenuDraftItem(index, 'price', value)} placeholder="49,90" keyboardType="decimal-pad" />
                        </View>
                      </View>
                      <Field label="Descrição" value={dish.description || ''} onChangeText={(value) => updateMenuDraftItem(index, 'description', value)} placeholder="Ingredientes e acompanhamentos" multiline />
                    </View>
                    <Pressable onPress={() => setForm((current) => ({ ...current, menuDraftItems: (current.menuDraftItems || []).filter((_, itemIndex) => itemIndex !== index) }))} style={styles.registerMenuRemove}>
                      <Ionicons name="trash-outline" size={18} color={colors.redDark} />
                    </Pressable>
                  </View>
                )) : (
                  <Pressable onPress={addMenuDraftItem} style={styles.registerMenuEmpty}>
                    <Ionicons name="add-circle-outline" size={26} color={colors.redDark} />
                    <Text style={styles.registerMenuEmptyTitle}>Adicionar primeiro prato</Text>
                    <Text style={styles.registerMenuEmptyText}>Comece com os itens mais pedidos da casa.</Text>
                  </Pressable>
                )}
              </View>
            ) : (
              <View style={styles.registerMenuLaterNotice}>
                <View style={styles.registerMenuLaterIcon}>
                  <Ionicons name="checkmark" size={20} color={colors.green} />
                </View>
                <View style={styles.registerMenuLaterCopy}>
                  <Text style={styles.registerMenuLaterTitle}>Tudo bem adicionar depois</Text>
                  <Text style={styles.registerMenuLaterText}>O cadastro seguirá normalmente. Quando estiver pronto, abra o perfil no painel e publique o cardápio.</Text>
                </View>
              </View>
            )}
          </>
        ) : null}

        {registerStep === 3 ? (
          <>
            <View style={styles.registerHero}>
              <Ionicons name="checkmark-circle-outline" size={26} color={colors.redDark} />
              <View style={styles.registerHeroCopy}>
                <Text style={styles.panelTitle}>Funcionamento e revisão</Text>
                <Text style={styles.panelText}>Confirme os horários e veja como o perfil aparecerá no Dine.</Text>
              </View>
            </View>
            <View style={styles.registerSection}>
              <View style={styles.registerSectionHeader}>
                <Ionicons name="time-outline" size={20} color={colors.redDark} />
                <Text style={styles.registerSectionTitle}>Horários</Text>
              </View>
              {restaurantWeekDays.map(([key, label]) => {
                const hours = openingHoursDraft[key] || '';
                return (
                  <View key={key} style={styles.registerHoursRow}>
                    <Pressable
                      onPress={() => {
                        setForm((current) => ({
                          ...current,
                          openingHoursDraft: { ...(current.openingHoursDraft || {}), [key]: hours ? '' : '09:00-18:00' }
                        }));
                        setRegisterErrors((current) => ({ ...current, openingHours: '' }));
                      }}
                      style={[styles.registerHoursToggle, hours && styles.registerHoursToggleActive]}
                    >
                      <Ionicons name={hours ? 'checkmark' : 'close'} size={15} color={hours ? colors.card : colors.muted} />
                    </Pressable>
                    <Text style={styles.registerHoursDay}>{label}</Text>
                    <TextInput
                      accessibilityLabel={`Horário de ${label}`}
                      editable={Boolean(hours)}
                      value={hours}
                      onChangeText={(value) => {
                        setForm((current) => ({ ...current, openingHoursDraft: { ...(current.openingHoursDraft || {}), [key]: value } }));
                        setRegisterErrors((current) => ({ ...current, openingHours: '' }));
                      }}
                      placeholder={hours ? '09:00-18:00' : 'Fechado'}
                      placeholderTextColor="#918A82"
                      style={[styles.registerHoursInput, !hours && styles.registerHoursInputDisabled]}
                    />
                  </View>
                );
              })}
              {registerErrors.openingHours ? <Text style={styles.fieldErrorText}>{registerErrors.openingHours}</Text> : null}
              <Field label="Feriados fechados" value={form.holidayClosuresText || ''} onChangeText={(value) => setRestaurantFormField('holidayClosuresText', value)} placeholder="2026-12-25 | Natal" multiline />
              <Field label="Comodidades e tags" value={form.tagsText || ''} onChangeText={(value) => setRestaurantFormField('tagsText', value)} placeholder="Pet friendly, área externa, acessível" />
              <Field label="Destaques" value={form.highlightsText || ''} onChangeText={(value) => setRestaurantFormField('highlightsText', value)} placeholder="Carta de vinhos, varanda, música ao vivo" />
            </View>
            <View style={styles.registerPreview}>
              <View style={styles.registerPreviewMedia}>
                <Image source={imageSource(form.coverPhoto || form.image)} style={styles.registerPreviewImage} />
                <View style={styles.registerPreviewOverlay} />
                <View style={styles.registerPreviewCopy}>
                  <Text style={styles.registerPreviewName}>{form.name || 'Nome do restaurante'}</Text>
                  <Text style={styles.registerPreviewMeta}>{form.type || 'Categoria'} • {form.district || 'Bairro'} • {form.price || '$$'}</Text>
                </View>
              </View>
              <View style={styles.registerPreviewDetails}>
                {[
                  ['location-outline', form.address || 'Endereço pendente'],
                  ['logo-whatsapp', form.whatsapp || form.phone || 'Contato pendente'],
                  ['time-outline', `${completedDays} dias com horário`],
                  ['restaurant-outline', form.menuMode === 'now'
                    ? `${menuDraftItems.filter((dish) => dish.name).length} itens no cardápio`
                    : 'Cardápio será adicionado depois']
                ].map(([icon, text]) => (
                  <View key={text} style={styles.registerPreviewDetail}>
                    <Ionicons name={icon} size={17} color={colors.redDark} />
                    <Text numberOfLines={2} style={styles.registerPreviewDetailText}>{text}</Text>
                  </View>
                ))}
              </View>
              <View style={styles.registerReviewNotice}>
                <Ionicons name="information-circle-outline" size={20} color={colors.olive} />
                <Text style={styles.registerReviewNoticeText}>
                  {isAdmin ? 'Ao salvar, o status selecionado será aplicado ao perfil.' : 'Depois do envio, você poderá acompanhar a análise e corrigir pendências pelo painel.'}
                </Text>
              </View>
            </View>
          </>
        ) : null}

        <View style={styles.registerNavigation}>
          {registerStep > 0 ? (
            <Pressable accessibilityRole="button" accessibilityLabel="Voltar etapa" onPress={() => { setRegisterStep((step) => step - 1); setRegisterErrors({}); }} style={styles.registerBackAction}>
              <Ionicons name="chevron-back" size={19} color={colors.ink} />
              <Text style={styles.registerBackActionText}>Voltar</Text>
            </Pressable>
          ) : <View />}
          {registerStep < steps.length - 1 ? (
            <Pressable accessibilityRole="button" accessibilityLabel="Continuar" onPress={advanceRestaurantRegistration} style={styles.registerNextAction}>
              <Text style={styles.registerNextActionText}>Continuar</Text>
              <Ionicons name="chevron-forward" size={19} color={colors.card} />
            </Pressable>
          ) : (
            <Pressable
              accessibilityRole="button"
              accessibilityLabel={editingRestaurant ? 'Salvar alterações' : 'Enviar para aprovação'}
              onPress={finishRestaurantRegistration}
              style={styles.registerNextAction}
            >
              <Ionicons name="paper-plane-outline" size={18} color={colors.card} />
              <Text style={styles.registerNextActionText}>{editingRestaurant ? 'Salvar alterações' : 'Enviar para aprovação'}</Text>
            </Pressable>
          )}
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
      myReservations: renderMyReservationsScreen,
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
      favorites: renderFavorites,
      rankings: renderRankings,
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
        ref={mainScrollRef}
        style={[styles.screen, { backgroundColor: appAppearance.bg }]}
        scrollEnabled={!mapInteracting}
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
        onReserve={openNativeReservation}
        onClaim={claimRestaurant}
        reviews={selectedRestaurant ? sortedReviews(selectedRestaurant.id) : []}
        reviewDraft={reviewDraft}
        setReviewDraft={setReviewDraft}
        onSubmitReview={submitReview}
        onLikeReview={toggleReviewLike}
        onPinReview={toggleReviewPin}
        onRemoveReview={removeReview}
        onKnown={markRestaurantKnown}
        onCheckIn={startRestaurantCheckIn}
        communityPosts={selectedRestaurant ? feedPosts.filter((post) => String(post.restaurantId || post.restaurant?.id) === String(selectedRestaurant.id)) : []}
        onOpenCommunityPost={(post) => {
          setSelectedRestaurant(null);
          setSelectedFeedPost(post);
        }}
        currentUser={currentUser}
        isAdmin={isAdmin}
        favorite={selectedRestaurant && favorites.includes(selectedRestaurant.name)}
        onFavorite={toggleFavorite}
        onReportContent={reportContent}
      />
      <ReservationModal
        item={reservationRestaurant}
        currentUser={currentUser}
        reservations={reservations}
        onClose={() => setReservationRestaurant(null)}
        onReserve={async (item, draft) => {
          const created = await createNativeReservation(item, draft);
          if (created) setReservationRestaurant(null);
          return created;
        }}
        onWaitlist={(item, draft) => {
          if (joinRestaurantWaitlist(item, draft)) setReservationRestaurant(null);
        }}
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
      <FeedPostDetailModal
        visible={Boolean(selectedFeedPost)}
        post={selectedFeedPost ? { ...selectedFeedPost, avatar: postAuthorAvatar(selectedFeedPost, currentUser) } : null}
        reaction={selectedFeedPost ? feedState(selectedFeedPost) : {}}
        commentDraft={selectedFeedPost ? (feedCommentDrafts[selectedFeedPost.id] || '') : ''}
        onChangeComment={(value) => selectedFeedPost && setFeedCommentDrafts((current) => ({ ...current, [selectedFeedPost.id]: value }))}
        onAddComment={() => selectedFeedPost && addFeedComment(selectedFeedPost)}
        onClose={() => setSelectedFeedPost(null)}
        onOpenAuthor={() => {
          if (!selectedFeedPost) return;
          const post = selectedFeedPost;
          setSelectedFeedPost(null);
          openFeedProfile(post);
        }}
        onOpenRestaurant={() => {
          const restaurant = selectedFeedPost?.restaurant;
          setSelectedFeedPost(null);
          if (restaurant?.id && !String(restaurant.id).startsWith('custom-restaurant-')) setSelectedRestaurant(restaurant);
        }}
        onLike={() => selectedFeedPost && toggleFeedFlag(selectedFeedPost.id, 'liked')}
        onSave={() => selectedFeedPost && toggleFeedFlag(selectedFeedPost.id, 'saved')}
        onShare={() => selectedFeedPost && shareFeedPost(selectedFeedPost)}
        onReport={() => selectedFeedPost && reportContent({ type: 'feedPost', id: selectedFeedPost.id, label: `publicacao de ${selectedFeedPost.author}`, source: 'feed-detail' })}
        onDelete={() => selectedFeedPost && deleteFeedPost(selectedFeedPost)}
        canDelete={Boolean(currentUser && selectedFeedPost && String(selectedFeedPost.authorId) === String(currentUser.id))}
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
        setForm={(nextForm) => {
          setAuthError('');
          setForm(nextForm);
        }}
        setMode={(nextMode) => {
          setAuthError('');
          setAuthMode(nextMode);
        }}
        onSubmitAuth={submitAuth}
        submitting={authSubmitting}
        error={authError}
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

function ReservationModal({ item, currentUser, reservations = [], onClose, onReserve, onWaitlist }) {
  const settings = reservationSettingsFor(item || {});
  const dates = useMemo(() => nextReservationDates(settings.advanceDays, 7), [item?.id, settings.advanceDays]);
  const [draft, setDraft] = useState({ date: '', time: '', partySize: 2, phone: '', notes: '' });
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!item?.id) return;
    setDraft({
      date: dates[0]?.key || '',
      time: '',
      partySize: Math.min(2, settings.maxPartySize),
      phone: currentUser?.phone || '',
      notes: ''
    });
  }, [item?.id]);

  const slots = item ? reservationSlotsForDate(item, draft.date, reservations) : [];
  const selectedSlot = slots.find((slot) => slot.time === draft.time);
  const canReserve = Boolean(
    draft.date
    && draft.time
    && selectedSlot?.available
    && selectedSlot.remaining >= Number(draft.partySize)
    && String(draft.phone || '').replace(/\D/g, '').length >= 8
  );
  const canWaitlist = Boolean(
    draft.date
    && String(draft.phone || '').replace(/\D/g, '').length >= 8
    && (!selectedSlot || !selectedSlot.available || selectedSlot.remaining < Number(draft.partySize))
  );

  if (!item) return null;

  return (
    <Modal visible transparent animationType="slide" onRequestClose={onClose}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={styles.reservationBackdrop}>
        <View style={styles.reservationSheet}>
          <View style={styles.reservationHandle} />
          <View style={styles.reservationHeader}>
            <View style={styles.reservationHeaderCopy}>
              <Text style={styles.reservationEyebrow}>Reserva pelo Dine</Text>
              <Text style={styles.reservationTitle}>{item.name}</Text>
              <Text style={styles.reservationSubtitle}>{settings.autoConfirm ? 'Confirmação imediata conforme disponibilidade.' : 'O restaurante confirmará sua solicitação.'}</Text>
            </View>
            <Pressable accessibilityLabel="Fechar reserva" onPress={onClose} style={styles.floatButton}>
              <Ionicons name="close" size={22} color={colors.ink} />
            </Pressable>
          </View>

          <ScrollView showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
            <Text style={styles.reservationFieldLabel}>Escolha o dia</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.reservationDateRow}>
              {dates.map((date) => (
                <Pressable
                  key={date.key}
                  accessibilityRole="button"
                  accessibilityLabel={`Reservar em ${date.fullLabel}`}
                  onPress={() => setDraft((current) => ({ ...current, date: date.key, time: '' }))}
                  style={[styles.reservationDateCard, draft.date === date.key && styles.reservationDateCardActive]}
                >
                  <Text style={[styles.reservationDateWeekday, draft.date === date.key && styles.reservationDateTextActive]}>{date.weekday}</Text>
                  <Text style={[styles.reservationDateDay, draft.date === date.key && styles.reservationDateTextActive]}>{date.day}</Text>
                </Pressable>
              ))}
            </ScrollView>

            <Text style={styles.reservationFieldLabel}>Horário</Text>
            <View style={styles.reservationSlotGrid}>
              {slots.length ? slots.map((slot) => {
                const fitsParty = slot.remaining >= Number(draft.partySize);
                const available = slot.available && fitsParty;
                const selected = draft.time === slot.time;
                return (
                  <Pressable
                    key={slot.time}
                    accessibilityRole="button"
                    accessibilityLabel={`${slot.time}${available ? `, ${slot.remaining} lugares` : ', lotado'}`}
                    onPress={() => setDraft((current) => ({ ...current, time: slot.time }))}
                    style={[styles.reservationSlot, selected && styles.reservationSlotSelected, !available && styles.reservationSlotFull]}
                  >
                    <Text style={[styles.reservationSlotTime, selected && styles.reservationSlotTimeSelected]}>{slot.time}</Text>
                    <Text style={[styles.reservationSlotMeta, selected && styles.reservationSlotMetaSelected]}>{available ? `${slot.remaining} vagas` : 'Lista de espera'}</Text>
                  </Pressable>
                );
              }) : (
                <View style={styles.reservationNoSlots}>
                  <Ionicons name="time-outline" size={24} color={colors.redDark} />
                  <Text style={styles.reservationNoSlotsTitle}>Sem horários disponíveis neste dia</Text>
                  <Text style={styles.reservationNoSlotsText}>Você ainda pode entrar na lista de espera.</Text>
                </View>
              )}
            </View>

            <Text style={styles.reservationFieldLabel}>Tamanho do grupo</Text>
            <View style={styles.reservationPartyRow}>
              {Array.from({ length: Math.min(settings.maxPartySize, 8) }, (_, index) => index + 1).map((size) => (
                <Pressable key={size} onPress={() => setDraft((current) => ({ ...current, partySize: size, time: '' }))} style={[styles.reservationPartyChip, Number(draft.partySize) === size && styles.reservationPartyChipActive]}>
                  <Text style={[styles.reservationPartyText, Number(draft.partySize) === size && styles.reservationPartyTextActive]}>{size}</Text>
                </Pressable>
              ))}
            </View>

            <Field
              label="Telefone para contato"
              value={draft.phone}
              onChangeText={(value) => setDraft((current) => ({ ...current, phone: value }))}
              keyboardType="phone-pad"
              placeholder="(17) 99999-9999"
              hint="Usado somente para atualizações desta reserva."
            />
            <Field
              label="Observações"
              value={draft.notes}
              onChangeText={(value) => setDraft((current) => ({ ...current, notes: value }))}
              placeholder="Acessibilidade, cadeira infantil ou ocasião especial"
              multiline
            />
          </ScrollView>

          <View style={styles.reservationFooter}>
            {canWaitlist ? (
              <AppButton onPress={() => onWaitlist(item, draft)}>Entrar na lista de espera</AppButton>
            ) : (
              <AppButton
                disabled={!canReserve || submitting}
                onPress={async () => {
                  if (submitting) return;
                  setSubmitting(true);
                  try {
                    await onReserve(item, draft);
                  } finally {
                    setSubmitting(false);
                  }
                }}
              >
                {submitting ? 'Confirmando...' : (settings.autoConfirm ? 'Confirmar reserva' : 'Solicitar reserva')}
              </AppButton>
            )}
            {!String(draft.phone || '').trim() ? <Text style={styles.reservationFooterHint}>Informe um telefone para continuar.</Text> : null}
          </View>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

function RestaurantModal({
  item,
  onClose,
  onMaps,
  onWhatsApp,
  onReserve,
  onClaim,
  reviews,
  reviewDraft,
  setReviewDraft,
  onSubmitReview,
  onLikeReview,
  onPinReview,
  onRemoveReview,
  onKnown,
  onCheckIn,
  communityPosts = [],
  onOpenCommunityPost,
  currentUser,
  isAdmin,
  favorite,
  onFavorite,
  onReportContent
}) {
  const [activeDetailTab, setActiveDetailTab] = useState('Cardápio');
  const [expandedMenuItem, setExpandedMenuItem] = useState(null);
  useEffect(() => {
    if (item?.id) {
      setActiveDetailTab(communityPosts.length ? 'Comunidade' : 'Cardápio');
      recordRestaurantMetricInDb(item.id, 'views').catch(() => {});
    }
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
  const tabs = ['Comunidade', 'Cardápio', 'Sobre', 'Avaliações'];
  const renderActionButton = (icon, label, onPress, active = false) => (
    <Pressable accessibilityRole="button" accessibilityLabel={label} onPress={onPress} style={({ pressed }) => [styles.detailActionButton, active && styles.detailActionButtonActive, pressed && styles.activePress]}>
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
              {renderActionButton('navigate-outline', 'Como chegar', () => onMaps(item), true)}
              {renderActionButton('calendar-outline', 'Reservar', () => onReserve(item))}
              {renderActionButton('camera-outline', 'Check-in', () => onCheckIn(item))}
              {renderActionButton('checkmark-circle-outline', 'Já conheci', () => onKnown(item))}
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

            {activeDetailTab === 'Comunidade' ? (
              <View style={styles.detailCommunitySection}>
                <View style={styles.detailCommunityHeader}>
                  <View>
                    <Text style={styles.detailMenuEyebrow}>Comunidade Dine</Text>
                    <Text style={styles.detailMenuTitle}>{communityPosts.length ? `${communityPosts.length} descobertas recentes` : 'Seja a primeira pessoa a publicar'}</Text>
                  </View>
                  <Pressable onPress={() => onCheckIn(item)} style={styles.detailCommunityCheckIn}>
                    <Ionicons name="camera-outline" size={17} color={colors.card} />
                    <Text style={styles.detailCommunityCheckInText}>Check-in</Text>
                  </Pressable>
                </View>
                {communityPosts.length ? (
                  <View style={styles.detailCommunityGrid}>
                    {communityPosts.slice(0, 9).map((post) => (
                      <Pressable key={post.id} onPress={() => onOpenCommunityPost?.(post)} style={styles.detailCommunityTile}>
                        <Image source={imageSource(post.images?.[0] || post.image)} style={styles.detailCommunityImage} />
                        {post.kind === 'checkin' ? (
                          <View style={styles.detailCommunityBadge}>
                            <Ionicons name="location" size={12} color="#FFFFFF" />
                          </View>
                        ) : null}
                      </Pressable>
                    ))}
                  </View>
                ) : (
                  <Pressable onPress={() => onCheckIn(item)} style={styles.detailCommunityEmpty}>
                    <Ionicons name="images-outline" size={28} color={colors.redDark} />
                    <Text style={styles.detailCommunityEmptyTitle}>Mostre sua experiência</Text>
                    <Text style={styles.detailCommunityEmptyText}>Publique uma foto, marque o lugar e ajude outras pessoas a escolher.</Text>
                  </Pressable>
                )}
              </View>
            ) : null}

            {activeDetailTab === 'Cardápio' ? (
              <View style={styles.detailMenuTab}>
                {item.menuPhoto ? <Image source={{ uri: item.menuPhoto }} style={styles.detailMenuPhoto} /> : null}
                <View style={styles.detailMenuHeader}>
                  <View>
                    <Text style={styles.detailMenuEyebrow}>Cardápio</Text>
                    <Text style={styles.detailMenuTitle}>{menuItems.length ? `${menuItems.length} itens disponíveis` : 'Em atualização'}</Text>
                  </View>
                </View>
                {menuItems.length ? menuItems.map((dish, index) => {
                  const itemKey = dish.id || `${dish.name}-${index}`;
                  const expanded = expandedMenuItem === itemKey;
                  const price = dish.priceLabel || (dish.price ? `R$ ${dish.price}` : 'Sob consulta');
                  return (
                    <Pressable key={itemKey} onPress={() => setExpandedMenuItem(expanded ? null : itemKey)} style={styles.detailMenuTabItem}>
                      {dish.image ? <Image source={{ uri: dish.image }} style={styles.detailMenuTabItemImage} /> : <View style={styles.detailMenuImageFallback}><Ionicons name="restaurant-outline" size={22} color={colors.redDark} /></View>}
                      <View style={styles.detailMenuCopy}>
                        <Text style={styles.detailMenuName}>{dish.name}</Text>
                        {dish.description ? <Text numberOfLines={expanded ? 5 : 2} style={styles.detailMenuDescription}>{dish.description}</Text> : null}
                        <Text style={styles.detailMenuPrice}>{price}</Text>
                      </View>
                      <Ionicons name={expanded ? 'chevron-up' : 'chevron-down'} size={17} color={colors.muted} />
                    </Pressable>
                  );
                }) : (
                  <View style={styles.detailMenuEmpty}>
                    <Ionicons name="restaurant-outline" size={26} color={colors.redDark} />
                    <Text style={styles.detailMenuEmptyText}>O restaurante ainda não publicou itens no cardápio.</Text>
                  </View>
                )}
              </View>
            ) : null}

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
                  <Pressable onPress={() => onReserve(item)} style={styles.detailSecondaryButton}>
                    <Text style={styles.detailSecondaryButtonText}>Reservar</Text>
                  </Pressable>
                  <Pressable onPress={() => onWhatsApp(item, false)} style={styles.detailSecondaryButton}>
                    <Text style={styles.detailSecondaryButtonText}>WhatsApp</Text>
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
                          <>
                            <Pressable onPress={() => onPinReview(review)} style={styles.reviewActionButton}>
                              <Ionicons name={review.pinned ? 'pin' : 'pin-outline'} size={20} color={colors.ink} />
                              <Text style={styles.reviewActionText}>{review.pinned ? 'Desfixar' : 'Fixar'}</Text>
                            </Pressable>
                            <Pressable onPress={() => onRemoveReview(review)} style={styles.reviewActionButton}>
                              <Ionicons name="trash-outline" size={20} color={colors.redDark} />
                              <Text style={styles.reviewActionText}>Remover</Text>
                            </Pressable>
                          </>
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

function FeedPostDetailModal({
  visible,
  post,
  reaction,
  commentDraft,
  onChangeComment,
  onAddComment,
  onClose,
  onOpenAuthor,
  onOpenRestaurant,
  onLike,
  onSave,
  onShare,
  onReport,
  onDelete,
  canDelete
}) {
  const { width } = useWindowDimensions();
  if (!visible || !post) return null;

  const images = (post.images?.length ? post.images : [post.image]).filter(Boolean).slice(0, 4);
  const comments = commentsForPost(post, reaction);
  const imageWidth = Math.min(width, 720);
  const likes = Number(post.likes || 0) + (reaction?.liked ? 1 : 0);
  const restaurant = post.restaurant;
  const linkedRestaurant = restaurant?.id && !String(restaurant.id).startsWith('custom-restaurant-');
  const authorAvatar = String(post.avatar || '').trim();
  const authorInitials = initialsForName(post.author, 'D');

  return (
    <Modal visible animationType="slide" presentationStyle="fullScreen" onRequestClose={onClose}>
      <SafeAreaView style={styles.feedDetailSafe}>
        <View style={styles.feedDetailTopBar}>
          <Pressable accessibilityRole="button" accessibilityLabel="Fechar publicacao" onPress={onClose} style={styles.feedDetailIconButton}>
            <Ionicons name="chevron-back" size={24} color={colors.ink} />
          </Pressable>
          <Text style={styles.feedDetailTopTitle}>Publicacao</Text>
          <Pressable accessibilityRole="button" accessibilityLabel="Denunciar publicacao" onPress={onReport} style={styles.feedDetailIconButton}>
            <Ionicons name="flag-outline" size={21} color={colors.ink} />
          </Pressable>
        </View>

        <ScrollView contentContainerStyle={styles.feedDetailContent} keyboardShouldPersistTaps="handled">
          <Pressable accessibilityRole="button" accessibilityLabel={`Abrir perfil de ${post.author}`} onPress={onOpenAuthor} style={styles.feedDetailAuthorRow}>
            {authorAvatar ? (
              <Image accessibilityLabel={`Foto de ${post.author}`} source={imageSource(authorAvatar)} style={styles.feedDetailAvatar} />
            ) : (
              <View style={styles.feedDetailAvatarFallback}>
                <Text style={styles.feedDetailAvatarInitials}>{authorInitials}</Text>
              </View>
            )}
            <View style={styles.feedDetailAuthorCopy}>
              <Text style={styles.feedDetailAuthor}>{post.author || 'Usuario Dine'}</Text>
              <Text style={styles.feedDetailMeta}>{post.handle || '@dine'} • {formatPostDate(post.createdAt)}</Text>
            </View>
            <Ionicons name="chevron-forward" size={19} color={colors.muted} />
          </Pressable>

          <View style={[styles.feedDetailGallery, { width: imageWidth }]}>
            <ScrollView horizontal pagingEnabled showsHorizontalScrollIndicator={false}>
              {images.map((photo, index) => (
                <Image
                  key={`${post.id}-detail-${index}`}
                  accessibilityLabel={`${post.caption || post.title || 'Foto da publicacao'} ${index + 1} de ${images.length}`}
                  source={imageSource(photo)}
                  style={[styles.feedDetailImage, { width: imageWidth }]}
                />
              ))}
            </ScrollView>
            {images.length > 1 ? <Text style={styles.feedDetailPhotoCount}>{images.length} fotos</Text> : null}
          </View>

          <View style={styles.feedDetailBody}>
            <View style={styles.feedDetailActions}>
              <Pressable accessibilityRole="button" accessibilityLabel={reaction?.liked ? 'Descurtir publicacao' : 'Curtir publicacao'} onPress={onLike} style={styles.feedDetailActionButton}>
                <Ionicons name={reaction?.liked ? 'heart' : 'heart-outline'} size={25} color={reaction?.liked ? colors.redDark : colors.ink} />
                <Text style={styles.feedDetailActionText}>{likes}</Text>
              </Pressable>
              <View style={styles.feedDetailActionButton}>
                <Ionicons name="chatbubble-outline" size={23} color={colors.ink} />
                <Text style={styles.feedDetailActionText}>{comments.length}</Text>
              </View>
              <Pressable accessibilityRole="button" accessibilityLabel="Compartilhar publicacao" onPress={onShare} style={styles.feedDetailActionButton}>
                <Ionicons name="share-social-outline" size={24} color={colors.ink} />
              </Pressable>
              <View style={styles.feedDetailActionSpacer} />
              <Pressable accessibilityRole="button" accessibilityLabel={reaction?.saved ? 'Remover dos salvos' : 'Salvar publicacao'} onPress={onSave} style={styles.feedDetailActionButton}>
                <Ionicons name={reaction?.saved ? 'bookmark' : 'bookmark-outline'} size={24} color={reaction?.saved ? colors.redDark : colors.ink} />
              </Pressable>
            </View>

            {post.title ? <Text style={styles.feedDetailTitle}>{post.title}</Text> : null}
            {post.caption ? <Text style={styles.feedDetailCaption}>{post.caption}</Text> : null}

            {restaurant ? (
              <Pressable
                accessibilityRole={linkedRestaurant ? 'button' : 'text'}
                accessibilityLabel={linkedRestaurant ? `Ver restaurante ${restaurant.name}` : `Restaurante informado: ${restaurant.name}`}
                disabled={!linkedRestaurant}
                onPress={onOpenRestaurant}
                style={({ pressed }) => [styles.feedDetailRestaurant, pressed && linkedRestaurant && styles.activePress]}
              >
                <Image source={imageSource(restaurant.logo || restaurant.image)} style={styles.feedDetailRestaurantImage} />
                <View style={styles.feedDetailRestaurantCopy}>
                  <Text style={styles.feedDetailRestaurantEyebrow}>Publicado em</Text>
                  <Text style={styles.feedDetailRestaurantName} numberOfLines={1}>{restaurant.name}</Text>
                  <Text style={styles.feedDetailRestaurantMeta} numberOfLines={1}>{restaurant.type} • {restaurant.district}</Text>
                </View>
                {linkedRestaurant ? <Text style={styles.feedDetailRestaurantLink}>Ver restaurante</Text> : null}
              </Pressable>
            ) : null}

            <View style={styles.feedDetailCommentsSection}>
              <Text style={styles.feedDetailSectionTitle}>Comentarios</Text>
              {comments.length ? comments.map((comment) => (
                <View key={comment.id} style={styles.feedDetailComment}>
                  <View style={styles.feedDetailCommentAvatar}>
                    <Text style={styles.feedDetailCommentInitial}>{String(comment.author || 'D').slice(0, 1).toUpperCase()}</Text>
                  </View>
                  <View style={styles.feedDetailCommentCopy}>
                    <Text style={styles.feedDetailCommentAuthor}>{comment.author || 'Usuario Dine'}</Text>
                    <Text style={styles.feedDetailCommentText}>{comment.text}</Text>
                    {comment.createdAt ? <Text style={styles.feedDetailCommentDate}>{formatPostDate(comment.createdAt)}</Text> : null}
                  </View>
                </View>
              )) : (
                <Text style={styles.feedDetailEmptyComments}>Ainda nao ha comentarios. Comece a conversa.</Text>
              )}
              <View style={styles.feedDetailComposer}>
                <TextInput
                  accessibilityLabel="Adicionar comentario"
                  value={commentDraft}
                  onChangeText={onChangeComment}
                  placeholder="Adicione um comentario..."
                  placeholderTextColor="#8A8179"
                  maxLength={1000}
                  multiline
                  style={styles.feedDetailCommentInput}
                />
                <Pressable
                  accessibilityRole="button"
                  accessibilityLabel="Publicar comentario"
                  accessibilityState={{ disabled: !String(commentDraft || '').trim() }}
                  disabled={!String(commentDraft || '').trim()}
                  onPress={onAddComment}
                  style={[styles.feedDetailSendButton, !String(commentDraft || '').trim() && styles.buttonDisabled]}
                >
                  <Ionicons name="send" size={18} color={colors.card} />
                </Pressable>
              </View>
            </View>

            {canDelete ? (
              <Pressable accessibilityRole="button" accessibilityLabel="Excluir publicacao" onPress={onDelete} style={styles.feedDetailDeleteButton}>
                <Ionicons name="trash-outline" size={19} color={colors.redDark} />
                <Text style={styles.feedDetailDeleteText}>Excluir publicacao</Text>
              </Pressable>
            ) : null}
          </View>
        </ScrollView>
      </SafeAreaView>
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
            <View style={styles.postViewerSocialActions}>
              <Pressable accessibilityRole="button" accessibilityLabel={liked ? 'Descurtir publicacao' : 'Curtir publicacao'} onPress={onLike} style={styles.postViewerSocialButton}>
                <Ionicons name={liked ? 'heart' : 'heart-outline'} size={22} color={liked ? colors.redDark : colors.ink} />
                <Text style={styles.postViewerSocialText}>{likesCount}</Text>
              </Pressable>
              <Pressable accessibilityRole="button" accessibilityLabel="Denunciar publicacao" onPress={onReport} style={styles.postViewerSocialButton}>
                <Ionicons name="flag-outline" size={20} color={colors.ink} />
                <Text style={styles.postViewerSocialText}>Denunciar</Text>
              </Pressable>
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
  const profileAvatar = String(profile.avatar || '').trim();
  const profileInitials = initialsForName(profile.name, 'D');
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
              {profileAvatar ? (
                <Image source={imageSource(profileAvatar)} style={styles.feedProfileAvatar} />
              ) : (
                <View style={styles.feedProfileAvatarFallback}>
                  <Text style={styles.feedProfileAvatarInitials}>{profileInitials}</Text>
                </View>
              )}
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

function AuthModal({ mode, form, setForm, setMode, onSubmitAuth, submitting = false, error = '', required = false }) {
  const { width } = useWindowDimensions();
  const [passwordVisible, setPasswordVisible] = useState(false);
  const desktop = Platform.OS === 'web' && width >= 900;

  if (!mode) return null;

  const login = mode === 'login';
  const title = login
    ? 'Entre no Dine'
    : 'Como você quer usar o Dine?';

  const content = (
    <View style={styles.authFullForm}>
      {!required ? (
        <Pressable accessibilityRole="button" accessibilityLabel="Fechar" onPress={() => setMode(null)} style={styles.authCloseButton}>
          <Ionicons name="close" size={22} color={colors.ink} />
        </Pressable>
      ) : null}

      <Image source={dineLogo} style={styles.authLogo} resizeMode="contain" />
      <Text style={styles.authTitle}>{title}</Text>
      <Text style={styles.authSubtitle}>
        {login ? 'A experiência certa será aberta de acordo com o seu tipo de conta.' : 'Escolha o perfil que combina com o que você quer fazer agora.'}
      </Text>

      <View accessibilityRole="tablist" style={styles.authModeTabs}>
        {[
          ['login', 'Entrar'],
          ['signup', 'Criar conta']
        ].map(([value, label]) => {
          const active = mode === value;
          return (
            <Pressable
              key={value}
              accessibilityRole="tab"
              accessibilityState={{ selected: active }}
              onPress={() => setMode(value)}
              style={[styles.authModeTab, active && styles.authModeTabActive]}
            >
              <Text style={[styles.authModeTabText, active && styles.authModeTabTextActive]}>{label}</Text>
            </Pressable>
          );
        })}
      </View>

      {!login ? (
        <View style={styles.authAccountTypeGroup}>
          <Text style={styles.authAccountTypeLabel}>Tipo de conta</Text>
          <View accessibilityRole="radiogroup" style={styles.authAccountTypeList}>
            {[
              ['user', 'person-outline', 'Usuário', 'Descobrir, reservar e avaliar restaurantes.'],
              ['restaurant_owner', 'storefront-outline', 'Dono de restaurante', 'Cadastrar e gerenciar seu estabelecimento.']
            ].map(([value, icon, label, description]) => {
              const selected = form.accountType === value;
              return (
                <Pressable
                  key={value}
                  accessibilityRole="radio"
                  accessibilityLabel={`Conta de ${label}`}
                  accessibilityState={{ checked: selected }}
                  onPress={() => setForm({ ...form, accountType: value })}
                  style={({ pressed }) => [
                    styles.authAccountTypeCard,
                    selected && styles.authAccountTypeCardSelected,
                    pressed && styles.activePress
                  ]}
                >
                  <View style={[styles.authAccountTypeIcon, selected && styles.authAccountTypeIconSelected]}>
                    <Ionicons name={icon} size={22} color={selected ? colors.card : colors.redDark} />
                  </View>
                  <View style={styles.authAccountTypeCopy}>
                    <Text style={[styles.authAccountTypeTitle, selected && styles.authAccountTypeTitleSelected]}>{label}</Text>
                    <Text style={styles.authAccountTypeDescription}>{description}</Text>
                  </View>
                  <Ionicons name={selected ? 'checkmark-circle' : 'ellipse-outline'} size={23} color={selected ? colors.redDark : colors.muted} />
                </Pressable>
              );
            })}
          </View>
        </View>
      ) : null}

      <View style={styles.authFields}>
        {!login ? (
          <AuthField
            label="Nome"
            icon="person-outline"
            value={form.name || ''}
            onChangeText={(value) => setForm({ ...form, name: value })}
            autoComplete="name"
            textContentType="name"
            returnKeyType="next"
          />
        ) : null}
        <AuthField
          label="E-mail"
          icon="mail-outline"
          value={form.email || ''}
          onChangeText={(value) => setForm({ ...form, email: value })}
          keyboardType="email-address"
          autoCapitalize="none"
          autoCorrect={false}
          autoComplete="email"
          textContentType="emailAddress"
          placeholder="voce@email.com"
          returnKeyType="next"
        />
        <AuthField
          label="Senha"
          icon="lock-closed-outline"
          value={form.password || ''}
          onChangeText={(value) => setForm({ ...form, password: value })}
          secureTextEntry={!passwordVisible}
          autoComplete={login ? 'current-password' : 'new-password'}
          textContentType={login ? 'password' : 'newPassword'}
          placeholder={login ? 'Sua senha' : 'Mínimo de 6 caracteres'}
          returnKeyType="done"
          onSubmitEditing={onSubmitAuth}
          trailing={(
            <Pressable
              accessibilityRole="button"
              accessibilityLabel={passwordVisible ? 'Ocultar senha' : 'Mostrar senha'}
              hitSlop={8}
              onPress={() => setPasswordVisible((visible) => !visible)}
              style={styles.authFieldAction}
            >
              <Ionicons name={passwordVisible ? 'eye-off-outline' : 'eye-outline'} size={20} color={colors.muted} />
            </Pressable>
          )}
        />
      </View>

      {!login ? <Text style={styles.authPasswordHint}>Use pelo menos 6 caracteres.</Text> : null}
      {error ? (
        <View accessibilityRole="alert" style={styles.authError}>
          <Ionicons name="alert-circle-outline" size={18} color={colors.redDark} />
          <Text style={styles.authErrorText}>{error}</Text>
        </View>
      ) : null}

      <AppButton disabled={submitting} onPress={onSubmitAuth} style={styles.authSubmitButton}>
        {submitting ? 'Aguarde...' : login ? 'Entrar' : 'Criar minha conta'}
      </AppButton>

      <Pressable
        accessibilityRole="button"
        disabled={submitting}
        onPress={() => setMode(login ? 'signup' : 'login')}
        style={styles.authSwitchButton}
      >
        <Text style={styles.authSwitchText}>
          {login ? 'Ainda não tem conta? ' : 'Já tem uma conta? '}
          <Text style={styles.authSwitchAction}>{login ? 'Criar conta' : 'Entrar'}</Text>
        </Text>
      </Pressable>

      <Text style={styles.authLegal}>
        Ao continuar, você concorda com os Termos de Uso e a Política de Privacidade do Dine.
      </Text>
    </View>
  );

  if (required) {
    return (
      <Modal visible animationType="fade" presentationStyle="fullScreen" onRequestClose={() => null}>
        <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={styles.authFullBackdrop}>
          <View style={[styles.authLayout, !desktop && styles.authLayoutMobile]}>
            {desktop ? (
              <View style={styles.authVisualPanel}>
                <Image source={authFoodImage} style={styles.authVisualImage} resizeMode="cover" />
                <View pointerEvents="none" style={styles.authVisualShade} />
              </View>
            ) : null}
            <View style={styles.authFormPanel}>
              <ScrollView
                keyboardShouldPersistTaps="handled"
                showsVerticalScrollIndicator={false}
                contentContainerStyle={[styles.authFormScrollContent, !desktop && styles.authFormScrollContentMobile]}
              >
                {content}
              </ScrollView>
            </View>
          </View>
        </KeyboardAvoidingView>
      </Modal>
    );
  }

  return (
    <Modal visible transparent animationType="slide" onRequestClose={() => setMode(null)}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={styles.modalBackdrop}>
        <ScrollView contentContainerStyle={styles.authSheet} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
          {content}
        </ScrollView>
      </KeyboardAvoidingView>
    </Modal>
  );
}

function AuthField({ label, icon, trailing, ...props }) {
  return (
    <View style={styles.authField}>
      <Text style={styles.authFieldLabel}>{label}</Text>
      <View style={styles.authFieldInputWrap}>
        <Ionicons name={icon} size={19} color={colors.muted} />
        <TextInput
          accessibilityLabel={props.accessibilityLabel || label}
          placeholderTextColor="#918A82"
          style={styles.authFieldInput}
          {...props}
        />
        {trailing}
      </View>
    </View>
  );
}

function Field({ label, error, hint, ...props }) {
  return (
    <View style={styles.field}>
      <Text style={styles.fieldLabel}>{label}</Text>
      <TextInput
        accessibilityLabel={props.accessibilityLabel || label}
        placeholderTextColor="#a19a90"
        style={[styles.fieldInput, props.multiline && styles.fieldTextarea, error && styles.fieldInputError]}
        {...props}
      />
      {error ? <Text style={styles.fieldErrorText}>{error}</Text> : hint ? <Text style={styles.fieldHintText}>{hint}</Text> : null}
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
  buttonDisabled: { opacity: 0.48 },
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
  feedAvatarFallback: { width: 42, height: 42, borderRadius: 21, backgroundColor: colors.ink, borderWidth: 1, borderColor: colors.line, alignItems: 'center', justifyContent: 'center' },
  feedAvatarInitials: { color: colors.card, fontFamily: bodyFont, fontSize: 13 },
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
  feedProfileAvatarFallback: { width: 92, height: 92, borderRadius: 46, backgroundColor: colors.ink, borderWidth: 2, borderColor: colors.card, alignItems: 'center', justifyContent: 'center' },
  feedProfileAvatarInitials: { color: colors.card, fontFamily: titleFont, fontSize: 26 },
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
  mapCard: { height: 420, marginHorizontal: -22, backgroundColor: '#DCE8D3', overflow: 'hidden' },
  webMapDragLayer: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
    cursor: 'grab',
    ...(Platform.OS === 'web' ? { touchAction: 'none', overscrollBehavior: 'contain', userSelect: 'none' } : {})
  },
  webMapScrim: { position: 'absolute', left: 0, right: 0, top: 0, bottom: 0, backgroundColor: 'rgba(255, 246, 234, 0.04)' },
  webMapAttribution: { position: 'absolute', right: 8, bottom: 28, zIndex: 4, paddingHorizontal: 6, paddingVertical: 3, backgroundColor: 'rgba(255,255,255,0.86)', color: colors.muted, fontFamily: 'Nunito_400Regular', fontSize: 10 },
  webMapMarker: { position: 'absolute', zIndex: 5, width: 138, minHeight: 68, marginLeft: -69, marginTop: -68, alignItems: 'center' },
  webMapMarkerCard: { minWidth: 118, maxWidth: 138, borderRadius: 12, backgroundColor: 'rgba(255, 253, 247, 0.97)', paddingVertical: 7, paddingHorizontal: 10, borderWidth: 1, borderColor: colors.line, shadowColor: colors.ink, shadowOpacity: 0.16, shadowRadius: 10, elevation: 5 },
  webMapMarkerDot: { width: 34, height: 34, borderRadius: 17, marginTop: -2, backgroundColor: colors.redDark, alignItems: 'center', justifyContent: 'center', borderWidth: 3, borderColor: colors.card, shadowColor: colors.ink, shadowOpacity: 0.18, shadowRadius: 8, elevation: 5 },
  webMapMarkerDotAlt: { backgroundColor: colors.olive },
  webMapMarkerStem: { position: 'absolute', left: 67, bottom: -1, width: 4, height: 18, borderRadius: 2, backgroundColor: colors.redDark, shadowColor: colors.ink, shadowOpacity: 0.1, shadowRadius: 4 },
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
  mapCompass: { position: 'absolute', left: 22, top: 22, zIndex: 4, minHeight: 34, borderRadius: 18, paddingHorizontal: 12, gap: 6, flexDirection: 'row', alignItems: 'center', backgroundColor: 'rgba(255, 253, 247, 0.92)', borderWidth: 1, borderColor: colors.line },
  mapCompassText: { color: colors.ink, fontFamily: bodyFont, fontSize: 13 },
  mapPin: { position: 'absolute', zIndex: 5, minWidth: 118, minHeight: 74 },
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
  postViewerSocialActions: { flexDirection: 'row', alignItems: 'center', gap: 16 },
  postViewerSocialButton: { minHeight: 40, flexDirection: 'row', alignItems: 'center', gap: 7 },
  postViewerSocialText: { color: colors.ink, fontFamily: bodyFont, fontSize: 13 },
  postViewerAction: { minHeight: 48, marginHorizontal: 14, marginBottom: 14, borderRadius: 14, backgroundColor: colors.redDark, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8 },
  postViewerActionText: { color: colors.card, fontFamily: bodyFont, fontSize: 14 },
  feedDetailSafe: { flex: 1, backgroundColor: colors.bg },
  feedDetailTopBar: { width: '100%', maxWidth: 720, alignSelf: 'center', minHeight: 58, paddingHorizontal: 12, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', borderBottomWidth: 1, borderBottomColor: colors.line, backgroundColor: colors.bg },
  feedDetailTopTitle: { color: colors.ink, fontFamily: bodyFont, fontSize: 16 },
  feedDetailIconButton: { width: 42, height: 42, borderRadius: 21, alignItems: 'center', justifyContent: 'center' },
  feedDetailContent: { width: '100%', maxWidth: 720, alignSelf: 'center', paddingBottom: 48, backgroundColor: colors.bg },
  feedDetailAuthorRow: { minHeight: 68, paddingHorizontal: 14, paddingVertical: 10, flexDirection: 'row', alignItems: 'center', gap: 10 },
  feedDetailAvatar: { width: 44, height: 44, borderRadius: 22, backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.line },
  feedDetailAvatarFallback: { width: 44, height: 44, borderRadius: 22, backgroundColor: colors.ink, borderWidth: 1, borderColor: colors.line, alignItems: 'center', justifyContent: 'center' },
  feedDetailAvatarInitials: { color: colors.card, fontFamily: bodyFont, fontSize: 13 },
  feedDetailAuthorCopy: { flex: 1, minWidth: 0 },
  feedDetailAuthor: { color: colors.ink, fontFamily: bodyFont, fontSize: 15 },
  feedDetailMeta: { color: colors.muted, fontFamily: 'Nunito_400Regular', fontSize: 12, marginTop: 2 },
  feedDetailGallery: { alignSelf: 'center', overflow: 'hidden', backgroundColor: colors.surface },
  feedDetailImage: { aspectRatio: 1, backgroundColor: colors.surface },
  feedDetailPhotoCount: { position: 'absolute', right: 12, top: 12, overflow: 'hidden', borderRadius: 12, backgroundColor: 'rgba(0,0,0,0.52)', paddingHorizontal: 9, paddingVertical: 4, color: colors.card, fontFamily: bodyFont, fontSize: 12 },
  feedDetailBody: { paddingHorizontal: 16, paddingTop: 12, gap: 14 },
  feedDetailActions: { minHeight: 40, flexDirection: 'row', alignItems: 'center', gap: 14 },
  feedDetailActionButton: { minHeight: 40, flexDirection: 'row', alignItems: 'center', gap: 6 },
  feedDetailActionText: { color: colors.ink, fontFamily: bodyFont, fontSize: 13 },
  feedDetailActionSpacer: { flex: 1 },
  feedDetailTitle: { color: colors.ink, fontFamily: titleFont, fontWeight: '900', fontSize: 24, lineHeight: 29 },
  feedDetailCaption: { color: colors.ink, fontFamily: 'Nunito_400Regular', fontSize: 15, lineHeight: 22 },
  feedDetailRestaurant: { minHeight: 76, borderTopWidth: 1, borderBottomWidth: 1, borderColor: colors.line, paddingVertical: 10, flexDirection: 'row', alignItems: 'center', gap: 11 },
  feedDetailRestaurantImage: { width: 52, height: 52, borderRadius: 12, backgroundColor: colors.surface },
  feedDetailRestaurantCopy: { flex: 1, minWidth: 0 },
  feedDetailRestaurantEyebrow: { color: colors.redDark, fontFamily: 'Nunito_700Bold', fontSize: 10, textTransform: 'uppercase' },
  feedDetailRestaurantName: { color: colors.ink, fontFamily: bodyFont, fontSize: 15, marginTop: 2 },
  feedDetailRestaurantMeta: { color: colors.muted, fontFamily: 'Nunito_400Regular', fontSize: 12, marginTop: 2 },
  feedDetailRestaurantLink: { color: colors.redDark, fontFamily: bodyFont, fontSize: 12 },
  feedDetailCommentsSection: { gap: 12 },
  feedDetailSectionTitle: { color: colors.ink, fontFamily: bodyFont, fontSize: 17 },
  feedDetailComment: { flexDirection: 'row', alignItems: 'flex-start', gap: 10 },
  feedDetailCommentAvatar: { width: 34, height: 34, borderRadius: 17, backgroundColor: colors.redDark, alignItems: 'center', justifyContent: 'center' },
  feedDetailCommentInitial: { color: colors.card, fontFamily: bodyFont, fontSize: 13 },
  feedDetailCommentCopy: { flex: 1, minWidth: 0 },
  feedDetailCommentAuthor: { color: colors.ink, fontFamily: bodyFont, fontSize: 13 },
  feedDetailCommentText: { color: colors.ink, fontFamily: 'Nunito_400Regular', fontSize: 14, lineHeight: 20, marginTop: 2 },
  feedDetailCommentDate: { color: colors.muted, fontFamily: 'Nunito_400Regular', fontSize: 11, marginTop: 3 },
  feedDetailEmptyComments: { color: colors.muted, fontFamily: 'Nunito_400Regular', fontSize: 14, lineHeight: 20 },
  feedDetailComposer: { minHeight: 48, borderWidth: 1, borderColor: colors.line, borderRadius: 16, backgroundColor: colors.surface, paddingLeft: 12, paddingRight: 5, paddingVertical: 5, flexDirection: 'row', alignItems: 'flex-end', gap: 8 },
  feedDetailCommentInput: { flex: 1, minWidth: 0, maxHeight: 110, paddingVertical: 8, color: colors.ink, fontFamily: 'Nunito_400Regular', fontSize: 14, textAlignVertical: 'top' },
  feedDetailSendButton: { width: 40, height: 40, borderRadius: 20, backgroundColor: colors.redDark, alignItems: 'center', justifyContent: 'center' },
  feedDetailDeleteButton: { minHeight: 46, borderTopWidth: 1, borderTopColor: colors.line, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8 },
  feedDetailDeleteText: { color: colors.redDark, fontFamily: bodyFont, fontSize: 14 },
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
  authFullBackdrop: { flex: 1, backgroundColor: colors.surface },
  authLayout: { flex: 1, minHeight: '100%', flexDirection: 'row', backgroundColor: colors.surface },
  authLayoutMobile: { flexDirection: 'column' },
  authVisualPanel: { width: '51%', minHeight: '100%', position: 'relative', overflow: 'hidden', backgroundColor: colors.ink },
  authVisualImage: { width: '100%', height: '100%' },
  authVisualShade: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(17, 29, 22, 0.08)' },
  authFormPanel: { flex: 1, minWidth: 0, backgroundColor: colors.surface },
  authFormScrollContent: { flexGrow: 1, justifyContent: 'center', paddingHorizontal: 48, paddingVertical: 40 },
  authFormScrollContentMobile: { paddingHorizontal: 22, paddingTop: Platform.OS === 'ios' ? 58 : 36, paddingBottom: 32 },
  authFullForm: { width: '100%', maxWidth: 430, alignSelf: 'center', gap: 0, position: 'relative' },
  authLogo: { width: 118, height: 58, marginBottom: 22, alignSelf: 'flex-start' },
  authTitle: { color: colors.ink, fontFamily: 'Nunito_800ExtraBold', fontSize: 31, lineHeight: 36, marginBottom: 10, letterSpacing: 0 },
  authSubtitle: { color: colors.muted, fontFamily: 'Nunito_400Regular', fontSize: 15, lineHeight: 22, marginBottom: 24 },
  authCloseButton: { position: 'absolute', right: 0, top: 0, zIndex: 3, width: 42, height: 42, borderRadius: 21, borderWidth: 1, borderColor: colors.line, backgroundColor: colors.card, alignItems: 'center', justifyContent: 'center' },
  authModeTabs: { height: 46, flexDirection: 'row', borderBottomWidth: 1, borderBottomColor: colors.line, marginBottom: 22 },
  authModeTab: { flex: 1, minWidth: 0, alignItems: 'center', justifyContent: 'center', borderBottomWidth: 2, borderBottomColor: 'transparent' },
  authModeTabActive: { borderBottomColor: colors.redDark },
  authModeTabText: { color: colors.muted, fontFamily: 'Nunito_700Bold', fontSize: 14 },
  authModeTabTextActive: { color: colors.ink, fontFamily: 'Nunito_800ExtraBold' },
  authAccountTypeGroup: { marginBottom: 20, gap: 9 },
  authAccountTypeLabel: { color: colors.ink, fontFamily: 'Nunito_700Bold', fontSize: 13 },
  authAccountTypeList: { gap: 10 },
  authAccountTypeCard: { minHeight: 78, borderRadius: 12, borderWidth: 1, borderColor: 'rgba(40, 40, 43, 0.16)', backgroundColor: '#FFFFFF', paddingHorizontal: 13, paddingVertical: 12, flexDirection: 'row', alignItems: 'center', gap: 12 },
  authAccountTypeCardSelected: { borderColor: colors.redDark, backgroundColor: '#FFF7F1' },
  authAccountTypeIcon: { width: 42, height: 42, borderRadius: 21, backgroundColor: '#FFF0E8', alignItems: 'center', justifyContent: 'center' },
  authAccountTypeIconSelected: { backgroundColor: colors.redDark },
  authAccountTypeCopy: { flex: 1, minWidth: 0, gap: 2 },
  authAccountTypeTitle: { color: colors.ink, fontFamily: 'Nunito_800ExtraBold', fontSize: 15 },
  authAccountTypeTitleSelected: { color: colors.redDark },
  authAccountTypeDescription: { color: colors.muted, fontFamily: 'Nunito_400Regular', fontSize: 12, lineHeight: 17 },
  authFields: { gap: 15 },
  authField: { gap: 7 },
  authFieldLabel: { color: colors.ink, fontFamily: 'Nunito_700Bold', fontSize: 13 },
  authFieldInputWrap: { minHeight: 52, borderRadius: 8, borderWidth: 1, borderColor: 'rgba(40, 40, 43, 0.18)', backgroundColor: '#FFFFFF', paddingHorizontal: 14, flexDirection: 'row', alignItems: 'center', gap: 10 },
  authFieldInput: { flex: 1, minWidth: 0, height: 50, paddingVertical: 0, color: colors.ink, fontFamily: 'Nunito_400Regular', fontSize: 15 },
  authFieldAction: { width: 32, height: 40, alignItems: 'center', justifyContent: 'center' },
  authPasswordHint: { marginTop: 8, color: colors.muted, fontFamily: 'Nunito_400Regular', fontSize: 12 },
  authError: { marginTop: 14, minHeight: 42, borderRadius: 8, borderWidth: 1, borderColor: 'rgba(200, 70, 37, 0.26)', backgroundColor: '#FFF1E8', paddingHorizontal: 12, paddingVertical: 9, flexDirection: 'row', alignItems: 'center', gap: 8 },
  authErrorText: { flex: 1, minWidth: 0, color: colors.redDark, fontFamily: 'Nunito_700Bold', fontSize: 13, lineHeight: 18 },
  authSubmitButton: { marginTop: 18, minHeight: 52, borderRadius: 8 },
  authSwitchButton: { minHeight: 46, marginTop: 8, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 8 },
  authSwitchText: { color: colors.muted, fontFamily: 'Nunito_400Regular', fontSize: 14, textAlign: 'center' },
  authSwitchAction: { color: colors.redDark, fontFamily: 'Nunito_800ExtraBold' },
  authLegal: { marginTop: 14, color: colors.muted, fontFamily: 'Nunito_400Regular', fontSize: 11, lineHeight: 17, textAlign: 'center' },
  authSheet: { width: '100%', maxWidth: 520, maxHeight: '94%', marginTop: 'auto', alignSelf: 'center', borderTopLeftRadius: 24, borderTopRightRadius: 24, backgroundColor: colors.surface, paddingHorizontal: 24, paddingTop: 30, paddingBottom: 24 },
  discoveryPage: { paddingTop: 4, paddingBottom: 18 },
  discoveryTopBar: { minHeight: 58, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  discoveryTopActions: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  discoveryIconButton: { width: 40, height: 40, alignItems: 'center', justifyContent: 'center', position: 'relative' },
  discoveryNotificationDot: { position: 'absolute', right: 7, top: 7, width: 7, height: 7, borderRadius: 4, backgroundColor: colors.redDark, borderWidth: 1.5, borderColor: colors.card },
  discoveryAvatar: { width: 38, height: 38, borderRadius: 19, overflow: 'hidden', backgroundColor: colors.ink, alignItems: 'center', justifyContent: 'center' },
  discoveryAvatarImage: { width: '100%', height: '100%' },
  discoveryAvatarText: { color: colors.card, fontFamily: bodyFont, fontSize: 15 },
  discoveryHeadingRow: { marginTop: 14, marginBottom: 14, gap: 3 },
  discoveryTitle: { color: colors.ink, fontFamily: titleFont, fontSize: 30, lineHeight: 35 },
  discoveryLocation: { marginTop: 2, flexDirection: 'row', alignItems: 'center', gap: 4, alignSelf: 'flex-start', maxWidth: '100%' },
  discoveryLocationText: { maxWidth: 250, color: colors.muted, fontFamily: 'Nunito_700Bold', fontSize: 12 },
  discoverySearch: { height: 48, borderRadius: 8, borderWidth: 1, borderColor: colors.line, backgroundColor: colors.card, flexDirection: 'row', alignItems: 'center', paddingLeft: 13, paddingRight: 5, gap: 8 },
  discoverySearchInput: { flex: 1, minWidth: 0, color: colors.ink, fontFamily: 'Nunito_400Regular', fontSize: 14 },
  discoveryFilterButton: { width: 38, height: 38, borderRadius: 7, alignItems: 'center', justifyContent: 'center' },
  discoveryCategoryRow: { gap: 12, paddingTop: 18, paddingBottom: 6, paddingRight: 20 },
  discoveryCategory: { width: 66, alignItems: 'center', gap: 7 },
  discoveryCategoryImage: { width: 60, height: 60, borderRadius: 8, backgroundColor: colors.surface },
  discoveryCategoryLabel: { color: colors.ink, fontFamily: 'Nunito_700Bold', fontSize: 11, textAlign: 'center' },
  discoveryFeatureCard: { height: 246, borderRadius: 8, overflow: 'hidden', backgroundColor: colors.ink },
  discoveryFeatureImage: { width: '100%', height: '100%' },
  discoveryFeatureScrim: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(0,0,0,0.23)' },
  discoverySaveButton: { position: 'absolute', right: 12, top: 12, width: 38, height: 38, borderRadius: 19, backgroundColor: 'rgba(0,0,0,0.38)', alignItems: 'center', justifyContent: 'center' },
  discoveryFeatureCopy: { position: 'absolute', left: 14, right: 14, bottom: 13, gap: 4 },
  discoveryFeatureName: { color: '#FFFFFF', fontFamily: titleFont, fontSize: 22, lineHeight: 26 },
  discoveryFeatureMetaRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 8 },
  discoveryFeatureMeta: { flex: 1, minWidth: 0, color: 'rgba(255,255,255,0.9)', fontFamily: 'Nunito_700Bold', fontSize: 12 },
  discoveryFeatureRating: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  discoveryFeatureRatingText: { color: '#FFFFFF', fontFamily: bodyFont, fontSize: 12 },
  discoveryNearbyRow: { gap: 11, paddingTop: 12, paddingBottom: 3, paddingRight: 20 },
  discoveryNearbyCard: { width: 150, gap: 4 },
  discoveryNearbyImage: { width: 150, height: 102, borderRadius: 8, backgroundColor: colors.surface },
  discoveryNearbyName: { color: colors.ink, fontFamily: bodyFont, fontSize: 14, marginTop: 2 },
  discoveryNearbyMeta: { color: colors.muted, fontFamily: 'Nunito_400Regular', fontSize: 11 },
  discoveryNewsGrid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between', rowGap: 14 },
  discoveryNewsCard: { width: '48%', gap: 4 },
  discoveryNewsImage: { width: '100%', aspectRatio: 1.25, borderRadius: 8, backgroundColor: colors.surface },
  discoveryNewsName: { color: colors.ink, fontFamily: bodyFont, fontSize: 14, marginTop: 2 },
  discoveryNewsMeta: { color: colors.muted, fontFamily: 'Nunito_400Regular', fontSize: 11 },
  socialFeedPage: { backgroundColor: colors.card },
  socialFeedHeader: { paddingHorizontal: 16, paddingTop: 4, borderBottomWidth: 1, borderBottomColor: colors.softLine },
  socialFeedTopBar: { minHeight: 52, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  socialFeedTitle: { color: colors.ink, fontFamily: titleFont, fontSize: 30, lineHeight: 35, marginTop: 7 },
  socialFeedTabs: { height: 42, flexDirection: 'row', alignItems: 'stretch', gap: 24, marginTop: 3 },
  socialFeedTab: { justifyContent: 'center', borderBottomWidth: 2, borderBottomColor: 'transparent' },
  socialFeedTabActive: { justifyContent: 'center', borderBottomWidth: 2, borderBottomColor: colors.redDark },
  socialFeedTabText: { color: colors.muted, fontFamily: bodyFont, fontSize: 13 },
  socialFeedTabActiveText: { color: colors.redDark, fontFamily: bodyFont, fontSize: 13 },
  feedComposerCard: { minHeight: 62, borderRadius: 0, backgroundColor: colors.card, borderWidth: 0, borderBottomWidth: 1, borderBottomColor: colors.softLine, paddingHorizontal: 16, paddingVertical: 10, flexDirection: 'row', alignItems: 'center', gap: 10, marginHorizontal: 0, marginBottom: 0 },
  feedComposerAvatar: { width: 38, height: 38, borderRadius: 19, backgroundColor: colors.ink, alignItems: 'center', justifyContent: 'center', overflow: 'hidden' },
  feedComposerCopy: { flex: 1, minWidth: 0, minHeight: 40, borderRadius: 20, borderWidth: 1, borderColor: colors.line, justifyContent: 'center', paddingHorizontal: 14 },
  feedComposerTitle: { color: colors.muted, fontFamily: 'Nunito_400Regular', fontSize: 13 },
  feedComposerButton: { width: 38, height: 38, borderRadius: 19, backgroundColor: colors.redDark, alignItems: 'center', justifyContent: 'center' },
  feedList: { gap: 0 },
  feedPostCard: { overflow: 'hidden', borderRadius: 0, backgroundColor: colors.card, borderBottomWidth: 1, borderBottomColor: colors.line },
  feedPostHeader: { minHeight: 62, paddingHorizontal: 14, paddingVertical: 9, flexDirection: 'row', alignItems: 'center', gap: 10 },
  feedImageWrap: { width: '100%', overflow: 'hidden', backgroundColor: '#F1F1F1' },
  feedImage: { width: '100%', height: '100%' },
  feedPostBody: { paddingHorizontal: 14, paddingTop: 10, paddingBottom: 17, gap: 7 },
  feedActionsRow: { minHeight: 32, flexDirection: 'row', alignItems: 'center', gap: 13 },
  feedActionButton: { minWidth: 24, minHeight: 30, paddingHorizontal: 0, flexDirection: 'row', alignItems: 'center', gap: 4 },
  feedSaveAction: { marginLeft: 'auto' },
  feedLikesText: { color: colors.ink, fontFamily: bodyFont, fontSize: 12 },
  feedCaption: { color: colors.ink, fontFamily: 'Nunito_400Regular', fontSize: 13, lineHeight: 18 },
  feedCaptionAuthor: { fontFamily: bodyFont },
  feedComments: { gap: 3 },
  feedCommentText: { color: colors.muted, fontFamily: 'Nunito_400Regular', fontSize: 12, lineHeight: 17 },
  feedComposerSheet: { width: '100%', maxWidth: 560, minHeight: '100%', alignSelf: 'center', backgroundColor: colors.bg, paddingHorizontal: 16, paddingTop: Platform.OS === 'ios' ? 52 : 22, paddingBottom: 30, gap: 12 },
  feedComposerTopBar: { minHeight: 52, flexDirection: 'row', alignItems: 'center', gap: 10, borderBottomWidth: 1, borderBottomColor: colors.line, marginHorizontal: -16, paddingHorizontal: 16, paddingBottom: 10 },
  feedComposerClose: { width: 38, height: 38, borderRadius: 19, alignItems: 'center', justifyContent: 'center' },
  feedComposerSheetTitle: { color: colors.ink, fontFamily: titleFont, fontSize: 18 },
  feedComposerSheetMeta: { display: 'none' },
  feedPublishButton: { minHeight: 38, borderRadius: 7, backgroundColor: colors.redDark, paddingHorizontal: 15, alignItems: 'center', justifyContent: 'center' },
  feedSearchBox: { minHeight: 50, borderRadius: 8, borderWidth: 1, borderColor: colors.line, backgroundColor: colors.card, paddingHorizontal: 12, flexDirection: 'row', alignItems: 'center', gap: 9 },
  feedRestaurantResult: { minHeight: 58, borderRadius: 8, borderWidth: 1, borderColor: colors.line, backgroundColor: colors.card, padding: 8, flexDirection: 'row', alignItems: 'center', gap: 9 },
  feedComposerTextInput: { minHeight: 104, borderRadius: 8, borderWidth: 1, borderColor: colors.line, backgroundColor: colors.card, padding: 12, color: colors.ink, fontFamily: 'Nunito_400Regular', fontSize: 14, textAlignVertical: 'top' },
  feedPickedPhotoWrap: { width: '48%', aspectRatio: 1, borderRadius: 8, overflow: 'hidden', backgroundColor: colors.surface },
  feedPickPhotoCard: { width: '48%', aspectRatio: 1, borderRadius: 8, borderWidth: 1, borderStyle: 'dashed', borderColor: 'rgba(241,61,11,0.42)', backgroundColor: '#FFF4EF', alignItems: 'center', justifyContent: 'center', gap: 5, padding: 10 },
  realMapCard: { height: 560, marginHorizontal: -18, backgroundColor: '#EDF2EA', overflow: 'hidden' },
  mapCard: {
    height: 560,
    marginHorizontal: -18,
    backgroundColor: '#EDF2EA',
    overflow: 'hidden',
    ...(Platform.OS === 'web' ? { touchAction: 'none', overscrollBehavior: 'contain' } : {})
  },
  webMapScrim: { position: 'absolute', left: 0, right: 0, top: 0, bottom: 0, backgroundColor: 'rgba(255,250,244,0.12)' },
  webMapAttribution: { position: 'absolute', right: 8, top: 8, zIndex: 4, paddingHorizontal: 6, paddingVertical: 3, backgroundColor: 'rgba(255,255,255,0.88)', color: colors.muted, fontFamily: 'Nunito_400Regular', fontSize: 9 },
  mapCompass: { position: 'absolute', left: 10, top: 8, zIndex: 4, minHeight: 30, borderRadius: 15, paddingHorizontal: 10, gap: 5, flexDirection: 'row', alignItems: 'center', backgroundColor: 'rgba(255,255,255,0.9)', borderWidth: 1, borderColor: colors.line },
  webMapMarker: { position: 'absolute', zIndex: 5, width: 50, height: 62, marginLeft: -25, marginTop: -58, alignItems: 'center', justifyContent: 'flex-start' },
  webMapMarkerDot: { width: 42, height: 42, borderRadius: 21, overflow: 'hidden', backgroundColor: colors.card, alignItems: 'center', justifyContent: 'center', borderWidth: 3, borderColor: colors.redDark, shadowColor: colors.ink, shadowOpacity: 0.2, shadowRadius: 8, elevation: 5 },
  webMapMarkerDotSelected: { width: 48, height: 48, borderRadius: 24, borderWidth: 4, borderColor: colors.redDark, shadowOpacity: 0.3 },
  webMapMarkerPhoto: { width: '100%', height: '100%' },
  webMapMarkerTip: { marginTop: -2, width: 0, height: 0, borderLeftWidth: 7, borderRightWidth: 7, borderTopWidth: 12, borderLeftColor: 'transparent', borderRightColor: 'transparent', borderTopColor: colors.redDark },
  webMapMarkerTipSelected: { borderLeftWidth: 8, borderRightWidth: 8, borderTopWidth: 14 },
  nativeMapMarker: { width: 48, height: 59, alignItems: 'center' },
  nativeMapMarkerSelected: { width: 54, height: 65 },
  nativeMapMarkerPhotoWrap: { width: 44, height: 44, borderRadius: 22, overflow: 'hidden', backgroundColor: colors.card, borderWidth: 3, borderColor: colors.redDark, shadowColor: colors.ink, shadowOpacity: 0.2, shadowRadius: 7, elevation: 5 },
  nativeMapMarkerPhoto: { width: '100%', height: '100%' },
  nativeMapMarkerTip: { marginTop: -2, width: 0, height: 0, borderLeftWidth: 7, borderRightWidth: 7, borderTopWidth: 12, borderLeftColor: 'transparent', borderRightColor: 'transparent', borderTopColor: colors.redDark },
  selectedMapCard: { position: 'absolute', left: 12, right: 12, bottom: 12, zIndex: 9, minHeight: 146, borderRadius: 8, backgroundColor: '#FFFFFF', borderWidth: 1, borderColor: colors.line, padding: 9, shadowColor: colors.ink, shadowOpacity: 0.18, shadowRadius: 16, elevation: 8 },
  selectedMapMain: { flexDirection: 'row', alignItems: 'stretch', gap: 11 },
  selectedMapImage: { width: 94, minHeight: 82, borderRadius: 7, backgroundColor: colors.surface },
  selectedMapCopy: { flex: 1, minWidth: 0, paddingTop: 2, gap: 2 },
  selectedMapTitleRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  selectedMapName: { flex: 1, minWidth: 0, color: colors.ink, fontFamily: titleFont, fontSize: 18, lineHeight: 22 },
  selectedMapSave: { width: 32, height: 32, alignItems: 'center', justifyContent: 'center' },
  selectedMapMeta: { color: colors.muted, fontFamily: 'Nunito_400Regular', fontSize: 12 },
  selectedMapStatusRow: { flexDirection: 'row', alignItems: 'center', flexWrap: 'wrap', columnGap: 4, rowGap: 1, marginTop: 5 },
  selectedMapRating: { color: colors.ink, fontFamily: bodyFont, fontSize: 11 },
  selectedMapDivider: { color: '#A9A4A0', fontFamily: bodyFont, fontSize: 10 },
  selectedMapStatus: { color: colors.muted, fontFamily: bodyFont, fontSize: 11 },
  selectedMapStatusOpen: { color: colors.green },
  selectedMapRoute: { minHeight: 40, marginLeft: 105, marginTop: 8, borderRadius: 7, backgroundColor: colors.redDark, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8 },
  selectedMapRouteText: { color: '#FFFFFF', fontFamily: bodyFont, fontSize: 13 },
  mapLocateFloat: { position: 'absolute', right: 14, bottom: 174, zIndex: 8, width: 46, height: 46, borderRadius: 23, backgroundColor: '#FFFFFF', borderWidth: 1, borderColor: colors.line, alignItems: 'center', justifyContent: 'center', shadowColor: colors.ink, shadowOpacity: 0.16, shadowRadius: 10, elevation: 7 },
  mapPage: { paddingTop: 10 },
  mapSearchHeader: { flexDirection: 'row', alignItems: 'center', gap: 10, paddingBottom: 2 },
  mapProfileAvatar: { width: 44, height: 44, borderRadius: 22, overflow: 'hidden', backgroundColor: colors.ink, alignItems: 'center', justifyContent: 'center', borderWidth: 2, borderColor: colors.card },
  mapProfileAvatarImage: { width: '100%', height: '100%' },
  mapProfileAvatarText: { color: colors.card, fontFamily: bodyFont, fontSize: 14 },
  mapTopBar: { minHeight: 58, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', position: 'relative' },
  mapPageTitle: { position: 'absolute', left: 92, right: 92, textAlign: 'center', color: colors.ink, fontFamily: titleFont, fontSize: 20 },
  mapTopActions: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  mapTopButton: { width: 38, height: 38, alignItems: 'center', justifyContent: 'center' },
  mapQuickFilters: { gap: 8, paddingTop: 10, paddingBottom: 12, paddingRight: 18 },
  mapQuickFilter: { minHeight: 38, paddingHorizontal: 12, borderRadius: 19, borderWidth: 1, borderColor: colors.line, backgroundColor: colors.card, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6 },
  mapQuickFilterActive: { backgroundColor: '#FFF1EC', borderColor: 'rgba(241,61,11,0.4)' },
  mapQuickFilterText: { color: colors.ink, fontFamily: bodyFont, fontSize: 12 },
  mapQuickFilterTextActive: { color: colors.redDark },
  searchPageField: { flex: 1, minWidth: 0, minHeight: 48, borderRadius: 8, backgroundColor: colors.card, borderWidth: 1, borderColor: colors.line, flexDirection: 'row', alignItems: 'center', gap: 9, paddingHorizontal: 13 },
  pageInput: { flex: 1, color: colors.ink, fontFamily: 'Nunito_400Regular', fontSize: 14 },
  searchFilterButton: { width: 38, height: 38, borderRadius: 7, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.card },
  mapSheet: { marginHorizontal: -18, marginTop: 0, borderTopLeftRadius: 0, borderTopRightRadius: 0, backgroundColor: colors.bg, paddingHorizontal: 18, paddingTop: 14, paddingBottom: 24 },
  sheetHandle: { display: 'none' },
  detailBackdrop: { flex: 1, backgroundColor: 'rgba(20,20,20,0.52)' },
  detailSheet: { flex: 1, width: '100%', maxWidth: 640, alignSelf: 'center', backgroundColor: colors.bg },
  detailBanner: { width: '100%', aspectRatio: 1.25, backgroundColor: colors.surface },
  detailTopActions: { position: 'absolute', top: Platform.OS === 'ios' ? 48 : 20, left: 14, right: 14, zIndex: 4, flexDirection: 'row', justifyContent: 'space-between' },
  detailRightActions: { flexDirection: 'row', gap: 7 },
  floatButton: { width: 40, height: 40, borderRadius: 20, backgroundColor: 'rgba(255,255,255,0.94)', alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: colors.line },
  detailAvatarWrap: { display: 'none' },
  detailProfileSection: { paddingHorizontal: 16, paddingTop: 16, paddingBottom: 24, gap: 16 },
  detailProfileHeader: { flexDirection: 'row', alignItems: 'flex-start', gap: 10 },
  detailTitle: { color: colors.ink, fontFamily: titleFont, fontSize: 27, lineHeight: 32 },
  detailSub: { color: colors.muted, fontFamily: 'Nunito_700Bold', fontSize: 13, lineHeight: 18 },
  detailBio: { color: colors.ink, fontFamily: 'Nunito_400Regular', fontSize: 13, lineHeight: 19 },
  detailScoreBadge: { minWidth: 62, minHeight: 62, borderRadius: 8, backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.line, alignItems: 'center', justifyContent: 'center', gap: 1, paddingHorizontal: 7 },
  detailStatsRow: { flexDirection: 'row', gap: 0, borderTopWidth: 1, borderBottomWidth: 1, borderColor: colors.line },
  detailStat: { flex: 1, minWidth: 0, borderRadius: 0, backgroundColor: 'transparent', borderWidth: 0, paddingVertical: 11, alignItems: 'center', justifyContent: 'center' },
  detailActionRow: { flexDirection: 'row', gap: 7, flexWrap: 'wrap' },
  detailActionButton: { minHeight: 44, flexGrow: 1, flexBasis: '30%', borderRadius: 8, borderWidth: 1, borderColor: colors.line, backgroundColor: colors.card, paddingHorizontal: 9, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6 },
  detailActionButtonActive: { backgroundColor: colors.redDark, borderColor: colors.redDark, flexBasis: '100%' },
  detailStoryRing: { width: 52, height: 52, borderRadius: 26, borderWidth: 1, borderColor: colors.line, backgroundColor: colors.surface, alignItems: 'center', justifyContent: 'center' },
  detailTabRow: { flexDirection: 'row', borderTopWidth: 1, borderTopColor: colors.line, borderBottomWidth: 1, borderBottomColor: colors.line },
  detailTabButton: { flex: 1, minHeight: 45, alignItems: 'center', justifyContent: 'center' },
  detailTabText: { color: colors.muted, fontFamily: bodyFont, fontSize: 12 },
  detailTabTextActive: { color: colors.redDark },
  detailTabUnderlineActive: { backgroundColor: colors.redDark },
  detailMenuTab: { gap: 10 },
  detailMenuHeader: { minHeight: 52, borderRadius: 0, backgroundColor: 'transparent', borderWidth: 0, borderBottomWidth: 1, borderColor: colors.line, paddingHorizontal: 0, paddingVertical: 8, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 12 },
  detailMenuTabItem: { minHeight: 92, borderRadius: 0, backgroundColor: colors.card, borderBottomWidth: 1, borderBottomColor: colors.line, paddingVertical: 9, flexDirection: 'row', alignItems: 'center', gap: 10 },
  detailMenuTabItemImage: { width: 76, height: 76, borderRadius: 7, backgroundColor: colors.surface },
  detailMenuImageFallback: { width: 76, height: 76, borderRadius: 7, backgroundColor: '#FFF2EC', alignItems: 'center', justifyContent: 'center' },
  detailMenuEmpty: { minHeight: 120, borderRadius: 8, borderWidth: 1, borderColor: colors.line, alignItems: 'center', justifyContent: 'center', gap: 8, padding: 18 },
  detailMenuEmptyText: { color: colors.muted, fontFamily: 'Nunito_400Regular', fontSize: 13, textAlign: 'center' },
  dineProfilePage: { paddingTop: 4, paddingBottom: 18 },
  dineProfileTopBar: { minHeight: 54, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', marginBottom: 14, position: 'relative' },
  dineProfileTopTitle: { color: colors.ink, fontFamily: titleFont, fontSize: 20, lineHeight: 25 },
  dineProfileLogo: { display: 'none' },
  dineProfileTopActions: { position: 'absolute', right: 0, flexDirection: 'row', alignItems: 'center', gap: 3 },
  dineProfileTopButton: { width: 34, height: 34, borderRadius: 17, alignItems: 'center', justifyContent: 'center', position: 'relative' },
  dineProfileHero: { flexDirection: 'row', alignItems: 'flex-start', gap: 14, marginBottom: 15 },
  dineProfileAvatarWrap: { width: 94, height: 94, borderRadius: 47, position: 'relative', alignItems: 'center', justifyContent: 'center' },
  dineProfileAvatarImage: { width: 90, height: 90, borderRadius: 45 },
  dineProfileAvatarEmpty: { width: 90, height: 90, borderRadius: 45, backgroundColor: colors.ink, alignItems: 'center', justifyContent: 'center' },
  dineProfileAvatarInitial: { color: colors.card, fontFamily: titleFont, fontSize: 36 },
  dineProfileAvatarRing: { position: 'absolute', width: 94, height: 94, borderRadius: 47, borderWidth: 1, borderColor: colors.line },
  dineProfileStarBadge: { position: 'absolute', right: -1, bottom: 2, width: 30, height: 30, borderRadius: 15, backgroundColor: colors.redDark, borderWidth: 2, borderColor: colors.card, alignItems: 'center', justifyContent: 'center' },
  dineProfileHeroCopy: { flex: 1, minWidth: 0, gap: 2 },
  dineProfileNameInput: { minHeight: 28, padding: 0, color: colors.ink, fontFamily: titleFont, fontSize: 20, lineHeight: 25 },
  dineProfileHandleInput: { minHeight: 21, padding: 0, color: colors.muted, fontFamily: 'Nunito_400Regular', fontSize: 13 },
  dineProfileBioInput: { minHeight: 36, padding: 0, color: colors.ink, fontFamily: 'Nunito_400Regular', fontSize: 12, lineHeight: 17, maxWidth: 280, textAlignVertical: 'top' },
  dineProfileLocationRow: { flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 2 },
  dineProfileLocationInput: { flex: 1, minWidth: 0, minHeight: 20, padding: 0, color: colors.muted, fontFamily: 'Nunito_700Bold', fontSize: 11 },
  dineProfileInstagramPill: { display: 'none' },
  dineProfileStatsCard: { minHeight: 62, borderRadius: 0, backgroundColor: 'transparent', borderWidth: 0, borderTopWidth: 1, borderBottomWidth: 1, borderColor: colors.line, flexDirection: 'row', alignItems: 'stretch', marginBottom: 12 },
  dineProfileStatItem: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 1, paddingVertical: 9 },
  dineProfileStatDivider: { borderLeftWidth: 1, borderLeftColor: colors.softLine },
  dineProfileStatValue: { color: colors.ink, fontFamily: titleFont, fontSize: 18, lineHeight: 21 },
  dineProfileStatLabel: { color: colors.muted, fontFamily: 'Nunito_400Regular', fontSize: 10, textAlign: 'center' },
  profilePrimaryActions: { flexDirection: 'row', gap: 8, marginBottom: 14 },
  profileEditAction: { flex: 1, minHeight: 38, borderRadius: 7, borderWidth: 1, borderColor: colors.redDark, alignItems: 'center', justifyContent: 'center' },
  profileEditActionText: { color: colors.redDark, fontFamily: bodyFont, fontSize: 12 },
  profileSavedAction: { minWidth: 104, minHeight: 38, borderRadius: 7, borderWidth: 1, borderColor: colors.line, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6 },
  profileSavedActionText: { color: colors.ink, fontFamily: bodyFont, fontSize: 12 },
  profileContentTabs: { height: 42, borderTopWidth: 1, borderBottomWidth: 1, borderColor: colors.line, flexDirection: 'row' },
  profileContentTab: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, borderBottomWidth: 2, borderBottomColor: 'transparent' },
  profileContentTabActive: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, borderBottomWidth: 2, borderBottomColor: colors.redDark },
  profileContentTabText: { color: colors.muted, fontFamily: bodyFont, fontSize: 11 },
  profileContentTabActiveText: { color: colors.redDark, fontFamily: bodyFont, fontSize: 11 },
  profileMediaGrid: { marginHorizontal: -18, flexDirection: 'row', flexWrap: 'wrap', gap: 1, backgroundColor: colors.line },
  profileMediaTile: { width: '33.1%', aspectRatio: 1, backgroundColor: colors.surface, overflow: 'hidden' },
  profileMediaImage: { width: '100%', height: '100%' },
  profileEmptyMedia: { minHeight: 132, marginHorizontal: -18, alignItems: 'center', justifyContent: 'center', gap: 4, padding: 18, borderBottomWidth: 1, borderBottomColor: colors.line },
  profileEmptyMediaTitle: { color: colors.ink, fontFamily: bodyFont, fontSize: 14, textAlign: 'center' },
  profileEmptyMediaText: { color: colors.muted, fontFamily: 'Nunito_400Regular', fontSize: 11, textAlign: 'center' },
  profileJourneyTitle: { color: colors.ink, fontFamily: titleFont, fontSize: 18, marginTop: 24, marginBottom: 10 },
  dineProfileLevelCard: { minHeight: 104, borderRadius: 8, backgroundColor: colors.ink, padding: 14, flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 10 },
  dineProfileSectionHeader: { minHeight: 48, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: 14 },
  dineProfileSectionTitle: { color: colors.ink, fontFamily: titleFont, fontSize: 16 },
  dineProfilePreferenceCard: { minHeight: 68, borderRadius: 8, borderWidth: 1, borderColor: colors.line, backgroundColor: colors.card, padding: 10, flexDirection: 'row', alignItems: 'center', gap: 10 },
  dineProfileReviewCard: { width: 174, borderRadius: 8, overflow: 'hidden', backgroundColor: colors.card, borderWidth: 1, borderColor: colors.line },
  dineProfileBadgeMedal: { width: 58, height: 58, borderRadius: 29, backgroundColor: colors.ink, alignItems: 'center', justifyContent: 'center' },
  dineProfileEditButton: { minHeight: 46, borderRadius: 8, backgroundColor: colors.redDark, marginTop: 22, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8 },
  savedPage: { paddingTop: 4 },
  savedTopBar: { minHeight: 54, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', position: 'relative' },
  savedTitle: { position: 'absolute', left: 70, right: 70, textAlign: 'center', color: colors.ink, fontFamily: titleFont, fontSize: 20 },
  savedTopActions: { flexDirection: 'row', gap: 3 },
  savedTopButton: { width: 38, height: 38, alignItems: 'center', justifyContent: 'center' },
  savedCollectionList: { gap: 9 },
  savedCollectionCard: { minHeight: 100, borderRadius: 8, borderWidth: 1, borderColor: colors.line, backgroundColor: colors.card, padding: 8, flexDirection: 'row', alignItems: 'center', gap: 11 },
  savedCollectionImage: { width: 98, height: 82, borderRadius: 7, backgroundColor: colors.surface },
  savedCollectionCopy: { flex: 1, minWidth: 0, gap: 2 },
  savedCollectionName: { color: colors.ink, fontFamily: titleFont, fontSize: 16 },
  savedCollectionCount: { color: colors.muted, fontFamily: 'Nunito_400Regular', fontSize: 11 },
  savedCollectionPrivacy: { flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 5 },
  savedCollectionPrivacyText: { color: colors.muted, fontFamily: 'Nunito_400Regular', fontSize: 10 },
  activityPage: { paddingTop: 2 },
  activityTabs: { flexDirection: 'row', gap: 8, marginBottom: 20 },
  activityTab: { minHeight: 36, paddingHorizontal: 18, borderRadius: 18, backgroundColor: '#F1F1F1', alignItems: 'center', justifyContent: 'center' },
  activityTabActive: { backgroundColor: colors.redDark },
  activityTabText: { color: colors.ink, fontFamily: bodyFont, fontSize: 12 },
  activityTabTextActive: { color: '#FFFFFF' },
  activityGroupTitle: { color: colors.ink, fontFamily: titleFont, fontSize: 16, marginBottom: 7 },
  activityList: { borderBottomWidth: 1, borderBottomColor: colors.line },
  activityItem: { minHeight: 76, borderTopWidth: 1, borderTopColor: colors.softLine, flexDirection: 'row', alignItems: 'center', gap: 10, paddingVertical: 9, position: 'relative' },
  activityAvatar: { width: 42, height: 42, borderRadius: 21, overflow: 'hidden', backgroundColor: colors.ink, alignItems: 'center', justifyContent: 'center', position: 'relative' },
  activityAvatarImage: { width: '100%', height: '100%' },
  activityTypeBadge: { position: 'absolute', right: 0, bottom: 0, width: 18, height: 18, borderRadius: 9, backgroundColor: colors.redDark, borderWidth: 2, borderColor: colors.card, alignItems: 'center', justifyContent: 'center' },
  activityAvatarText: { color: colors.card, fontFamily: bodyFont, fontSize: 15 },
  activityCopy: { flex: 1, minWidth: 0, gap: 2 },
  activityText: { color: colors.ink, fontFamily: 'Nunito_400Regular', fontSize: 12, lineHeight: 17 },
  activityAuthor: { fontFamily: bodyFont },
  activityTime: { color: colors.muted, fontFamily: 'Nunito_400Regular', fontSize: 10 },
  activityThumb: { width: 48, height: 48, borderRadius: 7, backgroundColor: colors.surface },
  activityUnread: { position: 'absolute', right: -8, width: 7, height: 7, borderRadius: 4, backgroundColor: colors.redDark },
  activityEmpty: { minHeight: 110, alignItems: 'center', justifyContent: 'center', padding: 16, gap: 7 },
  activityEmptyText: { color: colors.muted, fontFamily: 'Nunito_400Regular', fontSize: 12, textAlign: 'center' },
  pagePanel: { gap: 11, borderRadius: 8, backgroundColor: colors.card, borderWidth: 1, borderColor: colors.line, padding: 14, marginBottom: 14 },
  button: { width: '100%', minHeight: 48, borderRadius: 8, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 18, flexDirection: 'row', alignSelf: 'stretch' },
  primaryButton: { backgroundColor: colors.redDark },
  secondaryButton: { backgroundColor: colors.card, borderWidth: 1, borderColor: colors.line },
  subscreenHeader: { minHeight: 60, flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 12 },
  backButton: { width: 40, height: 40, borderRadius: 20, backgroundColor: 'transparent', alignItems: 'center', justifyContent: 'center' },
  subscreenTitle: { color: colors.ink, fontFamily: titleFont, fontSize: 22, lineHeight: 27 },
  subscreenSubtitle: { color: colors.muted, fontFamily: 'Nunito_400Regular', fontSize: 12, lineHeight: 17, marginTop: 1 },
  emptyState: { minHeight: 132, borderRadius: 8, borderWidth: 1, borderColor: colors.line, backgroundColor: colors.surface, alignItems: 'center', justifyContent: 'center', padding: 18 },
  emptyTitle: { color: colors.ink, fontFamily: titleFont, fontSize: 18, textAlign: 'center' },
  emptyText: { color: colors.muted, fontFamily: 'Nunito_400Regular', fontSize: 12, lineHeight: 18, textAlign: 'center', marginTop: 5 },
  miniImage: { width: 112, height: 78, borderRadius: 8 },
  miniTitle: { color: colors.ink, fontFamily: titleFont, fontSize: 17, lineHeight: 21 },
  settingsList: { overflow: 'hidden', borderRadius: 8, backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.line },
  settingsRowIcon: { width: 36, height: 36, borderRadius: 8, backgroundColor: '#FFF2EC', alignItems: 'center', justifyContent: 'center' },
  segmented: { height: 42, borderRadius: 0, borderWidth: 0, borderBottomWidth: 1, borderColor: colors.line, flexDirection: 'row', padding: 0, marginBottom: 12 },
  segment: { flex: 1, borderRadius: 0, alignItems: 'center', justifyContent: 'center', borderBottomWidth: 2, borderBottomColor: 'transparent' },
  segmentActive: { backgroundColor: 'transparent', borderBottomColor: colors.redDark },
  segmentText: { color: colors.muted, fontFamily: bodyFont, fontSize: 11 },
  segmentTextActive: { color: colors.redDark },
  screenContent: { paddingHorizontal: 18, paddingBottom: 112, width: '100%', maxWidth: 720, alignSelf: 'center' },
  screenContentFeed: { paddingHorizontal: 0, maxWidth: 560 },
  logoWrap: { alignSelf: 'flex-start', width: 82, height: 40, justifyContent: 'center', marginLeft: 0 },
  logoImage: { width: 82, height: 40 },
  sectionTitle: { marginTop: 24, marginBottom: 11, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 12 },
  sectionTitleText: { color: colors.ink, fontFamily: titleFont, fontSize: 19, lineHeight: 24 },
  sectionAction: { color: colors.redDark, fontFamily: bodyFont, fontSize: 13 },
  bottomNav: { position: 'absolute', left: 0, right: 0, bottom: 0, height: Platform.OS === 'ios' ? 88 : 78, borderRadius: 0, backgroundColor: 'rgba(255,255,255,0.98)', borderTopWidth: 1, borderColor: colors.line, flexDirection: 'row', alignItems: 'center', paddingHorizontal: 18, paddingTop: 7, paddingBottom: Platform.OS === 'ios' ? 18 : 8, gap: 2 },
  navButton: { flex: 1, minWidth: 0, height: 54, borderRadius: 0, alignItems: 'center', justifyContent: 'center', gap: 3 },
  navButtonActive: { backgroundColor: 'transparent' },
  navText: { color: colors.muted, fontFamily: 'Nunito_700Bold', fontSize: 10 },
  selectedMapSocialMeta: { color: colors.redDark, fontFamily: bodyFont, fontSize: 10, marginTop: 1 },
  mapMarkerActivityBadge: { position: 'absolute', right: -3, top: -4, zIndex: 3, minWidth: 18, height: 18, borderRadius: 9, paddingHorizontal: 4, backgroundColor: colors.redDark, borderWidth: 2, borderColor: colors.card, alignItems: 'center', justifyContent: 'center' },
  mapMarkerActivityText: { color: colors.card, fontFamily: bodyFont, fontSize: 9, lineHeight: 10 },
  feedPlaceActions: { flexDirection: 'row', gap: 6, marginTop: 3 },
  feedPlaceAction: { flex: 1, minWidth: 0, minHeight: 34, borderRadius: 7, borderWidth: 1, borderColor: colors.line, backgroundColor: colors.card, paddingHorizontal: 5, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 4 },
  feedPlaceActionText: { color: colors.ink, fontFamily: bodyFont, fontSize: 9, textAlign: 'center' },
  feedFollowingEmpty: { minHeight: 230, padding: 28, alignItems: 'center', justifyContent: 'center', gap: 6, backgroundColor: colors.card },
  feedFollowingEmptyTitle: { color: colors.ink, fontFamily: titleFont, fontSize: 17, textAlign: 'center' },
  feedFollowingEmptyText: { maxWidth: 320, color: colors.muted, fontFamily: 'Nunito_400Regular', fontSize: 12, lineHeight: 18, textAlign: 'center' },
  detailCommunitySection: { gap: 12 },
  detailCommunityHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 10 },
  detailCommunityCheckIn: { minHeight: 38, borderRadius: 7, backgroundColor: colors.redDark, paddingHorizontal: 12, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6 },
  detailCommunityCheckInText: { color: colors.card, fontFamily: bodyFont, fontSize: 12 },
  detailCommunityGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 2 },
  detailCommunityTile: { width: '32.8%', aspectRatio: 1, overflow: 'hidden', backgroundColor: colors.surface, position: 'relative' },
  detailCommunityImage: { width: '100%', height: '100%' },
  detailCommunityBadge: { position: 'absolute', left: 6, bottom: 6, width: 24, height: 24, borderRadius: 12, backgroundColor: colors.redDark, alignItems: 'center', justifyContent: 'center' },
  detailCommunityEmpty: { minHeight: 150, borderRadius: 8, borderWidth: 1, borderStyle: 'dashed', borderColor: 'rgba(241,61,11,0.34)', backgroundColor: '#FFF7F3', padding: 20, alignItems: 'center', justifyContent: 'center', gap: 5 },
  detailCommunityEmptyTitle: { color: colors.ink, fontFamily: titleFont, fontSize: 16, textAlign: 'center' },
  detailCommunityEmptyText: { maxWidth: 310, color: colors.muted, fontFamily: 'Nunito_400Regular', fontSize: 12, lineHeight: 17, textAlign: 'center' },
  collectionDetailActions: { flexDirection: 'row', gap: 8, marginTop: -7, marginBottom: 15 },
  collectionDetailAction: { flex: 1, minHeight: 42, borderRadius: 8, borderWidth: 1, borderColor: colors.line, backgroundColor: colors.card, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 7 },
  collectionDetailActionPrimary: { backgroundColor: colors.redDark, borderColor: colors.redDark },
  collectionDetailActionText: { color: colors.ink, fontFamily: bodyFont, fontSize: 12 },
  collectionDetailActionTextPrimary: { color: colors.card },
  profileFoodMap: { borderRadius: 8, borderWidth: 1, borderColor: colors.line, backgroundColor: colors.card, padding: 11, marginBottom: 14, gap: 10 },
  profileFoodMapHeader: { flexDirection: 'row', alignItems: 'center', gap: 9 },
  profileFoodMapIcon: { width: 38, height: 38, borderRadius: 8, backgroundColor: '#FFF1EC', alignItems: 'center', justifyContent: 'center' },
  profileFoodMapCopy: { flex: 1, minWidth: 0 },
  profileFoodMapTitle: { color: colors.ink, fontFamily: titleFont, fontSize: 14 },
  profileFoodMapText: { color: colors.muted, fontFamily: 'Nunito_400Regular', fontSize: 10, marginTop: 1 },
  profileFoodMapButton: { minHeight: 34, borderRadius: 7, borderWidth: 1, borderColor: colors.redDark, paddingHorizontal: 10, alignItems: 'center', justifyContent: 'center' },
  profileFoodMapButtonText: { color: colors.redDark, fontFamily: bodyFont, fontSize: 10 },
  profileFoodMapPlaces: { gap: 8, paddingRight: 8 },
  profileFoodMapPlace: { width: 76, gap: 3 },
  profileFoodMapPlaceImage: { width: 76, height: 56, borderRadius: 7, backgroundColor: colors.surface },
  profileFoodMapPlaceName: { color: colors.ink, fontFamily: bodyFont, fontSize: 9 },
  fieldInputError: { borderColor: colors.redDark, backgroundColor: '#FFF8F5' },
  fieldErrorText: { color: colors.redDark, fontFamily: 'Nunito_700Bold', fontSize: 11, lineHeight: 15 },
  fieldHintText: { color: colors.muted, fontFamily: 'Nunito_400Regular', fontSize: 10, lineHeight: 14 },
  registerPage: { paddingTop: 2 },
  registerProgress: { marginBottom: 16 },
  registerProgressTop: { minHeight: 28, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 8 },
  registerProgressTitle: { color: colors.ink, fontFamily: bodyFont, fontSize: 12 },
  registerDraftStatus: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  registerDraftStatusText: { color: colors.green, fontFamily: 'Nunito_400Regular', fontSize: 9 },
  registerProgressTrack: { height: 4, borderRadius: 2, overflow: 'hidden', backgroundColor: '#ECE9E5' },
  registerProgressFill: { height: '100%', borderRadius: 2, backgroundColor: colors.redDark },
  registerStepRow: { flexDirection: 'row', justifyContent: 'space-between', paddingTop: 10 },
  registerStepItem: { width: '24%', alignItems: 'center', gap: 4 },
  registerStepIcon: { width: 30, height: 30, borderRadius: 15, backgroundColor: '#ECE9E5', alignItems: 'center', justifyContent: 'center' },
  registerStepIconActive: { backgroundColor: colors.redDark },
  registerStepLabel: { width: '100%', color: colors.muted, fontFamily: bodyFont, fontSize: 9, textAlign: 'center' },
  registerStepLabelActive: { color: colors.redDark },
  registerHero: { flexDirection: 'row', alignItems: 'center', gap: 11, borderRadius: 8, backgroundColor: '#FFF3ED', borderWidth: 0, padding: 13, marginBottom: 12 },
  registerSection: { gap: 11, borderRadius: 8, backgroundColor: colors.card, borderWidth: 1, borderColor: colors.line, padding: 14, marginBottom: 12 },
  registerSectionHeader: { flexDirection: 'row', alignItems: 'center', gap: 7, paddingBottom: 1 },
  registerSectionHeaderBetween: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 8 },
  registerSectionTitle: { color: colors.ink, fontFamily: titleFont, fontSize: 17, lineHeight: 21 },
  registerFieldLabel: { color: colors.muted, fontFamily: bodyFont, fontSize: 11, marginBottom: -4 },
  registerChoiceWrap: { flexDirection: 'row', flexWrap: 'wrap', gap: 7 },
  registerChoiceRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 7 },
  registerChoice: { minHeight: 36, borderRadius: 7, borderWidth: 1, borderColor: colors.line, backgroundColor: colors.card, paddingHorizontal: 11, alignItems: 'center', justifyContent: 'center' },
  registerChoiceActive: { backgroundColor: colors.redDark, borderColor: colors.redDark },
  registerChoiceText: { color: colors.ink, fontFamily: bodyFont, fontSize: 11 },
  registerChoiceTextActive: { color: colors.card },
  registerAddressSearching: { minHeight: 28, flexDirection: 'row', alignItems: 'center', gap: 7, paddingHorizontal: 2 },
  registerAddressSearchingText: { color: colors.redDark, fontFamily: bodyFont, fontSize: 11 },
  registerAddressSuggestions: { overflow: 'hidden', borderRadius: 8, borderWidth: 1, borderColor: colors.line, backgroundColor: colors.card },
  registerAddressSuggestion: { minHeight: 62, paddingHorizontal: 10, paddingVertical: 9, borderBottomWidth: 1, borderBottomColor: colors.softLine, flexDirection: 'row', alignItems: 'center', gap: 9 },
  registerAddressSuggestionIcon: { width: 34, height: 34, borderRadius: 9, backgroundColor: '#FFF1EC', alignItems: 'center', justifyContent: 'center' },
  registerAddressSuggestionCopy: { flex: 1, minWidth: 0, gap: 2 },
  registerAddressSuggestionTitle: { color: colors.ink, fontFamily: bodyFont, fontSize: 12 },
  registerAddressSuggestionText: { color: colors.muted, fontFamily: 'Nunito_400Regular', fontSize: 10, lineHeight: 14 },
  registerAddressFeedback: { color: colors.muted, fontFamily: 'Nunito_400Regular', fontSize: 10, lineHeight: 15 },
  registerAddressFeedbackSuccess: { color: colors.green, fontFamily: bodyFont },
  registerLocateButton: { minHeight: 44, borderRadius: 8, backgroundColor: colors.ink, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 7 },
  registerLocateButtonDisabled: { opacity: 0.62 },
  registerLocateButtonText: { color: colors.card, fontFamily: bodyFont, fontSize: 12 },
  registerLocationConfirmed: { minHeight: 54, borderRadius: 8, backgroundColor: colors.greenSoft, padding: 10, flexDirection: 'row', alignItems: 'center', gap: 9 },
  registerLocationConfirmedCopy: { flex: 1, minWidth: 0 },
  registerLocationConfirmedTitle: { color: colors.green, fontFamily: bodyFont, fontSize: 12 },
  registerLocationConfirmedText: { color: colors.muted, fontFamily: 'Nunito_400Regular', fontSize: 10, marginTop: 1 },
  registerLocationCoordinates: { color: colors.muted, fontFamily: 'Nunito_400Regular', fontSize: 9, marginTop: 3 },
  registerPhotoGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  registerPhotoCard: { width: '48%', minHeight: 126, borderRadius: 8, borderWidth: 1, borderStyle: 'dashed', borderColor: 'rgba(241,61,11,0.38)', backgroundColor: '#FFF7F3', alignItems: 'center', justifyContent: 'center', gap: 4, padding: 9, overflow: 'hidden' },
  registerPhotoCardError: { borderColor: colors.redDark, borderWidth: 2 },
  registerPhotoScrim: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(255,255,255,0.28)' },
  registerPhotoTitle: { zIndex: 2, color: colors.ink, fontFamily: bodyFont, fontSize: 12, textAlign: 'center' },
  registerPhotoText: { zIndex: 2, color: colors.redDark, fontFamily: bodyFont, fontSize: 10, textAlign: 'center' },
  registerAddButton: { minHeight: 34, borderRadius: 7, borderWidth: 1, borderColor: colors.redDark, paddingHorizontal: 9, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 4 },
  registerAddButtonText: { color: colors.redDark, fontFamily: bodyFont, fontSize: 10 },
  registerMenuChoiceIntro: { color: colors.muted, fontFamily: 'Nunito_400Regular', fontSize: 10, lineHeight: 15 },
  registerMenuChoiceList: { gap: 8 },
  registerMenuChoice: { minHeight: 72, borderRadius: 9, borderWidth: 1, borderColor: colors.line, backgroundColor: colors.card, padding: 11, flexDirection: 'row', alignItems: 'center', gap: 10 },
  registerMenuChoiceActive: { borderColor: colors.redDark, backgroundColor: '#FFF7F3' },
  registerMenuChoiceRadio: { width: 21, height: 21, borderRadius: 11, borderWidth: 2, borderColor: colors.line, alignItems: 'center', justifyContent: 'center' },
  registerMenuChoiceRadioActive: { borderColor: colors.redDark },
  registerMenuChoiceRadioDot: { width: 9, height: 9, borderRadius: 5, backgroundColor: colors.redDark },
  registerMenuChoiceCopy: { flex: 1, minWidth: 0, gap: 2 },
  registerMenuChoiceTitle: { color: colors.ink, fontFamily: bodyFont, fontSize: 12 },
  registerMenuChoiceTitleActive: { color: colors.redDark },
  registerMenuChoiceText: { color: colors.muted, fontFamily: 'Nunito_400Regular', fontSize: 10, lineHeight: 14 },
  registerMenuLaterNotice: { minHeight: 84, borderRadius: 8, borderWidth: 1, borderColor: 'rgba(71,112,80,0.22)', backgroundColor: colors.greenSoft, padding: 12, marginBottom: 12, flexDirection: 'row', alignItems: 'center', gap: 10 },
  registerMenuLaterIcon: { width: 36, height: 36, borderRadius: 18, backgroundColor: colors.card, alignItems: 'center', justifyContent: 'center' },
  registerMenuLaterCopy: { flex: 1, minWidth: 0, gap: 2 },
  registerMenuLaterTitle: { color: colors.green, fontFamily: bodyFont, fontSize: 12 },
  registerMenuLaterText: { color: colors.olive, fontFamily: 'Nunito_400Regular', fontSize: 10, lineHeight: 15 },
  registerMenuItem: { paddingTop: 12, borderTopWidth: 1, borderTopColor: colors.softLine, flexDirection: 'row', alignItems: 'flex-start', gap: 9, position: 'relative' },
  registerMenuPhoto: { width: 58, height: 58, borderRadius: 8, overflow: 'hidden', backgroundColor: '#FFF1EC', alignItems: 'center', justifyContent: 'center' },
  registerMenuPhotoImage: { width: '100%', height: '100%' },
  registerMenuFields: { flex: 1, minWidth: 0, gap: 8 },
  registerMenuInline: { flexDirection: 'row', gap: 8 },
  registerMenuInlineField: { flex: 1, minWidth: 0 },
  registerMenuPriceField: { width: 88 },
  registerMenuRemove: { width: 32, height: 32, borderRadius: 7, alignItems: 'center', justifyContent: 'center', backgroundColor: '#FFF1EC' },
  registerMenuEmpty: { minHeight: 118, borderTopWidth: 1, borderTopColor: colors.softLine, alignItems: 'center', justifyContent: 'center', gap: 4, paddingTop: 12 },
  registerMenuEmptyTitle: { color: colors.ink, fontFamily: bodyFont, fontSize: 13 },
  registerMenuEmptyText: { color: colors.muted, fontFamily: 'Nunito_400Regular', fontSize: 10 },
  registerHoursRow: { minHeight: 46, flexDirection: 'row', alignItems: 'center', gap: 9, borderTopWidth: 1, borderTopColor: colors.softLine },
  registerHoursToggle: { width: 28, height: 28, borderRadius: 7, backgroundColor: '#ECE9E5', alignItems: 'center', justifyContent: 'center' },
  registerHoursToggleActive: { backgroundColor: colors.green },
  registerHoursDay: { width: 65, color: colors.ink, fontFamily: bodyFont, fontSize: 11 },
  registerHoursInput: { flex: 1, minWidth: 0, minHeight: 36, borderRadius: 7, borderWidth: 1, borderColor: colors.line, backgroundColor: colors.card, paddingHorizontal: 10, color: colors.ink, fontFamily: bodyFont, fontSize: 11 },
  registerHoursInputDisabled: { backgroundColor: '#F5F3F0', color: colors.muted },
  registerPreview: { overflow: 'hidden', borderRadius: 8, borderWidth: 1, borderColor: colors.line, backgroundColor: colors.card, marginBottom: 12 },
  registerPreviewMedia: { height: 190, position: 'relative', backgroundColor: colors.surface },
  registerPreviewImage: { width: '100%', height: '100%' },
  registerPreviewOverlay: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(0,0,0,0.28)' },
  registerPreviewCopy: { position: 'absolute', left: 13, right: 13, bottom: 12, gap: 2 },
  registerPreviewName: { color: colors.card, fontFamily: titleFont, fontSize: 22 },
  registerPreviewMeta: { color: 'rgba(255,255,255,0.9)', fontFamily: bodyFont, fontSize: 11 },
  registerPreviewDetails: { padding: 12, gap: 8 },
  registerPreviewDetail: { flexDirection: 'row', alignItems: 'center', gap: 7 },
  registerPreviewDetailText: { flex: 1, minWidth: 0, color: colors.ink, fontFamily: 'Nunito_400Regular', fontSize: 11 },
  registerReviewNotice: { margin: 12, marginTop: 0, borderRadius: 8, backgroundColor: colors.greenSoft, padding: 10, flexDirection: 'row', alignItems: 'flex-start', gap: 8 },
  registerReviewNoticeText: { flex: 1, color: colors.olive, fontFamily: 'Nunito_400Regular', fontSize: 10, lineHeight: 15 },
  registerNavigation: { minHeight: 54, marginBottom: 18, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 10 },
  registerBackAction: { minHeight: 44, borderRadius: 8, borderWidth: 1, borderColor: colors.line, paddingHorizontal: 14, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 5 },
  registerBackActionText: { color: colors.ink, fontFamily: bodyFont, fontSize: 12 },
  registerNextAction: { minHeight: 44, borderRadius: 8, backgroundColor: colors.redDark, paddingHorizontal: 16, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6 },
  registerNextActionText: { color: colors.card, fontFamily: bodyFont, fontSize: 12 },
  ownerWorkspaceHeader: { minHeight: 68, marginBottom: 16, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 12 },
  ownerWorkspaceBrand: { flex: 1, minWidth: 0, flexDirection: 'row', alignItems: 'center', gap: 10 },
  ownerWorkspaceLogo: { width: 62, height: 38 },
  ownerWorkspaceEyebrow: { color: colors.redDark, fontFamily: bodyFont, fontSize: 10, textTransform: 'uppercase', letterSpacing: 0.8 },
  ownerWorkspaceTitle: { color: colors.ink, fontFamily: titleFont, fontSize: 19 },
  ownerWorkspaceConsumerButton: { minHeight: 40, borderRadius: 10, borderWidth: 1, borderColor: colors.line, backgroundColor: colors.card, paddingHorizontal: 11, flexDirection: 'row', alignItems: 'center', gap: 6 },
  ownerWorkspaceConsumerText: { color: colors.ink, fontFamily: bodyFont, fontSize: 11 },
  ownerRestaurantSwitcher: { gap: 9, paddingBottom: 14 },
  ownerRestaurantSwitchCard: { width: 210, minHeight: 62, borderRadius: 13, borderWidth: 1, borderColor: colors.line, backgroundColor: colors.card, padding: 9, flexDirection: 'row', alignItems: 'center', gap: 9 },
  ownerRestaurantSwitchCardActive: { borderColor: colors.redDark, backgroundColor: '#FFF7F1' },
  ownerRestaurantSwitchImage: { width: 42, height: 42, borderRadius: 10, backgroundColor: colors.cream },
  ownerRestaurantSwitchName: { maxWidth: 138, color: colors.ink, fontFamily: bodyFont, fontSize: 12 },
  ownerRestaurantSwitchMeta: { color: colors.muted, fontFamily: 'Nunito_400Regular', fontSize: 10 },
  ownerWorkspaceEmpty: { minHeight: 320, borderRadius: 18, borderWidth: 1, borderColor: colors.line, backgroundColor: colors.card, padding: 24, alignItems: 'center', justifyContent: 'center', gap: 12 },
  ownerWorkspaceEmptyIcon: { width: 64, height: 64, borderRadius: 32, backgroundColor: '#FFF1E8', alignItems: 'center', justifyContent: 'center' },
  ownerSelectedRestaurantHeader: { minHeight: 74, borderRadius: 15, borderWidth: 1, borderColor: colors.line, backgroundColor: colors.card, padding: 11, flexDirection: 'row', alignItems: 'center', gap: 11 },
  ownerSelectedRestaurantLogo: { width: 50, height: 50, borderRadius: 12, backgroundColor: colors.cream },
  ownerSelectedRestaurantCopy: { flex: 1, minWidth: 0 },
  ownerSelectedRestaurantName: { color: colors.ink, fontFamily: titleFont, fontSize: 18 },
  ownerSelectedRestaurantMeta: { color: colors.muted, fontFamily: 'Nunito_400Regular', fontSize: 11 },
  ownerWorkspaceTabs: { gap: 7, paddingVertical: 14 },
  ownerWorkspaceTab: { minHeight: 40, borderRadius: 10, borderWidth: 1, borderColor: colors.line, backgroundColor: colors.card, paddingHorizontal: 12, flexDirection: 'row', alignItems: 'center', gap: 6 },
  ownerWorkspaceTabActive: { borderColor: colors.redDark, backgroundColor: colors.redDark },
  ownerWorkspaceTabText: { color: colors.ink, fontFamily: bodyFont, fontSize: 11 },
  ownerWorkspaceTabTextActive: { color: colors.card },
  ownerWorkspaceSection: { gap: 14 },
  ownerOverviewHero: { minHeight: 128, borderRadius: 18, backgroundColor: colors.ink, padding: 19, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  ownerOverviewEyebrow: { color: 'rgba(255,255,255,0.66)', fontFamily: bodyFont, fontSize: 11 },
  ownerOverviewTitle: { color: colors.card, fontFamily: titleFont, fontSize: 28, marginTop: 3 },
  ownerOverviewText: { color: 'rgba(255,255,255,0.78)', fontFamily: 'Nunito_400Regular', fontSize: 12, marginTop: 2 },
  ownerOverviewHeroIcon: { width: 58, height: 58, borderRadius: 29, backgroundColor: colors.redDark, alignItems: 'center', justifyContent: 'center' },
  bookingSummaryGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 9, marginBottom: 4 },
  bookingSummaryCard: { width: '47%', minHeight: 94, borderRadius: 14, borderWidth: 1, borderColor: colors.line, backgroundColor: colors.card, padding: 12, justifyContent: 'center' },
  bookingSummaryValue: { color: colors.ink, fontFamily: titleFont, fontSize: 24, marginTop: 5 },
  bookingSummaryLabel: { color: colors.muted, fontFamily: bodyFont, fontSize: 10 },
  ownerQuickActions: { flexDirection: 'row', flexWrap: 'wrap', gap: 9 },
  ownerQuickAction: { flexGrow: 1, flexBasis: 180, minHeight: 118, borderRadius: 15, borderWidth: 1, borderColor: colors.line, backgroundColor: colors.card, padding: 14, gap: 5 },
  ownerQuickActionTitle: { color: colors.ink, fontFamily: bodyFont, fontSize: 13 },
  ownerQuickActionText: { color: colors.muted, fontFamily: 'Nunito_400Regular', fontSize: 11, lineHeight: 16 },
  ownerSectionHeading: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 10 },
  ownerSectionTitle: { color: colors.ink, fontFamily: titleFont, fontSize: 18 },
  ownerSectionSubtitle: { color: colors.muted, fontFamily: 'Nunito_400Regular', fontSize: 11, lineHeight: 16 },
  ownerSectionEmptyText: { color: colors.muted, fontFamily: 'Nunito_400Regular', fontSize: 12, paddingVertical: 18, textAlign: 'center' },
  bookingList: { gap: 9 },
  bookingCard: { borderRadius: 15, borderWidth: 1, borderColor: colors.line, backgroundColor: colors.card, padding: 13, gap: 9 },
  bookingCardHeader: { flexDirection: 'row', alignItems: 'center', gap: 10, flexWrap: 'wrap' },
  bookingRestaurantAvatar: { width: 44, height: 44, borderRadius: 12, backgroundColor: '#FFF1E8', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' },
  bookingRestaurantImage: { width: '100%', height: '100%' },
  bookingCardCopy: { flex: 1, minWidth: 130 },
  bookingRestaurantName: { color: colors.ink, fontFamily: bodyFont, fontSize: 13 },
  bookingMeta: { color: colors.muted, fontFamily: 'Nunito_400Regular', fontSize: 10, lineHeight: 15 },
  bookingNotes: { color: colors.muted, fontFamily: 'Nunito_400Regular', fontSize: 10, lineHeight: 15 },
  bookingStatusPill: { maxWidth: 128, borderRadius: 10, paddingHorizontal: 8, paddingVertical: 5 },
  bookingStatusText: { fontFamily: bodyFont, fontSize: 9, textAlign: 'center' },
  bookingStatusInline: { fontFamily: bodyFont, fontSize: 10, marginTop: 2 },
  bookingCancelButton: { alignSelf: 'flex-start', minHeight: 32, borderRadius: 8, borderWidth: 1, borderColor: 'rgba(241,61,11,0.25)', paddingHorizontal: 10, alignItems: 'center', justifyContent: 'center' },
  bookingCancelText: { color: colors.redDark, fontFamily: bodyFont, fontSize: 10 },
  bookingWaitPosition: { minWidth: 52, alignItems: 'center' },
  bookingWaitPositionValue: { color: colors.redDark, fontFamily: titleFont, fontSize: 20 },
  bookingWaitPositionLabel: { color: colors.muted, fontFamily: bodyFont, fontSize: 8 },
  ownerBookingCard: { minHeight: 82, borderRadius: 14, borderWidth: 1, borderColor: colors.line, backgroundColor: colors.card, padding: 11, flexDirection: 'row', alignItems: 'center', gap: 10 },
  ownerBookingTime: { width: 52, alignItems: 'center' },
  ownerBookingTimeValue: { color: colors.redDark, fontFamily: titleFont, fontSize: 18 },
  ownerBookingDate: { color: colors.muted, fontFamily: bodyFont, fontSize: 9 },
  ownerBookingActions: { flexDirection: 'row', gap: 5 },
  ownerBookingPrimary: { width: 34, height: 34, borderRadius: 9, backgroundColor: colors.green, alignItems: 'center', justifyContent: 'center' },
  ownerBookingSecondary: { width: 34, height: 34, borderRadius: 9, backgroundColor: '#FFF1EC', alignItems: 'center', justifyContent: 'center' },
  ownerWaitPosition: { width: 38, height: 38, borderRadius: 19, backgroundColor: '#FFF1E8', alignItems: 'center', justifyContent: 'center' },
  ownerWaitPositionText: { color: colors.redDark, fontFamily: titleFont, fontSize: 17 },
  availabilitySettingCard: { minHeight: 74, borderRadius: 14, borderWidth: 1, borderColor: colors.line, backgroundColor: colors.card, padding: 13, flexDirection: 'row', alignItems: 'center', gap: 10 },
  availabilitySettingCopy: { flex: 1, minWidth: 0 },
  availabilityNumberGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 9 },
  availabilityNumberCard: { flexGrow: 1, flexBasis: 160, borderRadius: 14, borderWidth: 1, borderColor: colors.line, backgroundColor: colors.card, padding: 13, gap: 10 },
  availabilityStepper: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 9 },
  availabilityStepButton: { width: 36, height: 36, borderRadius: 10, borderWidth: 1, borderColor: colors.line, alignItems: 'center', justifyContent: 'center' },
  availabilityStepValue: { color: colors.ink, fontFamily: titleFont, fontSize: 22 },
  availabilityWeekList: { gap: 8 },
  availabilityDayCard: { minHeight: 56, borderRadius: 12, borderWidth: 1, borderColor: colors.line, backgroundColor: colors.card, padding: 9, flexDirection: 'row', alignItems: 'center', gap: 8 },
  availabilityDayCardDisabled: { opacity: 0.62, backgroundColor: '#F5F3F0' },
  availabilityDayToggle: { width: 28, height: 28, borderRadius: 8, backgroundColor: '#ECE9E5', alignItems: 'center', justifyContent: 'center' },
  availabilityDayToggleActive: { backgroundColor: colors.green },
  availabilityDayLabel: { width: 64, color: colors.ink, fontFamily: bodyFont, fontSize: 10 },
  availabilityTimeInput: { width: 60, minHeight: 34, borderRadius: 8, borderWidth: 1, borderColor: colors.line, backgroundColor: colors.card, paddingHorizontal: 7, color: colors.ink, fontFamily: bodyFont, fontSize: 10, textAlign: 'center' },
  availabilityTimeInputDisabled: { backgroundColor: '#ECE9E5', color: colors.muted },
  availabilityTimeSeparator: { color: colors.muted, fontFamily: 'Nunito_400Regular', fontSize: 9 },
  ownerProfilePreview: { overflow: 'hidden', borderRadius: 16, borderWidth: 1, borderColor: colors.line, backgroundColor: colors.card },
  ownerProfilePreviewCover: { width: '100%', height: 180, backgroundColor: colors.cream },
  ownerProfilePreviewBody: { padding: 14, flexDirection: 'row', gap: 11 },
  ownerProfilePreviewLogo: { width: 58, height: 58, borderRadius: 14, backgroundColor: colors.cream },
  ownerProfilePreviewCopy: { flex: 1, minWidth: 0, gap: 3 },
  ownerWorkspaceFooterActions: { marginTop: 18, paddingTop: 14, borderTopWidth: 1, borderTopColor: colors.line, gap: 8 },
  reservationBackdrop: { flex: 1, backgroundColor: 'rgba(20,20,20,0.48)', justifyContent: 'flex-end' },
  reservationSheet: { width: '100%', maxWidth: 620, maxHeight: '94%', alignSelf: 'center', borderTopLeftRadius: 24, borderTopRightRadius: 24, backgroundColor: colors.bg, paddingHorizontal: 18, paddingBottom: 20 },
  reservationHandle: { width: 42, height: 4, borderRadius: 2, backgroundColor: '#D8D3CE', alignSelf: 'center', marginTop: 9, marginBottom: 12 },
  reservationHeader: { flexDirection: 'row', alignItems: 'flex-start', gap: 10, marginBottom: 14 },
  reservationHeaderCopy: { flex: 1, minWidth: 0 },
  reservationEyebrow: { color: colors.redDark, fontFamily: bodyFont, fontSize: 10, textTransform: 'uppercase', letterSpacing: 0.8 },
  reservationTitle: { color: colors.ink, fontFamily: titleFont, fontSize: 24, lineHeight: 29 },
  reservationSubtitle: { color: colors.muted, fontFamily: 'Nunito_400Regular', fontSize: 11, lineHeight: 16 },
  reservationFieldLabel: { color: colors.ink, fontFamily: bodyFont, fontSize: 12, marginTop: 11, marginBottom: 8 },
  reservationDateRow: { gap: 7, paddingBottom: 2 },
  reservationDateCard: { width: 70, minHeight: 62, borderRadius: 12, borderWidth: 1, borderColor: colors.line, backgroundColor: colors.card, alignItems: 'center', justifyContent: 'center' },
  reservationDateCardActive: { backgroundColor: colors.redDark, borderColor: colors.redDark },
  reservationDateWeekday: { color: colors.muted, fontFamily: bodyFont, fontSize: 9, textTransform: 'uppercase' },
  reservationDateDay: { color: colors.ink, fontFamily: titleFont, fontSize: 16 },
  reservationDateTextActive: { color: colors.card },
  reservationSlotGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 7 },
  reservationSlot: { minWidth: 88, minHeight: 52, borderRadius: 11, borderWidth: 1, borderColor: colors.line, backgroundColor: colors.card, paddingHorizontal: 10, alignItems: 'center', justifyContent: 'center' },
  reservationSlotSelected: { backgroundColor: colors.ink, borderColor: colors.ink },
  reservationSlotFull: { backgroundColor: '#F5F3F0', borderStyle: 'dashed' },
  reservationSlotTime: { color: colors.ink, fontFamily: bodyFont, fontSize: 12 },
  reservationSlotTimeSelected: { color: colors.card },
  reservationSlotMeta: { color: colors.muted, fontFamily: 'Nunito_400Regular', fontSize: 8 },
  reservationSlotMetaSelected: { color: 'rgba(255,255,255,0.72)' },
  reservationNoSlots: { width: '100%', minHeight: 104, borderRadius: 13, borderWidth: 1, borderStyle: 'dashed', borderColor: colors.line, backgroundColor: colors.card, alignItems: 'center', justifyContent: 'center', gap: 3, padding: 12 },
  reservationNoSlotsTitle: { color: colors.ink, fontFamily: bodyFont, fontSize: 12, textAlign: 'center' },
  reservationNoSlotsText: { color: colors.muted, fontFamily: 'Nunito_400Regular', fontSize: 10, textAlign: 'center' },
  reservationPartyRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 7 },
  reservationPartyChip: { width: 40, height: 40, borderRadius: 20, borderWidth: 1, borderColor: colors.line, backgroundColor: colors.card, alignItems: 'center', justifyContent: 'center' },
  reservationPartyChipActive: { backgroundColor: colors.redDark, borderColor: colors.redDark },
  reservationPartyText: { color: colors.ink, fontFamily: bodyFont, fontSize: 11 },
  reservationPartyTextActive: { color: colors.card },
  reservationFooter: { paddingTop: 13, gap: 6 },
  reservationFooterHint: { color: colors.muted, fontFamily: 'Nunito_400Regular', fontSize: 9, textAlign: 'center' },
  settingsDangerZone: { marginTop: 2, marginBottom: 20 },
  settingsLogoutButton: { minHeight: 50, borderRadius: 16, borderWidth: 1, borderColor: 'rgba(200,70,37,0.28)', backgroundColor: colors.surface, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8 },
  settingsLogoutText: { color: colors.redDark, fontFamily: bodyFont, fontSize: 14 }
});











