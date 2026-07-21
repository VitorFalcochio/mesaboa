import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY;

export const supabaseReady = Boolean(supabaseUrl && supabaseAnonKey);

export const supabase = supabaseReady
  ? createClient(supabaseUrl, supabaseAnonKey, {
      auth: {
        persistSession: false,
        autoRefreshToken: false,
        detectSessionInUrl: false
      }
    })
  : null;

export const db = supabase;
export const storage = supabase?.storage || null;
export const functions = supabase?.functions || null;

export const roles = {
  USER: 'user',
  OWNER: 'owner',
  ADMIN: 'admin'
};

const RESTAURANT_BUCKET = 'restaurant-media';
const builtInAdminEmails = ['vitorfalcochio@gmail.com', 'felipe.fde08@gmail.com'];
const configuredAdminEmails = [
  ...builtInAdminEmails,
  process.env.EXPO_PUBLIC_ADMIN_EMAIL,
  process.env.EXPO_PUBLIC_ADMIN_EMAILS
].filter(Boolean).join(',');

function cleanData(item) {
  return Object.fromEntries(Object.entries(item || {}).filter(([, value]) => value !== undefined));
}

function normalizeText(value) {
  return String(value || '').normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();
}

function unique(items) {
  return Array.from(new Set(items.filter(Boolean)));
}

function assertSignedIn(user) {
  if (!user?.id) throw new Error('AUTH_REQUIRED');
}

function requireClient() {
  if (!supabase) return null;
  return supabase;
}

function throwIfError(error) {
  if (error) throw error;
}

function nowIso() {
  return new Date().toISOString();
}

function safeId(value, fallback = `${Date.now()}`) {
  return String(value || fallback).trim();
}

function toPriceTier(value) {
  const text = String(value || '$$');
  if (['$', '$$', '$$$', '$$$$'].includes(text)) return text;
  if (/alto|premium|caro/i.test(text)) return '$$$';
  if (/baixo|barato/i.test(text)) return '$';
  return '$$';
}

function toRestaurantStatus(status) {
  const value = String(status || 'published').toLowerCase();
  if (['draft', 'pending', 'published', 'rejected', 'archived', 'paused'].includes(value)) return value;
  return 'pending';
}

function slugify(value) {
  return normalizeText(value)
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 80) || `restaurante-${Date.now()}`;
}

function normalizeRestaurantFromDb(row) {
  const payload = row?.app_payload || {};
  const id = row?.legacy_id || payload.id || row?.id;
  const metrics = payload.metrics || {};
  return {
    ...payload,
    id,
    ownerId: payload.ownerId || row?.owner_legacy_id || row?.owner_id || '',
    name: row?.name || payload.name || '',
    type: payload.type || row?.cuisine_type || '',
    district: row?.district || payload.district || '',
    price: payload.price || row?.price_tier || '$$',
    status: row?.status || payload.status || 'published',
    description: row?.description || payload.description || '',
    address: row?.address || payload.address || '',
    city: row?.city || payload.city || 'Sao Jose do Rio Preto',
    latitude: row?.latitude == null ? payload.latitude : Number(row.latitude),
    longitude: row?.longitude == null ? payload.longitude : Number(row.longitude),
    whatsapp: row?.whatsapp || payload.whatsapp || '',
    phone: row?.phone || payload.phone || '',
    instagram: row?.instagram || payload.instagram || '',
    reservationUrl: row?.reservation_url || payload.reservationUrl || '',
    websiteUrl: row?.website_url || payload.websiteUrl || '',
    image: payload.image || row?.cover_image_url || '',
    coverPhoto: payload.coverPhoto || row?.cover_image_url || '',
    logo: payload.logo || row?.logo_url || '',
    tags: row?.tags || payload.tags || [],
    openingHours: row?.opening_hours || payload.openingHours || {},
    open: row?.is_open ?? payload.open ?? true,
    rating: Number(row?.rating ?? payload.rating ?? 0),
    reviews: Number(row?.reviews_count ?? payload.reviews ?? 0),
    metrics: {
      ...metrics,
      views: row?.views_count ?? metrics.views ?? 0,
      whatsappClicks: row?.whatsapp_clicks_count ?? metrics.whatsappClicks ?? 0,
      mapsClicks: row?.maps_clicks_count ?? metrics.mapsClicks ?? 0
    }
  };
}

