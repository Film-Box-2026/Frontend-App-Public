import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { signupMock } from '@/services/api/hooks';
import { saveHistory, saveRatings, saveResumePoints, saveUser, saveWatchlist } from '@/services/storage/storageService';
import { useAppDispatch } from '@/store/hooks';
import { setError, setLoading, setVerifyEmailData } from '@/store/slices/Auth/authSlice';
import { setHistory } from '@/store/slices/HistorySlice/historySlice';
import { setRatings } from '@/store/slices/RatingSlice/ratingSlice';
import { setResumePoints } from '@/store/slices/ResumeSlice/resumeSlice';
import { setWatchlist } from '@/store/slices/WatchlistSlice/watchlistSlice';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import {
  ActivityIndicator,
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

export const SignupPage: React.FC = () => {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];
  const dispatch = useAppDispatch();
  const router = useRouter();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoadingState] = useState(false);
  const [error, setErrorState] = useState('');

  const handleSignup = async () => {
    if (!name || !email || !password || !confirmPassword) {
      setErrorState('Vui lòng nhập đầy đủ thông tin');
      return;
    }

    setLoadingState(true);
    setErrorState('');
    dispatch(setLoading(true));

    try {
      const response = await signupMock({
        name,
        email,
        password,
        confirmPassword,
      });

      await saveUser(response.user);
      await saveWatchlist([]);
      await saveHistory([]);
      await saveRatings([]);
      await saveResumePoints({});

      const verificationCode = Math.floor(Math.random() * 1000000)
        .toString()
        .padStart(6, '0')
        .trim();

      console.log(
        `Verification code for ${email}: ${verificationCode} (length: ${verificationCode.length})`
      );

      dispatch(
        setVerifyEmailData({
          email: email.trim(),
          verificationCode,
          user: response.user,
        })
      );

      dispatch(setWatchlist([]));
      dispatch(setHistory([]));
      dispatch(setRatings([]));
      dispatch(setResumePoints({}));
      dispatch(setLoading(false));

      router.replace('/verify-email');
    } catch (err: any) {
      setErrorState(err.message || 'Đăng ký thất bại');
      dispatch(setError(err.message || 'Đăng ký thất bại'));
      dispatch(setLoading(false));
    } finally {
      setLoadingState(false);
    }
  };

  const handleNavigateToLogin = () => {
    router.back();
  };

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background,
    },
    topActions: {
      position: 'absolute',
      top: -30,
      left: 16,
      zIndex: 10,
    },
    backHomeButton: {
      width: 40,
      height: 40,
      borderRadius: 20,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor:
        colorScheme === 'dark'
          ? 'rgba(255,255,255,0.12)'
          : 'rgba(0,0,0,0.08)',
    },
    scrollContent: {
      flexGrow: 1,
      paddingHorizontal: 24,
      justifyContent: 'center',
      paddingVertical: 32,
    },
    title: {
      fontSize: 32,
      fontWeight: '700',
      color: colors.text,
      marginBottom: 8,
      textAlign: 'center',
    },
    subtitle: {
      fontSize: 14,
      color: colors.tabIconDefault,
      marginBottom: 32,
      textAlign: 'center',
    },
    inputContainer: {
      marginBottom: 16,
    },
    label: {
      fontSize: 14,
      fontWeight: '600',
      color: colors.text,
      marginBottom: 8,
    },
    input: {
      borderWidth: 1,
      borderColor: colors.tabIconDefault,
      borderRadius: 8,
      paddingHorizontal: 12,
      paddingVertical: 12,
      fontSize: 14,
      color: colors.text,
      backgroundColor: colors.background,
    },
    errorText: {
      color: '#FF6B6B',
      fontSize: 12,
      marginTop: 8,
      textAlign: 'center',
    },
    signupButton: {
      backgroundColor: colors.tint,
      borderRadius: 8,
      paddingVertical: 14,
      alignItems: 'center',
      marginTop: 24,
    },
    signupButtonText: {
      color: '#fff',
      fontSize: 16,
      fontWeight: '600',
    },
    loginContainer: {
      flexDirection: 'row',
      justifyContent: 'center',
      marginTop: 16,
    },
    loginText: {
      fontSize: 14,
      color: colors.tabIconDefault,
    },
    loginLink: {
      fontSize: 14,
      color: colors.tint,
      fontWeight: '600',
      marginLeft: 4,
    },
  });

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1 }}
      >
        <View style={styles.topActions}>
          <Pressable
            style={styles.backHomeButton}
            onPress={() => router.replace('/(tabs)')}
            disabled={loading}
          >
            <Ionicons name="chevron-back" size={22} color={colors.text} />
          </Pressable>
        </View>

        <ScrollView contentContainerStyle={styles.scrollContent}>
          <Text style={styles.title}>Tạo Tài Khoản</Text>
          <Text style={styles.subtitle}>Đăng ký để bắt đầu sử dụng</Text>

          <View style={styles.inputContainer}>
            <Text style={styles.label}>Tên</Text>
            <TextInput
              style={styles.input}
              placeholder="Nhập tên của bạn"
              placeholderTextColor={colors.tabIconDefault}
              value={name}
              onChangeText={setName}
              editable={!loading}
            />
          </View>

          <View style={styles.inputContainer}>
            <Text style={styles.label}>Email</Text>
            <TextInput
              style={styles.input}
              placeholder="Nhập email"
              placeholderTextColor={colors.tabIconDefault}
              value={email}
              onChangeText={setEmail}
              editable={!loading}
              keyboardType="email-address"
            />
          </View>

          <View style={styles.inputContainer}>
            <Text style={styles.label}>Mật khẩu</Text>
            <TextInput
              style={styles.input}
              placeholder="Nhập mật khẩu (ít nhất 6 ký tự)"
              placeholderTextColor={colors.tabIconDefault}
              value={password}
              onChangeText={setPassword}
              editable={!loading}
              secureTextEntry
            />
          </View>

          <View style={styles.inputContainer}>
            <Text style={styles.label}>Xác nhận mật khẩu</Text>
            <TextInput
              style={styles.input}
              placeholder="Nhập lại mật khẩu"
              placeholderTextColor={colors.tabIconDefault}
              value={confirmPassword}
              onChangeText={setConfirmPassword}
              editable={!loading}
              secureTextEntry
            />
          </View>

          {error ? <Text style={styles.errorText}>{error}</Text> : null}

          <Pressable
            style={styles.signupButton}
            onPress={handleSignup}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.signupButtonText}>Đăng Ký</Text>
            )}
          </Pressable>

          <View style={styles.loginContainer}>
            <Text style={styles.loginText}>Đã có tài khoản?</Text>
            <Pressable onPress={handleNavigateToLogin} disabled={loading}>
              <Text style={styles.loginLink}>Đăng nhập</Text>
            </Pressable>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

export default SignupPage;
