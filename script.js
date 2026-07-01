const icons = {
  menu: '<svg viewBox="0 0 24 24"><path d="M4 7h16M4 12h16M4 17h16"/></svg>',
  search: '<svg viewBox="0 0 24 24"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></svg>',
  bell: '<svg viewBox="0 0 24 24"><path d="M18 8a6 6 0 0 0-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9"/><path d="M10 21h4"/></svg>',
  home: '<svg viewBox="0 0 24 24"><path d="m3 11 9-8 9 8"/><path d="M5 10v10h14V10"/></svg>',
  heart: '<svg viewBox="0 0 24 24"><path d="M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.6l-1-1a5.5 5.5 0 0 0-7.8 7.8l1 1L12 21l7.8-7.6 1-1a5.5 5.5 0 0 0 0-7.8Z"/></svg>',
  star: '<svg viewBox="0 0 24 24"><path d="m12 2 3.1 6.3 6.9 1-5 4.8 1.2 6.9-6.2-3.3L5.8 21 7 14.1 2 9.3l6.9-1L12 2Z"/></svg>',
  map: '<svg viewBox="0 0 24 24"><path d="M9 18 3 21V6l6-3 6 3 6-3v15l-6 3-6-3Z"/><path d="M9 3v15M15 6v15"/></svg>',
  phone: '<svg viewBox="0 0 24 24"><path d="M22 16.9v3a2 2 0 0 1-2.2 2 19.8 19.8 0 0 1-8.6-3.1 19.5 19.5 0 0 1-6-6A19.8 19.8 0 0 1 2.1 4.2 2 2 0 0 1 4.1 2h3a2 2 0 0 1 2 1.7c.1.9.3 1.7.6 2.5a2 2 0 0 1-.4 2.1L8 9.6a16 16 0 0 0 6.4 6.4l1.3-1.3a2 2 0 0 1 2.1-.4c.8.3 1.6.5 2.5.6A2 2 0 0 1 22 16.9Z"/></svg>',
  user: '<svg viewBox="0 0 24 24"><circle cx="12" cy="8" r="4"/><path d="M4 21a8 8 0 0 1 16 0"/></svg>',
  calendar: '<svg viewBox="0 0 24 24"><path d="M8 2v4M16 2v4"/><rect x="3" y="5" width="18" height="16" rx="2"/><path d="M3 10h18"/></svg>',
  fork: '<svg viewBox="0 0 24 24"><path d="M6 2v8M10 2v8M8 2v20M17 2v20M14 2c3 2 4 5 3 9"/></svg>',
  sliders: '<svg viewBox="0 0 24 24"><path d="M4 6h10M18 6h2M4 12h3M11 12h9M4 18h12M20 18h0"/><circle cx="16" cy="6" r="2"/><circle cx="9" cy="12" r="2"/><circle cx="18" cy="18" r="2"/></svg>',
  trend: '<svg viewBox="0 0 24 24"><path d="M3 17 9 11l4 4 8-8"/><path d="M14 7h7v7"/></svg>',
  coin: '<svg viewBox="0 0 24 24"><path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7H14a3.5 3.5 0 0 1 0 7H6"/></svg>',
  clock: '<svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="9"/><path d="M12 7v6l4 2"/></svg>',
  eye: '<svg viewBox="0 0 24 24"><path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7-10-7-10-7Z"/><circle cx="12" cy="12" r="3"/></svg>',
  share: '<svg viewBox="0 0 24 24"><path d="M4 12v8h16v-8M12 15V3"/><path d="m7 8 5-5 5 5"/></svg>',
  back: '<svg viewBox="0 0 24 24"><path d="m15 18-6-6 6-6"/></svg>'
};

const categoryIcons = {
  'Japonês': 'fork',
  Italiano: 'fork',
  Churrascaria: 'fork',
  Hamburgueria: 'fork',
  Pizzaria: 'fork',
  Café: 'clock',
  Doceria: 'star',
  Almoço: 'calendar',
  Jantar: 'clock',
  Delivery: 'map'
};

