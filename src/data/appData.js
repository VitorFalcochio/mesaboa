export { seedRestaurants } from '../restaurants';

export const seedUsers = [
  {
    id: 'vitor-demo',
    name: 'Vitor',
    email: 'vitorfalcochio@gmail.com',
    password: '@Vitor091107',
    gamification: {
      points: 120,
      metrics: { favorites: 0, maps: 0, reviews: 0, known: 0, likesGiven: 0, commentLikes: 0, invites: 0, collections: 0 },
      awarded: { favorites: [], maps: [], reviews: [], known: [], likes: [], collections: [], invites: [] },
      achievements: []
    }
  }
];

export const defaultImage = 'https://images.unsplash.com/photo-1559339352-11d035aa65de?auto=format&fit=crop&w=900&q=85';

export const rioPretoRegion = {
  latitude: -20.8126,
  longitude: -49.3768,
  latitudeDelta: 0.062,
  longitudeDelta: 0.052
};

export const fallbackPartnerCoordinates = [
  { latitude: -20.8157, longitude: -49.3793 },
  { latitude: -20.8068, longitude: -49.3905 },
  { latitude: -20.8193, longitude: -49.3742 },
  { latitude: -20.8282, longitude: -49.3836 },
  { latitude: -20.8106, longitude: -49.3672 },
  { latitude: -20.8214, longitude: -49.3921 }
];

export const areaOptions = [
  { name: 'São José do Rio Preto', region: rioPretoRegion },
  { name: 'Vila Redentora', region: { latitude: -20.8157, longitude: -49.3793, latitudeDelta: 0.024, longitudeDelta: 0.022 } },
  { name: 'Jardim Vivendas', region: { latitude: -20.8068, longitude: -49.3905, latitudeDelta: 0.024, longitudeDelta: 0.022 } },
  { name: 'Centro', region: { latitude: -20.8193, longitude: -49.3742, latitudeDelta: 0.024, longitudeDelta: 0.022 } },
  { name: 'Boa Vista', region: { latitude: -20.8282, longitude: -49.3836, latitudeDelta: 0.024, longitudeDelta: 0.022 } }
];

export const radiusOptions = [2, 5, 10, 20];

export const seedRestaurantLegacyNames = [
  'Brasa Alta Prime',
  'Nori Jardim',
  'Cantina Andaló',
  'Casa da Esquina Burger',
  'Forno Rio Preto',
  'Café Ipê',
  'Restaurante Jangada',
  'Coco Bambu São José do Rio Preto',
  "L'Osteria",
  'Don León',
  'Churrascaria Farrougrill',
  'Bella Capri Pizza & Pasta - Redentora'
];

export const categories = [
  ['Restaurantes', 'silverware-fork-knife'],
  ['Cafés', 'coffee-outline'],
  ['Bares', 'glass-cocktail'],
  ['Experiências', 'star-outline'],
  ['Romântico', 'heart-outline'],
  ['Mais', 'dots-grid']
];

export const tabs = [
  ['Explorar', 'compass-outline'],
  ['Feed', 'albums-outline'],
  ['Favoritos', 'heart-outline'],
  ['Mapa', 'location-outline'],
  ['Perfil', 'person-outline']
];

export const collections = [
  ['Jantar especial', 'Lugares para noites inesquecíveis', 'https://images.unsplash.com/photo-1552566626-52f8b828add9?auto=format&fit=crop&w=900&q=86'],
  ['Cafés para sua tarde', 'Selecionados para momentos leves', 'https://images.unsplash.com/photo-1509042239860-f550ce710b93?auto=format&fit=crop&w=900&q=86'],
  ['Rooftops com vista', 'Altura, clima e bons drinks', 'https://images.unsplash.com/photo-1514933651103-005eec06c04b?auto=format&fit=crop&w=900&q=86'],
  ['Novos na cidade', 'Descubra lugares que acabaram de chegar', 'https://images.unsplash.com/photo-1559339352-11d035aa65de?auto=format&fit=crop&w=900&q=86'],
  ['Almoço de negócios', 'Ambientes ideais para reuniões', 'https://images.unsplash.com/photo-1540189549336-e6e99c3679fe?auto=format&fit=crop&w=900&q=86'],
  ['Lugares instagramáveis', 'Cenários que merecem ser compartilhados', 'https://images.unsplash.com/photo-1523906834658-6e24ef2386f9?auto=format&fit=crop&w=900&q=86']
];

export const dineRanks = [
  { name: 'Beliscador', minPoints: 0, description: 'Começou a montar seu mapa de bons lugares.' },
  { name: 'Caçador de Mesa', minPoints: 100, description: 'Já fareja boas mesas pela cidade.' },
  { name: 'Garfo Curioso', minPoints: 250, description: 'Explora cozinhas, bairros e experiências novas.' },
  { name: 'Roteirista de Rolês', minPoints: 500, description: 'Sabe transformar fome em plano bom.' },
  { name: 'Sommelier de Experiências', minPoints: 900, description: 'Percebe ambiente, atendimento e ocasião.' },
  { name: 'Curador Dine', minPoints: 1400, description: 'Suas dicas ajudam outras pessoas a escolher melhor.' },
  { name: 'Lenda da Reserva', minPoints: 2200, description: 'Referência máxima para descobrir restaurantes.' }
];

export const pointRewards = {
  favorite: 5,
  map: 5,
  review: 20,
  known: 30,
  like: 2,
  commentLiked: 10,
  collection: 50,
  invite: 80
};

export const achievementRules = [
  { id: 'first_bite', name: 'Primeira Mordida', description: 'Publicou sua primeira avaliação.', metric: 'reviews', goal: 1 },
  { id: 'map_in_hand', name: 'Mapa na Mão', description: 'Abriu rota para 5 restaurantes.', metric: 'maps', goal: 5 },
  { id: 'table_full', name: 'Mesa Cheia', description: 'Convidou 3 amigos.', metric: 'invites', goal: 3 },
  { id: 'critic_house', name: 'Crítico da Casa', description: 'Curtiu 10 comentários úteis da comunidade.', metric: 'likesGiven', goal: 10 },
  { id: 'neighborhood_explorer', name: 'Explorador de Bairro', description: 'Marcou 5 restaurantes como conhecidos.', metric: 'known', goal: 5 }
];
