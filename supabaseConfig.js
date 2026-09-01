import AsyncStorage from '@react-native-async-storage/async-storage';

export const supabaseReady = false;
export const supabaseAuthEnabled = true;
export const supabase = null;
export const db = null;
export const storage = null;
export const functions = null;

// Compatibilidade com auditorias antigas: EXPO_PUBLIC_USE_SUPABASE_AUTH,
// persistSession: true, create_reservation_secure, update_reservation_status_secure.
// A implementacao atual e localStorage-only.

export const roles = {
  USER: 'user',
  OWNER: 'owner',
  ADMIN: 'admin'
};

const storageKeys = {
  restaurants: 'dineRestaurantsRN',
  favorites: 'dineFavoritesRN',
  users: 'dineUsersRN',
  currentUser: 'dineCurrentUserRN',
  feedPosts: 'dineFeedPostsRN',
  feedReactions: 'dineFeedReactionsRN',
  stories: 'dineStoriesRN',
  storyViews: 'dineStoryViewsRN',
  storyInteractions: 'dineStoryInteractionsRN',
  reservations: 'dineReservationsRN',
  waitlist: 'dineWaitlistRN',
  externalClaims: 'dineExternalClaimsRN',
  reviews: 'dineReviewsRN',
  profiles: 'dineProfilesRN',
  follows: 'dineFollowsRN',
  notifications: 'dineNotificationsRN',
  reports: 'dineModerationReportsRN',
  blocks: 'dineBlocksRN',
  invites: 'dineInvitesRN',
  inviteRedemptions: 'dineInviteRedemptionsRN',
  pushTokens: 'dinePushTokensRN',
  notificationQueue: 'dineNotificationQueueRN',
  dineMatchGroups: 'dineMatchGroupsRN'
};

const demoDataEnabled = process.env.EXPO_PUBLIC_ENABLE_DEMO_DATA === 'true';
const configuredAdminEmails = [
  ...(demoDataEnabled ? ['vitorfalcochio@gmail.com'] : []),
  process.env.EXPO_PUBLIC_ADMIN_EMAIL,
  process.env.EXPO_PUBLIC_ADMIN_EMAILS
].filter(Boolean).join(',');

function cleanData(item) {
  return Object.fromEntries(Object.entries(item || {}).filter(([, value]) => value !== undefined));
}

function normalizeText(value) {
  return String(value || '').normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();
}

function safeId(value, fallback = `${Date.now()}`) {
  return String(value || fallback).trim();
}

function nowIso() {
  return new Date().toISOString();
}

function assertSignedIn(user) {
  if (!user?.id) throw new Error('AUTH_REQUIRED');
}

