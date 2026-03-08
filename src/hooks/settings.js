import { useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

export const useSettings = () => {
  const [settings, setSettings] = useState({
    fontSize: 'medium',
    showTimestamps: true,
    groupMessages: true,
    autoplayMedia: true,
    showDeliveryStatus: true,
    showTypingIndicator: true,
    showOnlineStatus: true,
    enableSwipeReply: true,
    enableDoubleTapLike: true,
    sendByEnter: true,
    vibrationOnSend: false,
    soundOnSend: false,
    messageDensity: 'comfortable',
    autoDownloadPhotos: true,
    autoDownloadVideos: false,
    autoDownloadFiles: false,
    compressPhotos: true,
    compressVideos: true,
    notificationsEnabled: true,
    soundEnabled: true,
    vibrationEnabled: true,
    inAppSounds: true,
    inAppVibration: true,
    showPreview: true,
    showSender: true,
    showMessageText: true,
    lastSeenEnabled: true,
    readReceiptsEnabled: true,
    onlineStatusVisible: true,
    coloredNames: true,
    showAvatars: true,
    largeEmoji: true,
    animatedEmoji: true,
    chatBackground: 'default',
    bubbleStyle: 'rounded',
  });

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      const keys = Object.keys(settings);
      const values = await AsyncStorage.multiGet(keys.map(k => k.replace(/([A-Z])/g, '_$1').toLowerCase()));
      
      const loadedSettings = {};
      values.forEach(([key, value]) => {
        if (value !== null) {
          const camelKey = key.replace(/_([a-z])/g, (g) => g[1].toUpperCase());
          if (['fontSize', 'messageDensity', 'chatBackground', 'bubbleStyle'].includes(camelKey)) {
            loadedSettings[camelKey] = value;
          } else {
            loadedSettings[camelKey] = value === 'true';
          }
        }
      });

      setSettings(prev => ({ ...prev, ...loadedSettings }));
      setLoading(false);
    } catch (error) {
      console.error('не загрузились настройки:', error);
      setLoading(false);
    }
  };

  const getSetting = (key) => settings[key];

  const updateSetting = async (key, value) => {
    try {
      const storageKey = key.replace(/([A-Z])/g, '_$1').toLowerCase();
      await AsyncStorage.setItem(storageKey, String(value));
      setSettings(prev => ({ ...prev, [key]: value }));
    } catch (error) {
      console.error('не обновилась настройка:', error);
    }
  };

  return { settings, loading, getSetting, updateSetting, reloadSettings: loadSettings };
};

export const getFontSize = (size) => {
  const sizes = {
    small: 14,
    medium: 16,
    large: 18,
    xlarge: 20,
  };
  return sizes[size] || sizes.medium;
};

export const getMessageSpacing = (density) => {
  const spacing = {
    compact: { vertical: 4, horizontal: 8 },
    comfortable: { vertical: 8, horizontal: 12 },
    spacious: { vertical: 12, horizontal: 16 },
  };
  return spacing[density] || spacing.comfortable;
};
