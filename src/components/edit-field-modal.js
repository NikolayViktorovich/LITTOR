import { Modal, View, Text, TextInput, TouchableOpacity, StyleSheet, SafeAreaView, StatusBar, ActivityIndicator, KeyboardAvoidingView, Platform } from 'react-native';
import { useState, useEffect } from 'react';
import { Ionicons } from '@expo/vector-icons';

export default function EditFieldModal({ visible, onClose, onSave, title, value, placeholder, multiline = false, keyboardType = 'default', maxLength }) {
  const [text, setText] = useState(value || '');
  const [saving, setSaving] = useState(false);

  useEffect(() => { if (visible) setText(value || ''); }, [visible, value]);

  const save = async () => {
    setSaving(true);
    try {
      await onSave(text);
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
            <Text style={s.title}>{title}</Text>
            <TouchableOpacity onPress={save} disabled={saving} style={s.done}>
              {saving ? <ActivityIndicator size="small" color="#007AFF" /> : <Text style={s.doneTxt}>Готово</Text>}
            </TouchableOpacity>
          </View>
          <View style={s.content}>
            <TextInput
              style={[s.input, multiline && s.multi]}
              value={text}
              onChangeText={setText}
              placeholder={placeholder}
              placeholderTextColor="#8E8E93"
              multiline={multiline}
              keyboardType={keyboardType}
              maxLength={maxLength}
              autoFocus
            />
            {maxLength && <Text style={s.counter}>{text.length}/{maxLength}</Text>}
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
  title: { fontSize: 17, fontWeight: '600', color: '#FFF' },
  done: { paddingHorizontal: 8 },
  doneTxt: { fontSize: 17, fontWeight: '600', color: '#007AFF' },
  content: { flex: 1, padding: 16 },
  input: { backgroundColor: '#1A1A1C', borderRadius: 12, paddingHorizontal: 16, paddingVertical: 12, fontSize: 17, color: '#FFF' },
  multi: { minHeight: 120, textAlignVertical: 'top' },
  counter: { fontSize: 13, color: '#8E8E93', marginTop: 8, textAlign: 'right' }
});
