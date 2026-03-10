import { Modal, View, Text, TextInput, TouchableOpacity, StyleSheet, SafeAreaView, StatusBar, ActivityIndicator, KeyboardAvoidingView, Platform } from 'react-native';
import { useState, useEffect } from 'react';
import { Ionicons } from '@expo/vector-icons';

export default function EditUsernameModal({ visible, onClose, onSave, value }) {
  const [username, setUsername] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => { if (visible) setUsername(value || ''); }, [visible, value]);

  const save = async () => {
    if (!username.trim()) return;
    setSaving(true);
    try {
      await onSave(username.trim());
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
            <Text style={s.title}>Имя пользователя</Text>
            <TouchableOpacity onPress={save} disabled={saving || !username.trim()} style={s.done}>
              {saving ? <ActivityIndicator size="small" color="#007AFF" /> : <Text style={[s.doneTxt, !username.trim() && { opacity: 0.5 }]}>Готово</Text>}
            </TouchableOpacity>
          </View>
          <View style={s.content}>
            <TextInput
              style={s.input}
              value={username}
              onChangeText={(t) => setUsername(t.toLowerCase().replace(/[^a-z0-9_]/g, ''))}
              placeholder="username"
              placeholderTextColor="#8E8E93"
              maxLength={30}
              autoCapitalize="none"
              autoFocus
            />
            <Text style={s.hint}>Имя пользователя может содержать только латинские буквы, цифры и подчеркивание</Text>
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
