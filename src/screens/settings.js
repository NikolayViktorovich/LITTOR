import { useContext, useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, SafeAreaView, ScrollView, StatusBar, ActivityIndicator, Image, Alert } from 'react-native';
import { useTranslation } from 'react-i18next';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import { AuthContext } from '../context/auth';
import { API_URL } from '../config/constants';
import { formatPhoneNumber } from '../utils/formatphone';
import ConfirmModal from '../components/confirm-modal';
import LanguageModal from '../components/language-modal';
import PhotoPickerModal from '../components/photo-picker-modal';
import PhotoViewer from '../components/photo-viewer';

export default function SettingsScreen({ navigation }) {
  const { user, signOut } = useContext(AuthContext);
  const { t, i18n } = useTranslation();
  
  const [showLang, setShowLang] = useState(false);
  const [showLogout, setShowLogout] = useState(false);
  const [showPhoto, setShowPhoto] = useState(false);
  const [showViewer, setShowViewer] = useState(false);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    load();
    const unsub = navigation.addListener('focus', () => load());
    return unsub;
  }, [navigation]);

  const load = async () => {
    if (!user) { setLoading(false); return; }
    try {
      const token = await AsyncStorage.getItem('token');
      const { data } = await axios.get(`${API_URL}/profile/${user?.id}`, { headers: { 'Authorization': `Bearer ${token}` } });
      if (data.photos && data.photos.length > 0) {
        data.photos = data.photos.map(p => p.startsWith('http') ? p : `${API_URL}${p}`);
      } else {
        data.photos = [];
      }
      setProfile(data);
    } catch {
      setProfile({ name: user?.name || user?.username || '', lastName: user?.lastName || '', phone: user?.phone || '', birthDate: user?.birthDate || '', username: user?.username || '', bio: '', photos: [] });
    } finally {
      setLoading(false);
    }
  };

  const handlePhoto = async (uri) => {
    if (!uri) return;
    setUploading(true);
    try {
      const fd = new FormData();
      fd.append('photo', { uri, type: 'image/jpeg', name: 'photo.jpg' });
      const token = await AsyncStorage.getItem('token');
      const res = await fetch(`${API_URL}/profile/${user.id}/photo`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'multipart/form-data' },
        body: fd
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Ошибка загрузки');
      if (data && data.photos) {
        const full = data.photos.map(p => p.startsWith('http') ? p : `${API_URL}${p}`);
        setProfile({ ...profile, photos: full });
      }
    } catch (e) {
      Alert.alert(t('editProfile.uploadError'), e.message || t('editProfile.uploadErrorMessage'));
    } finally {
      setUploading(false);
    }
  };

  const handleMain = async (idx) => {
    try {
      const token = await AsyncStorage.getItem('token');
      const { data } = await axios.put(`${API_URL}/profile/${user.id}/photo/main`, { photoIndex: idx }, { headers: { 'Authorization': `Bearer ${token}` } });
      const full = data.photos.map(p => p.startsWith('http') ? p : `${API_URL}${p}`);
      setProfile({ ...profile, photos: full });
      setShowViewer(false);
    } catch (e) {
      Alert.alert(t('editProfile.saveError'), e.response?.data?.message || t('editProfile.setMainPhotoError'));
    }
  };

  const handleDel = async (idx) => {
    try {
      const token = await AsyncStorage.getItem('token');
      const { data } = await axios.delete(`${API_URL}/profile/${user.id}/photo/${idx}`, { headers: { 'Authorization': `Bearer ${token}` } });
      const full = data.photos.map(p => p.startsWith('http') ? p : `${API_URL}${p}`);
      setProfile({ ...profile, photos: full });
      if (full.length === 0) setShowViewer(false);
    } catch (e) {
      Alert.alert(t('editProfile.saveError'), e.response?.data?.message || t('editProfile.deletePhotoError'));
    }
  };

  const langs = [{ code: 'ru', label: 'Русский', flag: '🇷🇺' }, { code: 'en', label: 'English', flag: '🇺🇸' }];

  const groups = [
    { items: [{ icon: 'person', label: t('settings.myProfile'), color: '#6366F1', action: () => navigation.navigate('profile') }] },
    { items: [
      { icon: 'notifications', label: t('settings.notifications'), color: '#FF3B30', action: () => navigation.navigate('notifications') },
      { icon: 'lock-closed', label: t('settings.privacy'), color: '#8E8E93', action: () => navigation.navigate('privacy') },
      { icon: 'folder', label: t('settings.dataStorage'), color: '#30D158', action: () => navigation.navigate('data') },
      { icon: 'color-palette', label: t('settings.appearance'), color: '#007AFF', action: () => navigation.navigate('appearance') },
      { icon: 'chatbubbles', label: t('settings.chatSettings'), color: '#5856D6', action: () => navigation.navigate('chat') },
      { icon: 'language', label: t('settings.language'), color: '#FF9500', value: langs.find(l => l.code === i18n.language)?.label, action: () => setShowLang(true) }
    ]},
    { items: [
      { icon: 'help-circle', label: t('settings.help'), color: '#FFD60A', action: () => navigation.navigate('help') },
      { icon: 'information-circle', label: t('settings.about'), color: '#BF5AF2', action: () => navigation.navigate('about') }
    ]}
  ];

  if (loading) return (
    <SafeAreaView style={s.wrap}>
      <StatusBar barStyle="light-content" />
      <View style={s.load}><ActivityIndicator size="large" color="#6366F1" /></View>
    </SafeAreaView>
  );

  return (
    <SafeAreaView style={s.wrap}>
      <StatusBar barStyle="light-content" />
      <View style={s.header}>
        <TouchableOpacity style={s.edit} onPress={() => navigation.navigate('edit', { profile })} activeOpacity={0.7}>
          <Text style={s.editTxt}>{t('profile.edit')}</Text>
        </TouchableOpacity>
      </View>
      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={s.prof}>
          <TouchableOpacity style={s.ava} onPress={() => profile?.photos?.length > 0 && setShowViewer(true)} activeOpacity={0.8}>
            {uploading ? <ActivityIndicator size="large" color="#FFF" /> : profile?.photos?.length > 0 ? <Image source={{ uri: profile.photos[0] }} style={s.avaImg} /> : <Text style={s.avaTxt}>{(profile?.name || user?.username || 'U').charAt(0).toUpperCase()}</Text>}
          </TouchableOpacity>
          <Text style={s.name}>{[profile?.name, profile?.lastName].filter(Boolean).join(' ') || user?.username || 'User'}</Text>
          <Text style={s.phone}>{formatPhoneNumber(profile?.phone) || 'Телефон не указан'}</Text>
          <TouchableOpacity style={s.photoBtn} onPress={() => setShowPhoto(true)} activeOpacity={0.7}>
            <Ionicons name="camera-outline" size={18} color="#007AFF" style={s.cam} />
            <Text style={s.photoBtnTxt}>{t('settings.changePhoto')}</Text>
          </TouchableOpacity>
        </View>
        {groups.map((g, gi) => (
          <View key={gi} style={s.group}>
            {g.items.map((it, ii) => (
              <TouchableOpacity key={ii} style={[s.item, ii !== g.items.length - 1 && s.border]} onPress={it.action} activeOpacity={0.7}>
                <View style={[s.icon, { backgroundColor: it.color }]}>
                  <Ionicons name={it.icon} size={20} color="#FFF" />
                </View>
                <Text style={s.label}>{it.label}</Text>
                <View style={s.right}>
                  {it.value && <Text style={s.val}>{it.value}</Text>}
                  <Ionicons name="chevron-forward" size={20} color="#8E8E93" />
                </View>
              </TouchableOpacity>
            ))}
          </View>
        ))}
        <View style={s.group}>
          <TouchableOpacity style={s.item} onPress={() => setShowLogout(true)} activeOpacity={0.7}>
            <View style={[s.icon, { backgroundColor: '#FF3B30' }]}>
              <Ionicons name="log-out" size={20} color="#FFF" />
            </View>
            <Text style={[s.label, { color: '#FF3B30' }]}>{t('settings.logout')}</Text>
          </TouchableOpacity>
        </View>
        <Text style={s.ver}>Littor v1.0.0</Text>
      </ScrollView>
      <PhotoViewer visible={showViewer} photos={profile?.photos || []} initialIndex={0} onClose={() => setShowViewer(false)} onSetMain={handleMain} onDelete={handleDel} />
      <PhotoPickerModal visible={showPhoto} onClose={() => setShowPhoto(false)} onPhotoSelected={handlePhoto} />
      <LanguageModal visible={showLang} currentLanguage={i18n.language} languages={langs} onSelect={(c) => i18n.changeLanguage(c)} onClose={() => setShowLang(false)} />
      <ConfirmModal visible={showLogout} title={t('settings.logout')} message={t('settings.logoutConfirm')} confirmText={t('settings.logout')} cancelText={t('common.cancel')} onConfirm={() => { setShowLogout(false); signOut(); }} onCancel={() => setShowLogout(false)} />
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  wrap: { flex: 1, backgroundColor: '#000' },
  load: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  header: { alignItems: 'flex-end', paddingHorizontal: 16, paddingTop: 8, paddingBottom: 8 },
  edit: { backgroundColor: '#1A1A1C', paddingHorizontal: 16, paddingVertical: 6, borderRadius: 16 },
  editTxt: { fontSize: 15, fontWeight: '600', color: '#007AFF' },
  prof: { alignItems: 'center', paddingTop: 16, paddingBottom: 16 },
  ava: { width: 100, height: 100, borderRadius: 50, backgroundColor: '#6366F1', justifyContent: 'center', alignItems: 'center', marginBottom: 16, overflow: 'hidden' },
  avaImg: { width: '100%', height: '100%' },
  avaTxt: { fontSize: 40, fontWeight: '700', color: '#FFF' },
  name: { fontSize: 24, fontWeight: '700', color: '#FFF', marginBottom: 4 },
  phone: { fontSize: 15, color: '#8E8E93', marginBottom: 16 },
  photoBtn: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 20, paddingVertical: 8, borderRadius: 20 },
  cam: { marginRight: 6 },
  photoBtnTxt: { fontSize: 15, fontWeight: '500', color: '#007AFF' },
  group: { backgroundColor: '#1A1A1C', marginHorizontal: 16, marginBottom: 16, borderRadius: 28, overflow: 'hidden' },
  item: { flexDirection: 'row', alignItems: 'center', paddingVertical: 12, paddingHorizontal: 12 },
  border: { borderBottomWidth: 0.5, borderBottomColor: '#2C2C2E' },
  icon: { width: 32, height: 32, borderRadius: 7, justifyContent: 'center', alignItems: 'center', marginRight: 10 },
  label: { flex: 1, fontSize: 16, fontWeight: '500', color: '#FFF' },
  right: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  val: { fontSize: 14, color: '#8E8E93' },
  ver: { textAlign: 'center', fontSize: 13, color: '#8E8E93', marginTop: 16, marginBottom: 100 }
});
