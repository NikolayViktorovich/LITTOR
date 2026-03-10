import { Modal, View, Text, TouchableOpacity, StyleSheet, Animated } from 'react-native';
import { useEffect, useRef, useState } from 'react';
import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';

export default function PhotoActionModal({ visible, onClose, onSetMain, onDelete, canSetMain, canDelete }) {
  const { t } = useTranslation();
  const [show, setShow] = useState(false);
  const fade = useRef(new Animated.Value(0)).current;
  const slide = useRef(new Animated.Value(50)).current;

  useEffect(() => {
    if (visible) {
      setShow(true);
      fade.setValue(0);
      slide.setValue(50);
      Animated.parallel([
        Animated.timing(fade, { toValue: 1, duration: 100, useNativeDriver: true }),
        Animated.timing(slide, { toValue: 0, duration: 100, useNativeDriver: true }),
      ]).start();
    } else if (show) {
      Animated.parallel([
        Animated.timing(fade, { toValue: 0, duration: 100, useNativeDriver: true }),
        Animated.timing(slide, { toValue: 50, duration: 100, useNativeDriver: true }),
      ]).start(() => setShow(false));
    }
  }, [visible]);

  if (!show) return null;

  const opts = [];
  if (canSetMain) opts.push({ icon: 'star-outline', label: t('photoViewer.setAsMain'), action: onSetMain });
  if (canDelete) opts.push({ icon: 'trash-outline', label: t('photoViewer.deletePhoto'), action: onDelete, danger: true });

  return (
    <Modal visible transparent animationType="none" onRequestClose={onClose}>
      <Animated.View style={[s.overlay, { opacity: fade }]}>
        <TouchableOpacity style={StyleSheet.absoluteFill} activeOpacity={1} onPress={onClose} />
        <Animated.View style={[s.modal, { transform: [{ translateY: slide }], opacity: fade }]}>
          <View style={s.opts}>
            {opts.map((o, i) => (
              <TouchableOpacity
                key={i}
                style={[s.opt, i < opts.length - 1 && s.border]}
                onPress={() => { o.action(); onClose(); }}
                activeOpacity={0.7}
              >
                <Ionicons name={o.icon} size={24} color={o.danger ? '#FF3B30' : '#007AFF'} />
                <Text style={[s.label, o.danger && { color: '#FF3B30' }]}>{o.label}</Text>
              </TouchableOpacity>
            ))}
          </View>
          <TouchableOpacity style={s.cancel} onPress={onClose} activeOpacity={0.8}>
            <Text style={s.cancelTxt}>{t('common.cancel')}</Text>
          </TouchableOpacity>
        </Animated.View>
      </Animated.View>
    </Modal>
  );
}

const s = StyleSheet.create({
  overlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.7)', justifyContent: 'flex-end', padding: 16 },
  modal: { borderRadius: 20, overflow: 'hidden', marginBottom: 8, backgroundColor: '#1A1A1C' },
  opts: { paddingVertical: 8 },
  opt: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 20, paddingVertical: 16, gap: 16 },
  border: { borderBottomWidth: 0.5, borderBottomColor: '#2C2C2E' },
  label: { fontSize: 17, fontWeight: '400', color: '#FFF' },
  cancel: { paddingVertical: 16, borderTopWidth: 0.5, borderTopColor: '#2C2C2E', alignItems: 'center', marginTop: 8 },
  cancelTxt: { fontSize: 17, fontWeight: '500', color: '#007AFF' }
});
