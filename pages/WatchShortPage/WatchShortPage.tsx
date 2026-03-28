import { useAppSelector } from '@/store/hooks';
import { Ionicons } from '@expo/vector-icons';
import { useIsFocused } from '@react-navigation/native';
import { ResizeMode, Video } from 'expo-av';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import React, { useCallback, useRef, useState } from 'react';
import {
    Dimensions,
    FlatList,
    KeyboardAvoidingView,
    Modal,
    Platform,
    Pressable,
    Text,
    TextInput,
    View,
} from 'react-native';
import { styles } from './styles';

interface VideoShort {
  id: string;
  title: string;
  description: string;
  tags: string;
  videoUrl: any;
  duration: number;
  views: number;
  likes: number;
  comments: number;
  adds: number;
}

// Mock data from Videoshortmock folder
const MOCK_VIDEOS: VideoShort[] = [
  {
    id: '1',
    title: 'SPIDER-MAN: NO WAY HOME',
    description: "Peter Parker's secret identity is revealed to the entire world. Desperate for help, he turns to Doctor Strange... more | See translation",
    tags: '#Spiderman #Marvel #Avenger',
    videoUrl: require('@/Videoshortmock/xiwjnwo79_7178068360066878746.mp4'),
    duration: 30,
    views: 35200,
    likes: 403300,
    comments: 880,
    adds: 8708,
  },
  {
    id: '2',
    title: 'THE AVENGERS',
    description: "Earth's mightiest heroes must come together and learn to fight as a team...",
    tags: '#Marvel #Avenger #Action',
    videoUrl: require('@/Videoshortmock/xiwjnwo79_7244349174706162950.mp4'),
    duration: 35,
    views: 22000,
    likes: 215000,
    comments: 1120,
    adds: 1530,
  },
  {
    id: '3',
    title: 'IRON MAN',
    description: "After being held captive in an Afghan cave, billionaire engineer Tony Stark...",
    tags: '#IronMan #TonyStark #Marvel',
    videoUrl: require('@/Videoshortmock/xiwjnwo79_7246050226891541766.mp4'),
    duration: 28,
    views: 18500,
    likes: 189000,
    comments: 950,
    adds: 1200,
  },
  {
    id: '4',
    title: 'THOR: RAGNAROK',
    description: "Imprisoned on the planet Sakaar, Thor must race against time to return to Asgard...",
    tags: '#Thor #Marvel #Asgard',
    videoUrl: require('@/Videoshortmock/xiwjnwo79_7262755160521215233.mp4'),
    duration: 32,
    views: 25000,
    likes: 250000,
    comments: 1400,
    adds: 3400,
  },
  {
    id: '5',
    title: 'BLACK PANTHER',
    description: "T'Challa, heir to the hidden but advanced kingdom of Wakanda, must step forward...",
    tags: '#WakandaForever #Marvel',
    videoUrl: require('@/Videoshortmock/xiwjnwo79_7303922845782969608.mp4'),
    duration: 30,
    views: 19000,
    likes: 198000,
    comments: 1050,
    adds: 2100,
  },
  {
    id: '6',
    title: 'DOCTOR STRANGE',
    description: "While on a journey of physical and spiritual healing, a brilliant neurosurgeon...",
    tags: '#DoctorStrange #Magic',
    videoUrl: require('@/Videoshortmock/xiwjnwo79_7309100803317419272.mp4'),
    duration: 33,
    views: 21000,
    likes: 175000,
    comments: 1150,
    adds: 1800,
  },
  {
    id: '7',
    title: 'GUARDIANS OF THE GALAXY',
    description: "A group of intergalactic criminals must pull together to stop a fanatical warrior...",
    tags: '#StarLord #Groot #Marvel',
    videoUrl: require('@/Videoshortmock/xiwjnwo79_7323206539869785352.mp4'),
    duration: 29,
    views: 16500,
    likes: 135000,
    comments: 900,
    adds: 1150,
  },
  {
    id: '8',
    title: 'ANT-MAN',
    description: "Armed with a super-suit with the astonishing ability to shrink in scale but...",
    tags: '#AntMan #Marvel',
    videoUrl: require('@/Videoshortmock/xiwjnwo79_7328258648055057672.mp4'),
    duration: 31,
    views: 23000,
    likes: 190000,
    comments: 1250,
    adds: 2200,
  },
  {
    id: '9',
    title: 'CAPTAIN AMERICA',
    description: "Steve Rogers, a rejected military soldier, transforms into Captain America...",
    tags: '#CaptainAmerica #Marvel',
    videoUrl: require('@/Videoshortmock/xiwjnwo79_7350928518663916808.mp4'),
    duration: 34,
    views: 20500,
    likes: 170000,
    comments: 1100,
    adds: 1600,
  },
];

