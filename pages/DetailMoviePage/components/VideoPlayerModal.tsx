import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { Modal, Pressable, StyleSheet, Text, View } from 'react-native';
import {
    SafeAreaView,
    useSafeAreaInsets,
} from 'react-native-safe-area-context';
import WebView from 'react-native-webview';

interface Episode {
  name: string;
  slug: string;
  filename: string;
  link_embed: string;
  link_m3u8: string;
}

interface VideoPlayerModalProps {
  visible: boolean;
  episode: Episode | null;
  onClose: () => void;
  onProgress?: (payload: { currentTime: number; duration: number }) => void;
}

export const VideoPlayerModal: React.FC<VideoPlayerModalProps> = ({
  visible,
  episode,
  onClose,
  onProgress,
}) => {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'dark'];
  const insets = useSafeAreaInsets();

  const styles = StyleSheet.create({
    modalContainer: {
      flex: 1,
      backgroundColor: '#000',
    },
    safeAreaView: {
      flex: 1,
      backgroundColor: '#000',
    },
    modalHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingHorizontal: 16,
      paddingVertical: 12,
      paddingTop: Math.max(insets.top, 12),
    },
    headerLeft: {
      flexDirection: 'row',
      alignItems: 'center',
      flex: 1,
    },
    closeButton: {
      width: 40,
      height: 40,
      alignItems: 'center',
      justifyContent: 'center',
    },
    modalTitle: {
      fontSize: 14,
      fontWeight: '600',
      color: colors.text,
      flex: 1,
      marginHorizontal: 12,
      marginRight: 40,
    },
    videoContainer: {
      flex: 1,
      backgroundColor: '#000',
      overflow: 'hidden',
      paddingBottom: Math.max(insets.bottom, 12),
    },
    webView: {
      flex: 1,
      backgroundColor: '#000',
      paddingBottom: Math.max(insets.bottom, 12),
    },
    loadingText: {
      flex: 1,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: '#000',
    },
    loadingTextContent: {
      color: colors.text,
      fontSize: 14,
    },
  });

  if (!episode) {
    return null;
  }

  const playbackUrl = episode.link_embed || episode.link_m3u8;

  if (!playbackUrl) {
    return null;
  }

  const injectedJavaScript = `
    (function() {
      function sendProgress() {
        try {
          var video = document.querySelector('video');
          if (!video) return;
          var payload = {
            type: 'progress',
            currentTime: Number(video.currentTime || 0),
            duration: Number(video.duration || 0)
          };
          window.ReactNativeWebView && window.ReactNativeWebView.postMessage(JSON.stringify(payload));
        } catch (e) {}
      }
      setInterval(sendProgress, 5000);
      document.addEventListener('timeupdate', sendProgress);
    })();
    true;
  `;

  const handleMessage = (event: any) => {
    if (!onProgress) return;
    try {
      const data = JSON.parse(event.nativeEvent.data);
      if (data?.type === 'progress') {
        onProgress({
          currentTime: Number(data.currentTime || 0),
          duration: Number(data.duration || 0),
        });
      }
    } catch {
      // Ignore non-JSON messages from embedded players
    }
  };

  return (
    <Modal
      visible={visible}
      transparent={false}
      animationType="slide"
      onRequestClose={onClose}
      presentationStyle="fullScreen"
    >
      <SafeAreaView
        style={styles.safeAreaView}
        edges={['top', 'right', 'left']}
      >
        <View style={styles.modalHeader}>
          <View style={styles.headerLeft}>
            <Pressable style={styles.closeButton} onPress={onClose}>
              <Ionicons name="chevron-down" size={24} color={colors.text} />
            </Pressable>
            <Text style={styles.modalTitle} numberOfLines={1}>
              {episode.name}
            </Text>
          </View>
        </View>

        <View style={styles.videoContainer}>
          <WebView
            source={{ uri: playbackUrl }}
            style={styles.webView}
            allowsFullscreenVideo={true}
            startInLoadingState={true}
            javaScriptEnabled={true}
            scalesPageToFit={true}
            mediaPlaybackRequiresUserAction={false}
            allowsInlineMediaPlayback={true}
            injectedJavaScript={injectedJavaScript}
            onMessage={handleMessage}
          />
        </View>
      </SafeAreaView>
    </Modal>
  );
};
