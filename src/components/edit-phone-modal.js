import { Modal, View, Text, TextInput, TouchableOpacity, StyleSheet, SafeAreaView, StatusBar, ActivityIndicator, KeyboardAvoidingView, Platform } from 'react-native';
import { useState, useEffect } from 'react';
import { Ionicons } from '@expo/vector-icons';

const fmt = (t) => {
  const c = t.replace(/\D/g, '');
  if (c.startsWith('7') || c.startsWith('8')) {
    const [, , g2, g3, g4, g5] = c.match(/^(\d{1})(\d{0,3})(\d{0,3})(\d{0,2})(\d{0,2})$/) || [];
    return ['+7', g2 && ` ${g2}`, g3 && ` ${g3}`, g4 && ` ${g4}`, g5 && ` ${g5}`].filter(Boolean).join('').trim();
  }
  return c ? `+${c}` : '';
};

export default function EditPhoneModal({ visible, onClose, onSave, value }) {
  const [phone, setPhone] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => { if (visible) setPhone(value || ''); }, [visible, value]);

  const save = async () => {
    setSaving(true);
    try {
      await onSave(phone);
      onClose();
    } finally {
      setSaving(false);
    }
  };

  if (!visible) return null;

  return (
    <Modal visible transparent animationType="slide" onRequestClose={onClose}>
      <KeyboardAvoidingView style={s.wrap} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
        <SafeAreaView style={s.safe}>
          <StatusBar barStyle="light-content" />
          <View style={s.header}>
            <TouchableOpacity onPress={onClose} style={s.back}>
              <Ionicons name="chevron-back" size={28} color="#007AFF" />
            </TouchableOpacity>
            <Text style={s.title}>Номер телефона</Text>
            <TouchableOpacity onPress={save} disabled={saving} style={s.done}>
              {saving ? <ActivityIndicator size="small" color="#007AFF" /> : <Text style={s.doneTxt}>Готово</Text>}
            </TouchableOpacity>
          </View>
          <View style={s.content}>
            <TextInput
              style={s.input}
              value={phone}
              onChangeText={(t) => setPhone(fmt(t))}
              placeholder="+7 999 123 45 67"
              placeholderTextColor="#8E8E93"
              keyboardType="phone-pad"
              maxLength={18}
              autoFocus
            />
            <Text style={s.hint}>Введите номер телефона в международном формате</Text>
          </View>
        </SafeAreaView>
      </KeyboardAvoidingView>
    </Modal>
  );
}

const s = StyleSheet.create({
  wrap: { flex: 1, backgroundColor: '#000' },
  safe: { flex: 1 },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 8, paddingVertical: 8, borderBottomWidth: 0.5, borderBottomColor: '#2C2C2E' },
  back: { paddingHorizontal: 8 },
  title: { fontSize: 17, fontWeight: '500', color: '#FFF' },
  done: { paddingHorizontal: 8 },
  doneTxt: { fontSize: 17, fontWeight: '500', color: '#007AFF' },
  content: { flex: 1, padding: 16 },
  input: { backgroundColor: '#1A1A1C', borderRadius: 12, paddingHorizontal: 16, paddingVertical: 12, fontSize: 17, color: '#FFF' },
  hint: { fontSize: 13, color: '#8E8E93', marginTop: 12, lineHeight: 18 }
});
