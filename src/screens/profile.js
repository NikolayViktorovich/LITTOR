import { useContext, useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, SafeAreaView, ScrollView, StatusBar, ActivityIndicator, Image, Alert, ActionSheetIOS, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import { useTranslation } from 'react-i18next';
import * as Clipboard from 'expo-clipboard';
import { AuthContext } from '../context/auth';
import { API_URL } from '../config/constants';
import { formatPhoneNumber } from '../utils/formatphone';
import { getAvatarColor } from '../utils/avatarcolors';
import PhotoPickerModal from '../components/photo-picker-modal';
import PhotoViewer from '../components/photo-viewer';
import QRModal from '../components/qr-modal';

export default function MyProfileScreen({ navigation }) {
  const { t } = useTranslation();
  const { user } = useContext(AuthContext);
  const [showPhoto, setShowPhoto] = useState(false);
  const [showViewer, setShowViewer] = useState(false);
  const [showQR, setShowQR] = useState(false);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    load();
    const unsub = navigation.addListener('focus', () => load());
    return unsub;
  }, [navigation]);

  const load = async () => {
    if (!user) return setLoading(false);
    try {
      const token = await AsyncStorage.getItem('token');
      const { data } = await axios.get(`${API_URL}/profile/${user.id}`, { headers: { 'Authorization': `Bearer ${token}` } });
      data.photos = data.photos?.length ? data.photos.map(p => p.startsWith('http') ? p : `${API_URL}${p}`) : [];
      setProfile(data);
    } catch {
      setProfile({ name: user.name || user.username || '', lastName: user.lastName || '', phone: user.phone || '', birthDate: user.birthDate || '', username: user.username || '', bio: '', photos: [] });
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
      if (data?.photos) {
        setProfile({ ...profile, photos: data.photos.map(p => p.startsWith('http') ? p : `${API_URL}${p}`) });
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

  const copyPhone = async () => {
    if (!profile?.phone) return;
    if (Platform.OS === 'ios') {
      ActionSheetIOS.showActionSheetWithOptions(
        { options: [t('common.cancel'), t('common.copy')], cancelButtonIndex: 0 },
        (i) => { if (i === 1) Clipboard.setStringAsync(profile.phone); }
      );
    } else {
      await Clipboard.setStringAsync(profile.phone);
      Alert.alert(t('profile.copied'), t('profile.phoneCopied'));
    }
  };

  const copyUsername = async () => {
    if (!profile?.username) return;
    if (Platform.OS === 'ios') {
      ActionSheetIOS.showActionSheetWithOptions(
        { options: [t('common.cancel'), t('common.copy')], cancelButtonIndex: 0 },
        (i) => { if (i === 1) Clipboard.setStringAsync(`@${profile.username}`); }
      );
    } else {
      await Clipboard.setStringAsync(`@${profile.username}`);
      Alert.alert(t('profile.copied'), t('profile.usernameCopied'));
    }
  };

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
        <TouchableOpacity onPress={() => navigation.goBack()} style={s.back}>
          <Ionicons name="chevron-back" size={28} color="#007AFF" />
        </TouchableOpacity>
        <TouchableOpacity style={s.edit} onPress={() => navigation.navigate('edit', { profile })} activeOpacity={0.7}>
          <Text style={s.editTxt}>{t('profile.edit')}</Text>
        </TouchableOpacity>
      </View>
      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={s.prof}>
          <View style={s.avaCont}>
            <TouchableOpacity style={s.ava} onPress={() => profile?.photos?.length > 0 && setShowViewer(true)} activeOpacity={0.8}>
              {uploading ? <ActivityIndicator size="large" color="#FFF" /> : profile?.photos?.length > 0 ? <Image source={{ uri: profile.photos[0] }} style={s.avaImg} /> : <View style={[s.avaPlaceholder, { backgroundColor: getAvatarColor(user?.id) }]}><Text style={s.avaTxt}>{(profile?.name || user?.username || 'U').charAt(0).toUpperCase()}</Text></View>}
            </TouchableOpacity>
            {profile?.photos && profile.photos.length > 1 && (
              <View style={s.dots}>
                {profile.photos.slice(0, 4).map((_, i) => <View key={i} style={[s.dot, i === 0 && s.dotActive]} />)}
              </View>
            )}
          </View>
          <Text style={s.name}>{[profile?.name, profile?.lastName].filter(Boolean).join(' ') || user?.username || 'User'}</Text>
          <View style={s.status}>
            <Text style={{ color: '#8E8E93' }}>{t('profile.online')}</Text>
            {profile?.username && <Text style={s.username}>• @{profile.username}</Text>}
          </View>
        </View>
        {profile?.username && (
          <View style={s.chan}>
            <View style={s.chanHead}><Text style={s.chanLabel}>{t('profile.channel')}</Text></View>
            <TouchableOpacity style={s.chanCard} activeOpacity={0.7}>
              <View style={[s.chanAva, { backgroundColor: getAvatarColor(user?.id) }]}>
                {profile?.photos?.length > 0 ? <Image source={{ uri: profile.photos[0] }} style={s.chanAvaImg} /> : <Text style={s.chanAvaTxt}>{(profile?.username || 'U').charAt(0).toUpperCase()}</Text>}
              </View>
              <View style={s.chanInfo}><Text style={s.chanName}>{profile.username}</Text></View>
            </TouchableOpacity>
          </View>
        )}
        <View style={s.info}>
          {profile?.phone && (
            <TouchableOpacity style={s.row} onLongPress={copyPhone} activeOpacity={0.7}>
              <View style={s.left}>
                <Text style={s.lbl}>{t('profile.mobile')}</Text>
                <Text style={s.val}>{formatPhoneNumber(profile.phone)}</Text>
              </View>
            </TouchableOpacity>
          )}
          {profile?.username && (
            <TouchableOpacity style={[s.row, profile?.phone && s.rowBorder]} onLongPress={copyUsername} activeOpacity={0.7}>
              <View style={s.left}>
                <Text style={s.lbl}>{t('profile.username')}</Text>
                <Text style={s.val}>@{profile.username}</Text>
              </View>
              <TouchableOpacity onPress={() => setShowQR(true)} activeOpacity={0.7}>
                <Ionicons name="qr-code-outline" size={24} color="#007AFF" />
              </TouchableOpacity>
            </TouchableOpacity>
          )}
          {profile?.birthDate && (
            <View style={[s.row, (profile?.phone || profile?.username) && s.rowBorder]}>
              <View style={s.left}>
                <Text style={s.lbl}>{t('profile.birthday')}</Text>
                <Text style={s.valWhite}>{profile.birthDate}</Text>
              </View>
            </View>
          )}
          {profile?.bio && (
            <View style={[s.row, (profile?.phone || profile?.username || profile?.birthDate) && s.rowBorder]}>
              <View style={s.left}>
                <Text style={s.lbl}>{t('profile.bio')}</Text>
                <Text style={s.valWhite}>{profile.bio}</Text>
              </View>
            </View>
          )}
        </View>
        <View style={s.space} />
      </ScrollView>
      <PhotoViewer visible={showViewer} photos={profile?.photos || []} initialIndex={0} onClose={() => setShowViewer(false)} onSetMain={handleMain} onDelete={handleDel} />
      <PhotoPickerModal visible={showPhoto} onClose={() => setShowPhoto(false)} onPhotoSelected={handlePhoto} />
      <QRModal visible={showQR} onClose={() => setShowQR(false)} username={profile?.username || user?.username || 'user'} />
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  wrap: { flex: 1, backgroundColor: '#000' },
  load: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 8, paddingVertical: 8 },
  back: { paddingHorizontal: 8 },
  edit: { backgroundColor: '#1A1A1C', paddingHorizontal: 16, paddingVertical: 6, borderRadius: 16 },
  editTxt: { fontSize: 15, fontWeight: '500', color: '#007AFF' },
  prof: { alignItems: 'center', paddingTop: 16, paddingBottom: 16 },
  avaCont: { position: 'relative', marginBottom: 16 },
  ava: { width: 100, height: 100, borderRadius: 50, justifyContent: 'center', alignItems: 'center', overflow: 'hidden' },
  avaPlaceholder: { width: '100%', height: '100%', justifyContent: 'center', alignItems: 'center' },
  avaImg: { width: '100%', height: '100%' },
  avaTxt: { fontSize: 40, fontWeight: '500', color: '#FFF' },
  dots: { flexDirection: 'row', position: 'absolute', bottom: -12, left: 0, right: 0, justifyContent: 'center', gap: 4 },
  dot: { width: 6, height: 6, borderRadius: 3, backgroundColor: '#3A3A3C' },
  dotActive: { backgroundColor: '#007AFF' },
  name: { fontSize: 24, fontWeight: '500', color: '#FFF', marginBottom: 4, textAlign: 'center' },
  status: { fontSize: 15, color: '#8E8E93', flexDirection: 'row', alignItems: 'center', gap: 8 },
  username: { fontSize: 15, color: '#8E8E93' },
  chan: { marginBottom: 8 },
  chanHead: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 8 },
  chanLabel: { fontSize: 13, fontWeight: '500', color: '#8E8E93', letterSpacing: 0.5 },
  chanCard: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#1A1A1C', marginHorizontal: 16, padding: 12, borderRadius: 28 },
  chanAva: { width: 48, height: 48, borderRadius: 24, justifyContent: 'center', alignItems: 'center', marginRight: 12, overflow: 'hidden' },
  chanAvaImg: { width: '100%', height: '100%' },
  chanAvaTxt: { fontSize: 20, fontWeight: '500', color: '#FFF' },
  chanInfo: { flex: 1 },
  chanName: { fontSize: 16, fontWeight: '500', color: '#FFF', marginBottom: 2 },
  info: { backgroundColor: '#1A1A1C', marginHorizontal: 16, marginTop: 8, borderRadius: 28, overflow: 'hidden' },
  row: { paddingVertical: 14, paddingHorizontal: 16, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  rowBorder: { borderTopWidth: 0.5, borderTopColor: '#2C2C2E' },
  left: { flex: 1 },
  lbl: { fontSize: 13, color: '#8E8E93', marginBottom: 2 },
  val: { fontSize: 17, color: '#007AFF' },
  valWhite: { fontSize: 17, color: '#FFF' },
  space: { height: 100 }
});
