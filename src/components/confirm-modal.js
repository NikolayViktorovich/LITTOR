import { Modal, View, Text, TouchableOpacity, StyleSheet, Animated } from 'react-native';
import { useEffect, useRef, useState } from 'react';

const ANIM_DURATION = 100;

export default function ConfirmModal({ visible, title, message, onConfirm, onCancel, confirmText = 'OK', cancelText = 'Отмена' }) {
  const [show, setShow] = useState(false);
  const fade = useRef(new Animated.Value(0)).current;
  const scale = useRef(new Animated.Value(0.9)).current;

  useEffect(() => {
    if (visible) {
      setShow(true);
      fade.setValue(0);
      scale.setValue(0.9);
      Animated.parallel([
        Animated.timing(fade, { toValue: 1, duration: ANIM_DURATION, useNativeDriver: true }),
        Animated.timing(scale, { toValue: 1, duration: ANIM_DURATION, useNativeDriver: true }),
      ]).start();
    } else if (show) {
      Animated.parallel([
        Animated.timing(fade, { toValue: 0, duration: ANIM_DURATION, useNativeDriver: true }),
        Animated.timing(scale, { toValue: 0.9, duration: ANIM_DURATION, useNativeDriver: true }),
      ]).start(() => setShow(false));
    }
  }, [visible]);

  if (!show) return null;

  return (
    <Modal visible transparent animationType="none" onRequestClose={onCancel}>
      <Animated.View style={[s.overlay, { opacity: fade }]}>
        <TouchableOpacity style={StyleSheet.absoluteFill} activeOpacity={1} onPress={onCancel} />
        <Animated.View style={[s.modal, { transform: [{ scale }], opacity: fade }]}>
          {title && <Text style={s.title}>{title}</Text>}
          {message && <Text style={s.msg}>{message}</Text>}
          <View style={s.btns}>
            <TouchableOpacity style={[s.btn, s.confirm]} onPress={onConfirm} activeOpacity={0.8}>
              <Text style={s.confirmTxt}>{confirmText}</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[s.btn, s.cancel]} onPress={onCancel} activeOpacity={0.8}>
              <Text style={s.cancelTxt}>{cancelText}</Text>
            </TouchableOpacity>
          </View>
        </Animated.View>
      </Animated.View>
    </Modal>
  );
}

const s = StyleSheet.create({
  overlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.7)', justifyContent: 'center', alignItems: 'center', padding: 20 },
  modal: { backgroundColor: '#1A1A1C', borderRadius: 20, padding: 24, width: '100%', maxWidth: 340 },
  title: { fontSize: 17, fontWeight: '500', color: '#FFF', textAlign: 'center', marginBottom: 12 },
  msg: { fontSize: 15, color: '#8E8E93', textAlign: 'center', marginBottom: 24, lineHeight: 20 },
  btns: { gap: 12 },
  btn: { paddingVertical: 14, borderRadius: 12, alignItems: 'center' },
  confirm: { backgroundColor: '#FF3B30' },
  cancel: { backgroundColor: 'rgba(255,255,255,0.1)' },
  confirmTxt: { fontSize: 16, fontWeight: '500', color: '#FFF' },
  cancelTxt: { fontSize: 16, fontWeight: '400', color: '#0A84FF' },
});
