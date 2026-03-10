import { useState, useContext, useRef, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, SafeAreaView, StatusBar, KeyboardAvoidingView, Platform, ActivityIndicator, Image, Animated } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import axios from 'axios';
import { AuthContext } from '../context/auth';
import { API_URL } from '../config/constants';

export default function LoginScreen({ navigation }) {
    const { signIn } = useContext(AuthContext);
    const [step, setStep] = useState('welcome');
    const [phone, setPhone] = useState('');
    const [phoneDisplay, setPhoneDisplay] = useState('');
    const [code, setCode] = useState(['', '', '', '', '']);
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const codeInputs = useRef([]);
    const fade = useRef(new Animated.Value(1)).current;
    const slide = useRef(new Animated.Value(0)).current;
    const iconRotate = useRef(new Animated.Value(0)).current;
    const iconScale = useRef(new Animated.Value(1)).current;
    const paper1 = useRef(new Animated.Value(0)).current;
    const paper2 = useRef(new Animated.Value(0)).current;
    const paper3 = useRef(new Animated.Value(0)).current;
    const phoneRing = useRef(new Animated.Value(0)).current;
    const passwordProgress = useRef(new Animated.Value(0)).current;
    const lockOpen = useRef(new Animated.Value(0)).current;
    const shake = useRef(new Animated.Value(0)).current;
    const logoGlow = useRef(new Animated.Value(0)).current;

    useEffect(() => {
        fade.setValue(0); slide.setValue(30);
        Animated.parallel([
            Animated.timing(fade, { toValue: 1, duration: 300, useNativeDriver: true }),
            Animated.timing(slide, { toValue: 0, duration: 300, useNativeDriver: true })
        ]).start();

        if (step === 'welcome') {
            Animated.loop(Animated.timing(logoGlow, { toValue: 1, duration: 8000, useNativeDriver: true })).start();
        }

        if (step === 'phone') {
            Animated.loop(Animated.sequence([
                Animated.timing(phoneRing, { toValue: 1, duration: 100, useNativeDriver: true }),
                Animated.timing(phoneRing, { toValue: -1, duration: 100, useNativeDriver: true }),
                Animated.timing(phoneRing, { toValue: 1, duration: 100, useNativeDriver: true }),
                Animated.timing(phoneRing, { toValue: -1, duration: 100, useNativeDriver: true }),
                Animated.timing(phoneRing, { toValue: 0, duration: 100, useNativeDriver: true }),
                Animated.delay(800),
                Animated.timing(phoneRing, { toValue: 1, duration: 100, useNativeDriver: true }),
                Animated.timing(phoneRing, { toValue: -1, duration: 100, useNativeDriver: true }),
                Animated.timing(phoneRing, { toValue: 1, duration: 100, useNativeDriver: true }),
                Animated.timing(phoneRing, { toValue: -1, duration: 100, useNativeDriver: true }),
                Animated.timing(phoneRing, { toValue: 0, duration: 100, useNativeDriver: true }),
                Animated.delay(1500)
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
                Animated.delay(300),
                Animated.timing(passwordProgress, { toValue: 6, duration: 1200, useNativeDriver: false }),
                Animated.delay(200),
                Animated.sequence([
                    Animated.timing(shake, { toValue: 1, duration: 50, useNativeDriver: true }),
                    Animated.timing(shake, { toValue: -1, duration: 50, useNativeDriver: true }),
                    Animated.timing(shake, { toValue: 0, duration: 50, useNativeDriver: true })
                ]),
                Animated.timing(lockOpen, { toValue: 1, duration: 300, useNativeDriver: true }),
                Animated.delay(800),
                Animated.parallel([
                    Animated.timing(lockOpen, { toValue: 0, duration: 300, useNativeDriver: true }),
                    Animated.timing(passwordProgress, { toValue: 0, duration: 300, useNativeDriver: false })
                ]),
                Animated.delay(500)
            ])).start();
        }

        return () => {
            iconRotate.setValue(0); iconScale.setValue(1);
            paper1.setValue(0); paper2.setValue(0); paper3.setValue(0);
            phoneRing.setValue(0); passwordProgress.setValue(0);
            lockOpen.setValue(0); shake.setValue(0);
        };
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
            const response = await axios.post(`${API_URL}/auth/send-code`, { phone: `7${phone}` });
            console.log('код отправлен:', response.data);
            setStep('code');
        } catch (err) {
            console.error('ошибка отправки кода:', err.response?.data);
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
            await axios.post(`${API_URL}/auth/verify-code`, { phone: `7${phone}`, code: fullCode });
            setStep('password');
        } catch (err) {
            setError(err.response?.data?.message || 'Неверный код');
            setCode(['', '', '', '', '']);
            codeInputs.current[0]?.focus();
        } finally { setLoading(false); }
    };

    const handlePasswordSubmit = async () => {
        if (password.length < 4) { setError('Пароль должен содержать минимум 4 символа'); return; }
        setLoading(true); setError('');
        try {
            const { data } = await axios.post(`${API_URL}/auth/phone-login`, { phone: `7${phone}`, password });
            signIn(data.user.token, data.user);
        } catch (err) {
            setError(err.response?.data?.message || 'Неверный пароль');
        } finally { setLoading(false); }
    };

    const handleBack = () => {
        if (step === 'phone') setStep('welcome');
        else if (step === 'code') { setStep('phone'); setCode(['', '', '', '', '']); }
        else if (step === 'password') { setStep('code'); setPassword(''); }
        setError('');
    };

    return (
        <View style={s.gradient}>
            <SafeAreaView style={s.container}>
                <StatusBar barStyle="light-content" />
                <KeyboardAvoidingView style={s.content} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
                    {step !== 'phone' && step !== 'welcome' && (
                        <TouchableOpacity onPress={handleBack} style={s.backButton}>
                            <Ionicons name="chevron-back" size={28} color="#007AFF" />
                            <Text style={s.backText}>Назад</Text>
                        </TouchableOpacity>
                    )}
                    <View style={s.centerContainer}>
                        <Animated.View style={[s.header, { opacity: fade, transform: [{ translateY: slide }] }]}>
                            {step === 'welcome' && (
                                <>
                                    <View style={s.logoContainer}>
                                        <Animated.View style={[s.logoGlow, { transform: [{ rotate: logoGlow.interpolate({ inputRange: [0, 1], outputRange: ['0deg', '360deg'] }) }] }]}>
                                            {[...Array(12)].map((_, i) => (
                                                <View key={i} style={[s.glowPetal, { transform: [{ rotate: `${i * 30}deg` }, { translateY: -100 }] }]} />
                                            ))}
                                        </Animated.View>
                                        <Image source={require('../../assets/logo.png')} style={s.logo} resizeMode="contain" />
                                    </View>
                                </>
                            )}
                            {step === 'phone' && (
                                <>
                                    <View style={s.iconWrapper}>
                                        <Animated.View style={{ transform: [{ rotate: phoneRing.interpolate({ inputRange: [-1, 1], outputRange: ['-15deg', '15deg'] }) }, { translateX: phoneRing.interpolate({ inputRange: [-1, 0, 1], outputRange: [-3, 0, 3] }) }] }}>
                                            <Ionicons name="call" size={80} color="#007AFF" />
                                        </Animated.View>
                                    </View>
                                    <Text style={s.title}>Телефон</Text>
                                    <Text style={s.subtitle}>Проверьте код страны и введите{'\n'}свой номер телефона</Text>
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
                                    <Text style={s.subtitle}>Код должен прийти от LITTOR на{'\n'}телефон +7 {phoneDisplay}</Text>
                                </>
                            )}
                            {step === 'password' && (
                                <>
                                    <View style={s.iconWrapper}>
                                        <Animated.View style={{ transform: [{ translateX: shake.interpolate({ inputRange: [-1, 1], outputRange: [-8, 8] }) }] }}>
                                            <Animated.View style={{ opacity: lockOpen.interpolate({ inputRange: [0, 0.5, 1], outputRange: [1, 0, 0] }), position: 'absolute' }}>
                                                <Ionicons name="lock-closed" size={80} color="#007AFF" />
                                            </Animated.View>
                                            <Animated.View style={{ opacity: lockOpen.interpolate({ inputRange: [0, 0.5, 1], outputRange: [0, 0, 1] }) }}>
                                                <Ionicons name="lock-open" size={80} color="#34C759" />
                                            </Animated.View>
                                        </Animated.View>
                                        <Animated.View style={{ position: 'absolute', top: '100%', marginTop: -15, transform: [{ translateX: shake.interpolate({ inputRange: [-1, 1], outputRange: [-8, 8] }) }] }}>
                                            <Animated.View style={{ opacity: lockOpen.interpolate({ inputRange: [0, 0.3, 1], outputRange: [1, 0, 0] }), transform: [{ scale: lockOpen.interpolate({ inputRange: [0, 0.3, 1], outputRange: [1, 0.8, 0.8] }) }] }}>
                                                <View style={s.passwordDots}>
                                                    <Animated.Text style={[s.passwordDot, { opacity: passwordProgress.interpolate({ inputRange: [0, 1, 6], outputRange: [0.3, 1, 1] }) }]}>•</Animated.Text>
                                                    <Animated.Text style={[s.passwordDot, { opacity: passwordProgress.interpolate({ inputRange: [0, 1, 2, 6], outputRange: [0.3, 0.3, 1, 1] }) }]}>•</Animated.Text>
                                                    <Animated.Text style={[s.passwordDot, { opacity: passwordProgress.interpolate({ inputRange: [0, 2, 3, 6], outputRange: [0.3, 0.3, 1, 1] }) }]}>•</Animated.Text>
                                                    <Animated.Text style={[s.passwordDot, { opacity: passwordProgress.interpolate({ inputRange: [0, 3, 4, 6], outputRange: [0.3, 0.3, 1, 1] }) }]}>•</Animated.Text>
                                                    <Animated.Text style={[s.passwordDot, { opacity: passwordProgress.interpolate({ inputRange: [0, 4, 5, 6], outputRange: [0.3, 0.3, 1, 1] }) }]}>•</Animated.Text>
                                                    <Animated.Text style={[s.passwordDot, { opacity: passwordProgress.interpolate({ inputRange: [0, 5, 6], outputRange: [0.3, 0.3, 1] }) }]}>•</Animated.Text>
                                                </View>
                                            </Animated.View>
                                        </Animated.View>
                                    </View>
                                    <Text style={s.title}>Введите пароль</Text>
                                    <Text style={s.subtitle}>Ваш аккаунт защищен паролем</Text>
                                </>
                            )}
                        </Animated.View>
                        <Animated.View style={[s.form, { opacity: fade, transform: [{ translateY: slide }] }]}>
                            {step === 'welcome' && (
                                <>
                                    <TouchableOpacity style={s.button} onPress={() => setStep('phone')} activeOpacity={0.7}>
                                        <Text style={s.buttonText}>Далее</Text>
                                    </TouchableOpacity>
                                    <TouchableOpacity style={s.linkButton} onPress={() => navigation.navigate('register')} activeOpacity={0.7}>
                                        <Text style={s.linkText}>Создать аккаунт</Text>
                                    </TouchableOpacity>
                                </>
                            )}
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
                                    <TouchableOpacity style={s.linkButton} activeOpacity={0.7}>
                                        <Text style={s.linkText}>Не пришел код?</Text>
                                    </TouchableOpacity>
                                </>
                            )}
                            {step === 'password' && (
                                <>
                                    <TextInput style={s.passwordInput} value={password} onChangeText={setPassword} placeholder="Введите пароль" placeholderTextColor="#8E8E93" secureTextEntry autoFocus />
                                    {error && <Text style={s.error}>{error}</Text>}
                                    <TouchableOpacity style={[s.button, !password && s.buttonDisabled]} onPress={handlePasswordSubmit} disabled={loading || !password} activeOpacity={0.7}>
                                        {loading ? <ActivityIndicator color="#FFFFFF" /> : <Text style={s.buttonText}>Войти</Text>}
                                    </TouchableOpacity>
                                </>
                            )}
                        </Animated.View>
                    </View>
                    {step === 'welcome' && (
                        <Text style={s.footer}>Нажимая кнопку «Далее», я даю согласие на обработку персональных данных в соответствии с условиями <Text style={s.footerLink}>Политики конфиденциальности</Text> и принимаю условия <Text style={s.footerLink}>Пользовательского соглашения</Text></Text>
                    )}
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
    logoContainer: { position: 'relative', width: 280, height: 280, alignItems: 'center', justifyContent: 'center', marginBottom: 32 },
    logo: { width: 280, height: 280, zIndex: 2 },
    logoGlow: { position: 'absolute', width: 280, height: 280, alignItems: 'center', justifyContent: 'center', zIndex: 1 },
    glowPetal: { position: 'absolute', width: 16, height: 30, backgroundColor: 'rgba(255,255,255,0.15)', borderRadius: 8, shadowColor: '#FFFFFF', shadowOffset: { width: 0, height: 0 }, shadowOpacity: 0.5, shadowRadius: 8 },
    iconWrapper: { marginBottom: 24, alignItems: 'center', justifyContent: 'center', width: 120, height: 120 },
    paper: { position: 'absolute', width: 20, height: 24, backgroundColor: '#007AFF', borderRadius: 2 },
    passwordDots: { flexDirection: 'row', gap: 6 },
    passwordDot: { fontSize: 28, color: '#007AFF', fontWeight: 'bold' },
    title: { fontSize: 28, fontWeight: '500', color: '#FFFFFF', textAlign: 'center', marginBottom: 4, marginTop: 24 },
    subtitle: { fontSize: 15, color: '#8E8E93', textAlign: 'center', lineHeight: 20 },
    form: {},
    phoneContainer: { flexDirection: 'row', alignItems: 'center', marginBottom: 16 },
    phonePrefix: { backgroundColor: '#1A1A1C', paddingHorizontal: 20, paddingVertical: 16, borderRadius: 28, marginRight: 12 },
    phonePrefixText: { fontSize: 17, color: '#FFFFFF', fontWeight: '400' },
    phoneInput: { flex: 1, backgroundColor: '#1A1A1C', paddingHorizontal: 20, paddingVertical: 16, borderRadius: 28, fontSize: 17, color: '#FFFFFF' },
    codeContainer: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 24 },
    codeInput: { width: 60, height: 60, backgroundColor: '#1A1A1C', borderRadius: 16, fontSize: 24, color: '#FFFFFF', textAlign: 'center', borderWidth: 2, borderColor: '#1A1A1C' },
    codeInputFilled: { borderColor: '#007AFF' },
    passwordInput: { backgroundColor: '#1A1A1C', paddingHorizontal: 20, paddingVertical: 16, borderRadius: 28, fontSize: 17, color: '#FFFFFF', marginBottom: 16 },
    button: { backgroundColor: '#007AFF', paddingVertical: 16, borderRadius: 28, alignItems: 'center', marginTop: 8 },
    buttonDisabled: { opacity: 0.5 },
    buttonText: { fontSize: 17, fontWeight: '500', color: '#FFFFFF' },
    linkButton: { alignItems: 'center', marginTop: 16 },
    linkText: { fontSize: 15, color: '#007AFF' },
    error: { fontSize: 14, color: '#FF3B30', textAlign: 'center', marginBottom: 12 },
    footer: { fontSize: 12, color: '#8E8E93', textAlign: 'center', lineHeight: 16, paddingBottom: 24 },
    footerLink: { color: '#007AFF' }
});
