import { useState, useContext, useRef, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, SafeAreaView, StatusBar, KeyboardAvoidingView, Platform, ActivityIndicator, Animated } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { AuthContext } from '../context/auth';

export default function AddAccountScreen({ navigation }) {
  const { sendAddAccountCode, verifyAddAccountCode, switchAccount } = useContext(AuthContext);
  const [step, setStep] = useState('phone');
  const [phone, setPhone] = useState('');
  const [phoneDisplay, setPhoneDisplay] = useState('');
  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const fade = useRef(new Animated.Value(1)).current;
  const slide = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    fade.setValue(0);
    slide.setValue(30);
    Animated.parallel([
      Animated.timing(fade, { toValue: 1, duration: 300, useNativeDriver: true }),
      Animated.timing(slide, { toValue: 0, duration: 300, useNativeDriver: true })
    ]).start();
  }, [step]);

  const formatPhoneNumber = (value) => {
    const cleaned = value.replace(/\D/g, '');
    const limited = cleaned.slice(0, 10);
    let formatted = '';
    if (limited.length > 0) {
      formatted = limited.slice(0, 3);
      if (limited.length > 3) formatted += ' ' + limited.slice(3, 6);
      if (limited.length > 6) formatted += ' ' + limited.slice(6, 10);
    }
    return { cleaned: limited, formatted };
  };

  const handlePhoneChange = (text) => {
    const { cleaned, formatted } = formatPhoneNumber(text);
    setPhone(cleaned);
    setPhoneDisplay(formatted);
  };

  const handlePhoneSubmit = async () => {
    if (phone.length < 10) {
      setError('Введите корректный номер телефона');
      return;
    }
    setLoading(true);
    setError('');
    try {
      await sendAddAccountCode(`7${phone}`);
      setStep('code');
    } catch (err) {
      setError(err.response?.data?.message || 'Ошибка отправки кода');
    } finally {
      setLoading(false);
    }
  };

  const handleCodeSubmit = async () => {
    if (code.length !== 5) {
      setError('Введите 5-значный код');
      return;
    }
    setLoading(true);
    setError('');
    try {
      const result = await verifyAddAccountCode(`7${phone}`, code);
      await switchAccount(result.account.userId);
      navigation.goBack();
    } catch (err) {
      setError(err.response?.data?.message || 'Ошибка проверки кода');
    } finally {
      setLoading(false);
    }
  };

  const handleBack = () => {
    if (step === 'code') {
      setStep('phone');
      setCode('');
      setError('');
    } else {
      navigation.goBack();
    }
  };

  return (
    <View style={s.gradient}>
      <SafeAreaView style={s.container}>
        <StatusBar barStyle="light-content" />
        <KeyboardAvoidingView style={s.content} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
          <TouchableOpacity onPress={handleBack} style={s.backButton}>
            <Ionicons name="chevron-back" size={28} color="#007AFF" />
            <Text style={s.backText}>Назад</Text>
          </TouchableOpacity>
          <View style={s.centerContainer}>
            <Animated.View style={[s.header, { opacity: fade, transform: [{ translateY: slide }] }]}>
              {step === 'phone' && (
                <>
                  <Ionicons name="person-add" size={80} color="#007AFF" />
                  <Text style={s.title}>Добавить аккаунт</Text>
                  <Text style={s.subtitle}>Введите номер телефона существующего аккаунта</Text>
                </>
              )}
              {step === 'code' && (
                <>
                  <Ionicons name="chatbox-ellipses" size={80} color="#007AFF" />
                  <Text style={s.title}>Введите код</Text>
                  <Text style={s.subtitle}>Код отправлен на +7 {phoneDisplay}</Text>
                </>
              )}
            </Animated.View>
            <Animated.View style={[s.form, { opacity: fade, transform: [{ translateY: slide }] }]}>
              {step === 'phone' && (
                <>
                  <View style={s.phoneContainer}>
                    <View style={s.phonePrefix}>
                      <Text style={s.phonePrefixText}>+7</Text>
                    </View>
                    <TextInput
                      style={s.phoneInput}
                      value={phoneDisplay}
                      onChangeText={handlePhoneChange}
                      placeholder="000 000 0000"
                      placeholderTextColor="#8E8E93"
                      keyboardType="phone-pad"
                      autoFocus
                    />
                  </View>
                  {error && <Text style={s.error}>{error}</Text>}
                  <TouchableOpacity
                    style={[s.button, (loading || !phone || phone.length < 10) && s.buttonDisabled]}
                    onPress={handlePhoneSubmit}
                    disabled={loading || !phone || phone.length < 10}
                    activeOpacity={0.7}
                  >
                    {loading ? <ActivityIndicator color="#FFFFFF" /> : <Text style={s.buttonText}>Продолжить</Text>}
                  </TouchableOpacity>
                </>
              )}
              {step === 'code' && (
                <>
                  <TextInput
                    style={s.codeInput}
                    value={code}
                    onChangeText={setCode}
                    placeholder="00000"
                    placeholderTextColor="#8E8E93"
                    keyboardType="number-pad"
                    maxLength={5}
                    autoFocus
                  />
                  {error && <Text style={s.error}>{error}</Text>}
                  <TouchableOpacity
                    style={[s.button, (loading || code.length !== 5) && s.buttonDisabled]}
                    onPress={handleCodeSubmit}
                    disabled={loading || code.length !== 5}
                    activeOpacity={0.7}
                  >
                    {loading ? <ActivityIndicator color="#FFFFFF" /> : <Text style={s.buttonText}>Добавить</Text>}
                  </TouchableOpacity>
                </>
              )}
            </Animated.View>
          </View>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </View>
  );
}