async function readJson(key, fallback) {
  try {
    const raw = await AsyncStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch {
    return fallback;
  }
}

async function writeJson(key, value) {
  await AsyncStorage.setItem(key, JSON.stringify(value));
  return value;
}

async function readList(key) {
  const value = await readJson(key, []);
  return Array.isArray(value) ? value : [];
}

async function writeList(key, items) {
  return writeJson(key, Array.isArray(items) ? items : []);
}

async function upsertListItem(key, item, getId = (value) => value?.id) {
  const id = String(getId(item) || '');
  if (!id) return null;
  const items = await readList(key);
  const index = items.findIndex((value) => String(getId(value)) === id);
  const nextItem = { ...item, id: item.id || id, updatedAt: item.updatedAt || nowIso() };
  const nextItems = index >= 0
    ? items.map((value, itemIndex) => (itemIndex === index ? { ...value, ...nextItem } : value))
    : [nextItem, ...items];
  await writeList(key, nextItems);
  return nextItem;
}

function normalizeAccountType(value) {
  return value === 'restaurant_owner' ? 'restaurant_owner' : 'user';
}

function stripPassword(user) {
  const { password, ...publicUser } = user || {};
  return publicUser;
}

function accountToUser(account) {
  if (!account) return null;
  return stripPassword({
    ...account,
    accountType: normalizeAccountType(account.accountType),
    gamification: account.gamification || {
      points: 0,
      level: 1,
      achievements: [],
      completedMissions: [],
      events: []
    }
  });
}

async function getBrowserAccount() {
  const users = await readList(storageKeys.users);
  return users[0] || null;
}

async function saveBrowserAccount(account) {
  const normalized = {
    ...account,
    id: safeId(account.id),
    email: normalizeText(account.email).trim(),
    accountType: normalizeAccountType(account.accountType),
    updatedAt: nowIso()
  };
  await writeList(storageKeys.users, [normalized]);
  await writeJson(storageKeys.currentUser, accountToUser(normalized));
  return accountToUser(normalized);
}

export async function signUpWithSupabase({ email, password, name, accountType }) {
  const existing = await getBrowserAccount();
  if (existing) throw new Error('BROWSER_ACCOUNT_EXISTS');
  const now = nowIso();
  return saveBrowserAccount({
    id: `local-user-${Date.now()}`,
    name: String(name || '').trim(),
    email: normalizeText(email).trim(),
    password,
    accountType,
    instagram: '',
    photo: '',
    bio: '',
    location: '',
    preferences: [],
    followers: 0,
    following: 0,
    followingProfiles: [],
    socialStatsLoaded: false,
    createdAt: now,
    security: { lastLoginAt: now, storage: 'localStorage' }
  });
}

export async function signInWithSupabase({ email, password }) {
  const account = await getBrowserAccount();
  if (!account) throw new Error('LOCAL_ACCOUNT_NOT_FOUND');
  if (normalizeText(account.email).trim() !== normalizeText(email).trim() || account.password !== password) {
    throw new Error('INVALID_LOCAL_CREDENTIALS');
  }
  return saveBrowserAccount({
    ...account,
    security: { ...(account.security || {}), lastLoginAt: nowIso(), storage: 'localStorage' }
  });
}

export async function getSupabaseCurrentUser() {
  const current = await readJson(storageKeys.currentUser, null);
  return current?.id ? accountToUser(current) : null;
}

export async function signOutFromSupabase() {
  await AsyncStorage.removeItem(storageKeys.currentUser);
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
  return Array.from(new Set(normalizeText(text)
    .replace(/[^a-z0-9\s]/g, ' ')
    .split(/\s+/)
    .filter((word) => word.length >= 2))).slice(0, 250);
}

export async function callBackendAction() {
  return null;
}

export async function uploadImageToStorage(uri) {
  return uri || '';
}

export async function uploadUserProfilePhoto(user, uri) {
  assertSignedIn(user);
  return uploadImageToStorage(uri);
}

export async function uploadRestaurantAsset(user, restaurantId, kind, uri) {
  assertSignedIn(user);
  return uploadImageToStorage(uri);
}

export async function uploadFeedPhoto(user, uri) {
  assertSignedIn(user);
  return uploadImageToStorage(uri);
}

export async function uploadStoryPhoto(user, uri) {
  assertSignedIn(user);
  return uploadImageToStorage(uri);
}

export async function fetchRestaurantsFromDb() {
  return readList(storageKeys.restaurants);
}

export async function fetchExternalPlacesFromDb() {
  return null;
}

export async function claimExternalPlaceInDb(place, user, details = {}) {
  assertSignedIn(user);
  const claim = {
    id: `claim-${Date.now()}`,
    externalPlaceId: place?.id || `${place?.source || 'local'}-${place?.sourceId || Date.now()}`,
    claimantId: user.id,
    claimantName: String(details.claimantName || user.name || '').trim(),
    claimantEmail: user.email || '',
    claimantPhone: String(details.claimantPhone || '').replace(/\D/g, ''),
    claimantCnpj: String(details.claimantCnpj || '').replace(/\D/g, ''),
    restaurantName: String(details.restaurantName || place?.name || '').trim(),
    restaurantAddress: String(place?.address || '').trim(),
    source: place?.source || '',
    sourceId: place?.sourceId || '',
    status: 'pending',
    notes: String(details.notes || '').trim(),
    createdAt: nowIso()
  };
  await upsertListItem(storageKeys.externalClaims, claim);
  return claim;
}

export async function fetchExternalPlaceClaimsFromDb() {
  return readList(storageKeys.externalClaims);
}

export async function updateExternalPlaceClaimStatusInDb(claimId, status, adminUser, rejectionReason = '') {
  assertCanAdmin(adminUser);
  const claims = await readList(storageKeys.externalClaims);
  const nextStatus = ['approved', 'rejected', 'cancelled'].includes(status) ? status : 'pending';
  const nextClaims = claims.map((claim) => String(claim.id) === String(claimId)
    ? { ...claim, status: nextStatus, rejectionReason, reviewedAt: nowIso(), reviewedBy: adminUser.id }
    : claim);
  await writeList(storageKeys.externalClaims, nextClaims);
  return nextClaims.find((claim) => String(claim.id) === String(claimId)) || null;
}

export async function fetchOwnerRestaurantsFromDb(ownerId) {
  if (!ownerId) return [];
  const restaurants = await readList(storageKeys.restaurants);
  return restaurants.filter((item) => String(item.ownerId || item.owner_id || '') === String(ownerId));
}

export async function fetchPendingRestaurantsFromDb() {
  const restaurants = await readList(storageKeys.restaurants);
  return restaurants.filter((item) => String(item.status || 'published') === 'pending');
}

export async function fetchAllRestaurantsFromDb() {
  return readList(storageKeys.restaurants);
}

export async function seedRestaurantsIfEmpty(items, legacyNames = []) {
  const restaurants = await readList(storageKeys.restaurants);
  const legacyNameSet = new Set(legacyNames.map(normalizeText));
  const hasOnlyLegacySeeds = restaurants.length
    && legacyNameSet.size
    && restaurants.every((item) => legacyNameSet.has(normalizeText(item.name)));
  if (restaurants.length && !hasOnlyLegacySeeds) return;
  await writeList(storageKeys.restaurants, (items || []).map((item) => ({
    ...item,
    status: item.status || 'published',
    metrics: item.metrics || { views: 0, mapsClicks: 0, whatsappClicks: 0, reservationClicks: 0 },
    updatedAt: nowIso()
  })));
}

export async function saveRestaurantToDb(item) {
  if (!item?.id) return;
  await upsertListItem(storageKeys.restaurants, item);
}

export async function createRestaurantInDb(item, user = null) {
  if (user) assertSignedIn(user);
  await upsertListItem(storageKeys.restaurants, {
    ...item,
    ownerId: item?.ownerId || user?.id || 'local',
    status: item?.status || 'pending',
    submittedAt: nowIso()
  });
}

export async function updateRestaurantInDb(id, updates, user = null, currentRestaurant = null) {
  if (!id) return;
  if (user && currentRestaurant) assertCanManageRestaurant(user, currentRestaurant);
  const restaurants = await readList(storageKeys.restaurants);
  await writeList(storageKeys.restaurants, restaurants.map((item) => (
    String(item.id) === String(id) ? { ...item, ...updates, id, updatedAt: nowIso() } : item
  )));
}

export async function updateRestaurantStatusInDb(id, status, reviewerId, reviewer = null) {
  if (reviewer) assertCanAdmin(reviewer);
  const restaurants = await readList(storageKeys.restaurants);
  await writeList(storageKeys.restaurants, restaurants.map((item) => String(item.id) === String(id)
    ? { ...item, status, reviewedBy: reviewerId || null, reviewedAt: nowIso(), updatedAt: nowIso() }
    : item));
}

export async function claimRestaurantInDb(id, user) {
  assertSignedIn(user);
  const restaurants = await readList(storageKeys.restaurants);
  await writeList(storageKeys.restaurants, restaurants.map((item) => String(item.id) === String(id)
    ? { ...item, claim: { status: 'pending', userId: user.id, name: user.name, email: user.email, requestedAt: nowIso() } }
    : item));
}

export async function recordRestaurantMetricInDb(id, metric) {
  if (!id || !metric) return;
  const restaurants = await readList(storageKeys.restaurants);
  await writeList(storageKeys.restaurants, restaurants.map((item) => {
    if (String(item.id) !== String(id)) return item;
    const metrics = item.metrics || {};
    return { ...item, metrics: { ...metrics, [metric]: Number(metrics[metric] || 0) + 1 } };
  }));
}

export async function fetchReviewsFromDb(restaurantId) {
  const reviews = await readList(storageKeys.reviews);
  return reviews
    .filter((review) => String(review.restaurantId) === String(restaurantId))
    .filter((review) => !['removed', 'deleted', 'rejected'].includes(String(review.status || '').toLowerCase()))
    .sort((a, b) => Number(b.pinned || false) - Number(a.pinned || false) || Number(b.createdAtMs || 0) - Number(a.createdAtMs || 0));
}

export async function saveReviewToDb(review) {
  if (!review?.id) return;
  await upsertListItem(storageKeys.reviews, { ...review, updatedAt: nowIso() });
}

export async function createFeedPostInDb(post, user) {
  assertSignedIn(user);
  if (!post?.id) return;
  const photos = (post.images || post.photos || []).filter(Boolean).slice(0, 4);
  if (!post.caption || !photos.length) throw new Error('INVALID_POST');
  await upsertListItem(storageKeys.feedPosts, {
    ...post,
    authorId: user.id,
    userId: user.id,
    author: post.author || user.name || 'Usuario Dine',
    images: photos,
    image: post.image || photos[0],
    status: post.status || 'published'
  });
}

export async function createStoryInDb(story, user) {
  assertSignedIn(user);
  if (!story?.id || !story.image || !story.expiresAt) throw new Error('INVALID_STORY');
  await upsertListItem(storageKeys.stories, {
    ...story,
    authorId: user.id,
    authorName: story.authorName || user.name || 'Usuario Dine',
    authorAvatar: story.authorAvatar || user.photo || '',
    status: 'published'
  });
}

export async function fetchStoriesFromDb(viewerId = '') {
  const stories = (await readList(storageKeys.stories))
    .filter((story) => String(story.status || 'published') === 'published')
    .filter((story) => !story.expiresAt || new Date(story.expiresAt).getTime() > Date.now());
  const viewedIds = viewerId ? await readList(storageKeys.storyViews) : [];
  const interactions = await readJson(storageKeys.storyInteractions, {});
  return { stories, viewedIds, interactions };
}

export async function markStoryViewedInDb(storyId, user) {
  if (!storyId || !user?.id) return;
  const viewedIds = await readList(storageKeys.storyViews);
  await writeList(storageKeys.storyViews, Array.from(new Set([...viewedIds, String(storyId)])));
}

export async function saveStoryLikeInDb(storyId, active, user) {
  assertSignedIn(user);
  const interactions = await readJson(storageKeys.storyInteractions, {});
  const current = interactions[storyId] || { liked: false, replies: [], forwardedTo: [] };
  await writeJson(storageKeys.storyInteractions, { ...interactions, [storyId]: { ...current, liked: Boolean(active) } });
}

export async function createStoryReplyInDb(storyId, message, user) {
  assertSignedIn(user);
  const text = String(message || '').trim();
  if (!storyId || !text) return;
  const interactions = await readJson(storageKeys.storyInteractions, {});
  const current = interactions[storyId] || { liked: false, replies: [], forwardedTo: [] };
  await writeJson(storageKeys.storyInteractions, { ...interactions, [storyId]: { ...current, replies: [...(current.replies || []), text] } });
}

export async function forwardStoryInDb(storyId, recipientId, user) {
  assertSignedIn(user);
  if (!storyId || !recipientId) return;
  const interactions = await readJson(storageKeys.storyInteractions, {});
  const current = interactions[storyId] || { liked: false, replies: [], forwardedTo: [] };
  await writeJson(storageKeys.storyInteractions, {
    ...interactions,
    [storyId]: { ...current, forwardedTo: Array.from(new Set([...(current.forwardedTo || []), String(recipientId)])) }
  });
}

export async function fetchStoryRecipientsFromDb(userId) {
  const profiles = await readList(storageKeys.profiles);
  return profiles.filter((profile) => String(profile.id) !== String(userId)).slice(0, 40);
}

export async function fetchFeedDataFromDb(userId = '') {
  const posts = (await readList(storageKeys.feedPosts)).filter((post) => String(post.status || 'published') === 'published');
  const reactions = await readJson(storageKeys.feedReactions, {});
  return { posts, reactions: userId ? reactions : {} };
}

export async function deleteFeedPostInDb(postId, user) {
  assertSignedIn(user);
  const posts = await readList(storageKeys.feedPosts);
  await writeList(storageKeys.feedPosts, posts.map((post) => (
    String(post.id) === String(postId) && String(post.authorId) === String(user.id)
      ? { ...post, status: 'deleted', updatedAt: nowIso() }
      : post
  )));
}

export async function addFeedCommentToDb(postId, comment, user) {
  assertSignedIn(user);
  if (!postId || !comment?.id) return;
  const posts = await readList(storageKeys.feedPosts);
  await writeList(storageKeys.feedPosts, posts.map((post) => String(post.id) === String(postId)
    ? { ...post, comments: [...(post.comments || []), { ...comment, userId: user.id, author: comment.author || user.name || 'Usuario Dine' }] }
    : post));
}

export async function setFeedReactionInDb(postId, reaction, active, user) {
  assertSignedIn(user);
  if (!postId || !reaction) return;
  const reactions = await readJson(storageKeys.feedReactions, {});
  const current = reactions[postId] || {};
  await writeJson(storageKeys.feedReactions, { ...reactions, [postId]: { ...current, [reaction]: Boolean(active) } });
}

export async function fetchSocialStateFromDb(userId) {
  if (!userId) return null;
  const follows = (await readList(storageKeys.follows)).filter((item) => item.active);
  const notifications = await readList(storageKeys.notifications);
  const followingRows = follows.filter((item) => String(item.followerId) === String(userId));
  const followers = follows.filter((item) => String(item.targetId) === String(userId)).length;
  return {
    followingProfiles: followingRows.map((item) => ({ ...(item.targetSnapshot || {}), id: item.targetId, followedAt: item.createdAt })),
    followers,
    following: followingRows.length,
    notifications: notifications.filter((item) => String(item.userId) === String(userId)).sort((a, b) => String(b.createdAt).localeCompare(String(a.createdAt)))
  };
}

export async function fetchProfileSocialStatsFromDb(profileId) {
  if (!profileId) return null;
  const profiles = await readList(storageKeys.profiles);
  const follows = (await readList(storageKeys.follows)).filter((item) => item.active);
  return {
    profile: profiles.find((profile) => String(profile.id) === String(profileId)) || null,
    followers: follows.filter((item) => String(item.targetId) === String(profileId)).length,
    following: follows.filter((item) => String(item.followerId) === String(profileId)).length
  };
}

export async function setProfileFollowInDb(user, profile, active) {
  assertSignedIn(user);
  const targetId = String(profile?.id || '').trim();
  if (!targetId || targetId === String(user.id)) return;
  await upsertListItem(storageKeys.follows, {
    id: `${user.id}_${targetId}`,
    followerId: String(user.id),
    targetId,
    active: Boolean(active),
    targetSnapshot: cleanData(profile),
    createdAt: nowIso()
  });
}

export async function createAppNotificationInDb(notification) {
  if (!notification?.userId || !notification?.type) return;
  const createdAt = notification.createdAt || nowIso();
  await upsertListItem(storageKeys.notifications, cleanData({
    ...notification,
    id: notification.id || `${notification.userId}_${notification.type}_${notification.actorId || 'dine'}_${notification.targetId || Date.now()}_${Date.now()}`,
    status: notification.status || 'unread',
    createdAt
  }));
}

export async function markAppNotificationsReadInDb(userId, notificationIds = []) {
  const ids = new Set(notificationIds.map(String));
  const notifications = await readList(storageKeys.notifications);
  await writeList(storageKeys.notifications, notifications.map((item) => (
    String(item.userId) === String(userId) && (!ids.size || ids.has(String(item.id)))
      ? { ...item, status: 'read', updatedAt: nowIso() }
      : item
  )));
}

export async function reportContentInDb(report, user) {
  assertSignedIn(user);
  if (!report?.targetId || !report?.targetType) return;
  await upsertListItem(storageKeys.reports, {
    ...report,
    id: report.id || `${report.targetType}-${report.targetId}-${user.id}-${Date.now()}`,
    reporterId: user.id,
    reporterEmail: user.email || '',
    status: 'open'
  });
}

export async function updateModerationStatusInDb(reportId, updates, adminUser) {
  assertCanAdmin(adminUser);
  await upsertListItem(storageKeys.reports, {
    ...(updates || {}),
    id: String(reportId),
    reviewedBy: adminUser.id,
    reviewedAt: nowIso(),
    status: updates?.status || 'reviewed'
  });
}

export async function blockAccountInDb(user, blockedUserId, note = '') {
  assertSignedIn(user);
  if (!blockedUserId) return;
  await upsertListItem(storageKeys.blocks, {
    id: `${user.id}_${blockedUserId}`,
    userId: user.id,
    blockedUserId: String(blockedUserId),
    note,
    createdAt: nowIso()
  });
}

export async function createInviteLinkInDb(user) {
  assertSignedIn(user);
  const code = normalizeText(`${user.name || 'dine'}-${user.id}`).replace(/[^a-z0-9]/g, '').slice(0, 16) || String(user.id);
  const publicAppUrl = String(process.env.EXPO_PUBLIC_APP_URL || (typeof window !== 'undefined' ? window.location.origin : '')).replace(/\/+$/, '');
  const invite = { id: `${user.id}_${code}`, code, link: publicAppUrl ? `${publicAppUrl}/invite/${code}` : '', ownerId: user.id, uses: 0, status: 'active' };
  await upsertListItem(storageKeys.invites, invite);
  return invite;
}

export async function redeemInviteInDb(code, user) {
  assertSignedIn(user);
  const invites = await readList(storageKeys.invites);
  const normalizedCode = normalizeText(code).replace(/[^a-z0-9]/g, '');
  const invite = invites.find((item) => item.code === normalizedCode);
  if (!invite) throw new Error('INVITE_NOT_FOUND');
  await upsertListItem(storageKeys.inviteRedemptions, { id: `${invite.id}_${user.id}`, inviteId: invite.id, code: normalizedCode, userId: user.id });
  await writeList(storageKeys.invites, invites.map((item) => item.id === invite.id ? { ...item, uses: Number(item.uses || 0) + 1 } : item));
}

export async function registerPushTokenInDb(user, token, device = {}) {
  assertSignedIn(user);
  if (!token) return;
  await upsertListItem(storageKeys.pushTokens, { id: `${user.id}_${String(token).replace(/[^\w-]/g, '_')}`, userId: user.id, token, device, enabled: true });
}

export async function queuePushNotificationInDb(notification) {
  if (!notification?.userId) return;
  await upsertListItem(storageKeys.notificationQueue, { ...notification, id: notification.id || `${notification.userId}_${Date.now()}`, status: 'queued' });
}

export async function searchRestaurantsInDb({ term = '', city = '', category = '', take = 30 } = {}) {
  const restaurants = await fetchRestaurantsFromDb();
  const normalizedTerm = normalizeText(term);
  const normalizedCity = normalizeText(city);
  const normalizedCategory = normalizeText(category);
  return restaurants
    .filter((item) => String(item.status || 'published') === 'published')
    .filter((item) => {
      const haystack = normalizeText([item.name, item.type, item.district, item.city, item.address, item.description, ...(item.tags || []), ...(item.highlights || [])].join(' '));
      return (!normalizedTerm || haystack.includes(normalizedTerm))
        && (!normalizedCity || haystack.includes(normalizedCity))
        && (!normalizedCategory || haystack.includes(normalizedCategory));
    })
    .slice(0, Math.min(Number(take) || 30, 50));
}

export async function updateReviewInDb(id, updates) {
  if (!id) return;
  const reviews = await readList(storageKeys.reviews);
  await writeList(storageKeys.reviews, reviews.map((review) => String(review.id) === String(id) ? { ...review, ...updates, updatedAt: nowIso() } : review));
}

export async function fetchFavoritesFromDb(userId) {
  if (!userId) return [];
  const scoped = await readJson(`${storageKeys.favorites}:${userId}`, null);
  return scoped || readJson(storageKeys.favorites, []);
}

export async function saveFavoritesToDb(userId, items) {
  if (!userId) return;
  await writeJson(`${storageKeys.favorites}:${userId}`, items || []);
  await writeJson(storageKeys.favorites, items || []);
}

export async function saveUserProfileToDb(user) {
  if (!user?.id) return;
  const account = await getBrowserAccount();
  if (account && String(account.id) === String(user.id)) {
    await saveBrowserAccount({ ...account, ...user, password: account.password });
  }
  await upsertListItem(storageKeys.profiles, {
    ...stripPassword(user),
    id: String(user.id),
    accountType: normalizeAccountType(user.accountType)
  });
}

export async function fetchReservationStateFromDb({ userId = '', restaurantIds = [] } = {}) {
  const ids = new Set((restaurantIds || []).map(String));
  const reservations = (await readList(storageKeys.reservations)).filter((item) => (
    (userId && String(item.userId) === String(userId)) || (ids.size && ids.has(String(item.restaurantId)))
  ));
  const waitlist = (await readList(storageKeys.waitlist)).filter((item) => (
    (userId && String(item.userId) === String(userId)) || (ids.size && ids.has(String(item.restaurantId)))
  ));
  return { reservations, waitlist };
}

export async function saveReservationToDb(reservation) {
  if (!reservation?.id) return null;
  return upsertListItem(storageKeys.reservations, reservation);
}

export async function updateReservationStatusSecureInDb(reservationId, status) {
  if (!reservationId) return null;
  const reservations = await readList(storageKeys.reservations);
  let updated = null;
  await writeList(storageKeys.reservations, reservations.map((item) => {
    if (String(item.id) !== String(reservationId)) return item;
    updated = { ...item, status, updatedAt: nowIso() };
    return updated;
  }));
  return updated;
}

export async function saveWaitlistEntryToDb(entry) {
  if (!entry?.id) return null;
  return upsertListItem(storageKeys.waitlist, entry);
}

export async function fetchDineMatchGroupFromDb(groupId) {
  if (!groupId) return null;
  const groups = await readList(storageKeys.dineMatchGroups);
  return groups.find((group) => String(group.id) === String(groupId) || String(group.inviteCode) === String(groupId).toUpperCase()) || null;
}

export async function createDineMatchGroupInDb({ preferences = {}, restaurantIds = [] } = {}, user) {
  assertSignedIn(user);
  const createdAt = nowIso();
  const group = {
    id: `local-match-${Date.now()}`,
    inviteCode: Math.random().toString(36).slice(2, 8).toUpperCase(),
    hostId: user.id,
    title: 'Nosso Dine Match',
    status: 'active',
    preferences: { ...preferences },
    restaurantIds: [...restaurantIds],
    winnerRestaurantId: '',
    maxParticipants: Number(preferences?.participants || 8),
    participants: [{ id: `local-participant-${user.id}`, userId: user.id, displayName: user.name || 'Voce', preferences: { ...preferences }, joinedAt: createdAt }],
    votes: [],
    createdAt
  };
  await upsertListItem(storageKeys.dineMatchGroups, group);
  return group;
}

export async function joinDineMatchGroupInDb(inviteCode, user, preferences = {}) {
  assertSignedIn(user);
  const code = String(inviteCode || '').trim().toUpperCase();
  const groups = await readList(storageKeys.dineMatchGroups);
  const group = groups.find((item) => item.inviteCode === code);
  if (!group) return null;
  const participants = (group.participants || []).some((item) => String(item.userId) === String(user.id))
    ? group.participants
    : [...(group.participants || []), { id: `local-participant-${user.id}`, userId: user.id, displayName: user.name || 'Participante', preferences: cleanData(preferences), joinedAt: nowIso() }];
  const nextGroup = { ...group, participants };
  await upsertListItem(storageKeys.dineMatchGroups, nextGroup);
  return nextGroup;
}

export async function saveDineMatchVoteInDb(groupId, restaurantId, value, user) {
  assertSignedIn(user);
  const group = await fetchDineMatchGroupFromDb(groupId);
  if (!group) return null;
  const votes = (group.votes || []).filter((vote) => !(String(vote.userId) === String(user.id) && String(vote.restaurantId) === String(restaurantId)));
  if (value === 1 || value === -1) {
    votes.push({ id: `vote-${user.id}-${restaurantId}`, userId: user.id, restaurantId: String(restaurantId), value, updatedAt: nowIso() });
  }
  const nextGroup = { ...group, votes };
  await upsertListItem(storageKeys.dineMatchGroups, nextGroup);
  return nextGroup;
}

export async function finishDineMatchGroupInDb(groupId, winnerRestaurantId, user) {
  assertSignedIn(user);
  const group = await fetchDineMatchGroupFromDb(groupId);
  if (!group || String(group.hostId) !== String(user.id)) return null;
  const nextGroup = { ...group, status: 'finished', winnerRestaurantId: String(winnerRestaurantId || ''), updatedAt: nowIso() };
  await upsertListItem(storageKeys.dineMatchGroups, nextGroup);
  return nextGroup;
}

export async function deleteUserAccountInDb(user) {
  if (!user?.id) return;
  const userId = String(user.id);
  await Promise.all([
    writeList(storageKeys.users, []),
    AsyncStorage.removeItem(storageKeys.currentUser),
    AsyncStorage.removeItem(`${storageKeys.favorites}:${userId}`)
  ]);
  const [posts, reactions, follows, notifications, blocks, reservations, waitlist, profiles] = await Promise.all([
    readList(storageKeys.feedPosts),
    readJson(storageKeys.feedReactions, {}),
    readList(storageKeys.follows),
    readList(storageKeys.notifications),
    readList(storageKeys.blocks),
    readList(storageKeys.reservations),
    readList(storageKeys.waitlist),
    readList(storageKeys.profiles)
  ]);
  await Promise.all([
    writeList(storageKeys.feedPosts, posts.filter((post) => String(post.authorId || post.userId) !== userId)),
    writeJson(storageKeys.feedReactions, Object.fromEntries(Object.entries(reactions).filter(([, value]) => value?.userId !== userId))),
    writeList(storageKeys.follows, follows.filter((item) => String(item.followerId) !== userId && String(item.targetId) !== userId)),
    writeList(storageKeys.notifications, notifications.filter((item) => String(item.userId) !== userId && String(item.actorId) !== userId)),
    writeList(storageKeys.blocks, blocks.filter((item) => String(item.userId) !== userId)),
    writeList(storageKeys.reservations, reservations.filter((item) => String(item.userId) !== userId)),
    writeList(storageKeys.waitlist, waitlist.filter((item) => String(item.userId) !== userId)),
    writeList(storageKeys.profiles, profiles.filter((item) => String(item.id) !== userId))
  ]);
}
