import { useContext } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, SafeAreaView, ScrollView, StatusBar, Linking, Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import { ThemeContext } from '../context/theme';

export default function AboutScreen({ navigation }) {
  const { t } = useTranslation();
  const { theme } = useContext(ThemeContext);
  const openLink = (url) => Linking.openURL(url).catch(console.error);

  return (
    <SafeAreaView style={[s.container, { backgroundColor: theme.background }]}>
      <StatusBar barStyle={theme.statusBar} />
      <View style={[s.header, { backgroundColor: theme.background, borderBottomColor: theme.divider }]}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={s.backButton}>
          <Ionicons name="chevron-back" size={28} color={theme.primary} />
        </TouchableOpacity>
        <Text style={[s.headerTitle, { color: theme.text }]}>{t('settings.about')}</Text>
        <View style={s.placeholder} />
      </View>
      <ScrollView contentContainerStyle={s.scrollContent} showsVerticalScrollIndicator={false}>
        <View style={s.logoSection}>
          <Image source={require('../../assets/logo.png')} style={s.logo} resizeMode="contain" />
          <Text style={[s.appName, { color: theme.text }]}>LITTTOR</Text>
          <Text style={[s.version, { color: theme.textSecondary }]}>{t('about.version')} 1.0.0</Text>
        </View>
        <Text style={[s.sectionTitle, { color: theme.textSecondary }]}>{t('about.info')}</Text>
        <View style={[s.section, { backgroundColor: theme.surface }]}>
          {[
            { label: t('about.developer'), value: 'Nikolay Viktorovich' },
            { label: t('about.releaseDate'), value: '2026' },
            { label: t('about.buildNumber'), value: 'Beta 147', last: true }
          ].map(({ label, value, last }, i) => (
            <View key={i} style={[s.row, !last && { borderBottomWidth: 0.5, borderBottomColor: theme.divider }]}>
              <Text style={[s.label, { color: theme.text }]}>{label}</Text>
              <Text style={[s.value, { color: theme.textSecondary }]}>{value}</Text>
            </View>
          ))}
        </View>
        <View style={[s.section, { backgroundColor: theme.surface, marginTop: 24 }]}>
          {[
            { label: t('about.termsOfService'), url: 'https://example.com/terms' },
            { label: t('about.privacyPolicy'), url: 'https://example.com/privacy' },
            { label: t('about.licenses'), url: 'https://example.com/licenses', last: true }
          ].map(({ label, url, last }, i) => (
            <TouchableOpacity key={i} style={[s.row, !last && { borderBottomWidth: 0.5, borderBottomColor: theme.divider }]} onPress={() => openLink(url)} activeOpacity={0.7}>
              <Text style={[s.label, { color: theme.text }]}>{label}</Text>
              <Ionicons name="chevron-forward" size={20} color={theme.textSecondary} />
            </TouchableOpacity>
          ))}
        </View>
        <Text style={[s.sectionTitle, { color: theme.textSecondary }]}>{t('about.social')}</Text>
        <View style={[s.section, { backgroundColor: theme.surface }]}>
          <TouchableOpacity style={s.row} onPress={() => openLink('https://github.com/litttor')} activeOpacity={0.7}>
            <View style={s.iconContainer}>
              <Ionicons name="logo-github" size={22} color={theme.primary} />
            </View>
            <Text style={[s.label, { color: theme.text }]}>GitHub</Text>
            <Ionicons name="open-outline" size={20} color={theme.textSecondary} />
          </TouchableOpacity>
        </View>
        <Text style={[s.description, { color: theme.textSecondary }]}>{t('about.description')}</Text>
        <Text style={[s.copyright, { color: theme.textSecondary }]}>© 2026 Litttor. {t('about.allRightsReserved')}</Text>
      </ScrollView>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  container: { flex: 1 },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, paddingVertical: 12, borderBottomWidth: 0.5 },
  backButton: { width: 40, height: 40, justifyContent: 'center' },
  headerTitle: { fontSize: 17, fontWeight: '600', flex: 1, textAlign: 'center' },
  placeholder: { width: 40 },
  scrollContent: { paddingBottom: 40 },
  logoSection: { alignItems: 'center', paddingTop: 0, paddingBottom: 8 },
  logo: { width: 280, height: 280, marginTop: -40, marginBottom: -20 },
  appName: { fontSize: 24, fontWeight: '600', marginTop: -40, marginBottom: 4, letterSpacing: 0 },
  version: { fontSize: 15 },
  sectionTitle: { fontSize: 13, fontWeight: '600', marginTop: 24, marginBottom: 8, marginLeft: 16, textTransform: 'uppercase' },
  section: { marginHorizontal: 16, borderRadius: 28, overflow: 'hidden' },
  row: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingVertical: 12, paddingHorizontal: 16 },
  iconContainer: { width: 32, alignItems: 'center', marginRight: 12 },
  label: { fontSize: 16, flex: 1 },
  value: { fontSize: 16 },
  description: { fontSize: 14, lineHeight: 20, marginHorizontal: 16, marginTop: 24, textAlign: 'center' },
  copyright: { fontSize: 13, marginHorizontal: 16, marginTop: 16, textAlign: 'center' }
});