const s = StyleSheet.create({
  gradient: { flex: 1, backgroundColor: '#000000' },
  container: { flex: 1 },
  content: { flex: 1, paddingHorizontal: 24 },
  backButton: { flexDirection: 'row', alignItems: 'center', paddingTop: 8, position: 'absolute', top: 0, left: 16, zIndex: 10 },
  backText: { fontSize: 17, color: '#007AFF', marginLeft: 4 },
  centerContainer: { flex: 1, justifyContent: 'center' },
  header: { alignItems: 'center', marginBottom: 32 },
  title: { fontSize: 28, fontWeight: '400', color: '#FFFFFF', textAlign: 'center', marginBottom: 4, marginTop: 24 },
  subtitle: { fontSize: 15, color: '#8E8E93', textAlign: 'center', lineHeight: 20 },
  form: {},
  phoneContainer: { flexDirection: 'row', alignItems: 'center', marginBottom: 16 },
  phonePrefix: { backgroundColor: '#1A1A1C', paddingHorizontal: 20, paddingVertical: 16, borderRadius: 28, marginRight: 12 },
  phonePrefixText: { fontSize: 17, color: '#FFFFFF', fontWeight: '400' },
  phoneInput: { flex: 1, backgroundColor: '#1A1A1C', paddingHorizontal: 20, paddingVertical: 16, borderRadius: 28, fontSize: 17, color: '#FFFFFF' },
  codeInput: { backgroundColor: '#1A1A1C', paddingHorizontal: 20, paddingVertical: 16, borderRadius: 28, fontSize: 24, color: '#FFFFFF', marginBottom: 16, textAlign: 'center', letterSpacing: 8 },
  button: { backgroundColor: '#007AFF', paddingVertical: 16, borderRadius: 28, alignItems: 'center', marginTop: 8 },
  buttonDisabled: { opacity: 0.5 },
  buttonText: { fontSize: 17, fontWeight: '400', color: '#FFFFFF' },
  error: { fontSize: 14, color: '#FF3B30', textAlign: 'center', marginBottom: 12 }
});
