export const restaurant = {
  id: 'vitor-falcochio-teste',
  name: 'Mesa Boa by Vitor',
  type: 'Contemporâneo',
  district: 'Centro',
  price: '$$$',
  rating: 4.9,
  reviews: 12,
  open: true,
  status: 'pending',
  ownerId: 'vitor-demo',
  ownerName: 'Vitor',
  ownerEmail: 'vitorfalcochio@gmail.com',
  phone: '5517999999999',
  whatsapp: '5517999999999',
  address: 'São José do Rio Preto, SP',
  latitude: -20.8126,
  longitude: -49.3768,
  image: 'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?auto=format&fit=crop&w=1000&q=82',
  coverPhoto: 'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?auto=format&fit=crop&w=1400&q=82',
  photos: [
    { id: '1', url: 'https://images.unsplash.com/photo-1551183053-bf91a1d81141?auto=format&fit=crop&w=1200&q=82', isCover: true },
    { id: '2', url: 'https://images.unsplash.com/photo-1559847844-5315695dadae?auto=format&fit=crop&w=1200&q=82', isCover: false },
    { id: '3', url: 'https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&w=1200&q=82', isCover: false }
  ],
  description: 'Perfil de teste da sua conta. Use este restaurante para experimentar capa, fotos, cardápio, métricas e aprovação.',
  highlights: ['Perfil de teste', 'Fotos reais', 'Cardápio'],
  tags: ['teste', 'dono', 'perfil'],
  menuItems: [
    { id: '1', name: 'Prato assinatura', price: 68 },
    { id: '2', name: 'Entrada da casa', price: 34 },
    { id: '3', name: 'Sobremesa', price: 26 }
  ],
  openingHours: {
    monday: '18:00-23:00',
    tuesday: '18:00-23:00',
    wednesday: '18:00-23:00',
    thursday: '18:00-23:00',
    friday: '18:00-23:30',
    saturday: '12:00-23:30',
    sunday: '12:00-16:00'
  }
};
