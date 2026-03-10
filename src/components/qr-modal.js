import { Modal, View, Text, TouchableOpacity, StyleSheet, SafeAreaView, StatusBar, Share, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import QRCode from 'react-native-qrcode-svg';
import * as Clipboard from 'expo-clipboard';

export default function QRModal({ visible, onClose, username }) {
  const link = `https://littor.app/${username}`;

  const share = async () => {
    try {
      await Share.share({ message: `Мой профиль в Littor: ${link}`, url: link });
    } catch (e) {}
  };

  const copy = async () => {
    try {
      await Clipboard.setStringAsync(link);
      Alert.alert('Скопировано', 'Ссылка скопирована в буфер обмена');
    } catch (e) {}
  };

  if (!visible) return null;

  return (
    <Modal visible transparent animationType="none" onRequestClose={onClose}>
      <SafeAreaView style={s.wrap}>
        <StatusBar barStyle="light-content" />
        <View style={s.header}>
          <TouchableOpacity onPress={onClose} style={s.close}>
            <Ionicons name="close" size={28} color="#FFF" />
          </TouchableOpacity>
          <Text style={s.title}>QR-код</Text>
          <TouchableOpacity onPress={share} style={s.share}>
            <Ionicons name="share-outline" size={24} color="#007AFF" />
          </TouchableOpacity>
        </View>
        <View style={s.content}>
          <View style={s.qr}>
            <QRCode value={link} size={240} backgroundColor="#FFF" color="#000" />
          </View>
          <Text style={s.user}>@{username}</Text>
          <Text style={s.desc}>Отсканируйте этот код, чтобы открыть мой профиль</Text>
          <View style={s.linkWrap}>
            <Text style={s.linkLabel}>Ссылка на профиль</Text>
            <TouchableOpacity style={s.linkBox} onPress={copy} activeOpacity={0.7}>
              <Text style={s.linkTxt} numberOfLines={1}>{link}</Text>
              <Ionicons name="copy-outline" size={20} color="#007AFF" />
            </TouchableOpacity>
          </View>
        </View>
      </SafeAreaView>
    </Modal>
  );
}

const s = StyleSheet.create({
  wrap: { flex: 1, backgroundColor: '#000' },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 8, paddingVertical: 8 },
  close: { paddingHorizontal: 8 },
  title: { fontSize: 17, fontWeight: '500', color: '#FFF' },
  share: { paddingHorizontal: 8 },
  content: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 32 },
  qr: { backgroundColor: '#FFF', padding: 24, borderRadius: 24, marginBottom: 32 },
  user: { fontSize: 20, fontWeight: '500', color: '#FFF', marginBottom: 8 },
  desc: { fontSize: 15, color: '#8E8E93', textAlign: 'center', marginBottom: 48 },
  linkWrap: { width: '100%' },
  linkLabel: { fontSize: 13, color: '#8E8E93', marginBottom: 8, textAlign: 'center' },
  linkBox: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', backgroundColor: '#1A1A1C', paddingHorizontal: 16, paddingVertical: 14, borderRadius: 12 },
  linkTxt: { fontSize: 15, color: '#007AFF', flex: 1, marginRight: 12 }
});
