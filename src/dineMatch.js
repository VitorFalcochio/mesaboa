export function createLocalDineMatchGroup({ user, preferences, restaurantIds }) {
  const createdAt = new Date().toISOString();
  return {
    id: `local-match-${Date.now()}`,
    inviteCode: Math.random().toString(36).slice(2, 8).toUpperCase(),
    hostId: user?.id || 'local-user',
    title: 'Nosso Dine Match',
    status: 'active',
    preferences: { ...preferences },
    restaurantIds: [...restaurantIds],
    winnerRestaurantId: '',
    maxParticipants: Number(preferences?.participants || 8),
    participants: [{
      id: `local-participant-${user?.id || Date.now()}`,
      userId: user?.id || 'local-user',
      displayName: user?.name || 'Você',
      preferences: { ...preferences },
      joinedAt: createdAt
    }],
    votes: [],
    createdAt
  };
}

export function applyDineMatchVote(group, userId, restaurantId, value) {
  if (!group) return group;
  const votes = (group.votes || []).filter((vote) => !(
    String(vote.userId) === String(userId)
    && String(vote.restaurantId) === String(restaurantId)
  ));
  if (value === 1 || value === -1) {
    votes.push({
      id: `vote-${userId}-${restaurantId}`,
      userId,
      restaurantId,
      value,
      updatedAt: new Date().toISOString()
    });
  }
  return { ...group, votes };
}

export function dineMatchVoteSummary(group, restaurantId) {
  return (group?.votes || []).reduce((summary, vote) => {
    if (String(vote.restaurantId) !== String(restaurantId)) return summary;
    if (vote.value === 1) summary.likes += 1;
    if (vote.value === -1) summary.vetoes += 1;
    summary.score += Number(vote.value || 0);
    return summary;
  }, { likes: 0, vetoes: 0, score: 0 });
}

export function rankDineMatchCandidates(group, candidates = []) {
  return [...candidates].sort((left, right) => {
    const leftVotes = dineMatchVoteSummary(group, left.id);
    const rightVotes = dineMatchVoteSummary(group, right.id);
    if (rightVotes.score !== leftVotes.score) return rightVotes.score - leftVotes.score;
    if (rightVotes.likes !== leftVotes.likes) return rightVotes.likes - leftVotes.likes;
    return Number(right.dineMatchScore || 0) - Number(left.dineMatchScore || 0);
  });
}

