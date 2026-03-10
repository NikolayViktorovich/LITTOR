import { useEffect, useRef, useState } from 'react';
import { View, TouchableOpacity, Text, StyleSheet, Animated } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';

export default function TabBar({ state, navigation }) {
  const { t } = useTranslation();
  const [layouts, setLayouts] = useState({});
  const scale = useRef(new Animated.Value(1)).current;
  const flash = useRef(new Animated.Value(0)).current;
  const blobX = useRef(new Animated.Value(1)).current;
  const blobY = useRef(new Animated.Value(1)).current;

  const icons = { SettingsTab: 'settings' };
  const labels = { SettingsTab: t('tabs.settings') };

  useEffect(() => {
    Animated.sequence([
      Animated.parallel([
        Animated.timing(blobX, { toValue: 0.88, duration: 200, useNativeDriver: true }),
        Animated.timing(blobY, { toValue: 1.15, duration: 200, useNativeDriver: true }),
      ]),
      Animated.parallel([
        Animated.spring(blobX, { toValue: 1, tension: 100, friction: 8, useNativeDriver: true }),
        Animated.spring(blobY, { toValue: 1, tension: 100, friction: 8, useNativeDriver: true }),
      ]),
    ]).start();
  }, [state.index]);

  const animate = () => {
    Animated.sequence([
      Animated.timing(scale, { toValue: 1.04, duration: 80, useNativeDriver: true }),
      Animated.timing(scale, { toValue: 1, duration: 80, useNativeDriver: true }),
    ]).start();
    Animated.sequence([
      Animated.timing(flash, { toValue: 0.08, duration: 80, useNativeDriver: true }),
      Animated.timing(flash, { toValue: 0, duration: 80, useNativeDriver: true }),
    ]).start();
  };

  const getW = (i) => {
    if (!layouts[i]) return 0;
    const len = labels[state.routes[i].name]?.length || 0;
    return len > 7 ? layouts[i].width + 3 : layouts[i].width - 12;
  };

  const getX = (i) => {
    if (!layouts[i]) return 0;
    const len = labels[state.routes[i].name]?.length || 0;
    return len > 7 ? layouts[i].x - 3 : layouts[i].x + 6;
  };

  const curr = layouts[state.index];
  const w = curr ? getW(state.index) : 0;
  const x = curr ? getX(state.index) : 0;

  return (
    <View style={s.wrap}>
      <Animated.View style={[s.bar, { transform: [{ scale }] }]}>
        <Animated.View style={[StyleSheet.absoluteFill, { backgroundColor: '#FFF', opacity: flash, borderRadius: 28 }]} />
        {w > 0 && <Animated.View style={[s.blob, { width: w, left: x, transform: [{ scaleX: blobX }, { scaleY: blobY }] }]} />}
        {state.routes.map((route, i) => {
          const focused = state.index === i;
          const onPress = () => {
            const e = navigation.emit({ type: 'tabPress', target: route.key, canPreventDefault: true });
            if (!focused && !e.defaultPrevented) {
              animate();
              navigation.navigate(route.name);
            }
          };

          return (
            <TouchableOpacity
              key={route.key}
              onPress={onPress}
              style={s.item}
              activeOpacity={0.7}
              onLayout={(e) => {
                const { x, width } = e.nativeEvent.layout;
                setLayouts(p => ({ ...p, [i]: { x, width } }));
              }}
            >
              <Ionicons name={icons[route.name]} size={22} color="#FFF" />
              <Text style={s.label}>{labels[route.name]}</Text>
            </TouchableOpacity>
          );
        })}
      </Animated.View>
    </View>
  );
}

const s = StyleSheet.create({
  wrap: { position: 'absolute', bottom: 20, left: 50, right: 50 },
  bar: { flexDirection: 'row', backgroundColor: 'rgba(28,28,30,0.92)', borderRadius: 28, height: 56, paddingHorizontal: 6, shadowColor: '#000', shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.44, shadowRadius: 16, elevation: 16, borderWidth: 0.5, borderColor: 'rgba(255,255,255,0.12)' },
  item: { flex: 1, justifyContent: 'center', alignItems: 'center', height: '100%', zIndex: 10 },
  label: { fontSize: 10, fontWeight: '400', marginTop: 3, color: '#FFF' },
  blob: { position: 'absolute', height: '85%', top: '7.5%', left: 0, borderRadius: 22, backgroundColor: 'rgba(255,255,255,0.15)', zIndex: 1 },
});
