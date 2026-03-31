import { Header } from '@/components/layout';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { updateUserInfo } from '@/store/slices/Auth/authSlice';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    Image,
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

export const EditAccountPage: React.FC = () => {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'dark'];
  const router = useRouter();
  const dispatch = useAppDispatch();

  const user = useAppSelector((state) => state.auth.user);

  const [editedName, setEditedName] = useState(user?.name || '');
  const [editedEmail, setEditedEmail] = useState(user?.email || '');
  const [editedAvatar, setEditedAvatar] = useState(user?.avatar || '');
  const [isSaving, setIsSaving] = useState(false);

  const handlePickImage = async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ['images'],
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      });

      if (!result.canceled) {
        setEditedAvatar(result.assets[0].uri);
      }
    } catch (error) {
      Alert.alert('Lỗi', 'Không thể chọn ảnh');
    }
  };

  const handleTakePhoto = async () => {
    try {
      const permission = await ImagePicker.requestCameraPermissionsAsync();
      if (permission.granted === false) {
        Alert.alert('Lỗi', 'Ứng dụng cần quyền truy cập camera');
        return;
      }

      const result = await ImagePicker.launchCameraAsync({
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      });

      if (!result.canceled) {
        setEditedAvatar(result.assets[0].uri);
      }
    } catch (error) {
      Alert.alert('Lỗi', 'Không thể chụp ảnh');
    }
  };

  const handleSaveChanges = async () => {
    if (!editedName.trim()) {
      Alert.alert('Lỗi', 'Tên không được bỏ trống');
      return;
    }

    if (!editedEmail.trim()) {
      Alert.alert('Lỗi', 'Email không được bỏ trống');
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(editedEmail)) {
      Alert.alert('Lỗi', 'Email không hợp lệ');
      return;
    }

    setIsSaving(true);
    try {
      dispatch(
        updateUserInfo({
          name: editedName.trim(),
          email: editedEmail.trim(),
          avatar: editedAvatar,
        })
      );

      Alert.alert('Thành công', 'Thông tin tài khoản đã được cập nhật');
      router.back();
    } catch (error) {
      Alert.alert('Lỗi', 'Không thể cập nhật thông tin tài khoản');
    } finally {
      setIsSaving(false);
    }
  };

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background,
    },
    scrollContent: {
      paddingHorizontal: 16,
      paddingVertical: 20,
      gap: 24,
      paddingBottom: 40,
    },
    avatarSection: {
      alignItems: 'center',
      gap: 16,
    },
    avatarContainer: {
      width: 120,
      height: 120,
      borderRadius: 60,
      borderWidth: 3,
      borderColor: colors.tint,
      overflow: 'hidden',
      backgroundColor: 'rgba(255,255,255,0.1)',
      justifyContent: 'center',
      alignItems: 'center',
    },
    avatar: {
      width: '100%',
      height: '100%',
    },
    avatarPlaceholder: {
      width: '100%',
      height: '100%',
      justifyContent: 'center',
      alignItems: 'center',
      backgroundColor: 'rgba(255,255,255,0.05)',
    },
    avatarButtonGroup: {
      flexDirection: 'row',
      gap: 10,
    },
    avatarButton: {
      flex: 1,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 8,
      paddingVertical: 10,
      paddingHorizontal: 12,
      borderRadius: 10,
      backgroundColor: 'rgba(74, 144, 226, 0.15)',
      borderWidth: 1,
      borderColor: colors.tint,
    },
    avatarButtonText: {
      fontSize: 12,
      fontWeight: '600',
      color: colors.tint,
    },
    formSection: {
      gap: 16,
    },
    formGroup: {
      gap: 8,
    },
    formLabel: {
      fontSize: 12,
      fontWeight: '600',
      color: colors.tabIconDefault,
      textTransform: 'uppercase',
      letterSpacing: 0.5,
    },
    formInput: {
      backgroundColor:
        colorScheme === 'dark'
          ? 'rgba(255,255,255,0.08)'
          : 'rgba(0,0,0,0.06)',
      borderRadius: 10,
      paddingHorizontal: 14,
      paddingVertical: 12,
      color: colors.text,
      fontSize: 14,
      borderWidth: 1,
      borderColor: 'rgba(255,255,255,0.1)',
    },
    buttonGroup: {
      flexDirection: 'row',
      gap: 10,
      marginTop: 12,
    },
    cancelButton: {
      flex: 1,
      paddingVertical: 14,
      borderRadius: 10,
      alignItems: 'center',
      backgroundColor:
        colorScheme === 'dark'
          ? 'rgba(255,255,255,0.1)'
          : 'rgba(0,0,0,0.1)',
    },
    cancelButtonText: {
      fontSize: 14,
      fontWeight: '600',
      color: colors.text,
    },
    saveButton: {
      flex: 1,
      paddingVertical: 14,
      borderRadius: 10,
      alignItems: 'center',
      backgroundColor: colors.tint,
    },
    saveButtonText: {
      fontSize: 14,
      fontWeight: '600',
      color: '#fff',
    },
  });

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom', 'left', 'right']}>
      <Header
        title="Chỉnh sửa tài khoản"
        onSearchPress={() => router.push('/search')}
      />

      <KeyboardAvoidingView
        style={styles.container}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 12 : 0}
      >
        <ScrollView
          style={styles.container}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
        <View style={styles.avatarSection}>
          <View style={styles.avatarContainer}>
            {editedAvatar ? (
              <Image source={{ uri: editedAvatar }} style={styles.avatar} />
            ) : (
              <View style={styles.avatarPlaceholder}>
                <Ionicons name="person" size={50} color="rgba(255,255,255,0.5)" />
              </View>
            )}
          </View>

          <View style={styles.avatarButtonGroup}>
            <Pressable style={styles.avatarButton} onPress={handlePickImage}>
              <Ionicons name="image" size={16} color={colors.tint} />
              <Text style={styles.avatarButtonText}>Thư viện</Text>
            </Pressable>
            <Pressable style={styles.avatarButton} onPress={handleTakePhoto}>
              <Ionicons name="camera" size={16} color={colors.tint} />
              <Text style={styles.avatarButtonText}>Chụp ảnh</Text>
            </Pressable>
          </View>
        </View>

        <View style={styles.formSection}>
          <View style={styles.formGroup}>
            <Text style={styles.formLabel}>Tên</Text>
            <TextInput
              style={styles.formInput}
              placeholder="Nhập tên của bạn"
              placeholderTextColor={colors.tabIconDefault}
              value={editedName}
              onChangeText={setEditedName}
              maxLength={50}
            />
          </View>

          <View style={styles.formGroup}>
            <Text style={styles.formLabel}>Email</Text>
            <TextInput
              style={styles.formInput}
              placeholder="Nhập email của bạn"
              placeholderTextColor={colors.tabIconDefault}
              value={editedEmail}
              onChangeText={setEditedEmail}
              keyboardType="email-address"
              maxLength={100}
            />
          </View>
        </View>

        <View style={styles.buttonGroup}>
          <Pressable
            style={styles.cancelButton}
            onPress={() => router.back()}
            disabled={isSaving}
          >
            <Text style={styles.cancelButtonText}>Hủy</Text>
          </Pressable>
          <Pressable
            style={[styles.saveButton, isSaving && { opacity: 0.6 }]}
            onPress={handleSaveChanges}
            disabled={isSaving}
          >
            {isSaving ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.saveButtonText}>Lưu thay đổi</Text>
            )}
          </Pressable>
        </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

export default EditAccountPage;
