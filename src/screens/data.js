import { useContext, useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, SafeAreaView, ScrollView, Switch, StatusBar } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import { ThemeContext } from '../context/theme';
import ConfirmModal from '../components/confirm-modal';

export default function DataSettingsScreen({ navigation }) {
  const { t } = useTranslation();
  const { theme } = useContext(ThemeContext);
  const [autoDownloadPhotos, setAutoDownloadPhotos] = useState(true);
  const [autoDownloadVideos, setAutoDownloadVideos] = useState(false);
  const [autoDownloadFiles, setAutoDownloadFiles] = useState(false);
  const [autoDownloadVoice, setAutoDownloadVoice] = useState(true);
  const [autoDownloadVideoMessages, setAutoDownloadVideoMessages] = useState(true);
  const [autoDownloadGifs, setAutoDownloadGifs] = useState(true);
  const [autoplayGifs, setAutoplayGifs] = useState(true);
  const [autoplayVideos, setAutoplayVideos] = useState(false);
  const [downloadOnWifi, setDownloadOnWifi] = useState(false);
  const [downloadOnMobile, setDownloadOnMobile] = useState(true);
  const [downloadOnRoaming, setDownloadOnRoaming] = useState(false);
  const [saveToGallery, setSaveToGallery] = useState(false);
  const [editBeforeSending, setEditBeforeSending] = useState(true);
  const [compressPhotos, setCompressPhotos] = useState(true);
  const [compressVideos, setCompressVideos] = useState(true);
  const [streamVideos, setStreamVideos] = useState(true);
  const [lowDataMode, setLowDataMode] = useState(false);
  const [showClearCacheModal, setShowClearCacheModal] = useState(false);
  const [showClearDownloadsModal, setShowClearDownloadsModal] = useState(false);

  useEffect(() => { loadSettings(); }, []);

  const loadSettings = async () => {
    try {
      const keys = ['auto_download_photos', 'auto_download_videos', 'auto_download_files', 'auto_download_voice', 'auto_download_video_messages', 'auto_download_gifs', 'autoplay_gifs', 'autoplay_videos', 'download_on_wifi', 'download_on_mobile', 'download_on_roaming', 'save_to_gallery', 'edit_before_sending', 'compress_photos', 'compress_videos', 'stream_videos', 'low_data_mode'];
      const values = await AsyncStorage.multiGet(keys);
      const setters = {
        auto_download_photos: setAutoDownloadPhotos, auto_download_videos: setAutoDownloadVideos, auto_download_files: setAutoDownloadFiles, auto_download_voice: setAutoDownloadVoice, auto_download_video_messages: setAutoDownloadVideoMessages, auto_download_gifs: setAutoDownloadGifs, autoplay_gifs: setAutoplayGifs, autoplay_videos: setAutoplayVideos, download_on_wifi: setDownloadOnWifi, download_on_mobile: setDownloadOnMobile, download_on_roaming: setDownloadOnRoaming, save_to_gallery: setSaveToGallery, edit_before_sending: setEditBeforeSending, compress_photos: setCompressPhotos, compress_videos: setCompressVideos, stream_videos: setStreamVideos, low_data_mode: setLowDataMode
      };
      values.forEach(([key, value]) => {
        if (value && setters[key]) setters[key](value === 'true');
      });
    } catch (error) { console.error('не загрузились настройки:', error); }
  };

  const saveSetting = (key, value) => AsyncStorage.setItem(key, String(value)).catch(console.error);
  const handleToggle = (key, setter) => (value) => (setter(value), saveSetting(key, value));
  const confirmClearCache = () => (setShowClearCacheModal(false), AsyncStorage.removeItem('cached_media').catch(console.error));
  const confirmClearDownloads = () => (setShowClearDownloadsModal(false), AsyncStorage.removeItem('downloaded_files').catch(console.error));

  return (
    <SafeAreaView style={[s.container, { backgroundColor: theme.background }]}>
      <StatusBar barStyle={theme.statusBar} />
      <View style={[s.header, { backgroundColor: theme.background, borderBottomColor: theme.divider }]}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={s.backButton}>
          <Ionicons name="chevron-back" size={28} color={theme.primary} />
        </TouchableOpacity>
        <Text style={[s.headerTitle, { color: theme.text }]}>{t('settings.dataStorage')}</Text>
        <View style={s.placeholder} />
      </View>
      <ScrollView contentContainerStyle={s.scrollContent} showsVerticalScrollIndicator={false}>
        <Text style={[s.sectionTitle, { color: theme.textSecondary }]}>{t('dataStorage.autoDownload')}</Text>
        <View style={[s.section, { backgroundColor: theme.surface }]}>
          {[
            { label: t('dataStorage.photos'), value: autoDownloadPhotos, setter: setAutoDownloadPhotos, key: 'auto_download_photos' },
            { label: t('dataStorage.videos'), value: autoDownloadVideos, setter: setAutoDownloadVideos, key: 'auto_download_videos' },
            { label: t('dataStorage.files'), value: autoDownloadFiles, setter: setAutoDownloadFiles, key: 'auto_download_files' },
            { label: t('dataStorage.voiceMessages'), value: autoDownloadVoice, setter: setAutoDownloadVoice, key: 'auto_download_voice' },
            { label: t('dataStorage.videoMessages'), value: autoDownloadVideoMessages, setter: setAutoDownloadVideoMessages, key: 'auto_download_video_messages' },
            { label: t('dataStorage.gifs'), value: autoDownloadGifs, setter: setAutoDownloadGifs, key: 'auto_download_gifs', last: true }
          ].map(({ label, value, setter, key, last }, i) => (
            <View key={i} style={[s.row, !last && { borderBottomWidth: 0.5, borderBottomColor: theme.divider }]}>
              <Text style={[s.label, { color: theme.text }]}>{label}</Text>
              <Switch value={value} onValueChange={handleToggle(key, setter)} trackColor={{ false: '#E5E5EA', true: theme.primary }} thumbColor="#FFFFFF" />
            </View>
          ))}
        </View>
        <Text style={[s.sectionTitle, { color: theme.textSecondary }]}>{t('dataStorage.autoplay')}</Text>
        <View style={[s.section, { backgroundColor: theme.surface }]}>
          <View style={[s.row, { borderBottomWidth: 0.5, borderBottomColor: theme.divider }]}>
            <Text style={[s.label, { color: theme.text }]}>{t('dataStorage.gifs')}</Text>
            <Switch value={autoplayGifs} onValueChange={handleToggle('autoplay_gifs', setAutoplayGifs)} trackColor={{ false: '#E5E5EA', true: theme.primary }} thumbColor="#FFFFFF" />
          </View>
          <View style={s.row}>
            <Text style={[s.label, { color: theme.text }]}>{t('dataStorage.videos')}</Text>
            <Switch value={autoplayVideos} onValueChange={handleToggle('autoplay_videos', setAutoplayVideos)} trackColor={{ false: '#E5E5EA', true: theme.primary }} thumbColor="#FFFFFF" />
          </View>
        </View>
        <Text style={[s.sectionTitle, { color: theme.textSecondary }]}>{t('dataStorage.downloadConditions')}</Text>
        <View style={[s.section, { backgroundColor: theme.surface }]}>
          <View style={[s.row, { borderBottomWidth: 0.5, borderBottomColor: theme.divider }]}>
            <Text style={[s.label, { color: theme.text }]}>{t('dataStorage.wifiOnly')}</Text>
            <Switch value={downloadOnWifi} onValueChange={handleToggle('download_on_wifi', setDownloadOnWifi)} trackColor={{ false: '#E5E5EA', true: theme.primary }} thumbColor="#FFFFFF" />
          </View>
          <View style={[s.row, { borderBottomWidth: 0.5, borderBottomColor: theme.divider }]}>
            <Text style={[s.label, { color: theme.text }]}>{t('dataStorage.mobileData')}</Text>
            <Switch value={downloadOnMobile} onValueChange={handleToggle('download_on_mobile', setDownloadOnMobile)} trackColor={{ false: '#E5E5EA', true: theme.primary }} thumbColor="#FFFFFF" />
          </View>
          <View style={s.row}>
            <Text style={[s.label, { color: theme.text }]}>{t('dataStorage.roaming')}</Text>
            <Switch value={downloadOnRoaming} onValueChange={handleToggle('download_on_roaming', setDownloadOnRoaming)} trackColor={{ false: '#E5E5EA', true: theme.primary }} thumbColor="#FFFFFF" />
          </View>
        </View>
        <Text style={[s.sectionTitle, { color: theme.textSecondary }]}>{t('dataStorage.mediaQuality')}</Text>
        <View style={[s.section, { backgroundColor: theme.surface }]}>
          <View style={[s.row, { borderBottomWidth: 0.5, borderBottomColor: theme.divider }]}>
            <Text style={[s.label, { color: theme.text }]}>{t('dataStorage.compressPhotos')}</Text>
            <Switch value={compressPhotos} onValueChange={handleToggle('compress_photos', setCompressPhotos)} trackColor={{ false: '#E5E5EA', true: theme.primary }} thumbColor="#FFFFFF" />
          </View>
          <View style={[s.row, { borderBottomWidth: 0.5, borderBottomColor: theme.divider }]}>
            <Text style={[s.label, { color: theme.text }]}>{t('dataStorage.compressVideos')}</Text>
            <Switch value={compressVideos} onValueChange={handleToggle('compress_videos', setCompressVideos)} trackColor={{ false: '#E5E5EA', true: theme.primary }} thumbColor="#FFFFFF" />
          </View>
          <View style={s.row}>
            <Text style={[s.label, { color: theme.text }]}>{t('dataStorage.streamVideos')}</Text>
            <Switch value={streamVideos} onValueChange={handleToggle('stream_videos', setStreamVideos)} trackColor={{ false: '#E5E5EA', true: theme.primary }} thumbColor="#FFFFFF" />
          </View>
        </View>
        <Text style={[s.sectionTitle, { color: theme.textSecondary }]}>{t('dataStorage.otherSettings')}</Text>
        <View style={[s.section, { backgroundColor: theme.surface }]}>
          <View style={[s.row, { borderBottomWidth: 0.5, borderBottomColor: theme.divider }]}>
            <Text style={[s.label, { color: theme.text }]}>{t('dataStorage.saveToGallery')}</Text>
            <Switch value={saveToGallery} onValueChange={handleToggle('save_to_gallery', setSaveToGallery)} trackColor={{ false: '#E5E5EA', true: theme.primary }} thumbColor="#FFFFFF" />
          </View>
          <View style={[s.row, { borderBottomWidth: 0.5, borderBottomColor: theme.divider }]}>
            <Text style={[s.label, { color: theme.text }]}>{t('dataStorage.editBeforeSending')}</Text>
            <Switch value={editBeforeSending} onValueChange={handleToggle('edit_before_sending', setEditBeforeSending)} trackColor={{ false: '#E5E5EA', true: theme.primary }} thumbColor="#FFFFFF" />
          </View>
          <View style={s.row}>
            <View style={s.labelContainer}>
              <Text style={[s.label, { color: theme.text }]}>{t('dataStorage.lowDataMode')}</Text>
              <Text style={[s.hint, { color: theme.textSecondary }]}>{t('dataStorage.lowDataModeHint')}</Text>
            </View>
            <Switch value={lowDataMode} onValueChange={handleToggle('low_data_mode', setLowDataMode)} trackColor={{ false: '#E5E5EA', true: theme.primary }} thumbColor="#FFFFFF" />
          </View>
        </View>
        <Text style={[s.sectionTitle, { color: theme.textSecondary }]}>{t('dataStorage.dataManagement')}</Text>
        <View style={[s.section, { backgroundColor: theme.surface }]}>
          {[
            { label: t('dataStorage.clearCache'), hint: t('dataStorage.clearCacheHint'), action: () => setShowClearCacheModal(true) },
            { label: t('dataStorage.deleteDownloads'), hint: t('dataStorage.deleteDownloadsHint'), action: () => setShowClearDownloadsModal(true), last: true }
          ].map(({ label, hint, action, last }, i) => (
            <TouchableOpacity key={i} style={[s.row, !last && { borderBottomWidth: 0.5, borderBottomColor: theme.divider }]} onPress={action} activeOpacity={0.7}>
              <View style={s.labelContainer}>
                <Text style={[s.label, { color: theme.text }]}>{label}</Text>
                <Text style={[s.hint, { color: theme.textSecondary }]}>{hint}</Text>
              </View>
              <Ionicons name="trash-outline" size={22} color={theme.error} />
            </TouchableOpacity>
          ))}
        </View>
        <Text style={[s.sectionHint, { color: theme.textSecondary }]}>{t('dataStorage.hint')}</Text>
      </ScrollView>
      <ConfirmModal visible={showClearCacheModal} title={t('dataStorage.clearCache')} message={t('dataStorage.clearCacheConfirm')} confirmText={t('dataStorage.clearCache')} cancelText={t('common.cancel')} onConfirm={confirmClearCache} onCancel={() => setShowClearCacheModal(false)} />
      <ConfirmModal visible={showClearDownloadsModal} title={t('dataStorage.deleteDownloads')} message={t('dataStorage.deleteDownloadsConfirm')} confirmText={t('common.delete')} cancelText={t('common.cancel')} onConfirm={confirmClearDownloads} onCancel={() => setShowClearDownloadsModal(false)} />
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  container: { flex: 1 },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, paddingVertical: 12, borderBottomWidth: 0.5 },
  backButton: { width: 40, height: 40, justifyContent: 'center' },
  headerTitle: { fontSize: 17, fontWeight: '500', flex: 1, textAlign: 'center' },
  placeholder: { width: 40 },
  scrollContent: { paddingBottom: 40 },
  sectionTitle: { fontSize: 13, fontWeight: '500', marginTop: 24, marginBottom: 8, marginLeft: 16, textTransform: 'uppercase' },
  section: { marginHorizontal: 16, borderRadius: 28, overflow: 'hidden' },
  row: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingVertical: 12, paddingHorizontal: 16 },
  label: { fontSize: 16, flex: 1 },
  labelContainer: { flex: 1, marginRight: 12 },
  hint: { fontSize: 13, marginTop: 2, lineHeight: 16 },
  sectionHint: { fontSize: 13, marginHorizontal: 16, marginTop: 12, lineHeight: 18 }
});
