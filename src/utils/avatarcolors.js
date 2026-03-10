const AVATAR_COLORS = [
  '#FF6B6B',
  '#4ECDC4',
  '#45B7D1',
  '#FFA07A',
  '#98D8C8',
  '#6C5CE7',
  '#A29BFE',
  '#FD79A8',
  '#FDCB6E',
  '#6C5CE7',
  '#00B894',
  '#00CEC9',
  '#0984E3',
  '#6C5CE7',
  '#E17055',
  '#74B9FF',
  '#A29BFE',
  '#FF7675',
  '#FD79A8',
  '#FDCB6E'
];

export const getAvatarColor = (userId) => {
  if (!userId) return '#6366F1';
  const hash = userId.split('').reduce((acc, char) => {
    return char.charCodeAt(0) + ((acc << 5) - acc);
  }, 0);
  const index = Math.abs(hash) % AVATAR_COLORS.length;
  return AVATAR_COLORS[index];
};
