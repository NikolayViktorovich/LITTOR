import { useContext, useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, SafeAreaView, ScrollView, Switch, StatusBar } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import { ThemeContext } from '../context/theme';

export default function NotificationsSettingsScreen({ navigation }) {
  const { theme } = useContext(ThemeContext);
  const { t } = useTranslation();
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [messageNotifications, setMessageNotifications] = useState(true);
  const [groupNotifications, setGroupNotifications] = useState(true);
  const [channelNotifications, setChannelNotifications] = useState(true);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [vibrationEnabled, setVibrationEnabled] = useState(true);
  const [inAppSounds, setInAppSounds] = useState(true);
  const [inAppVibration, setInAppVibration] = useState(true);
  const [inAppPreview, setInAppPreview] = useState(true);
  const [showPreview, setShowPreview] = useState(true);
  const [showSender, setShowSender] = useState(true);
  const [showMessageText, setShowMessageText] = useState(true);
  const [badgeCounter, setBadgeCounter] = useState(true);
  const [includeChannels, setIncludeChannels] = useState(false);
  const [countUnread, setCountUnread] = useState(true);
  const [contactJoined, setContactJoined] = useState(true);
  const [pinnedMessages, setPinnedMessages] = useState(true);
  const [reactions, setReactions] = useState(true);

  useEffect(() => { loadSettings(); }, []);

  const loadSettings = async () => {
    try {
      const keys = ['notifications_enabled', 'message_notifications', 'group_notifications', 'channel_notifications', 'sound_enabled', 'vibration_enabled', 'in_app_sounds', 'in_app_vibration', 'in_app_preview', 'show_preview', 'show_sender', 'show_message_text', 'badge_counter', 'include_channels', 'count_unread', 'contact_joined', 'pinned_messages', 'reactions'];
      const values = await AsyncStorage.multiGet(keys);
      const setters = {
        notifications_enabled: setNotificationsEnabled, message_notifications: setMessageNotifications, group_notifications: setGroupNotifications, channel_notifications: setChannelNotifications, sound_enabled: setSoundEnabled, vibration_enabled: setVibrationEnabled, in_app_sounds: setInAppSounds, in_app_vibration: setInAppVibration, in_app_preview: setInAppPreview, show_preview: setShowPreview, show_sender: setShowSender, show_message_text: setShowMessageText, badge_counter: setBadgeCounter, include_channels: setIncludeChannels, count_unread: setCountUnread, contact_joined: setContactJoined, pinned_messages: setPinnedMessages, reactions: setReactions
      };
      values.forEach(([key, value]) => {
        if (value && setters[key]) setters[key](value === 'true');
      });
    } catch (error) { console.error('не загрузились настройки:', error); }
  };

  const saveSetting = (key, value) => AsyncStorage.setItem(key, String(value)).catch(console.error);
  const handleToggle = (key, setter) => (value) => (setter(value), saveSetting(key, value));

  return (
    <SafeAreaView style={[s.container, { backgroundColor: theme.background }]}>
      <StatusBar barStyle={theme.statusBar} />
      <View style={[s.header, { backgroundColor: theme.background, borderBottomColor: theme.divider }]}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={s.backButton}>
          <Ionicons name="chevron-back" size={28} color={theme.primary} />
        </TouchableOpacity>
        <Text style={[s.headerTitle, { color: theme.text }]}>{t('notifications.title')}</Text>
        <View style={s.placeholder} />
      </View>
      <ScrollView contentContainerStyle={s.scrollContent} showsVerticalScrollIndicator={false}>
        <View style={[s.section, { backgroundColor: theme.surface }]}>
          <View style={[s.row, { borderBottomWidth: 0.5, borderBottomColor: theme.divider }]}>
            <Text style={[s.label, { color: theme.text }]}>{t('notifications.enabled')}</Text>
            <Switch value={notificationsEnabled} onValueChange={handleToggle('notifications_enabled', setNotificationsEnabled)} trackColor={{ false: '#E5E5EA', true: theme.primary }} thumbColor="#FFFFFF" />
          </View>
          <Text style={[s.sectionHint, { color: theme.textSecondary }]}>{t('notifications.enabledHint')}</Text>
        </View>
        <Text style={[s.sectionTitle, { color: theme.textSecondary }]}>{t('notifications.typesTitle')}</Text>
        <View style={[s.section, { backgroundColor: theme.surface }]}>
          {[
            { label: t('notifications.messageNotifications'), value: messageNotifications, setter: setMessageNotifications, key: 'message_notifications' },
            { label: t('notifications.groupNotifications'), value: groupNotifications, setter: setGroupNotifications, key: 'group_notifications' },
            { label: t('notifications.channelNotifications'), value: channelNotifications, setter: setChannelNotifications, key: 'channel_notifications', last: true }
          ].map(({ label, value, setter, key, last }, i) => (
            <View key={i} style={[s.row, !last && { borderBottomWidth: 0.5, borderBottomColor: theme.divider }]}>
              <Text style={[s.label, { color: theme.text }]}>{label}</Text>
              <Switch value={value} onValueChange={handleToggle(key, setter)} trackColor={{ false: '#E5E5EA', true: theme.primary }} thumbColor="#FFFFFF" />
            </View>
          ))}
        </View>
        <Text style={[s.sectionTitle, { color: theme.textSecondary }]}>{t('notifications.soundVibrationTitle')}</Text>
        <View style={[s.section, { backgroundColor: theme.surface }]}>
          <View style={[s.row, { borderBottomWidth: 0.5, borderBottomColor: theme.divider }]}>
            <Text style={[s.label, { color: theme.text }]}>{t('notifications.sound')}</Text>
            <Switch value={soundEnabled} onValueChange={handleToggle('sound_enabled', setSoundEnabled)} trackColor={{ false: '#E5E5EA', true: theme.primary }} thumbColor="#FFFFFF" />
          </View>
          <View style={s.row}>
            <Text style={[s.label, { color: theme.text }]}>{t('notifications.vibration')}</Text>
            <Switch value={vibrationEnabled} onValueChange={handleToggle('vibration_enabled', setVibrationEnabled)} trackColor={{ false: '#E5E5EA', true: theme.primary }} thumbColor="#FFFFFF" />
          </View>
        </View>
        <Text style={[s.sectionTitle, { color: theme.textSecondary }]}>{t('notifications.inAppTitle')}</Text>
        <View style={[s.section, { backgroundColor: theme.surface }]}>
          {[
            { label: t('notifications.inAppSounds'), value: inAppSounds, setter: setInAppSounds, key: 'in_app_sounds' },
            { label: t('notifications.inAppVibration'), value: inAppVibration, setter: setInAppVibration, key: 'in_app_vibration' },
            { label: t('notifications.inAppPreview'), value: inAppPreview, setter: setInAppPreview, key: 'in_app_preview', last: true }
          ].map(({ label, value, setter, key, last }, i) => (
            <View key={i} style={[s.row, !last && { borderBottomWidth: 0.5, borderBottomColor: theme.divider }]}>
              <Text style={[s.label, { color: theme.text }]}>{label}</Text>
              <Switch value={value} onValueChange={handleToggle(key, setter)} trackColor={{ false: '#E5E5EA', true: theme.primary }} thumbColor="#FFFFFF" />
            </View>
          ))}
        </View>
        <Text style={[s.sectionTitle, { color: theme.textSecondary }]}>{t('notifications.previewTitle')}</Text>
        <View style={[s.section, { backgroundColor: theme.surface }]}>
          {[
            { label: t('notifications.showPreview'), value: showPreview, setter: setShowPreview, key: 'show_preview' },
            { label: t('notifications.showSender'), value: showSender, setter: setShowSender, key: 'show_sender' },
            { label: t('notifications.showMessageText'), value: showMessageText, setter: setShowMessageText, key: 'show_message_text', last: true }
          ].map(({ label, value, setter, key, last }, i) => (
            <View key={i} style={[s.row, !last && { borderBottomWidth: 0.5, borderBottomColor: theme.divider }]}>
              <Text style={[s.label, { color: theme.text }]}>{label}</Text>
              <Switch value={value} onValueChange={handleToggle(key, setter)} trackColor={{ false: '#E5E5EA', true: theme.primary }} thumbColor="#FFFFFF" />
            </View>
          ))}
        </View>
        <Text style={[s.sectionTitle, { color: theme.textSecondary }]}>{t('notifications.badgeTitle')}</Text>
        <View style={[s.section, { backgroundColor: theme.surface }]}>
          {[
            { label: t('notifications.badgeCounter'), value: badgeCounter, setter: setBadgeCounter, key: 'badge_counter' },
            { label: t('notifications.includeChannels'), value: includeChannels, setter: setIncludeChannels, key: 'include_channels' },
            { label: t('notifications.countUnread'), value: countUnread, setter: setCountUnread, key: 'count_unread', last: true }
          ].map(({ label, value, setter, key, last }, i) => (
            <View key={i} style={[s.row, !last && { borderBottomWidth: 0.5, borderBottomColor: theme.divider }]}>
              <Text style={[s.label, { color: theme.text }]}>{label}</Text>
              <Switch value={value} onValueChange={handleToggle(key, setter)} trackColor={{ false: '#E5E5EA', true: theme.primary }} thumbColor="#FFFFFF" />
            </View>
          ))}
        </View>
        <Text style={[s.sectionTitle, { color: theme.textSecondary }]}>{t('notifications.otherTitle')}</Text>
        <View style={[s.section, { backgroundColor: theme.surface }]}>
          {[
            { label: t('notifications.contactJoined'), value: contactJoined, setter: setContactJoined, key: 'contact_joined' },
            { label: t('notifications.pinnedMessages'), value: pinnedMessages, setter: setPinnedMessages, key: 'pinned_messages' },
            { label: t('notifications.reactions'), value: reactions, setter: setReactions, key: 'reactions', last: true }
          ].map(({ label, value, setter, key, last }, i) => (
            <View key={i} style={[s.row, !last && { borderBottomWidth: 0.5, borderBottomColor: theme.divider }]}>
              <Text style={[s.label, { color: theme.text }]}>{label}</Text>
              <Switch value={value} onValueChange={handleToggle(key, setter)} trackColor={{ false: '#E5E5EA', true: theme.primary }} thumbColor="#FFFFFF" />
            </View>
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  container: { flex: 1 },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, paddingVertical: 12, borderBottomWidth: 0.5 },
  backButton: { width: 40, height: 40, justifyContent: 'center' },
  headerTitle: { fontSize: 17, fontWeight: '600', flex: 1, textAlign: 'center' },
  placeholder: { width: 40 },
  scrollContent: { paddingBottom: 40 },
  sectionTitle: { fontSize: 13, fontWeight: '600', marginTop: 24, marginBottom: 8, marginLeft: 16, textTransform: 'uppercase' },
  section: { marginHorizontal: 16, borderRadius: 28, overflow: 'hidden' },
  row: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingVertical: 12, paddingHorizontal: 16 },
  label: { fontSize: 16, flex: 1 },
  sectionHint: { fontSize: 13, paddingHorizontal: 16, paddingTop: 8, paddingBottom: 12, lineHeight: 18 }
});
