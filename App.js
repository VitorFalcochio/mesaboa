import React, { useEffect, useMemo, useState } from 'react';
import {
  Alert,
  Image,
  KeyboardAvoidingView,
  Linking,
  Modal,
  Platform,
  Pressable,
  SafeAreaView,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
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
import {
  fetchFavoritesFromDb,
  fetchRestaurantsFromDb,
  firebaseReady,
  saveFavoritesToDb,
  saveRestaurantToDb,
  saveUserProfileToDb,
  seedRestaurantsIfEmpty
} from './firebaseConfig';

const colors = {
  bg: '#FFF8EE',
  bordeaux: '#8C1D2C',
  orange: '#FF7A00',
  mustard: '#FFC72C',
  pistachio: '#8DB318',
  lavender: '#7E8CFF',
  coral: '#FF8DA1',
  navy: '#181A49',
  green: '#8DB318',
  greenSoft: '#EEF7D4',
  gold: '#FFC72C',
  text: '#181A49',
  muted: '#62627A',
  card: '#ffffff',
  line: 'rgba(24, 26, 73, 0.10)'
};

const logoLetters = [
  ['B', colors.bordeaux],
  ['o', colors.orange],
  ['c', colors.mustard],
  ['a', colors.pistachio],
  ['d', colors.coral],
  ['o', colors.lavender]
];

const defaultImage = 'https://images.unsplash.com/photo-1559339352-11d035aa65de?auto=format&fit=crop&w=900&q=85';
const storageKeys = {
  restaurants: 'mesaBoaRestaurantsRN',
  favorites: 'mesaBoaFavoritesRN',
  users: 'mesaBoaUsersRN',
  currentUser: 'mesaBoaCurrentUserRN'
};

const seedRestaurants = [
  {
    id: '1',
    name: 'Brasa Alta Prime',
    type: 'Churrascaria',
    district: 'Vila Redentora',
    price: '$$$$',
    rating: 9.7,
    reviews: 428,
    open: true,
    phone: '5517988881010',
    address: 'Av. Alberto Andaló, 3120',
    image: 'https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&w=1000&q=82',
    description: 'Casa de carnes premium com salão elegante, carta de vinhos e experiência consistente para ocasiões especiais.'
  },
  {
    id: '2',
    name: 'Nori Jardim',
    type: 'Japonês',
    district: 'Jardim Vivendas',
    price: '$$$',
    rating: 9.6,
    reviews: 361,
    open: true,
    phone: '5517988882020',
    address: 'Rua das Acácias, 455',
    image: 'https://images.unsplash.com/photo-1553621042-f6e147245754?auto=format&fit=crop&w=1000&q=82',
    description: 'Japonês contemporâneo, ótimo para casal, reservas e jantares mais tranquilos.'
  },
  {
    id: '3',
    name: 'Cantina Andaló',
    type: 'Italiano',
    district: 'Centro',
    price: '$$$',
    rating: 9.4,
    reviews: 298,
    open: true,
    phone: '5517988883030',
    address: 'Rua XV de Novembro, 720',
    image: 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?auto=format&fit=crop&w=1000&q=82',
    description: 'Massas, vinhos e atendimento familiar para almoço e jantar no Centro.'
  },
  {
    id: '4',
    name: 'Casa da Esquina Burger',
    type: 'Hamburgueria',
    district: 'Boa Vista',
    price: '$$',
    rating: 9.2,
    reviews: 512,
    open: true,
    phone: '5517988884040',
    address: 'Rua Boa Vista, 88',
    image: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&w=1000&q=82',
    description: 'Hambúrguer artesanal, delivery rápido e bom custo-benefício.'
  },
  {
    id: '5',
    name: 'Forno Rio Preto',
    type: 'Pizzaria',
    district: 'Jardim Alto Rio Preto',
    price: '$$',
    rating: 9.1,
    reviews: 474,
    open: true,
    phone: '5517988885050',
    address: 'Av. Bady Bassitt, 1550',
    image: 'https://images.unsplash.com/photo-1513104890138-7c749659a591?auto=format&fit=crop&w=1000&q=82',
    description: 'Pizzas de fermentação longa, ambiente familiar e opções para delivery.'
  },
  {
    id: '6',
    name: 'Café Ipê',
    type: 'Café',
    district: 'Vila Imperial',
    price: '$$',
    rating: 9.0,
    reviews: 246,
    open: true,
    phone: '5517988886060',
    address: 'Rua Imperial, 204',
    image: 'https://images.unsplash.com/photo-1509042239860-f550ce710b93?auto=format&fit=crop&w=1000&q=82',
    description: 'Cafés especiais, brunch e espaço agradável para encontros rápidos.'
  }
];

const categories = [
  ['Japonês', 'food-variant'],
  ['Italiano', 'noodles'],
  ['Churrascaria', 'grill'],
  ['Hamburgueria', 'hamburger'],
  ['Pizzaria', 'pizza'],
  ['Café', 'coffee'],
  ['Doceria', 'cupcake'],
  ['Almoço', 'silverware-fork-knife'],
  ['Jantar', 'silverware'],
  ['Delivery', 'moped']
];

const tabs = [
  ['Início', 'home-outline'],
  ['Buscar', 'search-outline'],
  ['Rankings', 'calendar-outline'],
  ['Favoritos', 'heart-outline'],
  ['Perfil', 'person-outline']
];

function normalize(value) {
  return String(value || '').normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();
}

function scoreValue(item) {
  return Number(item.rating || 0);
}

function AppButton({ children, kind = 'primary', onPress, style }) {
  return (
    <Pressable onPress={onPress} style={({ pressed }) => [styles.button, styles[`${kind}Button`], pressed && styles.pressed, style]}>
      <Text style={[styles.buttonText, styles[`${kind}ButtonText`]]}>{children}</Text>
    </Pressable>
  );
}

function RestaurantCard({ item, favorite, onOpen, onFavorite }) {
  return (
    <Pressable onPress={() => onOpen(item)} style={({ pressed }) => [styles.restaurantCard, pressed && styles.pressed]}>
      <View style={styles.imageWrap}>
        <Image source={{ uri: item.image || defaultImage }} style={styles.restaurantImage} />
        <View style={[styles.openBadge, item.open && styles.openBadgeActive]}>
          <Text style={styles.openBadgeText}>{item.open ? 'Aberto agora' : 'Fechado'}</Text>
        </View>
        <Pressable onPress={() => onFavorite(item.name)} style={styles.heartButton}>
          <Ionicons name={favorite ? 'heart' : 'heart-outline'} size={19} color={favorite ? colors.green : colors.card} />
        </Pressable>
      </View>
      <View style={styles.cardBody}>
        <View style={styles.cardTop}>
          <View style={styles.cardTitleWrap}>
            <Text style={styles.cardTitle}>{item.name}</Text>
            <Text style={styles.meta}>{item.type} - {item.district}</Text>
            <Text style={styles.meta}>{item.price} - {item.reviews || 0} avaliações</Text>
          </View>
          <View style={styles.scoreBadge}>
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
    <Pressable onPress={() => onPress(item)} style={({ pressed }) => [styles.miniItem, pressed && styles.pressed]}>
      <Image source={{ uri: item.image || defaultImage }} style={styles.miniImage} />
      <View style={styles.miniText}>
        <Text style={styles.miniTitle}>{item.name}</Text>
        <Text style={styles.meta}>{item.type} - {item.district}</Text>
      </View>
      <Text style={styles.miniScore}>{scoreValue(item).toFixed(1)}</Text>
    </Pressable>
  );
}

export default function App() {
  const [fontsLoaded] = useFonts({
    Baloo2_800ExtraBold,
    Nunito_400Regular,
    Nunito_700Bold,
    Nunito_800ExtraBold
  });
  const [tab, setTab] = useState('Início');
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
        if (storedUsers) setUsers(JSON.parse(storedUsers));
        if (localUser) setCurrentUser(localUser);

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

  const filteredRestaurants = useMemo(() => {
    const needle = normalize(query || selectedCategory);
    return restaurants
      .filter((item) => !needle || normalize(`${item.name} ${item.type} ${item.district}`).includes(needle))
      .sort((a, b) => scoreValue(b) - scoreValue(a));
  }, [query, selectedCategory, restaurants]);

  const topRestaurants = useMemo(() => [...restaurants].sort((a, b) => scoreValue(b) - scoreValue(a)), [restaurants]);
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
    if (action?.type === 'tab') setTab(action.target);
    if (action?.type === 'favorite') toggleFavorite(action.name, user);
    if (action?.type === 'restaurant-register') setAuthMode('restaurant');
  }

  function toggleFavorite(name, user = currentUser) {
    if (!user && !requireLogin({ type: 'favorite', name })) return;
    setFavorites((items) => (items.includes(name) ? items.filter((item) => item !== name) : [name, ...items]));
  }

  function handleTab(nextTab) {
    if (nextTab === 'Favoritos' && !requireLogin({ type: 'tab', target: nextTab })) return;
    setTab(nextTab);
  }

  async function saveCurrentUser(user) {
    setCurrentUser(user);
    await AsyncStorage.setItem(storageKeys.currentUser, JSON.stringify(user));
    saveUserProfileToDb(user).catch(() => {});
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
      const user = { id: String(Date.now()), name: form.name.trim(), email };
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
    const user = { id: found.id, name: found.name, email: found.email };
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
    const item = {
      id: String(Date.now()),
      name: form.name.trim(),
      type: form.type.trim(),
      district: form.district.trim(),
      price: form.price || '$$',
      rating: Number(form.rating || 0) || 0,
      reviews: 0,
      open: true,
      phone: form.phone || '',
      address: form.address || '',
      image: form.image || defaultImage,
      description: form.description || 'Restaurante cadastrado pelo app Bocado.'
    };
    setRestaurants((items) => [item, ...items]);
    saveRestaurantToDb(item).catch(() => {
      Alert.alert('Firebase', 'O restaurante ficou salvo no aparelho, mas não sincronizou com o banco agora.');
    });
    setAuthMode(null);
    setForm({});
    setTab('Início');
    Alert.alert('Restaurante salvo', `${item.name} foi adicionado ao app.`);
  }

  function openMaps(item) {
    Linking.openURL(`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${item.name} ${item.address} São José do Rio Preto SP`)}`);
  }

  function openWhatsApp(item, reserve = false) {
    const message = reserve ? `Olá, quero reservar uma mesa no ${item.name}.` : `Olá, encontrei vocês pelo Bocado.`;
    Linking.openURL(`https://wa.me/${item.phone || '5517999999999'}?text=${encodeURIComponent(message)}`);
  }

  function renderHome() {
    return (
      <>
        <View style={styles.header}>
          <View style={styles.topRow}>
            <Pressable style={styles.locationPill}>
              <Ionicons name="location-outline" size={15} color={colors.green} />
              <Text style={styles.locationText}>Rio Preto</Text>
            </Pressable>
            <View style={styles.brandLockup}>
              <BrandLogo />
            </View>
            <Pressable style={styles.iconButton}>
              <Ionicons name="notifications-outline" size={20} color={colors.navy} />
            </Pressable>
          </View>
        </View>

        <View style={styles.searchBar}>
          <Ionicons name="search-outline" size={22} color={colors.green} />
          <TextInput
            value={query}
            onChangeText={setQuery}
            onSubmitEditing={() => setTab('Buscar')}
            placeholder="Buscar restaurantes, cozinhas..."
            placeholderTextColor="#918d86"
            style={styles.searchInput}
          />
          <Pressable onPress={() => setTab('Buscar')} style={styles.searchAction}>
            <Ionicons name="options-outline" size={20} color={colors.green} />
          </Pressable>
        </View>

        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.categoryScroll} contentContainerStyle={styles.categoryContent}>
          {categories.map(([name, icon]) => (
            <Pressable key={name} onPress={() => { setSelectedCategory(name); setTab('Buscar'); }} style={styles.categoryButton}>
              <View style={styles.categoryIcon}>
                <MaterialCommunityIcons name={icon} size={24} color={colors.green} />
              </View>
              <Text style={styles.categoryLabel}>{name}</Text>
            </Pressable>
          ))}
        </ScrollView>

        <View style={styles.homeHeadline}>
          <Text style={styles.homeHeadlineTitle}>Descubra lugares incríveis</Text>
          <View style={styles.underline} />
        </View>

        <SectionTitle title="Em alta perto de você" action="Ver todos" onPress={() => setTab('Buscar')} />
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.cardTrack}>
          {topRestaurants.slice(0, 6).map((item) => (
            <View key={item.id} style={styles.trackCard}>
              <RestaurantCard item={item} favorite={favorites.includes(item.name)} onOpen={setSelectedRestaurant} onFavorite={toggleFavorite} />
            </View>
          ))}
        </ScrollView>

        <SectionTitle title="Vale a mordida!" />
        <View style={styles.listStack}>
          {topRestaurants.slice(0, 4).map((item) => <MiniRestaurant key={item.id} item={item} onPress={setSelectedRestaurant} />)}
        </View>
      </>
    );
  }

  function renderSearch() {
    return (
      <View>
        <PageTitle kicker="Busca" title="Encontre um lugar" />
        <View style={styles.searchPageField}>
          <Ionicons name="search-outline" size={20} color={colors.green} />
          <TextInput value={query} onChangeText={setQuery} placeholder="Nome, bairro ou tipo" style={styles.pageInput} />
        </View>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.chipRow}>
          {['Todos', ...categories.slice(0, 7).map(([name]) => name)].map((name) => (
            <Pressable
              key={name}
              onPress={() => setSelectedCategory(name === 'Todos' ? '' : name)}
              style={[styles.filterChip, (selectedCategory === name || (!selectedCategory && name === 'Todos')) && styles.filterChipActive]}
            >
              <Text style={[styles.filterChipText, (selectedCategory === name || (!selectedCategory && name === 'Todos')) && styles.filterChipTextActive]}>{name}</Text>
            </Pressable>
          ))}
        </ScrollView>
        <Text style={styles.resultText}>{filteredRestaurants.length} restaurantes encontrados</Text>
        <View style={styles.listStack}>
          {filteredRestaurants.map((item) => (
            <RestaurantCard key={item.id} item={item} favorite={favorites.includes(item.name)} onOpen={setSelectedRestaurant} onFavorite={toggleFavorite} />
          ))}
        </View>
      </View>
    );
  }

  function renderRankings() {
    return (
      <View>
        <PageTitle kicker="Rankings" title="Melhores da cidade" />
        <View style={styles.pagePanel}>
          <Text style={styles.panelTitle}>Top restaurantes</Text>
          <Text style={styles.panelText}>Ranking montado automaticamente pelos restaurantes cadastrados.</Text>
          {topRestaurants.slice(0, 8).map((item, index) => (
            <Pressable key={item.id} onPress={() => setSelectedRestaurant(item)} style={styles.rankItem}>
              <Text style={styles.rankNumber}>#{index + 1}</Text>
              <Image source={{ uri: item.image || defaultImage }} style={styles.rankImage} />
              <View style={styles.rankText}>
                <Text style={styles.miniTitle}>{item.name}</Text>
                <Text style={styles.meta}>{item.type} - {item.rating.toFixed(1)}</Text>
              </View>
            </Pressable>
          ))}
        </View>
      </View>
    );
  }

  function renderFavorites() {
    return (
      <View>
        <PageTitle kicker="Favoritos" title="Salvos" />
        <View style={styles.pagePanel}>
          <Text style={styles.panelTitle}>{favoriteRestaurants.length ? 'Restaurantes favoritos' : 'Nenhum favorito ainda'}</Text>
          <Text style={styles.panelText}>Os restaurantes salvos aparecem aqui para comparar e acessar rapidamente.</Text>
          <View style={styles.listStack}>
            {favoriteRestaurants.map((item) => <MiniRestaurant key={item.id} item={item} onPress={setSelectedRestaurant} />)}
          </View>
          <AppButton kind="secondary" onPress={() => setTab('Buscar')}>Buscar restaurantes</AppButton>
        </View>
      </View>
    );
  }

  function renderProfile() {
    return (
      <View>
        <PageTitle kicker="Perfil" title="Sua conta" />
        <View style={styles.pagePanel}>
          {currentUser ? (
            <>
              <View style={styles.profileHero}>
                <View style={styles.avatar}><Text style={styles.avatarText}>{currentUser.name.slice(0, 2).toUpperCase()}</Text></View>
                <View>
                  <Text style={styles.panelTitle}>{currentUser.name}</Text>
                  <Text style={styles.panelText}>{currentUser.email}</Text>
                </View>
              </View>
              <View style={styles.actionGrid}>
                <AppButton kind="secondary" onPress={() => Alert.alert('Avaliações', 'Nenhuma avaliação cadastrada ainda.')}>Avaliações</AppButton>
                <AppButton kind="secondary" onPress={logout}>Sair</AppButton>
              </View>
            </>
          ) : (
            <>
              <Text style={styles.panelTitle}>Acesso do usuário</Text>
              <Text style={styles.panelText}>Entre ou crie uma conta para acompanhar favoritos, avaliações e reservas.</Text>
              <View style={styles.actionGrid}>
                <AppButton kind="secondary" onPress={() => { setAuthMode('login'); setForm({}); }}>Entrar</AppButton>
                <AppButton kind="secondary" onPress={() => { setAuthMode('signup'); setForm({}); }}>Criar conta</AppButton>
              </View>
            </>
          )}
        </View>
        <View style={styles.pagePanel}>
          <Text style={styles.panelTitle}>Para restaurantes</Text>
          <Text style={styles.panelText}>Cadastre restaurantes para alimentar a home, busca, rankings e detalhes do app.</Text>
          <AppButton onPress={() => currentUser ? setAuthMode('restaurant') : requireLogin({ type: 'restaurant-register' })}>Cadastrar restaurante</AppButton>
        </View>
      </View>
    );
  }

  const content = {
    Início: renderHome,
    Buscar: renderSearch,
    Rankings: renderRankings,
    Favoritos: renderFavorites,
    Perfil: renderProfile
  }[tab]();

  if (!fontsLoaded) return <SafeAreaView style={styles.safe} />;

  return (
    <SafeAreaView style={styles.safe}>
      <ExpoStatusBar style="dark" />
      <StatusBar barStyle="dark-content" />
      <ScrollView style={styles.screen} contentContainerStyle={styles.screenContent} showsVerticalScrollIndicator={false}>
        {content}
      </ScrollView>
      <View style={styles.bottomNav}>
        {tabs.map(([label, icon]) => (
          <Pressable key={label} onPress={() => handleTab(label)} style={[styles.navButton, tab === label && styles.navButtonActive]}>
            <Ionicons name={icon} size={22} color={tab === label ? colors.gold : '#77736d'} />
            <Text style={[styles.navText, tab === label && styles.navTextActive]}>{label}</Text>
          </Pressable>
        ))}
      </View>
      <RestaurantModal
        item={selectedRestaurant}
        onClose={() => setSelectedRestaurant(null)}
        onMaps={openMaps}
        onWhatsApp={openWhatsApp}
        favorite={selectedRestaurant && favorites.includes(selectedRestaurant.name)}
        onFavorite={toggleFavorite}
      />
      <AuthModal
        mode={authMode}
        form={form}
        setForm={setForm}
        setMode={setAuthMode}
        onSubmitAuth={submitAuth}
        onSubmitRestaurant={submitRestaurant}
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
      <View style={styles.logoLetters}>
        {logoLetters.map(([letter, color], index) => (
          <Text key={`${letter}-${index}`} style={[styles.logoLetter, { color }]}>{letter}</Text>
        ))}
      </View>
      <View style={styles.logoSprinkles}>
        <View style={[styles.sprinkle, { backgroundColor: colors.orange, transform: [{ rotate: '-28deg' }] }]} />
        <View style={[styles.sprinkle, { backgroundColor: colors.pistachio, transform: [{ rotate: '26deg' }] }]} />
      </View>
    </View>
  );
}