export const WatchShortPage: React.FC = () => {
  const router = useRouter();
  const isFocused = useIsFocused();
  const user = useAppSelector((state) => state.auth.user);
  const [currentIndex, setCurrentIndex] = useState(0);
  const { width, height } = Dimensions.get('window');
  
  // States for interactive features
  const [likedVideoIds, setLikedVideoIds] = useState<Set<string>>(new Set());
  const [activeCommentVideoId, setActiveCommentVideoId] = useState<string | null>(null);
  const [commentText, setCommentText] = useState('');
  
  // States for video control and mock comments
  const [isPaused, setIsPaused] = useState(false);
  const [localComments, setLocalComments] = useState<Record<string, { id: string; text: string; userName: string; time: string }[]>>({});
  
  const lastTapTimeRef = useRef<number>(0);

  // Khởi tạo chiều cao mặc định nhưng sẽ đo đạc chính xác bằng onLayout
  // để tránh bị lệch (hở) video phía dưới bottom tab
  const [containerHeight, setContainerHeight] = useState(height);
  
  // State quản lý danh sách video hiển thị để có thể cuộn vô hạn
  const [displayVideos, setDisplayVideos] = useState<VideoShort[]>(MOCK_VIDEOS);

  const handleLayout = useCallback((event: any) => {
    setContainerHeight(event.nativeEvent.layout.height);
  }, []);

  const handleViewableItemsChanged = useCallback(
    ({ viewableItems }: { viewableItems: any[] }) => {
      if (viewableItems.length > 0) {
        setCurrentIndex(viewableItems[0].index);
        setIsPaused(false); // Play auto on scroll
      }
    },
    []
  );

  const handleLoadMore = () => {
    // Khi cuộn gần hết, copy lại MOCK_VIDEOS và thêm id rác để list tái tạo phần tử mượt mà
    setDisplayVideos(prev => [
      ...prev,
      ...MOCK_VIDEOS.map(video => ({
        ...video,
        id: `${video.id}-${Date.now()}-${Math.random().toString(36).substring(7)}`,
        // Ta giữ nguyên ID gốc trong một field khác nếu cần, nhưng hiện tại id này 
        // chỉ dùng cho việc thả tim và comment. Nếu muốn đồng bộ tym/cmt cho cùng 1 
        // video bị lặp, ta lấy id gốc.
        originalId: video.id,
      }))
    ] as any);
  };

  const handleVideoTap = (id: string, originalId?: string) => {
    const now = Date.now();
    const DOUBLE_PRESS_DELAY = 300;
    const targetId = originalId || id;

    if (now - lastTapTimeRef.current < DOUBLE_PRESS_DELAY) {
      // Double tap -> thả tim
      setLikedVideoIds((prev) => {
        const newSet = new Set(prev);
        newSet.add(targetId); // đảm bảo là tym không bị mất (như tiktok là thả tim thả luôn k toggle)
        return newSet;
      });
      // Double tap không làm đổi play/pause
      setIsPaused(false);
    } else {
      // Single tap -> toggle play/pause
      setIsPaused(!isPaused);
    }
    
    lastTapTimeRef.current = now;
  };

  const handleToggleLike = (id: string, originalId?: string) => {
    const targetVideoId = originalId || id;
    setLikedVideoIds((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(targetVideoId)) {
        newSet.delete(targetVideoId);
      } else {
        newSet.add(targetVideoId);
      }
      return newSet;
    });
  };

  const handleWatchNow = () => {
    // Navigate to detail page. Video will auto-pause due to isFocused state
    router.push({
      pathname: '/detail',
      params: { slug: 'hell-mode-game-thu-xuat-chung-tung-hoanh-chon-di-gioi-hon-nguyen' }
    });
  };

  const handleSendComment = () => {
    if (commentText.trim() && activeCommentVideoId && user?.name) {
      const newComment = {
        id: Date.now().toString(),
        text: commentText.trim(),
        userName: user.name,
        time: "Vừa xong"
      };
      
      setLocalComments((prev) => ({
        ...prev,
        [activeCommentVideoId]: [newComment, ...(prev[activeCommentVideoId] || [])]
      }));
      setCommentText('');
    }
  };

  const formatNumber = (num: number): string => {
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
    if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
    return num.toString();
  };

  const renderVideoItem = ({ item, index }: { item: VideoShort & { originalId?: string }; index: number }) => {
    const isPlaying = currentIndex === index;
    
    // Sử dụng originalId (nếu là video được lặp) hoặc id gốc để đồng bộ nút thả tim/bình luận
    const targetVideoId = item.originalId || item.id;
    
    const isLiked = likedVideoIds.has(targetVideoId);
    const displayLikes = item.likes + (isLiked ? 1 : 0);
    const itemComments = localComments[targetVideoId] || [];
    const displayCommentsCount = item.comments + itemComments.length;

    // Check if video should physically play (index matches, is focused, and not paused)
    const shouldVideoPlay = isPlaying && isFocused && !isPaused;

    return (
      <Pressable 
        style={[styles.videoContainer, { height: containerHeight, width }]}
        onPress={() => handleVideoTap(item.id, item.originalId)}
      >
        <Video
          source={item.videoUrl}
          style={styles.video}
          resizeMode={ResizeMode.COVER}
          shouldPlay={shouldVideoPlay}
          isLooping
          isMuted={!isFocused}
        />

        {/* Gradient Overlay from bottom to highlight bottom content */}
        <LinearGradient
          colors={['transparent', 'rgba(0, 0, 0, 0.8)']}
          start={{ x: 0, y: 0.4 }}
          end={{ x: 0, y: 1 }}
          style={styles.gradientOverlay}
          pointerEvents="none"
        />

        {/* Overlay content */}
        <View style={styles.overlay} pointerEvents="box-none">
          {/* Top Navbar */}
          <View style={styles.topHeader} pointerEvents="box-none">
            <View style={styles.topNavGroup} pointerEvents="box-none">
              <Text style={styles.topNavText}>Explore</Text>
              <View>
                <Text style={styles.topNavTextActive}>For you</Text>
                <View style={styles.activeIndicator} />
              </View>
            </View>
            <Pressable style={styles.searchButton}>
              <Ionicons name="search" size={20} color="#FFFFFF" />
            </Pressable>
          </View>

          {/* Bottom Info and Actions */}
          <View style={styles.bottomSection} pointerEvents="box-none">
            {/* Left Info Section */}
            <View style={styles.infoSection} pointerEvents="none">
              <Text style={styles.movieTitle}>{item.title}</Text>
              <Text style={styles.descriptionText} numberOfLines={3}>
                {item.description}
              </Text>
              <Text style={styles.tagsText}>{item.tags}</Text>
            </View>

            {/* Right Action Buttons */}
            <View style={styles.actionButtons} pointerEvents="box-none">
              <Pressable style={styles.actionButton} onPress={() => handleToggleLike(item.id, item.originalId)}>
                <Ionicons name={isLiked ? "heart" : "heart-outline"} size={36} color={isLiked ? "#FF2D55" : "#FFFFFF"} />
                <Text style={styles.actionLabel}>{formatNumber(displayLikes)}</Text>
              </Pressable>
              
              <Pressable style={styles.actionButton} onPress={() => setActiveCommentVideoId(targetVideoId)}>
                <Ionicons name="chatbubble" size={36} color="#FFFFFF" />
                <Text style={styles.actionLabel}>{formatNumber(displayCommentsCount)}</Text>
              </Pressable>

              <Pressable style={styles.actionButton}>
                <Ionicons name="add-circle-outline" size={36} color="#FFFFFF" />
                <Text style={styles.actionLabel}>{formatNumber(item.adds)}</Text>
              </Pressable>
              
              <Pressable style={styles.actionButton}>
                <Ionicons name="arrow-redo" size={36} color="#FFFFFF" />
                <Text style={styles.actionLabel}>{formatNumber(item.views)}</Text>
              </Pressable>
            </View>
          </View>

          {/* Watch Now Button */}
          <View style={styles.watchNowContainer} pointerEvents="box-none">
            <Pressable style={styles.watchNowButton} onPress={handleWatchNow}>
              <Text style={styles.watchNowText}>Watch Now</Text>
            </Pressable>
          </View>
        </View>
      </Pressable>
    );
  };

  return (
    <View style={styles.container} onLayout={handleLayout}>
      <FlatList
        data={displayVideos}
        renderItem={renderVideoItem}
        keyExtractor={(item) => item.id}
        pagingEnabled
        showsVerticalScrollIndicator={false}
        scrollEventThrottle={16}
        viewabilityConfig={{
          itemVisiblePercentThreshold: 50,
        }}
        onViewableItemsChanged={handleViewableItemsChanged}
        onEndReached={handleLoadMore}
        onEndReachedThreshold={0.5}
      />

      {/* Comment Modal */}
      <Modal
        visible={!!activeCommentVideoId}
        transparent
        animationType="slide"
        onRequestClose={() => setActiveCommentVideoId(null)}
      >
        <KeyboardAvoidingView 
          style={styles.commentModalContainer}
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        >
          <Pressable style={styles.commentModalOverlay} onPress={() => setActiveCommentVideoId(null)} />
          <View style={styles.commentModalContent}>
             <View style={styles.commentModalHeader}>
                <Text style={styles.commentModalTitle}>Bình luận</Text>
                <Pressable onPress={() => setActiveCommentVideoId(null)}>
                  <Ionicons name="close" size={24} color="#FFFFFF" />
                </Pressable>
             </View>
             
             {activeCommentVideoId && localComments[activeCommentVideoId]?.length > 0 ? (
               <FlatList
                 data={localComments[activeCommentVideoId]}
                 keyExtractor={(item) => item.id}
                 renderItem={({item}) => (
                   <View style={{ padding: 16, borderBottomWidth: 1, borderBottomColor: 'rgba(255,255,255,0.05)' }}>
                     <Text style={{ color: '#999', fontSize: 13, marginBottom: 4 }}>
                       {item.userName} • {item.time}
                     </Text>
                     <Text style={{ color: '#FFF', fontSize: 15 }}>{item.text}</Text>
                   </View>
                 )}
               />
             ) : (
               <View style={styles.commentListDummy}>
                  <Text style={styles.commentDummyText}>Chưa có bình luận nào. Hãy là người đầu tiên!</Text>
               </View>
             )}
             
             <View style={styles.commentInputRow}>
                <TextInput
                  style={styles.commentInput}
                  placeholder="Thêm bình luận..."
                  placeholderTextColor="#888"
                  value={commentText}
                  onChangeText={setCommentText}
                  maxLength={100}
                />
                <Pressable style={styles.commentSubmitBtn} onPress={handleSendComment}>
                  <Ionicons name="send" size={20} color={commentText.trim() ? "#E53935" : "#555"} />
                </Pressable>
             </View>
          </View>
        </KeyboardAvoidingView>
      </Modal>
    </View>
  );
};
