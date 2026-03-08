import { Modal, View, Text, TouchableOpacity, StyleSheet, Animated } from 'react-native';
import { useEffect, useRef, useState } from 'react';
import { Ionicons } from '@expo/vector-icons';

const ANIM_DURATION = 100;

export default function LanguageModal({ visible, currentLanguage, languages, onSelect, onClose }) {
  const [show, setShow] = useState(false);
  const fade = useRef(new Animated.Value(0)).current;
  const slide = useRef(new Animated.Value(50)).current;

  useEffect(() => {
    if (visible) {
      setShow(true);
      fade.setValue(0);
      slide.setValue(50);
      Animated.parallel([
        Animated.timing(fade, { toValue: 1, duration: ANIM_DURATION, useNativeDriver: true }),
        Animated.timing(slide, { toValue: 0, duration: ANIM_DURATION, useNativeDriver: true }),
      ]).start();
    } else if (show) {
      Animated.parallel([
        Animated.timing(fade, { toValue: 0, duration: ANIM_DURATION, useNativeDriver: true }),
        Animated.timing(slide, { toValue: 50, duration: ANIM_DURATION, useNativeDriver: true }),
      ]).start(() => setShow(false));
    }
  }, [visible]);

  const select = (code) => (onSelect(code), onClose());

  if (!show) return null;

  return (
    <Modal visible transparent animationType="none" onRequestClose={onClose}>
      <Animated.View style={[s.overlay, { opacity: fade }]}>
        <TouchableOpacity style={StyleSheet.absoluteFill} activeOpacity={1} onPress={onClose} />
        <Animated.View style={[s.modal, { transform: [{ translateY: slide }], opacity: fade }]}>
          <View style={s.header}>
            <Text style={s.title}>Язык / Language</Text>
          </View>
          <View style={s.opts}>
            {languages.map((lang) => (
              <TouchableOpacity
                key={lang.code}
                style={[s.opt, currentLanguage === lang.code && s.active]}
                onPress={() => select(lang.code)}
                activeOpacity={0.7}
              >
                <Text style={s.label}>{lang.label}</Text>
                {currentLanguage === lang.code && <Ionicons name="checkmark" size={24} color="#0A84FF" />}
              </TouchableOpacity>
            ))}
          </View>
          <TouchableOpacity style={s.cancel} onPress={onClose} activeOpacity={0.8}>
            <Text style={s.cancelTxt}>Отмена / Cancel</Text>
          </TouchableOpacity>
        </Animated.View>
      </Animated.View>
    </Modal>
  );
}

const s = StyleSheet.create({
  overlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.7)', justifyContent: 'center', alignItems: 'center', padding: 20 },
  modal: { backgroundColor: '#2C2C2E', borderRadius: 20, width: '100%', maxWidth: 340, overflow: 'hidden' },
  header: { padding: 20, borderBottomWidth: 0.5, borderBottomColor: 'rgba(255,255,255,0.1)' },
  title: { fontSize: 17, fontWeight: '600', color: '#FFF', textAlign: 'center' },
  opts: { paddingVertical: 8 },
  opt: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 20, paddingVertical: 14 },
  active: { backgroundColor: 'rgba(10,132,255,0.1)' },
  label: { flex: 1, fontSize: 16, fontWeight: '500', color: '#FFF' },
  cancel: { paddingVertical: 16, borderTopWidth: 0.5, borderTopColor: 'rgba(255,255,255,0.1)', alignItems: 'center' },
  cancelTxt: { fontSize: 16, fontWeight: '500', color: '#0A84FF' },
});