const categories = ['Japonês', 'Italiano', 'Churrascaria', 'Hamburgueria', 'Pizzaria', 'Café', 'Doceria', 'Almoço', 'Jantar', 'Delivery'];
const filterTags = ['Aberto agora', 'Bom para casal', 'Bom para família', 'Delivery', 'Estacionamento', 'Aceita reserva', 'Área kids', 'Pet friendly'];
const baseImages = [
  'https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&w=1000&q=82',
  'https://images.unsplash.com/photo-1553621042-f6e147245754?auto=format&fit=crop&w=1000&q=82',
  'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?auto=format&fit=crop&w=1000&q=82',
  'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&w=1000&q=82',
  'https://images.unsplash.com/photo-1513104890138-7c749659a591?auto=format&fit=crop&w=1000&q=82',
  'https://images.unsplash.com/photo-1509042239860-f550ce710b93?auto=format&fit=crop&w=1000&q=82',
  'https://images.unsplash.com/photo-1488477181946-6428a0291777?auto=format&fit=crop&w=1000&q=82',
  'https://images.unsplash.com/photo-1540189549336-e6e99c3679fe?auto=format&fit=crop&w=1000&q=82',
  'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?auto=format&fit=crop&w=1000&q=82',
  'https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&w=1000&q=82'
];

let restaurants = [
  ['Brasa Alta Prime','Churrascaria','$$$$','Vila Redentora',['Romântico','Estacionamento','Aceita reserva','Jantar'],[9.7,9.4,9.6,8.6,9.5,9.3],428,true],
  ['Nori Jardim','Japonês','$$$','Jardim Vivendas',['Bom para casal','Aceita reserva','Jantar'],[9.6,9.3,9.5,8.8,9.4,9.1],361,true],
  ['Cantina Andaló','Italiano','$$$','Centro',['Bom para família','Aceita reserva','Almoço'],[9.4,9.2,9.1,8.9,9.2,9.4],298,true],
  ['Casa da Esquina Burger','Hamburgueria','$$','Boa Vista',['Delivery','Pet friendly','Custo-benefício'],[9.2,8.9,8.8,9.4,9.0,8.9],512,true],
  ['Forno Rio Preto','Pizzaria','$$','Jardim Alto Rio Preto',['Bom para família','Delivery','Área kids'],[9.1,8.8,8.9,9.2,9.0,8.7],474,true],
  ['Café Ipê','Café','$$','Vila Imperial',['Pet friendly','Bom para casal','Café'],[9.0,9.2,9.3,8.8,9.1,9.0],246,true],
  ['Dulce Praça','Doceria','$$','Centro',['Café','Bom para família','Delivery'],[9.3,9.0,8.9,8.7,9.2,9.2],189,true],
  ['Sabores do Bosque','Comida brasileira','$$','Parque Industrial',['Almoço','Custo-benefício','Bom para família'],[9.1,9.0,8.7,9.5,9.0,8.5],332,true],
  ['Al Manara Rio Preto','Árabe','$$$','Vila Redentora',['Bom para casal','Aceita reserva','Jantar'],[9.2,9.1,9.0,8.6,9.0,9.1],207,false],
  ['Taco Verde','Mexicano','$$','Jardim Tarraf II',['Delivery','Pet friendly','Jantar'],[8.9,8.7,8.8,9.1,8.9,8.8],176,true],
  ['Raiz Leve','Saudável','$$','Jardim Maracanã',['Almoço','Delivery','Pet friendly'],[9.0,8.9,8.8,8.9,8.8,8.7],224,true],
  ['Parrilla do Lago','Churrascaria','$$$$','Represa Municipal',['Romântico','Estacionamento','Bom para casal'],[9.5,9.1,9.7,8.4,9.4,8.9],284,false],
  ['Sushi Mirai','Japonês','$$$','Higienópolis',['Jantar','Aceita reserva','Delivery'],[9.3,9.0,9.1,8.7,9.1,8.8],319,true],
  ['Nonna Teresa','Italiano','$$','Jardim América',['Bom para família','Custo-benefício','Almoço'],[9.0,9.3,8.8,9.1,9.0,8.9],268,true],
  ['Beco do Smash','Hamburgueria','$','Centro',['Delivery','Custo-benefício','Aberto agora'],[8.8,8.6,8.5,9.6,8.7,9.2],401,true],
  ['Pizza Botânica','Pizzaria','$$$','Jardim Vivendas',['Pet friendly','Bom para casal','Aceita reserva'],[9.2,9.0,9.4,8.5,9.2,9.0],198,false],
  ['Padoca 17','Café','$','Boa Vista',['Café','Custo-benefício','Almoço'],[8.9,9.1,8.6,9.4,8.9,8.8],307,true],
  ['Ateliê do Brigadeiro','Doceria','$$','Jardim Europa',['Doceria','Delivery','Bom para família'],[9.4,9.0,9.0,8.8,9.1,8.7],145,true],
  ['Quintal Caipira','Comida brasileira','$$','Eldorado',['Área kids','Bom para família','Estacionamento'],[9.0,8.9,9.0,9.2,9.0,8.4],286,true],
  ['Maré Alta Peixes','Saudável','$$$','Vila Sinibaldi',['Almoço','Bom para casal','Aceita reserva'],[9.1,9.2,9.1,8.5,9.0,8.6],167,false]
].map((item, index) => {
  const [name, type, price, district, tags, notes, reviews, open] = item;
  const score = average(notes);
  return {
    id: index + 1,
    name, type, price, district, tags, reviews, open,
    image: baseImages[index % baseImages.length],
    gallery: [baseImages[index % baseImages.length], baseImages[(index + 2) % baseImages.length], baseImages[(index + 4) % baseImages.length], baseImages[(index + 6) % baseImages.length]],
    notes: { food: notes[0], service: notes[1], ambience: notes[2], price: notes[3], experience: notes[4], location: notes[5] },
    score,
    address: `Rua ${['Voluntários','Siqueira Campos','Pedro Amaral','XV de Novembro','Cila'][index % 5]}, ${120 + index * 37} - ${district}`,
    hours: open ? 'Aberto hoje, 11h30 às 23h' : 'Abre amanhã às 11h30',
    phone: `(17) 9${8800 + index}-${1000 + index}`,
    instagram: `@${slug(name)}`,
    description: `${name} é uma opção bem avaliada em ${district}, indicada para quem busca ${type.toLowerCase()} com experiência consistente, ambiente agradável e boa reputação local.`,
    dishes: [
      ['Prato assinatura', baseImages[(index + 1) % baseImages.length], 'R$ 89'],
      ['Entrada especial', baseImages[(index + 3) % baseImages.length], 'R$ 39'],
      ['Principal da casa', baseImages[(index + 5) % baseImages.length], 'R$ 119'],
      ['Sobremesa', baseImages[(index + 7) % baseImages.length], 'R$ 34']
    ],
    strengths: ['Boa consistência nas avaliações', 'Ambiente confortável', 'Atendimento elogiado', 'Ótimo para ocasiões especiais'],
    attention: ['Horários de pico podem ter espera', 'Reserve em datas comemorativas'],
    comments: [
      { author: 'Carolina M.', text: 'Experiência muito boa, ambiente bonito e comida acima da média.' },
      { author: 'Lucas R.', text: 'Valeu a visita. O atendimento foi rápido e os pratos vieram no ponto.' }
    ],
    views: 900 + index * 183
  };
});