function restaurantToDb(item, user = null) {
  const legacyId = safeId(item?.id, slugify(item?.name));
  const status = toRestaurantStatus(item?.status || item?.approval?.status || 'published');
  const metrics = item?.metrics || {};
  return cleanData({
    legacy_id: legacyId,
    owner_legacy_id: item?.ownerId || user?.id || null,
    name: item?.name || 'Restaurante',
    slug: item?.slug || slugify(`${item?.name || 'restaurante'}-${legacyId}`),
    cuisine_type: item?.type || item?.cuisineType || 'Restaurante',
    district: item?.district || 'Rio Preto',
    price_tier: toPriceTier(item?.price || item?.priceTier),
    status,
    description: item?.description || null,
    address: item?.address || null,
    city: item?.city || 'Sao Jose do Rio Preto',
    state: item?.state || 'SP',
    latitude: item?.latitude ?? item?.geocodedAddress?.latitude ?? null,
    longitude: item?.longitude ?? item?.geocodedAddress?.longitude ?? null,
    whatsapp: item?.whatsapp || null,
    phone: item?.phone || null,
    instagram: item?.instagram || null,
    reservation_url: item?.reservationUrl || null,
    website_url: item?.websiteUrl || item?.site || null,
    cover_image_url: item?.coverPhoto || item?.image || null,
    logo_url: item?.logo || null,
    tags: item?.tags || [],
    opening_hours: item?.openingHours || {},
    is_open: item?.open ?? status === 'published',
    rating: Number(item?.rating || 0),
    reviews_count: Number(item?.reviews || 0),
    views_count: Number(metrics.views || 0),
    whatsapp_clicks_count: Number(metrics.whatsappClicks || 0),
    maps_clicks_count: Number(metrics.mapsClicks || 0),
    app_payload: cleanData(item),
    updated_at: nowIso()
  });
}

function normalizeReviewFromDb(row) {
  const payload = row?.app_payload || {};
  return {
    ...payload,
    id: row?.legacy_id || payload.id || row?.id,
    restaurantId: row?.restaurant_legacy_id || payload.restaurantId,
    userId: row?.author_legacy_id || payload.userId || row?.author_id,
    userName: row?.author_name || payload.userName,
    rating: payload.rating || row?.average_score || row?.experience_score || 0,
    comment: row?.comment || payload.comment || '',
    createdAtMs: payload.createdAtMs || (row?.created_at ? new Date(row.created_at).getTime() : 0)
  };
}

function reviewToDb(review, restaurantUuid = null) {
  const rating = Math.max(1, Math.min(5, Number(review?.rating || 5)));
  const score = rating * 2;
  return cleanData({
    legacy_id: safeId(review?.id),
    restaurant_id: restaurantUuid,
    restaurant_legacy_id: safeId(review?.restaurantId),
    author_legacy_id: review?.userId || null,
    author_name: review?.userName || review?.author || null,
    food_score: score,
    service_score: score,
    ambience_score: score,
    price_score: score,
    experience_score: score,
    comment: review?.comment || '',
    status: review?.status || 'approved',
    app_payload: cleanData(review),
    updated_at: nowIso()
  });
}

async function upsertByLegacyId(table, payload) {
  const client = requireClient();
  if (!client) return null;
  const { data, error } = await client.from(table).upsert(payload, { onConflict: 'legacy_id' }).select().maybeSingle();
  throwIfError(error);
  return data;
}

async function insertAppRow(table, payload) {
  const client = requireClient();
  if (!client) return null;
  const { data, error } = await client.from(table).insert(cleanData(payload)).select().maybeSingle();
  throwIfError(error);
  return data;
}

export function isAdminUser(user) {
  const emails = configuredAdminEmails
    .split(',')
    .map((item) => normalizeText(item).trim())
    .filter(Boolean);
  return Boolean(user?.admin || user?.role === roles.ADMIN || emails.includes(normalizeText(user?.email).trim()));
}

export function isRestaurantOwner(user, restaurant) {
  return Boolean(user?.id && restaurant?.ownerId && String(user.id) === String(restaurant.ownerId));
}

export function assertCanManageRestaurant(user, restaurant) {
  assertSignedIn(user);
  if (!isAdminUser(user) && !isRestaurantOwner(user, restaurant)) throw new Error('PERMISSION_DENIED');
}

