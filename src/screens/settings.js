import { useContext, useState, useEffect, useRef } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, SafeAreaView, ScrollView, StatusBar, ActivityIndicator, Image, Alert, ActionSheetIOS, Platform, Animated } from 'react-native';
import { useTranslation } from 'react-i18next';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import { AuthContext } from '../context/auth';
import { API_URL } from '../config/constants';
import { formatPhoneNumber } from '../utils/formatphone';
import { getAvatarColor } from '../utils/avatarcolors';
import ConfirmModal from '../components/confirm-modal';
import LanguageModal from '../components/language-modal';
import PhotoPickerModal from '../components/photo-picker-modal';
import PhotoViewer from '../components/photo-viewer';

export default function SettingsScreen({ navigation }) {
  const { user, signOut, accounts, switchAccount, removeAccount } = useContext(AuthContext);
  const { t, i18n } = useTranslation();
  
  const [showLang, setShowLang] = useState(false);
  const [showLogout, setShowLogout] = useState(false);
  const [showPhoto, setShowPhoto] = useState(false);
  const [showViewer, setShowViewer] = useState(false);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [switching, setSwitching] = useState(null);
  const fadeAnim = useRef(new Animated.Value(1)).current;
  const scaleAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    load();
    const unsub = navigation.addListener('focus', () => load());
    return unsub;
  }, [navigation, user]);

  const load = async (userId = null) => {
    const targetUserId = userId || user?.id;
    if (!targetUserId) { setLoading(false); return; }
    try {
      const token = await AsyncStorage.getItem('token');
      const { data } = await axios.get(`${API_URL}/profile/${targetUserId}`, { headers: { 'Authorization': `Bearer ${token}` } });
      if (data.photos && data.photos.length > 0) {
        data.photos = data.photos.map(p => p.startsWith('http') ? p : `${API_URL}${p}`);
      } else {
        data.photos = [];
      }
      setProfile(data);
    } catch {
      const currentUser = userId ? null : user;
      setProfile({ name: currentUser?.name || currentUser?.username || '', lastName: currentUser?.lastName || '', phone: currentUser?.phone || '', birthDate: currentUser?.birthDate || '', username: currentUser?.username || '', bio: '', photos: [] });
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

  const handleSwitch = async (userId) => {
    if (userId === user?.id) return;
    setSwitching(userId);
    
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true
      }),
      Animated.timing(scaleAnim, {
        toValue: 0.95,
        duration: 200,
        useNativeDriver: true
      })
    ]).start();

    try {
      await switchAccount(userId);
      await load(userId);
      
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true
        }),
        Animated.timing(scaleAnim, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true
        })
      ]).start();
    } catch (e) {
      Alert.alert('Ошибка', e.response?.data?.message || 'Не удалось переключить аккаунт');
      
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 200,
          useNativeDriver: true
        }),
        Animated.timing(scaleAnim, {
          toValue: 1,
          duration: 200,
          useNativeDriver: true
        })
      ]).start();
    } finally {
      setSwitching(null);
    }
  };

  const handleAccountLongPress = (acc) => {
    if (Platform.OS === 'ios') {
      ActionSheetIOS.showActionSheetWithOptions(
        {
          options: ['Отмена', 'Удалить аккаунт'],
          destructiveButtonIndex: 1,
          cancelButtonIndex: 0
        },
        (i) => {
          if (i === 1) {
            Alert.alert(
              'Удалить аккаунт',
              'Вы уверены, что хотите удалить этот аккаунт с устройства?',
              [
                { text: 'Отмена', style: 'cancel' },
                {
                  text: 'Удалить',
                  style: 'destructive',
                  onPress: async () => {
                    try {
                      await removeAccount(acc.userId);
                    } catch (e) {
                      Alert.alert('Ошибка', 'Не удалось удалить аккаунт');
                    }
                  }
                }
              ]
            );
          }
        }
      );
    } else {
      Alert.alert(
        'Удалить аккаунт',
        'Вы уверены, что хотите удалить этот аккаунт с устройства?',
        [
          { text: 'Отмена', style: 'cancel' },
          {
            text: 'Удалить',
            style: 'destructive',
            onPress: async () => {
              try {
                await removeAccount(acc.userId);
              } catch (e) {
                Alert.alert('Ошибка', 'Не удалось удалить аккаунт');
              }
            }
          }
        ]
      );
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
        <Animated.View style={{ opacity: fadeAnim, transform: [{ scale: scaleAnim }] }}>
          <View style={s.prof}>
            <TouchableOpacity style={s.ava} onPress={() => profile?.photos?.length > 0 && setShowViewer(true)} activeOpacity={0.8}>
              {uploading ? <ActivityIndicator size="large" color="#FFF" /> : profile?.photos?.length > 0 ? <Image source={{ uri: profile.photos[0] }} style={s.avaImg} /> : <View style={[s.avaPlaceholder, { backgroundColor: getAvatarColor(user?.id) }]}><Text style={s.avaTxt}>{(profile?.name || user?.username || 'U').charAt(0).toUpperCase()}</Text></View>}
            </TouchableOpacity>
            <Text style={s.name}>{[profile?.name, profile?.lastName].filter(Boolean).join(' ') || user?.username || 'User'}</Text>
            <View style={s.phone}>
              <Text style={{ color: '#8E8E93' }}>{formatPhoneNumber(profile?.phone) || 'Телефон не указан'}</Text>
              {profile?.username && <Text style={s.username}>• @{profile.username}</Text>}
            </View>
            <TouchableOpacity style={s.photoBtn} onPress={() => setShowPhoto(true)} activeOpacity={0.7}>
              <Ionicons name="camera-outline" size={18} color="#007AFF" style={s.cam} />
              <Text style={s.photoBtnTxt}>{t('settings.changePhoto')}</Text>
            </TouchableOpacity>
          </View>
        </Animated.View>

        {accounts.filter(a => a.userId !== user?.id).length > 0 && (
          <View style={s.group}>
            {accounts.filter(a => a.userId !== user?.id).map((acc, i) => (
              <TouchableOpacity
                key={acc.userId}
                style={[s.accountItem, i < accounts.filter(a => a.userId !== user?.id).length - 1 && s.border]}
                onPress={() => handleSwitch(acc.userId)}
                onLongPress={() => handleAccountLongPress(acc)}
                activeOpacity={0.7}
              >
                <View style={[s.accountAva, { backgroundColor: getAvatarColor(acc.userId) }]}>
                  {acc.photo ? (
                    <Image source={{ uri: acc.photo }} style={s.accountAvaImg} />
                  ) : (
                    <Text style={s.accountAvaTxt}>{(acc.name || acc.username || 'U').charAt(0).toUpperCase()}</Text>
                  )}
                </View>
                <View style={s.accountInfo}>
                  <Text style={s.accountName}>{[acc.name, acc.lastName].filter(Boolean).join(' ') || acc.username}</Text>
                </View>
                {switching === acc.userId ? (
                  <ActivityIndicator size="small" color="#007AFF" />
                ) : (
                  <Ionicons name="chevron-forward" size={20} color="#8E8E93" />
                )}
              </TouchableOpacity>
            ))}
            <TouchableOpacity style={[s.accountItem, s.addAccountBtn]} onPress={() => navigation.navigate('addAccount')} activeOpacity={0.7}>
              <View style={s.addAccountIcon}>
                <Ionicons name="add" size={32} color="#007AFF" />
              </View>
              <Text style={s.addAccountTxt}>{t('settings.addAccount')}</Text>
            </TouchableOpacity>
          </View>
        )}

        {accounts.filter(a => a.userId !== user?.id).length === 0 && (
          <View style={s.group}>
            <TouchableOpacity style={s.accountItem} onPress={() => navigation.navigate('addAccount')} activeOpacity={0.7}>
              <View style={s.addAccountIcon}>
                <Ionicons name="add" size={32} color="#007AFF" />
              </View>
              <Text style={s.addAccountTxt}>{t('settings.addAccount')}</Text>
            </TouchableOpacity>
          </View>
        )}

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
        <Text style={s.ver}>LITTOR v1.0.7</Text>
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
  editTxt: { fontSize: 15, fontWeight: '500', color: '#007AFF' },
  prof: { alignItems: 'center', paddingTop: 16, paddingBottom: 16 },
  ava: { width: 100, height: 100, borderRadius: 50, justifyContent: 'center', alignItems: 'center', marginBottom: 16, overflow: 'hidden' },
  avaPlaceholder: { width: '100%', height: '100%', justifyContent: 'center', alignItems: 'center' },
  avaImg: { width: '100%', height: '100%' },
  avaTxt: { fontSize: 40, fontWeight: '600', color: '#FFF' },
  name: { fontSize: 24, fontWeight: '600', color: '#FFF', marginBottom: 4 },
  phone: { fontSize: 15, color: '#8E8E93', marginBottom: 16, flexDirection: 'row', alignItems: 'center', gap: 8 },
  username: { fontSize: 15, color: '#8E8E93' },
  photoBtn: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 20, paddingVertical: 8, borderRadius: 20 },
  cam: { marginRight: 6 },
  photoBtnTxt: { fontSize: 15, fontWeight: '400', color: '#007AFF' },
  group: { backgroundColor: '#1A1A1C', marginHorizontal: 16, marginBottom: 16, borderRadius: 28, overflow: 'hidden' },
  item: { flexDirection: 'row', alignItems: 'center', paddingVertical: 12, paddingHorizontal: 12 },
  border: { borderBottomWidth: 0.5, borderBottomColor: '#2C2C2E' },
  icon: { width: 32, height: 32, borderRadius: 7, justifyContent: 'center', alignItems: 'center', marginRight: 10 },
  label: { flex: 1, fontSize: 16, fontWeight: '400', color: '#FFF' },
  right: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  val: { fontSize: 14, color: '#8E8E93' },
  accountItem: { flexDirection: 'row', alignItems: 'center', paddingVertical: 8, paddingHorizontal: 12 },
  accountAva: { width: 40, height: 40, borderRadius: 20, justifyContent: 'center', alignItems: 'center', marginRight: 12, overflow: 'hidden' },
  accountAvaImg: { width: '100%', height: '100%' },
  accountAvaTxt: { fontSize: 18, fontWeight: '400', color: '#FFF' },
  accountInfo: { flex: 1 },
  accountName: { fontSize: 16, fontWeight: '400', color: '#FFF', marginBottom: 2 },
  accountPhone: { fontSize: 14, color: '#8E8E93' },
  addAccountBtn: { borderTopWidth: 0.5, borderTopColor: '#2C2C2E' },
  addAccountIcon: { width: 40, height: 40, justifyContent: 'center', alignItems: 'center', marginRight: 12 },
  addAccountTxt: { fontSize: 16, fontWeight: '400', color: '#007AFF', flex: 1 },
  ver: { textAlign: 'center', fontSize: 13, color: '#8E8E93', marginTop: 16, marginBottom: 100 }
});
