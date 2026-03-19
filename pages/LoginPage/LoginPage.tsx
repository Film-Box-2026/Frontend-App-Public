import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { loginMock } from '@/services/api/hooks';
import { saveHistory, saveRatings, saveResumePoints, saveUser, saveWatchlist } from '@/services/storage/storageService';
import { useAppDispatch } from '@/store/hooks';
import { setError, setLoading, setUser } from '@/store/slices/Auth/authSlice';
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
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export const LoginPage: React.FC = () => {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];
  const dispatch = useAppDispatch();
  const router = useRouter();

  const [email, setEmail] = useState('phamdo@dev.com');
  const [password, setPassword] = useState('123456');
  const [loading, setLoadingState] = useState(false);
  const [error, setErrorState] = useState('');

  const handleLogin = async () => {
    if (!email || !password) {
      setErrorState('Vui lòng nhập email và mật khẩu');
      return;
    }

    setLoadingState(true);
    setErrorState('');
    dispatch(setLoading(true));

    try {
      const response = await loginMock({ email, password });

      await saveUser(response.user);
      await saveWatchlist([]);
      await saveHistory([]);
      await saveRatings([]);
      await saveResumePoints({});

      dispatch(setUser(response.user));
      dispatch(setWatchlist([]));
      dispatch(setHistory([]));
      dispatch(setRatings([]));
      dispatch(setResumePoints({}));
      dispatch(setLoading(false));

      router.replace('/(tabs)');
    } catch (err: any) {
      setErrorState(err.message || 'Đăng nhập thất bại');
      dispatch(setError(err.message || 'Đăng nhập thất bại'));
      dispatch(setLoading(false));
    } finally {
      setLoadingState(false);
    }
  };

  const handleNavigateToSignup = () => {
    router.push('/signup');
  };

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background,
    },
    content: {
      flex: 1,
      paddingHorizontal: 24,
      justifyContent: 'center',
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
    loginButton: {
      backgroundColor: colors.tint,
      borderRadius: 8,
      paddingVertical: 14,
      alignItems: 'center',
      marginTop: 24,
    },
    loginButtonText: {
      color: '#fff',
      fontSize: 16,
      fontWeight: '600',
    },
    signupContainer: {
      flexDirection: 'row',
      justifyContent: 'center',
      marginTop: 16,
    },
    signupText: {
      fontSize: 14,
      color: colors.tabIconDefault,
    },
    signupLink: {
      fontSize: 14,
      color: colors.tint,
      fontWeight: '600',
      marginLeft: 4,
    },
    demoInfo: {
      backgroundColor: 'rgba(255, 193, 7, 0.1)',
      borderRadius: 8,
      padding: 12,
      marginBottom: 24,
      borderLeftWidth: 4,
      borderLeftColor: '#FFC107',
    },
    demoInfoText: {
      fontSize: 12,
      color: colors.text,
      lineHeight: 18,
    },
    demoInfoTitle: {
      fontWeight: '600',
      marginBottom: 4,
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

        <View style={styles.content}>
          <Text style={styles.title}>Film BOX</Text>
          <Text style={styles.subtitle}>Đăng nhập để tiếp tục</Text>

          <View style={styles.demoInfo}>
            <Text style={[styles.demoInfoText, styles.demoInfoTitle]}>Demo Account:</Text>
            <Text style={styles.demoInfoText}>Email: phamdo@dev.com</Text>
            <Text style={styles.demoInfoText}>Password: 123456</Text>
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
              placeholder="Nhập mật khẩu"
              placeholderTextColor={colors.tabIconDefault}
              value={password}
              onChangeText={setPassword}
              editable={!loading}
              secureTextEntry
            />
          </View>

          {error ? <Text style={styles.errorText}>{error}</Text> : null}

          <Pressable
            style={styles.loginButton}
            onPress={handleLogin}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.loginButtonText}>Đăng Nhập</Text>
            )}
          </Pressable>

          <View style={styles.signupContainer}>
            <Text style={styles.signupText}>Chưa có tài khoản?</Text>
            <Pressable onPress={handleNavigateToSignup} disabled={loading}>
              <Text style={styles.signupLink}>Đăng ký ngay</Text>
            </Pressable>
          </View>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

export default LoginPage;