export function assertCanAdmin(user) {
  assertSignedIn(user);
  if (!isAdminUser(user)) throw new Error('ADMIN_REQUIRED');
}

export function buildSearchTokens(item) {
  const text = [
    item?.name,
    item?.type,
    item?.district,
    item?.city,
    item?.address,
    item?.description,
    ...(item?.tags || []),
    ...(item?.highlights || [])
  ].filter(Boolean).join(' ');
  const words = normalizeText(text)
    .replace(/[^a-z0-9\s]/g, ' ')
    .split(/\s+/)
    .filter((word) => word.length >= 2);
  const prefixes = words.flatMap((word) => {
    const max = Math.min(word.length, 14);
    return Array.from({ length: max - 1 }, (_, index) => word.slice(0, index + 2));
  });
  return unique([...words, ...prefixes]).slice(0, 250);
}

export async function callBackendAction(name, payload = {}) {
  const client = requireClient();
  if (!client) return null;
  const { data, error } = await client.functions.invoke(name, { body: payload });
  throwIfError(error);
  return data;
}

async function uploadLocalUri(uri, path, contentType = 'image/jpeg') {
  const client = requireClient();
  if (!client || !uri || String(uri).startsWith('http')) return uri || '';
  const response = await fetch(uri);
  const blob = await response.blob();
  const { error } = await client.storage.from(RESTAURANT_BUCKET).upload(path, blob, {
    contentType,
    upsert: true
  });
  throwIfError(error);
  const { data } = client.storage.from(RESTAURANT_BUCKET).getPublicUrl(path);
  return data?.publicUrl || uri;
}

export async function uploadImageToStorage(uri, folder, fileName = `${Date.now()}.jpg`) {
  const safeFolder = String(folder || 'uploads').replace(/^\/+|\/+$/g, '');
  const safeName = String(fileName || `${Date.now()}.jpg`).replace(/[^\w.-]/g, '-');
  return uploadLocalUri(uri, `${safeFolder}/${safeName}`);
}

export async function uploadUserProfilePhoto(user, uri) {
  assertSignedIn(user);
  return uploadImageToStorage(uri, `users/${user.id}/profile`, `avatar-${Date.now()}.jpg`);
}

export async function uploadRestaurantAsset(user, restaurantId, kind, uri) {
  assertSignedIn(user);
  const safeKind = String(kind || 'photo').replace(/[^\w.-]/g, '-');
  return uploadImageToStorage(uri, `restaurants/${restaurantId || user.id}/${safeKind}`, `${Date.now()}.jpg`);
}

export async function uploadFeedPhoto(user, uri, index = 0) {
  assertSignedIn(user);
  return uploadImageToStorage(uri, `feed/${user.id}`, `post-${Date.now()}-${index}.jpg`);
}

export async function fetchRestaurantsFromDb() {
  const client = requireClient();
  if (!client) return null;
  const { data, error } = await client
    .from('restaurants')
    .select('*')
    .in('status', ['published'])
    .order('rating', { ascending: false });
  throwIfError(error);
  return (data || []).map(normalizeRestaurantFromDb);
}

export async function fetchOwnerRestaurantsFromDb(ownerId) {
  const client = requireClient();
  if (!client || !ownerId) return null;
  const { data, error } = await client
    .from('restaurants')
    .select('*')
    .eq('owner_legacy_id', String(ownerId))
    .order('updated_at', { ascending: false });
  throwIfError(error);
  return (data || []).map(normalizeRestaurantFromDb);
}

export async function fetchPendingRestaurantsFromDb() {
  const client = requireClient();
  if (!client) return null;
  const { data, error } = await client
    .from('restaurants')
    .select('*')
    .eq('status', 'pending')
    .order('created_at', { ascending: false });
  throwIfError(error);
  return (data || []).map(normalizeRestaurantFromDb);
}

export async function fetchAllRestaurantsFromDb() {
  const client = requireClient();
  if (!client) return null;
  const { data, error } = await client
    .from('restaurants')
    .select('*')
    .order('updated_at', { ascending: false });
  throwIfError(error);
  return (data || []).map(normalizeRestaurantFromDb);
}