let favorites = [1, 2, 6];
let recent = [3, 4, 1];
let wishlist = [12, 16, 20];
let currentRanking = 'Top 10 restaurantes de Rio Preto';
let pendingReviews = [
  { id: 1, restaurantId: 4, author: 'Marina T.', visitDate: '2026-06-28', average: 9.4, text: 'Entrega rápida, lanche bem montado e atendimento muito atencioso.' },
  { id: 2, restaurantId: 12, author: 'Rafael B.', visitDate: '2026-06-27', average: 9.2, text: 'Ambiente bonito para casal, mas vale reservar antes.' }
];

function average(values) {
  return +(values.reduce((sum, value) => sum + value, 0) / values.length).toFixed(1);
}
function slug(text) {
  return text.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-z0-9]+/g, '');
}
function score(value) {
  return value.toLocaleString('pt-BR', { minimumFractionDigits: 1, maximumFractionDigits: 1 });
}
function byId(id) {
  return restaurants.find((restaurant) => restaurant.id === Number(id));
}
function phoneDigits(phone) {
  return `55${phone.replace(/\D/g, '')}`;
}
function actionUrl(restaurant, action) {
  const encodedAddress = encodeURIComponent(`${restaurant.name}, ${restaurant.address}, São José do Rio Preto SP`);
  if (action === 'maps') return `https://www.google.com/maps/search/?api=1&query=${encodedAddress}`;
  if (action === 'instagram') return `https://instagram.com/${restaurant.instagram.replace('@', '')}`;
  if (action === 'reserve') return `https://wa.me/${phoneDigits(restaurant.phone)}?text=${encodeURIComponent(`Olá, vim pelo Mesa Boa e quero reservar uma mesa no ${restaurant.name}.`)}`;
  return `https://wa.me/${phoneDigits(restaurant.phone)}?text=${encodeURIComponent(`Olá, encontrei o ${restaurant.name} no Mesa Boa. Gostaria de mais informações.`)}`;
}
function openRestaurantAction(id, action) {
  const restaurant = byId(id);
  if (!restaurant) return;
  window.open(actionUrl(restaurant, action), '_blank', 'noopener');
}
function showToast(message) {
  const toast = document.getElementById('toast');
  toast.textContent = message;
  toast.classList.add('show');
  clearTimeout(showToast.timer);
  showToast.timer = setTimeout(() => toast.classList.remove('show'), 2600);
}
function hydrateIcons(scope = document) {
  scope.querySelectorAll('[data-icon]').forEach((element) => {
    element.innerHTML = icons[element.dataset.icon] || '';
  });
}

