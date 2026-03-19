import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import React from 'react';
import {
    Alert,
    Pressable,
    StyleSheet,
    Text,
    View,
} from 'react-native';

interface VIPUpgradePromptProps {
  movieTitle?: string;
  onUpgradePress?: () => void;
}

export const VIPUpgradePrompt: React.FC<VIPUpgradePromptProps> = ({
  movieTitle = 'Phim này',
  onUpgradePress,
}) => {
  const router = useRouter();
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];

  const handleUpgrade = () => {
    if (onUpgradePress) {
      onUpgradePress();
    } else {
      router.push('/subscription');
    }
  };

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={['#3B82F6', '#1E40AF']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.gradient}
      >
        <View style={styles.content}>
          <View style={styles.iconWrapper}>
            <Ionicons name="lock-closed" size={32} color="#FFF" />
          </View>

          <Text style={styles.title}>Nâng cấp để tiếp tục</Text>
          <Text style={styles.subtitle}>
            "{movieTitle}" chỉ có sẵn cho gói Cơ Bản.
          </Text>

          <View style={styles.benefitsContainer}>
            <View style={styles.benefitItem}>
              <Ionicons name="checkmark-circle" size={16} color="#10B981" />
              <Text style={styles.benefitText}>Xem tất cả phim</Text>
            </View>
            <View style={styles.benefitItem}>
              <Ionicons name="checkmark-circle" size={16} color="#10B981" />
              <Text style={styles.benefitText}>Không quảng cáo</Text>
            </View>
            <View style={styles.benefitItem}>
              <Ionicons name="checkmark-circle" size={16} color="#10B981" />
              <Text style={styles.benefitText}>Xem Full HD</Text>
            </View>
          </View>

          <Pressable style={styles.upgradeButton} onPress={handleUpgrade}>
            <Text style={styles.upgradeButtonText}>Nâng cấp ngay</Text>
          </Pressable>
        </View>
      </LinearGradient>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 16,
    marginBottom: 16,
  },
  gradient: {
    borderRadius: 16,
    padding: 20,
    overflow: 'hidden',
  },
  content: {
    alignItems: 'center',
  },
  iconWrapper: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
    color: '#FFF',
    marginBottom: 6,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 13,
    color: 'rgba(255,255,255,0.9)',
    marginBottom: 16,
    textAlign: 'center',
  },
  benefitsContainer: {
    width: '100%',
    gap: 8,
    marginBottom: 16,
  },
  benefitItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  benefitText: {
    fontSize: 13,
    color: 'rgba(255,255,255,0.9)',
    fontWeight: '500',
  },
  upgradeButton: {
    width: '100%',
    height: 44,
    backgroundColor: '#FFF',
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  upgradeButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#3B82F6',
  },
});

/**
 * Show alert khi người dùng cố xem phim vượt giới hạn Free
 */
export const showMovieLimitAlert = (onUpgrade?: () => void) => {
  Alert.alert(
    'Giới hạn xem phim',
    'Bạn đã xem hết số lượng phim miễn phí cho phép. Nâng cấp để xem thêm!',
    [
      {
        text: 'Hủy',
        onPress: () => {},
        style: 'cancel',
      },
      {
        text: 'Nâng cấp',
        onPress: onUpgrade,
        style: 'default',
      },
    ]
  );
};
