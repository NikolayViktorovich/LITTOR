import { useContext } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, SafeAreaView, ScrollView, StatusBar, Linking } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import { ThemeContext } from '../context/theme';

export default function HelpScreen({ navigation }) {
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
        <Text style={[s.headerTitle, { color: theme.text }]}>{t('settings.help')}</Text>
        <View style={s.placeholder} />
      </View>
      <ScrollView contentContainerStyle={s.scrollContent} showsVerticalScrollIndicator={false}>
        <Text style={[s.sectionTitle, { color: theme.textSecondary }]}>{t('help.faq')}</Text>
        <View style={[s.section, { backgroundColor: theme.surface }]}>
          {[
            t('help.howToCreateGroup'),
            t('help.howToSendMedia'),
            t('help.howToMakeCall'),
            t('help.howToChangeTheme'),
            t('help.howToBackup')
          ].map((label, i, arr) => (
            <TouchableOpacity key={i} style={[s.row, i < arr.length - 1 && { borderBottomWidth: 0.5, borderBottomColor: theme.divider }]} onPress={() => { }} activeOpacity={0.7}>
              <View style={s.labelContainer}>
                <Text style={[s.label, { color: theme.text }]}>{label}</Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color={theme.textSecondary} />
            </TouchableOpacity>
          ))}
        </View>
        <Text style={[s.sectionTitle, { color: theme.textSecondary }]}>{t('help.support')}</Text>
        <View style={[s.section, { backgroundColor: theme.surface }]}>
          {[
            { icon: 'chatbubble-outline', label: t('help.contactSupport'), hint: t('help.liveChatHint'), action: () => { } },
            { icon: 'bug-outline', label: t('help.reportBug'), hint: t('help.reportBugHint'), action: () => { }, last: true }
          ].map(({ icon, label, hint, action, last }, i) => (
            <TouchableOpacity key={i} style={[s.row, !last && { borderBottomWidth: 0.5, borderBottomColor: theme.divider }]} onPress={action} activeOpacity={0.7}>
              <View style={s.iconContainer}>
                <Ionicons name={icon} size={22} color={theme.primary} />
              </View>
              <View style={s.labelContainer}>
                <Text style={[s.label, { color: theme.text }]}>{label}</Text>
                <Text style={[s.hint, { color: theme.textSecondary }]}>{hint}</Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color={theme.textSecondary} />
            </TouchableOpacity>
          ))}
        </View>
        <Text style={[s.sectionTitle, { color: theme.textSecondary }]}>{t('help.resources')}</Text>
        <View style={[s.section, { backgroundColor: theme.surface }]}>
          {[
            { icon: 'book-outline', label: t('help.documentation'), url: 'https://example.com/docs' },
            { icon: 'people-outline', label: t('help.community'), url: 'https://example.com/community', last: true }
          ].map(({ icon, label, url, last }, i) => (
            <TouchableOpacity key={i} style={[s.row, !last && { borderBottomWidth: 0.5, borderBottomColor: theme.divider }]} onPress={() => openLink(url)} activeOpacity={0.7}>
              <View style={s.iconContainer}>
                <Ionicons name={icon} size={22} color={theme.primary} />
              </View>
              <Text style={[s.label, { color: theme.text }]}>{label}</Text>
              <Ionicons name="open-outline" size={20} color={theme.textSecondary} />
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  container: { flex: 1 },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, paddingVertical: 12, borderBottomWidth: 0.5 },
  backButton: { width: 40, height: 40, justifyContent: 'center' },
  headerTitle: { fontSize: 17, fontWeight: '500', flex: 1, textAlign: 'center' },
  placeholder: { width: 40 },
  scrollContent: { paddingBottom: 40 },
  sectionTitle: { fontSize: 13, fontWeight: '500', marginTop: 24, marginBottom: 8, marginLeft: 16, textTransform: 'uppercase' },
  section: { marginHorizontal: 16, borderRadius: 28, overflow: 'hidden' },
  row: { flexDirection: 'row', alignItems: 'center', paddingVertical: 12, paddingHorizontal: 16 },
  iconContainer: { width: 32, alignItems: 'center', marginRight: 12 },
  label: { fontSize: 16, flex: 1 },
  labelContainer: { flex: 1 },
  hint: { fontSize: 13, marginTop: 2, lineHeight: 16 }
});
