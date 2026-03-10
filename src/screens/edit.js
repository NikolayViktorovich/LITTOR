import { useState, useContext, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, SafeAreaView, ScrollView, StatusBar, ActivityIndicator, Image, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import { useTranslation } from 'react-i18next';
import { AuthContext } from '../context/auth';
import { API_URL } from '../config/constants';
import { formatPhoneNumber } from '../utils/formatphone';
import { getAvatarColor } from '../utils/avatarcolors';
import PhotoPickerModal from '../components/photo-picker-modal';
import EditPhoneModal from '../components/edit-phone-modal';
import EditUsernameModal from '../components/edit-username-modal';
import DatePickerModal from '../components/date-picker-modal';

export default function EditProfileScreen({ navigation, route }) {
  const { t } = useTranslation();
  const { user } = useContext(AuthContext);
  const { profile: init } = route.params || {};
  
  const [profile, setProfile] = useState(init || {});
  const [name, setName] = useState(init?.name || '');
  const [lastName, setLastName] = useState(init?.lastName || '');
  const [bio, setBio] = useState(init?.bio || '');
  const [phone, setPhone] = useState(init?.phone || '');
  const [birthDate, setBirthDate] = useState(init?.birthDate || '');
  const [username, setUsername] = useState(init?.username || '');
  const [uploading, setUploading] = useState(false);
  const [showPhoto, setShowPhoto] = useState(false);
  const [showPhone, setShowPhone] = useState(false);
  const [showDate, setShowDate] = useState(false);
  const [showUser, setShowUser] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    navigation.setOptions({
      headerLeft: () => (
        <TouchableOpacity onPress={() => navigation.goBack()} style={{ paddingLeft: 8, flexDirection: 'row', alignItems: 'center' }}>
          <Ionicons name="chevron-back" size={28} color="#007AFF" />
        </TouchableOpacity>
      ),
      headerTitle: '',
      headerStyle: { backgroundColor: '#000' },
      headerShadowVisible: false,
      headerRight: () => (
        <TouchableOpacity onPress={saveAll} disabled={saving} style={{ paddingRight: 16 }}>
          {saving ? <ActivityIndicator size="small" color="#007AFF" /> : <Text style={{ fontSize: 17, fontWeight: '500', color: '#007AFF' }}>{t('editProfile.done')}</Text>}
        </TouchableOpacity>
      )
    });
  }, [navigation, saving, name, lastName, bio, phone, birthDate, username, t]);

  const save = async (field, value) => {
    try {
      const token = await AsyncStorage.getItem('token');
      await axios.put(`${API_URL}/profile/${user.id}`, 
        { name, lastName, username, bio, phone, birthDate, [field]: value },
        { headers: { 'Authorization': `Bearer ${token}` } }
      );
    } catch (e) {
      Alert.alert(t('editProfile.saveError'), e.response?.data?.message || t('editProfile.saveErrorMessage'));
      throw e;
    }
  };

  const saveAll = async () => {
    setSaving(true);
    try {
      const token = await AsyncStorage.getItem('token');
      const data = { name, lastName, username, bio, phone, birthDate };
      const res = await axios.put(`${API_URL}/profile/${user.id}`, data, { headers: { 'Authorization': `Bearer ${token}` } });
      if (res.data) setProfile(res.data);
      navigation.goBack();
    } catch (e) {
      Alert.alert(t('editProfile.saveError'), e.response?.data?.message || t('editProfile.saveErrorMessage'));
    } finally {
      setSaving(false);
    }
  };

  const blur = (field, value) => value !== init?.[field] && save(field, value);

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

  return (
    <SafeAreaView style={s.wrap}>
      <StatusBar barStyle="light-content" />
      <View style={s.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={s.back}>
          <Ionicons name="chevron-back" size={28} color="#007AFF" />
        </TouchableOpacity>
        <View style={{ position: 'absolute', left: 0, right: 0, alignItems: 'center', pointerEvents: 'none' }}>
          <Text style={s.title}>{t('editProfile.title')}</Text>
        </View>
        <TouchableOpacity onPress={saveAll} disabled={saving} style={s.done}>
          {saving ? <ActivityIndicator size="small" color="#007AFF" /> : <Text style={s.doneTxt}>{t('editProfile.done')}</Text>}
        </TouchableOpacity>
      </View>
      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={s.photo}>
          <TouchableOpacity style={[s.ava, { backgroundColor: getAvatarColor(user?.id) }]} onPress={() => setShowPhoto(true)} activeOpacity={0.8}>
            {uploading ? <ActivityIndicator size="large" color="#FFF" /> : profile?.photos?.length > 0 ? <Image source={{ uri: profile.photos[0] }} style={s.avaImg} /> : <Text style={s.avaTxt}>{(name || username || 'U').charAt(0).toUpperCase()}</Text>}
          </TouchableOpacity>
          <TouchableOpacity onPress={() => setShowPhoto(true)} activeOpacity={0.7}>
            <Text style={s.change}>{t('editProfile.selectPhoto')}</Text>
          </TouchableOpacity>
        </View>
        <View style={s.sec}>
          <View style={s.inp}>
            <TextInput style={s.txt} value={name} onChangeText={setName} onBlur={() => blur('name', name)} placeholder={t('editProfile.firstName')} placeholderTextColor="#8E8E93" maxLength={50} />
          </View>
          <View style={[s.inp, s.last]}>
            <TextInput style={s.txt} value={lastName} onChangeText={setLastName} onBlur={() => blur('lastName', lastName)} placeholder={t('editProfile.lastName')} placeholderTextColor="#8E8E93" maxLength={50} />
          </View>
        </View>
        <Text style={s.hint}>{t('editProfile.nameHint')}</Text>
        <View style={s.sec}>
          <View style={s.inp}>
            <TextInput style={[s.txt, s.multi]} value={bio} onChangeText={setBio} onBlur={() => blur('bio', bio)} placeholder={t('editProfile.bioPlaceholder')} placeholderTextColor="#8E8E93" multiline maxLength={70} textAlignVertical="top" />
            {bio.length > 0 && <Text style={s.cnt}>{bio.length}/70</Text>}
          </View>
        </View>
        <Text style={s.hint}>{t('editProfile.bioHint')}</Text>
        <View style={s.sec}>
          <TouchableOpacity style={s.row} onPress={() => setShowDate(true)} activeOpacity={0.7}>
            <Text style={s.lbl}>{t('editProfile.birthdayLabel')}</Text>
            <Text style={[s.val, !birthDate && s.ph]}>{birthDate || t('editProfile.birthdayNotSet')}</Text>
          </TouchableOpacity>
        </View>
        <Text style={s.hint}>{t('editProfile.birthdayHint')}</Text>
        <View style={s.sec}>
          <TouchableOpacity style={s.row} onPress={() => setShowPhone(true)} activeOpacity={0.7}>
            <Text style={s.lbl}>{t('editProfile.changeNumber')}</Text>
            <Text style={[s.val, !phone && s.ph]}>{formatPhoneNumber(phone) || t('editProfile.phoneNotSet')}</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[s.row, s.last]} onPress={() => setShowUser(true)} activeOpacity={0.7}>
            <Text style={s.lbl}>{t('editProfile.usernameLabel')}</Text>
            <Text style={[s.val, !username && s.ph]}>{username || t('editProfile.usernameNotSet')}</Text>
          </TouchableOpacity>
        </View>
        <View style={s.space} />
      </ScrollView>
      <PhotoPickerModal visible={showPhoto} onClose={() => setShowPhoto(false)} onPhotoSelected={handlePhoto} />
      <DatePickerModal visible={showDate} onClose={() => setShowDate(false)} onSave={(v) => { setBirthDate(v); save('birthDate', v); }} value={birthDate} />
      <EditPhoneModal visible={showPhone} onClose={() => setShowPhone(false)} onSave={(v) => { setPhone(v); save('phone', v); }} value={phone} />
      <EditUsernameModal visible={showUser} onClose={() => setShowUser(false)} onSave={(v) => { setUsername(v); save('username', v); }} value={username} />
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  wrap: { flex: 1, backgroundColor: '#000' },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 8, paddingVertical: 8 },
  back: { paddingHorizontal: 8, zIndex: 1 },
  title: { fontSize: 17, fontWeight: '500', color: '#FFF' },
  done: { paddingHorizontal: 8, minWidth: 60, alignItems: 'flex-end', zIndex: 1 },
  doneTxt: { fontSize: 17, fontWeight: '500', color: '#007AFF' },
  photo: { alignItems: 'center', paddingVertical: 32 },
  ava: { width: 100, height: 100, borderRadius: 50, justifyContent: 'center', alignItems: 'center', marginBottom: 16, overflow: 'hidden' },
  avaImg: { width: '100%', height: '100%' },
  avaTxt: { fontSize: 40, fontWeight: '500', color: '#FFF' },
  change: { fontSize: 17, color: '#007AFF' },
  sec: { backgroundColor: '#1A1A1C', marginHorizontal: 16, marginBottom: 8, borderRadius: 28, overflow: 'hidden' },
  inp: { paddingHorizontal: 16, paddingVertical: 12, borderBottomWidth: 0.5, borderBottomColor: '#2C2C2E' },
  row: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, paddingVertical: 12, borderBottomWidth: 0.5, borderBottomColor: '#2C2C2E' },
  last: { borderBottomWidth: 0 },
  txt: { fontSize: 17, color: '#FFF' },
  multi: { minHeight: 60, paddingTop: 0 },
  cnt: { fontSize: 13, color: '#8E8E93', marginTop: 8, textAlign: 'right' },
  lbl: { fontSize: 17, color: '#FFF' },
  val: { fontSize: 17, color: '#8E8E93' },
  ph: { color: '#8E8E93' },
  hint: { fontSize: 13, color: '#8E8E93', paddingHorizontal: 32, marginBottom: 24, lineHeight: 18 },
  space: { height: 40 }
});
