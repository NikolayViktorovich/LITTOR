import { Modal, View, Text, TouchableOpacity, StyleSheet, Animated } from 'react-native';
import { useEffect, useRef, useState } from 'react';
import DateTimePicker from '@react-native-community/datetimepicker';

const MONTHS = { 'янв': 0, 'февр': 1, 'мар': 2, 'апр': 3, 'мая': 4, 'июн': 5, 'июл': 6, 'авг': 7, 'сент': 8, 'окт': 9, 'нояб': 10, 'дек': 11 };

const parse = (v) => {
  if (!v) return new Date();
  try {
    if (typeof v === 'string' && v.includes('.')) {
      const [day, month, year] = v.replace('.', '').split(' ');
      const mo = MONTHS[month?.toLowerCase()];
      const d = parseInt(day), y = parseInt(year);
      if (mo !== undefined && !isNaN(d) && !isNaN(y)) return new Date(y, mo, d);
    }
    const parsed = new Date(v);
    return isNaN(parsed.getTime()) ? new Date() : parsed;
  } catch { return new Date(); }
};

export default function DatePickerModal({ visible, onClose, onSave, value }) {
  const [date, setDate] = useState(() => parse(value));
  const [show, setShow] = useState(false);
  const fade = useRef(new Animated.Value(0)).current;
  const slide = useRef(new Animated.Value(300)).current;

  useEffect(() => {
    if (visible) {
      setShow(true);
      const d = parse(value);
      if (!isNaN(d.getTime())) setDate(d);
      Animated.parallel([
        Animated.timing(fade, { toValue: 1, duration: 200, useNativeDriver: true }),
        Animated.timing(slide, { toValue: 0, duration: 200, useNativeDriver: true })
      ]).start();
    } else if (show) {
      Animated.parallel([
        Animated.timing(fade, { toValue: 0, duration: 200, useNativeDriver: true }),
        Animated.timing(slide, { toValue: 300, duration: 200, useNativeDriver: true })
      ]).start(() => setShow(false));
    }
  }, [visible, value]);

  const save = () => {
    onSave(date.toLocaleDateString('ru-RU', { day: 'numeric', month: 'short', year: 'numeric' }));
    onClose();
  };

  const del = () => (onSave(''), onClose());

  if (!show) return null;

  return (
    <Modal visible transparent animationType="none" onRequestClose={onClose}>
      <Animated.View style={[s.overlay, { opacity: fade }]}>
        <TouchableOpacity style={StyleSheet.absoluteFill} activeOpacity={1} onPress={onClose} />
        <Animated.View style={[s.modal, { transform: [{ translateY: slide }] }]}>
          <View style={s.header}>
            <Text style={s.title}>День рождения</Text>
          </View>
          <DateTimePicker
            value={date}
            mode="date"
            display="spinner"
            onChange={(_, d) => { if (d && !isNaN(d.getTime())) setDate(d); }}
            textColor="#FFF"
            style={s.picker}
            maximumDate={new Date()}
          />
          <TouchableOpacity style={s.del} onPress={del} activeOpacity={0.7}>
            <Text style={s.delTxt}>Удалить день рождения</Text>
          </TouchableOpacity>
          <View style={s.btns}>
            <TouchableOpacity style={s.btn} onPress={onClose} activeOpacity={0.7}>
              <Text style={s.btnTxt}>Отмена</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[s.btn, s.primary]} onPress={save} activeOpacity={0.7}>
              <Text style={[s.btnTxt, s.primaryTxt]}>Готово</Text>
            </TouchableOpacity>
          </View>
        </Animated.View>
      </Animated.View>
    </Modal>
  );
}

const s = StyleSheet.create({
  overlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.7)', justifyContent: 'flex-end' },
  modal: { backgroundColor: '#1A1A1C', borderTopLeftRadius: 20, borderTopRightRadius: 20, paddingBottom: 34 },
  header: { paddingVertical: 16, paddingHorizontal: 20, borderBottomWidth: 0.5, borderBottomColor: '#2C2C2E' },
  title: { fontSize: 17, fontWeight: '500', color: '#FFF', textAlign: 'center' },
  picker: { height: 200 },
  del: { paddingVertical: 12, paddingHorizontal: 20, alignItems: 'center' },
  delTxt: { fontSize: 17, color: '#FF3B30' },
  btns: { flexDirection: 'row', paddingHorizontal: 16, paddingTop: 16, gap: 12 },
  btn: { flex: 1, paddingVertical: 14, borderRadius: 12, backgroundColor: '#2C2C2E', alignItems: 'center' },
  primary: { backgroundColor: '#007AFF' },
  btnTxt: { fontSize: 17, fontWeight: '500', color: '#FFF' },
  primaryTxt: { color: '#FFF' }
});
