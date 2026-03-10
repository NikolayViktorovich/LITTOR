import { useContext, useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, SafeAreaView, ScrollView, Switch, StatusBar } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import { ThemeContext } from '../context/theme';
import OptionModal from '../components/option-modal';

export default function PrivacySettingsScreen({ navigation }) {
  const { t } = useTranslation();
  const { theme } = useContext(ThemeContext);
  const [statusVisible, setStatusVisible] = useState(true);
  const [readReceiptsEnabled, setReadReceiptsEnabled] = useState(true);
  const [onlineStatusVisible, setOnlineStatusVisible] = useState(true);
  const [forwardingEnabled, setForwardingEnabled] = useState(true);
  const [voiceMessagesEnabled, setVoiceMessagesEnabled] = useState(true);
  const [bioVisible, setBioVisible] = useState(true);
  const [birthdayVisible, setBirthdayVisible] = useState(false);
  const [phoneNumberVisible, setPhoneNumberVisible] = useState(false);
  const [showLastSeenModal, setShowLastSeenModal] = useState(false);
  const [showProfilePhotoModal, setShowProfilePhotoModal] = useState(false);
  const [showCallsModal, setShowCallsModal] = useState(false);
  const [showGroupsModal, setShowGroupsModal] = useState(false);
  const [lastSeenOption, setLastSeenOption] = useState('everybody');
  const [profilePhotoOption, setProfilePhotoOption] = useState('everybody');
  const [callsOption, setCallsOption] = useState('everybody');
  const [groupsOption, setGroupsOption] = useState('everybody');

  useEffect(() => { loadSettings(); }, []);

  const loadSettings = async () => {
    try {
      const keys = ['status_visible', 'read_receipts_enabled', 'online_status_visible', 'forwarding_enabled', 'voice_messages_enabled', 'bio_visible', 'birthday_visible', 'phone_number_visible', 'last_seen_option', 'profile_photo_option', 'calls_option', 'groups_option'];
      const values = await AsyncStorage.multiGet(keys);
      const setters = {
        last_seen_option: setLastSeenOption, profile_photo_option: setProfilePhotoOption, calls_option: setCallsOption, groups_option: setGroupsOption, status_visible: setStatusVisible, read_receipts_enabled: setReadReceiptsEnabled, online_status_visible: setOnlineStatusVisible, forwarding_enabled: setForwardingEnabled, voice_messages_enabled: setVoiceMessagesEnabled, bio_visible: setBioVisible, birthday_visible: setBirthdayVisible, phone_number_visible: setPhoneNumberVisible
      };
      values.forEach(([key, value]) => {
        if (value && setters[key]) setters[key](key.includes('_option') ? value : value === 'true');
      });
    } catch (error) { console.error('не загрузились настройки:', error); }
  };

  const saveSetting = (key, value) => AsyncStorage.setItem(key, String(value)).catch(console.error);
  const handleToggle = (key, setter) => (value) => (setter(value), saveSetting(key, value));

  const privacyOptions = [
    { value: 'everybody', label: t('privacy.everybody') },
    { value: 'contacts', label: t('privacy.contacts') },
    { value: 'nobody', label: t('privacy.nobody') }
  ];

  const getOptionLabel = (value) => privacyOptions.find(opt => opt.value === value)?.label || t('privacy.everybody');

  return (
    <SafeAreaView style={[s.container, { backgroundColor: theme.background }]}>
      <StatusBar barStyle={theme.statusBar} />
      <View style={[s.header, { backgroundColor: theme.background, borderBottomColor: theme.divider }]}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={s.backButton}>
          <Ionicons name="chevron-back" size={28} color={theme.primary} />
        </TouchableOpacity>
        <Text style={[s.headerTitle, { color: theme.text }]}>{t('settings.privacy')}</Text>
        <View style={s.placeholder} />
      </View>
      <ScrollView contentContainerStyle={s.scrollContent} showsVerticalScrollIndicator={false}>
        <Text style={[s.sectionTitle, { color: theme.textSecondary }]}>{t('privacy.whoCanSee')}</Text>
        <View style={[s.section, { backgroundColor: theme.surface }]}>
          <TouchableOpacity style={[s.row, { borderBottomWidth: 0.5, borderBottomColor: theme.divider }]} onPress={() => setShowLastSeenModal(true)} activeOpacity={0.7}>
            <Text style={[s.label, { color: theme.text }]}>{t('privacy.lastSeen')}</Text>
            <View style={s.rowRight}>
              <Text style={[s.value, { color: theme.textSecondary }]}>{getOptionLabel(lastSeenOption)}</Text>
              <Ionicons name="chevron-forward" size={20} color={theme.textSecondary} />
            </View>
          </TouchableOpacity>
          <TouchableOpacity style={[s.row, { borderBottomWidth: 0.5, borderBottomColor: theme.divider }]} onPress={() => setShowProfilePhotoModal(true)} activeOpacity={0.7}>
            <Text style={[s.label, { color: theme.text }]}>{t('privacy.profilePhoto')}</Text>
            <View style={s.rowRight}>
              <Text style={[s.value, { color: theme.textSecondary }]}>{getOptionLabel(profilePhotoOption)}</Text>
              <Ionicons name="chevron-forward" size={20} color={theme.textSecondary} />
            </View>
          </TouchableOpacity>
          {[
            { label: t('privacy.status'), value: statusVisible, setter: setStatusVisible, key: 'status_visible' },
            { label: t('privacy.bio'), value: bioVisible, setter: setBioVisible, key: 'bio_visible' },
            { label: t('privacy.birthday'), value: birthdayVisible, setter: setBirthdayVisible, key: 'birthday_visible' },
            { label: t('privacy.phoneNumber'), value: phoneNumberVisible, setter: setPhoneNumberVisible, key: 'phone_number_visible', last: true }
          ].map(({ label, value, setter, key, last }, i) => (
            <View key={i} style={[s.row, !last && { borderBottomWidth: 0.5, borderBottomColor: theme.divider }]}>
              <Text style={[s.label, { color: theme.text }]}>{label}</Text>
              <Switch value={value} onValueChange={handleToggle(key, setter)} trackColor={{ false: '#E5E5EA', true: theme.primary }} thumbColor="#FFFFFF" />
            </View>
          ))}
        </View>
        <Text style={[s.sectionTitle, { color: theme.textSecondary }]}>{t('privacy.messages')}</Text>
        <View style={[s.section, { backgroundColor: theme.surface }]}>
          <View style={[s.row, { borderBottomWidth: 0.5, borderBottomColor: theme.divider }]}>
            <View style={s.labelContainer}>
              <Text style={[s.label, { color: theme.text }]}>{t('privacy.readReceipts')}</Text>
              <Text style={[s.hint, { color: theme.textSecondary }]}>{t('privacy.readReceiptsHint')}</Text>
            </View>
            <Switch value={readReceiptsEnabled} onValueChange={handleToggle('read_receipts_enabled', setReadReceiptsEnabled)} trackColor={{ false: '#E5E5EA', true: theme.primary }} thumbColor="#FFFFFF" />
          </View>
          <View style={[s.row, { borderBottomWidth: 0.5, borderBottomColor: theme.divider }]}>
            <Text style={[s.label, { color: theme.text }]}>{t('privacy.onlineStatus')}</Text>
            <Switch value={onlineStatusVisible} onValueChange={handleToggle('online_status_visible', setOnlineStatusVisible)} trackColor={{ false: '#E5E5EA', true: theme.primary }} thumbColor="#FFFFFF" />
          </View>
          <View style={s.row}>
            <Text style={[s.label, { color: theme.text }]}>{t('privacy.forwarding')}</Text>
            <Switch value={forwardingEnabled} onValueChange={handleToggle('forwarding_enabled', setForwardingEnabled)} trackColor={{ false: '#E5E5EA', true: theme.primary }} thumbColor="#FFFFFF" />
          </View>
        </View>
        <Text style={[s.sectionTitle, { color: theme.textSecondary }]}>{t('privacy.whoCan')}</Text>
        <View style={[s.section, { backgroundColor: theme.surface }]}>
          <TouchableOpacity style={[s.row, { borderBottomWidth: 0.5, borderBottomColor: theme.divider }]} onPress={() => setShowCallsModal(true)} activeOpacity={0.7}>
            <Text style={[s.label, { color: theme.text }]}>{t('privacy.calls')}</Text>
            <View style={s.rowRight}>
              <Text style={[s.value, { color: theme.textSecondary }]}>{getOptionLabel(callsOption)}</Text>
              <Ionicons name="chevron-forward" size={20} color={theme.textSecondary} />
            </View>
          </TouchableOpacity>
          <TouchableOpacity style={[s.row, { borderBottomWidth: 0.5, borderBottomColor: theme.divider }]} onPress={() => setShowGroupsModal(true)} activeOpacity={0.7}>
            <Text style={[s.label, { color: theme.text }]}>{t('privacy.groups')}</Text>
            <View style={s.rowRight}>
              <Text style={[s.value, { color: theme.textSecondary }]}>{getOptionLabel(groupsOption)}</Text>
              <Ionicons name="chevron-forward" size={20} color={theme.textSecondary} />
            </View>
          </TouchableOpacity>
          <View style={s.row}>
            <Text style={[s.label, { color: theme.text }]}>{t('privacy.voiceMessages')}</Text>
            <Switch value={voiceMessagesEnabled} onValueChange={handleToggle('voice_messages_enabled', setVoiceMessagesEnabled)} trackColor={{ false: '#E5E5EA', true: theme.primary }} thumbColor="#FFFFFF" />
          </View>
        </View>
        <Text style={[s.sectionHint, { color: theme.textSecondary }]}>{t('privacy.hint')}</Text>
      </ScrollView>
      <OptionModal visible={showLastSeenModal} title={t('privacy.lastSeen')} options={privacyOptions} selectedValue={lastSeenOption} onSelect={(value) => { setLastSeenOption(value); AsyncStorage.setItem('last_seen_option', value); }} onClose={() => setShowLastSeenModal(false)} />
      <OptionModal visible={showProfilePhotoModal} title={t('privacy.profilePhoto')} options={privacyOptions} selectedValue={profilePhotoOption} onSelect={(value) => { setProfilePhotoOption(value); AsyncStorage.setItem('profile_photo_option', value); }} onClose={() => setShowProfilePhotoModal(false)} />
      <OptionModal visible={showCallsModal} title={t('privacy.whoCanCall')} options={privacyOptions} selectedValue={callsOption} onSelect={(value) => { setCallsOption(value); AsyncStorage.setItem('calls_option', value); }} onClose={() => setShowCallsModal(false)} />
      <OptionModal visible={showGroupsModal} title={t('privacy.whoCanAddToGroups')} options={privacyOptions} selectedValue={groupsOption} onSelect={(value) => { setGroupsOption(value); AsyncStorage.setItem('groups_option', value); }} onClose={() => setShowGroupsModal(false)} />
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
  rowRight: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  value: { fontSize: 16 },
  sectionHint: { fontSize: 13, marginHorizontal: 16, marginTop: 12, lineHeight: 18 }
});
