export { seedRestaurants } from '../restaurants';

export const seedUsers = [
  {
    id: 'vitor-demo',
    name: 'Vitor',
    email: 'vitorfalcochio@gmail.com',
    accountType: 'user',
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
  ['Feed', 'newspaper-outline'],
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
  { name: 'Explorador', minPoints: 0, description: 'Começou a montar seu mapa gastronômico.', benefit: 'Selo Explorador no perfil' },
  { name: 'Descobridor', minPoints: 100, description: 'Já encontra boas mesas pela cidade.', benefit: 'Novas missões semanais' },
  { name: 'Degustador', minPoints: 250, description: 'Explora cozinhas, bairros e experiências.', benefit: 'Moldura Degustador no perfil' },
  { name: 'Especialista', minPoints: 500, description: 'Suas avaliações ajudam outras pessoas.', benefit: 'Selo de avaliação em destaque' },
  { name: 'Curador', minPoints: 900, description: 'Transforma descobertas em ótimas recomendações.', benefit: 'Identidade de Curador Dine' },
  { name: 'Embaixador', minPoints: 1400, description: 'Movimenta a comunidade gastronômica.', benefit: 'Acesso antecipado a experiências' },
  { name: 'Lenda Dine', minPoints: 2200, description: 'Referência máxima para descobrir restaurantes.', benefit: 'Selo máximo da Jornada' }
];

export const pointRewards = {
  favorite: 5,
  map: 5,
  review: 20,
  known: 30,
  like: 2,
  commentLiked: 10,
  collection: 50,
  invite: 80,
  reservation: 25,
  post: 15
};

export const achievementRules = [
  { id: 'first_save', name: 'De Olho', description: 'Salvou seu primeiro restaurante.', metric: 'favorites', goal: 1, icon: 'heart' },
  { id: 'first_bite', name: 'Primeira Mordida', description: 'Publicou sua primeira avaliação.', metric: 'reviews', goal: 1 },
  { id: 'table_reserved', name: 'Mesa Marcada', description: 'Fez sua primeira reserva pelo Dine.', metric: 'reservations', goal: 1, icon: 'calendar' },
  { id: 'voice_of_dine', name: 'Voz da Comunidade', description: 'Publicou 3 descobertas no Feed.', metric: 'posts', goal: 3, icon: 'megaphone' },
  { id: 'map_in_hand', name: 'Mapa na Mão', description: 'Abriu rota para 5 restaurantes.', metric: 'maps', goal: 5 },
  { id: 'table_full', name: 'Mesa Cheia', description: 'Convidou 3 amigos.', metric: 'invites', goal: 3 },
  { id: 'critic_house', name: 'Crítico da Casa', description: 'Curtiu 10 comentários úteis da comunidade.', metric: 'likesGiven', goal: 10 },
  { id: 'neighborhood_explorer', name: 'Explorador de Bairro', description: 'Marcou 5 restaurantes como conhecidos.', metric: 'known', goal: 5 }
];

export const weeklyMissionRules = [
  { id: 'weekly_saves', title: 'Monte seu roteiro', description: 'Salve 3 restaurantes nesta semana.', event: 'favorite', goal: 3, reward: 25, icon: 'bookmark-outline' },
  { id: 'weekly_visit', title: 'Descoberta por perto', description: 'Registre 2 lugares que você conheceu.', event: 'known', goal: 2, reward: 60, icon: 'location-outline' },
  { id: 'weekly_review', title: 'Conte como foi', description: 'Publique 1 avaliação completa.', event: 'review', goal: 1, reward: 40, icon: 'star-outline' },
  { id: 'weekly_reservation', title: 'Próxima mesa', description: 'Faça 1 reserva pelo Dine.', event: 'reservation', goal: 1, reward: 50, icon: 'calendar-outline' }
];
