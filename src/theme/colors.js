export const avatarColors = [
  '#FF6B6B', '#4ECDC4', '#45B7D1', '#FFA07A', '#98D8C8',
  '#F7DC6F', '#BB8FCE', '#85C1E2', '#F8B739', '#52B788',
  '#FF8C94', '#A8DADC', '#E63946', '#F4A261', '#2A9D8F',
  '#E76F51', '#8338EC', '#3A86FF', '#FB5607', '#FFBE0B'
];

export const getAvatarColor = (name) => {
  if (!name) return avatarColors[0];
  const charCode = name.charCodeAt(0) + (name.length > 1 ? name.charCodeAt(1) : 0);
  return avatarColors[charCode % avatarColors.length];
};

export const lightTheme = {
  primary: '#8B5CF6',
  secondary: '#A78BFA',
  background: '#FFFFFF',
  surface: '#F2F2F7',
  text: '#000000',
  textSecondary: '#8E8E93',
  border: '#C6C6C8',
  success: '#34C759',
  error: '#FF3B30',
  warning: '#FF9500',
  messageBubbleOwn: '#8B5CF6',
  messageBubbleOther: '#E9E9EB',
  messageTextOwn: '#FFFFFF',
  messageTextOther: '#000000',
  inputBackground: '#F2F2F7',
  online: '#34C759',
  typing: '#8B5CF6',
  chatBackground: '#FFFFFF',
  divider: '#C6C6C8',
  statusBar: 'dark-content'
};

export const darkTheme = {
  primary: '#A78BFA',
  secondary: '#C4B5FD',
  background: '#000000',
  surface: '#1C1C1E',
  text: '#FFFFFF',
  textSecondary: '#8E8E93',
  border: '#38383A',
  success: '#32D74B',
  error: '#FF453A',
  warning: '#FF9F0A',
  messageBubbleOwn: '#8B5CF6',
  messageBubbleOther: '#2C2C2E',
  messageTextOwn: '#FFFFFF',
  messageTextOther: '#FFFFFF',
  inputBackground: '#1C1C1E',
  online: '#32D74B',
  typing: '#A78BFA',
  chatBackground: '#000000',
  divider: '#38383A',
  statusBar: 'light-content',
  badge: '#8B5CF6',
  badgeMuted: '#48484A',
  unreadText: '#FFFFFF',
  pinnedBackground: '#1C1C1E'
};
