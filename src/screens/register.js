import { useState, useContext, useRef, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, SafeAreaView, StatusBar, KeyboardAvoidingView, Platform, ActivityIndicator, Animated } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import axios from 'axios';
import { AuthContext } from '../context/auth';
import { API_URL } from '../config/constants';

export default function RegisterScreen({ navigation }) {
  const { signIn } = useContext(AuthContext);
  const [step, setStep] = useState('phone');
  const [phone, setPhone] = useState('');
  const [phoneDisplay, setPhoneDisplay] = useState('');
  const [code, setCode] = useState(['', '', '', '', '']);
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const codeInputs = useRef([]);
  const fade = useRef(new Animated.Value(1)).current;
  const slide = useRef(new Animated.Value(0)).current;
  const successScale = useRef(new Animated.Value(0)).current;
  const iconScale = useRef(new Animated.Value(1)).current;
  const iconRotate = useRef(new Animated.Value(0)).current;
  const phoneRing = useRef(new Animated.Value(0)).current;
  const paper1 = useRef(new Animated.Value(0)).current;
  const paper2 = useRef(new Animated.Value(0)).current;
  const paper3 = useRef(new Animated.Value(0)).current;
  const confetti = useRef(Array.from({ length: 20 }, () => ({ x: new Animated.Value(0), y: new Animated.Value(0), rotate: new Animated.Value(0), opacity: new Animated.Value(0) }))).current;

  useEffect(() => {
    fade.setValue(0); slide.setValue(30);
    Animated.parallel([
      Animated.timing(fade, { toValue: 1, duration: 300, useNativeDriver: true }),
      Animated.timing(slide, { toValue: 0, duration: 300, useNativeDriver: true })
    ]).start();

    if (step === 'phone') {
      Animated.loop(Animated.sequence([
        Animated.timing(phoneRing, { toValue: 1, duration: 100, useNativeDriver: true }),
        Animated.timing(phoneRing, { toValue: -1, duration: 100, useNativeDriver: true }),
        Animated.timing(phoneRing, { toValue: 1, duration: 100, useNativeDriver: true }),
        Animated.timing(phoneRing, { toValue: -1, duration: 100, useNativeDriver: true }),
        Animated.timing(phoneRing, { toValue: 0, duration: 100, useNativeDriver: true }),
        Animated.delay(800)
      ])).start();
    } else if (step === 'code') {
      Animated.loop(Animated.sequence([
        Animated.parallel([
          Animated.timing(iconScale, { toValue: 1.15, duration: 400, useNativeDriver: true }),
          Animated.timing(iconRotate, { toValue: 1, duration: 400, useNativeDriver: true })
        ]),
        Animated.parallel([
          Animated.timing(paper1, { toValue: 1, duration: 800, useNativeDriver: true }),
          Animated.timing(paper2, { toValue: 1, duration: 900, useNativeDriver: true }),
          Animated.timing(paper3, { toValue: 1, duration: 700, useNativeDriver: true })
        ]),
        Animated.delay(100),
        Animated.parallel([
          Animated.timing(iconScale, { toValue: 1, duration: 400, useNativeDriver: true }),
          Animated.timing(iconRotate, { toValue: 0, duration: 400, useNativeDriver: true }),
          Animated.timing(paper1, { toValue: 0, duration: 0, useNativeDriver: true }),
          Animated.timing(paper2, { toValue: 0, duration: 0, useNativeDriver: true }),
          Animated.timing(paper3, { toValue: 0, duration: 0, useNativeDriver: true })
        ]),
        Animated.delay(600)
      ])).start();
    } else if (step === 'password') {
      Animated.loop(Animated.sequence([
        Animated.timing(iconRotate, { toValue: 1, duration: 300, useNativeDriver: true }),
        Animated.timing(iconRotate, { toValue: -1, duration: 600, useNativeDriver: true }),
        Animated.timing(iconRotate, { toValue: 0, duration: 300, useNativeDriver: true }),
        Animated.delay(1000)
      ])).start();
    } else if (step === 'success') {
      Animated.spring(successScale, { toValue: 1, tension: 50, friction: 7, useNativeDriver: true }).start();
      const launchConfetti = () => {
        confetti.forEach((particle, index) => {
          const angle = (index / confetti.length) * Math.PI * 2;
          const distance = 150 + Math.random() * 100;
          const xTarget = Math.cos(angle) * distance;
          const yTarget = Math.sin(angle) * distance;
          particle.x.setValue(0); particle.y.setValue(0); particle.rotate.setValue(0); particle.opacity.setValue(0);
          Animated.parallel([
            Animated.timing(particle.opacity, { toValue: 1, duration: 100, useNativeDriver: true }),
            Animated.timing(particle.x, { toValue: xTarget, duration: 800 + Math.random() * 400, useNativeDriver: true }),
            Animated.timing(particle.y, { toValue: yTarget, duration: 800 + Math.random() * 400, useNativeDriver: true }),
            Animated.timing(particle.rotate, { toValue: Math.random() * 720 - 360, duration: 800 + Math.random() * 400, useNativeDriver: true })
          ]).start(() => {
            Animated.timing(particle.opacity, { toValue: 0, duration: 300, useNativeDriver: true }).start();
          });
        });
      };
      setTimeout(() => { launchConfetti(); }, 400);
      const interval = setInterval(() => { launchConfetti(); }, 2500);
      return () => clearInterval(interval);
    }
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
    setPhone(cleaned); setPhoneDisplay(formatted);
  };

  const handlePhoneSubmit = async () => {
    if (phone.length < 10) { setError('Введите корректный номер телефона'); return; }
    setLoading(true); setError('');
    try {
      await axios.post(`${API_URL}/auth/register-send-code`, { phone: `7${phone}` });
      setStep('code');
    } catch (err) {
      setError(err.response?.data?.message || 'Ошибка отправки кода');
    } finally { setLoading(false); }
  };

  const handleCodeChange = (text, index) => {
    if (text.length > 1) text = text.slice(-1);
    const newCode = [...code];
    newCode[index] = text;
    setCode(newCode);
    if (text && index < 4) codeInputs.current[index + 1]?.focus();
    if (newCode.every(digit => digit !== '') && index === 4) handleCodeSubmit(newCode.join(''));
  };

  const handleCodeKeyPress = (e, index) => {
    if (e.nativeEvent.key === 'Backspace' && !code[index] && index > 0) codeInputs.current[index - 1]?.focus();
  };

  const handleCodeSubmit = async (fullCode) => {
    setLoading(true); setError('');
    try {
      await axios.post(`${API_URL}/auth/register-verify-code`, { phone: `7${phone}`, code: fullCode });
      setStep('name');
    } catch (err) {
      setError(err.response?.data?.message || 'Неверный код');
      setCode(['', '', '', '', '']);
      codeInputs.current[0]?.focus();
    } finally { setLoading(false); }
  };

  const handleNameSubmit = () => {
    if (!firstName.trim()) { setError('Введите имя'); return; }
    setError(''); setStep('username');
  };

  const handleUsernameSubmit = async () => {
    if (!username.trim()) { setError('Введите имя пользователя'); return; }
    if (username.length < 5) { setError('Имя пользователя должно содержать минимум 5 символов'); return; }
    setLoading(true); setError('');
    try {
      await axios.post(`${API_URL}/auth/check-username`, { username });
      setStep('password');
    } catch (err) {
      setError(err.response?.data?.message || 'Имя пользователя занято');
    } finally { setLoading(false); }
  };

  const handlePasswordSubmit = async () => {
    if (password.length < 4) { setError('Пароль должен содержать минимум 4 символа'); return; }
    if (password !== confirmPassword) { setError('Пароли не совпадают'); return; }
    setLoading(true); setError('');
    try {
      await axios.post(`${API_URL}/auth/register`, { phone: `7${phone}`, firstName, lastName, username, password });
      setStep('success');
    } catch (err) {
      setError(err.response?.data?.message || 'Ошибка регистрации');
    } finally { setLoading(false); }
  };

  const handleStart = async () => {
    try {
      const { data } = await axios.post(`${API_URL}/auth/phone-login`, { phone: `7${phone}`, password });
      signIn(data.user.token, data.user);
    } catch (err) {
      setError('Ошибка входа');
    }
  };

  const handleBack = () => {
    if (step === 'code') { setStep('phone'); setCode(['', '', '', '', '']); }
    else if (step === 'name') setStep('code');
    else if (step === 'username') setStep('name');
    else if (step === 'password') { setStep('username'); setPassword(''); setConfirmPassword(''); }
    setError('');
  };

  return (
    <View style={s.gradient}>
      <SafeAreaView style={s.container}>
        <StatusBar barStyle="light-content" />
        <KeyboardAvoidingView style={s.content} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
          {step !== 'phone' && step !== 'success' && (
            <TouchableOpacity onPress={handleBack} style={s.backButton}>
              <Ionicons name="chevron-back" size={28} color="#007AFF" />
              <Text style={s.backText}>Назад</Text>
            </TouchableOpacity>
          )}
          <View style={s.centerContainer}>
            <Animated.View style={[s.header, { opacity: fade, transform: [{ translateY: slide }] }]}>
              {step === 'phone' && (
                <>
                  <Animated.View style={{ transform: [{ rotate: phoneRing.interpolate({ inputRange: [-1, 1], outputRange: ['-15deg', '15deg'] }) }, { translateX: phoneRing.interpolate({ inputRange: [-1, 0, 1], outputRange: [-3, 0, 3] }) }] }}>
                    <Ionicons name="call" size={80} color="#007AFF" />
                  </Animated.View>
                  <Text style={s.title}>Регистрация</Text>
                  <Text style={s.subtitle}>Создайте аккаунт в LITTOR</Text>
                </>
              )}
              {step === 'code' && (
                <>
                  <View style={s.iconWrapper}>
                    <Animated.View style={[s.paper, { opacity: paper1.interpolate({ inputRange: [0, 0.2, 0.8, 1], outputRange: [0, 1, 1, 0] }), transform: [{ translateY: paper1.interpolate({ inputRange: [0, 1], outputRange: [0, -80] }) }, { translateX: paper1.interpolate({ inputRange: [0, 1], outputRange: [0, -40] }) }, { rotate: paper1.interpolate({ inputRange: [0, 1], outputRange: ['0deg', '-45deg'] }) }] }]} />
                    <Animated.View style={[s.paper, { opacity: paper2.interpolate({ inputRange: [0, 0.2, 0.8, 1], outputRange: [0, 1, 1, 0] }), transform: [{ translateY: paper2.interpolate({ inputRange: [0, 1], outputRange: [0, -100] }) }, { translateX: paper2.interpolate({ inputRange: [0, 1], outputRange: [0, 10] }) }, { rotate: paper2.interpolate({ inputRange: [0, 1], outputRange: ['0deg', '15deg'] }) }] }]} />
                    <Animated.View style={[s.paper, { opacity: paper3.interpolate({ inputRange: [0, 0.2, 0.8, 1], outputRange: [0, 1, 1, 0] }), transform: [{ translateY: paper3.interpolate({ inputRange: [0, 1], outputRange: [0, -70] }) }, { translateX: paper3.interpolate({ inputRange: [0, 1], outputRange: [0, 50] }) }, { rotate: paper3.interpolate({ inputRange: [0, 1], outputRange: ['0deg', '60deg'] }) }] }]} />
                    <Animated.View style={{ transform: [{ scale: iconScale }, { rotateY: iconRotate.interpolate({ inputRange: [0, 1], outputRange: ['0deg', '15deg'] }) }] }}>
                      <Ionicons name="mail-open" size={80} color="#007AFF" />
                    </Animated.View>
                  </View>
                  <Text style={s.title}>Введите код</Text>
                  <Text style={s.subtitle}>Код отправлен на телефон +7 {phoneDisplay}</Text>
                </>
              )}
              {step === 'name' && (
                <>
                  <Ionicons name="person" size={80} color="#007AFF" />
                  <Text style={s.title}>Ваше имя</Text>
                  <Text style={s.subtitle}>Как вас зовут?</Text>
                </>
              )}
              {step === 'username' && (
                <>
                  <Ionicons name="at" size={80} color="#007AFF" />
                  <Text style={s.title}>Имя пользователя</Text>
                  <Text style={s.subtitle}>Выберите уникальное имя</Text>
                </>
              )}
              {step === 'password' && (
                <>
                  <Animated.View style={{ transform: [{ rotate: iconRotate.interpolate({ inputRange: [-1, 1], outputRange: ['-20deg', '20deg'] }) }] }}>
                    <Ionicons name="key" size={80} color="#007AFF" />
                  </Animated.View>
                  <Text style={s.title}>Создайте пароль</Text>
                  <Text style={s.subtitle}>Защитите свой аккаунт</Text>
                </>
              )}
              {step === 'success' && (
                <>
                  <View style={s.confettiContainer}>
                    {confetti.map((particle, index) => {
                      const colors = ['#007AFF', '#34C759', '#FF3B30', '#FF9500', '#AF52DE', '#FFD60A'];
                      const color = colors[index % colors.length];
                      const shapes = ['●', '■', '▲', '★'];
                      const shape = shapes[index % shapes.length];
                      return (
                        <Animated.Text key={index} style={[s.confettiParticle, { color, opacity: particle.opacity, transform: [{ translateX: particle.x }, { translateY: particle.y }, { rotate: particle.rotate.interpolate({ inputRange: [-360, 360], outputRange: ['-360deg', '360deg'] }) }] }]}>
                          {shape}
                        </Animated.Text>
                      );
                    })}
                  </View>
                  <Animated.View style={{ transform: [{ scale: successScale }] }}>
                    <Ionicons name="checkmark-circle" size={120} color="#FFFFFF" />
                  </Animated.View>
                  <Text style={s.titleSuccess}>ДОБРО ПОЖАЛОВАТЬ</Text>
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
                    <TextInput style={s.phoneInput} value={phoneDisplay} onChangeText={handlePhoneChange} placeholder="000 000 0000" placeholderTextColor="#8E8E93" keyboardType="phone-pad" autoFocus />
                  </View>
                  {error && <Text style={s.error}>{error}</Text>}
                  <TouchableOpacity style={[s.button, (!phone || phone.length < 10) && s.buttonDisabled]} onPress={handlePhoneSubmit} disabled={loading || !phone || phone.length < 10} activeOpacity={0.7}>
                    {loading ? <ActivityIndicator color="#FFFFFF" /> : <Text style={s.buttonText}>Продолжить</Text>}
                  </TouchableOpacity>
                  <TouchableOpacity style={s.linkButton} onPress={() => navigation.navigate('login')} activeOpacity={0.7}>
                    <Text style={s.linkText}>Уже есть аккаунт? Войти</Text>
                  </TouchableOpacity>
                </>
              )}
              {step === 'code' && (
                <>
                  <View style={s.codeContainer}>
                    {code.map((digit, index) => (
                      <TextInput key={index} ref={ref => codeInputs.current[index] = ref} style={[s.codeInput, digit && s.codeInputFilled]} value={digit} onChangeText={(text) => handleCodeChange(text, index)} onKeyPress={(e) => handleCodeKeyPress(e, index)} keyboardType="number-pad" maxLength={1} autoFocus={index === 0} />
                    ))}
                  </View>
                  {error && <Text style={s.error}>{error}</Text>}
                </>
              )}
              {step === 'name' && (
                <>
                  <TextInput style={s.input} value={firstName} onChangeText={setFirstName} placeholder="Имя" placeholderTextColor="#8E8E93" autoFocus maxLength={30} />
                  <TextInput style={s.input} value={lastName} onChangeText={setLastName} placeholder="Фамилия (необязательно)" placeholderTextColor="#8E8E93" maxLength={30} />
                  {error && <Text style={s.error}>{error}</Text>}
                  <TouchableOpacity style={[s.button, !firstName.trim() && s.buttonDisabled]} onPress={handleNameSubmit} disabled={!firstName.trim()} activeOpacity={0.7}>
                    <Text style={s.buttonText}>Продолжить</Text>
                  </TouchableOpacity>
                </>
              )}
              {step === 'username' && (
                <>
                  <TextInput style={s.input} value={username} onChangeText={(text) => setUsername(text.toLowerCase().replace(/[^a-z0-9_]/g, ''))} placeholder="username" placeholderTextColor="#8E8E93" autoCapitalize="none" autoFocus maxLength={20} />
                  {error && <Text style={s.error}>{error}</Text>}
                  <TouchableOpacity style={[s.button, (!username.trim() || username.length < 5) && s.buttonDisabled]} onPress={handleUsernameSubmit} disabled={loading || !username.trim() || username.length < 5} activeOpacity={0.7}>
                    {loading ? <ActivityIndicator color="#FFFFFF" /> : <Text style={s.buttonText}>Продолжить</Text>}
                  </TouchableOpacity>
                </>
              )}
              {step === 'password' && (
                <>
                  <TextInput style={s.input} value={password} onChangeText={setPassword} placeholder="Пароль" placeholderTextColor="#8E8E93" secureTextEntry autoFocus />
                  <TextInput style={s.input} value={confirmPassword} onChangeText={setConfirmPassword} placeholder="Подтвердите пароль" placeholderTextColor="#8E8E93" secureTextEntry />
                  {error && <Text style={s.error}>{error}</Text>}
                  <TouchableOpacity style={[s.button, (!password || !confirmPassword) && s.buttonDisabled]} onPress={handlePasswordSubmit} disabled={loading || !password || !confirmPassword} activeOpacity={0.7}>
                    {loading ? <ActivityIndicator color="#FFFFFF" /> : <Text style={s.buttonText}>Создать аккаунт</Text>}
                  </TouchableOpacity>
                </>
              )}
              {step === 'success' && (
                <TouchableOpacity style={s.circleButton} onPress={handleStart} activeOpacity={0.7}>
                  <Ionicons name="arrow-forward" size={24} color="#FFFFFF" />
                </TouchableOpacity>
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
  title: { fontSize: 28, fontWeight: '600', color: '#FFFFFF', textAlign: 'center', marginBottom: 4, marginTop: 24 },
  titleSuccess: { fontSize: 36, fontWeight: '600', color: '#FFFFFF', textAlign: 'center', marginTop: 32, letterSpacing: 0 },
  subtitle: { fontSize: 15, color: '#8E8E93', textAlign: 'center', lineHeight: 20 },
  form: {},
  phoneContainer: { flexDirection: 'row', alignItems: 'center', marginBottom: 16 },
  phonePrefix: { backgroundColor: '#1A1A1C', paddingHorizontal: 20, paddingVertical: 16, borderRadius: 28, marginRight: 12 },
  phonePrefixText: { fontSize: 17, color: '#FFFFFF', fontWeight: '500' },
  phoneInput: { flex: 1, backgroundColor: '#1A1A1C', paddingHorizontal: 20, paddingVertical: 16, borderRadius: 28, fontSize: 17, color: '#FFFFFF' },
  codeContainer: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 24 },
  codeInput: { width: 60, height: 60, backgroundColor: '#1A1A1C', borderRadius: 16, fontSize: 24, color: '#FFFFFF', textAlign: 'center', borderWidth: 2, borderColor: '#1A1A1C' },
  codeInputFilled: { borderColor: '#007AFF' },
  input: { backgroundColor: '#1A1A1C', paddingHorizontal: 20, paddingVertical: 16, borderRadius: 28, fontSize: 17, color: '#FFFFFF', marginBottom: 12 },
  button: { backgroundColor: '#007AFF', paddingVertical: 16, borderRadius: 28, alignItems: 'center', marginTop: 8 },
  buttonDisabled: { opacity: 0.5 },
  buttonText: { fontSize: 17, fontWeight: '600', color: '#FFFFFF' },
  circleButton: { width: 56, height: 56, borderRadius: 28, backgroundColor: '#007AFF', alignItems: 'center', justifyContent: 'center', marginTop: 32, alignSelf: 'center', shadowColor: '#007AFF', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.5, shadowRadius: 12, elevation: 8 },
  linkButton: { alignItems: 'center', marginTop: 16 },
  linkText: { fontSize: 15, color: '#007AFF' },
  error: { fontSize: 14, color: '#FF3B30', textAlign: 'center', marginBottom: 12 },
  iconWrapper: { marginBottom: 24, alignItems: 'center', justifyContent: 'center', width: 120, height: 120 },
  paper: { position: 'absolute', width: 20, height: 24, backgroundColor: '#007AFF', borderRadius: 2 },
  confettiContainer: { position: 'absolute', width: '100%', height: '100%', alignItems: 'center', justifyContent: 'center', top: -60 },
  confettiParticle: { position: 'absolute', fontSize: 24, fontWeight: 'bold' }
});