export async function seedRestaurantsIfEmpty(items, legacyNames = []) {
  const client = requireClient();
  if (!client) return;
  const { data: existing, error } = await client.from('restaurants').select('legacy_id,name,app_payload').limit(500);
  throwIfError(error);

  const legacyNameSet = new Set(legacyNames.map(normalizeText));
  const hasOnlyLegacySeeds = existing?.length
    && legacyNameSet.size
    && existing.every((item) => legacyNameSet.has(normalizeText(item.name || item.app_payload?.name)));
  if (existing?.length && !hasOnlyLegacySeeds) return;

  if (hasOnlyLegacySeeds) {
    await Promise.all(existing.map((item) => (
      client.from('restaurants').delete().eq('legacy_id', item.legacy_id)
    )));
  }

  const rows = items.map((item) => ({
    ...restaurantToDb({ ...item, status: item.status || 'published', metrics: item.metrics || { views: 0, mapsClicks: 0, whatsappClicks: 0, reservationClicks: 0 } }),
    published_at: nowIso()
  }));
  const { error: upsertError } = await client.from('restaurants').upsert(rows, { onConflict: 'legacy_id' });
  throwIfError(upsertError);
}

export async function saveRestaurantToDb(item) {
  if (!item?.id) return;
  await upsertByLegacyId('restaurants', restaurantToDb(item));
}

export async function createRestaurantInDb(item, user = null) {
  if (user) assertSignedIn(user);
  await upsertByLegacyId('restaurants', {
    ...restaurantToDb({ ...item, status: item?.status || 'pending' }, user),
    submitted_at: nowIso()
  });
}

export async function updateRestaurantInDb(id, updates, user = null, currentRestaurant = null) {
  if (!id) return;
  if (user && currentRestaurant) assertCanManageRestaurant(user, currentRestaurant);
  const merged = { ...(currentRestaurant || {}), ...updates, id };
  await upsertByLegacyId('restaurants', restaurantToDb(merged, user));
}

export async function updateRestaurantStatusInDb(id, status, reviewerId, reviewer = null) {
  if (!id) return;
  if (reviewer) assertCanAdmin(reviewer);
  const client = requireClient();
  if (!client) return;
  const { data: current, error: currentError } = await client.from('restaurants').select('*').eq('legacy_id', String(id)).maybeSingle();
  throwIfError(currentError);
  if (!current) return;
  const nextPayload = {
    ...(current.app_payload || {}),
    status,
    reviewedBy: reviewerId || null,
    reviewedAt: nowIso()
  };
  const { error } = await client
    .from('restaurants')
    .update({
      status: toRestaurantStatus(status),
      reviewed_by_legacy_id: reviewerId || null,
      reviewed_at: nowIso(),
      app_payload: nextPayload,
      updated_at: nowIso()
    })
    .eq('legacy_id', String(id));
  throwIfError(error);
}

export async function claimRestaurantInDb(id, user) {
  if (!id || !user?.id) return;
  const client = requireClient();
  if (!client) return;
  const { data: current, error: currentError } = await client.from('restaurants').select('app_payload').eq('legacy_id', String(id)).maybeSingle();
  throwIfError(currentError);
  const nextPayload = {
    ...(current?.app_payload || {}),
    claim: {
      status: 'pending',
      userId: user.id,
      name: user.name,
      email: user.email,
      requestedAt: nowIso()
    }
  };
  const { error } = await client.from('restaurants').update({ app_payload: nextPayload, updated_at: nowIso() }).eq('legacy_id', String(id));
  throwIfError(error);
}

export async function recordRestaurantMetricInDb(id, metric) {
  const client = requireClient();
  if (!client || !id || !metric) return;
  const columnByMetric = {
    views: 'views_count',
    mapsClicks: 'maps_clicks_count',
    whatsappClicks: 'whatsapp_clicks_count'
  };
  const column = columnByMetric[metric];
  const { data: current, error: currentError } = await client.from('restaurants').select('*').eq('legacy_id', String(id)).maybeSingle();
  throwIfError(currentError);
  if (!current) return;
  const payload = current.app_payload || {};
  const nextMetrics = { ...(payload.metrics || {}), [metric]: Number(payload.metrics?.[metric] || 0) + 1 };
  const update = { app_payload: { ...payload, metrics: nextMetrics }, updated_at: nowIso() };
  if (column) update[column] = Number(current[column] || 0) + 1;
  const { error } = await client.from('restaurants').update(update).eq('legacy_id', String(id));
  throwIfError(error);
}