function PageTitle({ kicker, title }) {
  return (
    <View style={styles.pageTitle}>
      <Text style={styles.kicker}>{kicker}</Text>
      <Text style={styles.pageTitleText}>{title}</Text>
    </View>
  );
}

function RestaurantModal({ item, onClose, onMaps, onWhatsApp, favorite, onFavorite }) {
  if (!item) return null;
  return (
    <Modal visible transparent animationType="slide" onRequestClose={onClose}>
      <View style={styles.modalBackdrop}>
        <View style={styles.detailSheet}>
          <Image source={{ uri: item.image || defaultImage }} style={styles.detailImage} />
          <Pressable onPress={onClose} style={styles.closeButton}>
            <Ionicons name="close" size={22} color={colors.green} />
          </Pressable>
          <View style={styles.detailBody}>
            <View style={styles.cardTop}>
              <View style={styles.cardTitleWrap}>
                <Text style={styles.detailTitle}>{item.name}</Text>
                <Text style={styles.meta}>{item.type} - {item.price} - {item.district}</Text>
              </View>
              <View style={styles.scoreBadge}><Text style={styles.scoreText}>{scoreValue(item).toFixed(1)}</Text></View>
            </View>
            <Text style={styles.detailText}>{item.description}</Text>
            <Text style={styles.detailAddress}>{item.address}</Text>
            <View style={styles.detailActions}>
              <AppButton kind="secondary" onPress={() => onMaps(item)}>Como chegar</AppButton>
              <AppButton kind="secondary" onPress={() => onWhatsApp(item)}>WhatsApp</AppButton>
              <AppButton onPress={() => onWhatsApp(item, true)}>Reservar mesa</AppButton>
              <AppButton kind="secondary" onPress={() => onFavorite(item.name)}>{favorite ? 'Remover favorito' : 'Salvar favorito'}</AppButton>
            </View>
          </View>
        </View>
      </View>
    </Modal>
  );
}

