import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { setUser } from '@/store/slices/Auth/authSlice';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useEffect, useRef, useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    KeyboardAvoidingView,
    Platform,
    Pressable,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export const VerifyEmailPage: React.FC = () => {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'dark'];
  const router = useRouter();
  const dispatch = useAppDispatch();

  const verifyEmailData = useAppSelector((state) => state.auth.verifyEmailData);
  const [codes, setCodes] = useState<string[]>(['', '', '', '', '', '']);
  const [isVerifying, setIsVerifying] = useState(false);
  const [timeLeft, setTimeLeft] = useState(60);
  const [checked, setChecked] = useState(false);
  const inputRefs = useRef<(TextInput | null)[]>([]);

  useEffect(() => {
    if (!checked && !verifyEmailData?.email) {
      const timeout = setTimeout(() => {
        console.log('No verify data available, redirecting to signup');
        setChecked(true);
        Alert.alert('Lỗi', 'Dữ liệu không hợp lệ. Vui lòng đăng ký lại.');
        router.replace('/signup');
      }, 500);
      return () => clearTimeout(timeout);
    }
    if (verifyEmailData?.email) {
      setChecked(true);
      console.log('Verify data loaded:', verifyEmailData.email);
    }
  }, [verifyEmailData?.email, router, checked]);

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const handleCodeChange = (text: string, index: number) => {
    if (text.length > 1) {
      text = text.charAt(text.length - 1);
    }

    if (!/^\d*$/.test(text)) {
      return;
    }

    const newCodes = [...codes];
    newCodes[index] = text;
    setCodes(newCodes);

    if (text && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleBackspace = (index: number) => {
    if (!codes[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handleVerifyCode = async () => {
    const fullCode = codes.join('').trim();
    
    console.log('Verify attempt:', {
      enteredCode: fullCode,
      enteredCodeLength: fullCode.length,
      storedCode: verifyEmailData?.verificationCode,
      storedCodeLength: verifyEmailData?.verificationCode?.length,
      codeMatch: fullCode === verifyEmailData?.verificationCode,
      hasVerifyData: !!verifyEmailData,
      hasUser: !!verifyEmailData?.user,
    });

    if (fullCode.length !== 6) {
      Alert.alert('Lỗi', 'Vui lòng nhập đầy đủ 6 số');
      return;
    }

    if (!verifyEmailData?.verificationCode) {
      Alert.alert('Lỗi', 'Dữ liệu xác minh không có sẵn. Vui lòng đăng ký lại.');
      router.replace('/signup');
      return;
    }

    setIsVerifying(true);
    try {
      if (fullCode === verifyEmailData.verificationCode) {
        console.log('Verification successful!');
        if (verifyEmailData?.user) {
          dispatch(setUser(verifyEmailData.user));
        }
        
        Alert.alert('Thành công', 'Email đã được xác minh', [
          {
            text: 'OK',
            onPress: () => router.replace('/(tabs)'),
          },
        ]);
      } else {
        console.log('Verification failed - code mismatch');
        Alert.alert('Lỗi', 'Mã xác minh không chính xác');
        setCodes(['', '', '', '', '', '']);
        inputRefs.current[0]?.focus();
      }
    } catch (error) {
      console.error('Verify error:', error);
      Alert.alert('Lỗi', 'Không thể xác minh email');
    } finally {
      setIsVerifying(false);
    }
  };

  const handleResendCode = async () => {
    setTimeLeft(60);
    setCodes(['', '', '', '', '', '']);
    inputRefs.current[0]?.focus();
    Alert.alert('Thành công', `Mã xác minh mới đã được gửi đến ${verifyEmailData?.email}`);
  };

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background,
      paddingHorizontal: 20,
    },
    keyboardWrap: {
      flex: 1,
    },
    scrollContent: {
      flexGrow: 1,
      justifyContent: 'center',
    },
    cardContainer: {
      gap: 24,
      alignItems: 'center',
    },
    header: {
      alignItems: 'center',
      gap: 12,
    },
    iconContainer: {
      width: 80,
      height: 80,
      borderRadius: 40,
      backgroundColor: 'rgba(74, 144, 226, 0.15)',
      justifyContent: 'center',
      alignItems: 'center',
      marginBottom: 8,
    },
    title: {
      fontSize: 24,
      fontWeight: '800',
      color: colors.text,
      textAlign: 'center',
    },
    subtitle: {
      fontSize: 13,
      color: colors.tabIconDefault,
      textAlign: 'center',
      lineHeight: 18,
    },
    email: {
      fontSize: 13,
      fontWeight: '600',
      color: colors.tint,
    },
    codeSection: {
      gap: 20,
      width: '100%',
    },
    codeInputs: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      gap: 10,
    },
    codeInput: {
      flex: 1,
      aspectRatio: 1,
      borderRadius: 12,
      textAlign: 'center',
      fontSize: 24,
      fontWeight: '700',
      color: colors.text,
      backgroundColor:
        colorScheme === 'dark'
          ? 'rgba(255,255,255,0.08)'
          : 'rgba(0,0,0,0.06)',
      borderWidth: 2,
      borderColor: 'rgba(74, 144, 226, 0.3)',
    },
    resendSection: {
      alignItems: 'center',
      gap: 8,
    },
    resendText: {
      fontSize: 13,
      color: colors.tabIconDefault,
    },
    timerText: {
      fontSize: 13,
      fontWeight: '600',
      color: colors.tint,
    },
    resendButton: {
      paddingHorizontal: 16,
      paddingVertical: 8,
    },
    resendButtonText: {
      fontSize: 13,
      fontWeight: '600',
      color: colors.tint,
    },
    resendButtonDisabled: {
      opacity: 0.5,
    },
    verifyButton: {
      width: '100%',
      paddingVertical: 14,
      borderRadius: 10,
      alignItems: 'center',
      backgroundColor: colors.tint,
    },
    verifyButtonText: {
      fontSize: 14,
      fontWeight: '600',
      color: '#fff',
    },
    backButton: {
      width: 40,
      height: 40,
      borderRadius: 20,
      backgroundColor: 'rgba(255,255,255,0.1)',
      justifyContent: 'center',
      alignItems: 'center',
      marginBottom: 20,
      alignSelf: 'flex-start',
    },
    debugCodeContainer: {
      marginTop: 20,
      padding: 12,
      borderRadius: 10,
      backgroundColor: 'rgba(255, 193, 7, 0.1)',
      borderWidth: 1,
      borderColor: 'rgba(255, 193, 7, 0.3)',
    },
    debugCodeLabel: {
      fontSize: 11,
      fontWeight: '600',
      color: '#4fe60a',
      marginBottom: 4,
    },
    debugCode: {
      fontSize: 16,
      fontWeight: '700',
      color: '#FFC107',
      letterSpacing: 2,
    },
  });

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom', 'left', 'right']}>
      <Pressable
        style={styles.backButton}
        onPress={() => router.back()}
        disabled={isVerifying}
      >
        <Ionicons name="chevron-back" size={24} color={colors.text} />
      </Pressable>

      <KeyboardAvoidingView
        style={styles.keyboardWrap}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 10 : 0}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.cardContainer}>
        <View style={styles.header}>
          <View style={styles.iconContainer}>
            <Ionicons name="mail" size={40} color={colors.tint} />
          </View>
          <Text style={styles.title}>Xác minh email</Text>
          <Text style={styles.subtitle}>
            Chúng tôi đã gửi mã xác minh 6 số đến{'\n'}
            <Text style={styles.email}>{verifyEmailData?.email}</Text>
          </Text>
        </View>

        <View style={styles.codeSection}>
          <View style={styles.codeInputs}>
            {codes.map((code, index) => (
              <TextInput
                key={index}
                ref={(ref) => {
                  inputRefs.current[index] = ref;
                }}
                style={styles.codeInput}
                keyboardType="numeric"
                maxLength={1}
                value={code}
                onChangeText={(text) => handleCodeChange(text, index)}
                onKeyPress={({ nativeEvent }) => {
                  if (nativeEvent.key === 'Backspace') {
                    handleBackspace(index);
                  }
                }}
                editable={!isVerifying}
                selectTextOnFocus
              />
            ))}
          </View>

          <Pressable
            style={[styles.verifyButton, isVerifying && { opacity: 0.6 }]}
            onPress={handleVerifyCode}
            disabled={isVerifying || codes.join('').length !== 6}
          >
            {isVerifying ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.verifyButtonText}>Xác minh</Text>
            )}
          </Pressable>
        </View>

        <View style={styles.resendSection}>
          <Text style={styles.resendText}>Không nhận được mã?</Text>
          <Pressable
            onPress={handleResendCode}
            disabled={timeLeft > 0 || isVerifying}
            style={timeLeft > 0 && styles.resendButtonDisabled}
          >
            <Text style={[styles.resendButtonText]}>
              {timeLeft > 0 ? `Gửi lại trong ${timeLeft}s` : 'Gửi lại'}
            </Text>
          </Pressable>
        </View>

        {verifyEmailData?.verificationCode && (
          <View style={styles.debugCodeContainer}>
            <Text style={styles.debugCodeLabel}> Mã xác minh (Testing):</Text>
            <Text style={styles.debugCode}>{verifyEmailData.verificationCode}</Text>
          </View>
        )}
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

export default VerifyEmailPage;