function cardTemplate(restaurant, mode = 'grid') {
  if (mode === 'home') {
    return `
      <article class="restaurant-card home-restaurant-card">
        <div class="image-wrap">
          <img src="${restaurant.image}" alt="${restaurant.name}">
          <span class="score">${score(restaurant.score)}</span>
          <button class="save-button" data-favorite="${restaurant.id}" aria-label="Salvar restaurante" type="button">${icons.heart}</button>
        </div>
        <div class="card-body">
          <h3>${restaurant.name}</h3>
          <div class="meta">${restaurant.type} · ${restaurant.district}</div>
          <div class="meta">${restaurant.price} · ${(1.2 + restaurant.id / 10).toLocaleString('pt-BR', { maximumFractionDigits: 1 })} km <span class="rating-star">★</span> (${restaurant.reviews})</div>
        </div>
      </article>
    `;
  }

  return `
    <article class="restaurant-card">
      <div class="image-wrap">
        <img src="${restaurant.image}" alt="${restaurant.name}">
        <span class="open-badge ${restaurant.open ? 'is-open' : ''}">${restaurant.open ? 'Aberto agora' : 'Fechado'}</span>
        <button class="save-button" data-favorite="${restaurant.id}" aria-label="Salvar restaurante" type="button">${icons.heart}</button>
      </div>
      <div class="card-body">
        <div class="card-top">
          <div>
            <h3>${restaurant.name}</h3>
            <div class="meta">${restaurant.type} · ${restaurant.price}</div>
            <div class="meta">${restaurant.district} · ${restaurant.reviews} avaliações</div>
          </div>
          <span class="score">${score(restaurant.score)}</span>
        </div>
        <div class="tag-row">${restaurant.tags.slice(0, mode === 'list' ? 5 : 3).map((tag) => `<span class="tag">${tag}</span>`).join('')}</div>
        <div class="card-actions">
          <button class="solid-button" data-detail="${restaurant.id}" type="button">Ver detalhes</button>
        </div>
      </div>
    </article>
  `;
}

function miniTemplate(restaurant) {
  return `
    <button class="mini-item" data-detail="${restaurant.id}" type="button">
      <img src="${restaurant.image}" alt="${restaurant.name}">
      <span><strong>${restaurant.name}</strong><small>${restaurant.type} · ${restaurant.district}</small></span>
      <span class="score">${score(restaurant.score)}</span>
    </button>
  `;
}