export async function fetchReviewsFromDb(restaurantId) {
  const client = requireClient();
  if (!client || !restaurantId) return null;
  const { data, error } = await client
    .from('reviews')
    .select('*')
    .eq('restaurant_legacy_id', String(restaurantId))
    .order('created_at', { ascending: false });
  throwIfError(error);
  return (data || []).map(normalizeReviewFromDb)
    .sort((a, b) => Number(b.pinned || false) - Number(a.pinned || false) || Number(b.createdAtMs || 0) - Number(a.createdAtMs || 0));
}

export async function saveReviewToDb(review) {
  if (!review?.id) return;
  const client = requireClient();
  if (!client) return;
  const { data: restaurant, error } = await client
    .from('restaurants')
    .select('id')
    .eq('legacy_id', String(review.restaurantId))
    .maybeSingle();
  throwIfError(error);
  if (!restaurant?.id) throw new Error('RESTAURANT_NOT_FOUND');
  await upsertByLegacyId('reviews', reviewToDb(review, restaurant.id));
}

export async function createFeedPostInDb(post, user) {
  if (!post?.id) return;
  assertSignedIn(user);
  const photos = (post.images || post.photos || []).filter(Boolean).slice(0, 4);
  if (!post.caption || !photos.length) throw new Error('INVALID_POST');
  await upsertByLegacyId('feed_posts', {
    legacy_id: safeId(post.id),
    author_legacy_id: user.id,
    author_email: user.email || '',
    status: post.status || 'published',
    app_payload: cleanData({ ...post, images: photos, image: post.image || photos[0] }),
    updated_at: nowIso()
  });
}

export async function addFeedCommentToDb(postId, comment, user) {
  if (!postId || !comment?.id) return;
  assertSignedIn(user);
  await upsertByLegacyId('feed_comments', {
    legacy_id: safeId(comment.id),
    post_legacy_id: String(postId),
    author_legacy_id: user.id,
    author_name: user.name || comment.author || '',
    status: 'published',
    app_payload: cleanData(comment),
    updated_at: nowIso()
  });
}

export async function setFeedReactionInDb(postId, reaction, active, user) {
  if (!postId || !reaction) return;
  assertSignedIn(user);
  const reactionId = `${postId}_${user.id}_${reaction}`;
  await upsertByLegacyId('feed_reactions', {
    legacy_id: reactionId,
    post_legacy_id: String(postId),
    user_legacy_id: user.id,
    reaction,
    active: Boolean(active),
    updated_at: nowIso()
  });
}

export async function reportContentInDb(report, user) {
  if (!report?.targetId || !report?.targetType) return;
  assertSignedIn(user);
  const id = report.id || `${report.targetType}-${report.targetId}-${user.id}-${Date.now()}`;
  await upsertByLegacyId('moderation_reports', {
    legacy_id: id,
    target_type: report.targetType,
    target_legacy_id: String(report.targetId),
    reporter_legacy_id: user.id,
    reporter_email: user.email || '',
    status: 'open',
    app_payload: cleanData(report),
    updated_at: nowIso()
  });
}

export async function updateModerationStatusInDb(reportId, updates, adminUser) {
  if (!reportId) return;
  assertCanAdmin(adminUser);
  await upsertByLegacyId('moderation_reports', {
    legacy_id: String(reportId),
    reviewed_by_legacy_id: adminUser.id,
    reviewed_at: nowIso(),
    status: updates?.status || 'reviewed',
    app_payload: cleanData(updates),
    updated_at: nowIso()
  });
}

export async function blockAccountInDb(user, blockedUserId, note = '') {
  if (!blockedUserId) return;
  assertSignedIn(user);
  await upsertByLegacyId('user_blocks', {
    legacy_id: `${user.id}_${blockedUserId}`,
    user_legacy_id: user.id,
    blocked_user_legacy_id: String(blockedUserId),
    note,
    created_at: nowIso()
  });
}

export async function createInviteLinkInDb(user) {
  assertSignedIn(user);
  const code = normalizeText(`${user.name || 'dine'}-${user.id}`).replace(/[^a-z0-9]/g, '').slice(0, 16) || String(user.id);
  const id = `${user.id}_${code}`;
  const link = `https://dine.app/invite/${code}`;
  await upsertByLegacyId('invites', {
    legacy_id: id,
    code,
    link,
    owner_legacy_id: user.id,
    owner_email: user.email || '',
    uses: 0,
    status: 'active',
    updated_at: nowIso()
  });
  return { id, code, link };
}

