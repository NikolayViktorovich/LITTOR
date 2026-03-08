import { useContext, useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, SafeAreaView, ScrollView, Switch, StatusBar } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import { ThemeContext } from '../context/theme';
import OptionModal from '../components/option-modal';

export default function ChatSettingsScreen({ navigation }) {
  const { t } = useTranslation();
  const { theme } = useContext(ThemeContext);
  const [fontSize, setFontSize] = useState('medium');
  const [sendByEnter, setSendByEnter] = useState(true);
  const [autoplayMedia, setAutoplayMedia] = useState(true);
  const [showTimestamps, setShowTimestamps] = useState(true);
  const [groupMessages, setGroupMessages] = useState(true);
  const [showDeliveryStatus, setShowDeliveryStatus] = useState(true);
  const [showTypingIndicator, setShowTypingIndicator] = useState(true);
  const [showOnlineStatus, setShowOnlineStatus] = useState(true);
  const [enableSwipeReply, setEnableSwipeReply] = useState(true);
  const [enableDoubleTapLike, setEnableDoubleTapLike] = useState(true);
  const [vibrationOnSend, setVibrationOnSend] = useState(false);
  const [soundOnSend, setSoundOnSend] = useState(false);
  const [archiveOnSwipe, setArchiveOnSwipe] = useState(true);
  const [deleteOnSwipe, setDeleteOnSwipe] = useState(false);
  const [showFontSizeModal, setShowFontSizeModal] = useState(false);
  const [showMessageDensityModal, setShowMessageDensityModal] = useState(false);
  const [messageDensity, setMessageDensity] = useState('comfortable');

  useEffect(() => { loadSettings(); }, []);

  const loadSettings = async () => {
    try {
      const keys = ['font_size', 'send_by_enter', 'autoplay_media', 'show_timestamps', 'group_messages', 'show_delivery_status', 'show_typing_indicator', 'show_online_status', 'enable_swipe_reply', 'enable_double_tap_like', 'vibration_on_send', 'sound_on_send', 'archive_on_swipe', 'delete_on_swipe', 'message_density'];
      const values = await AsyncStorage.multiGet(keys);
      const setters = {
        font_size: setFontSize, message_density: setMessageDensity, send_by_enter: setSendByEnter, autoplay_media: setAutoplayMedia, show_timestamps: setShowTimestamps, group_messages: setGroupMessages, show_delivery_status: setShowDeliveryStatus, show_typing_indicator: setShowTypingIndicator, show_online_status: setShowOnlineStatus, enable_swipe_reply: setEnableSwipeReply, enable_double_tap_like: setEnableDoubleTapLike, vibration_on_send: setVibrationOnSend, sound_on_send: setSoundOnSend, archive_on_swipe: setArchiveOnSwipe, delete_on_swipe: setDeleteOnSwipe
      };
      values.forEach(([key, value]) => {
        if (value && setters[key]) setters[key](key.includes('size') || key.includes('density') ? value : value === 'true');
      });
    } catch (error) { console.error('не загрузились настройки:', error); }
  };

  const saveSetting = (key, value) => AsyncStorage.setItem(key, String(value)).catch(console.error);
  const handleToggle = (key, setter) => (value) => (setter(value), saveSetting(key, value));

  const fontSizeOptions = [
    { value: 'small', label: t('chatSettings.small'), size: 14 },
    { value: 'medium', label: t('chatSettings.medium'), size: 16 },
    { value: 'large', label: t('chatSettings.large'), size: 18 },
    { value: 'xlarge', label: t('chatSettings.extraLarge'), size: 20 }
  ];

  const densityOptions = [
    { value: 'compact', label: t('chatSettings.compact'), spacing: 6 },
    { value: 'comfortable', label: t('chatSettings.comfortable'), spacing: 10 },
    { value: 'spacious', label: t('chatSettings.comfortable'), spacing: 14 }
  ];

  const getOptionLabel = (options, value) => options.find(opt => opt.value === value)?.label || options[0].label;

  return (
    <SafeAreaView style={[s.container, { backgroundColor: theme.background }]}>
      <StatusBar barStyle={theme.statusBar} />
      <View style={[s.header, { backgroundColor: theme.background, borderBottomColor: theme.divider }]}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={s.backButton}>
          <Ionicons name="chevron-back" size={28} color={theme.primary} />
        </TouchableOpacity>
        <Text style={[s.headerTitle, { color: theme.text }]}>{t('settings.chatSettings')}</Text>
        <View style={s.placeholder} />
      </View>
      <ScrollView contentContainerStyle={s.scrollContent} showsVerticalScrollIndicator={false}>
        <Text style={[s.sectionTitle, { color: theme.textSecondary }]}>{t('chatSettings.appearanceTitle')}</Text>
        <View style={[s.section, { backgroundColor: theme.surface }]}>
          <TouchableOpacity style={[s.row, { borderBottomWidth: 0.5, borderBottomColor: theme.divider }]} onPress={() => setShowFontSizeModal(true)} activeOpacity={0.7}>
            <Text style={[s.label, { color: theme.text }]}>{t('chatSettings.textSize')}</Text>
            <View style={s.rowRight}>
              <Text style={[s.value, { color: theme.textSecondary }]}>{getOptionLabel(fontSizeOptions, fontSize)}</Text>
              <Ionicons name="chevron-forward" size={20} color={theme.textSecondary} />
            </View>
          </TouchableOpacity>
          <TouchableOpacity style={[s.row, { borderBottomWidth: 0.5, borderBottomColor: theme.divider }]} onPress={() => setShowMessageDensityModal(true)} activeOpacity={0.7}>
            <Text style={[s.label, { color: theme.text }]}>{t('chatSettings.messageDensity')}</Text>
            <View style={s.rowRight}>
              <Text style={[s.value, { color: theme.textSecondary }]}>{getOptionLabel(densityOptions, messageDensity)}</Text>
              <Ionicons name="chevron-forward" size={20} color={theme.textSecondary} />
            </View>
          </TouchableOpacity>
          <View style={[s.row, { borderBottomWidth: 0.5, borderBottomColor: theme.divider }]}>
            <Text style={[s.label, { color: theme.text }]}>{t('chatSettings.showTimestamps')}</Text>
            <Switch value={showTimestamps} onValueChange={handleToggle('show_timestamps', setShowTimestamps)} trackColor={{ false: '#E5E5EA', true: theme.primary }} thumbColor="#FFFFFF" />
          </View>
          <View style={[s.row, { borderBottomWidth: 0.5, borderBottomColor: theme.divider }]}>
            <View style={s.labelContainer}>
              <Text style={[s.label, { color: theme.text }]}>{t('chatSettings.groupMessages')}</Text>
              <Text style={[s.hint, { color: theme.textSecondary }]}>{t('chatSettings.groupMessagesHint')}</Text>
            </View>
            <Switch value={groupMessages} onValueChange={handleToggle('group_messages', setGroupMessages)} trackColor={{ false: '#E5E5EA', true: theme.primary }} thumbColor="#FFFFFF" />
          </View>
          <View style={s.row}>
            <Text style={[s.label, { color: theme.text }]}>{t('chatSettings.autoplayMedia')}</Text>
            <Switch value={autoplayMedia} onValueChange={handleToggle('autoplay_media', setAutoplayMedia)} trackColor={{ false: '#E5E5EA', true: theme.primary }} thumbColor="#FFFFFF" />
          </View>
        </View>
        <Text style={[s.sectionTitle, { color: theme.textSecondary }]}>{t('chatSettings.indicatorsTitle')}</Text>
        <View style={[s.section, { backgroundColor: theme.surface }]}>
          <View style={[s.row, { borderBottomWidth: 0.5, borderBottomColor: theme.divider }]}>
            <Text style={[s.label, { color: theme.text }]}>{t('chatSettings.showDeliveryStatus')}</Text>
            <Switch value={showDeliveryStatus} onValueChange={handleToggle('show_delivery_status', setShowDeliveryStatus)} trackColor={{ false: '#E5E5EA', true: theme.primary }} thumbColor="#FFFFFF" />
          </View>
          <View style={[s.row, { borderBottomWidth: 0.5, borderBottomColor: theme.divider }]}>
            <Text style={[s.label, { color: theme.text }]}>{t('chatSettings.showTyping')}</Text>
            <Switch value={showTypingIndicator} onValueChange={handleToggle('show_typing_indicator', setShowTypingIndicator)} trackColor={{ false: '#E5E5EA', true: theme.primary }} thumbColor="#FFFFFF" />
          </View>
          <View style={s.row}>
            <Text style={[s.label, { color: theme.text }]}>{t('chatSettings.showOnlineStatus')}</Text>
            <Switch value={showOnlineStatus} onValueChange={handleToggle('show_online_status', setShowOnlineStatus)} trackColor={{ false: '#E5E5EA', true: theme.primary }} thumbColor="#FFFFFF" />
          </View>
        </View>
        <Text style={[s.sectionTitle, { color: theme.textSecondary }]}>{t('chatSettings.behaviorTitle')}</Text>
        <View style={[s.section, { backgroundColor: theme.surface }]}>
          <View style={[s.row, { borderBottomWidth: 0.5, borderBottomColor: theme.divider }]}>
            <View style={s.labelContainer}>
              <Text style={[s.label, { color: theme.text }]}>{t('chatSettings.swipeReply')}</Text>
              <Text style={[s.hint, { color: theme.textSecondary }]}>{t('chatSettings.swipeReplyHint')}</Text>
            </View>
            <Switch value={enableSwipeReply} onValueChange={handleToggle('enable_swipe_reply', setEnableSwipeReply)} trackColor={{ false: '#E5E5EA', true: theme.primary }} thumbColor="#FFFFFF" />
          </View>
          <View style={[s.row, { borderBottomWidth: 0.5, borderBottomColor: theme.divider }]}>
            <View style={s.labelContainer}>
              <Text style={[s.label, { color: theme.text }]}>{t('chatSettings.doubleTapLike')}</Text>
              <Text style={[s.hint, { color: theme.textSecondary }]}>{t('chatSettings.doubleTapLikeHint')}</Text>
            </View>
            <Switch value={enableDoubleTapLike} onValueChange={handleToggle('enable_double_tap_like', setEnableDoubleTapLike)} trackColor={{ false: '#E5E5EA', true: theme.primary }} thumbColor="#FFFFFF" />
          </View>
          <View style={[s.row, { borderBottomWidth: 0.5, borderBottomColor: theme.divider }]}>
            <View style={s.labelContainer}>
              <Text style={[s.label, { color: theme.text }]}>{t('chatSettings.archiveSwipe')}</Text>
              <Text style={[s.hint, { color: theme.textSecondary }]}>{t('chatSettings.archiveSwipeHint')}</Text>
            </View>
            <Switch value={archiveOnSwipe} onValueChange={handleToggle('archive_on_swipe', setArchiveOnSwipe)} trackColor={{ false: '#E5E5EA', true: theme.primary }} thumbColor="#FFFFFF" />
          </View>
          <View style={s.row}>
            <View style={s.labelContainer}>
              <Text style={[s.label, { color: theme.text }]}>{t('chatSettings.deleteSwipe')}</Text>
              <Text style={[s.hint, { color: theme.textSecondary }]}>{t('chatSettings.deleteSwipeHint')}</Text>
            </View>
            <Switch value={deleteOnSwipe} onValueChange={handleToggle('delete_on_swipe', setDeleteOnSwipe)} trackColor={{ false: '#E5E5EA', true: theme.primary }} thumbColor="#FFFFFF" />
          </View>
        </View>
        <Text style={[s.sectionTitle, { color: theme.textSecondary }]}>{t('chatSettings.behaviorTitle')}</Text>
        <View style={[s.section, { backgroundColor: theme.surface }]}>
          <View style={[s.row, { borderBottomWidth: 0.5, borderBottomColor: theme.divider }]}>
            <View style={s.labelContainer}>
              <Text style={[s.label, { color: theme.text }]}>{t('chatSettings.sendByEnter')}</Text>
              <Text style={[s.hint, { color: theme.textSecondary }]}>{t('chatSettings.sendByEnterHint')}</Text>
            </View>
            <Switch value={sendByEnter} onValueChange={handleToggle('send_by_enter', setSendByEnter)} trackColor={{ false: '#E5E5EA', true: theme.primary }} thumbColor="#FFFFFF" />
          </View>
          <View style={[s.row, { borderBottomWidth: 0.5, borderBottomColor: theme.divider }]}>
            <Text style={[s.label, { color: theme.text }]}>{t('chatSettings.vibrationOnSend')}</Text>
            <Switch value={vibrationOnSend} onValueChange={handleToggle('vibration_on_send', setVibrationOnSend)} trackColor={{ false: '#E5E5EA', true: theme.primary }} thumbColor="#FFFFFF" />
          </View>
          <View style={s.row}>
            <Text style={[s.label, { color: theme.text }]}>{t('chatSettings.soundOnSend')}</Text>
            <Switch value={soundOnSend} onValueChange={handleToggle('sound_on_send', setSoundOnSend)} trackColor={{ false: '#E5E5EA', true: theme.primary }} thumbColor="#FFFFFF" />
          </View>
        </View>
      </ScrollView>
      <OptionModal visible={showFontSizeModal} title={t('chatSettings.textSize')} options={fontSizeOptions} selectedValue={fontSize} onSelect={(value) => { setFontSize(value); AsyncStorage.setItem('font_size', value); }} onClose={() => setShowFontSizeModal(false)} showPreview />
      <OptionModal visible={showMessageDensityModal} title={t('chatSettings.messageDensity')} options={densityOptions} selectedValue={messageDensity} onSelect={(value) => { setMessageDensity(value); AsyncStorage.setItem('message_density', value); }} onClose={() => setShowMessageDensityModal(false)} showPreview />
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
  labelContainer: { flex: 1, marginRight: 12 },
  hint: { fontSize: 13, marginTop: 2, lineHeight: 16 },
  rowRight: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  value: { fontSize: 16 }
});