function setPage(pageId) {
  document.body.dataset.page = pageId;
  document.querySelectorAll('.page').forEach((page) => page.classList.toggle('active', page.id === pageId));
  document.querySelectorAll('.nav-link, .bottom-link').forEach((button) => button.classList.toggle('active', button.dataset.page === pageId));
  document.body.classList.remove('menu-open');
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

function renderHome() {
  document.getElementById('categoryChips').innerHTML = categories.map((cat) => `
    <button class="category-card" data-category="${cat}" type="button">
      <span>${icons[categoryIcons[cat]] || icons.fork}</span>
      <strong>${cat}</strong>
    </button>
  `).join('');
  const topDistricts = [...new Set(restaurants.map((r) => r.district))].slice(0, 8);
  document.getElementById('districtShortcuts').innerHTML = topDistricts.map((district) => {
    const count = restaurants.filter((r) => r.district === district).length;
    return `<button class="local-card" data-district="${district}" type="button"><strong>${district}</strong><span>${count} opções selecionadas</span></button>`;
  }).join('');

  const top = [...restaurants].sort((a, b) => b.score - a.score);
  document.getElementById('topRated').innerHTML = top.slice(0, 8).map((item) => cardTemplate(item, 'home')).join('');
  document.getElementById('trendingList').innerHTML = top.slice(4, 8).map(miniTemplate).join('');
  document.getElementById('coupleList').innerHTML = restaurants.filter((r) => r.tags.some((tag) => ['Bom para casal','Romântico'].includes(tag))).slice(0, 4).map(miniTemplate).join('');
  document.getElementById('valueList').innerHTML = restaurants.filter((r) => r.tags.includes('Custo-benefício') || r.price === '$').slice(0, 4).map(miniTemplate).join('');
  document.getElementById('openList').innerHTML = restaurants.filter((r) => r.open).slice(0, 4).map(miniTemplate).join('');
}

function setupFilters() {
  const types = [...new Set(restaurants.map((r) => r.type))].sort();
  const districts = [...new Set(restaurants.map((r) => r.district))].sort();
  document.getElementById('typeFilter').innerHTML += types.map((type) => `<option>${type}</option>`).join('');
  document.getElementById('districtFilter').innerHTML += districts.map((district) => `<option>${district}</option>`).join('');
  document.getElementById('reviewRestaurant').innerHTML = restaurants.map((r) => `<option value="${r.id}">${r.name}</option>`).join('');
  const visitDate = document.querySelector('[name="visitDate"]');
  if (visitDate) visitDate.valueAsDate = new Date();
  document.getElementById('tagFilters').innerHTML = filterTags.map((tag) => `
    <label class="toggle-chip"><input type="checkbox" value="${tag}">${tag}</label>
  `).join('');
}

function getFilteredRestaurants() {
  const query = document.getElementById('listSearch').value.trim().toLowerCase();
  const type = document.getElementById('typeFilter').value;
  const minScore = Number(document.getElementById('scoreFilter').value);
  const price = document.getElementById('priceFilter').value;
  const district = document.getElementById('districtFilter').value;
  const checkedTags = [...document.querySelectorAll('#tagFilters input:checked')].map((input) => input.value);

  return restaurants.filter((restaurant) => {
    const content = `${restaurant.name} ${restaurant.type} ${restaurant.district} ${restaurant.tags.join(' ')}`.toLowerCase();
    const tagMatch = checkedTags.every((tag) => tag === 'Aberto agora' ? restaurant.open : restaurant.tags.includes(tag));
    return (!query || content.includes(query))
      && (!type || restaurant.type === type)
      && restaurant.score >= minScore
      && (!price || restaurant.price === price)
      && (!district || restaurant.district === district)
      && tagMatch;
  }).sort((a, b) => b.score - a.score);
}

function renderList() {
  const filtered = getFilteredRestaurants();
  document.getElementById('resultCount').textContent = `${filtered.length} restaurantes encontrados`;
  document.getElementById('restaurantList').innerHTML = filtered.map((restaurant) => cardTemplate(restaurant, 'list')).join('');
}

function renderDetails(id) {
  const restaurant = byId(id);
  if (!restaurant) return;

  recent = [restaurant.id, ...recent.filter((item) => item !== restaurant.id)].slice(0, 4);
  const notes = [
    ['Comida', restaurant.notes.food],
    ['Atendimento', restaurant.notes.service],
    ['Ambiente', restaurant.notes.ambience],
    ['Preço', restaurant.notes.price],
    ['Experiência', restaurant.notes.experience],
    ['Localização', restaurant.notes.location]
  ];

  document.getElementById('detailsContent').innerHTML = `
    <article class="details-shell">
      <section class="detail-hero">
        <img src="${restaurant.gallery[0]}" alt="${restaurant.name}">
        <div class="detail-controls">
          <button class="round-action" data-page="list" aria-label="Voltar" type="button">${icons.back}</button>
          <div>
            <button class="round-action" aria-label="Compartilhar" type="button">${icons.share}</button>
            <button class="round-action" data-favorite="${restaurant.id}" aria-label="Favoritar" type="button">${icons.heart}</button>
          </div>
        </div>
        <div class="detail-thumbs">${restaurant.gallery.map((img) => `<img src="${img}" alt="${restaurant.name}">`).join('')}</div>
      </section>
      <div class="details-body">
        <div class="details-title">
          <h1>${restaurant.name}</h1>
          <div class="details-meta">
            <span class="score">${score(restaurant.score)}</span>
            <strong>${restaurant.type} · ${restaurant.price}</strong>
            <span class="meta">${restaurant.district}</span>
          </div>
          <p>${restaurant.address}</p>
        </div>
        <div class="action-row">
          <button class="ghost-button" data-action="maps" data-restaurant-action="${restaurant.id}" type="button">${icons.map}Como chegar</button>
          <button class="ghost-button" data-action="whatsapp" data-restaurant-action="${restaurant.id}" type="button">${icons.phone}WhatsApp</button>
          <button class="ghost-button" data-action="instagram" data-restaurant-action="${restaurant.id}" type="button">${icons.user}Instagram</button>
          <button class="solid-button" data-action="reserve" data-restaurant-action="${restaurant.id}" type="button">${icons.calendar}Reservar mesa</button>
        </div>
        <p>${restaurant.description}</p>
        <p><strong>Horário:</strong> ${restaurant.hours}</p>
        <div class="details-grid">
          <div>
            <h2>Pratos recomendados</h2>
            <div class="dish-grid">${restaurant.dishes.map(([name, img, price]) => `
              <article class="dish-card"><img src="${img}" alt="${name}"><div><strong>${name}</strong><span>${price}</span></div></article>
            `).join('')}</div>
            <div class="bullet-list">
              <h2>Pontos fortes</h2>
              ${restaurant.strengths.map((item) => `<p>${item}</p>`).join('')}
              <h2>Pontos de atenção</h2>
              ${restaurant.attention.map((item) => `<p>${item}</p>`).join('')}
            </div>
            <h2>Avaliações de clientes</h2>
            ${restaurant.comments.map((comment) => `<div class="review-card"><strong>${comment.author}</strong><p>${comment.text}</p></div>`).join('')}
          </div>
          <aside class="note-panel">
            <h2>Notas</h2>
            ${notes.map(([label, value]) => `<div class="note-row"><span>${label}</span><strong class="score">${score(value)}</strong></div>`).join('')}
          </aside>
        </div>
      </div>
    </article>
  `;
  renderFavorites();
  setPage('details');
}

const rankingDefinitions = {
  'Top 10 restaurantes de Rio Preto': (items) => [...items].sort((a, b) => b.score - a.score).slice(0, 10),
  'Melhores para casal': (items) => items.filter((r) => r.tags.includes('Bom para casal') || r.tags.includes('Romântico')),
  'Melhores para família': (items) => items.filter((r) => r.tags.includes('Bom para família') || r.tags.includes('Área kids')),
  'Melhores custo-benefício': (items) => items.filter((r) => r.tags.includes('Custo-benefício') || r.price === '$'),
  'Melhores japoneses': (items) => items.filter((r) => r.type === 'Japonês'),
  'Melhores hamburguerias': (items) => items.filter((r) => r.type === 'Hamburgueria'),
  'Melhores pizzarias': (items) => items.filter((r) => r.type === 'Pizzaria'),
  'Melhores para almoço': (items) => items.filter((r) => r.tags.includes('Almoço')),
  'Melhores para jantar': (items) => items.filter((r) => r.tags.includes('Jantar')),
  'Restaurantes em alta': (items) => [...items].sort((a, b) => b.views - a.views).slice(0, 8),
  'Novidades da cidade': (items) => items.slice(-8).reverse()
};

function renderRankings() {
  const names = Object.keys(rankingDefinitions);
  document.getElementById('rankingTabs').innerHTML = names.map((name) => `<button class="chip ${name === currentRanking ? 'active' : ''}" data-ranking="${name}" type="button">${name}</button>`).join('');
  const ranked = rankingDefinitions[currentRanking](restaurants).sort((a, b) => b.score - a.score);
  document.getElementById('rankingGrid').innerHTML = ranked.map((restaurant, index) => `
    <div>
      <span class="badge">#${index + 1}</span>
      ${cardTemplate(restaurant)}
    </div>
  `).join('');
}

function renderFavorites() {
  const renderByIds = (ids) => ids.map(byId).filter(Boolean).map(miniTemplate).join('') || '<p>Nenhum restaurante por aqui ainda.</p>';
  document.getElementById('favoriteList').innerHTML = renderByIds(favorites);
  document.getElementById('recentList').innerHTML = renderByIds(recent);
  document.getElementById('wishList').innerHTML = renderByIds(wishlist);
  document.getElementById('adminPopular').innerHTML = [...restaurants].sort((a,b) => b.views - a.views).slice(0,5).map(miniTemplate).join('');
  document.getElementById('adminReviews').innerHTML = pendingReviews.map((review) => {
    const restaurant = byId(review.restaurantId);
    return `
    <div class="admin-row review-pending">
      <img src="${restaurant.image}" alt="${restaurant.name}">
      <span><strong>${restaurant.name}</strong><small>${review.author} · visita em ${new Date(`${review.visitDate}T12:00:00`).toLocaleDateString('pt-BR')} · nota ${score(review.average)}</small><em>${review.text}</em></span>
      <span class="admin-actions-row"><button class="ghost-button" data-approve-review="${review.id}" type="button">Aprovar</button><button class="ghost-button" data-reject-review="${review.id}" type="button">Rejeitar</button></span>
    </div>
  `;
  }).join('') || restaurants.slice(0,4).map((r) => `
    <div class="admin-row">
      <img src="${r.image}" alt="${r.name}">
      <span><strong>${r.name}</strong><small>Nova avaliação com nota ${score(r.score)}</small></span>
      <span class="admin-actions-row"><button class="ghost-button" type="button">Aprovar</button><button class="ghost-button" type="button">Rejeitar</button></span>
    </div>
  `).join('');
  document.getElementById('ownerDishes').innerHTML = byId(1).dishes.map(([name, img, price]) => `
    <div class="admin-row"><img src="${img}" alt="${name}"><span><strong>${name}</strong><small>${price}</small></span><span class="score">4,8</span></div>
  `).join('');
  document.getElementById('adminCuration').innerHTML = [
    ['Redentora em destaque', restaurants.filter((r) => r.district === 'Vila Redentora').length],
    ['Abertos agora', restaurants.filter((r) => r.open).length],
    ['Bom para casal', restaurants.filter((r) => r.tags.includes('Bom para casal') || r.tags.includes('Romântico')).length]
  ].map(([label, total]) => `<article><strong>${label}</strong><span>${total} restaurantes para curadoria</span></article>`).join('');
}

function applyMoment(moment) {
  document.getElementById('listSearch').value = '';
  document.getElementById('typeFilter').value = '';
  document.getElementById('scoreFilter').value = '0';
  document.getElementById('priceFilter').value = '';
  document.getElementById('districtFilter').value = '';
  document.querySelectorAll('#tagFilters input').forEach((input) => {
    input.checked = input.value === moment;
  });
  if (moment === 'Em alta') {
    document.getElementById('scoreFilter').value = '9';
  }
  renderList();
  setPage('list');
}

function bindEvents() {
  document.addEventListener('click', (event) => {
    const pageButton = event.target.closest('[data-page]');
    const detailButton = event.target.closest('[data-detail]');
    const favoriteButton = event.target.closest('[data-favorite]');
    const categoryButton = event.target.closest('[data-category]');
    const districtButton = event.target.closest('[data-district]');
    const rankingButton = event.target.closest('[data-ranking]');
    const momentButton = event.target.closest('[data-moment]');
    const actionButton = event.target.closest('[data-restaurant-action]');
    const approveButton = event.target.closest('[data-approve-review]');
    const rejectButton = event.target.closest('[data-reject-review]');

    if (pageButton) setPage(pageButton.dataset.page);
    if (detailButton) renderDetails(detailButton.dataset.detail);
    if (actionButton) openRestaurantAction(actionButton.dataset.restaurantAction, actionButton.dataset.action);
    if (favoriteButton) {
      const id = Number(favoriteButton.dataset.favorite);
      favorites = favorites.includes(id) ? favorites.filter((item) => item !== id) : [id, ...favorites];
      renderHome();
      renderList();
      renderRankings();
      renderFavorites();
      showToast(favorites.includes(id) ? 'Restaurante salvo nos favoritos.' : 'Restaurante removido dos favoritos.');
    }
    if (categoryButton) {
      const cat = categoryButton.dataset.category;
      document.getElementById('typeFilter').value = restaurants.some((r) => r.type === cat) ? cat : '';
      document.getElementById('listSearch').value = cat;
      renderList();
      setPage('list');
    }
    if (districtButton) {
      document.getElementById('districtFilter').value = districtButton.dataset.district;
      document.getElementById('listSearch').value = '';
      renderList();
      setPage('list');
    }
    if (rankingButton) {
      currentRanking = rankingButton.dataset.ranking;
      renderRankings();
    }
    if (momentButton) applyMoment(momentButton.dataset.moment);
    if (approveButton) {
      const review = pendingReviews.find((item) => item.id === Number(approveButton.dataset.approveReview));
      const restaurant = review && byId(review.restaurantId);
      if (review && restaurant) {
        restaurant.score = average([restaurant.score, review.average]);
        restaurant.reviews += 1;
        restaurant.comments.unshift({ author: review.author, text: review.text });
        pendingReviews = pendingReviews.filter((item) => item.id !== review.id);
        renderHome();
        renderList();
        renderRankings();
        renderFavorites();
        showToast('Avaliação aprovada e publicada.');
      }
    }
    if (rejectButton) {
      pendingReviews = pendingReviews.filter((item) => item.id !== Number(rejectButton.dataset.rejectReview));
      renderFavorites();
      showToast('Avaliação rejeitada.');
    }
  });

  document.getElementById('menuButton').addEventListener('click', () => document.body.classList.toggle('menu-open'));
  document.getElementById('homeSearchButton').addEventListener('click', () => {
    document.getElementById('listSearch').value = document.getElementById('homeSearch').value;
    renderList();
    setPage('list');
  });
  document.getElementById('homeSearch').addEventListener('keydown', (event) => {
    if (event.key === 'Enter') document.getElementById('homeSearchButton').click();
  });
  ['listSearch', 'typeFilter', 'scoreFilter', 'priceFilter', 'districtFilter'].forEach((id) => {
    document.getElementById(id).addEventListener('input', renderList);
    document.getElementById(id).addEventListener('change', renderList);
  });
  document.getElementById('tagFilters').addEventListener('change', renderList);
  document.getElementById('clearFilters').addEventListener('click', () => {
    document.getElementById('listSearch').value = '';
    document.getElementById('typeFilter').value = '';
    document.getElementById('scoreFilter').value = '0';
    document.getElementById('priceFilter').value = '';
    document.getElementById('districtFilter').value = '';
    document.querySelectorAll('#tagFilters input').forEach((input) => input.checked = false);
    renderList();
  });
  document.getElementById('reviewForm').addEventListener('submit', (event) => {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const restaurant = byId(document.getElementById('reviewRestaurant').value);
    const newNotes = [form.get('food'), form.get('service'), form.get('ambience'), form.get('priceScore'), form.get('experience')].map(Number);
    pendingReviews.unshift({
      id: Date.now(),
      restaurantId: restaurant.id,
      author: form.get('author'),
      visitDate: form.get('visitDate'),
      average: average(newNotes),
      text: form.get('comment') || 'Avaliação enviada pelo app.'
    });
    renderFavorites();
    showToast('Avaliação enviada para aprovação.');
    event.currentTarget.reset();
    const visitDate = document.querySelector('[name="visitDate"]');
    if (visitDate) visitDate.valueAsDate = new Date();
  });
  document.getElementById('ownerForm').addEventListener('submit', (event) => {
    event.preventDefault();
    showToast('Alterações do restaurante salvas.');
  });
}

hydrateIcons();
document.body.dataset.page = 'home';
setupFilters();
renderHome();
renderList();
renderRankings();
renderFavorites();
bindEvents();
