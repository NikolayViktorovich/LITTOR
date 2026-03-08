import { Modal, View, Text, TouchableOpacity, StyleSheet, Animated } from 'react-native';
import { useEffect, useRef, useState, useContext } from 'react';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { ThemeContext } from '../context/theme';

const D = 100;

export default function PhotoPickerModal({ visible, onClose, onPhotoSelected }) {
  const { theme } = useContext(ThemeContext);
  const [show, setShow] = useState(false);
  const fade = useRef(new Animated.Value(0)).current;
  const slide = useRef(new Animated.Value(50)).current;

  useEffect(() => {
    if (visible) {
      setShow(true);
      fade.setValue(0);
      slide.setValue(50);
      Animated.parallel([
        Animated.timing(fade, { toValue: 1, duration: D, useNativeDriver: true }),
        Animated.timing(slide, { toValue: 0, duration: D, useNativeDriver: true }),
      ]).start();
    } else if (show) {
      Animated.parallel([
        Animated.timing(fade, { toValue: 0, duration: D, useNativeDriver: true }),
        Animated.timing(slide, { toValue: 50, duration: D, useNativeDriver: true }),
      ]).start(() => setShow(false));
    }
  }, [visible]);

  const req = async (type) => {
    const { status } = type === 'camera' ? await ImagePicker.requestCameraPermissionsAsync() : await ImagePicker.requestMediaLibraryPermissionsAsync();
    return status === 'granted';
  };

  const gallery = async () => {
    if (!await req('gallery')) return;
    try {
      const r = await ImagePicker.launchImageLibraryAsync({ mediaTypes: ImagePicker.MediaTypeOptions.Images, allowsEditing: true, aspect: [1, 1], quality: 0.8 });
      if (!r.canceled && r.assets && r.assets[0]) {
        onPhotoSelected(r.assets[0].uri);
        onClose();
      }
    } catch (e) {}
  };

  const camera = async () => {
    if (!await req('camera')) return;
    try {
      const r = await ImagePicker.launchCameraAsync({ allowsEditing: true, aspect: [1, 1], quality: 0.8 });
      if (!r.canceled && r.assets && r.assets[0]) {
        onPhotoSelected(r.assets[0].uri);
        onClose();
      }
    } catch (e) {}
  };

  if (!show) return null;

  const opts = [
    { icon: 'images-outline', label: 'Выбрать из галереи', action: gallery },
    { icon: 'camera-outline', label: 'Сделать фото', action: camera }
  ];

  return (
    <Modal visible transparent animationType="none" onRequestClose={onClose}>
      <Animated.View style={[s.overlay, { opacity: fade }]}>
        <TouchableOpacity style={StyleSheet.absoluteFill} activeOpacity={1} onPress={onClose} />
        <Animated.View style={[s.modal, { backgroundColor: theme.surface, transform: [{ translateY: slide }], opacity: fade }]}>
          <View style={s.opts}>
            {opts.map((o, i) => (
              <TouchableOpacity
                key={i}
                style={[s.opt, i < opts.length - 1 && { borderBottomWidth: 0.5, borderBottomColor: theme.divider }]}
                onPress={o.action}
                activeOpacity={0.7}
              >
                <Ionicons name={o.icon} size={24} color={o.danger ? theme.error : theme.primary} />
                <Text style={[s.label, { color: o.danger ? theme.error : theme.text }]}>{o.label}</Text>
              </TouchableOpacity>
            ))}
          </View>
          <TouchableOpacity style={[s.cancel, { borderTopColor: theme.divider }]} onPress={onClose} activeOpacity={0.8}>
            <Text style={[s.cancelTxt, { color: theme.primary }]}>Отмена</Text>
          </TouchableOpacity>
        </Animated.View>
      </Animated.View>
    </Modal>
  );
}

const s = StyleSheet.create({
  overlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.7)', justifyContent: 'flex-end', padding: 16 },
  modal: { borderRadius: 20, overflow: 'hidden', marginBottom: 8 },
  opts: { paddingVertical: 8 },
  opt: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 20, paddingVertical: 16, gap: 16 },
  label: { fontSize: 17, fontWeight: '500' },
  cancel: { paddingVertical: 16, borderTopWidth: 0.5, alignItems: 'center', marginTop: 8 },
  cancelTxt: { fontSize: 17, fontWeight: '600' }
});
