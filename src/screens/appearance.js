import { useContext, useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, SafeAreaView, ScrollView, Switch, StatusBar } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import { ThemeContext } from '../context/theme';
import OptionModal from '../components/option-modal';

export default function AppearanceSettingsScreen({ navigation }) {
  const { t } = useTranslation();
  const { theme, isDark, toggleTheme, accentColor: contextAccentColor, updateAccentColor } = useContext(ThemeContext);
  const [autoNightMode, setAutoNightMode] = useState(false);
  const [systemTheme, setSystemTheme] = useState(false);
  const [coloredNames, setColoredNames] = useState(true);
  const [showAvatars, setShowAvatars] = useState(true);
  const [largeEmoji, setLargeEmoji] = useState(true);
  const [animatedEmoji, setAnimatedEmoji] = useState(true);
  const [animatedStickers, setAnimatedStickers] = useState(true);
  const [chatBackground, setChatBackground] = useState('default');
  const [bubbleStyle, setBubbleStyle] = useState('rounded');
  const [showChatBackgroundModal, setShowChatBackgroundModal] = useState(false);
  const [showBubbleStyleModal, setShowBubbleStyleModal] = useState(false);
  const [showAccentColorModal, setShowAccentColorModal] = useState(false);

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      const keys = ['auto_night_mode', 'system_theme', 'colored_names', 'show_avatars', 'large_emoji', 'animated_emoji', 'animated_stickers', 'chat_background', 'bubble_style', 'accent_color'];
      const values = await AsyncStorage.multiGet(keys);
      const setters = {
        auto_night_mode: setAutoNightMode, system_theme: setSystemTheme, colored_names: setColoredNames,
        show_avatars: setShowAvatars, large_emoji: setLargeEmoji, animated_emoji: setAnimatedEmoji,
        animated_stickers: setAnimatedStickers, chat_background: setChatBackground, bubble_style: setBubbleStyle
      };
      values.forEach(([key, value]) => value && setters[key]?.(
        key.includes('background') || key.includes('style') ? value : value === 'true'
      ));
    } catch (error) { console.error('Settings load error:', error); }
  };

  const saveSetting = (key, value) => AsyncStorage.setItem(key, String(value)).catch(console.error);
  const handleToggle = (key, setter) => (value) => (setter(value), saveSetting(key, value));

  const backgroundOptions = [
    { value: 'default', label: t('appearance.backgroundDefault') },
    { value: 'light', label: t('appearance.backgroundLight') },
    { value: 'dark', label: t('appearance.backgroundDark') },
    { value: 'gradient', label: t('appearance.backgroundGradient') },
    { value: 'custom', label: t('appearance.backgroundCustom') }
  ];

  const bubbleOptions = [
    { value: 'rounded', label: t('chatSettings.rounded') },
    { value: 'square', label: t('chatSettings.squared') },
    { value: 'ios', label: t('chatSettings.ios') },
    { value: 'telegram', label: 'Telegram' }
  ];

  const accentColors = [
    { value: 'purple', label: t('appearance.colorPurple'), color: '#8B5CF6' },
    { value: 'blue', label: t('appearance.colorBlue'), color: '#3B82F6' },
    { value: 'green', label: t('appearance.colorGreen'), color: '#10B981' },
    { value: 'red', label: t('appearance.colorRed'), color: '#EF4444' },
    { value: 'orange', label: t('appearance.colorOrange'), color: '#F97316' },
    { value: 'pink', label: t('appearance.colorPink'), color: '#EC4899' }
  ];

  const getOptionLabel = (options, value) => options.find(opt => opt.value === value)?.label || options[0].label;

  return (
    <SafeAreaView style={[s.container, { backgroundColor: theme.background }]}>
      <StatusBar barStyle={theme.statusBar} />
      <View style={[s.header, { backgroundColor: theme.background, borderBottomColor: theme.divider }]}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={s.backButton}>
          <Ionicons name="chevron-back" size={28} color={theme.primary} />
        </TouchableOpacity>
        <Text style={[s.headerTitle, { color: theme.text }]}>{t('settings.appearance')}</Text>
        <View style={s.placeholder} />
      </View>
      <ScrollView contentContainerStyle={s.scrollContent} showsVerticalScrollIndicator={false}>
        <Text style={[s.sectionTitle, { color: theme.textSecondary }]}>{t('appearance.themeSection')}</Text>
        <View style={[s.section, { backgroundColor: theme.surface }]}>
          <View style={[s.row, { borderBottomWidth: 0.5, borderBottomColor: theme.divider }]}>
            <Text style={[s.label, { color: theme.text }]}>{t('appearance.darkTheme')}</Text>
            <Switch value={isDark} onValueChange={() => toggleTheme(isDark ? 'light' : 'dark')} trackColor={{ false: '#E5E5EA', true: theme.primary }} thumbColor="#FFFFFF" />
          </View>
          <View style={[s.row, { borderBottomWidth: 0.5, borderBottomColor: theme.divider }]}>
            <View style={s.labelContainer}>
              <Text style={[s.label, { color: theme.text }]}>{t('appearance.autoNightMode')}</Text>
              <Text style={[s.hint, { color: theme.textSecondary }]}>{t('appearance.autoNightModeHint')}</Text>
            </View>
            <Switch value={autoNightMode} onValueChange={handleToggle('auto_night_mode', setAutoNightMode)} trackColor={{ false: '#E5E5EA', true: theme.primary }} thumbColor="#FFFFFF" />
          </View>
          <View style={s.row}>
            <View style={s.labelContainer}>
              <Text style={[s.label, { color: theme.text }]}>{t('appearance.systemTheme')}</Text>
              <Text style={[s.hint, { color: theme.textSecondary }]}>{t('appearance.systemThemeHint')}</Text>
            </View>
            <Switch value={systemTheme} onValueChange={handleToggle('system_theme', setSystemTheme)} trackColor={{ false: '#E5E5EA', true: theme.primary }} thumbColor="#FFFFFF" />
          </View>
        </View>
        <Text style={[s.sectionTitle, { color: theme.textSecondary }]}>{t('appearance.colorsSection')}</Text>
        <View style={[s.section, { backgroundColor: theme.surface }]}>
          <TouchableOpacity style={s.row} onPress={() => setShowAccentColorModal(true)} activeOpacity={0.7}>
            <Text style={[s.label, { color: theme.text }]}>{t('appearance.accentColor')}</Text>
            <View style={s.rowRight}>
              <View style={[s.colorPreview, { backgroundColor: accentColors.find(c => c.value === contextAccentColor)?.color }]} />
              <Text style={[s.value, { color: theme.textSecondary }]}>{accentColors.find(c => c.value === contextAccentColor)?.label}</Text>
              <Ionicons name="chevron-forward" size={20} color={theme.textSecondary} />
            </View>
          </TouchableOpacity>
        </View>
        <Text style={[s.sectionTitle, { color: theme.textSecondary }]}>{t('appearance.chatSection')}</Text>
        <View style={[s.section, { backgroundColor: theme.surface }]}>
          <TouchableOpacity style={[s.row, { borderBottomWidth: 0.5, borderBottomColor: theme.divider }]} onPress={() => setShowChatBackgroundModal(true)} activeOpacity={0.7}>
            <Text style={[s.label, { color: theme.text }]}>{t('appearance.chatBackground')}</Text>
            <View style={s.rowRight}>
              <Text style={[s.value, { color: theme.textSecondary }]}>{getOptionLabel(backgroundOptions, chatBackground)}</Text>
              <Ionicons name="chevron-forward" size={20} color={theme.textSecondary} />
            </View>
          </TouchableOpacity>
          <TouchableOpacity style={[s.row, { borderBottomWidth: 0.5, borderBottomColor: theme.divider }]} onPress={() => setShowBubbleStyleModal(true)} activeOpacity={0.7}>
            <Text style={[s.label, { color: theme.text }]}>{t('appearance.bubbleStyle')}</Text>
            <View style={s.rowRight}>
              <Text style={[s.value, { color: theme.textSecondary }]}>{getOptionLabel(bubbleOptions, bubbleStyle)}</Text>
              <Ionicons name="chevron-forward" size={20} color={theme.textSecondary} />
            </View>
          </TouchableOpacity>
          <View style={[s.row, { borderBottomWidth: 0.5, borderBottomColor: theme.divider }]}>
            <Text style={[s.label, { color: theme.text }]}>{t('appearance.coloredNames')}</Text>
            <Switch value={coloredNames} onValueChange={handleToggle('colored_names', setColoredNames)} trackColor={{ false: '#E5E5EA', true: theme.primary }} thumbColor="#FFFFFF" />
          </View>
          <View style={s.row}>
            <Text style={[s.label, { color: theme.text }]}>{t('appearance.showAvatars')}</Text>
            <Switch value={showAvatars} onValueChange={handleToggle('show_avatars', setShowAvatars)} trackColor={{ false: '#E5E5EA', true: theme.primary }} thumbColor="#FFFFFF" />
          </View>
        </View>
        <Text style={[s.sectionTitle, { color: theme.textSecondary }]}>{t('appearance.emojiSection')}</Text>
        <View style={[s.section, { backgroundColor: theme.surface }]}>
          <View style={[s.row, { borderBottomWidth: 0.5, borderBottomColor: theme.divider }]}>
            <Text style={[s.label, { color: theme.text }]}>{t('appearance.largeEmoji')}</Text>
            <Switch value={largeEmoji} onValueChange={handleToggle('large_emoji', setLargeEmoji)} trackColor={{ false: '#E5E5EA', true: theme.primary }} thumbColor="#FFFFFF" />
          </View>
          <View style={[s.row, { borderBottomWidth: 0.5, borderBottomColor: theme.divider }]}>
            <Text style={[s.label, { color: theme.text }]}>{t('appearance.animatedEmoji')}</Text>
            <Switch value={animatedEmoji} onValueChange={handleToggle('animated_emoji', setAnimatedEmoji)} trackColor={{ false: '#E5E5EA', true: theme.primary }} thumbColor="#FFFFFF" />
          </View>
          <View style={s.row}>
            <Text style={[s.label, { color: theme.text }]}>{t('appearance.animatedStickers')}</Text>
            <Switch value={animatedStickers} onValueChange={handleToggle('animated_stickers', setAnimatedStickers)} trackColor={{ false: '#E5E5EA', true: theme.primary }} thumbColor="#FFFFFF" />
          </View>
        </View>
        <TouchableOpacity style={[s.resetButton, { backgroundColor: theme.surface }]} onPress={() => {
          toggleTheme('light'); setAutoNightMode(false); setSystemTheme(false); setColoredNames(true); setShowAvatars(true); setLargeEmoji(true); setAnimatedEmoji(true); setAnimatedStickers(true); setChatBackground('default'); setBubbleStyle('rounded'); updateAccentColor('purple');
        }} activeOpacity={0.7}>
          <Text style={[s.resetText, { color: theme.error }]}>{t('appearance.resetSettings')}</Text>
        </TouchableOpacity>
      </ScrollView>
      <OptionModal visible={showChatBackgroundModal} title={t('appearance.chatBackground')} options={backgroundOptions} selectedValue={chatBackground} onSelect={(value) => { setChatBackground(value); AsyncStorage.setItem('chat_background', value); }} onClose={() => setShowChatBackgroundModal(false)} />
      <OptionModal visible={showBubbleStyleModal} title={t('appearance.bubbleStyle')} options={bubbleOptions} selectedValue={bubbleStyle} onSelect={(value) => { setBubbleStyle(value); AsyncStorage.setItem('bubble_style', value); }} onClose={() => setShowBubbleStyleModal(false)} />
      <OptionModal visible={showAccentColorModal} title={t('appearance.accentColor')} options={accentColors} selectedValue={contextAccentColor} onSelect={(value) => { updateAccentColor(value); AsyncStorage.setItem('accent_color', value); }} onClose={() => setShowAccentColorModal(false)} />
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
  value: { fontSize: 16 },
  colorPreview: { width: 24, height: 24, borderRadius: 12 },
  resetButton: { marginHorizontal: 16, marginTop: 24, borderRadius: 28, paddingVertical: 14, alignItems: 'center' },
  resetText: { fontSize: 16, fontWeight: '600' }
});
