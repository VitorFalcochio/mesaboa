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

export const seedRestaurants = [
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
    latitude: -20.8157,
    longitude: -49.3793,
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
    latitude: -20.8068,
    longitude: -49.3905,
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
    latitude: -20.8193,
    longitude: -49.3742,
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
    latitude: -20.8282,
    longitude: -49.3836,
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
    latitude: -20.8106,
    longitude: -49.3672,
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
    latitude: -20.8214,
    longitude: -49.3921,
    image: 'https://images.unsplash.com/photo-1509042239860-f550ce710b93?auto=format&fit=crop&w=1000&q=82',
    description: 'Cafés especiais, brunch e espaço agradável para encontros rápidos.'
  }
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
  ['Coleções', 'bookmark-outline'],
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
