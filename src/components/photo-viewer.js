import { Modal, View, Image, TouchableOpacity, StyleSheet, Dimensions, FlatList, Text, Share, Alert } from 'react-native';
import { useState, useRef, useEffect } from 'react';
import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import { GestureHandlerRootView, GestureDetector, Gesture } from 'react-native-gesture-handler';
import Animated, { useSharedValue, useAnimatedStyle, withSpring, withTiming, runOnJS } from 'react-native-reanimated';
import PhotoActionModal from './photo-action-modal';

const { width: W, height: H } = Dimensions.get('window');

export default function PhotoViewer({ visible, photos, initialIndex = 0, onClose, onSetMain, onDelete }) {
  const { t } = useTranslation();
  const [idx, setIdx] = useState(initialIndex);
  const [showModal, setShowModal] = useState(false);
  const ref = useRef(null);
  const y = useSharedValue(0);
  const o = useSharedValue(1);

  useEffect(() => {
    if (visible) {
      setIdx(initialIndex);
      y.value = 0;
      o.value = 1;
    }
  }, [visible, initialIndex]);

  const g = Gesture.Pan()
    .onUpdate((e) => {
      if (e.translationY > 0) {
        y.value = e.translationY;
        o.value = Math.max(0, 1 - e.translationY / 400);
      }
    })
    .onEnd((e) => {
      if (e.translationY > 100 || e.velocityY > 500) {
        y.value = withTiming(H, { duration: 150 });
        o.value = withTiming(0, { duration: 150 }, (f) => { if (f) runOnJS(onClose)(); });
      } else {
        y.value = withSpring(0);
        o.value = withSpring(1);
      }
    });

  const anim = useAnimatedStyle(() => ({ transform: [{ translateY: y.value }] }));
  const animO = useAnimatedStyle(() => ({ opacity: o.value }));

  const scroll = (e) => setIdx(Math.round(e.nativeEvent.contentOffset.x / W));

  const setMain = () => onSetMain?.(idx);
  const del = () => onDelete && Alert.alert(t('photoViewer.deleteConfirmTitle'), t('photoViewer.deleteConfirmMessage'), [
    { text: t('common.cancel'), style: 'cancel' },
    { text: t('common.delete'), style: 'destructive', onPress: () => onDelete(idx) }
  ]);
  const share = () => Share.share({ url: photos[idx] }).catch(() => {});

  if (!visible || !photos || photos.length === 0) return null;

  return (
    <Modal visible transparent animationType="fade" onRequestClose={onClose}>
      <GestureHandlerRootView style={{ flex: 1 }}>
        <Animated.View style={[s.wrap, animO]}>
          <GestureDetector gesture={g}>
            <Animated.View style={[{ flex: 1 }, anim]}>
              <View style={s.header}>
                <TouchableOpacity style={s.back} onPress={onClose} activeOpacity={0.8}>
                  <Ionicons name="chevron-back" size={28} color="#FFF" />
                </TouchableOpacity>
                <Text style={s.counter}>{idx + 1} {t('photoViewer.of')} {photos.length}</Text>
                {photos.length > 1 ? (
                  <TouchableOpacity style={s.edit} onPress={() => setShowModal(true)} activeOpacity={0.8}>
                    <Text style={s.editTxt}>{t('photoViewer.edit')}</Text>
                  </TouchableOpacity>
                ) : <View style={{ width: 60 }} />}
              </View>
              <View style={{ flex: 1 }}>
                <FlatList
                  ref={ref}
                  data={photos}
                  horizontal
                  pagingEnabled
                  showsHorizontalScrollIndicator={false}
                  onScroll={scroll}
                  scrollEventThrottle={16}
                  initialScrollIndex={initialIndex}
                  getItemLayout={(d, i) => ({ length: W, offset: W * i, index: i })}
                  renderItem={({ item: uri }) => (
                    <View style={s.imgWrap}>
                      <Image source={{ uri }} style={s.img} resizeMode="contain" />
                    </View>
                  )}
                  keyExtractor={(_, i) => i.toString()}
                />
              </View>
              <View style={s.footer}>
                <TouchableOpacity style={s.btn} onPress={share} activeOpacity={0.8}>
                  <Ionicons name="share-outline" size={28} color="#FFF" />
                </TouchableOpacity>
                <TouchableOpacity style={s.btn} onPress={del} activeOpacity={0.8}>
                  <Ionicons name="trash-outline" size={28} color="#FFF" />
                </TouchableOpacity>
              </View>
            </Animated.View>
          </GestureDetector>
          <PhotoActionModal
            visible={showModal}
            onClose={() => setShowModal(false)}
            onSetMain={setMain}
            onDelete={del}
            canSetMain={idx !== 0}
            canDelete={photos.length > 1}
          />
        </Animated.View>
      </GestureHandlerRootView>
    </Modal>
  );
}

const s = StyleSheet.create({
  wrap: { flex: 1, backgroundColor: '#000' },
  header: { position: 'absolute', top: 0, left: 0, right: 0, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingTop: 50, paddingHorizontal: 16, paddingBottom: 12, zIndex: 10, backgroundColor: 'rgba(0,0,0,0.3)' },
  back: { width: 44, height: 44, justifyContent: 'center', alignItems: 'flex-start' },
  counter: { fontSize: 16, fontWeight: '500', color: '#FFF' },
  edit: { width: 60, height: 32, justifyContent: 'center', alignItems: 'center', backgroundColor: 'rgba(255,255,255,0.2)', borderRadius: 16 },
  editTxt: { fontSize: 15, fontWeight: '500', color: '#FFF' },
  imgWrap: { width: W, height: H, justifyContent: 'center', alignItems: 'center' },
  img: { width: W, height: H },
  footer: { position: 'absolute', bottom: 40, left: 0, right: 0, flexDirection: 'row', justifyContent: 'center', gap: 40, paddingHorizontal: 20 },
  btn: { width: 50, height: 50, justifyContent: 'center', alignItems: 'center', backgroundColor: 'rgba(255,255,255,0.15)', borderRadius: 25 }
});