function AuthModal({ mode, form, setForm, setMode, onSubmitAuth, onSubmitRestaurant }) {
  if (!mode) return null;
  const isRestaurant = mode === 'restaurant';
  const title = mode === 'login' ? 'Acesse sua conta' : mode === 'signup' ? 'Comece no Bocado' : 'Cadastrar restaurante';
  return (
    <Modal visible transparent animationType="slide" onRequestClose={() => setMode(null)}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={styles.modalBackdrop}>
        <ScrollView contentContainerStyle={styles.authSheet}>
          <Pressable onPress={() => setMode(null)} style={styles.closeButton}>
            <Ionicons name="close" size={22} color={colors.green} />
          </Pressable>
          <Text style={styles.kicker}>{isRestaurant ? 'Restaurante' : mode === 'login' ? 'Entrar' : 'Criar conta'}</Text>
          <Text style={styles.pageTitleText}>{title}</Text>
          {isRestaurant ? (
            <>
              <Field label="Nome" value={form.name} onChangeText={(value) => setForm({ ...form, name: value })} />
              <Field label="Tipo de comida" value={form.type} onChangeText={(value) => setForm({ ...form, type: value })} />
              <Field label="Bairro" value={form.district} onChangeText={(value) => setForm({ ...form, district: value })} />
              <Field label="Faixa de preço" value={form.price} onChangeText={(value) => setForm({ ...form, price: value })} placeholder="$$" />
              <Field label="Endereço" value={form.address} onChangeText={(value) => setForm({ ...form, address: value })} />
              <Field label="WhatsApp" value={form.phone} onChangeText={(value) => setForm({ ...form, phone: value })} keyboardType="phone-pad" />
              <Field label="Imagem" value={form.image} onChangeText={(value) => setForm({ ...form, image: value })} placeholder="https://..." />
              <Field label="Descrição" value={form.description} onChangeText={(value) => setForm({ ...form, description: value })} multiline />
              <AppButton onPress={onSubmitRestaurant}>Salvar restaurante</AppButton>
            </>
          ) : (
            <>
              {mode === 'signup' ? <Field label="Nome" value={form.name} onChangeText={(value) => setForm({ ...form, name: value })} /> : null}
              <Field label="E-mail" value={form.email} onChangeText={(value) => setForm({ ...form, email: value })} keyboardType="email-address" autoCapitalize="none" />
              <Field label="Senha" value={form.password} onChangeText={(value) => setForm({ ...form, password: value })} secureTextEntry />
              <AppButton onPress={onSubmitAuth}>{mode === 'login' ? 'Entrar' : 'Criar conta'}</AppButton>
              <AppButton kind="secondary" onPress={() => setMode(mode === 'login' ? 'signup' : 'login')}>
                {mode === 'login' ? 'Criar nova conta' : 'Já tenho conta'}
              </AppButton>
            </>
          )}
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