export async function redeemInviteInDb(code, user) {
  const client = requireClient();
  if (!client || !code) return;
  assertSignedIn(user);
  const normalizedCode = normalizeText(code).replace(/[^a-z0-9]/g, '');
  const { data: invite, error } = await client.from('invites').select('*').eq('code', normalizedCode).limit(1).maybeSingle();
  throwIfError(error);
  if (!invite) throw new Error('INVITE_NOT_FOUND');
  await insertAppRow('invite_redemptions', {
    invite_legacy_id: invite.legacy_id,
    code: normalizedCode,
    invited_user_legacy_id: user.id,
    invited_user_email: user.email || ''
  });
  await client.from('invites').update({ uses: Number(invite.uses || 0) + 1, updated_at: nowIso() }).eq('legacy_id', invite.legacy_id);
}

export async function registerPushTokenInDb(user, token, device = {}) {
  if (!token) return;
  assertSignedIn(user);
  await upsertByLegacyId('push_tokens', {
    legacy_id: `${user.id}_${String(token).replace(/[^\w-]/g, '_')}`,
    user_legacy_id: user.id,
    token,
    platform: device.platform || '',
    device_name: device.name || '',
    enabled: true,
    updated_at: nowIso()
  });
}

export async function queuePushNotificationInDb(notification) {
  if (!notification?.userId) return;
  const id = notification.id || `${notification.userId}_${Date.now()}`;
  await upsertByLegacyId('notification_queue', {
    legacy_id: id,
    user_legacy_id: notification.userId,
    status: 'queued',
    app_payload: cleanData(notification),
    updated_at: nowIso()
  });
}

export async function searchRestaurantsInDb({ term = '', city = '', category = '', take = 30 } = {}) {
  const client = requireClient();
  if (!client) return null;
  const { data, error } = await client
    .from('restaurants')
    .select('*')
    .eq('status', 'published')
    .order('rating', { ascending: false })
    .limit(Math.min(Number(take) || 30, 50));
  throwIfError(error);
  const normalizedTerm = normalizeText(term);
  const normalizedCity = normalizeText(city);
  const normalizedCategory = normalizeText(category);
  return (data || [])
    .map(normalizeRestaurantFromDb)
    .filter((item) => {
      const haystack = normalizeText([
        item.name,
        item.type,
        item.district,
        item.city,
        item.address,
        item.description,
        ...(item.tags || []),
        ...(item.highlights || [])
      ].join(' '));
      return (!normalizedTerm || haystack.includes(normalizedTerm))
        && (!normalizedCity || haystack.includes(normalizedCity))
        && (!normalizedCategory || haystack.includes(normalizedCategory));
    });
}

export async function updateReviewInDb(id, updates) {
  const client = requireClient();
  if (!client || !id) return;
  const { data: current, error: currentError } = await client.from('reviews').select('app_payload').eq('legacy_id', String(id)).maybeSingle();
  throwIfError(currentError);
  const nextPayload = { ...(current?.app_payload || {}), ...updates };
  const { error } = await client.from('reviews').update({ app_payload: nextPayload, updated_at: nowIso() }).eq('legacy_id', String(id));
  throwIfError(error);
}

export async function fetchFavoritesFromDb(userId) {
  const client = requireClient();
  if (!client || !userId) return null;
  const { data, error } = await client.from('app_favorites').select('items').eq('user_legacy_id', String(userId)).maybeSingle();
  throwIfError(error);
  return data?.items || [];
}

export async function saveFavoritesToDb(userId, items) {
  if (!userId) return;
  await upsertByLegacyId('app_favorites', {
    legacy_id: String(userId),
    user_legacy_id: String(userId),
    items: items || [],
    updated_at: nowIso()
  });
}

export async function saveUserProfileToDb(user) {
  if (!user?.id) return;
  await upsertByLegacyId('app_profiles', {
    legacy_id: String(user.id),
    full_name: user.name,
    email: user.email,
    instagram: user.instagram || '',
    photo_url: user.photo || '',
    bio: user.bio || '',
    location: user.location || '',
    preferences: user.preferences || [],
    gamification: user.gamification || null,
    app_payload: cleanData(user),
    updated_at: nowIso()
  });
}
