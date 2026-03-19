import { Colors } from '@/constants/theme';
import { StyleSheet } from 'react-native';

type ThemeColors = (typeof Colors)['light'];

export const createDetailMovieStyles = (colors: ThemeColors) =>
  StyleSheet.create({
    safeContainer: {
      flex: 1,
      backgroundColor: colors.background,
    },
    container: {
      flex: 1,
      backgroundColor: colors.background,
    },
    headerBackdrop: {
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      height: 60,
      backgroundColor: 'transparent',
      zIndex: 10,
      justifyContent: 'center',
      paddingHorizontal: 16,
    },
    headerContent: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
    },
    backButton: {
      width: 40,
      height: 40,
      borderRadius: 20,
      backgroundColor: 'rgba(255, 255, 255, 0.1)',
      justifyContent: 'center',
      alignItems: 'center',
    },
    headerTitle: {
      flex: 1,
      marginLeft: 12,
      color: colors.text,
      fontSize: 16,
      fontWeight: '600',
    },
    shareButton: {
      width: 40,
      height: 40,
      borderRadius: 20,
      backgroundColor: 'rgba(255, 255, 255, 0.1)',
      justifyContent: 'center',
      alignItems: 'center',
    },
    scrollContent: {
      paddingTop: 0,
    },
    posterSection: {
      height: 350,
      backgroundColor: colors.background,
      overflow: 'hidden',
    },
    posterImage: {
      width: '100%',
      height: '100%',
    },
    infoSection: {
      paddingHorizontal: 16,
      paddingVertical: 20,
      gap: 16,
    },
    titleGroup: {
      gap: 4,
    },
    mainTitle: {
      fontSize: 24,
      fontWeight: '700',
      color: colors.text,
    },
    originTitle: {
      fontSize: 14,
      color: colors.tabIconDefault,
    },
    metaInfo: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 12,
      flexWrap: 'wrap',
    },
    metaItem: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: 'rgba(255, 255, 255, 0.1)',
      paddingHorizontal: 12,
      paddingVertical: 6,
      borderRadius: 16,
      gap: 4,
    },
    metaText: {
      fontSize: 12,
      color: colors.text,
      fontWeight: '600',
    },
    ratingSection: {
      flexDirection: 'row',
      gap: 12,
    },
    ratingCard: {
      flex: 1,
      backgroundColor: 'rgba(255, 255, 255, 0.05)',
      borderRadius: 12,
      padding: 12,
      alignItems: 'center',
      gap: 4,
    },
    ratingSource: {
      fontSize: 12,
      color: colors.tabIconDefault,
    },
    ratingValue: {
      fontSize: 20,
      fontWeight: '700',
      color: '#FFD700',
    },
    actionButtons: {
      flexDirection: 'row',
      gap: 12,
      backgroundColor: 'rgba(255, 255, 255, 0.05)',
      padding: 16,
      borderRadius: 12,
    },
    actionButton: {
      flex: 1,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: '#4A90E2',
      paddingVertical: 12,
      borderRadius: 8,
      gap: 8,
    },
    actionButtonSecondary: {
      flex: 1,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: 'rgba(255, 255, 255, 0.1)',
      paddingVertical: 12,
      borderRadius: 8,
      gap: 8,
    },
    buttonText: {
      fontSize: 14,
      fontWeight: '600',
      color: colors.text,
    },
    descriptionSection: {
      paddingHorizontal: 16,
      paddingVertical: 16,
      gap: 8,
    },
    sectionTitle: {
      fontSize: 16,
      fontWeight: '700',
      color: colors.text,
    },
    sectionHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 8,
    },
    descriptionText: {
      fontSize: 14,
      color: colors.tabIconDefault,
      lineHeight: 20,
    },
    seasonsSection: {
      paddingHorizontal: 16,
      paddingVertical: 16,
      gap: 12,
    },
    seasonTabs: {
      flexDirection: 'row',
      gap: 8,
      marginBottom: 12,
    },
    seasonTab: {
      paddingHorizontal: 16,
      paddingVertical: 8,
      borderRadius: 20,
      backgroundColor: 'rgba(255, 255, 255, 0.1)',
    },
    seasonTabActive: {
      backgroundColor: '#4A90E2',
    },
    seasonTabText: {
      fontSize: 12,
      fontWeight: '600',
      color: colors.tabIconDefault,
    },
    seasonTabTextActive: {
      color: '#fff',
    },
    episodeList: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: 8,
    },
    episodeItem: {
      backgroundColor: 'rgba(255, 255, 255, 0.05)',
      borderRadius: 8,
      width: 56,
      height: 56,
      alignItems: 'center',
      justifyContent: 'center',
    },
    episodeItemActive: {
      backgroundColor: '#4A90E2',
    },
    episodeNumber: {
      fontSize: 12,
      fontWeight: '700',
      color: '#4A90E2',
    },
    episodeNumberActive: {
      color: '#fff',
    },
    episodeName: {
      display: 'none',
    },
    playIcon: {
      display: 'none',
    },
    relatedMoviesSection: {
      paddingHorizontal: 16,
      paddingVertical: 16,
      gap: 12,
      paddingBottom: 40,
    },
    relatedMoviesGrid: {
      flexDirection: 'row',
      gap: 12,
      flexWrap: 'wrap',
      justifyContent: 'space-between',
    },
    relatedMovieName: {
      fontSize: 11,
      color: colors.text,
      fontWeight: '600',
      lineHeight: 14,
    },
    commentSection: {
      paddingHorizontal: 16,
      paddingBottom: 20,
      gap: 12,
    },
    commentInputWrapper: {
      borderRadius: 12,
      backgroundColor: 'rgba(255, 255, 255, 0.06)',
      borderWidth: 1,
      borderColor: 'rgba(255, 255, 255, 0.12)',
      padding: 12,
      gap: 10,
    },
    commentInput: {
      minHeight: 44,
      maxHeight: 120,
      color: colors.text,
      fontSize: 14,
      textAlignVertical: 'top',
    },
    commentHint: {
      fontSize: 12,
      color: colors.tabIconDefault,
      flex: 1,
    },
    submitCommentButton: {
      alignSelf: 'flex-end',
      backgroundColor: '#4A90E2',
      paddingHorizontal: 14,
      paddingVertical: 8,
      borderRadius: 8,
    },
    submitCommentText: {
      color: '#fff',
      fontSize: 13,
      fontWeight: '600',
    },
    commentsList: {
      gap: 10,
    },
    commentItem: {
      borderRadius: 10,
      padding: 12,
      backgroundColor: 'rgba(255, 255, 255, 0.04)',
      borderWidth: 1,
      borderColor: 'rgba(255, 255, 255, 0.1)',
      gap: 6,
    },
    commentHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      gap: 12,
    },
    commentMeta: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 8,
    },
    deleteCommentButton: {
      paddingVertical: 2,
      paddingHorizontal: 6,
      borderRadius: 6,
      backgroundColor: 'rgba(255, 107, 107, 0.16)',
    },
    deleteCommentText: {
      color: '#FF6B6B',
      fontSize: 11,
      fontWeight: '700',
    },
    commentUserName: {
      color: colors.text,
      fontSize: 13,
      fontWeight: '700',
      flex: 1,
    },
    commentTime: {
      color: colors.tabIconDefault,
      fontSize: 11,
    },
    commentContent: {
      color: colors.text,
      fontSize: 13,
      lineHeight: 18,
    },
  });
